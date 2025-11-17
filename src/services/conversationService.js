import { pythonAPI } from './api'

/**
 * 회화 연습 관련 API 서비스
 */
const conversationService = {
  /**
   * 대화 시작
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise} 시나리오 정보 및 초기 메시지
   */
  async start(scenarioId) {
    const response = await pythonAPI.post('/conversations/start', {
      scenarioId
    })
    return response.data
  },

  /**
   * 메시지 전송 및 AI 응답 받기
   * @param {string} scenarioId - 시나리오 ID
   * @param {string} message - 사용자 메시지
   * @param {Array} history - 대화 히스토리
   * @returns {Promise} AI 응답 및 감지된 용어
   */
  async sendMessage(scenarioId, message, history = []) {
    const response = await pythonAPI.post('/conversations/message', {
      scenarioId,
      message,
      history
    })
    return response.data
  },

  /**
   * 메시지 피드백 생성
   * @param {string} scenarioId - 시나리오 ID
   * @param {string} message - 사용자 메시지
   * @param {Array} detectedTerms - 감지된 전문용어
   * @returns {Promise} 피드백 (문법 교정, 용어 사용, 제안, 점수)
   */
  async getFeedback(scenarioId, message, detectedTerms = []) {
    const response = await pythonAPI.post('/conversations/feedback', {
      scenarioId,
      message,
      detectedTerms
    })
    return response.data
  },

  /**
   * 대화 종료 (선택 사항)
   * @param {string} scenarioId - 시나리오 ID
   * @param {Array} history - 대화 히스토리
   * @returns {Promise} 종합 피드백
   */
  async end(scenarioId, history = []) {
    const response = await pythonAPI.post('/conversations/end', {
      scenarioId,
      history
    })
    return response.data
  }
}

export default conversationService
