/**
 * Practice 대화 관리 Composable
 *
 * 회화 연습 페이지의 메시지 관리 및 대화 로직을 담당합니다.
 * - 메시지 송수신
 * - 번역 기능
 * - 용어 탐지
 * - 대화 초기화
 *
 * @module usePracticeConversation
 */
import { ref, computed, nextTick } from 'vue'
import conversationService from '@/services/conversationService'

/**
 * Practice 대화 로직
 *
 * @param {Object} options - 옵션
 * @param {Ref<Object>} options.scenario - 시나리오 ref
 * @param {Function} options.onFeedbackReceived - 피드백 수신 콜백
 * @returns {Object} 대화 상태 및 메서드
 */
export function usePracticeConversation({ scenario, onFeedbackReceived }) {
  // ============================================
  // State
  // ============================================
  const messages = ref([])
  const detectedTerms = ref([])
  const userInput = ref('')
  const isLoading = ref(false)
  const translationLoading = ref({})
  const conversationArea = ref(null)

  // ============================================
  // Computed
  // ============================================

  /**
   * 사용자 메시지만 필터링
   */
  const userMessages = computed(() =>
    messages.value.filter(msg => msg.speaker === 'user')
  )

  /**
   * 시나리오에서 필수 용어 추출
   */
  const requiredTerms = computed(() => {
    return scenario.value?.requiredTerms || []
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 메시지 전송
   *
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise<void>}
   */
  const sendMessage = async (scenarioId) => {
    if (!userInput.value.trim() || isLoading.value) return

    const message = userInput.value.trim()
    userInput.value = ''

    try {
      isLoading.value = true

      // 사용자 메시지 추가
      messages.value.push({
        speaker: 'user',
        message,
        timestamp: new Date()
      })

      await nextTick()
      scrollToBottom()

      // 대화 히스토리 구성
      const history = messages.value.slice(0, -1).map(msg => ({
        speaker: msg.speaker,
        message: msg.message
      }))

      // API 호출
      const response = await conversationService.sendMessage(scenarioId, message, history)

      // 용어 탐지 업데이트
      if (response.detectedTerms?.length) {
        detectedTerms.value = [...new Set([...detectedTerms.value, ...response.detectedTerms])]
      }

      // AI 응답 추가
      messages.value.push({
        speaker: 'ai',
        message: response.aiMessage,
        timestamp: new Date()
      })

      isLoading.value = false
      await nextTick()
      scrollToBottom()

      // 피드백 요청
      try {
        const feedbackResponse = await conversationService.getFeedback(
          scenarioId,
          message,
          response.detectedTerms || [],
          null
        )

        if (onFeedbackReceived) {
          onFeedbackReceived(feedbackResponse.feedback)
        }
      } catch (e) {
        // 피드백 실패 시 기본 피드백
        if (onFeedbackReceived) {
          onFeedbackReceived({
            score: 8,
            grammar_corrections: [],
            suggestions: ['Try using more formal language.'],
            score_breakdown: { grammar: 8, vocabulary: 7, fluency: 9 }
          })
        }
      }
    } catch (err) {
      console.error('Send message error:', err)
      messages.value.pop()
      isLoading.value = false
      throw err
    }
  }

  /**
   * 번역 토글
   *
   * @param {number} index - 메시지 인덱스
   */
  const toggleTranslation = async (index) => {
    const msg = messages.value[index]

    if (msg.showTranslation) {
      msg.showTranslation = false
      return
    }

    if (msg.translatedText) {
      msg.showTranslation = true
      return
    }

    translationLoading.value[index] = true

    try {
      const response = await conversationService.translateMessage(msg.message, 'ko')
      msg.translatedText = response.translatedText
      msg.showTranslation = true
    } catch (err) {
      console.error('Translation failed:', err)
      msg.translatedText = '[번역 실패] ' + msg.message
      msg.showTranslation = true
    } finally {
      translationLoading.value[index] = false
    }
  }

  /**
   * 대화 초기화 확인 및 실행
   *
   * @returns {Promise<void>}
   */
  const resetConversation = async () => {
    if (!confirm('Reset conversation?')) return

    messages.value = []
    detectedTerms.value = []
  }

  /**
   * 히스토리 데이터 로드
   *
   * @param {Object} historyResponse - 히스토리 응답
   */
  const loadHistory = (historyResponse) => {
    messages.value = historyResponse.messages.map(msg => ({
      speaker: msg.sender,
      message: msg.message,
      translatedText: msg.translatedText,
      timestamp: new Date(msg.createdAt),
      showTranslation: false
    }))

    historyResponse.messages.forEach(msg => {
      if (msg.detectedTerms?.length > 0) {
        detectedTerms.value = [...new Set([...detectedTerms.value, ...msg.detectedTerms])]
      }
    })
  }

  /**
   * 초기 AI 메시지 추가
   *
   * @param {string} initialMessage - 초기 메시지
   */
  const addInitialMessage = (initialMessage) => {
    if (initialMessage) {
      messages.value.push({
        speaker: 'ai',
        message: initialMessage,
        timestamp: new Date()
      })
    }
  }

  /**
   * 스크롤을 맨 아래로 이동
   */
  const scrollToBottom = () => {
    if (conversationArea.value) {
      conversationArea.value.scrollTop = conversationArea.value.scrollHeight
    }
  }

  /**
   * 시간 포맷팅
   *
   * @param {Date} date - 날짜
   * @returns {string} 포맷된 시간
   */
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    messages,
    detectedTerms,
    userInput,
    isLoading,
    translationLoading,
    conversationArea,

    // Computed
    userMessages,
    requiredTerms,

    // Actions
    sendMessage,
    toggleTranslation,
    resetConversation,
    loadHistory,
    addInitialMessage,
    scrollToBottom,
    formatTime
  }
}
