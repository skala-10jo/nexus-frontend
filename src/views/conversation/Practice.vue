<template>
  <div class="h-full w-full flex flex-col bg-gray-50">
    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 p-4 border-b border-red-200 text-red-700 flex items-center justify-between">
      <span>오류: {{ error }}</span>
      <button @click="clearError" class="text-red-500 hover:text-red-700">닫기</button>
    </div>

    <!-- Header -->
    <PracticeHeader
      :scenario="scenario"
      :is-loading="conversation.isLoading.value"
      @reset="handleReset"
      @end="endConversation"
    />

    <div class="flex-1 flex overflow-hidden">
      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col relative min-w-0 bg-gray-50 transition-all duration-300">
        <!-- Terminology Section (필수 용어 표시) -->
        <PracticeTerminology
          :required-terms="conversation.requiredTerms.value"
          :detected-terms="conversation.detectedTerms.value"
        />

        <!-- Conversation Area -->
        <PracticeConversation
          ref="conversationAreaRef"
          :messages="conversation.messages.value"
          :scenario="scenario"
          :is-loading="conversation.isLoading.value"
          :translation-loading="conversation.translationLoading.value"
          :hint-loading="conversation.hintLoading.value"
          :selected-message-index="feedback.selectedMessageIndex.value"
          :user-messages="conversation.userMessages.value"
          :avatar-enabled="voice.avatarEnabled.value"
          :stt-is-connecting="voice.isConnecting.value"
          :is-recording="voice.isRecording.value"
          :is-processing-voice="voice.isProcessingVoice.value"
          :recognized-text="voice.recognizedText.value"
          :recording-time="voice.recordingTime.value"
          :final-texts="voice.finalTexts.value"
          :interim-text="voice.interimText.value"
          :last-ai-message="conversation.lastAiMessage.value"
          :is-speaking="tts.isSpeaking.value"
          :speaking-message-index="tts.speakingMessageIndex.value"
          @toggle-translation="conversation.toggleTranslation"
          @toggle-hint="handleToggleHint"
          @message-click="handleMessageClick"
          @play-message="handlePlayMessage"
          @stop-message="tts.stopSpeaking"
        />

        <!-- Input Area -->
        <PracticeInput
          :input-mode="voice.inputMode.value"
          :user-input="sharedUserInput"
          :is-loading="conversation.isLoading.value"
          :is-recording="voice.isRecording.value"
          :stt-is-connecting="voice.isConnecting.value"
          :is-processing-voice="voice.isProcessingVoice.value"
          :recognized-text="voice.recognizedText.value"
          :recording-time="voice.recordingTime.value"
          :final-texts="voice.finalTexts.value"
          :interim-text="voice.interimText.value"
          :avatar-enabled="voice.avatarEnabled.value"
          :is-avatar-initializing="voice.isAvatarInitializing.value"
          @update:user-input="updateUserInput"
          @toggle-input-mode="voice.toggleInputMode"
          @toggle-avatar="voice.toggleAvatar"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @send-message="handleSendMessage"
          @input-area-resized="handleInputAreaResized"
        />
      </main>

      <!-- Feedback Sidebar -->
      <FeedbackSidebar
        :user-messages="conversation.userMessages.value"
        :selected-message-index="feedback.selectedMessageIndex.value"
        :selected-message-feedback="feedback.selectedMessageFeedback.value"
        @select-message="feedback.selectMessage"
      />
    </div>
  </div>
</template>

<script setup>
/**
 * Practice 페이지 - 회화 연습
 *
 * 리팩토링된 버전: Composables와 Components를 활용한 구조
 *
 * 구조:
 * - usePractice: 메인 오케스트레이션 (시나리오, 에러)
 * - usePracticeConversation: 대화 관리 (메시지, 번역)
 * - usePracticeVoice: 음성 입력 (STT, Avatar)
 * - usePracticeFeedback: 피드백 관리
 * - usePracticeTTS: AI 응답 음성 출력 (Azure TTS)
 *
 * @module Practice
 */
