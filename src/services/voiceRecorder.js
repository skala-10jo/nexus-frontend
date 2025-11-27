/**
 * 음성 녹음 서비스
 *
 * Web Audio API를 사용하여 브라우저에서 음성을 녹음합니다.
 */

class VoiceRecorder {
  constructor() {
    this.mediaRecorder = null
    this.audioChunks = []
    this.stream = null
  }

  /**
   * 마이크 권한 확인
   * @returns {Promise<boolean>} 권한 여부
   */
  async checkMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop())
      return true
    } catch (error) {
      console.error('마이크 권한 확인 실패:', error)
      return false
    }
  }

  /**
   * 녹음 시작
   * @param {Object} options - 녹음 옵션
   * @param {string} options.mimeType - MIME 타입 (기본값: audio/webm)
   * @returns {Promise<void>}
   * @throws {Error} 마이크 접근 실패 시
   */
  async startRecording(options = {}) {
    const {
      mimeType = 'audio/wav'
    } = options

    try {
      // 마이크 스트림 가져오기
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,  // 에코 제거
          noiseSuppression: true,  // 노이즈 제거
          autoGainControl: true,    // 자동 음량 조절
          sampleRate: 16000         // Azure Speech 권장 샘플레이트
        }
      })

      // MediaRecorder 설정 - WAV 우선, 지원하지 않으면 WebM
      let mimeTypeToUse = 'audio/webm'  // fallback
      if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeTypeToUse = 'audio/wav'
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeTypeToUse = 'audio/webm;codecs=opus'
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeTypeToUse = 'audio/ogg;codecs=opus'
      }

      console.log('Using MIME type:', mimeTypeToUse)

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: mimeTypeToUse
      })

      this.audioChunks = []

      // 데이터 수신 이벤트
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      // 녹음 시작
      this.mediaRecorder.start()
      console.log('녹음 시작:', mimeTypeToUse)

    } catch (error) {
      console.error('녹음 시작 실패:', error)

      // 에러 메시지 처리
      let errorMessage = '마이크 접근 실패'

      if (error.name === 'NotAllowedError') {
        errorMessage = '마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
      } else if (error.name === 'NotFoundError') {
        errorMessage = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.'
      } else if (error.name === 'NotReadableError') {
        errorMessage = '마이크가 다른 애플리케이션에서 사용 중입니다.'
      }

      throw new Error(errorMessage)
    }
  }

  /**
   * 녹음 중지 및 오디오 Blob 반환
   * @returns {Promise<Blob>} 녹음된 오디오 Blob
   */
  stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('녹음이 시작되지 않았습니다'))
        return
      }

      // 녹음 중지 이벤트
      this.mediaRecorder.onstop = () => {
        try {
          // Blob 생성
          const mimeType = this.mediaRecorder.mimeType
          const audioBlob = new Blob(this.audioChunks, { type: mimeType })

          console.log('녹음 완료:', {
            size: `${(audioBlob.size / 1024).toFixed(2)}KB`,
            type: mimeType
          })

          // 리소스 정리
          this.cleanup()

          resolve(audioBlob)
        } catch (error) {
          console.error('Blob 생성 실패:', error)
          reject(error)
        }
      }

      // 에러 이벤트
      this.mediaRecorder.onerror = (event) => {
        console.error('녹음 오류:', event.error)
        this.cleanup()
        reject(event.error)
      }

      // 녹음 중지
      if (this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop()
      }
    })
  }

  /**
   * 녹음 취소 (리소스 정리)
   */
  cancel() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.cleanup()
    console.log('녹음 취소됨')
  }

  /**
   * 리소스 정리
   * @private
   */
  cleanup() {
    // 스트림 정리
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop()
      })
      this.stream = null
    }

    // MediaRecorder 정리
    if (this.mediaRecorder) {
      this.mediaRecorder = null
    }

    // 오디오 청크 정리
    this.audioChunks = []
  }

  /**
   * 녹음 중 여부
   * @returns {boolean}
   */
  isRecording() {
    return this.mediaRecorder && this.mediaRecorder.state === 'recording'
  }

  /**
   * 브라우저가 오디오 녹음을 지원하는지 확인
   * @returns {boolean}
   */
  static isSupported() {
    return !!(
      navigator.mediaDevices &&
      navigator.mediaDevices.getUserMedia &&
      window.MediaRecorder
    )
  }
}

// 싱글톤 인스턴스 export
export default new VoiceRecorder()
