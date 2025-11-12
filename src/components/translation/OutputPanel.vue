<template>
  <div class="output-panel">
    <div class="panel-header">
      <h3 class="panel-title">번역 결과</h3>
      <div v-if="translationResult" class="quality-badges">
        <span
          v-if="translationResult.contextUsed"
          class="badge badge-success"
          title="프로젝트 컨텍스트 적용"
        >
          ✓ 컨텍스트 적용
        </span>
        <span
          v-if="translationResult.termsCount > 0"
          class="badge badge-info"
          title="탐지된 전문용어 개수"
        >
          📚 {{ translationResult.termsCount }}개 용어 탐지
        </span>
      </div>
    </div>

    <div class="output-wrapper">
      <div v-if="!translatedText && !isTranslating" class="empty-state">
        <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <p class="empty-text">번역 결과가 여기에 표시됩니다</p>
      </div>

      <div v-else-if="isTranslating" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">번역 중입니다...</p>
      </div>

      <div v-else class="translated-content">
        <TranslatedText
          :text="translatedText"
          :detected-terms="detectedTerms"
          @term-click="handleTermClick"
        />
      </div>
    </div>

    <DetectedTermsBar
      v-if="detectedTerms.length > 0"
      :terms="detectedTerms"
      @term-click="handleTermClick"
    />

    <div v-if="translatedText" class="action-bar">
      <button @click="copyToClipboard" class="btn btn-primary">
        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
        <span>{{ copied ? '복사됨!' : '복사' }}</span>
      </button>

      <button @click="exportTranslation" class="btn btn-ghost">
        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>내보내기</span>
      </button>
    </div>

    <!-- Term Detail Modal -->
    <TermDetailModal
      v-if="selectedTerm"
      :term="selectedTerm"
      @close="selectedTerm = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TranslatedText from './TranslatedText.vue'
import DetectedTermsBar from './DetectedTermsBar.vue'
import TermDetailModal from './TermDetailModal.vue'

const props = defineProps({
  translatedText: {
    type: String,
    default: ''
  },
  detectedTerms: {
    type: Array,
    default: () => []
  },
  translationResult: {
    type: Object,
    default: null
  },
  isTranslating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['copy', 'export'])

const copied = ref(false)
const selectedTerm = ref(null)

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.translatedText)
    copied.value = true
    emit('copy')

    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

function exportTranslation() {
  emit('export', {
    translatedText: props.translatedText,
    detectedTerms: props.detectedTerms
  })
}

function handleTermClick(term) {
  selectedTerm.value = term
}
</script>

<style scoped>
.output-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.quality-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  white-space: nowrap;
}

.badge-success {
  color: #065F46;
  background-color: #D1FAE5;
}

.badge-info {
  color: #1E40AF;
  background-color: #DBEAFE;
}

.output-wrapper {
  flex: 1;
  min-height: 300px;
  padding: 1rem;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.75rem;
  overflow-y: auto;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 250px;
}

.empty-icon {
  width: 4rem;
  height: 4rem;
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-text {
  color: #9CA3AF;
  font-size: 0.875rem;
  margin: 0;
}

.loading-spinner {
  width: 3rem;
  height: 3rem;
  border: 4px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #6B7280;
  font-size: 0.875rem;
  margin-top: 1rem;
}

.translated-content {
  font-family: 'Noto Sans KR', sans-serif;
  font-size: 1rem;
  line-height: 1.75;
  color: #111827;
}

.action-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  color: #FFFFFF;
  background-color: #2563EB;
}

.btn-primary:hover {
  background-color: #1D4ED8;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
}

.btn-ghost {
  color: #4B5563;
  background-color: transparent;
  border: 2px solid #E5E7EB;
}

.btn-ghost:hover {
  color: #2563EB;
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Responsive */
@media (max-width: 640px) {
  .action-bar {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
