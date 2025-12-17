/**
 * Video Service
 *
 * 영상 번역 및 자막 기능을 위한 API 클라이언트
 */
import axios from 'axios'
import api from './api'

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
 * 영상 목록 조회 (Java Backend)
 *
 * @param {number} page - 페이지 번호 (0부터 시작)
 * @param {number} size - 페이지 크기
 * @returns {Promise<Object>} 페이징된 영상 목록
 */
export async function getVideos(page = 0, size = 20) {
  try {
    const response = await api.get('/videos', {
      params: {
        page,
        size,
        sortBy: 'uploadDate',
        sortOrder: 'desc'
      }
    })

    return response.data
  } catch (error) {
    console.error('Video list fetch error:', error)
    throw error
  }
}

/**
 * 영상 삭제 (Java Backend)
 *
 * @param {string} videoId - 영상 ID (UUID)
 * @returns {Promise<Object>} 삭제 결과
 */
export async function deleteVideo(videoId) {
  try {
    const response = await api.delete(`/videos/${videoId}`)
    return response.data
  } catch (error) {
    console.error('Video delete error:', error)
    throw error
  }
}

/**
 * 영상 파일 업로드 (Java Backend)
 *
 * @param {FormData} formData - 영상 파일 및 메타데이터
 * @returns {Promise<Object>} 업로드된 영상 정보
 */
export async function uploadVideo(formData) {
  try {
    const response = await api.post('/videos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        console.log('Upload progress:', percentCompleted + '%')
      }
    })

    return response.data.data
  } catch (error) {
    console.error('Video upload error:', error)
    throw error
  }
}

/**
 * 영상에서 자막 추출 (STT - Python AI Backend)
 *
 * @param {Object} params - STT 요청 파라미터
 * @param {string} params.videoDocumentId - 영상 문서 ID (UUID)
 * @param {string} params.sourceLanguage - 원본 언어 (ko, en, ja, vi)
 * @returns {Promise<Object>} 추출된 자막 정보
 */
export async function extractSubtitles({ videoDocumentId, sourceLanguage }) {
  try {
    const response = await aiApi.post('/api/ai/video/stt', {
      video_file_id: videoDocumentId,  // Changed from video_document_id to video_file_id
      source_language: sourceLanguage
    })

    // Python 백엔드 응답 형식: VideoSTTResponse
    const data = response.data
    return {
      videoId: data.video_file_id,  // Changed from video_document_id
      subtitles: (data.segments || []).map((segment) => ({
        id: `${data.video_file_id}-${segment.sequence_number}`, // 임시 ID
        startTime: segment.start_time_ms / 1000, // 밀리초 → 초 변환
        endTime: segment.end_time_ms / 1000,     // 밀리초 → 초 변환
        text: segment.text,
        translatedText: null,
        confidence: segment.confidence
      })),
      totalSegments: data.total_segments
    }
  } catch (error) {
    console.error('Subtitle extraction error:', error)
    throw error
  }
}

/**
 * 자막 번역 (Python AI Backend)
 *
 * @param {Object} params - 번역 요청 파라미터
 * @param {string} params.videoDocumentId - 영상 문서 ID (UUID)
 * @param {string} params.projectId - 프로젝트 ID (용어집 컨텍스트) - Text.vue 방식과 동일
 * @param {string} params.sourceLanguage - 원본 언어
 * @param {string} params.targetLanguage - 목표 언어
 * @returns {Promise<Object>} 번역된 자막 정보
 */
export async function translateSubtitles({
  videoDocumentId,
  projectId,
  sourceLanguage,
  targetLanguage
}) {
  try {
    const response = await aiApi.post('/api/ai/video/translate', {
      video_file_id: videoDocumentId,
      project_id: projectId || null,  // Text.vue 방식: projectId로 용어집 자동 조회
      source_language: sourceLanguage,
      target_language: targetLanguage
    })

    // Python 백엔드 응답 형식: VideoTranslationResponse
    const data = response.data
    return {
      videoId: data.video_file_id,  // Changed from video_document_id
      translatedSubtitles: (data.segments || []).map((segment) => ({
        id: `${data.video_file_id}-${segment.sequence_number}`, // 임시 ID
        startTime: segment.start_time_ms / 1000, // 밀리초 → 초 변환
        endTime: segment.end_time_ms / 1000,     // 밀리초 → 초 변환
        text: segment.original_text,
        originalText: segment.original_text,
        translatedText: segment.translated_text,
        confidence: segment.confidence,
        detectedTerms: segment.detected_terms || []
      })),
      contextUsed: data.context_used,
      contextDocumentCount: data.context_document_count,
      totalSegments: data.total_segments
    }
  } catch (error) {
    console.error('Subtitle translation error:', error)
    throw error
  }
}

/**
 * 다국어 자막 조회 (모든 언어)
 *
 * @param {string} videoDocumentId - 영상 문서 ID (UUID)
 * @returns {Promise<Object>} 다국어 자막 정보
 */
export async function getMultilingualSubtitles(videoDocumentId) {
  try {
    const response = await aiApi.get(`/api/ai/video/subtitles/${videoDocumentId}`)  // URL path stays same

    // Python 백엔드 응답 형식: MultilingualSubtitlesResponse
    const data = response.data
    return {
      videoDocumentId: data.video_file_id,  // Changed from video_document_id
      originalLanguage: data.original_language,
      availableLanguages: data.available_languages,
      subtitles: (data.segments || []).map((segment) => ({
        id: `${data.video_file_id}-${segment.sequence_number}`,  // Changed
        sequenceNumber: segment.sequence_number,
        startTime: segment.start_time_ms / 1000, // 밀리초 → 초
        endTime: segment.end_time_ms / 1000,
        originalText: segment.original_text,
        translations: segment.translations || {},
        confidence: segment.confidence,
        detectedTerms: segment.detected_terms || []
      })),
      totalSegments: data.total_segments
    }
  } catch (error) {
    console.error('Multilingual subtitles fetch error:', error)
    throw error
  }
}

/**
 * 자막 파일 다운로드 (SRT 형식)
 *
 * @param {Object} params - 다운로드 파라미터
 * @param {string} params.videoDocumentId - 영상 문서 ID
 * @param {string} params.language - 언어 (original 또는 translated)
 * @returns {Promise<Blob>} SRT 파일 Blob
 */
export async function downloadSubtitles({ videoDocumentId, language }) {
  try {
    const response = await aiApi.get('/api/ai/video/subtitle-download', {
      params: {
        video_file_id: videoDocumentId,  // Changed from video_document_id
        language: language
      },
      responseType: 'blob'
    })

    return response.data
  } catch (error) {
    console.error('Subtitle download error:', error)
    throw error
  }
}

/**
 * 자막 수동 편집
 *
 * @param {Object} params - 편집 파라미터
 * @param {string} params.subtitleId - 자막 ID
 * @param {string} params.text - 수정된 텍스트
 * @returns {Promise<Object>} 업데이트된 자막 정보
 */
export async function updateSubtitle({ subtitleId, text }) {
  try {
    const response = await aiApi.patch(`/api/ai/video/subtitles/${subtitleId}`, {
      text: text
    })

    return response.data
  } catch (error) {
    console.error('Subtitle update error:', error)
    throw error
  }
}

export default {
  getVideos,
  deleteVideo,
  uploadVideo,
  extractSubtitles,
  translateSubtitles,
  getMultilingualSubtitles,
  downloadSubtitles,
  updateSubtitle
}
