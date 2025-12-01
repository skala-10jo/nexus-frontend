/**
 * 음성 TTS 서비스
 *
 * Azure Speech SDK를 사용하여 AI 응답을 음성으로 변환합니다.
 *
 * 주의: Avatar 비디오 기능은 현재 Azure 구독에서 지원되지 않습니다.
 */
import { pythonAPI } from './api'

const voiceAvatarService = {
  // 현재 오디오 엘리먼트 및 언어
  _currentAudioElement: null,
  _currentLanguage: 'en-US',
  _isPlaying: false,

  /**
   * 음성 TTS 초기화
   * @param {HTMLAudioElement} audioElement - 오디오를 재생할 audio 엘리먼트
   * @param {string} language - 언어 코드 (기본값: en-US)
   * @returns {Promise<void>}
   */
  async initialize(audioElement, language = 'en-US') {
    console.log('음성 TTS 초기화', { language })

    // 오디오 엘리먼트 저장
    this._currentAudioElement = audioElement
    this._currentLanguage = language

    console.log('✅ 음성 TTS 준비 완료')
    console.warn('⚠️ Avatar 비디오는 현재 Azure 구독에서 지원되지 않습니다')
  },

  /**
   * 텍스트를 음성으로 변환 및 재생
   * @param {string} text - 말할 텍스트
   * @returns {Promise<void>}
   */
  async speak(text) {
    if (!text || !text.trim()) {
      console.warn('TTS: 빈 텍스트')
      return
    }

    if (!this._currentAudioElement) {
      throw new Error('음성 TTS가 초기화되지 않았습니다.')
    }

    try {
      this._isPlaying = true
      console.log(`TTS 음성 생성: "${text.substring(0, 50)}..."`)

      // 백엔드에서 음성 생성
      const response = await pythonAPI.post('/avatar/synthesize', {
        text,
        language: this._currentLanguage || 'en-US'
      }, {
        responseType: 'blob'  // 오디오 파일을 blob으로 받음
      })

      // Blob URL 생성
      const audioBlob = response.data
      const audioUrl = URL.createObjectURL(audioBlob)

      console.log('음성 생성 완료, 재생 시작')

      // 오디오 재생
      this._currentAudioElement.src = audioUrl
      await this._currentAudioElement.play()

      // 재생 완료 대기
      return new Promise((resolve, reject) => {
        this._currentAudioElement.onended = () => {
          this._isPlaying = false
          URL.revokeObjectURL(audioUrl)  // 메모리 정리
          console.log('음성 재생 완료')
          resolve()
        }

        this._currentAudioElement.onerror = (error) => {
          this._isPlaying = false
          URL.revokeObjectURL(audioUrl)
          console.error('음성 재생 실패:', error)
          reject(new Error('음성 재생 실패'))
        }
      })
    } catch (error) {
      this._isPlaying = false
      console.error('TTS 실패:', error)
      throw error
    }
  },

  /**
   * 음성 중지 및 리소스 정리
   */
  async stop() {
    try {
      if (this._currentAudioElement) {
        this._currentAudioElement.pause()
        this._currentAudioElement.src = ''
      }

      this._isPlaying = false
      console.log('음성 TTS stopped and cleaned up')
    } catch (error) {
      console.error('TTS stop failed:', error)
    }
  },

  /**
   * 재생 중인지 확인
   * @returns {boolean}
   */
  isPlaying() {
    return this._isPlaying
  },

  /**
   * 언어에 맞는 음성 반환
   * @param {string} language - 언어 코드
   * @returns {string} 음성 이름
   */
  _getVoiceForLanguage(language) {
    const voiceMap = {
      'en-US': 'en-US-JennyNeural',
      'en-GB': 'en-GB-SoniaNeural',
      'ko-KR': 'ko-KR-SunHiNeural',
      'ja-JP': 'ja-JP-NanamiNeural',
      'zh-CN': 'zh-CN-XiaoxiaoNeural',
      'es-ES': 'es-ES-ElviraNeural',
      'fr-FR': 'fr-FR-DeniseNeural',
      'de-DE': 'de-DE-KatjaNeural'
    }
    return voiceMap[language] || 'en-US-JennyNeural'
  }
}

export default voiceAvatarService
