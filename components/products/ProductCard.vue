<template>
  <div
    :id="`ProductCard${product?.id}`"
    class="bg-white inline-block rounded hover:shadow-xl transition-all cursor-pointer w-[300px] h-[400px]"
  >
    <NuxtLink :to="product ? `/item/${product.id}` : '#'" class="h-full flex flex-col">
      <div class="relative w-[300px] h-[300px] overflow-hidden rounded-t flex-shrink-0">
        <img
          v-if="product?.url"
          :src="product.url"
          :alt="product?.title || 'Product image'"
          class="w-full h-full object-cover transition-opacity duration-300"
          :class="{ 'opacity-0': isLoading }"
          @load="isLoading = false"
          @error="handleImageError"
        />
        <div
          v-if="isLoading || hasError || !product?.url"
          class="absolute inset-0 bg-gray-100 flex items-center justify-center"
        >
          <Icon v-if="isLoading" name="eos-icons:loading" size="30" class="text-gray-400" />
          <Icon
            v-else
            name="material-symbols:broken-image-outline"
            size="30"
            class="text-gray-400"
          />
        </div>
      </div>
      <div class="p-3 flex-1 flex flex-col">
        <span class="flex items-center justify-start gap-3">
          <span class="text-black font-semibold text-lg">${{ priceComputed }}</span>
        </span>
        <p class="pt-1 text-sm text-[#252525] line-clamp-2">
          {{ product?.title || 'Loading...' }}
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
  const isLoading = ref(true)
  const hasError = ref(false)

  const priceComputed = computed(() => {
    if (!product.value?.price) return 0
    return product.value.price / 100
  })

  const handleImageError = () => {
    isLoading.value = false
    hasError.value = true
  }
</script>
