/**
 * 실시간 음성 인식 WebSocket 서비스
 *
 * WebSocket을 사용하여 실시간으로 음성을 텍스트로 변환합니다.
 */

class VoiceSTTStreamService {
  constructor() {
    this.ws = null
    this.mediaRecorder = null
    this.stream = null
    this.isRecording = false

    // 콜백 함수들
    this.onInterim = null  // (text) => {}
    this.onFinal = null    // (text, confidence) => {}
    this.onError = null    // (error) => {}
    this.onClose = null    // () => {}

    // 발음 평가용 오디오 녹음
    this.audioChunks = []  // MediaRecorder로 녹음된 청크들
    this.mediaRecorderForPronunciation = null  // 별도 MediaRecorder
  }

  /**
   * WebSocket 연결 및 녹음 시작
   * @param {Object} options - 옵션
   * @param {string} options.language - 언어 코드 (기본값: en-US)
   * @param {function} options.onInterim - interim 결과 콜백
   * @param {function} options.onFinal - final 결과 콜백
   * @param {function} options.onError - 에러 콜백
   * @param {function} options.onClose - 연결 종료 콜백
   * @returns {Promise<void>}
   */
  async startStreaming({
    language = 'en-US',
    onInterim = null,
    onFinal = null,
    onError = null,
    onClose = null
  }) {
    try {
      // 콜백 설정
      this.onInterim = onInterim
      this.onFinal = onFinal
      this.onError = onError
      this.onClose = onClose

      // 1. 마이크 스트림 가져오기
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000  // Azure Speech 권장
        }
      })

      console.log('🎤 Microphone stream acquired')

      // 2. WebSocket 연결
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('인증 토큰이 없습니다. 로그인해주세요.')
      }

      // WebSocket URL (환경에 따라 변경)
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/ai/voice/ws/stt'
      this.ws = new WebSocket(wsUrl)

      // WebSocket 이벤트 핸들러 등록
      this.setupWebSocketHandlers()

      // WebSocket 연결 대기
      await this.waitForOpen()

      console.log('🔗 WebSocket connected')

      // 3. 인증
      this.ws.send(JSON.stringify({
        type: 'auth',
        token: token
      }))

      // 인증 성공 대기
      await this.waitForAuthSuccess()

      console.log('✅ Authentication successful')

      // 4. 설정
      this.ws.send(JSON.stringify({
        type: 'config',
        language: language,
        enable_diarization: false
      }))

      console.log(`⚙️ Config sent: language=${language}`)

      // 5. MediaRecorder 설정 및 녹음 시작
      await this.startRecording()

      console.log('🎙️ Recording started')

      this.isRecording = true

    } catch (error) {
      console.error('Streaming start failed:', error)
      this.cleanup()

      if (this.onError) {
        this.onError(error.message || '실시간 음성 인식 시작 실패')
      }

      throw error
    }
  }

  /**
   * WebSocket 이벤트 핸들러 설정
   * @private
   */
  setupWebSocketHandlers() {
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        this.handleWebSocketMessage(message)
      } catch (error) {
        console.error('WebSocket message parse error:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      if (this.onError) {
        this.onError('WebSocket 연결 오류')
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason)

      if (!event.wasClean && this.onError) {
        this.onError('연결이 끊어졌습니다')
      }

      if (this.onClose) {
        this.onClose()
      }

      this.cleanup()
    }
  }

  /**
   * WebSocket 메시지 처리
   * @private
   */
  handleWebSocketMessage(message) {
    console.log('📨 Received:', message.type)

    switch (message.type) {
      case 'auth_success':
        console.log('✅ Auth success:', message.user_id)
        break

      case 'auth_error':
        console.error('❌ Auth error:', message.message)
        if (this.onError) {
          this.onError(message.message)
        }
        this.stopStreaming()
        break

      case 'interim':
        // 실시간 인식 중 (회색 텍스트)
        if (this.onInterim && message.text) {
          this.onInterim(message.text)
        }
        break

      case 'final':
        // 최종 인식 완료 (검정 텍스트)
        if (this.onFinal && message.text) {
          this.onFinal(message.text, message.confidence)
        }
        break

      case 'error':
        console.error('❌ STT error:', message.message)
        if (this.onError) {
          this.onError(message.message)
        }
        break

      case 'closed':
        console.log('🔌 Server closed connection')
        this.stopStreaming()
        break

      case 'session_stopped':
        console.log('⏹️ Session stopped')
        break

      default:
        console.warn('Unknown message type:', message.type)
    }
  }

  /**
   * MediaRecorder 설정 및 녹음 시작 (PCM 추출 방식)
   * @private
   */
  async startRecording() {
    // AudioContext 생성
    const audioContext = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: 16000  // Azure Speech SDK 권장
    })

    // MediaStream을 AudioContext로 연결
    const source = audioContext.createMediaStreamSource(this.stream)

    // ScriptProcessorNode 생성 (PCM 데이터 추출)
    // bufferSize: 4096, inputChannels: 1 (mono), outputChannels: 1
    const scriptNode = audioContext.createScriptProcessor(4096, 1, 1)

    scriptNode.onaudioprocess = (event) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          // Float32Array (PCM) 데이터 가져오기
          const inputData = event.inputBuffer.getChannelData(0)

          // Float32 → Int16 변환 (Azure Speech SDK 요구 포맷)
          const int16Data = new Int16Array(inputData.length)
          for (let i = 0; i < inputData.length; i++) {
            // -1.0 ~ 1.0 범위를 -32768 ~ 32767로 변환
            const s = Math.max(-1, Math.min(1, inputData[i]))
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
          }

          // Int16Array → Base64 변환
          const base64 = this.arrayBufferToBase64(int16Data.buffer)

          // WebSocket으로 전송
          this.ws.send(JSON.stringify({
            type: 'audio',
            data: base64
          }))

          console.log(`🎵 Audio chunk sent: ${(int16Data.buffer.byteLength / 1024).toFixed(2)}KB`)
        } catch (error) {
          console.error('Audio processing failed:', error)
        }
      }
    }

    // 오디오 파이프라인 연결
    source.connect(scriptNode)
    scriptNode.connect(audioContext.destination)

    // 나중에 정리할 수 있도록 저장
    this.audioContext = audioContext
    this.scriptNode = scriptNode
    this.source = source

    // 발음 평가용 MediaRecorder 시작 (같은 스트림 사용)
    this.audioChunks = []

    // MediaRecorder 지원 확인 및 최적 포맷 선택
    let mimeType = 'audio/webm;codecs=opus'
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'audio/webm'
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/ogg;codecs=opus'
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = '' // 브라우저 기본값
        }
      }
    }

    this.mediaRecorderForPronunciation = new MediaRecorder(this.stream, {
      mimeType: mimeType || undefined
    })

    this.mediaRecorderForPronunciation.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data)
        console.log(`🎤 Audio chunk for pronunciation: ${event.data.size} bytes`)
      }
    }

    this.mediaRecorderForPronunciation.start(1000) // 1초마다 청크 수집
    console.log('🎙️ MediaRecorder started for pronunciation assessment')
  }

  /**
   * ArrayBuffer → Base64 변환
   * @private
   */
  arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * Blob → Base64 변환 (deprecated - PCM 방식으로 대체됨)
   * @private
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // "data:audio/webm;base64,..." 형태에서 base64 부분만 추출
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * WebSocket OPEN 상태 대기
   * @private
   */
  waitForOpen() {
    return new Promise((resolve, reject) => {
      if (this.ws.readyState === WebSocket.OPEN) {
        resolve()
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('WebSocket 연결 타임아웃 (10초)'))
      }, 10000)

      this.ws.onopen = () => {
        clearTimeout(timeout)
        resolve()
      }

      this.ws.onerror = () => {
        clearTimeout(timeout)
        reject(new Error('WebSocket 연결 실패'))
      }
    })
  }

  /**
   * 인증 성공 대기
   * @private
   */
  waitForAuthSuccess() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('인증 타임아웃 (10초)'))
      }, 10000)

      const originalOnMessage = this.ws.onmessage

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)

          if (message.type === 'auth_success') {
            clearTimeout(timeout)
            this.ws.onmessage = originalOnMessage  // 원래 핸들러로 복구
            resolve()
          } else if (message.type === 'auth_error') {
            clearTimeout(timeout)
            reject(new Error(message.message || '인증 실패'))
          }
        } catch (error) {
          // 파싱 에러 무시 (다른 메시지일 수 있음)
        }
      }
    })
  }

  /**
   * 녹음 중지 및 WebSocket 종료
   * @returns {Promise<Blob|null>} 발음 평가용 오디오 Blob
   */
  async stopStreaming() {
    console.log('⏹️ Stopping streaming...')

    try {
      // Stop 신호 전송
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'stop' }))
        console.log('📤 Stop signal sent')
      }
    } catch (error) {
      console.error('Stop signal send failed:', error)
    }

    // 발음 평가용 MediaRecorder 중지 및 Blob 생성
    let audioBlob = null
    if (this.mediaRecorderForPronunciation && this.mediaRecorderForPronunciation.state !== 'inactive') {
      audioBlob = await new Promise((resolve) => {
        this.mediaRecorderForPronunciation.onstop = () => {
          if (this.audioChunks.length > 0) {
            const blob = new Blob(this.audioChunks, { type: 'audio/webm' })
            console.log(`🎤 Audio blob created for pronunciation: ${blob.size} bytes`)
            resolve(blob)
          } else {
            console.warn('⚠️ No audio chunks collected')
            resolve(null)
          }
        }
        this.mediaRecorderForPronunciation.stop()
      })
    }

    this.cleanup()
    this.isRecording = false

    console.log('✅ Streaming stopped')

    return audioBlob
  }

  /**
   * 리소스 정리
   * @private
   */
  cleanup() {
    // AudioContext 정리
    if (this.scriptNode) {
      try {
        this.scriptNode.disconnect()
      } catch (error) {
        console.error('ScriptNode disconnect error:', error)
      }
      this.scriptNode = null
    }

    if (this.source) {
      try {
        this.source.disconnect()
      } catch (error) {
        console.error('Source disconnect error:', error)
      }
      this.source = null
    }

    if (this.audioContext) {
      try {
        this.audioContext.close()
      } catch (error) {
        console.error('AudioContext close error:', error)
      }
      this.audioContext = null
    }

    // MediaRecorder 정리 (deprecated)
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop()
      } catch (error) {
        console.error('MediaRecorder stop error:', error)
      }
    }
    this.mediaRecorder = null

    // 발음 평가용 MediaRecorder 정리
    if (this.mediaRecorderForPronunciation && this.mediaRecorderForPronunciation.state !== 'inactive') {
      try {
        this.mediaRecorderForPronunciation.stop()
      } catch (error) {
        console.error('MediaRecorder for pronunciation stop error:', error)
      }
    }
    this.mediaRecorderForPronunciation = null
    this.audioChunks = []

    // 마이크 스트림 정리
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
      this.stream = null
    }

    // WebSocket 정리
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        try {
          this.ws.close()
        } catch (error) {
          console.error('WebSocket close error:', error)
        }
      }
      this.ws = null
    }

    this.isRecording = false
  }

  /**
   * 녹음 중 여부
   * @returns {boolean}
   */
  getIsRecording() {
    return this.isRecording
  }

  /**
   * 브라우저 지원 여부 확인
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder &&
      window.WebSocket
    )
  }
}

// 싱글톤 인스턴스 export
export default new VoiceSTTStreamService()
