<template>
  <div v-if="speechError || ttsError" class="error-banner">
    <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <div>
      <p class="error-title">오류 발생</p>
      <p class="error-message">{{ speechError || ttsError }}</p>
    </div>
    <button @click="emit('clear')" class="error-close">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  speechError: {
    type: String,
    default: null
  },
  ttsError: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['clear'])
</script>

<style scoped>
/* 에러 배너 */
.error-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
}

.error-icon {
  width: 24px;
  height: 24px;
  color: #DC2626;
  flex-shrink: 0;
}

.error-title {
  font-size: 14px;
  font-weight: 600;
  color: #991B1B;
  margin: 0 0 4px 0;
}

.error-message {
  font-size: 13px;
  color: #DC2626;
  margin: 0;
}

.error-close {
  margin-left: auto;
  padding: 4px;
  background: none;
  border: none;
  cursor: pointer;
  color: #DC2626;
}

.error-close svg {
  width: 20px;
  height: 20px;
}
</style>
