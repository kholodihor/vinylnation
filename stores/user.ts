import { defineStore } from 'pinia'
import type { IProduct } from '~/types'

type Store = {
  isMenuOverlay: boolean
  isLoading: boolean
  cart: IProduct[]
  checkout: IProduct[]
}

export const useUserStore = defineStore('user', {
  state: (): Store => ({
    isMenuOverlay: false,
    isLoading: false,
    cart: [],
    checkout: [],
  }),
  persist: {
    paths: ['cart', 'checkout', 'isMenuOverlay'],
  },
})
