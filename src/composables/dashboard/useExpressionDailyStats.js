import { ref, computed } from 'vue'
import expressionStatsService from '@/services/expressionStatsService'

/**
 * Expression 일별 통계 Composable
 * 대시보드 Performance 차트 데이터를 관리합니다.
 *
 * Composable 레이어: 비즈니스 로직 담당
 */
export function useExpressionDailyStats() {
  // State
  const dailyStats = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const days = ref(7)

  // Computed: 차트 데이터 변환
  const chartData = computed(() => {
    if (!dailyStats.value.length) return []

    const data = dailyStats.value.map(stat => {
      const correct = stat.correctCount || 0
      const incorrect = stat.incorrectCount || 0
      const total = correct + incorrect
      // 프론트엔드에서 직접 계산 (백엔드 값에 의존하지 않음)
      const accuracyRate = total > 0 ? Math.round(correct / total * 1000) / 10 : 0

      return {
        date: stat.date,
        label: formatDateLabel(stat.date),
        correctCount: correct,
        incorrectCount: incorrect,
        totalAttempts: total,
        accuracyRate: accuracyRate
      }
    })
    // Debug: 차트 데이터 확인
    console.log('[PerformanceChart] chartData:', data)
    return data
  })

  // Computed: 최대 정답 수 (y축 스케일링용)
  const maxCorrectCount = computed(() => {
    if (!chartData.value.length) return 10
    const max = Math.max(...chartData.value.map(d => d.correctCount))
    // Add 20% headroom to visually separate bars from the 100% accuracy line
    // e.g. if max is 10, axis becomes 12. 10/12 (83%) vs 100% accuracy.
    return Math.ceil(Math.max(max, 10) * 1.2)
  })

  // Computed: 총 학습 통계
  const totalStats = computed(() => {
    const total = chartData.value.reduce(
      (acc, curr) => ({
        correctCount: acc.correctCount + curr.correctCount,
        incorrectCount: acc.incorrectCount + curr.incorrectCount
      }),
      { correctCount: 0, incorrectCount: 0 }
    )

    const totalAttempts = total.correctCount + total.incorrectCount
    const accuracyRate = totalAttempts > 0
      ? Math.round(total.correctCount / totalAttempts * 1000) / 10
      : 0

    return {
      correctCount: total.correctCount,
      incorrectCount: total.incorrectCount,
      totalAttempts,
      accuracyRate
    }
  })

  /**
   * 날짜 레이블 포맷팅 (MM/DD)
   */
  function formatDateLabel(dateStr) {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}/${day}`
  }

  /**
   * 일별 통계 조회
   * @param {number} numDays - 조회할 일 수
   */
  async function fetchDailyStats(numDays = 7) {
    isLoading.value = true
    error.value = null
    days.value = numDays

    try {
      const response = await expressionStatsService.getDailyStats(numDays)
      dailyStats.value = response.data.data || []
      // Debug: API 응답 확인
      console.log('[PerformanceChart] API Response:', response.data.data)
    } catch (err) {
      console.error('Failed to fetch daily stats:', err)
      error.value = 'Failed to fetch daily stats'
      dailyStats.value = []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 새로고침
   */
  async function refresh() {
    await fetchDailyStats(days.value)
  }

  /**
   * 에러 초기화
   */
  function clearError() {
    error.value = null
  }

  return {
    // State
    dailyStats,
    isLoading,
    error,
    days,

    // Computed
    chartData,
    maxCorrectCount,
    totalStats,

    // Actions
    fetchDailyStats,
    refresh,
    clearError
  }
}
