/**
 * 음성 녹음 Composable
 *
 * 기능:
 * - 마이크 권한 요청 및 스트림 획득
 * - MediaRecorder로 오디오 청크 생성 (1초 단위)
 * - 음성 시각화 (Web Audio API)
 * - 오디오 에너지 레벨 계산
 */
import { ref, onBeforeUnmount } from 'vue'

export function useVoiceRecorder() {
  // 상태
  const isRecording = ref(false)
  const audioLevel = ref(0)  // 0.0 ~ 1.0
  const error = ref(null)

  // 내부 변수
  let mediaRecorder = null
  let audioContext = null
  let analyser = null
  let dataArray = null
  let animationFrameId = null
  let stream = null
  let chunkInterval = null  // 청크 생성 인터벌
  let onDataCallback = null  // 데이터 콜백 저장
  let audioFormatInfo = null  // 오디오 형식 정보 저장

  /**
   * 지원되는 오디오 형식 찾기
   * 우선순위: OGG Opus > WebM Opus (Whisper API와의 호환성 우선)
   * OGG는 Whisper가 'oga', 'ogg'로 명시적으로 지원
   */
  const getSupportedMimeType = () => {
    const types = [
      { mimeType: 'audio/ogg;codecs=opus', extension: 'ogg' }, // Whisper가 명시적으로 지원
      { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
      { mimeType: 'audio/webm', extension: 'webm' }
    ]

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type.mimeType)) {
        return type
      }
    }

    throw new Error('지원되는 오디오 형식이 없습니다')
  }

  /**
   * 녹음 시작
   *
   * @param {Object} options - 옵션
   * @param {Function} options.onDataAvailable - 오디오 청크 콜백
   * @param {Number} options.timeslice - 청크 간격 (ms)
   */
  const startRecording = async ({ onDataAvailable, timeslice = 1000 }) => {
    try {
      error.value = null

      // 1. 마이크 권한 요청 및 스트림 획득
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,  // 에코 제거
          noiseSuppression: true,  // 잡음 제거
          autoGainControl: true,   // 자동 게인 조절
          sampleRate: 16000        // 16kHz (Whisper API 권장)
        }
      })

      // 2. MediaRecorder 설정
      const audioFormat = getSupportedMimeType()

      mediaRecorder = new MediaRecorder(stream, {
        mimeType: audioFormat.mimeType,
        audioBitsPerSecond: 16000  // 16kbps (음성에 충분)
      })

      // 콜백과 형식 정보 저장
      onDataCallback = onDataAvailable
      audioFormatInfo = audioFormat

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && event.data.size >= 100) {
          // 녹음 중지 후 늦게 도착한 이벤트 무시
          if (!audioFormatInfo) return

          // 참고: 프론트엔드 무음 필터링 제거
          // - analyser가 제대로 작동하지 않음 (audioLevel이 항상 0)
          // - 백엔드의 Whisper API가 no_speech_prob로 hallucination 감지
          const currentAudioLevel = audioLevel.value

          // Blob type이 비어있으면 audioFormat의 mimeType으로 새 Blob 생성
          let audioBlob = event.data
          if (!audioBlob.type || audioBlob.type === '') {
            audioBlob = new Blob([event.data], { type: audioFormatInfo.mimeType })
          }

          // 오디오 에너지, 형식 정보도 함께 전달
          onDataCallback(audioBlob, currentAudioLevel, audioFormatInfo)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder 에러:', event.error)
        error.value = '녹음 중 오류가 발생했습니다'
        stopRecording()
      }

      // 첫 녹음 시작 (연속 녹음)
      mediaRecorder.start()

      // timeslice 간격으로 MediaRecorder를 재시작하여 각 청크가 완전한 파일이 되도록
      chunkInterval = setInterval(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          mediaRecorder.stop()
          // stop 이벤트 후 ondataavailable이 호출되고, 그 후 다시 시작
          setTimeout(() => {
            if (mediaRecorder && isRecording.value) {
              mediaRecorder.start()
            }
          }, 50)  // 짧은 딜레이 후 재시작
        }
      }, timeslice)

      // 3. 음성 시각화 (Web Audio API)
      audioContext = new (window.AudioContext || window.webkitAudioContext)()

      // Chrome Autoplay Policy 대응: suspended 상태면 resume 필요
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const source = audioContext.createMediaStreamSource(stream)
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 256  // FFT 크기 (작을수록 빠름)
      analyser.smoothingTimeConstant = 0.8  // 스무딩 (0 ~ 1)

      source.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      dataArray = new Uint8Array(bufferLength)

      // 음성 레벨 업데이트 루프
      const updateAudioLevel = () => {
        if (!isRecording.value) return

        analyser.getByteFrequencyData(dataArray)

        // RMS (Root Mean Square) 계산
        let sum = 0
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i] * dataArray[i]
        }
        const rms = Math.sqrt(sum / bufferLength)

        // 0.0 ~ 1.0 범위로 정규화
        audioLevel.value = Math.min(1.0, rms / 128)

        animationFrameId = requestAnimationFrame(updateAudioLevel)
      }

      updateAudioLevel()

      isRecording.value = true

    } catch (err) {
      console.error('녹음 시작 실패:', err)

      if (err.name === 'NotAllowedError') {
        error.value = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
      } else if (err.name === 'NotFoundError') {
        error.value = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.'
      } else {
        error.value = `녹음 시작 실패: ${err.message}`
      }

      throw err
    }
  }

  /**
   * 녹음 중지
   */
  const stopRecording = async () => {
    // 청크 인터벌 정리
    if (chunkInterval) {
      clearInterval(chunkInterval)
      chunkInterval = null
    }

    // MediaRecorder 중지
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }

    // 스트림 트랙 정리
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }

    // AudioContext 정리
    if (audioContext) {
      await audioContext.close()
      audioContext = null
    }

    // 애니메이션 프레임 취소
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    // 저장된 참조 정리
    onDataCallback = null
    audioFormatInfo = null

    isRecording.value = false
    audioLevel.value = 0
  }

  /**
   * 마이크 권한 확인
   */
  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' })
      return result.state  // 'granted', 'denied', 'prompt'
    } catch (err) {
      return 'unknown'
    }
  }

  // 컴포넌트 언마운트 시 정리
  onBeforeUnmount(() => {
    if (isRecording.value) {
      stopRecording()
    }
  })

  return {
    isRecording,
    audioLevel,
    error,
    startRecording,
    stopRecording,
    checkMicrophonePermission
  }
}
