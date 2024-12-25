<template>
  <li
    class="relative flex items-center px-2.5 hover:text-[#f8d210] h-full cursor-pointer"
    :class="isAccountMenu ? 'bg-white border z-40 shadow-xl' : 'border border-[#fafafa]'"
    @mouseenter="isAccountMenu = true"
    @mouseleave="isAccountMenu = false"
  >
    <nuxt-img
      v-if="user && user.user_metadata?.avatar_url"
      :src="user.user_metadata.avatar_url"
      class="w-8 h-8 rounded-full object-cover"
      alt="User avatar"
      @error="handleAvatarError"
    />
    <Icon v-else name="ph:user-thin" size="17" />
    <span class="ml-2">{{ !user ? 'Account' : user.email }}</span>

    <Icon name="mdi:chevron-down" size="15" class="ml-5" />

    <div
      v-if="isAccountMenu"
      class="absolute bg-white w-[220px] text-[#333333] z-40 top-[2.5rem] -left-[1rem] border-x border-b"
    >
      <div v-if="!user">
        <div class="flex items-center gap-1 px-3 py-4 mb-3">
          <NuxtLink
            to="/auth"
            class="bg-[#f8d210] text-center w-full text-[16px] rounded-sm text-white font-semibold p-2"
          >
            Login / Register
          </NuxtLink>
        </div>
      </div>
      <div class="border-b" />
      <ul class="bg-white">
        <li class="text-[13px] p-4 w-full hover:bg-gray-200" @click="navigateTo('/orders')">
          My Orders
        </li>
        <li
          v-if="user"
          class="text-[13px] py-2 px-4 w-full hover:bg-red-300"
          @click="client.auth.signOut()"
        >
          Sign out
        </li>
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
  const client = useSupabaseClient()
  const user = ref(await useAuthUser())
  const isAccountMenu = ref(false)

  const handleAvatarError = () => {
    if (user.value && user.value.user_metadata) {
      user.value.user_metadata.avatar_url = null
    }
  }
</script>
