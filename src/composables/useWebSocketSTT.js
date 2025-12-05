/**
 * WebSocket STT Composable (백엔드 경유 방식)
 *
 * 백엔드 WebSocket 기반 구조:
 * - Frontend: 마이크 오디오를 WebSocket으로 Backend 전송
 * - Backend: Azure Speech SDK로 STT 수행 후 결과 반환
 * - Frontend: 인식 결과 받아서 번역 요청
 *
 * 오디오 처리:
 * - Web Audio API로 마이크 입력 캡처
 * - PCM 16kHz mono로 변환
 * - Base64 인코딩하여 WebSocket 전송
 *
 * 인증:
 * - JWT 토큰을 WebSocket 연결 시 전송
 * - Backend에서 토큰 검증 후 연결 허용
 *
 * 다국어 지원:
 * - Azure Speech SDK 자동 언어 감지
 * - 인식된 언어로부터 다른 언어로 번역 (Backend Agent)
 *
 * @example
 * import { useWebSocketSTT } from '@/composables/useWebSocketSTT'
 *
 * const {
 *   isRecording,
 *   translationCards,
 *   startRecording,
 *   stopRecording
 * } = useWebSocketSTT()
 *
 * // 다국어 STT + 번역 시작
 * await startRecording(['ko-KR', 'en-US', 'ja-JP', 'vi-VN'])
 */
import { ref, onUnmounted } from 'vue'
import { pythonAPI } from '@/services/api'

