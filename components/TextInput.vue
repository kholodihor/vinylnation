<template>
  <div class="relative">
    <input
      v-model="value"
      :placeholder="placeholder"
      class="w-full bg-white text-gray-800 text-sm rounded-lg px-4 py-3 transition-all duration-200"
      :class="[
        error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#f8d210]',
        'border-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f8d210]/20',
      ]"
      :type="inputType"
      autocomplete="off"
    />
    <div v-if="error" class="mt-1.5 flex items-center gap-1 text-red-500">
      <Icon name="material-symbols:error-outline-rounded" size="16" />
      <span class="text-xs font-medium">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  withDefaults(
    defineProps<{
      placeholder?: string
      error?: string
      inputType?: string
    }>(),
    { placeholder: '', error: '', inputType: 'text' }
  )

  const value = defineModel<string>('input', { required: true })
</script>
