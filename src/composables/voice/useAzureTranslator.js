/**
 * Azure 실시간 번역 페이지 로직
 *
 * 언어 선택, 음성 선택, 타이머, 통계 등 페이지 레벨 상태 관리
 */
import { ref, computed, watch } from 'vue'
import { useAzureSpeech } from '../useAzureSpeech'
import { useAzureTTS } from '../useAzureTTS'
import {
  SUPPORTED_LANGUAGES,
  TRANSLATION_LANGUAGES,
  getVoicesForLanguage,
  translationToTTS
} from '../../config/azureSpeechConfig'

export function useAzureTranslator() {
  // ============================================
  // Azure Speech & TTS Composables
  // ============================================
  const {
    isInitialized,
    isRecognizing,
    isConnecting,
    error: speechError,
    partialText,
    finalText,
    partialTranslation,
    finalTranslation,
    recognizedSentences,
    translatedSentences,
    fullOriginalText,
    fullTranslatedText,
    recognizedCount,
    fromLanguage,
    toLanguage,
    vadSilenceTimeout,
    phraseList,
    initialize,
    startRecognition,
    stopRecognition,
    updateVADSettings,
    addPhrases,
    clearPhrases,
    clearResults,
    dispose: disposeAzureSpeech
  } = useAzureSpeech()

  const {
    isSpeaking,
    error: ttsError,
    speak,
    stop: stopTTS,
    dispose: disposeAzureTTS
  } = useAzureTTS()

  // ============================================
  // State
  // ============================================
  const selectedFromLanguage = ref('ko-KR')
  const selectedToLanguage = ref('en')
  const selectedVoice = ref('')
  const showAdvanced = ref(false)
  const phraseListInput = ref('')

  // 타이머
  const startTime = ref(null)
  const elapsedTime = ref(0)
  let timerInterval = null

  // ============================================
  // Computed
  // ============================================

  // 사용 가능한 음성 목록
  const availableVoices = computed(() => {
    const ttsLang = translationToTTS(selectedToLanguage.value)
    return getVoicesForLanguage(ttsLang)
  })

  // 언어 레이블
  const fromLanguageLabel = computed(() => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === selectedFromLanguage.value)
    return lang ? lang.label : selectedFromLanguage.value
  })

  const toLanguageLabel = computed(() => {
    const lang = TRANSLATION_LANGUAGES.find(l => l.code === selectedToLanguage.value)
    return lang ? lang.label : selectedToLanguage.value
  })

  // 경과 시간 포맷
  const formattedElapsedTime = computed(() => {
    const seconds = Math.floor(elapsedTime.value / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 언어 변경 핸들러
   */
  async function handleLanguageChange() {
    if (isRecognizing.value) {
      return
    }

    // 음성 목록 업데이트
    const voices = availableVoices.value
    if (voices.length > 0) {
      selectedVoice.value = voices[0].value
    }

    // 초기화되어 있으면 재초기화
    if (isInitialized.value) {
      await disposeAzureSpeech()
      await initialize(selectedFromLanguage.value, selectedToLanguage.value)
    }
  }

  /**
   * 녹음 토글
   */
  async function handleToggleRecording() {
    if (isRecognizing.value) {
      await stopRecognition()
      stopTimer()
    } else {
      // 초기화되지 않았으면 초기화
      if (!isInitialized.value) {
        await initialize(selectedFromLanguage.value, selectedToLanguage.value)
      }

      await startRecognition()
      startTimer()
    }
  }

  /**
   * 번역 재생
   */
  async function handlePlayTranslation() {
    if (!finalTranslation.value) {
      return
    }

    try {
      await speak(finalTranslation.value, selectedVoice.value)
    } catch (error) {
      console.error('TTS 재생 실패:', error)
    }
  }

  /**
   * 전체 지우기
   */
  function handleClearAll() {
    clearResults()
    stopTimer()
    elapsedTime.value = 0
  }

  /**
   * 에러 지우기
   */
  function handleClearErrors() {
    speechError.value = null
    ttsError.value = null
  }

  /**
   * VAD 업데이트
   */
  function handleUpdateVAD() {
    updateVADSettings(vadSilenceTimeout.value)
  }

  /**
   * Phrase List 업데이트
   */
  function handleUpdatePhraseList() {
    if (!phraseListInput.value.trim()) {
      clearPhrases()
      return
    }

    const phrases = phraseListInput.value
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)

    clearPhrases()
    if (phrases.length > 0) {
      addPhrases(phrases)
    }
  }

  /**
   * 타이머 시작
   */
  function startTimer() {
    startTime.value = Date.now()
    timerInterval = setInterval(() => {
      elapsedTime.value = Date.now() - startTime.value
    }, 1000)
  }

  /**
   * 타이머 중지
   */
  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  /**
   * 결과 내보내기
   */
  function handleExportResults() {
    const data = {
      fromLanguage: selectedFromLanguage.value,
      toLanguage: selectedToLanguage.value,
      voice: selectedVoice.value,
      timestamp: new Date().toISOString(),
      elapsedTime: elapsedTime.value,
      original: {
        text: finalText.value,
        sentences: recognizedSentences.value
      },
      translated: {
        text: finalTranslation.value,
        sentences: translatedSentences.value
      }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voice-translation-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * 초기화
   */
  function initializeTranslator() {
    // 기본 음성 설정
    const voices = availableVoices.value
    if (voices.length > 0) {
      selectedVoice.value = voices[0].value
    }
  }

  /**
   * 정리
   */
  function cleanup() {
    stopTimer()
    disposeAzureSpeech()
    disposeAzureTTS()
  }

  // ============================================
  // Watchers
  // ============================================

  // 출력 언어 변경 시 음성 자동 업데이트
  watch(availableVoices, (newVoices) => {
    if (newVoices.length > 0 && !newVoices.find(v => v.value === selectedVoice.value)) {
      selectedVoice.value = newVoices[0].value
    }
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    selectedFromLanguage,
    selectedToLanguage,
    selectedVoice,
    showAdvanced,
    phraseListInput,
    elapsedTime,

    // Azure Speech State
    isInitialized,
    isRecognizing,
    isConnecting,
    speechError,
    partialText,
    finalText,
    partialTranslation,
    finalTranslation,
    recognizedSentences,
    translatedSentences,
    fullOriginalText,
    fullTranslatedText,
    recognizedCount,
    vadSilenceTimeout,

    // Azure TTS State
    isSpeaking,
    ttsError,

    // Computed
    availableVoices,
    fromLanguageLabel,
    toLanguageLabel,
    formattedElapsedTime,

    // Constants
    SUPPORTED_LANGUAGES,
    TRANSLATION_LANGUAGES,

    // Actions
    handleLanguageChange,
    handleToggleRecording,
    handlePlayTranslation,
    handleClearAll,
    handleClearErrors,
    handleUpdateVAD,
    handleUpdatePhraseList,
    handleExportResults,
    initializeTranslator,
    cleanup
  }
}
