<template>
  <div class="language-selector-section">
    <!-- 입력 언어 -->
    <div class="selector-group">
      <label class="selector-label">입력 언어</label>
      <select
        :model-value="selectedFromLanguage"
        @change="emit('update:selectedFromLanguage', $event.target.value)"
        :disabled="isRecognizing"
        class="language-select"
      >
        <option
          v-for="lang in supportedLanguages"
          :key="lang.code"
          :value="lang.code"
        >
          {{ lang.flag }} {{ lang.label }}
        </option>
      </select>
    </div>

    <!-- 화살표 -->
    <div class="arrow-icon">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </div>

    <!-- 출력 언어 -->
    <div class="selector-group">
      <label class="selector-label">출력 언어</label>
      <select
        :model-value="selectedToLanguage"
        @change="emit('update:selectedToLanguage', $event.target.value)"
        :disabled="isRecognizing"
        class="language-select"
      >
        <option
          v-for="lang in translationLanguages"
          :key="lang.code"
          :value="lang.code"
        >
          {{ lang.label }}
        </option>
      </select>
    </div>

    <!-- 음성 선택 -->
    <div class="selector-group">
      <label class="selector-label">음성 (TTS)</label>
      <select
        :model-value="selectedVoice"
        @change="emit('update:selectedVoice', $event.target.value)"
        :disabled="availableVoices.length === 0"
        class="voice-select"
      >
        <option
          v-for="voice in availableVoices"
          :key="voice.value"
          :value="voice.value"
        >
          {{ voice.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup>
defineProps({
  selectedFromLanguage: {
    type: String,
    required: true
  },
  selectedToLanguage: {
    type: String,
    required: true
  },
  selectedVoice: {
    type: String,
    required: true
  },
  isRecognizing: {
    type: Boolean,
    required: true
  },
  supportedLanguages: {
    type: Array,
    required: true
  },
  translationLanguages: {
    type: Array,
    required: true
  },
  availableVoices: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  'update:selectedFromLanguage',
  'update:selectedToLanguage',
  'update:selectedVoice'
])
</script>

<style scoped>
/* 언어 선택 섹션 */
.language-selector-section {
  display: grid;
  grid-template-columns: 1fr auto 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  align-items: end;
}

.selector-group {
  display: flex;
  flex-direction: column;
}

.selector-label {
  font-size: 12px;
  font-weight: 500;
  color: #6B6B6B;
  margin-bottom: 8px;
}

.language-select,
.voice-select {
  padding: 10px 12px;
  border: 1px solid #E9E9E7;
  border-radius: 6px;
  font-size: 14px;
  color: #37352F;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.language-select:hover:not(:disabled),
.voice-select:hover:not(:disabled) {
  border-color: #0070F3;
}

.language-select:disabled,
.voice-select:disabled {
  background: #F7F6F3;
  cursor: not-allowed;
}

.arrow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B6B6B;
}

.arrow-icon svg {
  width: 24px;
  height: 24px;
}

/* 반응형 */
@media (max-width: 1024px) {
  .language-selector-section {
    grid-template-columns: 1fr;
  }

  .arrow-icon {
    display: none;
  }
}
</style>
