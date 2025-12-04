/**
 * Practice TTS Composable
 *
 * 회화 연습 페이지의 AI 응답 음성 출력을 담당합니다.
 * - Azure Neural Voices를 사용한 AI 응답 읽기
 * - 자동/수동 재생 모드 지원
 * - 언어별 음성 자동 선택
 *
 * @module usePracticeTTS
 */
import { ref, watch, onUnmounted } from 'vue'
import { useAzureTTS } from '@/composables/useAzureTTS'

/**
 * 언어별 기본 음성 매핑
 * Azure Neural Voice 이름
 */
const VOICE_MAP = {
  'en-US': 'en-US-JennyNeural',
  'en-GB': 'en-GB-SoniaNeural',
  'ko-KR': 'ko-KR-SunHiNeural',
  'ja-JP': 'ja-JP-NanamiNeural',
  'zh-CN': 'zh-CN-XiaoxiaoNeural',
  'zh-TW': 'zh-TW-HsiaoChenNeural',
  'es-ES': 'es-ES-ElviraNeural',
  'fr-FR': 'fr-FR-DeniseNeural',
  'de-DE': 'de-DE-KatjaNeural'
}

/**
 * Practice TTS 로직
 *
 * @param {Object} options - 옵션
 * @param {Ref<Object>} options.scenario - 시나리오 ref (언어 정보 포함)
 * @returns {Object} TTS 상태 및 메서드
 */
export function usePracticeTTS({ scenario }) {
  // ============================================
  // Azure TTS Composable
  // ============================================
  const {
    isInitialized,
    isSpeaking,
    isConnecting,
    error: ttsError,
    initialize,
    speak,
    stop,
    dispose
  } = useAzureTTS()

  // ============================================
  // State
  // ============================================
  const autoPlayEnabled = ref(true) // 자동 재생 활성화 여부
  const ttsEnabled = ref(true) // TTS 기능 활성화 여부
  const currentVoice = ref('en-US-JennyNeural')
  const speakingMessageIndex = ref(-1) // 현재 읽고 있는 메시지 인덱스

  // ============================================
  // Actions
  // ============================================

  /**
   * 언어 코드에 맞는 음성 가져오기
   *
   * @param {string} language - 언어 코드 (예: en-US, ko-KR)
   * @returns {string} 음성 이름
   */
  const getVoiceForLanguage = (language) => {
    return VOICE_MAP[language] || VOICE_MAP['en-US']
  }

  /**
   * 시나리오 언어에 따라 음성 업데이트
   */
  const updateVoiceFromScenario = () => {
    if (scenario.value?.language) {
      currentVoice.value = getVoiceForLanguage(scenario.value.language)
    }
  }

  /**
   * AI 응답 읽기
   *
   * @param {string} text - 읽을 텍스트
   * @param {number} messageIndex - 메시지 인덱스 (선택)
   * @param {Object} options - 추가 옵션
   * @returns {Promise<void>}
   */
  const speakAiResponse = async (text, messageIndex = -1, options = {}) => {
    if (!ttsEnabled.value || !text || !text.trim()) {
      return
    }

    try {
      // 시나리오 언어에 맞는 음성 선택
      updateVoiceFromScenario()

      speakingMessageIndex.value = messageIndex

      await speak(text, currentVoice.value, {
        rate: options.rate || 0.3,  // 기본 70% 느리게 (회화 학습용)
        pitch: options.pitch || 0,
        volume: options.volume || 100
      })

      speakingMessageIndex.value = -1
    } catch (err) {
      console.error('❌ TTS speak error:', err)
      speakingMessageIndex.value = -1
      throw err
    }
  }

  /**
   * 재생 중지
   */
  const stopSpeaking = async () => {
    try {
      await stop()
      speakingMessageIndex.value = -1
    } catch (err) {
      console.error('❌ TTS stop error:', err)
    }
  }

  /**
   * 자동 재생 토글
   */
  const toggleAutoPlay = () => {
    autoPlayEnabled.value = !autoPlayEnabled.value
  }

  /**
   * TTS 기능 토글
   */
  const toggleTTS = () => {
    ttsEnabled.value = !ttsEnabled.value

    // TTS 비활성화 시 재생 중지
    if (!ttsEnabled.value && isSpeaking.value) {
      stopSpeaking()
    }
  }

  /**
   * TTS 초기화
   */
  const initializeTTS = async () => {
    if (isInitialized.value) {
      return
    }

    try {
      await initialize()
      updateVoiceFromScenario()
    } catch (err) {
      console.error('TTS initialization failed:', err)
      throw err
    }
  }

  // ============================================
  // Watchers
  // ============================================

  // 시나리오 변경 시 음성 업데이트
  watch(
    () => scenario.value?.language,
    () => {
      updateVoiceFromScenario()
    }
  )

  // TTS 재생 완료 시 speakingMessageIndex 자동 리셋
  watch(
    () => isSpeaking.value,
    (newValue) => {
      if (!newValue && speakingMessageIndex.value !== -1) {
        speakingMessageIndex.value = -1
      }
    }
  )

  // ============================================
  // Cleanup
  // ============================================

  onUnmounted(() => {
    dispose()
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    ttsEnabled,
    autoPlayEnabled,
    isSpeaking,
    isConnecting,
    isInitialized,
    ttsError,
    currentVoice,
    speakingMessageIndex,

    // Actions
    initializeTTS,
    speakAiResponse,
    stopSpeaking,
    toggleAutoPlay,
    toggleTTS,
    getVoiceForLanguage
  }
}
