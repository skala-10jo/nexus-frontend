/**
 * Mistakes Service
 *
 * 오답노트 관련 API 통신 레이어
 * Composable에서 직접 API 호출 대신 이 서비스를 통해 통신
 */
import api from '@/services/api'

export const mistakesService = {
  /**
   * 오답 목록 조회
   * @returns {Promise} 오답 목록
   */
  getMistakes: () => api.get('/expressions/mistakes'),

  /**
   * 모든 오답 삭제
   * @returns {Promise}
   */
  deleteAllMistakes: () => api.delete('/expressions/quiz/results'),

  /**
   * 특정 오답 삭제
   * @param {number} expressionId - 표현 ID
   * @param {number} exampleIndex - 예문 인덱스
   * @returns {Promise}
   */
  deleteMistake: (expressionId, exampleIndex) =>
    api.delete(`/expressions/quiz/result/${expressionId}/${exampleIndex}`),

  /**
   * 퀴즈 결과 저장
   * @param {Object} data - { expressionId, exampleIndex, isCorrect }
   * @returns {Promise}
   */
  saveQuizResult: (data) => api.post('/expressions/quiz/result', data)
}

export default mistakesService