export function useWebSocketSTT() {
  // 상태
  const isRecording = ref(false)
  const isConnected = ref(false)
  const error = ref(null)

  // 번역 카드 목록
  const translationCards = ref([])
  const recognizingText = ref('')

  // WebSocket 및 오디오 리소스
  let ws = null
  let audioContext = null
  let mediaStream = null
  let scriptProcessor = null
  let selectedLanguages = []

  /**
   * 녹음 시작 (WebSocket + Backend Azure Speech SDK)
   *
   * @param {string[]} languages - 선택된 언어 목록 (BCP-47)
   *   예: ['ko-KR', 'en-US', 'ja-JP', 'vi-VN']
   */
  async function startRecording(languages = ['ko-KR', 'en-US']) {
    try {
      // 이전 세션 정리
      if (ws || audioContext) {
        console.log('⚠️ Cleaning up previous session...')
        cleanup()
      }

      error.value = null
      selectedLanguages = languages

      // 언어 검증
      if (!languages || languages.length < 2) {
        throw new Error('최소 2개 이상의 언어를 선택해야 합니다')
      }

      console.log('🎤 Starting WebSocket STT...')
      console.log('📋 Selected languages:', languages)

      // JWT 토큰 가져오기
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('로그인이 필요합니다')
      }

      // 1. WebSocket 연결
      await connectWebSocket(token, languages)

      // 2. 마이크 오디오 스트림 시작
      await startAudioCapture()

      console.log('✅ Recording started')
    } catch (err) {
      console.error('❌ Failed to start recording:', err)
      error.value = err.message || '녹음 시작 실패'
      cleanup()
      throw err
    }
  }

  /**
   * WebSocket 연결 및 인증
   */
  async function connectWebSocket(token, languages) {
    return new Promise((resolve, reject) => {
      try {
        // WebSocket URL 생성
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsHost = import.meta.env.VITE_PYTHON_API_URL?.replace(/^https?:\/\//, '') || 'localhost:8000'
        const wsUrl = `${wsProtocol}//${wsHost}/voice/ws/stt`

        console.log('🔌 Connecting to WebSocket:', wsUrl)

        ws = new WebSocket(wsUrl)

        // 연결 성공
        ws.onopen = async () => {
          console.log('✅ WebSocket connected')

          try {
            // 1. 인증 메시지 전송
            ws.send(JSON.stringify({
              type: 'auth',
              token: token
            }))

            console.log('🔑 Auth message sent')

            // 인증 응답 대기 (타임아웃 10초)
            const authTimeout = setTimeout(() => {
              reject(new Error('인증 타임아웃'))
            }, 10000)

            // 일회성 메시지 핸들러 (인증 응답 대기)
            const waitForAuth = (event) => {
              const data = JSON.parse(event.data)

              if (data.type === 'auth_success') {
                clearTimeout(authTimeout)
                console.log('✅ Authentication successful:', data.username)

                // 2. 설정 메시지 전송 (언어, diarization)
                const primaryLanguage = languages[0] // 첫 번째 언어를 primary로
                ws.send(JSON.stringify({
                  type: 'config',
                  language: primaryLanguage,
                  enable_diarization: false
                }))

                console.log('⚙️ Config sent:', { language: primaryLanguage })

                isConnected.value = true

                // 일회성 핸들러 제거하고 실제 메시지 핸들러 등록
                ws.removeEventListener('message', waitForAuth)
                ws.addEventListener('message', handleWebSocketMessage)

                resolve()
              } else if (data.type === 'auth_error') {
                clearTimeout(authTimeout)
                reject(new Error(data.message || '인증 실패'))
              }
            }

            ws.addEventListener('message', waitForAuth)
          } catch (err) {
            reject(err)
          }
        }

        // 연결 오류
        ws.onerror = (event) => {
          console.error('❌ WebSocket error:', event)
          error.value = 'WebSocket 연결 오류'
          reject(new Error('WebSocket 연결 실패'))
        }

        // 연결 종료
        ws.onclose = (event) => {
          console.log('🔴 WebSocket closed:', event.code, event.reason)
          isConnected.value = false

          if (isRecording.value) {
            // 예상치 못한 종료
            error.value = 'WebSocket 연결이 종료되었습니다'
            cleanup()
          }
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  /**
   * WebSocket 메시지 핸들러
   */
  function handleWebSocketMessage(event) {
    try {
      const data = JSON.parse(event.data)

      switch (data.type) {
        case 'interim':
          // 중간 인식 결과
          recognizingText.value = data.text || ''
          console.log('🔍 Interim:', data.text)
          break

        case 'final':
          // 최종 인식 결과
          handleFinalRecognition(data)
          break

        case 'error':
          // 에러
          console.error('❌ Backend error:', data.message)
          error.value = data.message
          break

        case 'session_stopped':
          // 세션 종료
          console.log('🔴 Session stopped')
          cleanup()
          break

        case 'closed':
          // WebSocket 종료
          console.log('🔴 WebSocket closed by server')
          cleanup()
          break

        default:
          console.warn('⚠️ Unknown message type:', data.type)
      }
    } catch (err) {
      console.error('❌ Failed to parse WebSocket message:', err)
    }
  }

  /**
   * 최종 인식 결과 처리 및 번역
   */
  async function handleFinalRecognition(data) {
    const recognizedText = data.text
    const detectedLanguage = data.language || selectedLanguages[0] // Backend에서 언어 감지 정보 제공
    const confidence = data.confidence

    console.log('✅ Final recognition:', {
      text: recognizedText,
      language: detectedLanguage,
      confidence: confidence
    })

    recognizingText.value = ''

    if (recognizedText && recognizedText.trim()) {
      // 백엔드로 번역 요청
      try {
        const translations = await translateToMultipleLanguages(
          recognizedText,
          detectedLanguage,
          selectedLanguages
        )

        // 번역 카드 추가
        translationCards.value.unshift({
          id: Date.now(),
          original: recognizedText,
          detectedLang: detectedLanguage,
          translations: translations,
          timestamp: new Date().toISOString(),
          confidence: confidence
        })

        // 최대 50개 카드만 유지
        if (translationCards.value.length > 50) {
          translationCards.value = translationCards.value.slice(0, 50)
        }

        console.log('📝 Translation card added')
      } catch (err) {
        console.error('❌ Translation failed:', err)
        error.value = '번역 실패: ' + err.message
      }
    }
  }

  /**
   * 다국어 번역 (백엔드 TranslationAgent 호출)
   *
   * @param {string} text - 인식된 원문
   * @param {string} sourceLang - 감지된 언어 (BCP-47: ko-KR, en-US 등)
   * @param {string[]} selectedLanguages - 전체 선택 언어 목록
   * @returns {Promise<Array>} 번역 결과 배열
   */
  async function translateToMultipleLanguages(text, sourceLang, selectedLanguages) {
    // BCP-47 → ISO 639-1 변환 (ko-KR → ko, en-US → en)
    const sourceIso = sourceLang.split('-')[0]

    // 원본 언어 제외한 목표 언어 추출
    const targetLanguages = selectedLanguages
      .filter(lang => !lang.startsWith(sourceIso))
      .map(lang => lang.split('-')[0])

    if (targetLanguages.length === 0) {
      return []
    }

    console.log('🔄 Translating:', {
      text,
      from: sourceIso,
      to: targetLanguages
    })

    // 백엔드 번역 API 호출
    const response = await pythonAPI.post('/translate/batch', {
      texts: [text],
      source_lang: sourceIso,
      target_lang: targetLanguages[0] // 첫 번째 목표 언어
    })

    // 여러 언어로 번역이 필요한 경우 순차 호출
    const allTranslations = []
    for (const targetLang of targetLanguages) {
      const res = await pythonAPI.post('/translate', {
        text: text,
        source_lang: sourceIso,
        target_lang: targetLang
      })

      if (res.data.success) {
        allTranslations.push({
          lang: targetLang,
          text: res.data.data.translated_text
        })
      }
    }

    return allTranslations
  }

  /**
   * 마이크 오디오 캡처 시작
   */
  async function startAudioCapture() {
    try {
      // 마이크 권한 요청
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // Azure Speech SDK 요구사항
          channelCount: 1,   // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })

      console.log('🎙️ Microphone access granted')

      // Web Audio API 초기화
      audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      })

      // Chrome Autoplay Policy 대응: suspended 상태면 resume 필요
      if (audioContext.state === 'suspended') {
        await audioContext.resume()
      }

      const source = audioContext.createMediaStreamSource(mediaStream)

      // ScriptProcessor (오디오 처리)
      const bufferSize = 4096
      scriptProcessor = audioContext.createScriptProcessor(bufferSize, 1, 1)

      scriptProcessor.onaudioprocess = (event) => {
        if (!isRecording.value || !ws || ws.readyState !== WebSocket.OPEN) {
          return
        }

        // PCM 오디오 데이터 추출
        const inputData = event.inputBuffer.getChannelData(0)

        // Float32 → Int16 변환
        const int16Data = new Int16Array(inputData.length)
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]))
          int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
        }

        // Base64 인코딩
        const base64Audio = arrayBufferToBase64(int16Data.buffer)

        // WebSocket으로 전송
        ws.send(JSON.stringify({
          type: 'audio',
          data: base64Audio
        }))
      }

      // 오디오 파이프라인 연결
      source.connect(scriptProcessor)
      scriptProcessor.connect(audioContext.destination)

      isRecording.value = true
      console.log('🎙️ Audio capture started')
    } catch (err) {
      console.error('❌ Failed to start audio capture:', err)
      throw new Error('마이크 권한이 필요합니다')
    }
  }

  /**
   * ArrayBuffer를 Base64로 인코딩
   */
  function arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * 녹음 중지
   */
  function stopRecording() {
    try {
      console.log('⏹️ Stopping recording...')

      // WebSocket에 중지 신호 전송
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'stop' }))
        console.log('📤 Stop signal sent')
      }

      cleanup()
      console.log('✅ Recording stopped')
    } catch (err) {
      console.error('❌ Failed to stop recording:', err)
      error.value = err.message || '녹음 중지 실패'
      cleanup()
    }
  }

  /**
   * 번역 카드 초기화
   */
  function clearCards() {
    translationCards.value = []
    console.log('🗑️ Translation cards cleared')
  }

  /**
   * 리소스 정리
   */
  function cleanup() {
    // WebSocket 정리
    if (ws) {
      try {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close()
        }
      } catch (err) {
        console.error('❌ Failed to close WebSocket:', err)
      }
      ws = null
    }

    // 오디오 정리
    if (scriptProcessor) {
      scriptProcessor.disconnect()
      scriptProcessor = null
    }

    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      mediaStream = null
    }

    if (audioContext) {
      audioContext.close()
      audioContext = null
    }

    isRecording.value = false
    isConnected.value = false
    recognizingText.value = ''

    console.log('🧹 Resources cleaned up')
  }

  // 컴포넌트 언마운트 시 자동 정리
  onUnmounted(() => {
    cleanup()
  })

  return {
    // 상태
    isRecording,
    isConnected,
    error,

    // 데이터
    translationCards,
    recognizingText,

    // 메서드
    startRecording,
    stopRecording,
    clearCards
  }
}
