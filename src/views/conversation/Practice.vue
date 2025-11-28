<template>
  <div class="practice-container">
    <!-- 메인 영역 -->
    <div class="main-area">
      <!-- 헤더 -->
      <div class="practice-header">
        <div class="scenario-info">
          <h1>{{ scenario?.title || '회화 연습' }}</h1>
          <p class="description">{{ scenario?.description }}</p>
          <div class="meta-info">
            <span class="badge">{{ scenario?.difficulty }}</span>
            <span class="badge">{{ scenario?.category }}</span>
            <span class="badge">{{ scenario?.language }}</span>
          </div>
        </div>
        <div class="header-actions">
          <button @click="resetConversation" class="btn-reset" :disabled="isLoading">대화 초기화</button>
          <button @click="endConversation" class="btn-end">대화 종료</button>
        </div>
      </div>

      <!-- 역할 정보 -->
    <div v-if="scenario" class="roles-info">
      <div class="role">
        <span class="role-label">나의 역할:</span>
        <span class="role-value">{{ scenario.roles?.user }}</span>
      </div>
      <div class="role">
        <span class="role-label">상대 역할:</span>
        <span class="role-value">{{ scenario.roles?.ai }}</span>
      </div>
    </div>

    <!-- 필수 용어 -->
    <div v-if="scenario?.required_terminology?.length" class="terminology-box">
      <h3>필수 용어</h3>
      <div class="terminology-list">
        <span
          v-for="term in scenario.required_terminology"
          :key="term"
          :class="['term', { 'used': detectedTerms.includes(term) }]"
        >
          {{ term }}
        </span>
      </div>
    </div>

    <!-- Avatar 비디오 영역 (Avatar 활성화 시에만 표시) -->
    <div v-if="avatarEnabled" class="avatar-video-container">
      <video
        ref="avatarVideoElement"
        class="avatar-video"
        autoplay
        playsinline
      ></video>
      <div class="avatar-status">
        <span class="avatar-indicator">● Avatar 활성화</span>
      </div>
    </div>

    <!-- 대화 영역 (Avatar 비활성화 시에만 표시) -->
    <div v-if="!avatarEnabled" class="conversation-area" ref="conversationArea">
      <div v-if="messages.length === 0" class="empty-state">
        대화를 시작하세요!
      </div>

      <div
        v-for="(message, index) in messages"
        :key="index"
        :class="['message', message.speaker]"
      >
        <div class="message-bubble">
          <div class="message-header">
            <span class="speaker-name">
              {{ message.speaker === 'user' ? (scenario?.roles?.user || '나') : (scenario?.roles?.ai || 'AI') }}
            </span>
            <button
              v-if="message.speaker === 'ai'"
              @click="toggleTranslation(index)"
              class="btn-translate"
              :disabled="translationLoading[index]"
              :title="message.showTranslation ? '원문 보기' : '한글 번역'"
            >
              {{ translationLoading[index] ? '...' : (message.showTranslation ? '🔄 원문' : '🌐 한글') }}
            </button>
          </div>
          <div class="message-content">
            {{ message.showTranslation ? (message.translatedText || message.message) : message.message }}
          </div>
          <div class="message-footer">
            <span class="timestamp">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- 로딩 인디케이터 -->
      <div v-if="isLoading" class="message ai">
        <div class="message-bubble">
          <div class="message-header">
            <span class="speaker-name">{{ scenario?.roles?.ai || 'AI' }}</span>
          </div>
          <div class="message-content loading">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 입력 영역 -->
    <div class="input-area">
      <!-- 모드 전환 버튼 -->
      <button
        @click="toggleInputMode"
        class="btn-mode-toggle"
        :disabled="isLoading || !scenario"
        :title="inputMode === 'text' ? '음성 입력으로 전환' : '텍스트 입력으로 전환'"
      >
        {{ inputMode === 'text' ? '🎤' : '⌨️' }}
      </button>

      <!-- Avatar 토글 버튼 (음성 입력 모드에서만 표시) -->
      <button
        v-if="inputMode === 'voice'"
        @click="toggleAvatar"
        :class="['btn-avatar-toggle', { active: avatarEnabled, initializing: isAvatarInitializing }]"
        :disabled="isLoading || !scenario || isAvatarInitializing"
        :title="avatarEnabled ? 'Avatar 비활성화' : 'Avatar 활성화'"
      >
        {{ isAvatarInitializing ? '⏳' : (avatarEnabled ? '🎭✓' : '🎭') }}
      </button>

      <!-- 텍스트 입력 모드 -->
      <textarea
        v-if="inputMode === 'text'"
        v-model="userInput"
        @keydown.enter.prevent="sendMessage"
        placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
        :disabled="isLoading || !scenario"
        rows="3"
      ></textarea>

      <!-- 음성 입력 모드 -->
      <div v-else class="voice-input-container">
        <button
          @click="isRecording ? stopRecording() : startRecording()"
          :class="['btn-record', { recording: isRecording, processing: isProcessingVoice }]"
          :disabled="isLoading || isProcessingVoice || !scenario"
        >
          <span v-if="!isRecording && !isProcessingVoice">🎤 {{ useRealtimeSTT ? '실시간 녹음' : '녹음 시작' }}</span>
          <span v-else-if="isRecording">⏹ 녹음 중지</span>
          <span v-else>⏳ 처리 중...</span>
        </button>

        <div v-if="isRecording" class="recording-indicator">
          <span class="recording-dot"></span>
          <span class="recording-time">{{ recordingTime }}초</span>
        </div>

        <!-- 실시간 STT 결과 표시 -->
        <div v-if="useRealtimeSTT && isRecording" class="realtime-stt-result">
          <!-- 확정된 텍스트들 (검정) -->
          <div v-for="(text, index) in finalTexts" :key="`final-${index}`" class="final-text">
            {{ text }}
          </div>

          <!-- 실시간 인식 중인 텍스트 (회색, 이탤릭) -->
          <div v-if="interimText" class="interim-text">
            {{ interimText }}
          </div>

          <div v-if="!interimText && finalTexts.length === 0" class="waiting-text">
            말씀하세요...
          </div>
        </div>

        <div v-if="recognizedText && !isRecording" class="recognized-text">
          <span class="label">인식된 텍스트:</span>
          <span class="text">{{ recognizedText }}</span>
        </div>

        <div v-if="isProcessingVoice" class="processing-indicator">
          음성 인식 중...
        </div>
      </div>

      <!-- 전송 버튼 -->
      <button
        @click="sendMessage"
        :disabled="!userInput.trim() || isLoading || !scenario || isRecording || isProcessingVoice"
        class="btn-send"
      >
        전송
      </button>
    </div>

      <!-- 에러 표시 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>

    <!-- 피드백 사이드바 -->
    <div class="feedback-sidebar">
      <div class="sidebar-header">
        <h2>📊 피드백</h2>
      </div>

      <!-- 탭 네비게이션 -->
      <div class="feedback-tabs">
        <button
          :class="['tab-button', { active: activeTab === 'messages' }]"
          @click="activeTab = 'messages'"
        >
          💬 대화별 피드백
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'comprehensive' }]"
          @click="activeTab = 'comprehensive'"
          :disabled="messages.length < 3"
        >
          📊 종합 피드백
        </button>
      </div>

      <!-- 대화별 피드백 탭 -->
      <div v-if="activeTab === 'messages'" class="feedback-content">
        <div v-if="userMessages.length === 0" class="empty-feedback">
          <p>💬 메시지를 보내면<br>각 대화별 피드백이 표시됩니다</p>
        </div>

        <div v-else class="message-feedbacks">
          <!-- 메시지 선택 버튼 (화살표 캐러셀) -->
          <div class="message-carousel">
            <button
              class="nav-arrow"
              @click="scrollMessages('left')"
              :disabled="scrollPosition <= 0"
            >
              ←
            </button>
            <div class="message-selector-container" ref="messageContainer">
              <div class="message-selector" :style="{ transform: `translateX(-${scrollPosition}px)` }">
                <button
                  v-for="(msg, index) in reversedUserMessages"
                  :key="index"
                  :class="['message-btn', { active: selectedMessageIndex === (userMessages.length - 1 - index) }]"
                  @click="selectMessage(userMessages.length - 1 - index)"
                >
                  <span class="message-number">{{ formatMessageTime(msg.timestamp) }}</span>
                  <span class="message-preview">{{ truncateMessage(msg.message) }}</span>
                </button>
              </div>
            </div>
            <button
              class="nav-arrow"
              @click="scrollMessages('right')"
              :disabled="scrollPosition >= maxScrollPosition"
            >
              →
            </button>
          </div>

          <!-- 선택된 메시지의 피드백 -->
          <div v-if="selectedMessageFeedback" class="selected-feedback">
            <div class="feedback-header">
              <h3>메시지 피드백</h3>
            </div>

            <!-- 원본 메시지 -->
            <div class="original-message">
              <h4>📝 나의 메시지</h4>
              <p>{{ userMessages[selectedMessageIndex].message }}</p>
            </div>

            <!-- 문법 교정 -->
            <div v-if="selectedMessageFeedback.grammar_corrections?.length" class="feedback-section">
              <h4>✏️ 문법 교정</h4>
              <ul class="correction-list">
                <li v-for="(correction, idx) in selectedMessageFeedback.grammar_corrections" :key="idx">
                  {{ correction }}
                </li>
              </ul>
            </div>

            <!-- 용어 사용 -->
            <div class="feedback-section">
              <h4>📚 용어 사용</h4>
              <div v-if="selectedMessageFeedback.terminology_usage?.used?.length" class="term-group">
                <p class="term-group-title">✅ 사용한 용어:</p>
                <div class="term-tags">
                  <span v-for="term in selectedMessageFeedback.terminology_usage.used" :key="term" class="term-tag success">
                    {{ term }}
                  </span>
                </div>
              </div>
              <div v-else class="term-group">
                <p class="term-group-title">⚠️ 전문용어 미사용</p>
              </div>
            </div>

            <!-- 개선 제안 -->
            <div v-if="selectedMessageFeedback.suggestions?.length" class="feedback-section">
              <h4>💡 개선 제안</h4>
              <ul class="suggestion-list">
                <li v-for="(suggestion, idx) in selectedMessageFeedback.suggestions" :key="idx">
                  {{ suggestion }}
                </li>
              </ul>
            </div>

            <!-- 점수 -->
            <div v-if="selectedMessageFeedback.score !== undefined" class="feedback-section">
              <h4>⭐ 점수</h4>
              <div class="score-badge" :class="getScoreClass(selectedMessageFeedback.score)">
                {{ selectedMessageFeedback.score }}/10
              </div>

              <!-- 점수 세부 정보 -->
              <div v-if="selectedMessageFeedback.score_breakdown" class="score-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">문법 (Grammar)</span>
                  <span class="breakdown-value">{{ selectedMessageFeedback.score_breakdown.grammar }}/10</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">어휘 (Vocabulary)</span>
                  <span class="breakdown-value">{{ selectedMessageFeedback.score_breakdown.vocabulary }}/10</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">유창성 (Fluency)</span>
                  <span class="breakdown-value">{{ selectedMessageFeedback.score_breakdown.fluency }}/10</span>
                </div>
                <div v-if="selectedMessageFeedback.score_breakdown.pronunciation !== undefined" class="breakdown-item">
                  <span class="breakdown-label">발음 (Pronunciation)</span>
                  <span class="breakdown-value">{{ selectedMessageFeedback.score_breakdown.pronunciation }}/10</span>
                </div>
              </div>

              <!-- 상세 발음 평가 (Azure 발음 평가 결과가 있는 경우) -->
              <div v-if="selectedMessageFeedback.pronunciation_details" class="pronunciation-details">
                <h4>🎤 상세 발음 분석 (Azure Pronunciation Assessment)</h4>

                <!-- 전체 발음 점수 (강조) -->
                <div class="overall-score-highlight">
                  <div class="overall-score-badge">
                    <span class="overall-score-label">발음 종합 점수</span>
                    <span class="overall-score-value">{{ selectedMessageFeedback.pronunciation_details.pronunciation_score.toFixed(1) }}</span>
                  </div>
                </div>

                <!-- 세부 점수들 -->
                <div class="pronunciation-scores">
                  <div class="score-badge">
                    <span class="score-label">정확도</span>
                    <span class="score-value">{{ selectedMessageFeedback.pronunciation_details.accuracy_score.toFixed(1) }}</span>
                  </div>
                  <div class="score-badge">
                    <span class="score-label">유창성</span>
                    <span class="score-value">{{ selectedMessageFeedback.pronunciation_details.fluency_score.toFixed(1) }}</span>
                  </div>
                  <div class="score-badge">
                    <span class="score-label">운율</span>
                    <span class="score-value">{{ selectedMessageFeedback.pronunciation_details.prosody_score.toFixed(1) }}</span>
                  </div>
                  <div class="score-badge">
                    <span class="score-label">완성도</span>
                    <span class="score-value">{{ selectedMessageFeedback.pronunciation_details.completeness_score.toFixed(1) }}</span>
                  </div>
                </div>

                <!-- 단어별 발음 분석 -->
                <div class="words-analysis">
                  <h5>단어별 분석</h5>
                  <div class="words-list">
                    <div
                      v-for="(word, idx) in selectedMessageFeedback.pronunciation_details.words"
                      :key="idx"
                      :class="[
                        'word-item',
                        getAccuracyClass(word.accuracy_score),
                        { 'prosody-issue': hasProsodyIssue(word) }
                      ]"
                    >
                      <div class="word-main">
                        <span class="word-text">{{ word.word }}</span>
                        <span class="word-score">{{ word.accuracy_score.toFixed(0) }}</span>
                        <span v-if="word.error_type !== 'None'" class="word-error">{{ word.error_type }}</span>
                        <!-- 운율 문제 표시 -->
                        <span v-if="hasProsodyIssue(word)" class="prosody-warning">⚠️ 운율</span>
                      </div>
                      <!-- Prosody 세부 정보 (있는 경우) -->
                      <div v-if="word.prosody && (word.prosody.break_score || word.prosody.intonation_score)" class="word-prosody">
                        <span v-if="word.prosody.break_score" :class="['prosody-detail', { 'low-score': word.prosody.break_score < 70 }]">
                          호흡: {{ word.prosody.break_score.toFixed(0) }}
                        </span>
                        <span v-if="word.prosody.intonation_score" :class="['prosody-detail', { 'low-score': word.prosody.intonation_score < 70 }]">
                          억양: {{ word.prosody.intonation_score.toFixed(0) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Prosody 문제가 있는 단어들 -->
                <div v-if="getProsodyIssues(selectedMessageFeedback.pronunciation_details.words).length > 0" class="prosody-issues">
                  <h5>운율 개선이 필요한 단어 (억양/호흡)</h5>
                  <div class="prosody-list">
                    <div
                      v-for="(issue, idx) in getProsodyIssues(selectedMessageFeedback.pronunciation_details.words)"
                      :key="idx"
                      class="prosody-item"
                    >
                      <span class="prosody-word">{{ issue.word }}</span>
                      <div class="prosody-scores">
                        <span v-if="issue.break_score" class="prosody-badge break">
                          <span class="prosody-label">호흡</span>
                          <span class="prosody-value">{{ issue.break_score.toFixed(0) }}</span>
                        </span>
                        <span v-if="issue.intonation_score" class="prosody-badge intonation">
                          <span class="prosody-label">억양</span>
                          <span class="prosody-value">{{ issue.intonation_score.toFixed(0) }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 문제 음소 표시 -->
                <div v-if="getProblemPhonemes(selectedMessageFeedback.pronunciation_details.words).length > 0" class="phonemes-issues">
                  <h5>개선이 필요한 소리 (음소)</h5>
                  <div class="phonemes-list">
                    <div
                      v-for="(wordGroup, idx) in getProblemPhonemes(selectedMessageFeedback.pronunciation_details.words)"
                      :key="idx"
                      class="phoneme-item"
                    >
                      <span class="phoneme-word">{{ wordGroup.word }}</span>
                      <div class="phoneme-sounds">
                        <span
                          v-for="(phoneme, pIdx) in wordGroup.phonemes"
                          :key="pIdx"
                          class="phoneme-sound-group"
                        >
                          <span class="phoneme-sound">/{{ phoneme.phoneme }}/</span>
                          <span class="phoneme-score">{{ phoneme.score.toFixed(0) }}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 종합 피드백 탭 -->
      <div v-if="activeTab === 'comprehensive'" class="feedback-content">
        <div v-if="!comprehensiveFeedback" class="loading-feedback">
          <p>종합 피드백을 생성중...</p>
        </div>

        <div v-else class="comprehensive-content">
          <!-- 종합 점수 -->
          <div class="score-grid">
            <div class="score-item">
              <div class="score-label">전체 점수</div>
              <div class="score-value">{{ comprehensiveFeedback.overall_score?.toFixed(1) || 0 }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">유창성</div>
              <div class="score-value">{{ comprehensiveFeedback.fluency_score?.toFixed(1) || 0 }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">정확성</div>
              <div class="score-value">{{ comprehensiveFeedback.accuracy_score?.toFixed(1) || 0 }}</div>
            </div>
          </div>

          <!-- 잘한 점 -->
          <div v-if="comprehensiveFeedback.strengths?.length" class="comprehensive-section">
            <h4>✨ 잘한 점</h4>
            <ul>
              <li v-for="(strength, idx) in comprehensiveFeedback.strengths" :key="idx">
                {{ strength }}
              </li>
            </ul>
          </div>

          <!-- 개선할 점 -->
          <div v-if="comprehensiveFeedback.areas_for_improvement?.length" class="comprehensive-section">
            <h4>🎯 개선할 점</h4>
            <ul>
              <li v-for="(area, idx) in comprehensiveFeedback.areas_for_improvement" :key="idx">
                {{ area }}
              </li>
            </ul>
          </div>

          <!-- 용어 커버리지 -->
          <div v-if="comprehensiveFeedback.terminology_coverage !== undefined" class="comprehensive-section">
            <h4>📚 전문용어 활용도</h4>
            <div class="progress-bar">
              <div
                class="progress-fill"
                :style="{ width: comprehensiveFeedback.terminology_coverage + '%' }"
              ></div>
            </div>
            <p class="progress-text">{{ comprehensiveFeedback.terminology_coverage.toFixed(0) }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conversationService from '@/services/conversationService'
import voiceRecorder from '@/services/voiceRecorder'
import voiceSTTService from '@/services/voiceSTTService'
import voiceSTTStreamService from '@/services/voiceSTTStreamService'
import voiceTTSService from '@/services/voiceTTSService'
import voiceAvatarService from '@/services/voiceAvatarService'

const route = useRoute()
const router = useRouter()

// 상태
const scenario = ref(null)
const messages = ref([])
const detectedTerms = ref([])
const userInput = ref('')
const isLoading = ref(false)
const error = ref(null)

// 번역 상태
const translationLoading = ref({})
const conversationArea = ref(null)

// 음성 입력 상태
const inputMode = ref('text') // 'text' | 'voice'
const isRecording = ref(false)
const isProcessingVoice = ref(false)
const recognizedText = ref('')
const recordingTime = ref(0)
const lastAudioBlob = ref(null) // 마지막 녹음된 오디오 (발음 평가용)
let recordingInterval = null

// 실시간 STT 상태
const useRealtimeSTT = ref(true) // 실시간 STT 사용 여부
const interimText = ref('') // 실시간 인식 중인 텍스트 (회색)
const finalTexts = ref([]) // 확정된 텍스트들 (검정)

// TTS 상태
const autoPlayTTS = ref(true) // AI 메시지 자동 재생 여부
const isTTSPlaying = ref(false) // 현재 TTS 재생 중 여부

// Avatar 상태
const avatarEnabled = ref(false) // Avatar 활성화 여부
const isAvatarInitializing = ref(false) // Avatar 초기화 중
const avatarVideoElement = ref(null) // Avatar 비디오 엘리먼트

// 피드백 상태
const activeTab = ref('messages') // 'messages' or 'comprehensive'
const comprehensiveFeedback = ref(null)

// 메시지별 피드백 상태
const selectedMessageIndex = ref(0)
const messageFeedbacks = ref([]) // 각 사용자 메시지에 대한 피드백 배열

// 캐러셀 스크롤 상태
const messageContainer = ref(null)
const scrollPosition = ref(0)
const maxScrollPosition = ref(0)

// 시나리오 ID
const scenarioId = route.params.scenarioId

// 사용자 메시지만 필터링 (원본 순서 유지)
const userMessages = computed(() =>
  messages.value.filter(msg => msg.speaker === 'user')
)

// 표시용 역순 메시지 (최신이 먼저)
const reversedUserMessages = computed(() =>
  [...userMessages.value].reverse()
)

// 선택된 메시지의 피드백
const selectedMessageFeedback = computed(() =>
  messageFeedbacks.value[selectedMessageIndex.value] || null
)

// 대화 시작 또는 기존 대화 불러오기
onMounted(async () => {
  try {
    isLoading.value = true

    // 1. 먼저 저장된 대화 히스토리 확인
    const historyResponse = await conversationService.getHistory(scenarioId)

    if (historyResponse.sessionId && historyResponse.messages?.length > 0) {
      // 2. 저장된 대화가 있으면 불러오기
      console.log('📥 Loading saved conversation:', historyResponse.messages.length, 'messages')

      // 시나리오 정보 가져오기 (start API는 기존 세션이 있으면 초기 메시지 생성 안 함)
      const startResponse = await conversationService.start(scenarioId)
      scenario.value = startResponse.scenario

      // 저장된 메시지 복원
      messages.value = historyResponse.messages.map(msg => ({
        speaker: msg.sender,
        message: msg.message,
        translatedText: msg.translatedText,
        timestamp: new Date(msg.createdAt),
        showTranslation: false
      }))

      // 사용된 용어 복원 및 피드백 복원
      historyResponse.messages.forEach(msg => {
        if (msg.detectedTerms?.length > 0) {
          detectedTerms.value = [...new Set([...detectedTerms.value, ...msg.detectedTerms])]
        }
        // 사용자 메시지의 피드백 복원
        if (msg.sender === 'user') {
          // 저장된 피드백이 있으면 사용, 없으면 기본값
          messageFeedbacks.value.push(msg.feedback ? JSON.parse(msg.feedback) : {
            score: 0,
            grammar_corrections: [],
            terminology_usage: { used: msg.detectedTerms || [] },
            suggestions: ['피드백이 저장되지 않았습니다.']
          })
        }
      })

      // 마지막 사용자 메시지 선택
      if (userMessages.value.length > 0) {
        selectedMessageIndex.value = userMessages.value.length - 1
      }

    } else {
      // 3. 저장된 대화가 없으면 새로 시작
      console.log('🆕 Starting new conversation')
      const response = await conversationService.start(scenarioId)

      scenario.value = response.scenario

      // 초기 AI 메시지가 있으면 추가
      if (response.initialMessage) {
        messages.value.push({
          speaker: 'ai',
          message: response.initialMessage,
          timestamp: new Date()
        })
      }
    }

    // 초기 스크롤 계산 및 스크롤 맨 아래로
    await nextTick()
    updateMaxScroll()
    scrollToBottom()
  } catch (err) {
    error.value = err.message || '대화를 시작할 수 없습니다.'
    console.error('Failed to start conversation:', err)
  } finally {
    isLoading.value = false
  }
})

// 메시지 전송
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const message = userInput.value.trim()
  userInput.value = ''

  try {
    isLoading.value = true
    error.value = null

    // 사용자 메시지 추가
    messages.value.push({
      speaker: 'user',
      message: message,
      timestamp: new Date()
    })

    // 사용자 메시지 추가 직후 스크롤
    await nextTick()
    scrollToBottom()

    // 대화 히스토리 준비 (마지막 메시지 제외)
    const history = messages.value.slice(0, -1).map(msg => ({
      speaker: msg.speaker,
      message: msg.message
    }))

    // AI 응답 요청
    const response = await conversationService.sendMessage(
      scenarioId,
      message,
      history
    )

    // AI 응답 추가
    messages.value.push({
      speaker: 'ai',
      message: response.aiMessage,
      timestamp: new Date()
    })

    // AI 응답이 추가되었으므로 로딩 종료
    isLoading.value = false

    // AI 응답 추가 직후 스크롤
    await nextTick()
    scrollToBottom()

    // AI 메시지 자동 TTS 재생 (Avatar 활성화 시 Avatar 사용)
    if (autoPlayTTS.value && response.aiMessage) {
      if (avatarEnabled.value) {
        playAvatarTTS(response.aiMessage)
      } else {
        playTTS(response.aiMessage)
      }
    }

    // 감지된 용어 업데이트
    if (response.detectedTerms) {
      detectedTerms.value = [...new Set([...detectedTerms.value, ...response.detectedTerms])]
    }

    // 실제 피드백 받아오기 (백그라운드에서 진행)
    try {
      // 오디오가 있으면 Base64로 변환
      let audioData = null
      if (lastAudioBlob.value) {
        console.log('🔄 Converting audio blob to base64...', lastAudioBlob.value.size, 'bytes')
        audioData = await blobToBase64(lastAudioBlob.value)
        console.log('✅ Base64 conversion completed, length:', audioData ? audioData.length : 0)
        // 사용 후 초기화
        lastAudioBlob.value = null
      } else {
        console.warn('⚠️ No audio blob available for pronunciation assessment')
      }

      console.log('📤 Sending feedback request with audioData:', audioData ? 'YES (' + audioData.length + ' chars)' : 'NO')

      const feedbackResponse = await conversationService.getFeedback(
        scenarioId,
        message,
        response.detectedTerms || [],
        audioData
      )

      console.log('📥 Feedback response received:', feedbackResponse)
      messageFeedbacks.value.push(feedbackResponse.feedback)
    } catch (feedbackError) {
      console.error('Failed to get feedback:', feedbackError)
      // 피드백 실패해도 대화는 계속 진행
      messageFeedbacks.value.push({
        score: 0,
        grammar_corrections: [],
        terminology_usage: { used: response.detectedTerms || [] },
        suggestions: ['피드백 생성에 실패했습니다.']
      })
    }

    // 항상 최신 메시지 선택 (원본 배열의 마지막 = 최신)
    selectedMessageIndex.value = userMessages.value.length - 1

  } catch (err) {
    error.value = err.message || '메시지 전송에 실패했습니다.'
    console.error('Failed to send message:', err)
    // 실패 시 사용자 메시지 제거
    messages.value.pop()
    isLoading.value = false
  }
}

// 대화 초기화
const resetConversation = async () => {
  if (!confirm('대화를 초기화하시겠습니까?\n모든 대화 내용과 피드백이 삭제됩니다.')) {
    return
  }

  try {
    isLoading.value = true

    // 1. 서버에서 대화 초기화 (세션 및 메시지 삭제)
    await conversationService.reset(scenarioId)

    // 2. 로컬 상태 초기화
    messages.value = []
    detectedTerms.value = []
    messageFeedbacks.value = []
    selectedMessageIndex.value = 0
    comprehensiveFeedback.value = null
    error.value = null

    // 3. 새 대화 시작 (초기 AI 메시지 생성)
    const response = await conversationService.start(scenarioId)
    scenario.value = response.scenario

    if (response.initialMessage) {
      messages.value.push({
        speaker: 'ai',
        message: response.initialMessage,
        timestamp: new Date()
      })
    }

    console.log('🔄 Conversation reset successfully')
  } catch (err) {
    error.value = err.message || '대화 초기화에 실패했습니다.'
    console.error('Failed to reset conversation:', err)
  } finally {
    isLoading.value = false
  }
}

const endConversation = () => {
  if (confirm('대화를 종료하시겠습니까?')) {
    // TTS 중지
    stopTTS()
    router.push('/conversation/scenario')
  }
}

// TTS 재생
const playTTS = async (text) => {
  if (!text || isTTSPlaying.value) return

  try {
    isTTSPlaying.value = true
    // 시나리오 언어에 맞게 TTS 재생
    const language = scenario.value?.language || 'en-US'
    await voiceTTSService.speak(text, language)
  } catch (err) {
    console.error('TTS 재생 실패:', err)
    // 에러가 발생해도 사용자에게 알림 없이 조용히 실패
  } finally {
    isTTSPlaying.value = false
  }
}

// TTS 중지
const stopTTS = async () => {
  try {
    await voiceTTSService.stop()
  } catch (err) {
    console.error('TTS 중지 실패:', err)
  }
  isTTSPlaying.value = false
}

// Avatar 토글
const toggleAvatar = async () => {
  if (avatarEnabled.value) {
    // Avatar 비활성화
    await stopAvatar()
    avatarEnabled.value = false
  } else {
    // Avatar 활성화
    try {
      isAvatarInitializing.value = true
      error.value = null

      // 먼저 avatarEnabled를 true로 설정하여 비디오 엘리먼트 렌더링
      avatarEnabled.value = true

      // DOM이 업데이트될 때까지 대기
      await nextTick()

      if (!avatarVideoElement.value) {
        throw new Error('Avatar 비디오 엘리먼트를 찾을 수 없습니다.')
      }

      const language = scenario.value?.language || 'en-US'
      await voiceAvatarService.initialize(
        avatarVideoElement.value,
        language
      )

      console.log('Avatar 활성화 완료 (배치 합성 방식)')

      // Avatar 초기화 후 환영 메시지 자동 재생
      const welcomeMessage = language === 'ko-KR'
        ? '안녕하세요! 대화를 시작해주세요.'
        : 'Hello! Please start the conversation.'

      await voiceAvatarService.speak(welcomeMessage)
      console.log('Avatar 환영 메시지 재생 완료')
    } catch (err) {
      error.value = err.message || 'Avatar 초기화 실패'
      console.error('Avatar 초기화 실패:', err)
      // 초기화 실패 시 다시 비활성화
      avatarEnabled.value = false
    } finally {
      isAvatarInitializing.value = false
    }
  }
}

// Avatar 중지
const stopAvatar = async () => {
  try {
    await voiceAvatarService.stop()
    console.log('Avatar 중지됨')
  } catch (err) {
    console.error('Avatar 중지 실패:', err)
  }
}

// Avatar로 TTS 재생 (비디오 포함)
const playAvatarTTS = async (text) => {
  if (!text || !avatarEnabled.value) return

  try {
    isTTSPlaying.value = true
    await voiceAvatarService.speak(text)
  } catch (err) {
    console.error('Avatar TTS 재생 실패:', err)
    // 실패하면 일반 TTS로 폴백
    await playTTS(text)
  } finally {
    isTTSPlaying.value = false
  }
}

// 입력 모드 전환
const toggleInputMode = async () => {
  if (inputMode.value === 'text') {
    // 브라우저 지원 확인
    if (!voiceRecorder.constructor.isSupported()) {
      error.value = '이 브라우저는 음성 녹음을 지원하지 않습니다.'
      return
    }
    inputMode.value = 'voice'
    recognizedText.value = ''
  } else {
    // 녹음 중이면 중지
    if (isRecording.value) {
      stopRecording()
    }
    // Avatar 활성화되어 있으면 중지
    if (avatarEnabled.value) {
      await stopAvatar()
      avatarEnabled.value = false
    }
    inputMode.value = 'text'
  }
}

// 녹음 시작
const startRecording = async () => {
  try {
    error.value = null
    recognizedText.value = ''
    recordingTime.value = 0

    // 실시간 STT 사용 여부에 따라 분기
    if (useRealtimeSTT.value) {
      // 실시간 스트리밍 STT
      await startRealtimeSTT()
    } else {
      // 기존 POST 방식 STT
      isRecording.value = true

      // 타이머 시작
      recordingInterval = setInterval(() => {
        recordingTime.value++
      }, 1000)

      // 녹음 시작
      await voiceRecorder.startRecording()
    }
  } catch (err) {
    error.value = err.message || '녹음 시작 실패'
    isRecording.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }
  }
}

// 녹음 중지 및 텍스트 변환
const stopRecording = async () => {
  try {
    // 실시간 STT 사용 여부에 따라 분기
    if (useRealtimeSTT.value) {
      // 실시간 스트리밍 STT 중지
      await stopRealtimeSTT()
    } else {
      // 기존 POST 방식 STT
      isRecording.value = false
      if (recordingInterval) {
        clearInterval(recordingInterval)
      }

      isProcessingVoice.value = true

      // 녹음 중지 및 Blob 가져오기
      const audioBlob = await voiceRecorder.stopRecording()

      // 발음 평가를 위해 오디오 저장
      lastAudioBlob.value = audioBlob

      // STT 처리
      const result = await voiceSTTService.transcribe(audioBlob, 'en-US')

      if (result.success && result.data.text) {
        recognizedText.value = result.data.text
        userInput.value = result.data.text
      } else {
        error.value = '음성 인식 실패'
      }

      isProcessingVoice.value = false
    }
  } catch (err) {
    error.value = err.message || '음성 처리 실패'
    isProcessingVoice.value = false
  }
}

// 실시간 STT 시작
const startRealtimeSTT = async () => {
  try {
    // 상태 초기화
    interimText.value = ''
    finalTexts.value = []
    isRecording.value = true

    // 타이머 시작
    recordingInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)

    // WebSocket 스트리밍 시작 (발음 평가용 녹음도 자동으로 시작됨)
    await voiceSTTStreamService.startStreaming({
      language: 'en-US',

      // Interim 결과 콜백 (실시간 인식 중)
      onInterim: (text) => {
        console.log('📝 Interim:', text)
        interimText.value = text
      },

      // Final 결과 콜백 (확정된 텍스트)
      onFinal: (text, confidence) => {
        console.log('✅ Final:', text, confidence)

        if (text && text.trim()) {
          // 확정된 텍스트 추가
          finalTexts.value.push(text.trim())

          // interim 초기화
          interimText.value = ''
        }
      },

      // 에러 콜백
      onError: (errorMessage) => {
        console.error('❌ STT Error:', errorMessage)
        error.value = errorMessage
        stopRealtimeSTT()
      },

      // 연결 종료 콜백
      onClose: () => {
        console.log('🔌 Connection closed')
        isRecording.value = false
        if (recordingInterval) {
          clearInterval(recordingInterval)
        }
      }
    })

    console.log('🎙️ Realtime STT started')

  } catch (err) {
    console.error('Realtime STT start failed:', err)
    error.value = err.message || '실시간 음성 인식 시작 실패'
    isRecording.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }
  }
}

// 실시간 STT 중지
const stopRealtimeSTT = async () => {
  try {
    console.log('⏹️ Stopping realtime STT...')

    isRecording.value = false
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }

    // WebSocket 스트리밍 중지 및 발음 평가용 오디오 Blob 받기
    const audioBlob = await voiceSTTStreamService.stopStreaming()

    if (audioBlob) {
      lastAudioBlob.value = audioBlob
      console.log('🎤 Audio saved for pronunciation assessment:', audioBlob.size, 'bytes')
    } else {
      console.warn('⚠️ No audio blob received from STT stream service')
    }

    // 확정된 텍스트들을 userInput에 결합
    const allText = finalTexts.value.join(' ')
    if (allText.trim()) {
      recognizedText.value = allText
      userInput.value = allText
    } else if (interimText.value.trim()) {
      // final이 없고 interim만 있으면 interim 사용
      recognizedText.value = interimText.value
      userInput.value = interimText.value
    }

    console.log('✅ Realtime STT stopped')

  } catch (err) {
    console.error('Realtime STT stop failed:', err)
    error.value = err.message || '실시간 음성 인식 중지 실패'
  }
}

// 컴포넌트 정리
onUnmounted(() => {
  // TTS 중지
  stopTTS()

  // Avatar 중지
  if (avatarEnabled.value) {
    stopAvatar()
  }

  if (isRecording.value) {
    if (useRealtimeSTT.value) {
      voiceSTTStreamService.stopStreaming()
    } else {
      voiceRecorder.cancel()
    }
  }
  if (recordingInterval) {
    clearInterval(recordingInterval)
  }
})

// Blob을 Base64로 변환
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      // data:audio/webm;base64, 부분 제거
      const base64String = reader.result.split(',')[1]
      resolve(base64String)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// 정확도 점수에 따른 CSS 클래스 반환
const getAccuracyClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'fair'
  if (score >= 60) return 'poor'
  return 'very-poor'
}

