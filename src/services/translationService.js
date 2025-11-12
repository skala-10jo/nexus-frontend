/**
 * Translation Service
 *
 * 번역 기능을 위한 API 클라이언트
 */
import axios from 'axios'

/**
 * @typedef {import('@/types/api').TranslationRequest} TranslationRequest
 * @typedef {import('@/types/api').TranslationResponse} TranslationResponse
 * @typedef {import('@/types/api').Translation} Translation
 */

// Python AI Backend URL (포트 8000)
const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'

// Python AI Backend용 axios 인스턴스
const aiApi = axios.create({
  baseURL: AI_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
aiApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

/**
 * 텍스트 번역
 *
 * @param {Object} params - 번역 요청 파라미터
 * @param {string} params.text - 번역할 텍스트
 * @param {import('@/types/api').LanguageCode} params.sourceLang - 원본 언어 (ko, en, ja, vi)
 * @param {import('@/types/api').LanguageCode} params.targetLang - 목표 언어
 * @param {string} params.userId - 사용자 ID (UUID)
 * @param {string} [params.projectId] - 프로젝트 ID (UUID, 선택사항)
 * @returns {Promise<TranslationResponse>} 번역 결과
 * @throws {Error} API 요청 실패 시
 */
export async function translateText({ text, sourceLang, targetLang, userId, projectId }) {
  try {
    const response = await aiApi.post('/api/ai/translate', {
      text,
      source_lang: sourceLang,
      target_lang: targetLang,
      user_id: userId,
      project_id: projectId || null
    })

    // snake_case를 camelCase로 변환
    const data = response.data
    return {
      translationId: data.translation_id,
      originalText: data.original_text,
      translatedText: data.translated_text,
      sourceLanguage: data.source_language,
      targetLanguage: data.target_language,
      contextUsed: data.context_used,
      contextSummary: data.context_summary,
      detectedTerms: (data.detected_terms || []).map(term => ({
        matchedText: term.matched_text,
        positionStart: term.position_start,
        positionEnd: term.position_end,
        glossaryTermId: term.glossary_term_id,
        koreanTerm: term.korean_term,
        englishTerm: term.english_term,
        vietnameseTerm: term.vietnamese_term,
        definition: term.definition,
        domain: term.domain
      })),
      termsCount: data.terms_count
    }
  } catch (error) {
    console.error('Translation error:', error)
    throw error
  }
}

/**
 * 번역 히스토리 조회 (Java Backend)
 *
 * @param {Object} params - 조회 파라미터
 * @param {number} [params.page=0] - 페이지 번호
 * @param {number} [params.size=20] - 페이지 크기
 * @param {string} [params.projectId] - 프로젝트 ID 필터
 * @param {string} [params.query] - 검색 쿼리
 * @returns {Promise<Object>} 번역 히스토리 페이지
 */
export async function getTranslationHistory({ page = 0, size = 20, projectId, query } = {}) {
  try {
    // Note: Java Backend API는 아직 구현되지 않았으므로 임시로 빈 배열 반환
    // TODO: Java Backend에 TranslationController 구현 후 연동
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size,
      number: page
    }
  } catch (error) {
    console.error('Get translation history error:', error)
    throw error
  }
}

/**
 * 특정 번역 조회 (Java Backend)
 *
 * @param {string} translationId - 번역 ID
 * @returns {Promise<Object>} 번역 상세 정보
 */
export async function getTranslation(translationId) {
  try {
    // TODO: Java Backend API 구현 후 연동
    throw new Error('Not implemented yet')
  } catch (error) {
    console.error('Get translation error:', error)
    throw error
  }
}

/**
 * 번역 삭제 (Java Backend)
 *
 * @param {string} translationId - 번역 ID
 * @returns {Promise<void>}
 */
export async function deleteTranslation(translationId) {
  try {
    // TODO: Java Backend API 구현 후 연동
    throw new Error('Not implemented yet')
  } catch (error) {
    console.error('Delete translation error:', error)
    throw error
  }
}

export default {
  translateText,
  getTranslationHistory,
  getTranslation,
  deleteTranslation
}
