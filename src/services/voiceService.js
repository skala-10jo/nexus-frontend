/**
 * Voice API 서비스
 *
 * 백엔드 Voice API (STT, Translation, TTS)를 호출하는 서비스
 * WebSocket STT 스트리밍 및 REST API 지원
 *
 * 주요 기능:
 * - WebSocket 기반 실시간 STT 스트리밍
 *   - createSTTOnlyStream(): 단일 언어 STT (회화연습, Learning Mode용)
 *   - createTranslationStream(): 다국어 자동감지 + 번역 (음성번역용)
 * - REST API 기반 번역
 * - REST API 기반 TTS (음성 합성)
 */
import { pythonAPI } from './api'

const BASE_URL = '/voice'

/**
 * WebSocket 호스트 URL 생성 헬퍼
 * @returns {string} WebSocket 호스트 URL (예: 'localhost:8000')
 */
function getWebSocketHost() {
  return import.meta.env.VITE_PYTHON_API_URL
    ? new URL(import.meta.env.VITE_PYTHON_API_URL).host
    : 'localhost:8000'
}

/**
 * WebSocket 프로토콜 결정 (https → wss, http → ws)
 * @returns {string} 'wss:' 또는 'ws:'
 */
function getWebSocketProtocol() {
  return window.location.protocol === 'https:' ? 'wss:' : 'ws:'
}

// ============================================================
// WebSocket 연결 안정성 상수
// ============================================================
const WS_RECONNECT_MAX_ATTEMPTS = 3           // 최대 재연결 시도 횟수
const WS_RECONNECT_BASE_DELAY = 1000          // 재연결 기본 딜레이 (1초)
const WS_HEARTBEAT_INTERVAL = 25000           // Heartbeat 간격 (25초)
const WS_CONNECTION_TIMEOUT = 10000           // 연결 타임아웃 (10초)

/**
 * STT: 음성 파일을 텍스트로 변환 (POST 업로드)
 *
 * @param {File} audioFile - 음성 파일 (WAV/MP3/OGG)
 * @param {string} language - BCP-47 언어 코드 (예: ko-KR, en-US, ja-JP)
 * @returns {Promise<Object>} STT 결과 { text, confidence, language }
 */
