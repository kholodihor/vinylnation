<template>
  <div class="flex items-start space-x-4 py-4 border-b border-gray-200 last:border-b-0">
    <img
      class="rounded-lg md:w-[120px] w-[100px] object-cover aspect-square"
      :src="product.url"
      :alt="product.title"
    />
    <div class="flex-1 min-w-0">
      <div class="flex flex-col">
        <h3 class="text-base font-medium text-gray-900 truncate mb-1">
          {{ product.title }}
        </h3>
        <p class="text-sm text-gray-500 line-clamp-2 mb-2">
          {{ product.description }}
        </p>
        <div class="flex items-center justify-between">
          <div class="text-lg font-bold text-gray-900">${{ (product.price / 100).toFixed(2) }}</div>
          <div class="text-sm text-gray-500">Qty: 1</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

  const props = defineProps<{
    product: IProduct
  }>()

  const { product } = toRefs(props)
</script>
