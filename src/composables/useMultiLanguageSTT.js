/**
 * Multi-language STT Composable
 *
 * 다국어 실시간 음성 인식 및 번역 기능을 제공하는 Composable
 *
 * 주요 기능:
 * - 여러 언어 선택 지원
 * - 자동 언어 감지 (Azure STT)
 * - 실시간 다국어 번역
 * - WebSocket 기반 스트리밍
 * - 번역 결과 카드 자동 생성
 *
 * @example
 * import { useMultiLanguageSTT } from '@/composables/useMultiLanguageSTT'
 *
 * const {
 *   isRecording,
 *   translationCards,
 *   startRecording,
 *   stopRecording,
 *   clearCards
 * } = useMultiLanguageSTT()
 *
 * // 녹음 시작 (선택된 언어 전달)
 * await startRecording(['ko-KR', 'en-US', 'ja-JP'])
 */
import { ref, onUnmounted } from 'vue'
import { createMultiLangSTTStream } from '../services/voiceService'

export function useMultiLanguageSTT() {
  // 상태 관리
  const isRecording = ref(false)
  const isConnected = ref(false)
  const error = ref(null)

  // 번역 카드 목록 (최신 카드가 맨 앞)
  const translationCards = ref([])

  // 중간 인식 결과 (실시간 표시용)
  const recognizingText = ref('')

  // WebSocket 및 MediaRecorder 인스턴스
  let wsConnection = null
  let mediaRecorder = null
  let audioStream = null

  /**
   * 녹음 시작 (마이크 입력 + WebSocket 연결)
   *
   * @param {string[]} selectedLanguages - 선택된 언어 목록 (BCP-47 코드)
   * @returns {Promise<void>}
   */
  async function startRecording(selectedLanguages = ['ko-KR', 'en-US']) {
    try {
      error.value = null

      // 언어가 2개 미만이면 에러
      if (!selectedLanguages || selectedLanguages.length < 2) {
        throw new Error('최소 2개 이상의 언어를 선택해야 합니다.')
      }

      // 1. 마이크 권한 요청 및 오디오 스트림 획득
      console.log('🎤 Requesting microphone access...')
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,      // Azure STT 권장: 16kHz
          channelCount: 1,        // 모노
          echoCancellation: true, // 에코 제거
          noiseSuppression: true  // 노이즈 감소
        }
      })

      console.log('✅ Microphone access granted')

      // 2. MediaRecorder 먼저 생성 (아직 시작하지 않음)
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType,
        audioBitsPerSecond: 16000 // 16kbps
      })

      // 오디오 청크 수신 시 WebSocket으로 전송
      mediaRecorder.ondataavailable = (event) => {
        // ★ WebSocket readyState 명시적 확인 (OPEN = 1)
        if (event.data.size > 0 && wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
          console.log('📤 Sending audio chunk:', event.data.size, 'bytes')
          wsConnection.send(event.data)
        } else if (event.data.size > 0 && wsConnection) {
          console.warn('⚠️ Dropping audio chunk, WebSocket not ready. ReadyState:', wsConnection.ws.readyState)
        }
      }

      // 3. WebSocket 연결 생성 (다국어 모드)
      console.log('🔌 Connecting to Multi-lang WebSocket STT...')
      wsConnection = createMultiLangSTTStream(selectedLanguages, {
        onConnected: () => {
          // ★ WebSocket 연결 완료 후 MediaRecorder 시작
          console.log('🔗 WebSocket connected, waiting for stability...')

          // 200ms 대기 후 MediaRecorder 시작 (WebSocket 완전히 안정화)
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'inactive') {
              // WebSocket readyState 재확인
              if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
                mediaRecorder.start(100) // 100ms마다 청크 전송
                isRecording.value = true
                isConnected.value = true
                console.log('🔴 Multi-lang recording started')
                console.log('Selected languages:', selectedLanguages)
                console.log('WebSocket readyState:', wsConnection.ws.readyState)
              } else {
                console.error('❌ WebSocket not OPEN after delay. ReadyState:', wsConnection?.ws?.readyState)
                error.value = 'WebSocket 연결이 불안정합니다'
              }
            }
          }, 200)
        },

        onRecognizing: (message) => {
          // 중간 인식 결과 (번역 없음)
          recognizingText.value = message.text || ''
        },

        onRecognized: (message) => {
          // 최종 인식 결과 + 번역
          console.log('✅ Recognized:', message)

          // 중간 결과 초기화
          recognizingText.value = ''

          // 번역 카드 추가 (최신 카드가 맨 앞으로)
          if (message.text && message.text.trim()) {
            translationCards.value.unshift({
              id: Date.now(), // 고유 ID
              original: message.text,
              detectedLang: message.detected_language || 'ko-KR',
              translations: message.translations || [],
              timestamp: new Date().toISOString()
            })

            // 최대 50개 카드만 유지 (메모리 관리)
            if (translationCards.value.length > 50) {
              translationCards.value = translationCards.value.slice(0, 50)
            }
          }
        },

        onError: (errorMessage) => {
          console.error('❌ Multi-lang STT error:', errorMessage)
          error.value = errorMessage
        },

        onEnd: () => {
          isConnected.value = false
          console.log('🔚 Multi-lang STT stream ended')
        }
      })

    } catch (err) {
      console.error('❌ Failed to start multi-lang recording:', err)
      error.value = err.message || '녹음 시작 실패'

      // 에러 발생 시 리소스 정리
      cleanup()

      throw err
    }
  }

  /**
   * 녹음 중지 (마이크 해제 + WebSocket 종료)
   */
  function stopRecording() {
    try {
      console.log('⏹️ Stopping multi-lang recording...')

      // MediaRecorder 중지
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop()
        console.log('⏹️ MediaRecorder stopped')
      }

      // 오디오 스트림 해제
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        console.log('🔇 Audio stream released')
      }

      // WebSocket 연결 종료
      if (wsConnection) {
        wsConnection.close()
        console.log('🔌 WebSocket closed')
      }

      isRecording.value = false
      isConnected.value = false
      recognizingText.value = ''

      console.log('✅ Multi-lang recording stopped')

    } catch (err) {
      console.error('❌ Failed to stop recording:', err)
      error.value = err.message || '녹음 중지 실패'
    }
  }

  /**
   * 번역 카드 목록 초기화
   */
  function clearCards() {
    translationCards.value = []
    console.log('🗑️ Translation cards cleared')
  }

  /**
   * 리소스 정리 (컴포넌트 언마운트 시)
   */
  function cleanup() {
    if (isRecording.value) {
      stopRecording()
    }

    // 모든 참조 해제
    wsConnection = null
    mediaRecorder = null
    audioStream = null
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
