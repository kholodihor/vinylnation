<template>
  <NuxtLink to="/cart" class="flex items-center">
    <button
      class="relative md:block hidden"
      @mouseenter="isCartHover = true"
      @mouseleave="isCartHover = false"
    >
      <span
        class="absolute z-[9999] flex items-center justify-center -right-[3px] top-0 bg-[#f8d210] h-[17px] min-w-[17px] text-xs text-white px-0.5 rounded-full"
      >
        {{ userStore.cart.length }}
      </span>
      <div class="min-w-[40px]">
        <Icon
          name="ph:shopping-cart-simple-light"
          size="33"
          :color="isCartHover ? '#f8d210' : ''"
        />
      </div>
    </button>
  </NuxtLink>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/user'
  const userStore = useUserStore()
  const isCartHover = ref(false)
</script>