// 단어에 Prosody 문제가 있는지 확인
const hasProsodyIssue = (word) => {
  if (!word.prosody) return false
  const breakScore = word.prosody.break_score
  const intonationScore = word.prosody.intonation_score
  return (breakScore && breakScore < 70) || (intonationScore && intonationScore < 70)
}

// Prosody 문제가 있는 단어 추출 (호흡/억양 점수 70% 미만)
const getProsodyIssues = (words) => {
  const issues = []

  words.forEach(word => {
    if (word.prosody) {
      const breakScore = word.prosody.break_score
      const intonationScore = word.prosody.intonation_score

      // 호흡 또는 억양 점수가 70 미만이면 문제로 간주
      if ((breakScore && breakScore < 70) || (intonationScore && intonationScore < 70)) {
        issues.push({
          word: word.word,
          break_score: breakScore,
          intonation_score: intonationScore,
          minScore: Math.min(breakScore || 100, intonationScore || 100)
        })
      }
    }
  })

  // 점수가 낮은 순으로 정렬
  return issues.sort((a, b) => a.minScore - b.minScore)
}

// 문제가 있는 음소 추출 및 단어별로 묶기 (정확도 70% 미만)
const getProblemPhonemes = (words) => {
  const groupedProblems = {}

  words.forEach(word => {
    if (word.phonemes) {
      const problemPhonemes = word.phonemes.filter(phoneme => phoneme.accuracy_score < 70)

      if (problemPhonemes.length > 0) {
        if (!groupedProblems[word.word]) {
          groupedProblems[word.word] = {
            word: word.word,
            phonemes: [],
            minScore: 100
          }
        }

        problemPhonemes.forEach(phoneme => {
          groupedProblems[word.word].phonemes.push({
            phoneme: phoneme.phoneme,
            score: phoneme.accuracy_score
          })

          // 가장 낮은 점수 기록
          if (phoneme.accuracy_score < groupedProblems[word.word].minScore) {
            groupedProblems[word.word].minScore = phoneme.accuracy_score
          }
        })
      }
    }
  })

  // 객체를 배열로 변환하고 점수순으로 정렬
  return Object.values(groupedProblems).sort((a, b) => a.minScore - b.minScore)
}

