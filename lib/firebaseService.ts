import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile as firebaseUpdateProfile,
  updatePassword,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User, Order, UserCart, UserAddress } from '@/store/useAuthStore'
import { ADMIN_EMAIL, ADMIN_PASSWORD, isAdminCredential, isAdminEmail } from './authConfig'

const timestampToISO = (value: unknown) =>
  value instanceof Timestamp ? value.toDate().toISOString() : typeof value === 'string' ? value : new Date().toISOString()

export const createSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

function createAdminProfile(uid: string, email?: string | null, name?: string | null): User {
  return {
    id: uid,
    name: name || 'Rainbow Aqua Owner',
    email: email || ADMIN_EMAIL,
    mobile: '',
    role: 'owner',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
}

function createCustomerProfile(uid: string, email?: string | null, name?: string | null): User {
  const fallbackName = email?.split('@')[0] || 'Customer'

  return {
    id: uid,
    name: name || fallbackName,
    email: email || '',
    mobile: '',
    role: 'user',
    status: 'active',
    createdAt: new Date().toISOString(),
  }
}

async function saveUserProfile(profile: User) {
  try {
    await setDoc(doc(db, 'users', profile.id), {
      ...profile,
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (err: any) {
    console.warn('User profile write skipped:', err?.code ?? err?.message ?? err)
  }
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function firebaseSignIn(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  let profile: User | null = null

  try {
    profile = await getUserProfile(cred.user.uid)
  } catch (err: any) {
    if (!isAdminEmail(cred.user.email)) {
      profile = createCustomerProfile(cred.user.uid, cred.user.email, cred.user.displayName)
    }
  }

  if (!profile && isAdminEmail(cred.user.email)) {
    profile = createAdminProfile(cred.user.uid, cred.user.email, cred.user.displayName)
    await saveUserProfile(profile)
  }

  if (!profile) {
    profile = createCustomerProfile(cred.user.uid, cred.user.email, cred.user.displayName)
    await saveUserProfile(profile)
  }

  if (profile && isAdminEmail(cred.user.email) && profile.role !== 'owner') {
    profile = {
      ...profile,
      email: cred.user.email || profile.email,
      role: 'owner',
      status: 'active',
    }

    await saveUserProfile(profile)
  }

  if (profile && !isAdminEmail(cred.user.email) && profile.role !== 'user') {
    profile = {
      ...profile,
      email: cred.user.email || profile.email,
      role: 'user',
      status: profile.status || 'active',
    }

    await saveUserProfile(profile)
  }

  return profile
}

export async function firebaseCreateAdminAccount(email: string, password: string) {
  if (!isAdminCredential(email, password)) {
    throw new Error('Invalid admin setup credentials.')
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD)
    await firebaseUpdateProfile(cred.user, { displayName: 'Rainbow Aqua Owner' })
    const profile = createAdminProfile(cred.user.uid, cred.user.email, 'Rainbow Aqua Owner')
    await saveUserProfile(profile)
    return profile
  } catch (err: any) {
    if (err?.code === 'auth/email-already-in-use') {
      return firebaseSignIn(ADMIN_EMAIL, ADMIN_PASSWORD)
    }
    throw err
  }
}

export async function firebaseRegister(
  email: string,
  password: string,
  name: string,
  mobile: string,
  district: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await firebaseUpdateProfile(cred.user, { displayName: name })

  const newUser: User = {
    id: cred.user.uid,
    name,
    email,
    mobile,
    role: 'user',
    status: 'active',
    address: {
      addressLine1: '',
      area: '',
      city: '',
      district,
      pincode: '',
      state: 'Tamil Nadu',
      country: 'India',
    },
    createdAt: new Date().toISOString(),
  }

  // Write to Firestore — non-blocking, won't fail registration if rules not deployed yet
  try {
    await setDoc(doc(db, 'users', cred.user.uid), {
      ...newUser,
      createdAt: serverTimestamp(),
    })
  } catch (firestoreErr: any) {
    console.warn('Firestore write failed (check rules):', firestoreErr?.code)
  }

  return newUser
}

export async function firebaseSignOut() {
  await signOut(auth)
}

// ── User Profile ──────────────────────────────────────────────────────

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    id: uid,
    createdAt: timestampToISO(data.createdAt),
  } as User
}

export async function updateUserProfile(uid: string, updates: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), updates)
}

export async function updateCurrentUserPassword(newPassword: string) {
  if (!auth.currentUser) {
    throw new Error('Please sign in again to update your password.')
  }

  await updatePassword(auth.currentUser, newPassword)
}

// ── Orders ────────────────────────────────────────────────────────────

