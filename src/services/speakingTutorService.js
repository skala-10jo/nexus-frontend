/**
 * Speaking Tutor API Service
 * Handles audio upload, analysis, and feedback operations
 */
import { pythonAPI } from './api'

const BASE_URL = '/speaking-tutor'

export const speakingTutorService = {
  /**
   * Upload audio file for analysis
   * @param {File} file - Audio file (WAV, MP3, M4A, etc.)
   * @param {string} language - Language code (e.g., 'en-US')
   * @returns {Promise<{sessionId: string, status: string, message: string}>}
   */
  uploadAudio: async (file, language = 'en-US') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)

    const response = await pythonAPI.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Get analysis status/result
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>} Analysis result or progress
   */
  getAnalysis: async (sessionId) => {
    const response = await pythonAPI.get(`${BASE_URL}/analysis/${sessionId}`)
    return response.data
  },

  /**
   * Generate feedback for an utterance
   * @param {string} utteranceId - Utterance UUID
   * @param {string} context - Optional context (e.g., 'business meeting')
   * @returns {Promise<Object>} Feedback data
   */
  generateFeedback: async (utteranceId, context = null) => {
    const response = await pythonAPI.post(`${BASE_URL}/feedback`, {
      utteranceId,
      context
    })
    return response.data
  },

  /**
   * Update speaker label
   * @param {string} sessionId - Session UUID
   * @param {number} speakerId - Speaker ID
   * @param {string} label - New label
   * @returns {Promise<Object>}
   */
  updateSpeakerLabel: async (sessionId, speakerId, label) => {
    const response = await pythonAPI.patch(
      `${BASE_URL}/speaker/${sessionId}/${speakerId}`,
      { label }
    )
    return response.data
  },

  /**
   * Get learning mode data
   * @param {string} sessionId - Session UUID
   * @param {number[]} speakerIds - Optional speaker IDs filter
   * @returns {Promise<Object>} Learning items
   */
  getLearningData: async (sessionId, speakerIds = null) => {
    const params = {}
    if (speakerIds && speakerIds.length > 0) {
      params.speakerIds = speakerIds.join(',')
    }
    const response = await pythonAPI.get(`${BASE_URL}/learning/${sessionId}`, { params })
    return response.data
  },

  /**
   * Get session history list
   * @param {number} page - Page number (0-indexed)
   * @param {number} size - Page size
   * @returns {Promise<{sessions: Array, total: number}>}
   */
  getSessions: async (page = 0, size = 10) => {
    const response = await pythonAPI.get(`${BASE_URL}/sessions`, {
      params: { page, size }
    })
    return response.data
  },

  /**
   * Delete a session
   * @param {string} sessionId - Session UUID
   * @returns {Promise<Object>}
   */
  deleteSession: async (sessionId) => {
    const response = await pythonAPI.delete(`${BASE_URL}/session/${sessionId}`)
    return response.data
  }
}

export default speakingTutorService