// 시간 포맷
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 스크롤 맨 아래로
const scrollToBottom = () => {
  if (conversationArea.value) {
    conversationArea.value.scrollTop = conversationArea.value.scrollHeight
  }
}

// 메시지 선택
const selectMessage = (index) => {
  selectedMessageIndex.value = index
}

// 캐러셀 스크롤
const scrollMessages = (direction) => {
  const SCROLL_AMOUNT = 200 // 한 번에 이동할 픽셀

  if (direction === 'left') {
    scrollPosition.value = Math.max(0, scrollPosition.value - SCROLL_AMOUNT)
  } else {
    scrollPosition.value = Math.min(maxScrollPosition.value, scrollPosition.value + SCROLL_AMOUNT)
  }
}

// 최대 스크롤 위치 계산
const updateMaxScroll = () => {
  if (messageContainer.value) {
    const container = messageContainer.value
    const selector = container.querySelector('.message-selector')
    if (selector) {
      maxScrollPosition.value = Math.max(0, selector.scrollWidth - container.clientWidth)
    }
  }
}

// 메시지 추가 시 스크롤 업데이트
watch(userMessages, async () => {
  await nextTick()
  updateMaxScroll()
  // 최신 메시지로 스크롤 (맨 왼쪽)
  scrollPosition.value = 0
})

