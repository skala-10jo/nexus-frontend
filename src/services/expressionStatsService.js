import api from './api'

/**
 * Expression 통계 API 서비스
 * Service 레이어: API 호출만 담당
 */
const expressionStatsService = {
  /**
   * 일별 퀴즈 통계 조회
   * @param {number} days - 조회할 일 수 (기본값: 7)
   * @returns {Promise} API 응답
   */
  getDailyStats: (days = 7) => api.get('/expressions/quiz/daily-stats', { params: { days } })
}

export default expressionStatsService
