/**
 * Real-time STT Composable for Conversation Practice
 *
 * 회화연습 페이지용 실시간 음성 인식 Composable
 * useMultiLanguageSTT.js의 아키텍처를 재사용하되, 번역 없이 단일 언어 STT에 집중
 *
 * 주요 기능:
 * - 실시간 음성 인식 (WebSocket 기반)
 * - 중간 인식 결과 (recognizing) 표시
 * - 최종 인식 결과 (recognized) 누적
 * - 녹음 중지 시 전체 텍스트 반환
 *
 * @see useMultiLanguageSTT.js - 기반 아키텍처
 * @see voice_realtime.py - 백엔드 WebSocket API
 */
import { ref, computed, onUnmounted } from 'vue'
import { createMultiLangSTTStream } from '../services/voiceService'

export function useRealtimeSTT() {
  // 상태
  const isRecording = ref(false)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // 인식 결과
  const interimText = ref('')       // 중간 인식 결과 (recognizing)
  const finalTexts = ref([])        // 최종 인식 결과 배열 (recognized)
  const recordingTime = ref(0)      // 녹음 시간 (초)

  // 내부 리소스
  let wsConnection = null
  let audioContext = null
  let audioWorkletNode = null
  let sourceNode = null
  let audioStream = null
  let recordingInterval = null

  /**
   * 전체 인식된 텍스트 (최종 텍스트 + 중간 텍스트)
   */
  const fullText = computed(() => {
    const finals = finalTexts.value.join(' ')
    const interim = interimText.value
    return interim ? `${finals} ${interim}`.trim() : finals
  })

  /**
   * 실시간 STT 녹음 시작
   *
   * @param {string} language - 주 인식 언어 (BCP-47 코드, 예: 'en-US')
   * @param {string} secondaryLanguage - 보조 언어 (선택사항, 백엔드에서 최소 2개 필요)
   */
  async function startRecording(language = 'en-US', secondaryLanguage = 'ko-KR') {
    if (isRecording.value || isConnecting.value) {
      console.warn('⚠️ Already recording or connecting')
      return
    }

    try {
      isConnecting.value = true
      error.value = null
      interimText.value = ''
      finalTexts.value = []
      recordingTime.value = 0

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

      // 3. AudioWorklet 로드 (PCM 변환용)
      await audioContext.audioWorklet.addModule('/pcm-processor.js')

      // 4. AudioWorkletNode 생성
      audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-processor')

      // 5. 마이크 연결
      sourceNode = audioContext.createMediaStreamSource(audioStream)
      sourceNode.connect(audioWorkletNode)

      // 6. WebSocket 연결 (백엔드는 최소 2개 언어 필요)
      const selectedLanguages = [language, secondaryLanguage]

      wsConnection = createMultiLangSTTStream(selectedLanguages, {
        onConnected: () => {
          console.log('✅ Realtime STT connected')

          setTimeout(() => {
            if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
              // PCM 데이터 전송 시작
              audioWorkletNode.port.onmessage = (event) => {
                if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
                  wsConnection.ws.send(event.data)
                }
              }

              isRecording.value = true
              isConnected.value = true
              isConnecting.value = false

              // 녹음 시간 타이머 시작
              recordingInterval = setInterval(() => {
                recordingTime.value++
              }, 1000)
            } else {
              error.value = 'WebSocket 연결이 불안정합니다'
              isConnecting.value = false
              cleanup()
            }
          }, 200)
        },

        onRecognizing: (message) => {
          // 중간 인식 결과
          interimText.value = message.text || ''
        },

        onRecognized: (message) => {
          // 최종 인식 결과 - 번역은 무시하고 인식된 텍스트만 사용
          const text = message.text?.trim()
          if (text) {
            finalTexts.value.push(text)
            interimText.value = ''
            console.log('🎤 Recognized:', text)
          }
        },

        onError: (errorMessage) => {
          console.error('❌ Realtime STT error:', errorMessage)
          error.value = errorMessage
        },

        onEnd: () => {
          console.log('🔚 Realtime STT ended')
          isConnected.value = false
        }
      })

    } catch (err) {
      console.error('❌ Failed to start realtime STT:', err)
      error.value = err.message || '녹음 시작 실패'
      isConnecting.value = false
      cleanup()
      throw err
    }
  }

  /**
   * 녹음 중지 및 최종 텍스트 반환
   *
   * @returns {string} 전체 인식된 텍스트
   */
  function stopRecording() {
    // 타이머 중지
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }

    // 최종 텍스트 캡처 (중지 전에)
    const result = fullText.value

    // 리소스 정리
    cleanup()

    console.log('⏹️ Recording stopped, text:', result)
    return result
  }

  /**
   * 리소스 정리
   */
  function cleanup() {
    try {
      // Audio 노드 정리
      if (sourceNode) {
        sourceNode.disconnect()
        sourceNode = null
      }

      if (audioWorkletNode) {
        audioWorkletNode.disconnect()
        audioWorkletNode.port.onmessage = null
        audioWorkletNode = null
      }

      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close()
        audioContext = null
      }

      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop())
        audioStream = null
      }

      // WebSocket 정리
      if (wsConnection) {
        wsConnection.close()
        wsConnection = null
      }

      // 상태 초기화
      isRecording.value = false
      isConnected.value = false
      isConnecting.value = false

    } catch (err) {
      console.error('❌ Cleanup error:', err)
    }
  }

  /**
   * 결과 초기화
   */
  function clearResults() {
    interimText.value = ''
    finalTexts.value = []
    recordingTime.value = 0
    error.value = null
  }

  // 컴포넌트 언마운트 시 정리
  onUnmounted(() => {
    if (recordingInterval) {
      clearInterval(recordingInterval)
    }
    cleanup()
  })

  return {
    // 상태
    isRecording,
    isConnected,
    isConnecting,
    error,

    // 인식 결과
    interimText,
    finalTexts,
    fullText,
    recordingTime,

    // 메서드
    startRecording,
    stopRecording,
    clearResults
  }
}
