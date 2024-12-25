<template>
  <img class="rounded-t w-full h-auto object-cover" :src="src" :alt="alt" />
</template>

<script setup lang="ts">
  defineProps<{
    src: string
    alt?: string
  }>()
</script>
