/**
 * Multi-language STT Composable
 *
 * 음성번역 페이지용 다국어 실시간 음성 인식 및 번역 기능
 * 자동 언어 감지 후 선택된 다른 언어들로 번역
 *
 * 전문용어사전 지원:
 * - projectId를 전달하면 해당 프로젝트에 연결된 문서의 용어집을 후처리로 적용
 * - projectId가 없으면 기본 Azure Translator 번역만 수행
 *
 * @see createTranslationStream - 번역 포함 WebSocket
 * @see voice_realtime.py - 백엔드 번역 WebSocket API
 */
import { ref, onUnmounted } from 'vue'
import { createTranslationStream } from '../services/voiceService'

export function useMultiLanguageSTT() {
  const isRecording = ref(false)
  const isConnected = ref(false)
  const error = ref(null)
  const translationCards = ref([])
  const recognizingText = ref('')
  const currentProjectId = ref(null)  // 현재 선택된 프로젝트 ID

  let wsConnection = null
  let audioContext = null
  let audioWorkletNode = null
  let sourceNode = null
  let audioStream = null

  /**
   * 녹음 시작
   * @param {string[]} selectedLanguages - 선택된 언어 목록 (BCP-47 코드)
   * @param {string|null} projectId - 프로젝트 ID (용어집 적용, 선택사항)
   */
  async function startRecording(selectedLanguages = ['ko-KR', 'en-US'], projectId = null) {
    try {
      error.value = null
      currentProjectId.value = projectId

      if (!selectedLanguages || selectedLanguages.length < 2) {
        throw new Error('최소 2개 이상의 언어를 선택해야 합니다.')
      }

      // 용어집 적용 여부 로그
      if (projectId) {
        console.log('📚 [STT] 용어집 적용 모드: project_id=' + projectId)
      } else {
        console.log('📚 [STT] 기본 번역 모드 (용어집 미적용)')
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

      // Chrome Autoplay Policy 대응: suspended 상태면 resume 필요
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // 3. AudioWorklet 로드
      await audioContext.audioWorklet.addModule('/pcm-processor.js')

      // 4. AudioWorkletNode 생성
      audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-processor')

      // 5. 마이크 연결
      sourceNode = audioContext.createMediaStreamSource(audioStream)
      sourceNode.connect(audioWorkletNode)

      // 6. WebSocket 연결 (다국어 자동 감지 + 번역 + 용어집 후처리)
      wsConnection = createTranslationStream(selectedLanguages, {
        onConnected: () => {
          console.log('✅ [Translation] WebSocket connected')

          // 연결 즉시 상태 확인 (200ms 딜레이 제거 - race condition 방지)
          if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
            // PCM 데이터 전송
            audioWorkletNode.port.onmessage = (event) => {
              if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
                wsConnection.ws.send(event.data)
              }
            }
            isRecording.value = true
            isConnected.value = true

            console.log('✅ [Translation] Audio streaming started')
          } else {
            console.warn('⚠️ [Translation] WebSocket not in OPEN state after onConnected')
            error.value = 'WebSocket 연결에 실패했습니다. 다시 시도해주세요.'
            cleanup()
          }
        },

        onRecognizing: (message) => {
          recognizingText.value = message.text || ''
        },

        onRecognized: (message) => {
          recognizingText.value = ''

          if (message.text && message.text.trim()) {
            translationCards.value.push({
              id: Date.now(),
              original: message.text,
              detectedLang: message.detected_language || 'ko-KR',
              translations: message.translations || [],
              timestamp: new Date().toISOString()
            })

            // 최대 50개 (오래된 것부터 제거)
            if (translationCards.value.length > 50) {
              translationCards.value.shift()
            }
          }
        },

        onError: (errorMessage) => {
          error.value = errorMessage
        },

        onEnd: () => {
          isConnected.value = false
        }
      }, projectId)  // 프로젝트 ID 전달 (용어집 적용)

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
    currentProjectId,  // 현재 선택된 프로젝트 ID
    startRecording,
    stopRecording,
    clearCards
  }
}
