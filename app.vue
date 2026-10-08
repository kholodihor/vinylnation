<template>
  <div class="bg-[#f2f2f2] w-full">
    <NuxtLoadingIndicator color="#f8d210" />
    <NuxtLayout>
      <NuxtPage />
      <MenuOverlay
        :class="
          userStore.isMenuOverlay
            ? 'max-h-[100vh] transition-all duration-200 ease-in visible'
            : 'max-h-0 transition-all duration-200 ease-out invisible'
        "
      />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
  const userStore = useUserStore()

  // Close the mobile menu once the viewport grows past the mobile breakpoint
  onMounted(() => {
    const desktop = window.matchMedia('(min-width: 767px)')
    const close = () => {
      if (desktop.matches) userStore.isMenuOverlay = false
    }
    close()
    desktop.addEventListener('change', close)
  })
</script>