// 메시지 미리보기 (30자 제한)
const truncateMessage = (message) => {
  if (message.length <= 30) return message
  return message.substring(0, 30) + '...'
}

// 메시지 전송 시각 포맷팅 (HH:MM 형식)
const formatMessageTime = (timestamp) => {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

// 점수 클래스 결정
const getScoreClass = (score) => {
  if (score >= 8) return 'excellent'
  if (score >= 6) return 'good'
  if (score >= 4) return 'fair'
  return 'poor'
}

// 번역 토글
const toggleTranslation = async (messageIndex) => {
  const message = messages.value[messageIndex]

  // 이미 번역된 경우 토글
  if (message.translatedText) {
    message.showTranslation = !message.showTranslation
    return
  }

  // 번역 요청
  try {
    translationLoading.value[messageIndex] = true

    const response = await conversationService.translateMessage(
      message.message,
      'ko'
    )

    // 번역 결과 저장
    message.translatedText = response.translatedText
    message.showTranslation = true

  } catch (err) {
    console.error('Translation failed:', err)
    error.value = '번역에 실패했습니다.'
  } finally {
    translationLoading.value[messageIndex] = false
  }
}

// 종합 피드백 탭 전환 시 자동 로드
watch(activeTab, async (newTab) => {
  if (newTab === 'comprehensive' && !comprehensiveFeedback.value && messages.value.length >= 3) {
    await loadComprehensiveFeedback()
  }
})

// 종합 피드백 로드
const loadComprehensiveFeedback = async () => {
  comprehensiveFeedback.value = null

  try {
    // TODO: 백엔드 구현 후 실제 API 호출
    // const result = await conversationService.getComprehensiveFeedback(scenarioId, messages.value, detectedTerms.value)

    // 임시 더미 데이터
    setTimeout(() => {
      comprehensiveFeedback.value = {
        overall_score: 85.0,
        fluency_score: 82.5,
        accuracy_score: 87.0,
        completeness_score: 85.5,
        strengths: [
          '전문용어를 적절히 사용했습니다',
          '문장 구조가 전반적으로 정확합니다',
          '상황에 맞는 자연스러운 표현을 사용했습니다'
        ],
        areas_for_improvement: [
          '과거 시제 사용에 주의가 필요합니다',
          '좀 더 다양한 어휘를 사용해보세요',
          '문장 연결이 더 자연스러워질 수 있습니다'
        ],
        terminology_coverage: 80.0
      }
    }, 1500)
  } catch (err) {
    error.value = '종합 피드백 생성에 실패했습니다.'
    console.error('Failed to get comprehensive feedback:', err)
  }
}
</script>

<style scoped>
.practice-container {
  display: flex;
  gap: 20px;
  height: calc(100vh - 80px);
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

/* 헤더 */
.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.scenario-info h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
}

.description {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.meta-info {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 12px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
  text-transform: capitalize;
}

.btn-end {
  padding: 8px 16px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-end:hover {
  background: #c82333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-reset {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-reset:hover {
  background: #5a6268;
}

.btn-reset:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

/* 역할 정보 */
.roles-info {
  display: flex;
  gap: 20px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.role {
  display: flex;
  gap: 8px;
  align-items: center;
}

.role-label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.role-value {
  color: #333;
  font-size: 14px;
}

/* 필수 용어 */
.terminology-box {
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.terminology-box h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #333;
}

.terminology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.term {
  padding: 6px 12px;
  background: #e9ecef;
  border-radius: 16px;
  font-size: 13px;
  color: #495057;
  transition: all 0.2s;
}

.term.used {
  background: #28a745;
  color: white;
  font-weight: 500;
}

/* 대화 영역 */
.conversation-area {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
}

.message {
  display: flex;
  max-width: 70%;
  animation: fadeIn 0.3s;
}

.message.user {
  align-self: flex-end;
}

.message.ai {
  align-self: flex-start;
}

.message-bubble {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  border-radius: 12px;
  width: 100%;
}

.message.user .message-bubble {
  background: #007bff;
  color: white;
}

.message.ai .message-bubble {
  background: #f8f9fa;
  color: #333;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 6px;
}

.message.user .message-header {
  text-align: right;
  flex-direction: row-reverse;
}

.message.ai .message-header {
  text-align: left;
}

.speaker-name {
  font-weight: 600;
}

.btn-translate {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
  color: inherit;
  white-space: nowrap;
}

.message.ai .btn-translate {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  color: #666;
}

.btn-translate:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.1);
  border-color: rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
}

.btn-translate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.message-content {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 4px 0;
}

.message.user .message-content {
  text-align: right;
}

.message-footer {
  font-size: 11px;
  opacity: 0.7;
  margin-top: 4px;
}

.message.user .message-footer {
  text-align: right;
}

.message.ai .message-footer {
  text-align: left;
}

/* 로딩 애니메이션 */
.message-content.loading {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.dot {
  width: 8px;
  height: 8px;
  background: #999;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 입력 영역 */
.input-area {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

textarea {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: border-color 0.2s;
}

textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.btn-send {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background 0.2s;
  white-space: nowrap;
}

.btn-send:hover:not(:disabled) {
  background: #0056b3;
}

.btn-send:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 에러 메시지 */
.error-message {
  padding: 12px 16px;
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  font-size: 14px;
}

/* 스크롤바 스타일링 */
.conversation-area::-webkit-scrollbar {
  width: 8px;
}

.conversation-area::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.conversation-area::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.conversation-area::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 피드백 사이드바 */
.feedback-sidebar {
  width: 600px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.sidebar-header {
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 탭 네비게이션 */
.feedback-tabs {
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
}

.tab-button {
  flex: 1;
  padding: 14px 18px;
  background: transparent;
  border: none;
  font-size: 15px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
}

.tab-button:hover:not(:disabled) {
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.tab-button.active {
  color: #667eea;
  border-bottom-color: #667eea;
  background: white;
}

.tab-button:disabled {
  color: #ccc;
  cursor: not-allowed;
}

/* 대화별 피드백 탭 */
.feedback-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.message-feedbacks {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  overflow-y: auto;
}

/* 화살표 캐러셀 */
.message-carousel {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.nav-arrow {
  width: 40px;
  height: 40px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.nav-arrow:hover:not(:disabled) {
  background: #5568d3;
  transform: scale(1.05);
}

.nav-arrow:disabled {
  background: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
}

.message-selector-container {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.message-selector {
  display: flex;
  gap: 8px;
  transition: transform 0.3s ease;
}

.message-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px 16px;
  background: #f8f9fa;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  min-width: 180px;
  flex-shrink: 0;
}

.message-btn:hover {
  background: #e9ecef;
  border-color: #667eea;
}

.message-btn.active {
  background: #fff;
  border-color: #667eea;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.1);
}

.message-number {
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  margin-bottom: 6px;
}

.message-preview {
  font-size: 15px;
  color: #333;
  line-height: 1.5;
}

.selected-feedback {
  margin-top: 8px;
}

.feedback-header h3 {
  margin: 0 0 16px 0;
  font-size: 17px;
  font-weight: 600;
  color: #667eea;
  padding-bottom: 10px;
  border-bottom: 2px solid #e0e0e0;
}

.original-message {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.original-message h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
}

.original-message p {
  margin: 0;
  font-size: 15px;
  color: #333;
  line-height: 1.6;
}

.feedback-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 4px solid #e0e0e0;
  transition: all 0.2s ease;
}

.feedback-section:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transform: translateX(2px);
}

.feedback-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.correction-list,
.suggestion-list {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.correction-list li,
.suggestion-list li {
  margin-bottom: 12px;
  font-size: 14px;
  color: #555;
  position: relative;
  padding: 12px 12px 12px 28px;
  line-height: 1.6;
  background: white;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
}

.correction-list li {
  border-left: 3px solid #ffc107;
}

.suggestion-list li {
  border-left: 3px solid #17a2b8;
}

.correction-list li::before {
  content: "⚠️";
  position: absolute;
  left: 8px;
  font-size: 14px;
}

.suggestion-list li::before {
  content: "💡";
  position: absolute;
  left: 8px;
  font-size: 14px;
}

.score-badge {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 24px;
  font-size: 20px;
  font-weight: 700;
}

.score-badge.excellent {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 2px solid #28a745;
}

.score-badge.good {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  color: #0c5460;
  border: 2px solid #17a2b8;
}

.score-badge.fair {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  color: #856404;
  border: 2px solid #ffc107;
}

.score-badge.poor {
  background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
  color: #721c24;
  border: 2px solid #dc3545;
}

.score-breakdown {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 8px;
  background: white;
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.breakdown-label {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.breakdown-value {
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
}

.term-group {
  margin-bottom: 16px;
}

.term-group-title {
  margin: 0 0 10px 0;
  font-size: 14px;
  color: #555;
  font-weight: 600;
}

.term-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.term-tag {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.term-tag.success {
  background: #d4edda;
  color: #155724;
}

.term-tag.warning {
  background: #fff3cd;
  color: #856404;
}

.empty-feedback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
  line-height: 1.6;
}

.loading-feedback {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
}

/* 종합 피드백 탭 */
.comprehensive-content {
  padding: 16px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.score-item {
  text-align: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

.score-label {
  font-size: 12px;
  opacity: 0.9;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
}

.comprehensive-section {
  margin-bottom: 20px;
}

.comprehensive-section h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.comprehensive-section ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.comprehensive-section li {
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  position: relative;
  padding-left: 12px;
}

.comprehensive-section li::before {
  content: "•";
  position: absolute;
  left: 0;
  color: #667eea;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #e9ecef;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
}

.progress-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #667eea;
  text-align: center;
}

/* 음성 입력 UI */
.btn-mode-toggle {
  padding: 12px 16px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  min-width: 50px;
}

.btn-mode-toggle:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #007bff;
}

.btn-mode-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.voice-input-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-record {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-record:hover:not(:disabled) {
  background: #0056b3;
}

.btn-record.recording {
  background: #dc3545;
  animation: pulse 1.5s infinite;
}

.btn-record.recording:hover {
  background: #c82333;
}

.btn-record.processing {
  background: #6c757d;
}

.btn-record:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
}

.recording-dot {
  width: 12px;
  height: 12px;
  background: #dc3545;
  border-radius: 50%;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

.recording-time {
  font-variant-numeric: tabular-nums;
}

.recognized-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  background: white;
  border-radius: 4px;
  border: 1px solid #28a745;
}

.recognized-text .label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.recognized-text .text {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.processing-indicator {
  color: #666;
  font-size: 13px;
  text-align: center;
  animation: fadeInOut 1.5s infinite;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* 실시간 STT 결과 */
.realtime-stt-result {
  padding: 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-height: 60px;
  max-height: 150px;
  overflow-y: auto;
}

.realtime-stt-result .final-text {
  color: #000;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  line-height: 1.6;
}

.realtime-stt-result .interim-text {
  color: #666;
  font-size: 14px;
  font-style: italic;
  opacity: 0.8;
  line-height: 1.6;
}

.realtime-stt-result .waiting-text {
  color: #999;
  font-size: 13px;
  font-style: italic;
  text-align: center;
  padding: 20px 0;
}

/* Avatar UI */
.avatar-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.avatar-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  background: #000;
}

.avatar-status {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  padding: 6px 12px;
  border-radius: 20px;
}

.avatar-indicator {
  color: #4ade80;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-avatar-toggle {
  padding: 12px 16px;
  background: #8b5cf6;
  border: 2px solid #8b5cf6;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  min-width: 50px;
  color: white;
}

.btn-avatar-toggle:hover:not(:disabled) {
  background: #7c3aed;
  border-color: #7c3aed;
  transform: scale(1.05);
}

.btn-avatar-toggle.active {
  background: #4ade80;
  border-color: #4ade80;
  animation: avatarPulse 2s infinite;
}

.btn-avatar-toggle.initializing {
  background: #f59e0b;
  border-color: #f59e0b;
  animation: spin 1s linear infinite;
}

.btn-avatar-toggle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@keyframes avatarPulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.7);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(74, 222, 128, 0);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Pronunciation Details Styles */
.pronunciation-details {
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.pronunciation-details h4 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.pronunciation-details h5 {
  margin: 16px 0 12px 0;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
}

/* 전체 발음 점수 강조 영역 */
.overall-score-highlight {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.overall-score-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.overall-score-label {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.overall-score-value {
  font-size: 32px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.pronunciation-scores {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  min-width: 90px;
}

.score-badge .score-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.score-badge .score-value {
  font-size: 20px;
  font-weight: 700;
  color: #0ea5e9;
}

.words-analysis {
  margin-bottom: 20px;
}

.words-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.word-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  transition: all 0.2s;
}

/* 운율 문제가 있는 단어 강조 */
.word-item.prosody-issue {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(90deg, #fffbeb 0%, white 100%);
}

.word-main {
  display: flex;
  align-items: center;
  gap: 6px;
}

.word-prosody {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}

.prosody-detail {
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 3px;
}

.prosody-detail.low-score {
  background: #fee2e2;
  color: #dc2626;
  font-weight: 700;
}

.prosody-warning {
  font-size: 10px;
  padding: 2px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 3px;
  font-weight: 700;
  border: 1px solid #f59e0b;
}

.word-item.excellent {
  border-color: #10b981;
  background: #f0fdf4;
}

.word-item.good {
  border-color: #3b82f6;
  background: #eff6ff;
}

.word-item.fair {
  border-color: #f59e0b;
  background: #fffbeb;
}

.word-item.poor {
  border-color: #ef4444;
  background: #fef2f2;
}

.word-item.very-poor {
  border-color: #dc2626;
  background: #fef2f2;
}

.word-text {
  font-weight: 600;
  color: #1e293b;
}

.word-score {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 6px;
  background: #f1f5f9;
  border-radius: 4px;
  color: #64748b;
}

.word-error {
  font-size: 11px;
  padding: 2px 6px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
  font-weight: 600;
}

.phonemes-issues {
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.phonemes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phoneme-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #ef4444;
}

.phoneme-word {
  font-weight: 600;
  color: #1e293b;
  min-width: 80px;
  padding-top: 4px;
}

.phoneme-sounds {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
}

.phoneme-sound-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.phoneme-sound {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  padding: 4px 8px;
  background: #fef2f2;
  border-radius: 4px;
  color: #dc2626;
  font-weight: 600;
}

.phoneme-score {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 4px;
}

/* Prosody Issues 스타일 */
.prosody-issues {
  margin-bottom: 20px;
}

.prosody-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prosody-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: white;
  border-radius: 6px;
  border-left: 4px solid #f59e0b;
}

.prosody-word {
  font-weight: 600;
  color: #1e293b;
  min-width: 80px;
}

.prosody-scores {
  display: flex;
  gap: 8px;
  flex: 1;
}

.prosody-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 4px;
}

.prosody-badge.break {
  background: #fef3c7;
  border: 1px solid #fbbf24;
}

.prosody-badge.intonation {
  background: #ddd6fe;
  border: 1px solid #a78bfa;
}

.prosody-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.prosody-value {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
}

</style>
