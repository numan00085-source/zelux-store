import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (product, selectedVariant, quantity = 1) => {
        const cart = get().cart;
        const key = `${product.id}-${selectedVariant}`;
        const existing = cart.find(i => i.key === key);
        if (existing) {
          set({ cart: cart.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) });
        } else {
          set({ cart: [...cart, { ...product, selectedVariant, quantity, key }] });
        }
      },
      removeFromCart: (key) => set({ cart: get().cart.filter(i => i.key !== key) }),
      updateQty: (key, qty) => set({ cart: get().cart.map(i => i.key === key ? { ...i, quantity: qty } : i) }),
      clearCart: () => set({ cart: [] }),
      total: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'zelux-cart', storage: createJSONStorage(() => localStorage) }
  )
);

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      toggle: (product) => {
        const wl = get().wishlist;
        const exists = wl.find(i => i.id === product.id);
        set({ wishlist: exists ? wl.filter(i => i.id !== product.id) : [...wl, product] });
      },
      isWishlisted: (id) => get().wishlist.some(i => i.id === id),
    }),
    { name: 'zelux-wishlist', storage: createJSONStorage(() => localStorage) }
  )
);

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'zelux-auth', storage: createJSONStorage(() => localStorage) }
  )
);
