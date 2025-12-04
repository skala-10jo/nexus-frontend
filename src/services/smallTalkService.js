import { pythonAPI } from './api'

/**
 * Small Talk 관련 API 서비스
 * 대시보드 스몰토크 대화 (DB 없이 메모리 기반)
 */
const smallTalkService = {
  /**
   * 대화 시작
   * @returns {Promise} 초기 AI 인사 메시지
   */
  async start() {
    const response = await pythonAPI.post('/small-talk/start')
    return response.data
  },

  /**
   * 메시지 전송 및 AI 응답 받기
   * @param {string} message - 사용자 메시지
   * @param {Array} history - 대화 히스토리
   * @returns {Promise} AI 응답
   */
  async sendMessage(message, history = []) {
    const response = await pythonAPI.post('/small-talk/message', {
      message,
      history
    })
    return response.data
  },

  /**
   * 메시지 피드백 생성
   * @param {string} message - 사용자 메시지
   * @param {Array} history - 대화 히스토리 (맥락 파악용)
   * @param {string} audioData - Base64 인코딩된 오디오 데이터 (선택)
   * @returns {Promise} 피드백 (문법 교정, 제안, 점수 등)
   */
  async getFeedback(message, history = [], audioData = null) {
    const response = await pythonAPI.post('/small-talk/feedback', {
      message,
      history,
      audio_data: audioData
    })
    return response.data
  },

  /**
   * 응답 힌트 생성
   * @param {Array} history - 대화 히스토리
   * @param {string} lastAiMessage - 마지막 AI 메시지
   * @param {number} hintCount - 생성할 힌트 개수 (기본값: 3)
   * @returns {Promise} 힌트 목록과 설명
   */
  async getHint(history = [], lastAiMessage = '', hintCount = 3) {
    const response = await pythonAPI.post('/small-talk/hint', {
      history,
      last_ai_message: lastAiMessage,
      hint_count: hintCount
    })
    return response.data
  }
}

export default smallTalkService
