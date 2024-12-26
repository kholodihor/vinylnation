<template>
  <div class="relative">
    <client-only>
      <textarea
        v-model="computedDescription"
        class="w-full bg-white text-gray-800 text-sm rounded-lg px-4 py-3 transition-all duration-200 min-h-[120px] resize-y"
        :class="[
          error ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-[#f8d210]',
          'border-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f8d210]/20',
        ]"
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </client-only>

    <div v-if="error" class="mt-1.5 flex items-center gap-1 text-red-500">
      <Icon name="material-symbols:error-outline-rounded" size="16" />
      <span class="text-xs font-medium">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
  const emit = defineEmits(['update:input'])

  const props = defineProps<{
    input: string
    placeholder: string
    error: string
  }>()

  const { input, placeholder, error } = toRefs(props)

  const isFocused = ref(false)

  const computedDescription = computed({
    get: () => input.value,
    set: (val) => emit('update:input', val),
  })
</script>
