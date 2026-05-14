import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product, WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  isOpen: boolean
  userId: string | null

  // Actions
  addItem: (product: Product) => void
  removeItem: (productId: string) => void
  toggleItem: (product: Product) => void
  clearWishlist: () => void
  toggleWishlist: () => void
  openWishlist: () => void
  closeWishlist: () => void
  setUserId: (userId: string | null) => void

  // Computed
  getItemCount: () => number
  isInWishlist: (productId: string) => boolean
}

// Module-level userId tracker to avoid circular reference in storage adapter
let _bowpawWishlistUserId: string | null = null;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      userId: null,

      setUserId: (userId) => {
        const prev = get().userId
        if (prev !== userId) {
          _bowpawWishlistUserId = userId
          set({ userId, items: [] })
          if (userId && typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem(`bowpaw-wishlist-${userId}`)
              if (raw) {
                const parsed = JSON.parse(raw)
                set({ items: parsed.state?.items ?? [] })
              }
            } catch {}
          }
        }
      },

      addItem: (product) => {
        const { items } = get()
        const exists = items.some(item => item.product.id === product.id)
        if (!exists) {
          set({ items: [...items, { product, addedAt: new Date().toISOString() }] })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.product.id !== productId) })
      },

      toggleItem: (product) => {
        const { isInWishlist, addItem, removeItem } = get()
        if (isInWishlist(product.id)) {
          removeItem(product.id)
        } else {
          addItem(product)
        }
      },

      clearWishlist: () => set({ items: [] }),

      toggleWishlist: () => set(state => ({ isOpen: !state.isOpen })),
      openWishlist: () => set({ isOpen: true }),
      closeWishlist: () => set({ isOpen: false }),

      getItemCount: () => get().items.length,

      isInWishlist: (productId) => get().items.some(item => item.product.id === productId),
    }),
    {
      name: 'bowpaw-wishlist',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === 'undefined') return null
          const key = _bowpawWishlistUserId ? `${name}-${_bowpawWishlistUserId}` : name
          return localStorage.getItem(key)
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return
          const key = _bowpawWishlistUserId ? `${name}-${_bowpawWishlistUserId}` : name
          localStorage.setItem(key, value)
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return
          const key = _bowpawWishlistUserId ? `${name}-${_bowpawWishlistUserId}` : name
          localStorage.removeItem(key)
        },
      })),
      partialize: (state) => ({ items: state.items }),
    }
  )
)

