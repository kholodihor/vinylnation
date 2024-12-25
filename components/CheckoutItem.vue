<template>
  <div class="flex justify-start my-2">
    <img class="rounded-md md:w-[150px] w-[90px]" :src="product.url" />
    <div class="overflow-hidden pl-2">
      <div class="flex items-center">
        <div class="truncate">{{ product.title }}</div>
      </div>

      <div class="text-lg font-semibold mt-2">
        $ <span class="font-bold">{{ product.price / 100 }}</span>
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
