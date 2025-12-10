/**
 * Slack Agent Service
 *
 * Python 백엔드의 Slack Agent API와 통신
 * - 메시지 번역 (SimpleTranslationAgent)
 * - 비즈니스 초안 작성 (BizGuideRAGAgent + SlackDraftAgent)
 * - 세션 기반 챗봇 (대화 컨텍스트 유지)
 */
import axios from 'axios'

const PYTHON_BASE_URL = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'

// Create axios instance for Python Slack Agent API
const slackAgentAPI = axios.create({
  baseURL: `${PYTHON_BASE_URL}/api/slack`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
slackAgentAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Translate a Slack message
 * @param {string} text - Text to translate
 * @param {string} targetLang - Target language code (ko, en, ja, vi, zh)
 * @param {string} sourceLang - Source language code (default: auto)
 * @returns {Promise<{original_text, translated_text, source_lang, target_lang}>}
 */
export async function translateMessage(text, targetLang, sourceLang = 'auto') {
  const response = await slackAgentAPI.post('/translate', {
    text,
    source_lang: sourceLang,
    target_lang: targetLang
  })
  return response.data
}

/**
 * Create a Slack message draft using BizGuide RAG
 * @param {string} message - User's intent/content description
 * @param {string} language - Target language (ko, en)
 * @param {string[]} keywords - Optional RAG search keywords
 * @returns {Promise<{draft, suggestions, status}>}
 */
export async function createDraft(message, language = 'ko', keywords = null) {
  const response = await slackAgentAPI.post('/draft', {
    message,
    language,
    keywords
  })
  return response.data
}

/**
 * Send a chat message (session-based conversation)
 * Supports:
 * - Draft creation: Initial message creates a new draft
 * - Translation: "영어로 번역해줘" translates previous draft
 * - Refinement: "더 공손하게" refines previous draft
 *
 * @param {string} message - User's message
 * @param {string} sessionId - Session ID (null for new session)
 * @param {string} language - Default language (ko, en)
 * @returns {Promise<{session_id, message, draft, action_type, suggestions}>}
 */
export async function sendChatMessage(message, sessionId = null, language = 'ko') {
  const response = await slackAgentAPI.post('/chat', {
    message,
    session_id: sessionId,
    language
  })
  return response.data
}

/**
 * Delete a chat session
 * @param {string} sessionId - Session ID to delete
 * @returns {Promise<{success, message}>}
 */
export async function deleteSession(sessionId) {
  const response = await slackAgentAPI.delete(`/session/${sessionId}`)
  return response.data
}

export default {
  translateMessage,
  createDraft,
  sendChatMessage,
  deleteSession
}
