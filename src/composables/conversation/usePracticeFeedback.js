/**
 * Practice 피드백 관리 Composable
 *
 * 회화 연습 페이지의 피드백 관리를 담당합니다.
 * - 대화별 피드백 관리
 * - 메시지 선택 및 탐색
 *
 * @module usePracticeFeedback
 */
import { ref, computed } from 'vue'

/**
 * Practice 피드백 로직
 *
 * @param {Object} options - 옵션
 * @param {Ref<Array>} options.userMessages - 사용자 메시지 ref
 * @returns {Object} 피드백 상태 및 메서드
 */
export function usePracticeFeedback({ userMessages }) {
  // ============================================
  // State
  // ============================================
  const selectedMessageIndex = ref(0)
  const messageFeedbacks = ref([])

  // ============================================
  // Computed
  // ============================================

  /**
   * 선택된 메시지의 피드백
   */
  const selectedMessageFeedback = computed(() =>
    messageFeedbacks.value[selectedMessageIndex.value] || null
  )

  /**
   * 총 사용자 메시지 수
   */
  const totalUserMessages = computed(() =>
    userMessages.value?.length || 0
  )

  // ============================================
  // Actions
  // ============================================

  /**
   * 메시지 선택
   *
   * @param {number} index - 메시지 인덱스
   */
  const selectMessage = (index) => {
    selectedMessageIndex.value = index
  }

  /**
   * 이전 메시지 선택
   */
  const selectPreviousMessage = () => {
    if (selectedMessageIndex.value > 0) {
      selectedMessageIndex.value--
    }
  }

  /**
   * 다음 메시지 선택
   */
  const selectNextMessage = () => {
    if (selectedMessageIndex.value < totalUserMessages.value - 1) {
      selectedMessageIndex.value++
    }
  }

  /**
   * 피드백 추가
   *
   * @param {Object} feedback - 피드백 데이터
   */
  const addFeedback = (feedback) => {
    messageFeedbacks.value.push(feedback)
    // 새 피드백 추가 시 최신 메시지 선택
    selectedMessageIndex.value = messageFeedbacks.value.length - 1
  }

  /**
   * 히스토리에서 피드백 로드
   *
   * @param {Array} messages - 메시지 배열
   */
  const loadFeedbacksFromHistory = (messages) => {
    messages.forEach(msg => {
      if (msg.sender === 'user') {
        messageFeedbacks.value.push(
          msg.feedback ? JSON.parse(msg.feedback) : {
            score: 0,
            grammar_corrections: [],
            terminology_usage: { used: msg.detectedTerms || [] },
            suggestions: ['No feedback saved.']
          }
        )
      }
    })

    // 마지막 메시지 선택
    if (messageFeedbacks.value.length > 0) {
      selectedMessageIndex.value = messageFeedbacks.value.length - 1
    }
  }

  /**
   * 피드백 초기화
   */
  const resetFeedbacks = () => {
    messageFeedbacks.value = []
    selectedMessageIndex.value = 0
  }

  /**
   * 메시지가 선택되었는지 확인
   *
   * @param {Object} message - 메시지 객체
   * @param {Ref<Array>} allUserMessages - 전체 사용자 메시지 배열
   * @returns {boolean} 선택 여부
   */
  const isMessageSelected = (message, allUserMessages) => {
    if (message.speaker !== 'user') return false
    const index = allUserMessages.value.findIndex(m => m === message)
    return index === selectedMessageIndex.value
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    selectedMessageIndex,
    messageFeedbacks,

    // Computed
    selectedMessageFeedback,
    totalUserMessages,

    // Actions
    selectMessage,
    selectPreviousMessage,
    selectNextMessage,
    addFeedback,
    loadFeedbacksFromHistory,
    resetFeedbacks,
    isMessageSelected
  }
}
