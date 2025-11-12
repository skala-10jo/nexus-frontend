<template>
  <div class="language-switcher">
    <div class="language-selector">
      <label class="lang-label">원본 언어</label>
      <div class="lang-buttons">
        <button
          v-for="lang in languages"
          :key="`source-${lang.code}`"
          @click="selectSourceLang(lang.code)"
          class="lang-button"
          :class="{ active: sourceLanguage === lang.code }"
        >
          <span class="lang-flag">{{ lang.flag }}</span>
          <span class="lang-name">{{ lang.name }}</span>
        </button>
      </div>
    </div>

    <button
      @click="swapLanguages"
      class="swap-button"
      title="언어 교환"
      :disabled="!sourceLanguage || !targetLanguage"
    >
      <svg
        class="swap-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    </button>

    <div class="language-selector">
      <label class="lang-label">목표 언어</label>
      <div class="lang-buttons">
        <button
          v-for="lang in languages"
          :key="`target-${lang.code}`"
          @click="selectTargetLang(lang.code)"
          class="lang-button"
          :class="{ active: targetLanguage === lang.code }"
        >
          <span class="lang-flag">{{ lang.flag }}</span>
          <span class="lang-name">{{ lang.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  sourceLanguage: {
    type: String,
    default: 'ko'
  },
  targetLanguage: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['update:sourceLanguage', 'update:targetLanguage', 'swap'])

const languages = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]

function selectSourceLang(code) {
  if (code !== props.targetLanguage) {
    emit('update:sourceLanguage', code)
  }
}

function selectTargetLang(code) {
  if (code !== props.sourceLanguage) {
    emit('update:targetLanguage', code)
  }
}

function swapLanguages() {
  const temp = props.sourceLanguage
  emit('update:sourceLanguage', props.targetLanguage)
  emit('update:targetLanguage', temp)
  emit('swap')
}
</script>

<style scoped>
.language-switcher {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.language-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 280px;
}

.lang-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.lang-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.lang-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #4B5563;
  background-color: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lang-button:hover {
  border-color: #2563EB;
  color: #2563EB;
  transform: translateY(-1px);
}

.lang-button.active {
  color: #FFFFFF;
  background-color: #2563EB;
  border-color: #2563EB;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}

.lang-flag {
  font-size: 1.25rem;
  line-height: 1;
}

.lang-name {
  white-space: nowrap;
}

.swap-button {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  background-color: #F3F4F6;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  align-self: flex-end;
  margin-bottom: 0.25rem;
}

.swap-button:hover:not(:disabled) {
  color: #2563EB;
  background-color: #EFF6FF;
  border-color: #2563EB;
  transform: rotate(180deg);
}

.swap-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.swap-icon {
  width: 1.5rem;
  height: 1.5rem;
  transition: transform 0.3s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .language-switcher {
    flex-direction: column;
    gap: 1rem;
  }

  .language-selector {
    width: 100%;
    min-width: 100%;
  }

  .swap-button {
    align-self: center;
    transform: rotate(90deg);
  }

  .swap-button:hover:not(:disabled) {
    transform: rotate(270deg);
  }
}

@media (max-width: 640px) {
  .lang-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .lang-button {
    justify-content: center;
  }
}
</style>
