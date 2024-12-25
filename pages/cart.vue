<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto p-2 min-h-[75vh] mt-[5vh]">
      <div v-if="userStore.cart.length === 0" class="h-[500px] flex items-center justify-center">
        <div class="pt-10">
          <img class="mx-auto" width="250" src="/cart-empty.png" />

          <div class="text-xl text-center mt-4">No items yet</div>

          <div v-if="!user" class="flex text-center">
            <NuxtLink
              to="/auth"
              class="bg-[#FD374F] w-full text-white text-[21px] font-semibold p-1.5 rounded-full my-4"
            >
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>
      <div
        v-else-if="userStore.cart.length !== 0"
        class="md:flex gap-4 justify-between mx-auto w-full"
      >
        <div class="md:w-[65%]">
          <div class="bg-white rounded-lg p-4">
            <div class="text-2xl font-bold mb-2">Shopping Cart ({{ userStore.cart.length }})</div>
          </div>
          <div id="Items" class="bg-white rounded-lg p-4 mt-4">
            <div v-for="product in userStore.cart" :key="product.id">
              <CartItem
                :product="product"
                :selected-array="selectedArray"
                @selected-radio="selectedRadioFunc"
              />
            </div>
          </div>
        </div>

        <div class="md:hidden block my-4" />
        <div class="md:w-[35%]">
          <div class="bg-white rounded-lg p-4">
            <div class="text-2xl font-extrabold mb-2">Summary</div>
            <div class="flex items-center justify-between my-4">
              <div class="font-semibold">Total</div>
              <div class="text-2xl font-semibold">
                $ <span class="font-extrabold">{{ totalPriceComputed }}</span>
              </div>
            </div>
            <button
              class="flex items-center justify-center bg-[#f8d210] w-full text-black border border-black text-[21px] font-semibold p-1.5 rounded-lg mt-4"
              @click="goToCheckout"
            >
              Checkout
            </button>
          </div>
          <div class="bg-white rounded-lg p-4 mt-4">
            <div class="text-lg font-semibold mb-2">Payment methods</div>
            <div class="flex items-center justify-start gap-8 my-4">
              <div v-for="(card, index) in cards" :key="index">
                <img class="h-6" :src="card" />
              </div>
            </div>

            <div class="border-b" />
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useAuthUser } from '~/composables/useAuthUser'
  const userStore = useUserStore()
  const user = ref(await useAuthUser())
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
    if (!selectedArray.value.length) {
      selectedArray.value.push(e)
      return
    }
    selectedArray.value.forEach((item, index) => {
      if (e.id !== item.id) {
        selectedArray.value.push(e)
      } else {
        selectedArray.value.splice(index, 1)
      }
    })
  }

  const goToCheckout = () => {
    const ids: number[] = []
    userStore.checkout = []
    selectedArray.value.forEach((item) => ids.push(item.id))
    const res = userStore.cart.filter((item) => {
      return ids.includes(item.id)
    })
    res.forEach((item) => userStore.checkout.push(item))
    return navigateTo('/checkout')
  }
</script>