import { ref, onMounted, nextTick, computed, watch } from 'vue'

// Components
import PracticeHeader from '@/components/conversation/practice/PracticeHeader.vue'
import PracticeTerminology from '@/components/conversation/practice/PracticeTerminology.vue'
import PracticeConversation from '@/components/conversation/practice/PracticeConversation.vue'
import PracticeInput from '@/components/conversation/practice/PracticeInput.vue'
import FeedbackSidebar from '@/components/conversation/practice/FeedbackSidebar.vue'

// Composables
import { usePractice } from '@/composables/conversation/usePractice'
import { usePracticeConversation } from '@/composables/conversation/usePracticeConversation'
import { usePracticeVoice } from '@/composables/conversation/usePracticeVoice'
import { usePracticeFeedback } from '@/composables/conversation/usePracticeFeedback'
import { usePracticeTTS } from '@/composables/conversation/usePracticeTTS'

// ============================================
// Composables Initialization
// ============================================

// Main orchestration
const {
  scenario,
  isLoading: mainLoading,
  error,
  scenarioId,
  initializeScenario,
  endConversation,
  clearError
} = usePractice()

// 임시 userInput ref (voice와 conversation 연결용)
const sharedUserInput = ref('')

// Voice (초기화를 먼저 해야 getAudioBlob 사용 가능)
const voice = usePracticeVoice({
  userInput: sharedUserInput,
  onSendMessage: () => handleSendMessage(),
  scenario  // 시나리오 언어로 STT 수행
})

// Feedback placeholder (conversation 초기화 후 업데이트)
let feedbackAddFn = null

// Conversation (voice.lastAudioBlob 참조, sharedUserInput 공유)
const conversation = usePracticeConversation({
  scenario,
  userInput: sharedUserInput,  // 외부 userInput 전달
  onFeedbackReceived: (feedbackData) => {
    if (feedbackAddFn) {
      feedbackAddFn(feedbackData)
    }
  },
  // 음성 모드에서 발음 평가를 위한 오디오 blob 가져오기
  getAudioBlob: () => {
    const blob = voice.lastAudioBlob.value
    // 사용 후 초기화 (한 번만 사용)
    if (blob) {
      voice.lastAudioBlob.value = null
    }
    return blob
  }
})

// Feedback (conversation 초기화 후)
const feedback = usePracticeFeedback({
  userMessages: computed(() => conversation.userMessages.value)
})

// feedbackAddFn 연결
feedbackAddFn = feedback.addFeedback

// TTS (AI 응답 음성 출력)
const tts = usePracticeTTS({
  scenario
})

// Refs
const conversationAreaRef = ref(null)

// 초기 로드 완료 플래그 (히스토리 로드 시 TTS 방지)
const isInitialLoadComplete = ref(false)

// ============================================
// Event Handlers
// ============================================

/**
 * 사용자 입력 업데이트
 */
const updateUserInput = (value) => {
  sharedUserInput.value = value
}

/**
 * 메시지 전송 처리
 */
const handleSendMessage = async () => {
  try {
    await conversation.sendMessage(scenarioId)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    error.value = err.message || 'Failed to send message'
  }
}

/**
 * 메시지 클릭 처리
 */
const handleMessageClick = (message) => {
  const index = conversation.userMessages.value.findIndex(m => m === message)
  if (index !== -1) {
    feedback.selectMessage(index)
  }
}

/**
 * 녹음 시작 처리
 */
const handleStartRecording = async () => {
  try {
    await voice.startRecording()
  } catch (err) {
    error.value = err.message
  }
}

/**
 * 녹음 중지 처리
 */
const handleStopRecording = async () => {
  await voice.stopRecording()
}

/**
 * 대화 초기화 처리
 */
const handleReset = async () => {
  await conversation.resetConversation()
  feedback.resetFeedbacks()
}

