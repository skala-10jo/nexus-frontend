<template>
  <div class="voice-translation-page">
    <h1 class="page-title">🎤 실시간 음성 번역</h1>
    <p class="page-subtitle">
      여러 명이 대화하는 음성을 실시간으로 여러 언어로 번역합니다
    </p>

    <!-- 언어 설정 -->
    <section class="language-settings card">
      <h2 class="section-title">언어 설정</h2>

      <div class="language-grid">
        <!-- 입력 언어 -->
        <div class="input-group">
          <label class="input-label">
            <span class="label-icon">🎤</span>
            입력 언어
          </label>
          <select
            v-model="inputLanguage"
            :disabled="isRecording"
            class="select-input"
          >
            <option
              v-for="lang in languageOptions"
              :key="lang.value"
              :value="lang.value"
            >
              {{ lang.label }}
            </option>
          </select>
        </div>

        <!-- 출력 언어 (복수 선택) -->
        <div class="input-group">
          <label class="input-label">
            <span class="label-icon">🌐</span>
            출력 언어 (복수 선택)
          </label>
          <div class="checkbox-group">
            <label
              v-for="lang in languageOptions"
              :key="lang.value"
              class="checkbox-label"
              :class="{ disabled: lang.value === inputLanguage || isRecording }"
            >
              <input
                type="checkbox"
                :value="lang.value"
                v-model="outputLanguages"
                :disabled="lang.value === inputLanguage || isRecording"
                class="checkbox-input"
              />
              <span>{{ lang.label }}</span>
            </label>
          </div>

          <p v-if="outputLanguages.length === 0" class="hint-text warning">
            ⚠️ 최소 1개 이상의 출력 언어를 선택하세요
          </p>
        </div>
      </div>
    </section>

    <!-- 녹음 컨트롤 -->
    <section class="recording-controls card">
      <h2 class="section-title">녹음</h2>

      <div class="control-container">
        <!-- 녹음 버튼 -->
        <button
          v-if="!isRecording"
          @click="handleStartRecording"
          :disabled="!canStartRecording"
          class="record-button start"
        >
          <span class="button-icon">🔴</span>
          녹음 시작
        </button>

        <button
          v-else
          @click="handleStopRecording"
          class="record-button stop"
        >
          <span class="button-icon">⏸️</span>
          녹음 중지
        </button>

        <!-- 연결 상태 -->
        <div v-if="isRecording" class="connection-status">
          <span
            :class="['status-dot', isConnected ? 'connected' : 'disconnected']"
          ></span>
          <span class="status-text">
            {{ isConnected ? 'WebSocket 연결됨' : 'WebSocket 연결 끊김' }}
          </span>
        </div>

        <!-- 음성 시각화 -->
        <AudioVisualizer
          v-if="isRecording"
          :audioLevel="audioLevel"
          class="visualizer"
        />

        <!-- 에러 메시지 -->
        <div v-if="recorderError || wsError" class="error-message">
          ⚠️ {{ recorderError || wsError }}
        </div>
      </div>
    </section>

    <!-- 번역 결과 -->
    <section class="translation-results card">
      <div class="results-header">
        <h2 class="section-title">번역 결과</h2>

        <div class="results-actions">
          <button
            v-if="translations.length > 0"
            @click="clearTranslations"
            class="clear-button"
          >
            🗑️ 전체 삭제
          </button>

          <button
            v-if="translations.length > 0"
            @click="exportTranslations"
            class="export-button"
          >
            💾 내보내기
          </button>
        </div>
      </div>

      <!-- 통계 정보 -->
      <div v-if="translations.length > 0" class="stats-bar">
        <div class="stat-item">
          <span class="stat-label">총 번역</span>
          <span class="stat-value">{{ translations.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">화자 수</span>
          <span class="stat-value">{{ uniqueSpeakerCount }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">경과 시간</span>
          <span class="stat-value">{{ elapsedTime }}</span>
        </div>
      </div>

      <!-- 번역 결과 리스트 -->
      <div
        v-if="translations.length > 0"
        ref="resultsContainer"
        class="results-list"
      >
        <TranslationResultCard
          v-for="translation in translations"
          :key="translation.id"
          :speakerId="translation.speakerId"
          :speakerConfidence="translation.speakerConfidence"
          :isNewSpeaker="translation.isNewSpeaker"
          :originalText="translation.originalText"
          :translations="translation.translations"
          :inputLanguage="inputLanguage"
          :timestamp="translation.timestamp"
          :sttConfidence="translation.sttConfidence"
        />
      </div>

      <!-- 빈 상태 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🎙️</div>
        <p class="empty-text">아직 번역된 내용이 없습니다</p>
        <p class="empty-hint">
          녹음을 시작하면 실시간으로 번역 결과가 표시됩니다
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import { useWebSocketTranslation } from '@/composables/useWebSocketTranslation'
import TranslationResultCard from '@/components/voice/TranslationResultCard.vue'
import AudioVisualizer from '@/components/voice/AudioVisualizer.vue'

// 상태
const inputLanguage = ref('ko')
const outputLanguages = ref(['en', 'vi'])
const translations = ref([])
const resultsContainer = ref(null)
const startTime = ref(null)
const elapsedTime = ref('00:00')

// 언어 옵션
const languageOptions = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: '영어' },
  { value: 'vi', label: '베트남어' }
]

// Composables
const {
  isRecording,
  audioLevel,
  error: recorderError,
  startRecording,
  stopRecording
} = useVoiceRecorder()

const {
  isConnected,
  lastError: wsError,
  connect,
  disconnect,
  sendInit,
  sendAudioChunk
} = useWebSocketTranslation({
  onTranslationResult: (result) => {
    // 새 번역 결과 추가
    translations.value.push({
      id: Date.now() + Math.random(),  // 고유 ID
      speakerId: result.speakerId,
      speakerConfidence: result.speakerConfidence,
      isNewSpeaker: result.isNewSpeaker,
      originalText: result.originalText,
      translations: result.translations,
      sttConfidence: result.sttConfidence,
      timestamp: new Date(result.timestamp)
    })

    // 자동 스크롤 (하단)
    nextTick(() => {
      if (resultsContainer.value) {
        resultsContainer.value.scrollTop = resultsContainer.value.scrollHeight
      }
    })
  }
})

// 계산된 값
const canStartRecording = computed(() => {
  return outputLanguages.value.length > 0
})

const uniqueSpeakerCount = computed(() => {
  const speakers = new Set(translations.value.map(t => t.speakerId))
  return speakers.size
})

// 녹음 시작
const handleStartRecording = async () => {
  try {
    // 1. WebSocket 연결
    await connect()

    // 2. 세션 초기화
    sendInit({
      inputLanguage: inputLanguage.value,
      outputLanguages: outputLanguages.value
    })

    // 3. 타이머 시작
    startTime.value = Date.now()
    updateElapsedTime()

    // 4. 녹음 시작
    await startRecording({
      onDataAvailable: async (audioBlob, audioEnergy, audioFormat) => {
        // 오디오 청크를 WebSocket으로 전송
        try {
          await sendAudioChunk({
            audioBlob,
            audioEnergy,
            audioFormat
          })
        } catch (err) {
          console.error('오디오 전송 실패:', err)
        }
      },
      timeslice: 2000  // 2초마다 청크 생성 (파일 무결성 보장)
    })

  } catch (err) {
    console.error('녹음 시작 실패:', err)
    alert('녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요.')
  }
}

// 녹음 중지
const handleStopRecording = async () => {
  await stopRecording()
  disconnect()
  startTime.value = null
}

// 번역 내역 삭제
const clearTranslations = () => {
  if (confirm('모든 번역 내역을 삭제하시겠습니까?')) {
    translations.value = []
  }
}

// 번역 내역 내보내기 (JSON)
const exportTranslations = () => {
  const data = {
    exportTime: new Date().toISOString(),
    inputLanguage: inputLanguage.value,
    outputLanguages: outputLanguages.value,
    totalTranslations: translations.value.length,
    uniqueSpeakers: uniqueSpeakerCount.value,
    translations: translations.value.map(t => ({
      speakerId: t.speakerId,
      timestamp: t.timestamp.toISOString(),
      originalText: t.originalText,
      translations: t.translations
    }))
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voice-translation-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// 경과 시간 업데이트
const updateElapsedTime = () => {
  if (!startTime.value) {
    elapsedTime.value = '00:00'
    return
  }

  const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  elapsedTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  if (isRecording.value) {
    setTimeout(updateElapsedTime, 1000)
  }
}

// 페이지 떠날 때 경고
const handleBeforeUnload = (e) => {
  if (isRecording.value) {
    e.preventDefault()
    e.returnValue = '녹음이 진행 중입니다. 페이지를 나가시겠습니까?'
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)

  if (isRecording.value) {
    handleStopRecording()
  }
})
</script>

<style scoped>
.voice-translation-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.page-subtitle {
  font-size: 1.1rem;
  color: #6B7280;
  text-align: center;
  margin-bottom: 2rem;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 1.5rem;
}

/* 언어 설정 */
.language-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.label-icon {
  font-size: 1.2rem;
}

.select-input {
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.select-input:focus {
  outline: none;
  border-color: #3B82F6;
}

.select-input:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
  cursor: pointer;
}

.checkbox-label:hover:not(.disabled) {
  background: #F3F4F6;
}

.checkbox-label.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.hint-text {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: #6B7280;
}

.hint-text.warning {
  color: #D97706;
}

/* 녹음 컨트롤 */
.control-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.record-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.record-button.start {
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
}

.record-button.start:hover:not(:disabled) {
  background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
}

.record-button.start:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
  box-shadow: none;
}

.record-button.stop {
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  color: white;
  animation: pulse 2s ease-in-out infinite;
}

.record-button.stop:hover {
  background: linear-gradient(135deg, #4B5563 0%, #374151 100%);
  transform: translateY(-2px);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  50% {
    box-shadow: 0 4px 20px rgba(107, 114, 128, 0.6);
  }
}

.button-icon {
  font-size: 1.5rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #F3F4F6;
  border-radius: 20px;
  font-size: 0.9rem;
  color: #374151;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: blink 1.5s ease-in-out infinite;
}

.status-dot.connected {
  background: #10B981;
}

.status-dot.disconnected {
  background: #EF4444;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.visualizer {
  width: 100%;
  max-width: 600px;
}

.error-message {
  padding: 1rem 1.5rem;
  background: #FEE2E2;
  border-left: 4px solid #EF4444;
  border-radius: 8px;
  color: #991B1B;
  font-size: 0.95rem;
}

/* 번역 결과 */
.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.results-actions {
  display: flex;
  gap: 0.75rem;
}

.clear-button,
.export-button {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-button {
  background: #FEE2E2;
  color: #DC2626;
}

.clear-button:hover {
  background: #FECACA;
}

.export-button {
  background: #DBEAFE;
  color: #2563EB;
}

.export-button:hover {
  background: #BFDBFE;
}

.stats-bar {
  display: flex;
  gap: 2rem;
  padding: 1rem;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: #6B7280;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.results-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.results-list::-webkit-scrollbar {
  width: 8px;
}

.results-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.results-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.results-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.2rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.empty-hint {
  font-size: 0.95rem;
  color: #9CA3AF;
}

/* 반응형 디자인 */
@media (max-width: 768px) {
  .voice-translation-page {
    padding: 1rem 0.5rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .card {
    padding: 1.5rem;
  }

  .language-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .record-button {
    padding: 1rem 2rem;
    font-size: 1rem;
  }

  .results-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-bar {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
