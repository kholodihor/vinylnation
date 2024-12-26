import { defineStore } from 'pinia'
import type { IProduct } from '~/types'

type ProductsStore = {
  products: IProduct[]
  lastFetch: number | null
}

export const useProductsStore = defineStore('products', {
  state: (): ProductsStore => ({
    products: [],
    lastFetch: null,
  }),

  getters: {
    getProducts: (state) => state.products,
    shouldRefetch: (state) => {
      if (!state.lastFetch) return true
      // Refetch if data is older than 5 minutes
      return Date.now() - state.lastFetch > 5 * 60 * 1000
    },
  },

  actions: {
    async fetchProducts() {
      // Return cached data if available and fresh
      if (!this.shouldRefetch && this.products.length > 0) {
        return this.products
      }

      try {
        const data = await $fetch('/api/prisma/get-all-products')
        if (data) {
          this.products = data
          this.lastFetch = Date.now()
          return data
        }
        return this.products
      } catch (error) {
        console.error('Error fetching products:', error)
        return this.products
      }
    },

    setProducts(products: IProduct[]) {
      this.products = products
      this.lastFetch = Date.now()
    },
  },

  persist: true,
})
