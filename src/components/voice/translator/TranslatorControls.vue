<template>
  <div class="controls">
    <!-- 녹음 버튼 -->
    <button
      @click="emit('toggle-recording')"
      :class="['record-button', { 'recording': isRecognizing }]"
      :disabled="isConnecting"
    >
      <div class="record-button-inner">
        <svg v-if="!isRecognizing" class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <svg v-else class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
        </svg>
        <span>{{ isRecognizing ? '중지' : '녹음 시작' }}</span>
      </div>
      <div v-if="isRecognizing" class="pulse-ring"></div>
    </button>

    <!-- TTS 재생 버튼 -->
    <button
      @click="emit('play-translation')"
      :disabled="!finalTranslation || isSpeaking || isRecognizing"
      class="secondary-button"
    >
      <svg v-if="!isSpeaking" class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
      <svg v-else class="button-icon animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      </svg>
      <span>{{ isSpeaking ? '재생 중...' : '번역 듣기' }}</span>
    </button>

    <!-- 지우기 버튼 -->
    <button
      @click="emit('clear-all')"
      :disabled="isRecognizing || (!finalText && !finalTranslation)"
      class="secondary-button"
    >
      <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      <span>지우기</span>
    </button>

    <!-- 내보내기 버튼 -->
    <button
      @click="emit('export-results')"
      :disabled="recognizedCount === 0"
      class="secondary-button"
    >
      <svg class="button-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span>내보내기 (JSON)</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  isConnecting: {
    type: Boolean,
    required: true
  },
  isRecognizing: {
    type: Boolean,
    required: true
  },
  isSpeaking: {
    type: Boolean,
    required: true
  },
  finalText: {
    type: String,
    default: ''
  },
  finalTranslation: {
    type: String,
    default: ''
  },
  recognizedCount: {
    type: Number,
    required: true
  }
})

const emit = defineEmits([
  'toggle-recording',
  'play-translation',
  'clear-all',
  'export-results'
])
</script>

<style scoped>
/* 컨트롤 버튼 */
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.record-button {
  position: relative;
  padding: 16px 32px;
  background: white;
  border: 2px solid #E9E9E7;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
  font-weight: 600;
  color: #37352F;
}

.record-button:hover:not(:disabled) {
  border-color: #0070F3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 112, 243, 0.2);
}

.record-button.recording {
  background: #DC2626;
  border-color: #DC2626;
  color: white;
}

.record-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.record-button-inner {
  display: flex;
  align-items: center;
  gap: 8px;
}

.button-icon {
  width: 24px;
  height: 24px;
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border: 2px solid #DC2626;
  border-radius: 12px;
  animation: pulse 1.5s ease-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.1);
  }
}

.secondary-button {
  padding: 12px 24px;
  background: white;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #37352F;
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-button:hover:not(:disabled) {
  border-color: #0070F3;
  color: #0070F3;
}

.secondary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
