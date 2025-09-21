<template>
  <div>
    <div class="max-w-[1200px] mx-auto px-3 sm:px-4 py-6 sm:py-8 min-h-[75vh]">
      <div
        v-if="!userStore.cart.length"
        class="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <img
          class="w-48 sm:w-64 md:w-[250px] mb-6 animate-float"
          src="/cart-empty.png"
          alt="Empty Cart"
        />

        <h2 class="text-lg sm:text-xl font-medium text-gray-800 mb-2">Your cart is empty</h2>
        <p class="text-sm text-gray-500 mb-6">
          Looks like you haven't added any vinyls to your cart yet
        </p>

        <div v-if="!user" class="w-full max-w-xs">
          <NuxtLink
            to="/auth"
            class="block w-full bg-[#f8d210] hover:bg-[#e5c20f] text-black font-medium text-lg sm:text-xl py-2.5 px-6 rounded-lg transition-colors"
          >
            Sign in to continue
          </NuxtLink>
        </div>
        <NuxtLink to="/" class="mt-4 text-sm text-gray-600 hover:text-[#f8d210] transition-colors">
          ← Back to shopping
        </NuxtLink>
      </div>

      <div v-else class="md:flex gap-6 justify-between mx-auto w-full">
        <div class="md:w-[65%]">
          <div class="bg-white rounded-lg p-4">
            <div class="flex items-center justify-between">
              <h1 class="text-xl sm:text-2xl font-bold">
                Shopping Cart ({{ userStore.cart.length }})
              </h1>
              <NuxtLink
                to="/"
                class="text-sm text-gray-600 hover:text-[#f8d210] transition-colors hidden sm:block"
              >
                Continue Shopping
              </NuxtLink>
            </div>
          </div>

          <div class="bg-white rounded-lg p-2 sm:p-4 mt-4">
            <div v-for="product in userStore.cart" :key="product.id">
              <CartItem
                :product="product"
                :selected-array="selectedArray"
                @selected-radio="selectedRadioFunc"
                @remove-from-cart="removeFromCart"
              />
            </div>
          </div>

          <NuxtLink
            to="/"
            class="mt-4 text-sm text-gray-600 hover:text-[#f8d210] transition-colors block sm:hidden text-center"
          >
            Continue Shopping
          </NuxtLink>
        </div>

        <div class="md:w-[35%] mt-6 md:mt-0">
          <div class="bg-white rounded-lg p-4">
            <h2 class="text-xl sm:text-2xl font-bold mb-4">Order Summary</h2>

            <div class="space-y-3">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">${{ totalPriceComputed }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="text-[#009A66] font-medium">Free</span>
              </div>
              <div class="border-t pt-3">
                <div class="flex items-center justify-between">
                  <span class="font-semibold">Total</span>
                  <div class="text-xl sm:text-2xl font-bold">${{ totalPriceComputed }}</div>
                </div>
              </div>
            </div>

            <button
              class="w-full bg-[#f8d210] hover:bg-[#e5c20f] text-black font-medium text-lg sm:text-xl py-3 px-6 rounded-lg mt-6 transition-colors flex items-center justify-center gap-2"
              @click="goToCheckout"
            >
              <span>Checkout</span>
              <Icon name="material-symbols:arrow-forward-rounded" size="24" />
            </button>
          </div>

          <div class="bg-white rounded-lg p-4 mt-4">
            <h3 class="text-base sm:text-lg font-semibold mb-4">We Accept</h3>
            <div class="flex items-center flex-wrap gap-4">
              <img
                v-for="(card, index) in cards"
                :key="index"
                class="h-6 sm:h-7"
                :src="card"
                :alt="card.split('/')[1].split('.')[0]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { navigateTo } from 'nuxt/app'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'

  const userStore = useUserStore()
  const user = useSupabaseUser()
  const selectedArray = ref<IProduct[]>([])

  onMounted(() => {
    setTimeout(() => (userStore.isLoading = false), 200)
  })

  const cards = ref([
    'cards/visa.png',
    'cards/mastercard.png',
    'cards/paypal.png',
    'cards/applepay.png',
  ])

  const totalPriceComputed = computed(() => {
    let price = 0
    userStore.cart.forEach((prod) => {
      price += prod.price
    })
    return price / 100
  })

  const selectedRadioFunc = (e: IProduct) => {
    const index = selectedArray.value.findIndex((item) => item.id === e.id)
    if (index === -1) {
      selectedArray.value.push(e)
    } else {
      selectedArray.value.splice(index, 1)
    }
  }

  const removeFromCart = (product: IProduct) => {
    userStore.cart = userStore.cart.filter((item) => item.id !== product.id)
    // Also remove from selected array if it was selected
    selectedArray.value = selectedArray.value.filter((item) => item.id !== product.id)
  }

  const goToCheckout = async () => {
    if (!selectedArray.value.length) {
      alert('Please select at least one item to checkout')
      return
    }
    const ids = selectedArray.value.map((item) => item.id)
    console.log(ids)
    // Set selected items as checkout items
    userStore.checkout = [...selectedArray.value]
    await navigateTo({
      path: '/checkout',
      query: {
        items: ids.join(','),
      },
    })
  }
</script>

<style scoped>
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
</style>
