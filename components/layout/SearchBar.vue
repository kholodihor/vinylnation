<template>
  <div class="w-full">
    <div class="relative">
      <div class="flex items-center border-2 border-black rounded-md w-full transition-colors">
        <input
          v-model="searchItem"
          class="w-full placeholder-gray-400 text-sm pl-4 focus:outline-none"
          placeholder="Find Your Favourite Vinyl"
          type="text"
          @keyup.esc="searchItem = ''"
        />
        <Icon
          v-if="isSearching"
          name="eos-icons:loading"
          size="25"
          class="mr-2 text-[#f8d210] animate-spin"
        />
        <button
          type="button"
          aria-label="Search"
          class="flex items-center h-[100%] p-2 px-3 bg-[#f8d210] transition-colors rounded-r-md"
          @click="search"
        >
          <Icon name="ph:magnifying-glass" size="20" color="#ffffff" />
        </button>
      </div>

      <div
        v-if="items?.length"
        class="absolute bg-white w-full mt-1 rounded-md border border-gray-200 shadow-lg overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
      >
        <div class="p-2 space-y-1">
          <NuxtLink
            v-for="item in items"
            :key="item.id"
            :to="`/item/${item.id}`"
            class="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-50 transition-colors"
            @click="searchItem = ''"
          >
            <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img
                class="rounded-md object-cover w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                :src="item.url"
                :alt="item.title"
              />
              <div class="truncate text-sm font-medium flex-1 min-w-0">{{ item.title }}</div>
            </div>
            <div class="text-sm font-medium text-[#f8d210] ml-2 flex-shrink-0">
              ${{ formatPrice(item.price) }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

  const searchItem = ref('')
  const items = ref<IProduct[] | null>(null)
  const isSearching = ref(false)

  let latestRequest = 0

  const search = async () => {
    const q = searchItem.value.trim()
    const requestId = ++latestRequest
    if (!q) {
      items.value = null
      isSearching.value = false
      return
    }

    isSearching.value = true
    try {
      const res = await $fetch<{ items: IProduct[] }>('/api/products/search', {
        query: { q, limit: 5 },
      })
      // Ignore responses that arrive after a newer search was started
      if (requestId === latestRequest) items.value = res.items
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      if (requestId === latestRequest) isSearching.value = false
    }
  }

  watch(searchItem, useDebounce(search, 250))
</script>
