<template>
  <div class="relative">
    <div class="flex items-center border rounded-lg w-full">
      <input
        v-model="searchItem"
        class="w-full px-3 py-2 rounded-lg"
        placeholder="Search..."
        type="text"
      />
      <Icon
        v-if="!isSearching"
        name="material-symbols:search"
        size="20"
        class="mr-2"
      />
      <Icon
        v-else
        name="eos-icons:loading"
        size="20"
        class="mr-2"
      />
    </div>
    <div
      v-if="items"
      class="absolute bg-white w-full p-2 rounded-lg border mt-2 z-50"
    >
      <NuxtLink
        v-for="item in items"
        :key="item.id"
        :to="`/item/${item.id}`"
        class="flex items-center gap-3 p-1 hover:underline hover:text-blue-500"
      >
        <img width="40" :src="item.url" />
        {{ item.title }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IProduct } from '~/types'

const isSearching = ref(false)
const searchItem = ref('')
const items = ref<IProduct[] | null>(null)

const searchByName = useDebounce(() => {
  if (!searchItem.value) {
    items.value = null
    isSearching.value = false
    return
  }
  
  isSearching.value = true
  useAsyncData(() =>
    $fetch<IProduct[]>(`/api/prisma/search-by-name/${searchItem.value}`).then((res) => {
      items.value = res
      isSearching.value = false
    })
  )
}, 500)

watch(() => searchItem.value, () => {
  if (!searchItem.value) {
    setTimeout(() => {
      items.value = null
      isSearching.value = false
    }, 500)
    return
  }
  searchByName()
})
</script>
