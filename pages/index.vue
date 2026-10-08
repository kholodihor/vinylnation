<template>
  <StartLoader v-if="startLoading" />
  <div v-else>
    <Hero />
    <div class="mt-4 max-w-[1200px] mx-auto px-2 w-full xl:max-w-[1600px]">
      <div class="grid xl:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-6 w-full">
        <template v-if="products">
          <ProductComponent v-for="product in products" :key="product.id" :product="product" />
        </template>
        <Skeleton v-for="index in 8" v-else :key="index" />
      </div>
      <p v-if="error" class="text-center text-red-600 mb-6">
        Could not load products. Please try again later.
      </p>
      <Proposal />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

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

  // Show the intro animation only on the first client render
  const startLoading = ref(true)
  onMounted(() => (startLoading.value = false))

  const { data: products, error } = await useFetch<IProduct[]>('/api/products', {
    key: 'products-all',
  })
</script>
