/**
 * Azure Speech Service API
 *
 * Handles token retrieval from backend for Azure Speech SDK usage.
 */
import axios from 'axios'

// Python 백엔드용 axios 인스턴스 (Azure Speech 토큰 발급)
const pythonApi = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Get Azure Speech authorization token from backend.
 * Token is valid for 10 minutes.
 *
 * @returns {Promise<{token: string, region: string}>} Token and region
 * @throws {Error} If token request fails
 */
export async function getSpeechToken() {
  try {
    const response = await pythonApi.get('/api/ai/speech/token')

    if (response.data.success && response.data.data) {
      return {
        token: response.data.data.token,
        region: response.data.data.region
      }
    }

    throw new Error('Invalid response format from speech token API')
  } catch (error) {
    console.error('Failed to get speech token:', error)
    throw new Error(`Failed to get speech token: ${error.message}`)
  }
}

/**
 * Refresh Azure Speech token (force new token).
 *
 * @returns {Promise<{token: string, region: string}>} Token and region
 */
export async function refreshSpeechToken() {
  try {
    const response = await pythonApi.post('/api/ai/speech/token/refresh')

    if (response.data.success && response.data.data) {
      return {
        token: response.data.data.token,
        region: response.data.data.region
      }
    }

    throw new Error('Invalid response format from speech token refresh API')
  } catch (error) {
    console.error('Failed to refresh speech token:', error)
    throw new Error(`Failed to refresh speech token: ${error.message}`)
  }
}

/**
 * Get Azure Speech region.
 *
 * @returns {Promise<string>} Region
 */
export async function getSpeechRegion() {
  try {
    const response = await pythonApi.get('/api/ai/speech/region')

    if (response.data.success && response.data.data) {
      return response.data.data.region
    }

    throw new Error('Invalid response format from speech region API')
  } catch (error) {
    console.error('Failed to get speech region:', error)
    throw new Error(`Failed to get speech region: ${error.message}`)
  }
}
