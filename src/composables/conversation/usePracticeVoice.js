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
 * @returns {Object} 음성 입력 상태 및 메서드
 */
export function usePracticeVoice({ userInput, onSendMessage }) {
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
    clearResults: clearSTTResults
  } = useRealtimeSTT()

  // ============================================
  // State
  // ============================================
  const inputMode = ref('text') // 'text' | 'voice'
  const isProcessingVoice = ref(false)
  const recognizedText = ref('')
  const lastAudioBlob = ref(null)  // 마지막 녹음된 오디오 (발음 평가용)

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
   * 녹음 시작
   */
  const startRecording = async () => {
    try {
      recognizedText.value = ''
      clearSTTResults()

      // 영어 기본, 한국어 보조 (백엔드 요구사항)
      await startRealtimeSTT('en-US', 'ko-KR')
      console.log('Recording started')
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
    startRecording,
    stopRecording,
    toggleAvatar
  }
}
