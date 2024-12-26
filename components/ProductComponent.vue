<template>
  <div
    :id="`ProductComponent${product.id}`"
    class="group bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
  >
    <NuxtLink :to="`/item/${product.id}`" class="block">
      <div class="relative aspect-square overflow-hidden">
        <img
          :src="product.url"
          :alt="product.title"
          class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div
          class="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"
        />
      </div>

      <div class="p-3 sm:p-4">
        <div class="flex items-center justify-between mb-1.5 sm:mb-2">
          <span class="text-base sm:text-lg font-semibold text-[#f8d210]">
            ${{ priceComputed }}
          </span>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <Icon
              name="ph:arrow-right-bold"
              size="20"
              class="text-[#f8d210] transform translate-x-0 group-hover:translate-x-1 transition-transform"
            />
          </div>
        </div>
        <h3 class="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 leading-snug">
          {{ product.title }}
        </h3>
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
