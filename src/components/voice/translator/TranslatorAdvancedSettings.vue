<template>
  <div class="advanced-settings">
    <button @click="emit('update:showAdvanced', !showAdvanced)" class="advanced-toggle">
      <svg :class="['toggle-icon', { 'rotated': showAdvanced }]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
      <span>고급 설정</span>
    </button>

    <div v-show="showAdvanced" class="advanced-content">
      <!-- VAD 침묵 시간 조절 -->
      <div class="setting-item">
        <label class="setting-label">
          <span>침묵 감지 시간 (VAD)</span>
          <span class="setting-value">{{ vadSilenceTimeout }}ms</span>
        </label>
        <input
          type="range"
          :value="vadSilenceTimeout"
          @input="emit('update-vad', Number($event.target.value))"
          min="700"
          max="1500"
          step="100"
          :disabled="isRecognizing"
          class="setting-slider"
        />
        <p class="setting-hint">
          짧게(700ms): 빠른 응답, 문장이 잘릴 수 있음 | 길게(1500ms): 긴 문장 인식, 응답 지연
        </p>
      </div>

      <!-- Phrase List -->
      <div class="setting-item">
        <label class="setting-label">전문 용어 (Phrase List)</label>
        <textarea
          :value="phraseListInput"
          @input="emit('update:phraseListInput', $event.target.value)"
          @blur="emit('update-phrase-list')"
          :disabled="isRecognizing"
          placeholder="쉼표로 구분하여 입력 (예: 네이버, 카카오, SKT, AI, ChatGPT)"
          class="setting-textarea"
          rows="3"
        ></textarea>
        <p class="setting-hint">
          인식률을 높이고 싶은 단어나 고유명사를 입력하세요
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showAdvanced: {
    type: Boolean,
    required: true
  },
  vadSilenceTimeout: {
    type: Number,
    required: true
  },
  phraseListInput: {
    type: String,
    required: true
  },
  isRecognizing: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits([
  'update:showAdvanced',
  'update:phraseListInput',
  'update-vad',
  'update-phrase-list'
])
</script>

<style scoped>
/* 고급 설정 */
.advanced-settings {
  background: white;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  overflow: hidden;
}

.advanced-toggle {
  width: 100%;
  padding: 16px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #37352F;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.advanced-content {
  padding: 0 16px 16px 16px;
  border-top: 1px solid #E9E9E7;
}

.setting-item {
  padding: 16px 0;
  border-bottom: 1px solid #E9E9E7;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: #37352F;
  margin-bottom: 12px;
}

.setting-value {
  font-weight: 600;
  color: #0070F3;
}

.setting-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E9E9E7;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.setting-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0070F3;
  cursor: pointer;
}

.setting-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #0070F3;
  cursor: pointer;
  border: none;
}

.setting-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E9E9E7;
  border-radius: 6px;
  font-size: 13px;
  color: #37352F;
  font-family: inherit;
  resize: vertical;
}

.setting-textarea:focus {
  outline: none;
  border-color: #0070F3;
}

.setting-hint {
  font-size: 12px;
  color: #6B6B6B;
  margin: 8px 0 0 0;
  line-height: 1.5;
}
</style>
