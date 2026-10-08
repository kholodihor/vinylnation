import { defineStore } from 'pinia'
import type { IProduct } from '~/types'

type Store = {
  isMenuOverlay: boolean
  cart: IProduct[]
  /** Items selected in the cart for the current checkout */
  checkout: IProduct[]
}

export const useUserStore = defineStore('user', {
  state: (): Store => ({
    isMenuOverlay: false,
    cart: [],
    checkout: [],
  }),
  getters: {
    isInCart: (state) => (id: number) => state.cart.some((item) => item.id === id),
  },
  actions: {
    addToCart(product: IProduct) {
      if (!this.isInCart(product.id)) this.cart.push(product)
    },
    removeFromCart(id: number) {
      this.cart = this.cart.filter((item) => item.id !== id)
      this.checkout = this.checkout.filter((item) => item.id !== id)
    },
    completeCheckout() {
      const purchased = new Set(this.checkout.map((item) => item.id))
      this.cart = this.cart.filter((item) => !purchased.has(item.id))
      this.checkout = []
    },
  },
  persist: {
    paths: ['cart', 'checkout'],
  },
})
