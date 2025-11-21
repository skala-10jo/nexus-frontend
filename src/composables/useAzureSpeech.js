/**
 * Azure Speech Composable
 *
 * Azure Speech SDK를 사용한 실시간 음성-텍스트 변환 및 번역 처리
 *
 * 주요 기능:
 * - 마이크를 통한 실시간 음성 인식
 * - 목표 언어로 동시 번역
 * - 부분(인식 중) 및 최종(인식 완료) 결과 제공
 * - VAD (음성 활동 감지) 설정
 * - 특정 용어 인식률 향상을 위한 구문 목록 지원
 * - 에러 처리 및 재연결
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/
 */
import { ref, computed } from 'vue'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { useAzureSpeechStore } from '../stores/azureSpeechStore'
import { recognitionToTranslation } from '../config/azureSpeechConfig'

export function useAzureSpeech() {
  // Pinia 스토어 (싱글톤)
  const speechStore = useAzureSpeechStore()

  // 상태
  const isInitialized = ref(false)
  const isRecognizing = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // 인식 결과
  const partialText = ref('')
  const finalText = ref('')
  const partialTranslation = ref('')
  const finalTranslation = ref('')

  // 인식된 모든 문장
  const recognizedSentences = ref([])
  const translatedSentences = ref([])

  // Azure SDK 인스턴스
  let speechConfig = null
  let audioConfig = null
  let translationRecognizer = null

  // 설정
  const fromLanguage = ref('ko-KR')
  const toLanguage = ref('en')

  // VAD 설정
  const vadSilenceTimeout = ref(1000) // ms, 기본값 1000ms

  // 인식률 향상을 위한 구문 목록
  const phraseList = ref([])

  /**
   * 백엔드에서 토큰을 받아 Azure Speech SDK 초기화
   *
   * @param {string} sourceLang - 원본 언어 (BCP-47 형식, 예: 'ko-KR')
   * @param {string} targetLang - 목표 언어 (2글자 ISO 코드, 예: 'en')
   * @throws {Error} 초기화 실패 시
   */
  async function initialize(sourceLang, targetLang) {
    try {
      isConnecting.value = true
      error.value = null

      // 스토어에서 토큰 가져오기 (캐싱 지원)
      const { token, region } = await speechStore.ensureToken()

      // Speech 설정 생성
      speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(token, region)

      // 원본 언어 설정 (인식)
      speechConfig.speechRecognitionLanguage = sourceLang
      fromLanguage.value = sourceLang

      // 목표 언어 설정 (번역)
      speechConfig.addTargetLanguage(targetLang)
      toLanguage.value = targetLang

      // VAD 설정
      // Speech_SegmentationSilenceTimeoutMs: 발화 종료로 간주하기 전 대기 시간
      // 낮은 값 (700ms): 빠른 응답, 발화가 잘릴 수 있음
      // 높은 값 (1500ms): 긴 문장에 유리, 응답 느림
      speechConfig.setProperty(
        SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
        vadSilenceTimeout.value.toString()
      )

      // 상세 결과 활성화
      speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed

      // 기본 마이크에서 오디오 설정 생성
      audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

      // 번역 인식기 생성
      translationRecognizer = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig)

      // 이벤트 핸들러 설정
      setupEventHandlers()

      // 구문 목록이 있으면 적용
      if (phraseList.value.length > 0) {
        applyPhraseList()
      }

      isInitialized.value = true
      isConnecting.value = false

      console.log('✅ Azure Speech SDK initialized successfully')
      console.log(`   Source: ${sourceLang}, Target: ${targetLang}`)
    } catch (err) {
      console.error('❌ Failed to initialize Azure Speech SDK:', err)
      error.value = err.message
      isConnecting.value = false
      throw err
    }
  }

  /**
   * 번역 인식기의 이벤트 핸들러 설정
   */
  function setupEventHandlers() {
    if (!translationRecognizer) return

    // 인식 중 (부분 결과)
    translationRecognizer.recognizing = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.TranslatingSpeech) {
        // 원본 텍스트 (부분)
        partialText.value = e.result.text

        // 번역된 텍스트 (부분)
        const translations = e.result.translations
        if (translations.get(toLanguage.value)) {
          partialTranslation.value = translations.get(toLanguage.value)
        }

        console.log(`🎤 Recognizing: "${e.result.text}"`)
        console.log(`🌐 Translating: "${partialTranslation.value}"`)
      }
    }

    // 인식 완료 (최종 결과)
    translationRecognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
        const originalText = e.result.text
        const translations = e.result.translations
        const translatedText = translations.get(toLanguage.value) || ''

        if (originalText && originalText.trim()) {
          // 최종 텍스트에 추가
          finalText.value += (finalText.value ? ' ' : '') + originalText
          finalTranslation.value += (finalTranslation.value ? ' ' : '') + translatedText

          // 문장 배열에 추가
          recognizedSentences.value.push({
            text: originalText,
            timestamp: new Date().toISOString(),
            confidence: e.result.properties.getProperty(
              SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
            )
          })

          translatedSentences.value.push({
            text: translatedText,
            timestamp: new Date().toISOString()
          })

          console.log(`✅ Recognized: "${originalText}"`)
          console.log(`✅ Translated: "${translatedText}"`)
        }

        // 부분 결과 초기화
        partialText.value = ''
        partialTranslation.value = ''
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('⚠️ No speech could be recognized')
      }
    }

    // 취소됨 (에러 처리)
    translationRecognizer.canceled = (s, e) => {
      console.error('❌ Recognition canceled:', e.errorDetails)

      if (e.reason === SpeechSDK.CancellationReason.Error) {
        error.value = e.errorDetails

        // 토큰 만료 처리
        if (e.errorDetails.includes('authentication') || e.errorDetails.includes('token')) {
          console.log('🔄 Token expired, need to reinitialize')
        }
      }

      stopRecognition()
    }

    // 세션 시작됨
    translationRecognizer.sessionStarted = (s, e) => {
      console.log('🎙️ Speech recognition session started')
    }

    // 세션 중지됨
    translationRecognizer.sessionStopped = (s, e) => {
      console.log('⏹️ Speech recognition session stopped')
      isRecognizing.value = false
    }
  }

  /**
   * 특정 용어 인식률 향상을 위한 구문 목록 적용
   */
  function applyPhraseList() {
    if (!translationRecognizer || phraseList.value.length === 0) return

    const grammar = SpeechSDK.PhraseListGrammar.fromRecognizer(translationRecognizer)

    phraseList.value.forEach(phrase => {
      grammar.addPhrase(phrase)
    })

    console.log(`📝 Applied ${phraseList.value.length} phrases to recognition`)
  }

  /**
   * 연속 음성 인식 및 번역 시작
   */
  async function startRecognition() {
    if (!isInitialized.value) {
      throw new Error('Speech SDK not initialized. Call initialize() first.')
    }

    if (isRecognizing.value) {
      console.warn('⚠️ Recognition already running')
      return
    }

    try {
      error.value = null
      isRecognizing.value = true

      await translationRecognizer.startContinuousRecognitionAsync()

      console.log('▶️ Started continuous recognition')
    } catch (err) {
      console.error('❌ Failed to start recognition:', err)
      error.value = err.message
      isRecognizing.value = false
      throw err
    }
  }

  /**
   * 연속 음성 인식 중지
   */
  async function stopRecognition() {
    if (!isRecognizing.value) {
      return
    }

    try {
      await translationRecognizer.stopContinuousRecognitionAsync()

      isRecognizing.value = false

      console.log('⏹️ Stopped continuous recognition')
    } catch (err) {
      console.error('❌ Failed to stop recognition:', err)
      throw err
    }
  }

  /**
   * VAD 무음 타임아웃 업데이트
   *
   * @param {number} timeoutMs - 무음 타임아웃(밀리초) (700-1500 권장)
   */
  function updateVADSettings(timeoutMs) {
    vadSilenceTimeout.value = timeoutMs

    if (speechConfig) {
      speechConfig.setProperty(
        SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
        timeoutMs.toString()
      )

      console.log(`⚙️ Updated VAD silence timeout to ${timeoutMs}ms`)
    }
  }

  /**
   * 인식률 향상을 위한 구문 추가
   *
   * @param {string[]} phrases - 구문 배열
   */
  function addPhrases(phrases) {
    phraseList.value = [...phraseList.value, ...phrases]

    if (translationRecognizer) {
      applyPhraseList()
    }
  }

  /**
   * 구문 목록 초기화
   */
  function clearPhrases() {
    phraseList.value = []
  }

  /**
   * 모든 인식 결과 초기화
   */
  function clearResults() {
    partialText.value = ''
    finalText.value = ''
    partialTranslation.value = ''
    finalTranslation.value = ''
    recognizedSentences.value = []
    translatedSentences.value = []
  }

  /**
   * 모든 리소스 정리
   */
  function dispose() {
    if (translationRecognizer) {
      translationRecognizer.close()
      translationRecognizer = null
    }

    speechConfig = null
    audioConfig = null
    isInitialized.value = false
    isRecognizing.value = false

    console.log('🗑️ Azure Speech SDK disposed')
  }

  // 계산된 값
  const fullOriginalText = computed(() => {
    return finalText.value + (partialText.value ? ' ' + partialText.value : '')
  })

  const fullTranslatedText = computed(() => {
    return finalTranslation.value + (partialTranslation.value ? ' ' + partialTranslation.value : '')
  })

  const recognizedCount = computed(() => recognizedSentences.value.length)

  return {
    // 상태
    isInitialized,
    isRecognizing,
    isConnecting,
    error,

    // 결과
    partialText,
    finalText,
    partialTranslation,
    finalTranslation,
    recognizedSentences,
    translatedSentences,
    fullOriginalText,
    fullTranslatedText,
    recognizedCount,

    // 설정
    fromLanguage,
    toLanguage,
    vadSilenceTimeout,
    phraseList,

    // 메서드
    initialize,
    startRecognition,
    stopRecognition,
    updateVADSettings,
    addPhrases,
    clearPhrases,
    clearResults,
    dispose
  }
}
