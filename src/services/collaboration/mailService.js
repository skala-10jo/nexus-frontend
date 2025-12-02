import api from '@/services/api'

const PYTHON_API_URL = 'http://localhost:8000'

/**
 * Mail API Service
 * Outlook 메일 관련 API 호출을 담당
 */
export const mailService = {
  // ============================================
  // Auth
  // ============================================

  /**
   * Outlook 인증 상태 확인
   */
  getAuthStatus() {
    return api.get('/outlook/auth/status')
  },

  /**
   * Outlook 인증 시작 (Device Code Flow)
   */
  initiateAuth() {
    return api.post('/outlook/auth/initiate')
  },

  /**
   * Outlook 연결 해제
   */
  disconnect() {
    return api.post('/outlook/auth/disconnect')
  },

  // ============================================
  // Sync
  // ============================================

  /**
   * 메일 동기화
   */
  syncMails() {
    return api.post('/outlook/sync')
  },

  // ============================================
  // Emails
  // ============================================

  /**
   * 메일 목록 조회
   */
  getEmails(params = {}) {
    return api.get('/emails', { params })
  },

  /**
   * 메일 검색
   */
  searchEmails(params = {}) {
    return api.get('/emails/search', { params })
  },

  /**
   * 메일 상세 조회
   */
  getEmail(id) {
    return api.get(`/emails/${id}`)
  },

  /**
   * 읽지 않은 메일 수 조회
   */
  getUnreadCount() {
    return api.get('/emails/unread/count')
  },

  /**
   * 메일 읽음 상태 변경
   */
  updateReadStatus(id, isRead) {
    return api.put(`/emails/${id}/read`, { isRead })
  },

  /**
   * 메일에 프로젝트 할당
   */
  assignProject(id, projectId) {
    return api.put(`/emails/${id}/project`, { projectId })
  },

  /**
   * 메일 삭제
   */
  deleteEmail(id) {
    return api.delete(`/emails/${id}`)
  },

  /**
   * 메일 발송
   */
  sendEmail(data) {
    return api.post('/emails/send', data)
  },

  // ============================================
  // Projects
  // ============================================

  /**
   * 프로젝트 목록 조회
   */
  getProjects() {
    return api.get('/projects')
  },

  // ============================================
  // AI (Python Backend)
  // ============================================

  /**
   * AI 채팅 요청
   */
  async chat(message, userId, conversationHistory) {
    const response = await fetch(`${PYTHON_API_URL}/api/ai/mail/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id: userId,
        conversation_history: conversationHistory
      })
    })
    return response.json()
  },

  /**
   * 메일 임베딩 일괄 생성
   */
  async generateEmbeddings(userId) {
    const response = await fetch(`${PYTHON_API_URL}/api/ai/mail/embeddings/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })
    return response.json()
  }
}

export default mailService
