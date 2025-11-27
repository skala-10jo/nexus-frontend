/**
 * Azure Speech STT Composable (공식 Azure Speech SDK 사용)
 *
 * 브라우저 SDK 기반 구조:
 * - Frontend: Azure Speech SDK로 직접 STT 수행 (마이크 → Azure)
 * - Backend: 번역만 담당 (TranslationAgent)
 *
 * 오디오 처리:
 * - Azure Speech SDK가 자동으로 마이크 입력 처리 (WebSocket 내장)
 * - AudioConfig.fromDefaultMicrophoneInput() 사용
 *
 * 인증:
 * - Backend에서 임시 토큰 발급 (/api/ai/speech/token)
 * - Subscription Key 노출 방지
 *
 * 다국어 지원:
 * - AutoDetectSourceLanguageConfig로 자동 언어 감지
 * - 인식된 언어로부터 다른 언어로 번역 (Backend Agent)
 *
 * @example
 * import { useAzureSTT } from '@/composables/useAzureSTT'
 *
 * const {
 *   isRecording,
 *   translationCards,
 *   startRecording,
 *   stopRecording
 * } = useAzureSTT()
 *
 * // 다국어 STT + 번역 시작
 * await startRecording(['ko-KR', 'en-US', 'ja-JP', 'vi-VN'])
 */
import { ref, onUnmounted } from 'vue'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { pythonAPI } from '@/services/api'