export async function speechToText(audioFile, language = 'ko-KR') {
  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('language', language)

  const response = await pythonAPI.post(`${BASE_URL}/stt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.data
}

// ============================================================
// WebSocket STT 스트리밍 함수들
// ============================================================

/**
 * STT 전용 WebSocket 스트리밍 연결 생성 (번역 없음, 고성능)
 *
 * 회화연습, Learning Mode 등 번역이 필요 없는 경우 사용합니다.
 * 자동 언어 감지 없이 지정된 단일 언어로만 인식하여 더 빠른 응답을 제공합니다.
 *
 * 연결 안정성 기능:
 * - 연결 타임아웃 (10초)
 * - Heartbeat ping/pong (25초 간격)
 * - 자동 재연결 (최대 3회, exponential backoff)
 *
 * @param {string} language - 인식 언어 (BCP-47 코드, 예: "en-US", "ko-KR")
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @param {Function} callbacks.onConnected - WebSocket 연결 완료 콜백
 * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백 ({ text })
 * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백 ({ text, language })
 * @param {Function} callbacks.onError - 에러 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.autoSegment - 자동 분절 모드 (기본: false, true면 침묵 감지로 자동 문장 분리)
 * @param {Function} callbacks.onReconnecting - 재연결 시도 콜백 (attempt, maxAttempts)
 * @returns {Object} WebSocket 및 제어 함수 { ws, send, close }
 */
export function createSTTOnlyStream(language = 'en-US', callbacks = {}, options = {}) {
  const wsUrl = `${getWebSocketProtocol()}//${getWebSocketHost()}/api/ai/voice/stt-stream`
  const autoSegment = options.autoSegment || false

  console.log('🎤 [STT-Only] WebSocket URL:', wsUrl)
  console.log('🎤 [STT-Only] Language:', language)
  console.log('🎤 [STT-Only] Auto-segment:', autoSegment)

  // 언어가 배열이면 첫 번째 요소 사용 (하위 호환)
  const singleLanguage = Array.isArray(language) ? language[0] : language

  if (Array.isArray(language)) {
    console.warn('⚠️ [STT-Only] Array received, using first element:', singleLanguage)
  }

  // 연결 상태 관리
  let reconnectAttempts = 0
  let heartbeatInterval = null
  let connectionTimeout = null
  let isIntentionalClose = false
  let ws = null

  /**
   * Heartbeat 시작 (연결 유지)
   */
  function startHeartbeat() {
    stopHeartbeat()
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }))
          console.debug('💓 [STT-Only] Heartbeat ping sent')
        } catch (e) {
          console.warn('⚠️ [STT-Only] Heartbeat failed:', e.message)
        }
      }
    }, WS_HEARTBEAT_INTERVAL)
  }

  /**
   * Heartbeat 중지
   */
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  /**
   * 연결 타임아웃 설정
   */
  function setConnectionTimeout() {
    clearConnectionTimeout()
    connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.warn('⚠️ [STT-Only] Connection timeout')
        ws.close()
        if (callbacks.onError) {
          callbacks.onError('연결 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.')
        }
      }
    }, WS_CONNECTION_TIMEOUT)
  }

  /**
   * 연결 타임아웃 해제
   */
  function clearConnectionTimeout() {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
  }

  /**
   * WebSocket 연결 생성
   */
  function createConnection() {
    ws = new WebSocket(wsUrl)
    setConnectionTimeout()

    ws.onopen = () => {
      console.log('✅ [STT-Only] WebSocket connected')
      clearConnectionTimeout()
      reconnectAttempts = 0  // 연결 성공 시 재연결 카운터 초기화

      ws.send(JSON.stringify({ language: singleLanguage }))
      startHeartbeat()

      if (callbacks.onConnected) {
        callbacks.onConnected()
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'recognizing':
            if (callbacks.onRecognizing) {
              callbacks.onRecognizing(message)
            }
            break

          case 'recognized':
            console.log('🎤 [STT-Only] Recognized:', message.text)
            if (callbacks.onRecognized) {
              callbacks.onRecognized(message)
            }
            break

          case 'pong':
            console.debug('💓 [STT-Only] Heartbeat pong received')
            break

          case 'error':
            console.error('❌ [STT-Only] Error:', message.error)
            if (callbacks.onError) {
              callbacks.onError(message.error)
            }
            break

          case 'end':
            console.log('🔚 [STT-Only] Stream ended')
            if (callbacks.onEnd) {
              callbacks.onEnd()
            }
            break

          default:
            console.warn('[STT-Only] Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('[STT-Only] Failed to parse message:', error)
        if (callbacks.onError) {
          callbacks.onError(error.message)
        }
      }
    }

    ws.onclose = (event) => {
      console.log(`🔌 [STT-Only] WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`)
      clearConnectionTimeout()
      stopHeartbeat()

      // 의도적 종료가 아니고 재연결 가능한 경우
      if (!isIntentionalClose && reconnectAttempts < WS_RECONNECT_MAX_ATTEMPTS) {
        const delay = WS_RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts)
        reconnectAttempts++

        console.log(`🔄 [STT-Only] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${WS_RECONNECT_MAX_ATTEMPTS})`)

        if (callbacks.onReconnecting) {
          callbacks.onReconnecting(reconnectAttempts, WS_RECONNECT_MAX_ATTEMPTS)
        }

        setTimeout(() => {
          if (!isIntentionalClose) {
            createConnection()
          }
        }, delay)
      } else {
        if (callbacks.onEnd) {
          callbacks.onEnd()
        }
      }
    }

    ws.onerror = (error) => {
      console.error('❌ [STT-Only] WebSocket error:', error)
      // onerror 후 onclose가 호출되므로 여기서는 재연결 로직 실행 안 함
      if (callbacks.onError) {
        callbacks.onError('WebSocket 연결 오류가 발생했습니다.')
      }
    }
  }

  // 초기 연결 생성
  createConnection()

  return {
    get ws() { return ws },
    send(audioChunk) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(audioChunk)
      } else {
        console.warn('[STT-Only] WebSocket not open. State:', ws?.readyState)
      }
    },
    close() {
      isIntentionalClose = true
      stopHeartbeat()
      clearConnectionTimeout()

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end' }))
        setTimeout(() => ws.close(), 100)
      } else if (ws) {
        ws.close()
      }
    }
  }
}

/**
 * 번역 포함 WebSocket 스트리밍 연결 생성 (다국어 자동 감지 + 번역)
 *
 * 음성번역 페이지에서 사용합니다.
 * 선택한 언어들 중 자동으로 감지하고, 감지된 언어를 제외한 나머지 언어로 번역합니다.
 *
 * 연결 안정성 기능:
 * - 연결 타임아웃 (10초)
 * - Heartbeat ping/pong (25초 간격)
 * - 자동 재연결 (최대 3회, exponential backoff)
 *
 * 전문용어사전 적용:
 * - projectId를 전달하면 해당 프로젝트에 연결된 문서의 용어집을 후처리로 적용합니다.
 * - projectId가 없으면 기본 Azure Translator 번역만 수행합니다.
 *
 * @param {string[]} languages - 인식 언어 배열 (BCP-47 코드, 예: ["ko-KR", "en-US", "ja-JP"])
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @param {Function} callbacks.onConnected - WebSocket 연결 완료 콜백
 * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백 ({ text })
 * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백 ({ text, detected_language, translations })
 * @param {Function} callbacks.onError - 에러 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @param {Function} callbacks.onReconnecting - 재연결 시도 콜백 (attempt, maxAttempts)
 * @param {string|null} projectId - 프로젝트 ID (용어집 적용, 선택사항)
 * @returns {Object} WebSocket 및 제어 함수 { ws, send, close }
 */
