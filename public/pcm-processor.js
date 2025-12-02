/**
 * PCM Audio Processor (AudioWorklet)
 *
 * 브라우저 오디오를 Azure Speech SDK가 요구하는
 * PCM 16kHz, 16bit, Mono 포맷으로 변환합니다.
 *
 * 사용법:
 * 1. audioContext.audioWorklet.addModule('/pcm-processor.js')
 * 2. new AudioWorkletNode(audioContext, 'pcm-processor')
 * 3. node.port.onmessage로 PCM 데이터 수신
 */

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super()

    // 리샘플링 버퍼 (48kHz → 16kHz 변환용)
    this.inputBuffer = []

    // 입력 샘플레이트 (보통 48000Hz)
    this.inputSampleRate = sampleRate // AudioWorklet 전역 변수

    // 출력 샘플레이트 (Azure Speech 요구사항)
    this.outputSampleRate = 16000

    // 리샘플링 비율
    this.resampleRatio = this.inputSampleRate / this.outputSampleRate

    // 청크 크기 (약 100ms 분량의 PCM 데이터)
    // 16000 samples/sec * 0.1 sec = 1600 samples
    this.chunkSize = 1600

    console.log(`[PCMProcessor] Initialized: ${this.inputSampleRate}Hz → ${this.outputSampleRate}Hz`)
  }

  /**
   * 오디오 프로세싱 (128 샘플씩 호출됨)
   *
   * @param {Float32Array[][]} inputs - 입력 오디오 데이터
   * @param {Float32Array[][]} outputs - 출력 오디오 데이터 (사용 안 함)
   * @param {Object} parameters - 파라미터 (사용 안 함)
   * @returns {boolean} - true면 계속 실행
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0]

    // 입력이 없으면 계속 대기
    if (!input || !input.length || !input[0]) {
      return true
    }

    // 첫 번째 채널만 사용 (Mono)
    const inputData = input[0]

    // 입력 버퍼에 추가
    for (let i = 0; i < inputData.length; i++) {
      this.inputBuffer.push(inputData[i])
    }

    // 충분한 샘플이 모이면 리샘플링 후 전송
    const requiredSamples = this.chunkSize * this.resampleRatio

    while (this.inputBuffer.length >= requiredSamples) {
      // 리샘플링 (선형 보간)
      const resampled = this.resample(
        this.inputBuffer.slice(0, Math.ceil(requiredSamples)),
        this.chunkSize
      )

      // Float32 → Int16 변환
      const pcmInt16 = this.floatToInt16(resampled)

      // ArrayBuffer로 변환하여 전송
      this.port.postMessage(pcmInt16.buffer, [pcmInt16.buffer])

      // 처리된 샘플 제거
      this.inputBuffer = this.inputBuffer.slice(Math.ceil(requiredSamples))
    }

    return true
  }

  /**
   * 리샘플링 (선형 보간)
   *
   * @param {number[]} input - 입력 샘플 배열
   * @param {number} outputLength - 출력 샘플 개수
   * @returns {Float32Array} - 리샘플링된 데이터
   */
  resample(input, outputLength) {
    const output = new Float32Array(outputLength)
    const ratio = input.length / outputLength

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio
      const srcIndexFloor = Math.floor(srcIndex)
      const srcIndexCeil = Math.min(srcIndexFloor + 1, input.length - 1)
      const fraction = srcIndex - srcIndexFloor

      // 선형 보간
      output[i] = input[srcIndexFloor] * (1 - fraction) + input[srcIndexCeil] * fraction
    }

    return output
  }

  /**
   * Float32 → Int16 변환
   *
   * @param {Float32Array} float32Array - 입력 Float32 배열 (-1.0 ~ 1.0)
   * @returns {Int16Array} - 출력 Int16 배열 (-32768 ~ 32767)
   */
  floatToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length)

    for (let i = 0; i < float32Array.length; i++) {
      // 클리핑 (-1.0 ~ 1.0 범위로 제한)
      let sample = Math.max(-1, Math.min(1, float32Array[i]))

      // Float32 → Int16 스케일링
      int16Array[i] = sample < 0
        ? sample * 0x8000  // 음수: -32768
        : sample * 0x7FFF  // 양수: 32767
    }

    return int16Array
  }
}

// AudioWorklet 등록
registerProcessor('pcm-processor', PCMProcessor)
