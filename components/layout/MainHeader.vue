<template>
  <div class="flex items-center w-full bg-white shadow-sm">
    <div
      class="flex lg:justify-start justify-between items-center gap-4 sm:gap-8 max-w-[1200px] w-full px-3 sm:px-4 py-3 sm:py-4 mx-auto"
    >
      <NuxtLink to="/" class="min-w-[120px] sm:min-w-[170px] transition-transform hover:scale-105">
        <img width="170" src="/logo.png" alt="Vinyl Nation Logo" />
      </NuxtLink>

      <div class="hidden md:block flex-grow max-w-[700px]">
        <LayoutSearchBar />
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <NuxtLink to="/cart" class="flex items-center">
          <button
            class="relative md:block hidden group"
            @mouseenter="isCartHover = true"
            @mouseleave="isCartHover = false"
          >
            <span
              class="absolute flex items-center justify-center z-10 -right-[3px] -top-[3px] bg-[#f8d210] h-[18px] min-w-[18px] text-xs text-white font-medium px-1 rounded-full transition-all group-hover:scale-110"
            >
              {{ userStore.cart.length }}
            </span>
            <div class="min-w-[40px] transition-colors">
              <Icon
                name="ph:shopping-cart-simple-light"
                size="33"
                :color="isCartHover ? '#f8d210' : '#333333'"
              />
            </div>
          </button>
        </NuxtLink>

        <button
          class="md:hidden flex items-center justify-center rounded-full p-2 hover:bg-gray-100 transition-colors"
          @click="userStore.isMenuOverlay = true"
        >
          <Icon name="radix-icons:hamburger-menu" size="28" />
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Search Bar -->
  <div class="md:hidden w-full bg-white border-t px-3 py-2">
    <LayoutSearchBar />
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/user'
  const userStore = useUserStore()
  const isCartHover = ref(false)
</script>
