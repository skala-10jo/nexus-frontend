<template>
  <div class="translation-card fade-in">
    <!-- Original Text Section -->
    <div class="card-section original">
      <div class="card-header">
        <span class="flag">{{ getFlag(detectedLang) }}</span>
        <span class="label">원본 ({{ getLangLabel(detectedLang) }})</span>
      </div>
      <p class="text">{{ original }}</p>
    </div>

    <!-- Translation Sections -->
    <div
      v-for="trans in translations"
      :key="trans.lang"
      class="card-section translation"
    >
      <div class="card-header">
        <span class="flag">{{ getFlag(trans.lang) }}</span>
        <span class="label">{{ getLangLabel(trans.lang) }}</span>
      </div>
      <p class="text">{{ trans.text }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  original: {
    type: String,
    required: true
  },
  detectedLang: {
    type: String,
    required: true
  },
  translations: {
    type: Array,
    default: () => []
  }
})

// Language configuration
const langMap = {
  'ko-KR': { flag: '🇰🇷', label: '한국어' },
  'en-US': { flag: '🇺🇸', label: 'English' },
  'ja-JP': { flag: '🇯🇵', label: '日本語' },
  'vi-VN': { flag: '🇻🇳', label: 'Tiếng Việt' }
}

function getFlag(lang) {
  return langMap[lang]?.flag || '🌐'
}

function getLangLabel(lang) {
  return langMap[lang]?.label || lang
}
</script>

<style scoped>
.translation-card {
  background: white;
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.translation-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-section {
  margin-bottom: 16px;
}

.card-section:last-child {
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.flag {
  font-size: 20px;
}

.label {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.text {
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  padding: 12px;
  background: #F9FAFB;
  border-radius: 8px;
  word-wrap: break-word;
}

.original .label {
  color: #3B82F6;
}

.original .text {
  font-weight: 600;
  color: #1F2937;
  background: #EFF6FF;
}

.translation .text {
  color: #374151;
  background: #F9FAFB;
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .translation-card {
    background: #1F2937;
    border-color: #374151;
  }

  .label {
    color: #9CA3AF;
  }

  .text {
    background: #111827;
    color: #E5E7EB;
  }

  .original .label {
    color: #60A5FA;
  }

  .original .text {
    background: #1E3A8A;
    color: #DBEAFE;
  }

  .translation .text {
    background: #111827;
    color: #D1D5DB;
  }
}
</style>
