<template>
  <div class="product-details">
    <span class="flex items-center justify-start gap-3 px-1 pt-1">
      <span class="text-black font-semibold">${{ price }}</span>
    </span>
    <p class="px-1 pt-0.5 text-xs text-[#252525]">
      {{ truncatedTitle }}
    </p>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{
    price: number
    title: string
  }>()

  const truncatedTitle = computed(() => {
    return props.title.substring(0, 60)
  })
</script>
