<template>
  <div
    :id="`ProductComponent${product.id}`"
    class="bg-white inline-block rounded hover:shadow-xl transition-all cursor-pointer"
  >
    <NuxtLink :to="`/item/${product.id}`">
      <img class="rounded-t" :src="product.url" />
      <div id="ProductDetails">
        <span class="flex items-center justify-start gap-3 px-1 pt-1">
          <span class="text-black font-semibold">${{ priceComputed }}</span>
        </span>
        <p class="px-1 pt-0.5 text-xs text-[#252525]">
          {{ product.title.substring(0, 60) }}
        </p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

  const props = defineProps<{
    product: IProduct
  }>()

  const { product } = toRefs(props)

  const priceComputed = computed(() => {
    return product.value.price / 100
  })
</script>
