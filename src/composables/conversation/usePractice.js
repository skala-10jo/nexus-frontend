/**
 * Practice 페이지 메인 오케스트레이션 Composable
 *
 * 회화 연습 페이지의 전체 흐름을 관리합니다.
 * - 시나리오 로딩 및 상태 관리
 * - 라우팅 (종료)
 * - 전역 에러 처리
 *
 * @module usePractice
 */
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conversationService from '@/services/conversationService'

/**
 * Practice 페이지 메인 로직
 *
 * @returns {Object} Practice 페이지 상태 및 메서드
 */
export function usePractice() {
  const route = useRoute()
  const router = useRouter()

  // ============================================
  // State
  // ============================================
  const scenario = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Route params
  const scenarioId = route.params.scenarioId

  // ============================================
  // Actions
  // ============================================

  /**
   * 시나리오 초기화
   * @param {Function} onHistoryLoaded - 히스토리 로드 시 콜백
   * @param {Function} onNewConversation - 새 대화 시작 시 콜백
   */
  const initializeScenario = async (onHistoryLoaded, onNewConversation) => {
    if (!scenarioId) {
      error.value = 'Scenario ID is missing'
      return
    }

    try {
      isLoading.value = true
      error.value = null

      // 기존 대화 히스토리 확인
      const historyResponse = await conversationService.getHistory(scenarioId)

      if (historyResponse.sessionId && historyResponse.messages?.length > 0) {
        // 기존 대화가 있는 경우
        const startResponse = await conversationService.start(scenarioId)
        scenario.value = startResponse.scenario

        if (onHistoryLoaded) {
          await onHistoryLoaded(historyResponse)
        }
      } else {
        // 새 대화 시작
        const response = await conversationService.start(scenarioId)
        scenario.value = response.scenario

        if (onNewConversation) {
          await onNewConversation(response)
        }
      }
    } catch (err) {
      error.value = err.message || 'Failed to start conversation.'
      console.error('Practice initialization error:', err)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 대화 종료 및 시나리오 목록으로 이동
   */
  const endConversation = () => {
    router.push('/conversation/scenario')
  }

  /**
   * 에러 상태 초기화
   */
  const clearError = () => {
    error.value = null
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    scenario,
    isLoading,
    error,
    scenarioId,

    // Actions
    initializeScenario,
    endConversation,
    clearError
  }
}