export async function createOrderInDB(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
  // Strip undefined values — Firestore rejects them
  const clean = JSON.parse(JSON.stringify(order))

  const ref = await addDoc(collection(db, 'orders'), {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  // Decrement stock for each ordered product
  await Promise.allSettled(
    order.items.map(async (item) => {
      try {
        const productRef = doc(db, 'products', item.productId)
        const productSnap = await getDoc(productRef)
        if (productSnap.exists()) {
          const currentStock = Number(productSnap.data().stock ?? 0)
          const newStock = Math.max(0, currentStock - item.quantity)
          await updateDoc(productRef, {
            stock: newStock,
            inStock: newStock > 0,
            updatedAt: serverTimestamp(),
          })
        }
      } catch {}
    })
  )

  return ref.id
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const q = query(
    collection(db, 'orders'),
    where('userId', '==', userId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  })).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) as Order[]
}

export async function getAllOrdersFromDB(): Promise<Order[]> {
  const snap = await getDocs(collection(db, 'orders'))
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  })).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) as Order[]
}

export async function updateOrderStatusInDB(orderId: string, status: Order['status']) {
  await updateDoc(doc(db, 'orders', orderId), {
    status,
    updatedAt: serverTimestamp(),
  })
}

// ── Users (admin) ─────────────────────────────────────────────────────

export async function getAllUsersFromDB(): Promise<User[]> {
  const snap = await getDocs(collection(db, 'users'))
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: timestampToISO(d.data().createdAt),
  })) as User[]
}

// ── Carts ─────────────────────────────────────────────────────────────

export async function saveCartToDB(cart: UserCart) {
  await setDoc(doc(db, 'carts', cart.userId), {
    ...cart,
    updatedAt: serverTimestamp(),
  })
}

export async function getAllCartsFromDB(): Promise<UserCart[]> {
  const snap = await getDocs(collection(db, 'carts'))
  return snap.docs.map((d) => ({
    ...d.data(),
    userId: d.id,
    updatedAt: timestampToISO(d.data().updatedAt),
  })) as UserCart[]
}

// ── Products ──────────────────────────────────────────────────────────

export interface DBProduct {
  id: string
  name: string
  slug: string
  description: string
  category: string
  subcategory: string
  price: number
  originalPrice?: number
  stock: number
  sku?: string
  images: string[]
  isNew: boolean
  isFeatured: boolean
  variants: string[]
  inStock: boolean
  weightValue?: number
  weightUnit?: 'g' | 'kg'
  createdAt: string
  updatedAt: string
}

export async function addProductToDB(product: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>) {
  const ref = await addDoc(collection(db, 'products'), {
    ...product,
    slug: product.slug || createSlug(product.name),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function getProductFromDB(productId: string): Promise<DBProduct | null> {
  const snap = await getDoc(doc(db, 'products', productId))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    ...data,
    id: snap.id,
    createdAt: timestampToISO(data.createdAt),
    updatedAt: timestampToISO(data.updatedAt),
  } as DBProduct
}

export async function getAllProductsFromDB(): Promise<DBProduct[]> {
  const snap = await getDocs(collection(db, 'products'))
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    slug: d.data().slug ?? createSlug(d.data().name ?? d.id),
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  })).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) as DBProduct[]
}

export async function deleteProductFromDB(productId: string) {
  const { deleteDoc } = await import('firebase/firestore')
  await deleteDoc(doc(db, 'products', productId))
}

export async function updateProductInDB(productId: string, updates: Partial<DBProduct>) {
  await updateDoc(doc(db, 'products', productId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function saveReview(review: {
  userId: string
  userName: string
  orderId: string
  productId: string
  productName: string
  rating: number
  text: string
}) {
  const ref = await addDoc(collection(db, 'reviews'), {
    ...review,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export interface DBReview {
  id: string
  userId: string
  userName: string
  orderId: string
  productId: string
  productName: string
  rating: number
  text: string
  createdAt: string
}

export async function getProductReviews(productId: string): Promise<DBReview[]> {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: timestampToISO(d.data().createdAt),
  })).sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ) as DBReview[]
}

// ── Storage: upload image ─────────────────────────────────────────────
// Converts image to base64 data URL and stores directly in Firestore
// This completely bypasses Firebase Storage and avoids all CORS issues
export async function uploadProductImage(file: File, _productName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Resize image before storing to keep Firestore document size small
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 600
        let w = img.width
        let h = img.height
        if (w > h && w > MAX) { h = Math.round((h * MAX) / w); w = MAX }
        else if (h > MAX) { w = Math.round((w * MAX) / h); h = MAX }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