export function createTranslationStream(languages = ['en-US'], callbacks = {}, projectId = null) {
  const wsUrl = `${getWebSocketProtocol()}//${getWebSocketHost()}/api/ai/voice/realtime`
  const selectedLanguages = Array.isArray(languages) ? languages : [languages]

  console.log('🌐 [Translation] WebSocket URL:', wsUrl)
  console.log('🌐 [Translation] Selected languages:', selectedLanguages)
  console.log('🌐 [Translation] Project ID:', projectId || 'None (용어집 미사용)')

  // 연결 상태 관리
  let reconnectAttempts = 0
  let heartbeatInterval = null
  let connectionTimeout = null
  let isIntentionalClose = false
  let ws = null

  /**
   * Heartbeat 시작 (연결 유지)
   */
  function startHeartbeat() {
    stopHeartbeat()
    heartbeatInterval = setInterval(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ type: 'ping' }))
          console.debug('💓 [Translation] Heartbeat ping sent')
        } catch (e) {
          console.warn('⚠️ [Translation] Heartbeat failed:', e.message)
        }
      }
    }, WS_HEARTBEAT_INTERVAL)
  }

  /**
   * Heartbeat 중지
   */
  function stopHeartbeat() {
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval)
      heartbeatInterval = null
    }
  }

  /**
   * 연결 타임아웃 설정
   */
  function setConnectionTimeout() {
    clearConnectionTimeout()
    connectionTimeout = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.CONNECTING) {
        console.warn('⚠️ [Translation] Connection timeout')
        ws.close()
        if (callbacks.onError) {
          callbacks.onError('연결 시간이 초과되었습니다. 네트워크 상태를 확인해주세요.')
        }
      }
    }, WS_CONNECTION_TIMEOUT)
  }

  /**
   * 연결 타임아웃 해제
   */
  function clearConnectionTimeout() {
    if (connectionTimeout) {
      clearTimeout(connectionTimeout)
      connectionTimeout = null
    }
  }

  /**
   * WebSocket 연결 생성
   */
  function createConnection() {
    ws = new WebSocket(wsUrl)
    setConnectionTimeout()

    ws.onopen = () => {
      console.log('✅ [Translation] WebSocket connected')
      clearConnectionTimeout()
      reconnectAttempts = 0  // 연결 성공 시 재연결 카운터 초기화

      // 세션 초기화 메시지 전송 (언어 + 프로젝트 ID)
      const initMessage = {
        selected_languages: selectedLanguages
      }

      // 프로젝트 ID가 있으면 추가 (용어집 적용)
      if (projectId) {
        initMessage.project_id = projectId
        console.log('📚 [Translation] 용어집 적용 모드: project_id=' + projectId)
      }

      ws.send(JSON.stringify(initMessage))
      startHeartbeat()

      if (callbacks.onConnected) {
        callbacks.onConnected()
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'recognizing':
            if (callbacks.onRecognizing) {
              callbacks.onRecognizing(message)
            }
            break

          case 'recognized':
            if (callbacks.onRecognized) {
              callbacks.onRecognized(message)
            }
            break

          case 'pong':
            console.debug('💓 [Translation] Heartbeat pong received')
            break

          case 'error':
            console.error('❌ [Translation] Error:', message.message || message.error)
            if (callbacks.onError) {
              callbacks.onError(message.message || message.error)
            }
            break

          case 'end':
            console.log('🔚 [Translation] Stream ended')
            if (callbacks.onEnd) {
              callbacks.onEnd()
            }
            break

          default:
            break
        }
      } catch (error) {
        console.error('[Translation] Failed to parse message:', error)
        if (callbacks.onError) {
          callbacks.onError(error.message)
        }
      }
    }

    ws.onclose = (event) => {
      console.log(`🔌 [Translation] WebSocket disconnected (code: ${event.code}, reason: ${event.reason})`)
      clearConnectionTimeout()
      stopHeartbeat()

      // 의도적 종료가 아니고 재연결 가능한 경우
      if (!isIntentionalClose && reconnectAttempts < WS_RECONNECT_MAX_ATTEMPTS) {
        const delay = WS_RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts)
        reconnectAttempts++

        console.log(`🔄 [Translation] Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${WS_RECONNECT_MAX_ATTEMPTS})`)

        if (callbacks.onReconnecting) {
          callbacks.onReconnecting(reconnectAttempts, WS_RECONNECT_MAX_ATTEMPTS)
        }

        setTimeout(() => {
          if (!isIntentionalClose) {
            createConnection()
          }
        }, delay)
      } else {
        if (callbacks.onEnd) {
          callbacks.onEnd()
        }
      }
    }

    ws.onerror = (error) => {
      console.error('❌ [Translation] WebSocket error:', error)
      // onerror 후 onclose가 호출되므로 여기서는 재연결 로직 실행 안 함
      if (callbacks.onError) {
        callbacks.onError('WebSocket 연결 오류가 발생했습니다.')
      }
    }
  }

  // 초기 연결 생성
  createConnection()

  return {
    get ws() { return ws },
    send(audioChunk) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(audioChunk)
      } else {
        console.warn('[Translation] WebSocket not open. State:', ws?.readyState)
      }
    },
    close() {
      isIntentionalClose = true
      stopHeartbeat()
      clearConnectionTimeout()

      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end' }))
        setTimeout(() => ws.close(), 100)
      } else if (ws) {
        ws.close()
      }
    }
  }
}

