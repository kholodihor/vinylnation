<template>
  <div>
    <!-- Fixed Header -->
    <div class="w-full fixed z-50 bg-white">
      <div class="w-full bg-[#fafafa] border-b md:block hidden">
        <ul
          class="flex items-center justify-end text-sm text-[#333333] font-light px-2 h-10 bg-[#fafafa] max-w-[1200px]"
        >
          <NuxtLink to="/add">
            <li class="border-r border-r-gray-400 px-3 hover:text-[#f8d210] cursor-pointer">
              Add a Vinyl
            </li>
          </NuxtLink>
          <li class="border-r border-r-gray-400 px-3 hover:text-[#f8d210] cursor-pointer">
            <a href="https://www.youtube.com/@MyAnalogJournal/videos" target="_blank">
              Listen to the vinyl music</a
            >
          </li>
          <UserMenu />
        </ul>
      </div>

      <div class="flex items-center w-full">
        <div
          class="flex lg:justify-start justify-between gap-10 max-w-[1150px] w-full px-3 py-5 mx-auto"
        >
          <NuxtLink to="/main" class="min-w-[170px]">
            <img width="170" src="/logo.png" />
          </NuxtLink>

          <div class="max-w-[700px] w-full md:block hidden">
            <SearchBar />
          </div>

          <CartButton />
          <button
            class="md:hidden block rounded-full p-1.5 -mt-[4px] hover:bg-gray-200"
            @click="userStore.isMenuOverlay = true"
          >
            <Icon name="radix-icons:hamburger-menu" size="33" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <main class="min-h-screen">
      <div class="lg:pt-[8rem] md:pt-[6rem] pt-[4rem]">
        <Loading v-if="userStore.isLoading" />
        <slot />
      </div>
    </main>

    <Footer v-if="!userStore.isLoading" />
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '~/stores/user'
  import UserMenu from '~/components/layout/UserMenu.vue'
  import CartButton from '~/components/layout/CartButton.vue'
  import SearchBar from '~/components/layout/SearchBar.vue'

  const userStore = useUserStore()
</script>
