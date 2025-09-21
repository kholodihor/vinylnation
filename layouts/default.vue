<template>
  <div class="w-full fixed z-50">
    <LayoutTopBar />
    <LayoutMainHeader />
  </div>

  <Loading v-if="userStore.isLoading" />

  <div class="lg:pt-[6rem] md:pt-[4rem] pt-[2rem]" />
  <slot />

  <Footer v-if="!userStore.isLoading" />

  <!-- Global Voice Assistant FAB -->
  <VapiCallButton />
</template>

<script setup lang="ts">
  import VapiCallButton from '~/components/VapiCallButton.vue'
  const userStore = useUserStore()
</script>
