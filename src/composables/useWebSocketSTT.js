/**
 * WebSocket STT Composable
 *
 * 백엔드 WebSocket 기반 실시간 음성 인식(STT) 처리
 *
 * 주요 기능:
 * - WebSocket 연결 관리
 * - 마이크 입력 스트리밍
 * - 실시간 STT 결과 수신
 * - 화자 분리 지원
 *
 * @see backend-python/app/api/voice_stt.py
 */
import { ref, onUnmounted } from 'vue'
import { createSTTStream } from '../services/voiceService'

export function useWebSocketSTT() {
  // 상태
  const isConnected = ref(false)
  const isRecording = ref(false)
  const error = ref(null)

  // STT 결과
  const recognizingText = ref('')  // 중간 인식 결과
  const recognizedText = ref('')   // 최종 인식 결과
  const speakerId = ref(null)      // 화자 ID
  const confidence = ref(0)        // 신뢰도

  // WebSocket 및 MediaRecorder
  let wsConnection = null
  let mediaRecorder = null
  let audioStream = null

  /**
   * WebSocket 연결 및 녹음 시작
   *
   * @param {string} language - BCP-47 언어 코드 (예: ko-KR, en-US)
   * @param {boolean} enableDiarization - 화자 분리 활성화
   * @param {Object} callbacks - 추가 콜백 함수 (선택사항)
   * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백
   * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백
   * @returns {Promise<void>}
   */
  async function startRecording(language = 'ko-KR', enableDiarization = true, callbacks = {}) {
    try {
      error.value = null

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

      // 2. WebSocket 연결 생성
      console.log('🔌 Connecting to WebSocket STT...')
      wsConnection = createSTTStream(language, enableDiarization, {
        onRecognizing: (message) => {
          recognizingText.value = message.text || ''
          console.log('🔄 Recognizing:', message.text)

          // 사용자 정의 콜백 호출
          if (callbacks.onRecognizing) {
            callbacks.onRecognizing(message)
          }
        },

        onRecognized: (message) => {
          recognizedText.value = message.text || ''
          speakerId.value = message.speaker_id || 'Unknown'
          confidence.value = message.confidence || 0
          recognizingText.value = '' // 중간 결과 초기화

          console.log('✅ Recognized:', message.text, `(Speaker: ${message.speaker_id})`)

          // 사용자 정의 콜백 호출
          if (callbacks.onRecognized) {
            callbacks.onRecognized(message)
          }
        },

        onError: (errorMessage) => {
          error.value = errorMessage
          console.error('❌ STT error:', errorMessage)
        },

        onEnd: () => {
          isConnected.value = false
          console.log('🔚 STT stream ended')
        }
      })

      isConnected.value = true

      // 3. MediaRecorder 생성 (오디오 청크 스트리밍)
      // WAV 또는 Opus 형식으로 인코딩
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      mediaRecorder = new MediaRecorder(audioStream, {
        mimeType,
        audioBitsPerSecond: 16000 // 16kbps
      })

      // 오디오 청크 수신 시 WebSocket으로 전송
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && wsConnection) {
          wsConnection.send(event.data)
        }
      }

      // 녹음 시작 (100ms마다 청크 전송)
      mediaRecorder.start(100)
      isRecording.value = true

      console.log('🔴 Recording started')

    } catch (err) {
      console.error('❌ Failed to start recording:', err)
      error.value = err.message
      throw err
    }
  }

  /**
   * 녹음 및 WebSocket 연결 종료
   */
  function stopRecording() {
    try {
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

    } catch (err) {
      console.error('❌ Failed to stop recording:', err)
      error.value = err.message
    }
  }

  /**
   * 결과 초기화
   */
  function clearResults() {
    recognizingText.value = ''
    recognizedText.value = ''
    speakerId.value = null
    confidence.value = 0
    error.value = null
  }

  // Cleanup on unmount
  onUnmounted(() => {
    if (isRecording.value) {
      stopRecording()
    }
  })

  return {
    // 상태
    isConnected,
    isRecording,
    error,

    // STT 결과
    recognizingText,
    recognizedText,
    speakerId,
    confidence,

    // 메서드
    startRecording,
    stopRecording,
    clearResults
  }
}
