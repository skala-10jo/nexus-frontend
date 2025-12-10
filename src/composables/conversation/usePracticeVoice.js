/**
 * Practice 음성 입력 Composable
 *
 * 회화 연습 페이지의 음성 입력 및 아바타 관리를 담당합니다.
 * - 음성/텍스트 입력 모드 전환
 * - STT (Speech-to-Text) 녹음
 * - 아바타 모드 관리
 *
 * @module usePracticeVoice
 */
import { ref, computed } from 'vue'
import { useRealtimeSTT } from '@/composables/useRealtimeSTT'

/**
 * Practice 음성 입력 로직
 *
 * @param {Object} options - 옵션
 * @param {Ref<string>} options.userInput - 사용자 입력 ref
 * @param {Function} options.onSendMessage - 메시지 전송 콜백
 * @param {Ref<Object>} options.scenario - 시나리오 ref (언어 정보 포함)
 * @returns {Object} 음성 입력 상태 및 메서드
 */
export function usePracticeVoice({ userInput, onSendMessage, scenario }) {
  // ============================================
  // Realtime STT Composable
  // ============================================
  const {
    isRecording: sttIsRecording,
    isConnecting: sttIsConnecting,
    isConnected: sttIsConnected,
    error: sttError,
    interimText: sttInterimText,
    finalTexts: sttFinalTexts,
    fullText: sttFullText,
    recordingTime: sttRecordingTime,
    startRecording: startRealtimeSTT,
    stopRecording: stopRealtimeSTT,
    clearResults: clearSTTResults,
    setOnAutoRecognized,
    setTTSPlaying
  } = useRealtimeSTT()

  // ============================================
  // State
  // ============================================
  const inputMode = ref('text') // 'text' | 'voice'
  const isProcessingVoice = ref(false)
  const recognizedText = ref('')
  const lastAudioBlob = ref(null)  // 마지막 녹음된 오디오 (발음 평가용)

  // STT 모드: 'manual' (수동 종료) | 'auto' (자동 분절 - 침묵 감지)
  const sttMode = ref('manual')

  // Avatar
  const avatarEnabled = ref(false)
  const isAvatarInitializing = ref(false)
  const avatarVideoElement = ref(null)

  // ============================================
  // Computed (STT 상태 래핑)
  // ============================================
  const isRecording = computed(() => sttIsRecording.value)
  const isConnecting = computed(() => sttIsConnecting.value)
  const interimText = computed(() => sttInterimText.value)
  const finalTexts = computed(() => sttFinalTexts.value)
  const recordingTime = computed(() => sttRecordingTime.value)

  // ============================================
  // Actions
  // ============================================

  /**
   * 입력 모드 전환 (텍스트 ↔ 음성)
   * 텍스트 모드로 전환 시 아바타 자동 비활성화
   */
  const toggleInputMode = () => {
    const newMode = inputMode.value === 'text' ? 'voice' : 'text'
    inputMode.value = newMode

    // 텍스트 모드로 전환 시 아바타 비활성화
    if (newMode === 'text' && avatarEnabled.value) {
      avatarEnabled.value = false
    }
  }

  /**
   * ISO 639-1 → BCP-47 변환
   * Azure Speech SDK는 BCP-47 형식 필요 (en → en-US)
   */
  const toBCP47 = (lang) => {
    const mapping = {
      'en': 'en-US',
      'ko': 'ko-KR',
      'ja': 'ja-JP',
      'zh': 'zh-CN',
      'vi': 'vi-VN',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE'
    }
    // 이미 BCP-47 형식이면 그대로 반환
    if (lang && lang.includes('-')) {
      return lang
    }
    return mapping[lang] || 'en-US'
  }

  /**
   * STT 모드 토글 (수동 ↔ 자동)
   */
  const toggleSTTMode = () => {
    sttMode.value = sttMode.value === 'manual' ? 'auto' : 'manual'
    console.log(`STT mode changed to: ${sttMode.value}`)
  }

  /**
   * 자동 모드에서 인식 완료 시 메시지 전송 (녹음은 계속 유지)
   * @param {string} text - 인식된 텍스트
   * @param {Blob|null} audioBlob - 해당 세그먼트의 오디오 Blob (발음 평가용)
   */
  const handleAutoRecognized = async (text, audioBlob = null) => {
    // 인식된 텍스트를 입력에 설정
    recognizedText.value = text
    userInput.value = text

    // 오디오 저장 (발음 평가용)
    if (audioBlob) {
      lastAudioBlob.value = audioBlob
    }

    // 녹음은 중지하지 않음! (자동 모드에서는 계속 녹음 유지)
    // 사용자가 Stop 버튼을 누를 때까지 계속 대화 가능

    // 메시지 전송
    if (onSendMessage) {
      await onSendMessage()
    }

    // 다음 발화를 위해 상태 초기화
    recognizedText.value = ''
    clearSTTResults()
  }

  /**
   * 녹음 시작
   * 시나리오에 지정된 언어로 STT 수행 (언어 감지 없이 단일 언어)
   */
  const startRecording = async () => {
    try {
      recognizedText.value = ''
      clearSTTResults()

      // 시나리오 언어를 BCP-47 형식으로 변환
      const rawLang = scenario?.value?.language || 'en'
      const language = toBCP47(rawLang)

      // STT 모드에 따라 autoSegment 옵션 설정
      const autoSegment = sttMode.value === 'auto'

      // 자동 모드일 때 콜백 설정
      if (autoSegment) {
        setOnAutoRecognized(handleAutoRecognized)
      } else {
        setOnAutoRecognized(null)
      }

      await startRealtimeSTT(language, { autoSegment })
      console.log(`Recording started with language: ${language} (from: ${rawLang}), autoSegment: ${autoSegment}`)
    } catch (err) {
      console.error('Failed to start recording:', err)
      throw new Error(sttError.value || '마이크 권한을 허용해주세요.')
    }
  }

  /**
   * 녹음 중지 및 메시지 전송
   */
  const stopRecording = async () => {
    // 최종 텍스트와 오디오 가져오기
    const result = stopRealtimeSTT()

    // result가 객체인 경우와 문자열인 경우 모두 처리
    let fullText = ''
    let audioBlob = null

    if (result && typeof result === 'object') {
      fullText = result.text || ''
      audioBlob = result.audioBlob || null
    } else if (typeof result === 'string') {
      fullText = result
    }

    // 오디오 저장 (발음 평가용)
    if (audioBlob) {
      lastAudioBlob.value = audioBlob
      console.log('🎙️ Audio blob saved for pronunciation assessment:', audioBlob.size, 'bytes')
    }

    if (fullText && fullText.trim()) {
      recognizedText.value = fullText
      userInput.value = fullText

      // 자동 전송
      isProcessingVoice.value = true

      setTimeout(async () => {
        isProcessingVoice.value = false

        if (onSendMessage) {
          await onSendMessage()
        }
      }, 500)
    } else {
      recognizedText.value = ''
      lastAudioBlob.value = null  // 텍스트 없으면 오디오도 버림
    }
  }

  /**
   * 아바타 모드 토글
   */
  const toggleAvatar = () => {
    avatarEnabled.value = !avatarEnabled.value
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    inputMode,
    isProcessingVoice,
    recognizedText,
    lastAudioBlob,  // 마지막 녹음된 오디오 (발음 평가용)
    sttMode,        // STT 모드: 'manual' | 'auto'
    avatarEnabled,
    isAvatarInitializing,
    avatarVideoElement,

    // STT Computed
    isRecording,
    isConnecting,
    interimText,
    finalTexts,
    recordingTime,

    // Actions
    toggleInputMode,
    toggleSTTMode,  // STT 모드 토글 (수동 ↔ 자동)
    startRecording,
    stopRecording,
    toggleAvatar,
    setTTSPlaying   // TTS 재생 상태 설정 (에코 방지용)
  }
}
