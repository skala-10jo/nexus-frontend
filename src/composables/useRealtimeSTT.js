/**
 * Real-time STT Composable for Conversation Practice
 *
 * 회화연습 페이지용 실시간 음성 인식 Composable
 * 번역 없이 단일 언어 STT에 집중하여 더 빠른 응답 제공
 *
 * 주요 기능:
 * - 실시간 음성 인식 (WebSocket 기반)
 * - 중간 인식 결과 (recognizing) 표시
 * - 최종 인식 결과 (recognized) 누적
 * - 녹음 중지 시 전체 텍스트 반환
 * - 발음 평가용 오디오 캡처
 *
 * @see createSTTOnlyStream - STT 전용 WebSocket (번역 없음)
 * @see voice_stt_stream.py - 백엔드 STT 전용 WebSocket API
 */
import { ref, computed, onUnmounted } from 'vue'
import { createSTTOnlyStream } from '../services/voiceService'

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

  // 오디오 녹음 (발음 평가용)
  const audioBlob = ref(null)       // 녹음된 오디오 Blob

  // 내부 리소스
  let wsConnection = null
  let audioContext = null
  let audioWorkletNode = null
  let sourceNode = null
  let audioStream = null
  let recordingInterval = null
  let mediaRecorder = null          // MediaRecorder for audio capture
  let audioChunks = []              // 녹음된 오디오 청크

  // 자동 모드용 PCM 버퍼 (세그먼트별 오디오 캡처)
  let pcmBuffer = []                // PCM 데이터 버퍼 (Int16Array 청크들)
  let segmentPcmStart = 0           // 현재 세그먼트 시작 위치
  let isNewSegmentStarted = false   // 새 세그먼트가 시작되었는지 (onRecognizing 최초 감지용)

  // TTS 에코 방지: TTS 재생 중에는 STT 결과 무시
  let isTTSPlaying = false          // TTS 재생 중 플래그 (외부에서 설정)

  /**
   * 전체 인식된 텍스트 (최종 텍스트 + 중간 텍스트)
   */
  const fullText = computed(() => {
    const finals = finalTexts.value.join(' ')
    const interim = interimText.value
    return interim ? `${finals} ${interim}`.trim() : finals
  })

  // 자동 분절 모드에서 recognized 이벤트 콜백 (외부에서 설정)
  let onAutoRecognizedCallback = null

  /**
   * 자동 분절 모드에서 recognized 이벤트 콜백 설정
   * @param {Function} callback - 콜백 함수 (text: string, audioBlob: Blob|null) => void
   */
  function setOnAutoRecognized(callback) {
    onAutoRecognizedCallback = callback
  }

  /**
   * TTS 재생 상태 설정 (에코 방지용)
   * TTS 재생 중에는 STT 인식 결과를 무시하여 에코 방지
   * @param {boolean} isPlaying - TTS 재생 중 여부
   */
  function setTTSPlaying(isPlaying) {
    isTTSPlaying = isPlaying
    if (isPlaying) {
      // TTS 시작 시: 현재 세그먼트 상태 리셋
      isNewSegmentStarted = false
    } else {
      // TTS 종료 시: PCM 버퍼 시작점을 현재 위치로 리셋 (에코 오디오 버림)
      segmentPcmStart = pcmBuffer.length
      isNewSegmentStarted = false
    }
  }

  /**
   * PCM 데이터를 WAV Blob으로 변환
   * @param {Int16Array} pcmData - PCM 데이터 (16bit, 16kHz, mono)
   * @returns {Blob} WAV 형식 Blob
   */
  function pcmToWav(pcmData) {
    const sampleRate = 16000
    const numChannels = 1
    const bitsPerSample = 16
    const byteRate = sampleRate * numChannels * bitsPerSample / 8
    const blockAlign = numChannels * bitsPerSample / 8
    const dataSize = pcmData.length * 2 // 16bit = 2 bytes per sample

    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    // WAV 헤더 작성
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true)  // PCM format
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitsPerSample, true)
    writeString(36, 'data')
    view.setUint32(40, dataSize, true)

    // PCM 데이터 복사
    const pcmView = new Int16Array(buffer, 44)
    pcmView.set(pcmData)

    return new Blob([buffer], { type: 'audio/wav' })
  }

  /**
   * 현재 세그먼트의 PCM 데이터를 WAV로 변환하여 반환
   * @returns {Blob|null} WAV Blob 또는 null
   */
  function captureSegmentAudio() {
    // 현재 세그먼트의 끝 위치를 먼저 캡처 (호출 시점 기준)
    const segmentPcmEnd = pcmBuffer.length

    // 현재 세그먼트의 PCM 데이터만 추출 (start ~ end)
    const segmentPcmChunks = pcmBuffer.slice(segmentPcmStart, segmentPcmEnd)

    if (segmentPcmChunks.length === 0) {
      return null
    }

    // 모든 청크를 하나의 Int16Array로 합치기
    const totalLength = segmentPcmChunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const combinedPcm = new Int16Array(totalLength)
    let offset = 0
    for (const chunk of segmentPcmChunks) {
      combinedPcm.set(chunk, offset)
      offset += chunk.length
    }

    // WAV로 변환
    return pcmToWav(combinedPcm)
  }

  /**
   * 실시간 STT 녹음 시작
   *
   * @param {string} language - 인식 언어 (BCP-47 코드, 예: 'en-US')
   * @param {Object} options - 추가 옵션
   * @param {boolean} options.autoSegment - 자동 분절 모드 (기본: false, true면 침묵 감지로 자동 문장 분리)
   */
  async function startRecording(language = 'en-US', options = {}) {
    const autoSegment = options.autoSegment || false
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
      audioBlob.value = null
      audioChunks = []
      pcmBuffer = []
      segmentPcmStart = 0
      isNewSegmentStarted = false

      // 1. 마이크 권한 요청
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 48000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // 1.5 MediaRecorder 설정 (발음 평가용 오디오 캡처)
      try {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm'

        mediaRecorder = new MediaRecorder(audioStream, { mimeType })

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }

        mediaRecorder.onstop = () => {
          if (audioChunks.length > 0) {
            audioBlob.value = new Blob(audioChunks, { type: 'audio/webm' })
            console.log('🎤 Audio captured:', audioBlob.value.size, 'bytes')
          }
        }

        mediaRecorder.start(100) // 100ms 간격으로 데이터 수집
        console.log('🎙️ MediaRecorder started for pronunciation assessment')
      } catch (recorderErr) {
        console.warn('⚠️ MediaRecorder not available:', recorderErr)
        // MediaRecorder 실패해도 STT는 계속 진행
      }

      // 2. AudioContext 생성
      audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Chrome Autoplay Policy 대응: suspended 상태면 resume 필요
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      // 3. AudioWorklet 로드 (PCM 변환용)
      await audioContext.audioWorklet.addModule('/pcm-processor.js')

      // 4. AudioWorkletNode 생성
      audioWorkletNode = new AudioWorkletNode(audioContext, 'pcm-processor')

      // 5. 마이크 연결
      sourceNode = audioContext.createMediaStreamSource(audioStream)
      sourceNode.connect(audioWorkletNode)

      // 6. WebSocket 연결 (단일 언어 STT 전용 - 번역 없음)
      wsConnection = createSTTOnlyStream(language, {
        onConnected: () => {
          console.log(`✅ [STT-Only] Realtime STT connected (autoSegment: ${autoSegment})`)

          setTimeout(() => {
            if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
              // PCM 데이터 전송 시작 + 자동 모드용 버퍼 저장
              audioWorkletNode.port.onmessage = (event) => {
                if (wsConnection && wsConnection.ws.readyState === WebSocket.OPEN) {
                  wsConnection.ws.send(event.data)

                  // 자동 모드: PCM 데이터를 버퍼에 저장 (발음 평가용)
                  if (autoSegment) {
                    // ArrayBuffer를 Int16Array로 변환하여 저장
                    const pcmChunk = new Int16Array(event.data)
                    pcmBuffer.push(pcmChunk)
                  }
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

          // 자동 분절 모드: 새 세그먼트 시작 감지
          if (autoSegment && !isNewSegmentStarted) {
            isNewSegmentStarted = true
            // 현재 버퍼 위치에서 약 1.5초(24청크) 전으로 시작점 설정
            const backtrackChunks = 24
            segmentPcmStart = Math.max(segmentPcmStart, pcmBuffer.length - backtrackChunks)
          }
        },

        onRecognized: (message) => {
          // 최종 인식 결과
          const text = message.text?.trim()
          if (text) {
            // TTS 재생 중에는 에코 방지를 위해 결과 무시
            if (isTTSPlaying) {
              segmentPcmStart = pcmBuffer.length
              isNewSegmentStarted = false
              return
            }

            finalTexts.value.push(text)
            interimText.value = ''

            // 자동 분절 모드에서 콜백 호출 (메시지 자동 전송용)
            if (autoSegment && onAutoRecognizedCallback) {
              const segmentAudioBlob = captureSegmentAudio()
              onAutoRecognizedCallback(text, segmentAudioBlob)

              // 다음 세그먼트를 위해 상태 리셋
              segmentPcmStart = pcmBuffer.length
              isNewSegmentStarted = false
            }
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
      }, { autoSegment })

    } catch (err) {
      console.error('❌ Failed to start realtime STT:', err)
      error.value = err.message || '녹음 시작 실패'
      isConnecting.value = false
      cleanup()
      throw err
    }
  }

  /**
   * 녹음 중지 및 결과 반환
   *
   * @returns {Object} { text: string, audioBlob: Blob|null }
   */
  function stopRecording() {
    // 타이머 중지
    if (recordingInterval) {
      clearInterval(recordingInterval)
      recordingInterval = null
    }

    // 최종 텍스트 캡처 (중지 전에)
    const resultText = fullText.value

    // MediaRecorder 중지 (오디오 캡처 완료)
    let capturedAudioBlob = null
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
      // 동기적으로 Blob 생성 (onstop 대기하지 않음)
      if (audioChunks.length > 0) {
        capturedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        audioBlob.value = capturedAudioBlob
        console.log('🎤 Audio captured immediately:', capturedAudioBlob.size, 'bytes')
      }
    }

    // 리소스 정리
    cleanup()

    console.log('⏹️ Recording stopped, text:', resultText)
    return {
      text: resultText,
      audioBlob: capturedAudioBlob
    }
  }

  /**
   * 리소스 정리
   */
  function cleanup() {
    try {
      // MediaRecorder 정리
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop()
        } catch (e) {
          // 이미 중지됨
        }
      }
      mediaRecorder = null

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
   * 주의: audioChunks는 여기서 비우지 않음 (녹음이 계속 진행 중일 수 있음)
   * 자동 모드에서는 captureSegmentAudio()가 청크를 관리함
   */
  function clearResults() {
    interimText.value = ''
    finalTexts.value = []
    recordingTime.value = 0
    error.value = null
    audioBlob.value = null
    // audioChunks는 비우지 않음 - 녹음이 계속 진행 중일 수 있음
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
    audioBlob,  // 녹음된 오디오 Blob (발음 평가용)

    // 메서드
    startRecording,
    stopRecording,
    clearResults,
    setOnAutoRecognized,  // 자동 분절 모드 콜백 설정
    setTTSPlaying         // TTS 재생 상태 설정 (에코 방지용)
  }
}
