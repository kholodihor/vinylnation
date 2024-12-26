<template>
  <div class="w-full bg-[#fafafa] border-b md:block hidden">
    <div
      class="flex items-center justify-end text-sm text-[#333333] font-light h-10 max-w-[1200px] mx-auto px-4"
    >
      <ul class="flex items-center">
        <NuxtLink to="/add">
          <li class="border-r border-r-gray-200 px-4 hover:text-[#f8d210] transition-colors">
            Add a Vinyl
          </li>
        </NuxtLink>
        <li class="border-r border-r-gray-200 px-4">
          <a
            href="https://www.youtube.com/@MyAnalogJournal/videos"
            target="_blank"
            class="hover:text-[#f8d210] transition-colors"
          >
            Listen to the vinyl music
          </a>
        </li>
        <li
          class="relative flex items-center px-4 h-full cursor-pointer group"
          @mouseenter="isAccountMenu = true"
          @mouseleave="isAccountMenu = false"
        >
          <div
            class="flex items-center gap-2 hover:text-[#f8d210] transition-colors"
            :class="isAccountMenu ? 'text-[#f8d210]' : ''"
          >
            <Icon v-if="!user" name="ph:user-thin" size="17" />
            <img
              v-else
              :src="user.user_metadata.avatar_url"
              class="w-8 h-8 rounded-full border-2 border-transparent group-hover:border-[#f8d210] transition-colors"
              :alt="user.email"
            />
            <span>{{ !user ? 'Account' : user.email }}</span>
            <Icon
              name="mdi:chevron-down"
              size="15"
              class="transition-transform"
              :class="isAccountMenu ? 'rotate-180' : ''"
            />
          </div>

          <div
            v-if="isAccountMenu"
            class="absolute bg-white w-[220px] top-full right-0 rounded-b-md border-x border-b shadow-lg overflow-hidden z-50"
          >
            <div v-if="!user" class="p-3">
              <NuxtLink
                to="/auth"
                class="flex items-center justify-center bg-[#f8d210] hover:bg-[#e5c20f] text-white font-medium rounded-md p-2.5 transition-colors"
              >
                Login / Register
              </NuxtLink>
            </div>
            <div v-else class="py-1">
              <NuxtLink
                to="/orders"
                class="flex items-center px-4 py-2.5 hover:bg-gray-50 text-sm transition-colors"
              >
                My Orders
              </NuxtLink>
              <button
                class="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 transition-colors"
                @click="client.auth.signOut()"
              >
                Sign out
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  const client = useSupabaseClient()
  const user = useSupabaseUser()
  const isAccountMenu = ref(false)
</script>
