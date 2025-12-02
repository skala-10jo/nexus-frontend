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
        <!-- Terminology Section (Chat Mode only) -->
        <PracticeTerminology
          v-if="!voice.avatarEnabled.value"
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
          @toggle-translation="conversation.toggleTranslation"
          @message-click="handleMessageClick"
        />

        <!-- Input Area -->
        <PracticeInput
          :input-mode="voice.inputMode.value"
          :user-input="conversation.userInput.value"
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
          @update:user-input="conversation.userInput.value = $event"
          @toggle-input-mode="voice.toggleInputMode"
          @toggle-avatar="voice.toggleAvatar"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @send-message="handleSendMessage"
        />
      </main>

      <!-- Feedback Sidebar -->
      <FeedbackSidebar
        :active-tab="feedback.activeTab.value"
        :user-messages="conversation.userMessages.value"
        :selected-message-index="feedback.selectedMessageIndex.value"
        :selected-message-feedback="feedback.selectedMessageFeedback.value"
        :comprehensive-feedback="feedback.comprehensiveFeedback.value"
        @update:active-tab="feedback.activeTab.value = $event"
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
 *
 * @module Practice
 */
import { ref, onMounted, nextTick, computed } from 'vue'

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

// Feedback (needs userMessages ref, initialized first)
const feedback = usePracticeFeedback({
  userMessages: computed(() => conversation.userMessages.value)
})

// Conversation
const conversation = usePracticeConversation({
  scenario,
  onFeedbackReceived: (feedbackData) => {
    feedback.addFeedback(feedbackData)
  }
})

// Voice
const voice = usePracticeVoice({
  userInput: conversation.userInput,
  onSendMessage: () => handleSendMessage()
})

// Refs
const conversationAreaRef = ref(null)

// ============================================
// Event Handlers
// ============================================

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
 * 스크롤을 맨 아래로 이동
 */
const scrollToBottom = () => {
  if (conversationAreaRef.value?.$el) {
    const el = conversationAreaRef.value.$el
    el.scrollTop = el.scrollHeight
  }
}

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
      scrollToBottom()
    },
    // 새 대화 시작 콜백
    async (response) => {
      conversation.addInitialMessage(response.initialMessage)
      await nextTick()
      scrollToBottom()
    }
  )
})
</script>

<style scoped>
/* 스타일은 각 컴포넌트로 분리됨 */
</style>
