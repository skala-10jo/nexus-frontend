<template>
  <div class="text-cards">
    <!-- 원본 텍스트 -->
    <div class="text-card">
      <div class="card-header">
        <h3 class="card-title">원본 ({{ fromLanguageLabel }})</h3>
        <span v-if="fullOriginalText" class="text-length">{{ fullOriginalText.length }} 자</span>
      </div>
      <div class="card-content">
        <div v-if="isConnecting" class="loading-state">
          <div class="spinner"></div>
          <p>Azure Speech 연결 중...</p>
        </div>
        <div v-else-if="!fullOriginalText && !isRecognizing" class="empty-state">
          <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <p>녹음 버튼을 눌러 음성 인식을 시작하세요</p>
        </div>
        <div v-else class="text-content">
          <!-- Final 텍스트 -->
          <span v-if="finalText" class="final-text">{{ finalText }}</span>
          <!-- Partial 텍스트 -->
          <span v-if="partialText" class="partial-text">{{ partialText }}</span>
          <!-- 커서 -->
          <span v-if="isRecognizing && partialText" class="cursor">|</span>
        </div>
      </div>
    </div>

    <!-- 번역 텍스트 -->
    <div class="text-card">
      <div class="card-header">
        <h3 class="card-title">번역 ({{ toLanguageLabel }})</h3>
        <span v-if="fullTranslatedText" class="text-length">{{ fullTranslatedText.length }} 자</span>
      </div>
      <div class="card-content">
        <div v-if="isConnecting" class="loading-state">
          <div class="spinner"></div>
          <p>준비 중...</p>
        </div>
        <div v-else-if="!fullTranslatedText && !isRecognizing" class="empty-state">
          <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <p>번역된 텍스트가 여기에 표시됩니다</p>
        </div>
        <div v-else class="text-content">
          <!-- Final 번역 -->
          <span v-if="finalTranslation" class="final-text">{{ finalTranslation }}</span>
          <!-- Partial 번역 -->
          <span v-if="partialTranslation" class="partial-text">{{ partialTranslation }}</span>
          <!-- 커서 -->
          <span v-if="isRecognizing && partialTranslation" class="cursor">|</span>
        </div>
      </div>
    </div>
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
  fullOriginalText: {
    type: String,
    default: ''
  },
  fullTranslatedText: {
    type: String,
    default: ''
  },
  finalText: {
    type: String,
    default: ''
  },
  partialText: {
    type: String,
    default: ''
  },
  finalTranslation: {
    type: String,
    default: ''
  },
  partialTranslation: {
    type: String,
    default: ''
  },
  fromLanguageLabel: {
    type: String,
    required: true
  },
  toLanguageLabel: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* 텍스트 카드 */
.text-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.text-card {
  background: white;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  overflow: hidden;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #E9E9E7;
  background: #F7F6F3;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #37352F;
  margin: 0;
}

.text-length {
  font-size: 12px;
  color: #6B6B6B;
}

.card-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #6B6B6B;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E9E9E7;
  border-top-color: #0070F3;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #6B6B6B;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #D1D1CF;
}

/* 텍스트 컨텐츠 */
.text-content {
  font-size: 16px;
  line-height: 1.6;
  color: #37352F;
  white-space: pre-wrap;
  word-break: break-word;
}

.final-text {
  font-weight: 600;
}

.partial-text {
  color: #6B6B6B;
  font-style: italic;
}

.cursor {
  animation: blink 1s infinite;
  margin-left: 2px;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 반응형 */
@media (max-width: 1024px) {
  .text-cards {
    grid-template-columns: 1fr;
  }
}
</style>
