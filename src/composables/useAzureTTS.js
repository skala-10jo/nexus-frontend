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

  // Web Audio API 인스턴스 (재생 제어용)
  let currentAudioContext = null
  let currentSource = null

  /**
   * 백엔드에서 토큰을 받아 Azure TTS 초기화
   *
   * @param {boolean} forceRefresh - 토큰 강제 갱신 여부
   * @throws {Error} 초기화 실패 시
   */
  async function initialize(forceRefresh = false) {
    if (isInitialized.value && !forceRefresh) {
      return
    }

    // 강제 갱신 시 기존 리소스 정리
    if (forceRefresh) {
      dispose()
    }

    try {
      isConnecting.value = true
      error.value = null

      // 강제 갱신 시 캐시 클리어
      if (forceRefresh) {
        speechStore.clearToken()
      }

      // 스토어에서 토큰 가져오기 (캐싱 지원)
      const { token, region } = await speechStore.ensureToken()

      // Speech 설정 생성
      speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)

      // 오디오 출력 없이 합성만 수행 (Web Audio API로 직접 재생)
      // null을 전달하면 오디오 데이터만 반환하고 자동 재생하지 않음
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, null)

      isInitialized.value = true
      isConnecting.value = false
    } catch (err) {
      console.error('Failed to initialize Azure TTS:', err)
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
   * @param {boolean} options._isRetry - 내부 재시도 플래그 (사용자 지정 금지)
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

      // 음성 합성 (오디오 데이터만 받기)
      const audioData = await new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              resolve(result.audioData)
            } else {
              const errorDetails = result.errorDetails
              console.error('❌ Speech synthesis failed:', errorDetails)
              error.value = errorDetails
              reject(new Error(errorDetails))
            }
          },
          err => {
            console.error('❌ Speech synthesis error:', err)
            error.value = err
            reject(err)
          }
        )
      })

      // Web Audio API로 직접 재생 (정확한 완료 감지)
      if (audioData && audioData.byteLength > 0) {
        // 기존 재생 중인 오디오 정리
        if (currentSource) {
          try {
            currentSource.stop()
          } catch (e) {
            // 이미 중지된 경우 무시
          }
        }
        if (currentAudioContext) {
          try {
            currentAudioContext.close()
          } catch (e) {
            // 이미 닫힌 경우 무시
          }
        }

        currentAudioContext = new (window.AudioContext || window.webkitAudioContext)()

        try {
          // ArrayBuffer를 AudioBuffer로 디코딩
          const audioBuffer = await currentAudioContext.decodeAudioData(audioData.slice(0))

          // AudioBufferSourceNode 생성
          currentSource = currentAudioContext.createBufferSource()
          currentSource.buffer = audioBuffer
          currentSource.connect(currentAudioContext.destination)

          // 재생 완료 이벤트
          await new Promise((resolve) => {
            currentSource.onended = () => {
              isSpeaking.value = false
              if (currentAudioContext) {
                currentAudioContext.close()
                currentAudioContext = null
              }
              currentSource = null
              resolve()
            }
            currentSource.start(0)
          })
        } catch (decodeError) {
          console.error('❌ Audio decode error:', decodeError)
          isSpeaking.value = false
          currentAudioContext = null
          currentSource = null
          throw decodeError
        }
      }
    } catch (err) {
      console.error('❌ Failed to speak:', err)
      error.value = err.message
      isSpeaking.value = false

      // StatusCode 1006 (WebSocket 연결 실패) 또는 토큰 관련 오류 시 재시도
      const errorStr = String(err.message || err)
      const isConnectionError = errorStr.includes('1006') ||
                                errorStr.includes('Unable to contact server') ||
                                errorStr.includes('WebSocket')

      if (isConnectionError && !options._isRetry) {
        await initialize(true)  // 토큰 강제 갱신
        return speak(text, voiceName, { ...options, _isRetry: true })
      }

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
      // Web Audio API 재생 중지
      if (currentSource) {
        try {
          currentSource.onended = null  // 이벤트 핸들러 제거 (중복 호출 방지)
          currentSource.stop()
        } catch (e) {
          // 이미 중지된 경우 무시
        }
        currentSource = null
      }

      if (currentAudioContext) {
        try {
          currentAudioContext.close()
        } catch (e) {
          // 이미 닫힌 경우 무시
        }
        currentAudioContext = null
      }

      isSpeaking.value = false
    } catch (err) {
      console.error('❌ Failed to stop speech:', err)
      isSpeaking.value = false
      throw err
    }
  }

  /**
   * 모든 리소스 정리
   */
  function dispose() {
    // Web Audio API 정리
    if (currentSource) {
      try {
        currentSource.onended = null
        currentSource.stop()
      } catch (e) {
        // 이미 중지된 경우 무시
      }
      currentSource = null
    }

    if (currentAudioContext) {
      try {
        currentAudioContext.close()
      } catch (e) {
        // 이미 닫힌 경우 무시
      }
      currentAudioContext = null
    }

    // Azure SDK 정리
    if (synthesizer) {
      synthesizer.close()
      synthesizer = null
    }

    speechConfig = null
    isInitialized.value = false
    isSpeaking.value = false
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
