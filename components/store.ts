import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MOCK_PRODUCTS } from "@/lib/data";

export const useStore = create()(
  persist(
    (set, get) => ({
      products: MOCK_PRODUCTS,
      cart: [],

      addItem: (item: any) => set((state: any) => {
        const existing = state.cart.find((i: any) => i.id === item.id);
        if (existing) {
          return {
            cart: state.cart.map((i: any) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { cart: [...state.cart, { ...item, quantity: 1 }] };
      }),

      removeItem: (id: string) => set((state: any) => ({
        cart: state.cart.filter((i: any) => i.id !== id),
      })),

      totalPrice: () => {
        const { cart } = get() as any;
        return cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);
      },

      checkout: () => set((state: any) => {
        const updatedProducts = state.products.map((p: any) => {
          const cartItem = state.cart.find((item: any) => item.id === p.id);
          if (cartItem) {
            return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
          }
          return p;
        });
        return { products: updatedProducts, cart: [] };
      }),
    }),
    { name: 'equinox-storage' }
  )
);