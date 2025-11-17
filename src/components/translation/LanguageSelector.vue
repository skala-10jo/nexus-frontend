<template>
  <div class="language-selector">
    <h3 class="selector-title">
      <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </svg>
      자막 언어 선택
    </h3>

    <div class="language-buttons">
      <button
        v-for="lang in availableLanguages"
        :key="lang"
        class="lang-btn"
        :class="{ active: lang === currentLanguage }"
        @click="selectLanguage(lang)"
      >
        <svg v-if="lang === currentLanguage" class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="lang-name">{{ getLanguageName(lang) }}</span>
        <span class="lang-code">{{ lang.toUpperCase() }}</span>
      </button>

      <!-- Slot for additional buttons (e.g., Add Language) -->
      <slot name="add-language"></slot>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(['language-change'])

const props = defineProps({
  availableLanguages: {
    type: Array,
    required: true,
    default: () => []
  },
  currentLanguage: {
    type: String,
    required: true
  }
})

const languageNames = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  vi: 'Tiếng Việt',
  zh: '中文'
}

function getLanguageName(code) {
  return languageNames[code] || code
}

function selectLanguage(lang) {
  if (lang !== props.currentLanguage) {
    emit('language-change', lang)
  }
}
</script>

<style scoped>
.language-selector {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.selector-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1rem 0;
}

.title-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #2563EB;
}

.language-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.lang-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #6B7280;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.lang-btn:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
  color: #2563EB;
}

.lang-btn.active {
  border-color: #2563EB;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: #FFFFFF;
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.25);
}

.check-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.lang-name {
  flex: 1;
  text-align: left;
}

.lang-code {
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.8;
}

.lang-btn.active .lang-code {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .language-buttons {
    flex-direction: column;
  }

  .lang-btn {
    width: 100%;
    min-width: auto;
  }
}
</style>
