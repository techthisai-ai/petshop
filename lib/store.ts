import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  video?: string;
  description: string;
  careGuide?: string;
  specifications?: Record<string, string>;
  variants?: { name: string; options: string[] }[];
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  rating: number;
  reviews: number;
  tags?: string[];
  weightValue?: number;
  weightUnit?: 'g' | 'kg';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface WishlistItem {
  product: Product;
  addedAt: Date;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, quantity?: number, variants?: Record<string, string>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  userId: string | null;
  setUserId: (userId: string | null) => void;
}

interface UIStore {
  isLoading: boolean;
  isMobileMenuOpen: boolean;
  isFilterOpen: boolean;
  searchQuery: string;
  setLoading: (loading: boolean) => void;
  toggleMobileMenu: () => void;
  toggleFilter: () => void;
  setSearchQuery: (query: string) => void;
}

interface UserStore {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    addresses?: Address[];
  } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (product, quantity = 1, variants) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity, selectedVariants: variants }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      toggleCart: () => set({ isOpen: !get().isOpen }),
      setCartOpen: (isOpen) => set({ isOpen }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "aquapet-cart",
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStore>;

        return {
          ...currentState,
          items: persisted.items ?? currentState.items,
        };
      },
    }
  )
);

// Module-level userId tracker to avoid circular reference in storage adapter
let _aquapetWishlistUserId: string | null = null;

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      userId: null,
      setUserId: (userId) => {
        const prev = get().userId;
        if (prev !== userId) {
          _aquapetWishlistUserId = userId;
          set({ userId, items: [] });
          if (userId && typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem(`aquapet-wishlist-${userId}`);
              if (raw) {
                const parsed = JSON.parse(raw);
                set({ items: parsed.state?.items ?? [] });
              }
            } catch {}
          }
        }
      },
      addItem: (product) => {
        if (!get().isInWishlist(product.id)) {
          set({ items: [...get().items, { product, addedAt: new Date() }] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
      },
      isInWishlist: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "aquapet-wishlist",
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          if (typeof window === 'undefined') return null;
          const key = _aquapetWishlistUserId ? `${name}-${_aquapetWishlistUserId}` : name;
          return localStorage.getItem(key);
        },
        setItem: (name, value) => {
          if (typeof window === 'undefined') return;
          const key = _aquapetWishlistUserId ? `${name}-${_aquapetWishlistUserId}` : name;
          localStorage.setItem(key, value);
        },
        removeItem: (name) => {
          if (typeof window === 'undefined') return;
          const key = _aquapetWishlistUserId ? `${name}-${_aquapetWishlistUserId}` : name;
          localStorage.removeItem(key);
        },
      })),
      skipHydration: true,
      partialize: (state) => ({ items: state.items }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<WishlistStore>;
        return {
          ...currentState,
          items: persisted.items ?? currentState.items,
        };
      },
    }
  )
);

export const useUIStore = create<UIStore>((set, get) => ({
  isLoading: true,
  isMobileMenuOpen: false,
  isFilterOpen: false,
  searchQuery: "",
  setLoading: (loading) => set({ isLoading: loading }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  toggleFilter: () => set({ isFilterOpen: !get().isFilterOpen }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (email && password) {
          set({
            user: { id: "1", name: "User", email },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      register: async (name, email, password) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (name && email && password) {
          set({
            user: { id: "1", name, email },
            isAuthenticated: true,
          });
          return true;
        }
        return false;
      },
    }),
    {
      name: "aquapet-user",
      skipHydration: true,
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<UserStore>;

        return {
          ...currentState,
          user: persisted.user ?? currentState.user,
          isAuthenticated: persisted.isAuthenticated ?? currentState.isAuthenticated,
        };
      },
    }
  )
);

