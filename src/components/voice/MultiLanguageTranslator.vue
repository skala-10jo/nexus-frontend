<template>
  <div class="multi-language-translator">
    <!-- Header -->
    <div class="header">
      <h2 class="title">다국어 실시간 음성 번역</h2>
      <p class="subtitle">
        여러 언어를 선택하고 말하면 자동으로 감지하여 다른 언어로 번역합니다
      </p>
    </div>

    <!-- Language Multi-Select -->
    <div class="language-selector-container">
      <label class="selector-label">
        번역 언어 선택 (2개 이상 선택 필수)
      </label>
      <select
        v-model="selectedLanguages"
        multiple
        size="4"
        class="language-selector"
        :disabled="isRecording"
      >
        <option value="ko-KR">🇰🇷 한국어 (Korean)</option>
        <option value="en-US">🇺🇸 영어 (English)</option>
        <option value="ja-JP">🇯🇵 일본어 (Japanese)</option>
        <option value="vi-VN">🇻🇳 베트남어 (Vietnamese)</option>
      </select>
      <p class="hint">
        💡 <kbd>Ctrl</kbd> (Windows) 또는 <kbd>Cmd</kbd> (Mac) + 클릭으로 여러 언어 선택
      </p>
    </div>

    <!-- Recording Controls -->
    <div class="controls">
      <button
        @click="toggleRecording"
        :disabled="selectedLanguages.length < 2"
        :class="['record-btn', { recording: isRecording, disabled: selectedLanguages.length < 2 }]"
      >
        <span class="btn-icon">{{ isRecording ? '⏹️' : '🎤' }}</span>
        <span class="btn-text">{{ isRecording ? '녹음 중지' : '녹음 시작' }}</span>
      </button>

      <button
        v-if="translationCards.length > 0"
        @click="clearCards"
        class="clear-btn"
        :disabled="isRecording"
      >
        <span class="btn-icon">🗑️</span>
        <span class="btn-text">카드 초기화</span>
      </button>
    </div>

    <!-- Recognizing Text (중간 인식 결과) -->
    <div v-if="recognizingText" class="recognizing-text">
      <div class="recognizing-label">인식 중...</div>
      <div class="recognizing-content">{{ recognizingText }}</div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message">
      <span class="error-icon">⚠️</span>
      <span>{{ error }}</span>
    </div>

    <!-- Status Info -->
    <div class="status-info">
      <div class="status-item">
        <span class="status-label">상태:</span>
        <span :class="['status-badge', { active: isRecording }]">
          {{ isRecording ? '🔴 녹음 중' : '⚪ 대기 중' }}
        </span>
      </div>
      <div class="status-item">
        <span class="status-label">선택된 언어:</span>
        <span class="status-value">{{ selectedLanguages.length }}개</span>
      </div>
      <div class="status-item">
        <span class="status-label">번역 카드:</span>
        <span class="status-value">{{ translationCards.length }}개</span>
      </div>
    </div>

    <!-- Translation Cards (최신순) -->
    <div class="translation-cards-container">
      <div v-if="translationCards.length === 0 && !isRecording" class="empty-state">
        <div class="empty-icon">🎙️</div>
        <div class="empty-text">녹음 버튼을 눌러 시작하세요</div>
        <div class="empty-subtext">
          음성이 감지되면 자동으로 언어를 인식하고 번역합니다
        </div>
      </div>

      <TransitionGroup name="card-list" tag="div" class="cards-list">
        <TranslationCard
          v-for="card in translationCards"
          :key="card.id"
          :original="card.original"
          :detected-lang="card.detectedLang"
          :translations="card.translations"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAzureSTT } from '@/composables/useAzureSTT'
import TranslationCard from './TranslationCard.vue'

// 언어 선택
const selectedLanguages = ref(['ko-KR', 'en-US'])

// Azure STT Composable (백엔드 Agent 기반)
const {
  isRecording,
  isConnected,
  error,
  translationCards,
  recognizingText,
  startRecording,
  stopRecording,
  clearCards
} = useAzureSTT()

// 녹음 토글
async function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    try {
      await startRecording(selectedLanguages.value)
    } catch (err) {
      console.error('Recording failed:', err)
    }
  }
}
</script>

<style scoped>
.multi-language-translator {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 8px 0;
}

.subtitle {
  font-size: 15px;
  color: #6B7280;
  margin: 0;
}

/* Language Selector */
.language-selector-container {
  background: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.selector-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.language-selector {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  border: 2px solid #D1D5DB;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.language-selector:focus {
  outline: none;
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.language-selector:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.language-selector option {
  padding: 10px;
  cursor: pointer;
}

.language-selector option:checked {
  background: #3B82F6;
  color: white;
}

.hint {
  font-size: 13px;
  color: #6B7280;
  margin: 12px 0 0 0;
  text-align: center;
}

.hint kbd {
  background: #E5E7EB;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
}

/* Controls */
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.record-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-btn {
  background: #3B82F6;
  color: white;
}

.record-btn:hover:not(:disabled) {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.record-btn.recording {
  background: #EF4444;
  animation: pulse 2s infinite;
}

.record-btn.recording:hover {
  background: #DC2626;
}

.record-btn:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
  transform: none;
}

.clear-btn {
  background: #6B7280;
  color: white;
}

.clear-btn:hover:not(:disabled) {
  background: #4B5563;
}

.clear-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.btn-icon {
  font-size: 20px;
}

.btn-text {
  font-size: 15px;
}

/* Recognizing Text */
.recognizing-text {
  background: #EFF6FF;
  border: 2px solid #93C5FD;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
}

.recognizing-label {
  font-size: 12px;
  font-weight: 600;
  color: #3B82F6;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.recognizing-content {
  font-size: 16px;
  color: #1E40AF;
  font-weight: 500;
}

/* Error Message */
.error-message {
  background: #FEE2E2;
  border: 2px solid #FCA5A5;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #DC2626;
  font-weight: 500;
}

.error-icon {
  font-size: 20px;
}

/* Status Info */
.status-info {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px;
  background: #F9FAFB;
  border-radius: 10px;
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #1F2937;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  background: #E5E7EB;
  color: #6B7280;
}

.status-badge.active {
  background: #FEE2E2;
  color: #DC2626;
}

/* Translation Cards Container */
.translation-cards-container {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 14px;
  color: #6B7280;
}

.cards-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Card Transition */
.card-list-enter-active {
  transition: all 0.3s ease;
}

.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Responsive */
@media (max-width: 768px) {
  .multi-language-translator {
    padding: 16px;
  }

  .title {
    font-size: 24px;
  }

  .controls {
    flex-direction: column;
  }

  .record-btn, .clear-btn {
    width: 100%;
  }

  .status-info {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
