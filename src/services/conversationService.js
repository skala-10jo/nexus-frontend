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
   * @param {number} currentStepIndex - 현재 스텝 인덱스 (0-based)
   * @returns {Promise} AI 응답, 감지된 용어, 스텝 완료 여부
   */
  async sendMessage(scenarioId, message, history = [], currentStepIndex = 0) {
    const response = await pythonAPI.post('/conversations/message', {
      scenarioId,
      message,
      history,
      currentStepIndex
    })
    return response.data
  },

  /**
   * 메시지 피드백 생성
   * @param {string} scenarioId - 시나리오 ID
   * @param {string} message - 사용자 메시지
   * @param {Array} detectedTerms - 감지된 전문용어
   * @param {string} audioData - Base64 인코딩된 오디오 데이터 (선택)
   * @returns {Promise} 피드백 (문법 교정, 용어 사용, 제안, 점수, 상세 발음 정보)
   */
  async getFeedback(scenarioId, message, detectedTerms = [], audioData = null) {
    const response = await pythonAPI.post('/conversations/feedback', {
      scenarioId,
      message,
      detectedTerms,
      audioData
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
  },

  /**
   * 메시지 번역 (시나리오 맥락 기반)
   * @param {string} scenarioId - 시나리오 ID (필수)
   * @param {string} message - 번역할 메시지
   * @param {string} sourceLanguage - 원본 언어 (기본값: "en")
   * @param {string} targetLanguage - 목표 언어 (기본값: "ko")
   * @returns {Promise} 번역된 텍스트
   */
  async translateMessage(scenarioId, message, sourceLanguage = 'en', targetLanguage = 'ko') {
    const response = await pythonAPI.post('/conversations/translate', {
      scenarioId,
      message,
      sourceLanguage,
      targetLanguage
    })
    return response.data
  },

  /**
   * 대화 초기화 - 해당 시나리오의 모든 세션 및 메시지 삭제
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise} 초기화 성공 메시지
   */
  async reset(scenarioId) {
    const response = await pythonAPI.post('/conversations/reset', {
      scenarioId
    })
    return response.data
  },

  /**
   * 저장된 대화 히스토리 조회
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise} 세션 정보 및 메시지 목록
   */
  async getHistory(scenarioId) {
    const response = await pythonAPI.get(`/conversations/history/${scenarioId}`)
    return response.data
  },

  /**
   * 대화 힌트 생성
   * 시나리오 맥락과 대화 히스토리를 기반으로 2단계 힌트 생성
   * @param {string} scenarioId - 시나리오 ID
   * @param {Array} history - 대화 히스토리
   * @param {string} lastAiMessage - 마지막 AI 메시지
   * @param {Object|null} currentStep - 현재 스텝 정보 { name, title, guide, terminology }
   * @returns {Promise} 2단계 힌트 (wordHints, fullSentence, explanation)
   */
  async getHint(scenarioId, history = [], lastAiMessage = '', currentStep = null) {
    const response = await pythonAPI.post('/conversations/hint', {
      scenarioId,
      history,
      lastAiMessage,
      currentStep
    })
    return response.data
  }
}

export default conversationService
