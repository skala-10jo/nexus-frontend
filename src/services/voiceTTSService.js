/**
 * 음성 TTS 서비스
 *
 * Azure Speech SDK를 사용하여 텍스트를 음성으로 변환합니다.
 */
import { pythonAPI } from './api'

// Azure Speech SDK (CDN에서 로드)
let speechSdk = null

const voiceTTSService = {
  // 토큰 캐시
  _tokenCache: {
    token: null,
    region: null,
    expiresAt: null
  },

  // 현재 재생 중인 synthesizer
  _currentSynthesizer: null,
  _isPlaying: false,

  /**
   * Azure Speech SDK 로드
   */
  async _loadSdk() {
    if (speechSdk) return speechSdk

    return new Promise((resolve, reject) => {
      // 이미 로드되어 있는지 확인
      if (window.SpeechSDK) {
        speechSdk = window.SpeechSDK
        resolve(speechSdk)
        return
      }

      // SDK 스크립트 로드
      const script = document.createElement('script')
      script.src = 'https://aka.ms/csspeech/jsbrowserpackageraw'
      script.onload = () => {
        speechSdk = window.SpeechSDK
        console.log('Azure Speech SDK loaded')
        resolve(speechSdk)
      }
      script.onerror = () => {
        reject(new Error('Azure Speech SDK 로드 실패'))
      }
      document.head.appendChild(script)
    })
  },

  /**
   * Azure Speech 토큰 가져오기 (캐싱)
   */
  async _getToken() {
    // 캐시된 토큰이 유효하면 사용
    if (
      this._tokenCache.token &&
      this._tokenCache.expiresAt &&
      Date.now() < this._tokenCache.expiresAt
    ) {
      return this._tokenCache
    }

    try {
      const response = await pythonAPI.get('/speech/token')
      const { token, region } = response.data.data

      // 토큰 캐시 (9분 후 만료로 설정 - 실제 만료는 10분)
      this._tokenCache = {
        token,
        region,
        expiresAt: Date.now() + 9 * 60 * 1000
      }

      console.log('TTS token acquired, region:', region)
      return this._tokenCache
    } catch (error) {
      console.error('TTS 토큰 발급 실패:', error)
      throw new Error('음성 합성 토큰 발급에 실패했습니다.')
    }
  },

  /**
   * 텍스트를 음성으로 변환하여 재생
   * @param {string} text - 변환할 텍스트
   * @param {string} language - 언어 코드 (기본값: en-US)
   * @param {string} voiceName - 음성 이름 (선택)
   * @returns {Promise<void>}
   */
  async speak(text, language = 'en-US', voiceName = null) {
    if (!text || !text.trim()) {
      console.warn('TTS: 빈 텍스트')
      return
    }

    // 이미 재생 중이면 중지
    if (this._isPlaying) {
      await this.stop()
    }

    try {
      // SDK 로드
      const sdk = await this._loadSdk()

      // 토큰 가져오기
      const { token, region } = await this._getToken()

      // Speech Config 생성
      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region)

      // 언어별 기본 음성 설정
      const defaultVoices = {
        'en-US': 'en-US-JennyNeural',
        'en-GB': 'en-GB-SoniaNeural',
        'ko-KR': 'ko-KR-SunHiNeural',
        'ja-JP': 'ja-JP-NanamiNeural',
        'zh-CN': 'zh-CN-XiaoxiaoNeural',
        'es-ES': 'es-ES-ElviraNeural',
        'fr-FR': 'fr-FR-DeniseNeural',
        'de-DE': 'de-DE-KatjaNeural'
      }

      const selectedVoice = voiceName || defaultVoices[language] || 'en-US-JennyNeural'
      speechConfig.speechSynthesisVoiceName = selectedVoice
      speechConfig.speechSynthesisLanguage = language

      // Audio Config (스피커 출력)
      const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput()

      // Synthesizer 생성
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig)
      this._currentSynthesizer = synthesizer
      this._isPlaying = true

      console.log(`TTS 시작: "${text.substring(0, 50)}..." (${selectedVoice})`)

      return new Promise((resolve, reject) => {
        synthesizer.speakTextAsync(
          text,
          (result) => {
            this._isPlaying = false

            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              console.log('TTS 완료')
              resolve()
            } else if (result.reason === sdk.ResultReason.Canceled) {
              const cancellation = sdk.CancellationDetails.fromResult(result)
              console.warn('TTS 취소:', cancellation.reason)

              if (cancellation.reason === sdk.CancellationReason.Error) {
                reject(new Error(cancellation.errorDetails))
              } else {
                resolve() // 사용자에 의한 취소
              }
            }

            synthesizer.close()
            this._currentSynthesizer = null
          },
          (error) => {
            this._isPlaying = false
            console.error('TTS 에러:', error)
            synthesizer.close()
            this._currentSynthesizer = null
            reject(new Error('음성 합성에 실패했습니다.'))
          }
        )
      })
    } catch (error) {
      this._isPlaying = false
      console.error('TTS 실패:', error)
      throw error
    }
  },

  /**
   * 현재 재생 중인 음성 중지
   */
  async stop() {
    if (this._currentSynthesizer) {
      try {
        this._currentSynthesizer.close()
      } catch (e) {
        // 이미 닫힌 경우 무시
      }
      this._currentSynthesizer = null
    }
    this._isPlaying = false
    console.log('TTS 중지')
  },

  /**
   * 재생 중인지 확인
   * @returns {boolean}
   */
  isPlaying() {
    return this._isPlaying
  },

  /**
   * 지원하는 음성 목록
   */
  getVoices() {
    return {
      'en-US': [
        { name: 'en-US-JennyNeural', label: 'Jenny (여성)' },
        { name: 'en-US-GuyNeural', label: 'Guy (남성)' },
        { name: 'en-US-AriaNeural', label: 'Aria (여성)' }
      ],
      'ko-KR': [
        { name: 'ko-KR-SunHiNeural', label: '선희 (여성)' },
        { name: 'ko-KR-InJoonNeural', label: '인준 (남성)' }
      ],
      'ja-JP': [
        { name: 'ja-JP-NanamiNeural', label: 'Nanami (여성)' },
        { name: 'ja-JP-KeitaNeural', label: 'Keita (남성)' }
      ]
    }
  }
}

export default voiceTTSService