/**
 * 힌트 토글 처리
 * @param {number} index - 메시지 인덱스
 */
const handleToggleHint = async (index) => {
  await conversation.toggleHint(index, scenarioId)
}

/**
 * AI 메시지 재생 처리
 * @param {string} text - 재생할 텍스트
 * @param {number} index - 메시지 인덱스
 */
const handlePlayMessage = async (text, index) => {
  try {
    await tts.speakAiResponse(text, index)
  } catch (err) {
    console.error('TTS playback failed:', err)
    error.value = 'TTS 재생에 실패했습니다.'
  }
}

/**
 * 스크롤을 맨 아래로 이동
 */
const scrollToBottom = () => {
  if (conversationAreaRef.value?.scrollToBottom) {
    conversationAreaRef.value.scrollToBottom()
  }
}

/**
 * 입력 영역 크기 변경 시 스크롤 조정
 * 녹음 시작 시 인식 텍스트 영역이 확장되면 대화 영역 스크롤
 */
const handleInputAreaResized = async () => {
  // DOM 업데이트 대기
  await nextTick()
  // 레이아웃 재계산 후 스크롤 (입력 영역 확장 반영)
  setTimeout(() => {
    scrollToBottom()
  }, 150)
}

// ============================================
// Watchers
// ============================================

/**
 * AI 응답 시 자동 TTS 재생
 * messages 배열의 마지막 항목이 AI 메시지일 때 자동 재생
 * 초기 히스토리 로드 시에는 TTS 재생하지 않음
 * 텍스트 입력 모드에서는 자동 TTS 재생하지 않음 (음성 모드에서만)
 */
watch(
  () => conversation.messages.value.length,
  async (newLength, oldLength) => {
    // 초기 로드가 완료되지 않았으면 TTS 재생하지 않음
    if (!isInitialLoadComplete.value) {
      return
    }

    // 텍스트 입력 모드에서는 자동 TTS 재생하지 않음
    if (voice.inputMode.value === 'text') {
      return
    }

    // 메시지가 추가되었고, 자동 재생이 활성화되어 있을 때
    if (newLength > oldLength && tts.autoPlayEnabled.value && tts.ttsEnabled.value) {
      const lastMessage = conversation.messages.value[newLength - 1]

      // 마지막 메시지가 AI 응답인 경우에만 재생
      if (lastMessage && lastMessage.speaker === 'ai') {
        // Avatar 모드가 아닐 때만 TTS 재생 (Avatar는 자체 음성 사용)
        if (!voice.avatarEnabled.value) {
          try {
            await tts.speakAiResponse(lastMessage.message, newLength - 1)
          } catch (err) {
            console.error('Auto TTS failed:', err)
          }
        }
      }
    }
  }
)

// ============================================
// Lifecycle
// ============================================

onMounted(async () => {
  await initializeScenario(
    // 히스토리 로드 콜백
    async (historyResponse) => {
      conversation.loadHistory(historyResponse)
      feedback.loadFeedbacksFromHistory(historyResponse.messages)
      await nextTick()
      // 초기 로드 시 애니메이션 없이 즉시 스크롤 (smooth = false)
      if (conversationAreaRef.value?.scrollToBottom) {
        conversationAreaRef.value.scrollToBottom(false)
      }
    },
    // 새 대화 시작 콜백
    async (response) => {
      conversation.addInitialMessage(response.initialMessage)
      await nextTick()
      // 초기 로드 시 애니메이션 없이 즉시 스크롤 (smooth = false)
      if (conversationAreaRef.value?.scrollToBottom) {
        conversationAreaRef.value.scrollToBottom(false)
      }
    }
  )

  // 초기 로드 완료 후 TTS 활성화 (히스토리 로드 시 TTS 방지)
  isInitialLoadComplete.value = true
})
</script>

<style scoped>
/* 스타일은 각 컴포넌트로 분리됨 */
</style>
