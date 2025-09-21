<template>
  <div class="z-[-1] bg-[#f2f2f2] w-full">
    <NuxtLayout>
      <NuxtPage />
      <MenuOverlay
        :class="[
          { 'max-h-[100vh] transition-all duration-200 ease-in visible': userStore.isMenuOverlay },
          { 'max-h-0 transition-all duration-200 ease-out invisible': !userStore.isMenuOverlay },
        ]"
      />
    </NuxtLayout>
  </div>
</template>

<script setup>
  import { useUserStore } from '~/stores/user'
  const userStore = useUserStore()

  const route = useRoute()

  const windowWidth = ref(process.client ? window.innerWidth : '')

  onMounted(() => {
    userStore.isLoading = true
    window.addEventListener('resize', function () {
      windowWidth.value = window.innerWidth
    })

    // Set loading to false after a short delay to allow components to mount
    setTimeout(() => {
      userStore.isLoading = false
    }, 500)
  })

  watch(
    () => windowWidth.value,
    () => {
      if (windowWidth.value >= 767) {
        userStore.isMenuOverlay = false
      }
    }
  )

  watch(
    () => route.fullPath,
    () => {
      userStore.isLoading = true
      // Set loading to false after route change completes
      nextTick(() => {
        setTimeout(() => {
          userStore.isLoading = false
        }, 300)
      })
    }
  )
</script>
