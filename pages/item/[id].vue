<template>
  <MainLayout>
    <div class="max-w-[1200px] mx-auto p-2 pt-12 mb-8">
      <div class="md:flex gap-4 justify-between mx-auto w-full">
        <div class="md:w-[40%]">
          <img v-if="product?.url" class="rounded-lg object-fit" :src="product?.url" />
        </div>
        <div class="md:w-[60%] bg-white p-3 rounded-lg">
          <div v-if="product">
            <p class="mb-2">{{ product.title }}</p>
            <p class="mb-2 text-[#c55ffc]">
              <span class="text-black">Genre: </span>{{ product.genre }}
            </p>
            <p class="font-light text-[1rem] mb-2 overflow-y-scroll h-[40vh] max-h-[40vh]">
              {{ product.description }}
            </p>
          </div>

          <div class="border-b" />

          <div class="flex items-center justify-start gap-2 my-2">
            <div class="text-xl font-bold">$ {{ priceComputed }}</div>
          </div>

          <p class="text-[#009A66] text-xs font-semibold pt-1">Over 11-day free delivery</p>

          <p class="text-[#009A66] text-xs font-semibold pt-1">Free Shipping</p>

          <div class="py-2" />

          <button
            :disabled="isInCart"
            class="px-6 py-2 rounded-lg text-white text-lg font-semibold bg-gradient-to-r from-[#FF851A] to-[#FFAC2C]"
            @click="addToCart()"
          >
            <div v-if="isInCart">Is Added</div>
            <div v-else>Add to Cart</div>
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useAsyncData } from 'nuxt/app'

  const userStore = useUserStore()
  const route = useRoute()
  const product = ref<IProduct | null>(null)

  useAsyncData(() =>
    $fetch<IProduct>(`/api/prisma/get-product-by-id/${route.params.id}`).then((res) => {
      product.value = res
      setTimeout(() => (userStore.isLoading = false), 1000)
    })
  )

  const isInCart = computed(() => {
    let res = false
    userStore.cart.forEach((prod: IProduct) => {
      if (route.params.id === prod?.id.toString()) {
        res = true
      }
    })
    return res
  })

  const priceComputed = computed(() => {
    if (product.value) {
      return product.value.price / 100
    }
    return '0.00'
  })

  const addToCart = () => {
    if (product.value) {
      userStore.cart.push(product.value)
    }
  }
</script>