/**
 * @deprecated Use createSTTOnlyStream() or createTranslationStream() instead.
 *
 * 기존 함수 - 하위 호환성을 위해 유지
 * 내부적으로 createTranslationStream()을 호출합니다.
 *
 * @param {string|string[]} languages - 인식 언어
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @returns {Object} WebSocket 및 제어 함수
 */
export function createMultiLangSTTStream(languages = ['en-US'], callbacks = {}) {
  console.warn('⚠️ createMultiLangSTTStream is deprecated. Use createSTTOnlyStream() or createTranslationStream() instead.')
  return createTranslationStream(languages, callbacks)
}

/**
 * 번역: 텍스트를 다른 언어로 번역
 *
 * @param {string} text - 번역할 텍스트
 * @param {string} sourceLang - 원본 언어 (ISO 639-1, 예: ko, en, ja)
 * @param {string} targetLang - 목표 언어 (ISO 639-1)
 * @returns {Promise<Object>} 번역 결과 { original_text, translated_text, source_lang, target_lang }
 */
export async function translateText(text, sourceLang = 'ko', targetLang = 'en') {
  const response = await pythonAPI.post(`${BASE_URL}/translate`, {
    text,
    source_lang: sourceLang,
    target_lang: targetLang
  })

  return response.data.data
}

/**
 * 일괄 번역: 여러 텍스트를 한 번에 번역
 *
 * @param {string[]} texts - 번역할 텍스트 배열 (최대 100개)
 * @param {string} sourceLang - 원본 언어
 * @param {string} targetLang - 목표 언어
 * @returns {Promise<Object>} 번역 결과 { translations[], total_count }
 */
export async function translateBatch(texts, sourceLang = 'ko', targetLang = 'en') {
  const response = await pythonAPI.post(`${BASE_URL}/translate/batch`, {
    texts,
    source_lang: sourceLang,
    target_lang: targetLang
  })

  return response.data.data
}

/**
 * 지원 언어 목록 조회
 *
 * @returns {Promise<Object>} 지원 언어 목록 { languages: {}, total_count }
 */
export async function getSupportedLanguages() {
  const response = await pythonAPI.get(`${BASE_URL}/translate/languages`)
  return response.data.data
}

/**
 * TTS: 텍스트를 음성으로 변환
 *
 * @param {string} text - 음성으로 변환할 텍스트
 * @param {string} voiceName - Azure 뉴럴 음성 이름 (예: ko-KR-SunHiNeural)
 * @param {number} rate - 말하기 속도 (0.5 ~ 2.0, 기본값 1.0)
 * @param {number} pitch - 음높이 (-50 ~ 50, 기본값 0)
 * @param {number} volume - 음량 (0 ~ 100, 기본값 100)
 * @returns {Promise<Blob>} WAV 형식 오디오 Blob
 */
export async function textToSpeech(
  text,
  voiceName = 'ko-KR-SunHiNeural',
  rate = 1.0,
  pitch = 0,
  volume = 100
) {
  const response = await pythonAPI.post(
    `${BASE_URL}/tts`,
    {
      text,
      voice_name: voiceName,
      rate,
      pitch,
      volume
    },
    {
      responseType: 'blob' // 바이너리 응답
    }
  )

  // Blob 반환 (WAV 형식)
  return new Blob([response.data], { type: 'audio/wav' })
}

/**
 * 사용 가능한 음성 목록 조회
 *
 * @returns {Promise<Object>} 음성 목록 { voices: {}, total_languages, total_voices }
 */
export async function getAvailableVoices() {
  const response = await pythonAPI.get(`${BASE_URL}/tts/voices`)
  return response.data.data
}
