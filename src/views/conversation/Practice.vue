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
        <!-- Stepper Section (시나리오 진행 단계 표시) -->
        <PracticeStepper
          :steps="scenarioSteps"
          :current-step-index="currentStepIndex"
          :completed-step-indices="completedStepIndices"
          class="cursor-pointer"
          @click="showStepGuide = true"
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
          @increase-hint-level="handleIncreaseHintLevel"
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
          :stt-mode="voice.sttMode.value"
          @update:user-input="updateUserInput"
          @toggle-input-mode="voice.toggleInputMode"
          @toggle-avatar="voice.toggleAvatar"
          @toggle-s-t-t-mode="voice.toggleSTTMode"
          @start-recording="handleStartRecording"
          @stop-recording="handleStopRecording"
          @send-message="handleSendMessage"
          @input-area-resized="handleInputAreaResized"
        />
      </main>

      <!-- Mobile Backdrop -->
      <div 
        v-if="showMobileFeedback" 
        class="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
        @click="showMobileFeedback = false"
      ></div>

      <!-- Feedback Sidebar -->
      <FeedbackSidebar
        :user-messages="conversation.userMessages.value"
        :selected-message-index="feedback.selectedMessageIndex.value"
        :selected-message-feedback="feedback.selectedMessageFeedback.value"
        :is-mobile-open="showMobileFeedback"
        @select-message="feedback.selectMessage"
        @close="showMobileFeedback = false"
      />
    </div>

    <!-- Step Guide Modal -->
    <StepGuideModal
      v-if="showStepGuide"
      :steps="scenarioSteps"
      :scenario-title="scenario?.title"
      @close="showStepGuide = false"
    />
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
import PracticeStepper from '@/components/conversation/practice/PracticeStepper.vue'
import PracticeConversation from '@/components/conversation/practice/PracticeConversation.vue'
import PracticeInput from '@/components/conversation/practice/PracticeInput.vue'
import FeedbackSidebar from '@/components/conversation/practice/FeedbackSidebar.vue'
import StepGuideModal from '@/components/conversation/practice/StepGuideModal.vue'

// Composables
import { usePractice } from '@/composables/conversation/usePractice'
import { usePracticeConversation } from '@/composables/conversation/usePracticeConversation'
import { usePracticeVoice } from '@/composables/conversation/usePracticeVoice'
import { usePracticeFeedback } from '@/composables/conversation/usePracticeFeedback'
import { usePracticeTTS } from '@/composables/conversation/usePracticeTTS'

// Services
import conversationService from '@/services/conversationService'

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

// ============================================
// Stepper State (시나리오 단계 관리)
// 주의: usePracticeConversation보다 먼저 정의되어야 함
// ============================================

/**
 * 현재 진행 중인 스텝 인덱스 (0-based)
 * AI가 현재 스텝 완료를 판단하면 자동으로 증가
 */
const currentStepIndex = ref(0)

/**
 * 완료된 스텝 인덱스 배열
 * 마지막 스텝 완료 시에도 초록색 표시를 위해 사용
 */
const completedStepIndices = ref([])

/**
 * 시나리오 스텝 목록
 * 백엔드 scenario.steps에서 가져옴
 *
 * 백엔드 steps 스키마:
 * { name: string, title: string, guide: string, terminology: string[] }
 */
const scenarioSteps = computed(() => {
  if (scenario.value?.steps && scenario.value.steps.length > 0) {
    return scenario.value.steps.map((step, index) => ({
      id: step.name || `step-${index}`,
      title: step.title,
      description: step.guide,
      terminology: step.terminology || []
    }))
  }
  return []
})

/**
 * 스텝 완료 시 호출되는 핸들러
 * 다음 스텝으로 자동 진행
 */
const handleStepCompleted = () => {
  const totalSteps = scenarioSteps.value.length
  const completedIndex = currentStepIndex.value

  // 현재 스텝을 완료 목록에 추가
  if (!completedStepIndices.value.includes(completedIndex)) {
    completedStepIndices.value.push(completedIndex)
  }

  if (currentStepIndex.value < totalSteps - 1) {
    currentStepIndex.value++
    console.log(`📍 Step advanced to ${currentStepIndex.value + 1}/${totalSteps}`)
  } else {
    console.log('🎉 All steps completed!')
  }
}

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
  currentStepIndex,  // 스텝 인덱스 연동
  onStepCompleted: () => handleStepCompleted(),  // 스텝 완료 콜백
  onFeedbackReceived: (feedbackData) => {
    if (feedbackAddFn) {
      feedbackAddFn(feedbackData)
    }
  },
  // 음성 모드에서 발음 평가를 위한 오디오 blob 가져오기
  getAudioBlob: () => {
    const blob = voice.lastAudioBlob.value
    console.log('🔍 [DEBUG] getAudioBlob called, blob:', blob ? `${blob.size} bytes` : 'null')
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
const showStepGuide = ref(false)

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

// Mobile Feedback State
const showMobileFeedback = ref(false)

/**
 * 메시지 클릭 처리
 */
const handleMessageClick = (message) => {
  const index = conversation.userMessages.value.findIndex(m => m === message)
  if (index !== -1) {
    feedback.selectMessage(index)
    showMobileFeedback.value = true // 모바일에서 피드백 창 열기
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
 * 백엔드 세션을 삭제하고 새 대화를 시작하여 AI 초기 발화를 받아옵니다.
 */
const handleReset = async () => {
  if (!confirm('Reset conversation?')) return

  try {
    // 1. 백엔드 세션 삭제 (필수! - 이것이 없으면 start가 initialMessage를 반환하지 않음)
    await conversationService.reset(scenarioId)

    // 2. 프론트엔드 상태 초기화
    conversation.resetConversation()
    feedback.resetFeedbacks()
    currentStepIndex.value = 0  // 스텝도 처음으로 리셋
    completedStepIndices.value = []  // 완료 목록도 초기화

    // 3. 새 대화 시작하여 AI 초기 발화 받아오기
    const response = await conversationService.start(scenarioId)
    conversation.addInitialMessage(response.initialMessage)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to reset conversation:', err)
  }
}

/**
 * 힌트 토글 처리
 * @param {number} index - 메시지 인덱스
 */
const handleToggleHint = async (index) => {
  await conversation.toggleHint(index, scenarioId)
}

/**
 * 힌트 레벨 증가 처리 (2단계: 핵심 단어 → 전체 문장)
 * @param {number} index - 메시지 인덱스
 */
const handleIncreaseHintLevel = (index) => {
  conversation.increaseHintLevel(index)
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
 * TTS 재생 상태 동기화 (에코 방지)
 * TTS 재생 중에는 STT 인식 결과를 무시하여 스피커 에코 방지
 */
watch(
  () => tts.isSpeaking.value,
  (isSpeaking) => {
    voice.setTTSPlaying(isSpeaking)
  }
)

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
      // 새 대화 시작 시 Step Guide Modal 표시
      showStepGuide.value = true
    }
  )

  // 초기 로드 완료 후 TTS 활성화 (히스토리 로드 시 TTS 방지)
  isInitialLoadComplete.value = true
})
</script>

<style scoped>
/* 스타일은 각 컴포넌트로 분리됨 */
</style>