export function useAzureSTT() {
  // 상태
  const isRecording = ref(false)
  const isConnected = ref(false)
  const error = ref(null)

  // 번역 카드 목록
  const translationCards = ref([])
  const recognizingText = ref('')

  // Azure Speech SDK 인스턴스
  let recognizer = null

  /**
   * 녹음 시작 (Azure Speech SDK 사용)
   *
   * @param {string[]} selectedLanguages - 선택된 언어 목록 (BCP-47)
   *   예: ['ko-KR', 'en-US', 'ja-JP', 'vi-VN']
   */
  async function startRecording(selectedLanguages = ['ko-KR', 'en-US']) {
    try {
      error.value = null

      // 언어 검증
      if (!selectedLanguages || selectedLanguages.length < 2) {
        throw new Error('최소 2개 이상의 언어를 선택해야 합니다')
      }

      console.log('🎤 Starting Azure Speech SDK recognition...')
      console.log('📋 Selected languages:', selectedLanguages)

      // 1. 백엔드에서 임시 토큰 발급
      const tokenResponse = await pythonAPI.get('/speech/token')
      const { token, region } = tokenResponse.data.data

      console.log('✅ Token received from backend')
      console.log('🌏 Region:', region)

      // 2. SpeechConfig 생성 (토큰 인증)
      const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)
      speechConfig.speechRecognitionLanguage = selectedLanguages[0] // 기본 언어

      // 3. AutoDetectSourceLanguageConfig 생성 (다국어 자동 감지)
      const autoDetectConfig = SpeechSDK.AutoDetectSourceLanguageConfig.fromLanguages(
        selectedLanguages
      )

      // 4. AudioConfig 생성 (기본 마이크)
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

      // 5. SpeechRecognizer 생성
      recognizer = SpeechSDK.SpeechRecognizer.FromConfig(
        speechConfig,
        autoDetectConfig,
        audioConfig
      )

      console.log('🔧 SpeechRecognizer created')

      // 6. 이벤트 핸들러 설정

      // 중간 인식 결과 (실시간)
      recognizer.recognizing = (sender, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
          recognizingText.value = event.result.text
          console.log('🔍 Recognizing:', event.result.text)
        }
      }

      // 최종 인식 결과
      recognizer.recognized = async (sender, event) => {
        if (event.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
          const recognizedText = event.result.text
          const detectedLanguage = event.result.language || selectedLanguages[0]

          console.log('✅ Recognized:', recognizedText)
          console.log('🌐 Detected language:', detectedLanguage)

          recognizingText.value = ''

          if (recognizedText && recognizedText.trim()) {
            // 백엔드로 번역 요청 (인식된 언어 제외한 나머지 언어로 번역)
            try {
              const translations = await translateToMultipleLanguages(
                recognizedText,
                detectedLanguage,
                selectedLanguages
              )

              // 번역 카드 추가
              translationCards.value.unshift({
                id: Date.now(),
                original: recognizedText,
                detectedLang: detectedLanguage,
                translations: translations,
                timestamp: new Date().toISOString()
              })

              // 최대 50개 카드만 유지
              if (translationCards.value.length > 50) {
                translationCards.value = translationCards.value.slice(0, 50)
              }

              console.log('📝 Translation card added')
            } catch (err) {
              console.error('❌ Translation failed:', err)
              error.value = '번역 실패: ' + err.message
            }
          }
        } else if (event.result.reason === SpeechSDK.ResultReason.NoMatch) {
          console.log('⚠️ No speech recognized')
        }
      }

      // 인식 취소/에러
      recognizer.canceled = (sender, event) => {
        console.log('❌ Recognition canceled:', event.reason)

        if (event.reason === SpeechSDK.CancellationReason.Error) {
          console.error('❌ Error details:', event.errorDetails)
          error.value = `인식 오류: ${event.errorDetails}`
        }

        stopRecording()
      }

      // 세션 시작
      recognizer.sessionStarted = (sender, event) => {
        console.log('🟢 Session started')
        isConnected.value = true
      }

      // 세션 종료
      recognizer.sessionStopped = (sender, event) => {
        console.log('🔴 Session stopped')
        isConnected.value = false
      }

      // 7. 연속 인식 시작
      recognizer.startContinuousRecognitionAsync(
        () => {
          console.log('🎙️ Continuous recognition started')
          isRecording.value = true
        },
        (err) => {
          console.error('❌ Failed to start recognition:', err)
          error.value = '인식 시작 실패: ' + err
          cleanup()
        }
      )
    } catch (err) {
      console.error('❌ Failed to start recording:', err)
      error.value = err.message || '녹음 시작 실패'
      cleanup()
      throw err
    }
  }

  /**
   * 다국어 번역 (백엔드 TranslationAgent 호출)
   *
   * @param {string} text - 인식된 원문
   * @param {string} sourceLang - 감지된 언어 (BCP-47: ko-KR, en-US 등)
   * @param {string[]} selectedLanguages - 전체 선택 언어 목록
   * @returns {Promise<Array>} 번역 결과 배열
   */
  async function translateToMultipleLanguages(text, sourceLang, selectedLanguages) {
    // BCP-47 → ISO 639-1 변환 (ko-KR → ko, en-US → en)
    const sourceIso = sourceLang.split('-')[0]

    // 원본 언어 제외한 목표 언어 추출
    const targetLanguages = selectedLanguages
      .filter(lang => !lang.startsWith(sourceIso)) // ko-KR이면 ko로 시작하는 모든 언어 제외
      .map(lang => lang.split('-')[0]) // BCP-47 → ISO 639-1

    if (targetLanguages.length === 0) {
      return []
    }

    console.log('🔄 Translating:', {
      text,
      from: sourceIso,
      to: targetLanguages
    })

    // 백엔드 번역 API 호출
    const response = await pythonAPI.post('/translate/multi', {
      text: text,
      source_lang: sourceIso,
      target_langs: targetLanguages
    })

    return response.data.translations || []
  }

  /**
   * 녹음 중지
   */
  function stopRecording() {
    try {
      console.log('⏹️ Stopping recording...')

      if (recognizer) {
        recognizer.stopContinuousRecognitionAsync(
          () => {
            console.log('✅ Recognition stopped')
            cleanup()
          },
          (err) => {
            console.error('❌ Failed to stop recognition:', err)
            cleanup()
          }
        )
      } else {
        cleanup()
      }
    } catch (err) {
      console.error('❌ Failed to stop recording:', err)
      error.value = err.message || '녹음 중지 실패'
      cleanup()
    }
  }

  /**
   * 번역 카드 초기화
   */
  function clearCards() {
    translationCards.value = []
    console.log('🗑️ Translation cards cleared')
  }

  /**
   * 리소스 정리
   */
  function cleanup() {
    if (recognizer) {
      recognizer.close()
      recognizer = null
    }

    isRecording.value = false
    isConnected.value = false
    recognizingText.value = ''
  }

  // 컴포넌트 언마운트 시 자동 정리
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 상태
    isRecording,
    isConnected,
    error,

    // 데이터
    translationCards,
    recognizingText,

    // 메서드
    startRecording,
    stopRecording,
    clearCards
  }
}
