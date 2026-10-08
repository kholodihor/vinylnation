<template>
  <div class="flex justify-start my-2 p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors">
    <div class="my-auto">
      <div
        class="flex items-center justify-start cursor-pointer"
        @mouseenter="isHover = true"
        @mouseleave="isHover = false"
      >
        <div
          class="flex items-center justify-center h-[22px] w-[22px] rounded-full border mr-3 sm:mr-5 ml-1 sm:ml-2 transition-colors"
          :class="[
            isHover ? 'border-[#FD374F]' : 'border-gray-600',
            selected ? 'bg-[#FD374F] border-[#FD374F]' : '',
          ]"
          role="checkbox"
          :aria-checked="selected"
          :aria-label="`Select ${product.title}`"
          @click="emit('toggle')"
        >
          <div class="h-[8px] w-[8px] rounded-full bg-white" />
        </div>
      </div>
    </div>

    <div
      class="relative w-[90px] sm:w-[120px] md:w-[150px] aspect-square rounded-lg overflow-hidden flex-shrink-0"
    >
      <img class="w-full h-full object-cover" :src="product.url" :alt="product.title" />
    </div>

    <div class="overflow-hidden pl-3 sm:pl-4 w-full min-w-0">
      <div class="flex items-start justify-between w-full gap-3">
        <div class="flex-1 min-w-0">
          <div class="text-sm sm:text-base font-medium truncate">{{ product.title }}</div>
          <div class="text-lg sm:text-xl font-semibold text-[#f8d210] mt-1">
            ${{ formatPrice(product.price) }}
          </div>
        </div>
        <button
          class="hidden sm:flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors px-2 py-1 -mr-2"
          @click="emit('remove')"
        >
          <Icon name="material-symbols:delete-outline" size="20" />
          <span class="text-sm">Remove</span>
        </button>
      </div>

      <div class="mt-2 space-y-1">
        <p class="text-[#009A66] text-xs font-medium flex items-center gap-1">
          <Icon name="material-symbols:local-shipping-outline" size="16" />
          <span>Free Shipping</span>
        </p>
        <p class="text-[#009A66] text-xs font-medium flex items-center gap-1">
          <Icon name="material-symbols:calendar-month-outline" size="16" />
          <span>Over 11-day free delivery</span>
        </p>
      </div>

      <div class="flex items-center justify-end mt-2 sm:hidden">
        <button
          class="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors px-2 py-1"
          @click="emit('remove')"
        >
          <Icon name="material-symbols:delete-outline" size="20" />
          <span class="text-sm">Remove</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

  defineProps<{
    product: IProduct
    selected: boolean
  }>()

  const emit = defineEmits<{ toggle: []; remove: [] }>()

  const isHover = ref(false)
</script>
