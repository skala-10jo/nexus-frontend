/**
 * Azure TTS (Text-to-Speech) Composable
 *
 * Azure Neural Voices를 사용한 텍스트 음성 변환 처리
 *
 * 주요 기능:
 * - 뉴럴 음성 합성
 * - 고급 제어를 위한 SSML 지원
 * - 재생 제어 (재생, 일시정지, 중지)
 * - 언어별 다양한 음성 옵션
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech
 */
import { ref } from 'vue'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { useAzureSpeechStore } from '../stores/azureSpeechStore'

export function useAzureTTS() {
  // Pinia 스토어 (싱글톤)
  const speechStore = useAzureSpeechStore()

  // 상태
  const isInitialized = ref(false)
  const isSpeaking = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // Azure SDK 인스턴스
  let speechConfig = null
  let synthesizer = null
  let player = null

  /**
   * 백엔드에서 토큰을 받아 Azure TTS 초기화
   *
   * @throws {Error} 초기화 실패 시
   */
  async function initialize() {
    if (isInitialized.value) {
      return
    }

    try {
      isConnecting.value = true
      error.value = null

      // 스토어에서 토큰 가져오기 (캐싱 지원)
      console.log('🔑 Requesting Azure Speech token for TTS...')
      const { token, region } = await speechStore.ensureToken()
      console.log(`✅ TTS token received for region: ${region}`)

      // Speech 설정 생성
      speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)

      // 기본 오디오 출력 사용
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput()

      // 합성기 생성 (각 음성마다 재생성됨)
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)

      isInitialized.value = true
      isConnecting.value = false

      console.log('✅ Azure TTS initialized successfully')
    } catch (err) {
      console.error('❌ Failed to initialize Azure TTS:', err)
      error.value = err.message
      isConnecting.value = false
      throw err
    }
  }

  /**
   * 지정된 뉴럴 음성으로 텍스트 읽기
   *
   * @param {string} text - 읽을 텍스트
   * @param {string} voiceName - 뉴럴 음성 이름 (예: 'ko-KR-SunHiNeural')
   * @param {Object} options - 추가 옵션
   * @param {number} options.rate - 말하기 속도 (0.5 - 2.0, 기본값 1.0)
   * @param {number} options.pitch - 음높이 (-50% ~ +50%, 기본값 0)
   * @param {number} options.volume - 음량 (0 - 100, 기본값 100)
   * @returns {Promise<void>}
   */
  async function speak(text, voiceName, options = {}) {
    if (!isInitialized.value) {
      await initialize()
    }

    if (isSpeaking.value) {
      console.warn('⚠️ Already speaking, stopping current speech')
      await stop()
    }

    if (!text || !text.trim()) {
      throw new Error('Text cannot be empty')
    }

    try {
      error.value = null
      isSpeaking.value = true

      // 음성 설정
      speechConfig.speechSynthesisVoiceName = voiceName

      // 고급 제어를 위한 SSML 생성
      const ssml = buildSSML(text, voiceName, options)

      console.log(`🔊 Speaking with voice: ${voiceName}`)
      console.log(`📝 Text: "${text}"`)

      // 음성 합성
      await new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              console.log('✅ Speech synthesis completed')
              isSpeaking.value = false
              resolve()
            } else {
              const errorDetails = result.errorDetails
              console.error('❌ Speech synthesis failed:', errorDetails)
              error.value = errorDetails
              isSpeaking.value = false
              reject(new Error(errorDetails))
            }
          },
          err => {
            console.error('❌ Speech synthesis error:', err)
            error.value = err
            isSpeaking.value = false
            reject(err)
          }
        )
      })
    } catch (err) {
      console.error('❌ Failed to speak:', err)
      error.value = err.message
      isSpeaking.value = false
      throw err
    }
  }

  /**
   * 고급 음성 제어를 위한 SSML (Speech Synthesis Markup Language) 생성
   *
   * @param {string} text - 읽을 텍스트
   * @param {string} voiceName - 음성 이름
   * @param {Object} options - 음성 옵션 (속도, 음높이, 음량)
   * @returns {string} SSML 문자열
   */
  function buildSSML(text, voiceName, options = {}) {
    const {
      rate = 1.0, // 0.5 - 2.0
      pitch = 0, // -50% ~ +50%
      volume = 100 // 0 - 100
    } = options

    // 속도를 퍼센트로 변환 (1.0 = 100%)
    const ratePercent = Math.round(rate * 100)

    // 음높이가 범위 내에 있는지 확인
    const pitchPercent = Math.max(-50, Math.min(50, pitch))

    // SSML 생성
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voiceName}">
          <prosody rate="${ratePercent}%" pitch="${pitchPercent >= 0 ? '+' : ''}${pitchPercent}%" volume="${volume}">
            ${escapeXML(text)}
          </prosody>
        </voice>
      </speak>
    `.trim()

    return ssml
  }

  /**
   * XML 특수 문자 이스케이프
   *
   * @param {string} text - 이스케이프할 텍스트
   * @returns {string} 이스케이프된 텍스트
   */
  function escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * 현재 음성 합성 중지
   */
  async function stop() {
    if (!isSpeaking.value) {
      return
    }

    try {
      // 즉시 중지하기 위해 합성기 닫고 재생성
      if (synthesizer) {
        synthesizer.close()
      }

      // 합성기 재생성
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput()
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)

      isSpeaking.value = false

      console.log('⏹️ Speech stopped')
    } catch (err) {
      console.error('❌ Failed to stop speech:', err)
      throw err
    }
  }

  /**
   * 모든 리소스 정리
   */
  function dispose() {
    if (synthesizer) {
      synthesizer.close()
      synthesizer = null
    }

    if (player) {
      player = null
    }

    speechConfig = null
    isInitialized.value = false
    isSpeaking.value = false

    console.log('🗑️ Azure TTS disposed')
  }

  return {
    // 상태
    isInitialized,
    isSpeaking,
    isConnecting,
    error,

    // 메서드
    initialize,
    speak,
    stop,
    dispose
  }
}
