<template>
  <div class="textbox">
    <client-only>
      <textarea
        v-model="computedDescription"
        class="w-full bg-white text-gray-800 border text-sm border-[#EFF0EB] rounded-lg p-3 placeholder-gray-500 focus:outline-none"
        cols="30"
        rows="10"
        :placeholder="placeholder"
        :class="{ 'border-gray-900': isFocused, 'border-red-500': error }"
        @focus="isFocused = true"
        @blur="isFocused = false"
      >
      </textarea>
    </client-only>

    <span v-if="error" class="text-red-500 text-[14px] font-semibold">
      {{ error }}
    </span>
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
