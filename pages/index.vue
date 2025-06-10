<template>
  <StartLoader v-if="startLoading" />
  <MainLayout v-else>
    <Hero />
    <div class="mt-4 max-w-[1200px] mx-auto px-2 w-full xl:max-w-[1600px]">
      <ClientOnly>
        <div
          v-if="products"
          class="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-6 w-full"
        >
          <div v-for="product in products" :key="product.id" class="w-full">
            <ProductComponent :product="product" />
          </div>
        </div>
        <div
          v-else
          class="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-6"
        >
          <Skeleton v-for="(item, index) in Array(8)" :key="index" />
        </div>
      </ClientOnly>
      <Proposal />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import MainLayout from '~/layouts/MainLayout.vue'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useProductsStore } from '~/stores/products'
  import StartLoader from '~/components/StartLoader.vue'
  import Hero from '~/components/Hero.vue'

  const userStore = useUserStore()
  const productsStore = useProductsStore()
  const products = ref<IProduct[]>([])
  const startLoading = ref(true)

  onMounted(async () => {
    try {
      const data = await $fetch<IProduct[]>('/api/prisma/get-all-products')
      products.value = data
      productsStore.setProducts(data)
      startLoading.value = false
    } finally {
      userStore.isLoading = false
    }
  })
</script>

<style scoped></style>
