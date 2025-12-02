/**
 * Multi-language STT Composable (로그 제거 버전)
 *
 * 다국어 실시간 음성 인식 및 번역 기능
 */
import { ref, onUnmounted } from 'vue'
import { createMultiLangSTTStream } from '../services/voiceService'

export function useMultiLanguageSTT() {
  const isRecording = ref(false)
  const isConnected = ref(false)
  const error = ref(null)
  const translationCards = ref([])
  const recognizingText = ref('')

  let wsConnection = null
  let audioContext = null
  let audioWorkletNode = null
  let sourceNode = null
  let audioStream = null

  async function startRecording(selectedLanguages = ['ko-KR', 'en-US']) {
    try {
      error.value = null

      if (!selectedLanguages || selectedLanguages.length < 2) {
        throw new Error('최소 2개 이상의 언어를 선택해야 합니다.')
      }

      // 1. 마이크 권한 요청
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // 2. AudioContext 생성
      audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // 3. AudioWorklet 로드
      await audioContext.audioWorklet.addModule('/pcm-processor.js')

      // 4. AudioWorkletNode 생성
      audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-processor')

      // 5. 마이크 연결
      sourceNode = audioContext.createMediaStreamSource(audioStream)
      sourceNode.connect(audioWorkletNode)

      // 6. WebSocket 연결
      wsConnection = createMultiLangSTTStream(selectedLanguages, {
        onConnected: () => {
          setTimeout(() => {
            if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
              // PCM 데이터 전송
              audioWorkletNode.port.onmessage = (event) => {
                if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
                  wsConnection.ws.send(event.data)
                }
              }
              isRecording.value = true
              isConnected.value = true
            } else {
              error.value = 'WebSocket 연결이 불안정합니다'
            }
          }, 200)
        },

        onRecognizing: (message) => {
          recognizingText.value = message.text || ''
        },

        onRecognized: (message) => {
          recognizingText.value = ''

          if (message.text && message.text.trim()) {
            translationCards.value.unshift({
              id: Date.now(),
              original: message.text,
              detectedLang: message.detected_language || 'ko-KR',
              translations: message.translations || [],
              timestamp: new Date().toISOString()
            })

            // 최대 50개
            if (translationCards.value.length > 50) {
              translationCards.value.length = 50
            }
          }
        },

        onError: (errorMessage) => {
          error.value = errorMessage
        },

        onEnd: () => {
          isConnected.value = false
        }
      })

    } catch (err) {
      error.value = err.message || '녹음 시작 실패'
      cleanup()
      throw err
    }
  }

  function stopRecording() {
    try {
      if (sourceNode) sourceNode.disconnect()
      if (audioWorkletNode) {
        audioWorkletNode.disconnect()
        audioWorkletNode.port.onmessage = null
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
      }
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
      }
      if (wsConnection) wsConnection.close()

      isRecording.value = false
      isConnected.value = false
      recognizingText.value = ''
    } catch (err) {
      error.value = err.message || '녹음 중지 실패'
    }
  }

  function clearCards() {
    translationCards.value = []
  }

  function cleanup() {
    if (isRecording.value) stopRecording()
    wsConnection = null
    audioContext = null
    audioWorkletNode = null
    sourceNode = null
    audioStream = null
  }

  onUnmounted(() => cleanup())

  return {
    isRecording,
    isConnected,
    error,
    translationCards,
    recognizingText,
    startRecording,
    stopRecording,
    clearCards
  }
}
