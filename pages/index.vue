<template>
  <MainLayout>
    <HomeIntro />
    <div class="mt-4 max-w-[1300px] mx-auto px-2">
      <div v-if="products" class="flex flex-wrap justify-center gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
      <SellProposal />
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'
  import { useUserStore } from '~/stores/user'
  import ProductCard from '~/components/products/ProductCard.vue'
  import HomeIntro from '~/components/home/HomeIntro.vue'
  import SellProposal from '~/components/home/SellProposal.vue'
  import MainLayout from '~/layouts/MainLayout.vue'

  const userStore = useUserStore()
  const products = ref<IProduct[]>([])

  useAsyncData('products', () =>
    $fetch('/api/prisma/get-all-products').then((res) => {
      products.value = res.products
      setTimeout(() => (userStore.isLoading = false), 1500)
    })
  )
</script>
