<template>
  <div class="w-full fixed z-50">
    <LayoutTopBar />
    <LayoutMainHeader />
  </div>

  <Loading v-if="userStore.isLoading" />

  <div class="lg:pt-[6rem] md:pt-[4rem] pt-[2rem]" />
  <slot />

  <Footer v-if="!userStore.isLoading" />
</template>

<script setup lang="ts">
  const userStore = useUserStore()
</script>
