<template>
  <button
    class="md:hidden block rounded-full p-1.5 -mt-[4px] hover:bg-gray-200"
    @click="userStore.isMenuOverlay = true"
  >
    <Icon name="radix-icons:hamburger-menu" size="33" />
  </button>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/user'
  const userStore = useUserStore()
</script>
