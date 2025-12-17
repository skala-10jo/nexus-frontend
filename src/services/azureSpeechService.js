/**
 * Azure Speech Service API
 *
 * Azure Speech SDK 사용을 위한 백엔드 토큰 요청 처리
 */
import axios from 'axios'

// Python Backend URL (Proxy를 통한 접근)
// Production: https://api.sk-nexus.world/api/ai → Python Backend
// Development: http://localhost:8000/api/ai → Python Backend 직접
const PYTHON_API_BASE = import.meta.env.VITE_PYTHON_API_URL
  ? `${import.meta.env.VITE_PYTHON_API_URL}/api/ai`
  : (import.meta.env.PROD ? 'https://api.sk-nexus.world/api/ai' : 'http://localhost:8000/api/ai')

// Python 백엔드용 axios 인스턴스 (Azure Speech 토큰 발급)
const pythonApi = axios.create({
  baseURL: PYTHON_API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * 백엔드에서 Azure Speech 인증 토큰 가져오기
 * 토큰 유효 시간: 10분
 *
 * @returns {Promise<{token: string, region: string}>} 토큰 및 리전
 * @throws {Error} 토큰 요청 실패 시
 */
export async function getSpeechToken() {
  try {
    const response = await pythonApi.get('/speech/token')

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
 * Azure Speech 토큰 갱신 (강제로 새 토큰 발급)
 *
 * @returns {Promise<{token: string, region: string}>} 토큰 및 리전
 */
export async function refreshSpeechToken() {
  try {
    const response = await pythonApi.post('/speech/token/refresh')

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
 * Azure Speech 리전 가져오기
 *
 * @returns {Promise<string>} 리전
 */
export async function getSpeechRegion() {
  try {
    const response = await pythonApi.get('/speech/region')

    if (response.data.success && response.data.data) {
      return response.data.data.region
    }

    throw new Error('Invalid response format from speech region API')
  } catch (error) {
    console.error('Failed to get speech region:', error)
    throw new Error(`Failed to get speech region: ${error.message}`)
  }
}
