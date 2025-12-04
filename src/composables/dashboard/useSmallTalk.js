import { ref, computed } from 'vue'
import smallTalkService from '@/services/smallTalkService'

/**
 * Small Talk 상태 관리 Composable
 *
 * 대시보드 진입 시 자동으로 대화가 시작됩니다.
 * DB 없이 메모리 기반으로 동작하며, 페이지 새로고침 시 대화가 초기화됩니다.
 */
export function useSmallTalk() {
  // State
  const messages = ref([])
  const isLoading = ref(false)
  const isStarted = ref(false)
  const error = ref(null)

  // Feedback 관련 state
  const feedbacks = ref({}) // messageIndex -> feedback
  const feedbackLoading = ref(false)
  const selectedMessageIndex = ref(null)

  // Computed
  const userMessages = computed(() =>
    messages.value.filter(m => m.speaker === 'user')
  )

  const lastAiMessage = computed(() => {
    const aiMessages = messages.value.filter(m => m.speaker === 'ai')
    return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].message : ''
  })

  const selectedMessageFeedback = computed(() => {
    if (selectedMessageIndex.value === null) return null
    return feedbacks.value[selectedMessageIndex.value] || null
  })

  /**
   * 대화 시작 (대시보드 진입 시 자동 호출)
   */
  async function startConversation() {
    isLoading.value = true
    error.value = null

    try {
      const response = await smallTalkService.start()

      // 초기 AI 메시지 추가
      messages.value = [{
        speaker: 'ai',
        message: response.initial_message,
        timestamp: new Date()
      }]

      isStarted.value = true
    } catch (err) {
      console.error('Failed to start conversation:', err)
      error.value = 'Failed to start conversation'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 메시지 전송
   */
  async function sendMessage(text) {
    if (!text.trim() || isLoading.value) return

    isLoading.value = true
    error.value = null

    // 사용자 메시지 추가
    const userMessage = {
      speaker: 'user',
      message: text.trim(),
      timestamp: new Date()
    }
    messages.value.push(userMessage)

    try {
      // 히스토리 포맷 변환
      const history = messages.value.map(m => ({
        speaker: m.speaker,
        message: m.message
      }))

      const response = await smallTalkService.sendMessage(
        text.trim(),
        history.slice(0, -1) // 방금 추가한 메시지 제외
      )

      // AI 응답 추가
      messages.value.push({
        speaker: 'ai',
        message: response.ai_message,
        timestamp: new Date()
      })
    } catch (err) {
      console.error('Failed to send message:', err)
      error.value = 'Failed to send message'
      // 실패 시 사용자 메시지 제거
      messages.value.pop()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 피드백 요청
   */
  async function requestFeedback(messageIndex, audioData = null) {
    const userMsgs = userMessages.value
    if (messageIndex < 0 || messageIndex >= userMsgs.length) return

    // 이미 피드백이 있으면 바로 선택
    if (feedbacks.value[messageIndex]) {
      selectedMessageIndex.value = messageIndex
      return feedbacks.value[messageIndex]
    }

    feedbackLoading.value = true
    selectedMessageIndex.value = messageIndex

    try {
      const targetMessage = userMsgs[messageIndex]
      const history = messages.value.map(m => ({
        speaker: m.speaker,
        message: m.message
      }))

      const response = await smallTalkService.getFeedback(
        targetMessage.message,
        history,
        audioData
      )

      // 피드백 저장
      feedbacks.value[messageIndex] = response
      return response
    } catch (err) {
      console.error('Failed to get feedback:', err)
      error.value = 'Failed to get feedback'
      return null
    } finally {
      feedbackLoading.value = false
    }
  }

  /**
   * 메시지 선택 (피드백 보기)
   */
  function selectMessage(index) {
    selectedMessageIndex.value = index
    // 피드백이 없으면 요청
    if (!feedbacks.value[index]) {
      requestFeedback(index)
    }
  }

  /**
   * 힌트 요청
   */
  async function requestHint() {
    if (!lastAiMessage.value) return null

    try {
      const history = messages.value.map(m => ({
        speaker: m.speaker,
        message: m.message
      }))

      const response = await smallTalkService.getHint(
        history,
        lastAiMessage.value,
        3
      )

      return response
    } catch (err) {
      console.error('Failed to get hint:', err)
      return null
    }
  }

  /**
   * 대화 초기화
   */
  function resetConversation() {
    messages.value = []
    feedbacks.value = {}
    selectedMessageIndex.value = null
    isStarted.value = false
    error.value = null
  }

  /**
   * 에러 초기화
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    messages,
    isLoading,
    isStarted,
    error,
    feedbackLoading,
    selectedMessageIndex,

    // Computed
    userMessages,
    lastAiMessage,
    selectedMessageFeedback,

    // Actions
    startConversation,
    sendMessage,
    requestFeedback,
    selectMessage,
    requestHint,
    resetConversation,
    clearError
  }
}
