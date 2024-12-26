<template>
  <div class="w-full">
    <div class="relative">
      <div class="flex items-center border-2 border-black rounded-md w-full transition-colors">
        <input
          v-model="searchItem"
          class="w-full placeholder-gray-400 text-sm pl-4 focus:outline-none"
          placeholder="Find Your Favourite Vinyl"
          type="text"
        />
        <Icon
          v-if="isSearching"
          name="eos-icons:loading"
          size="25"
          class="mr-2 text-[#f8d210] animate-spin"
        />
        <button
          class="flex items-center h-[100%] p-2 px-3 bg-[#f8d210] transition-colors rounded-top-right-md rounded-bottom-right-md"
        >
          <Icon name="ph:magnifying-glass" size="20" color="#ffffff" />
        </button>
      </div>

      <div
        v-if="items"
        class="absolute bg-white w-full mt-1 rounded-md border border-gray-200 shadow-lg overflow-hidden z-50 max-h-[80vh] overflow-y-auto"
      >
        <div class="p-2 space-y-1">
          <NuxtLink
            v-for="item in items"
            :key="item.id"
            :to="`/item/${item.id}`"
            class="flex items-center justify-between w-full p-2 rounded-md hover:bg-gray-50 transition-colors"
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
              ${{ item.price / 100 }}
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { IProduct } from '~/types'

  const isSearching = ref(false)
  const searchItem = ref('')
  const items = ref<IProduct[] | null>(null)

  const searchByName = useDebounce(async () => {
    isSearching.value = true
    const res = await useFetch<IProduct[]>(`/api/prisma/search-by-name/${searchItem.value}`)
    items.value = res.data.value
    isSearching.value = false
  }, 100)

  watch(
    () => searchItem.value,
    () => {
      if (!searchItem.value) {
        setTimeout(() => {
          items.value = null
          isSearching.value = false
        }, 500)
      }
      searchByName()
    }
  )
</script>
