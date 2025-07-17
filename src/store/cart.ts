import { defineStore } from "pinia";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export const useCartStore = defineStore("cart", {
  state: () => ({
    items: [] as CartItem[],
  }),
  getters: {
    itemCount: (state) =>
      state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },
  actions: {

    addToCart(product: {
      id: string;
      name: string;
      price: number;
      quantity: number;
    }) {
      const existing = this.items.find((item) => item.id === product.id);
      if (existing) {
        existing.quantity += product.quantity;
      } else {
        this.items.push({ ...product });
      }
    },

    removeFromCart(productId: string) {
      this.items = this.items.filter((item) => item.id !== productId);
    },

    clearCart() {
      this.items = [];
    },
  },
  persist: true,
});
