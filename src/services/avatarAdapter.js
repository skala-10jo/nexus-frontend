/**
 * Avatar Adapter Service
 *
 * TTS 결과를 아바타 모듈로 변환하는 어댑터
 * 기존 TTS 파이프라인은 건드리지 않고, 결과만 수신하여 아바타에 적용
 * Azure AI Speech Avatar WebRTC 연결 지원
 */
import axios from 'axios'

// Python AI Backend URL
const PYTHON_API_URL = import.meta.env.VITE_PYTHON_API_URL
  ? `${import.meta.env.VITE_PYTHON_API_URL}/api/ai`
  : 'http://localhost:8000/api/ai'

// Avatar API용 axios 인스턴스
const avatarAPI = axios.create({
  baseURL: PYTHON_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000
})

// Request interceptor for auth token
avatarAPI.interceptors.request.use(
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
 * Avatar Adapter
 * TTS 결과를 받아 아바타 시각화에 필요한 데이터로 변환
 */
export const avatarAdapter = {
  /**
   * TTS 결과를 아바타에 적용
   * @param {Object} params - 적용 파라미터
   * @param {string} params.text - TTS 텍스트
   * @param {string} [params.audioUrl] - 오디오 URL (있는 경우)
   * @param {string} [params.language='en-US'] - 언어 코드
   * @param {string} [params.avatarStyle='casual'] - 아바타 스타일
   * @returns {Promise<Object>} 아바타 세션 정보
   */
  async apply({ text, audioUrl = null, language = 'en-US', avatarStyle = 'casual' }) {
    try {
      const response = await avatarAPI.post('/avatar/apply', {
        text,
        audio_url: audioUrl,
        language,
        avatar_style: avatarStyle
      })

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Avatar apply failed')
    } catch (error) {
      console.error('[AvatarAdapter] Apply error:', error)
      throw error
    }
  },

  /**
   * Avatar 토큰 가져오기 (WebRTC 모드용)
   * @returns {Promise<Object>} 토큰 정보
   */
  async getToken() {
    try {
      const response = await avatarAPI.get('/avatar/token')

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Token fetch failed')
    } catch (error) {
      console.error('[AvatarAdapter] Token error:', error)
      throw error
    }
  },

  /**
   * ICE 서버 정보 가져오기 (WebRTC 모드용)
   * @returns {Promise<Object>} ICE 서버 정보
   */
  async getIceServers() {
    try {
      const response = await avatarAPI.get('/avatar/ice-servers')

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'ICE servers fetch failed')
    } catch (error) {
      console.error('[AvatarAdapter] ICE servers error:', error)
      throw error
    }
  },

  /**
   * Viseme 애니메이션 스케줄러
   * viseme 배열을 받아 타이밍에 맞춰 콜백 실행
   *
   * @param {Array} visemes - viseme 데이터 배열
   * @param {Function} onViseme - viseme 변경 시 콜백 (visemeId, index)
   * @param {Function} [onComplete] - 완료 시 콜백
   * @returns {Object} 컨트롤러 { stop: Function }
   */
  scheduleVisemes(visemes, onViseme, onComplete = null) {
    if (!visemes || visemes.length === 0) {
      if (onComplete) onComplete()
      return { stop: () => {} }
    }

    let currentIndex = 0
    let timeouts = []
    let stopped = false

    // 각 viseme에 대해 타이머 설정
    visemes.forEach((viseme, index) => {
      const timeout = setTimeout(() => {
        if (stopped) return

        currentIndex = index
        onViseme(viseme.viseme_id, index)

        // 마지막 viseme 후 완료 콜백
        if (index === visemes.length - 1 && onComplete) {
          setTimeout(onComplete, 100)
        }
      }, viseme.offset_ms)

      timeouts.push(timeout)
    })

    // 컨트롤러 반환
    return {
      stop: () => {
        stopped = true
        timeouts.forEach(clearTimeout)
        timeouts = []
      },
      getCurrentIndex: () => currentIndex
    }
  },

  /**
   * Viseme ID를 입 모양 이름으로 변환
   * @param {number} visemeId - Viseme ID (0-21)
   * @returns {string} 입 모양 이름
   */
  visemeIdToName(visemeId) {
    const visemeNames = {
      0: 'silence',
      1: 'ae_ax_ah',
      2: 'aa',
      3: 'ao',
      4: 'ey_eh_uh',
      5: 'er',
      6: 'y_iy_ih_ix',
      7: 'w_uw',
      8: 'ow',
      9: 'aw',
      10: 'oy',
      11: 'ay',
      12: 'h',
      13: 'r',
      14: 'l',
      15: 's_z',
      16: 'sh_ch_jh_zh',
      17: 'th_dh',
      18: 'f_v',
      19: 'd_t_n',
      20: 'k_g_ng',
      21: 'p_b_m'
    }

    return visemeNames[visemeId] || 'silence'
  },

  // =========== WebRTC 관련 메서드 ===========

  /**
   * Avatar 연결 설정 조회
   * @returns {Promise<Object>} 연결 설정 (token, ice_servers, endpoint 등)
   */
  async getConfig() {
    try {
      const response = await avatarAPI.get('/avatar/config')

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Config fetch failed')
    } catch (error) {
      console.error('[AvatarAdapter] Config error:', error)
      throw error
    }
  },

  /**
   * Avatar WebRTC 세션 생성
   * @param {string} character - 아바타 캐릭터 (lisa, harry 등)
   * @param {string} style - 아바타 스타일
   * @returns {Promise<Object>} 세션 정보
   */
  async createSession(character = 'lisa', style = 'casual-sitting') {
    try {
      const response = await avatarAPI.post('/avatar/session', {
        character,
        style
      })

      if (response.data.success) {
        return response.data.data
      }

      throw new Error(response.data.message || 'Session creation failed')
    } catch (error) {
      console.error('[AvatarAdapter] Session error:', error)
      throw error
    }
  }
}

export default avatarAdapter
