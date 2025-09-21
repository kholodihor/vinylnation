<script setup lang="ts">
  import { computed } from 'vue'
  import { useVapi } from '~/composables/useVapi'

  const { isCalling, toggleCall } = useVapi()
  const ariaLabel = computed(() => (isCalling.value ? 'End voice call' : 'Start voice call'))
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Floating action button bottom-right (yellow) -->
      <button
        type="button"
        :aria-label="ariaLabel"
        title="Voice Assistant"
        class="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-[#f8d210] text-black shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-[9999]"
        :class="isCalling ? 'ring-4 ring-[#f8d210]/40 animate-pulse' : ''"
        @click="toggleCall()"
      >
        <Icon :name="isCalling ? 'ph:phone-disconnect-fill' : 'ph:phone-call-fill'" size="28" />
      </button>
    </Teleport>
  </ClientOnly>
</template>

<style scoped></style>
