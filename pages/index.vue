<template>
  <StartLoader v-if="startLoading" />
  <div v-else>
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
        <template #fallback>
          <div class="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-6">
            <Skeleton v-for="(item, index) in Array(8)" :key="index" />
          </div>
        </template>
      </ClientOnly>
      <Proposal />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue'
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  import { useProductsStore } from '~/stores/products'
  import StartLoader from '~/components/StartLoader.vue'
  import Hero from '~/components/Hero.vue'

  // SEO optimization
  useHead({
    title: 'VinylNation - Premium Vinyl Records',
    meta: [
      {
        name: 'description',
        content: 'Discover and purchase premium vinyl records from our curated collection',
      },
      { property: 'og:title', content: 'VinylNation - Premium Vinyl Records' },
      { property: 'og:description', content: 'Discover and purchase premium vinyl records' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  })

  const userStore = useUserStore()
  const productsStore = useProductsStore()
  const products = ref<IProduct[]>([])
  const startLoading = ref(true)

  // Optimized data fetching with caching
  const { data: productsData } = await useFetch<IProduct[]>('/api/prisma/get-all-products', {
    key: 'products-all',
    server: true,
  })

  onMounted(() => {
    if (productsData.value) {
      products.value = productsData.value
      productsStore.setProducts(productsData.value)
    }
    startLoading.value = false
    userStore.isLoading = false
  })

  // Watch for data changes
  watch(productsData, (newData) => {
    if (newData) {
      products.value = newData
      productsStore.setProducts(newData)
    }
  })
</script>

<style scoped></style>
