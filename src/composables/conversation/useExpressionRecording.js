/**
 * Expression Recording Composable
 *
 * 녹음 및 발음 평가 로직 (WebSocket 기반)
 */
import { ref } from 'vue'

export function useExpressionRecording() {
  // Recording State
  const showRecordingModal = ref(false)
  const isRecording = ref(false)
  const recordingStatus = ref('녹음 대기 중')
  const referenceText = ref('')
  const practiceType = ref('expression')
  const practiceExampleIndex = ref(0)
  const pronunciationResult = ref(null)
  const selectedWordIndex = ref(null)

  // Playback State
  const recordedAudioUrl = ref(null)
  const recordedAudioChunks = ref([])
  const isPlayingRecording = ref(false)

  // Internal refs
  let recordedAudio = null
  let mediaRecorder = null
  let mediaStream = null
  let websocket = null
  let audioContext = null
  let audioProcessor = null

  // Methods
  const startPronunciationPractice = (type, exampleIndex, expression) => {
    practiceType.value = type
    practiceExampleIndex.value = exampleIndex

    if (type === 'expression') {
      referenceText.value = expression.expression
    } else {
      referenceText.value = expression.examples[exampleIndex].text
    }

    pronunciationResult.value = null
    selectedWordIndex.value = null
    showRecordingModal.value = true
    recordingStatus.value = '녹음 대기 중'
  }

  const clearRecordedAudio = () => {
    stopPlayingRecordedAudio()

    if (recordedAudioUrl.value) {
      URL.revokeObjectURL(recordedAudioUrl.value)
      recordedAudioUrl.value = null
    }

    recordedAudioChunks.value = []
    recordedAudio = null
  }

  const startRecording = async (expressionId) => {
    try {
      clearRecordedAudio()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })

      // MediaRecorder for playback
      mediaStream = stream
      recordedAudioChunks.value = []
      mediaRecorder = new MediaRecorder(stream)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedAudioChunks.value.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedAudioChunks.value, { type: 'audio/webm' })
        recordedAudioUrl.value = URL.createObjectURL(audioBlob)
      }

      mediaRecorder.start()

      // WebSocket connection
      const wsUrl = `ws://localhost:8000/api/ai/expression/speech/assess-realtime`
      websocket = new WebSocket(wsUrl)

      websocket.onopen = () => {
        const initData = {
          expression_id: expressionId,
          type: practiceType.value,
          example_index: practiceExampleIndex.value
        }
        websocket.send(JSON.stringify(initData))
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)

        if (data.status === 'ready') {
          recordingStatus.value = '녹음 중... 말씀해주세요'
          startAudioCapture(stream)
        } else if (data.status === 'processing') {
          recordingStatus.value = '처리 중...'
        } else if (data.result) {
          pronunciationResult.value = data.result
          recordingStatus.value = '평가 완료!'
          isRecording.value = false
        } else if (data.error) {
          recordingStatus.value = `오류: ${data.error}`
          isRecording.value = false
        }
      }

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error)
        recordingStatus.value = '연결 오류'
        isRecording.value = false
      }

      websocket.onclose = () => {
        stopAudioCapture()
      }

      isRecording.value = true
      recordingStatus.value = '연결 중...'

    } catch (error) {
      console.error('Failed to start recording:', error)
      recordingStatus.value = '마이크 접근 실패'
    }
  }

  const startAudioCapture = async (stream) => {
    audioContext = new AudioContext({ sampleRate: 16000 })

    // Chrome Autoplay Policy 대응: suspended 상태면 resume 필요
    if (audioContext.state === 'suspended') {
      await audioContext.resume()
    }

    const source = audioContext.createMediaStreamSource(stream)

    audioProcessor = audioContext.createScriptProcessor(4096, 1, 1)

    audioProcessor.onaudioprocess = (event) => {
      if (!isRecording.value || !websocket || websocket.readyState !== WebSocket.OPEN) return

      const inputBuffer = event.inputBuffer.getChannelData(0)

      const int16Buffer = new Int16Array(inputBuffer.length)
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, inputBuffer[i]))
        int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
      }

      websocket.send(int16Buffer.buffer)
    }

    source.connect(audioProcessor)
    audioProcessor.connect(audioContext.destination)
  }

  const stopAudioCapture = () => {
    if (audioProcessor) {
      audioProcessor.disconnect()
      audioProcessor = null
    }
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send('END')
    }
    recordingStatus.value = '결과 처리 중...'
  }

  const playRecordedAudio = () => {
    if (!recordedAudioUrl.value) return

    if (recordedAudio) {
      recordedAudio.pause()
      recordedAudio = null
    }

    recordedAudio = new Audio(recordedAudioUrl.value)
    isPlayingRecording.value = true

    recordedAudio.onended = () => {
      isPlayingRecording.value = false
    }

    recordedAudio.onerror = () => {
      isPlayingRecording.value = false
    }

    // Chrome Autoplay Policy: play()는 Promise 반환, 에러 처리 필요
    recordedAudio.play().catch(err => {
      console.error('Recorded audio play failed:', err)
      isPlayingRecording.value = false
    })
  }

  const stopPlayingRecordedAudio = () => {
    if (recordedAudio) {
      recordedAudio.pause()
      recordedAudio.currentTime = 0
      isPlayingRecording.value = false
    }
  }

  const closeRecordingModal = () => {
    if (websocket) {
      websocket.close()
      websocket = null
    }
    stopAudioCapture()

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }
    mediaRecorder = null

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }

    clearRecordedAudio()

    showRecordingModal.value = false
    isRecording.value = false
  }

  const togglePhonemeView = (idx) => {
    selectedWordIndex.value = selectedWordIndex.value === idx ? null : idx
  }

  // Score color helpers
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPhonemeColorClass = (score) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return {
    // State
    showRecordingModal,
    isRecording,
    recordingStatus,
    referenceText,
    practiceType,
    practiceExampleIndex,
    pronunciationResult,
    selectedWordIndex,
    recordedAudioUrl,
    isPlayingRecording,

    // Methods
    startPronunciationPractice,
    startRecording,
    stopRecording,
    playRecordedAudio,
    stopPlayingRecordedAudio,
    closeRecordingModal,
    togglePhonemeView,

    // Helpers
    getScoreColorClass,
    getPhonemeColorClass
  }
}
