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
 * @param {string} language - 인식 언어 (BCP-47 코드, 예: "en-US", "ko-KR")
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @param {Function} callbacks.onConnected - WebSocket 연결 완료 콜백
 * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백 ({ text })
 * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백 ({ text, language })
 * @param {Function} callbacks.onError - 에러 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @param {Object} options - 추가 옵션
 * @param {boolean} options.autoSegment - 자동 분절 모드 (기본: false, true면 침묵 감지로 자동 문장 분리)
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

  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    console.log('✅ [STT-Only] WebSocket connected')
    ws.send(JSON.stringify({ language: singleLanguage, auto_segment: autoSegment }))

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

  ws.onclose = () => {
    console.log('🔌 [STT-Only] WebSocket disconnected')
    if (callbacks.onEnd) {
      callbacks.onEnd()
    }
  }

  ws.onerror = (error) => {
    console.error('❌ [STT-Only] WebSocket error:', error)
    if (callbacks.onError) {
      callbacks.onError(error.message || 'WebSocket error')
    }
  }

  return {
    ws,
    send(audioChunk) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(audioChunk)
      } else {
        console.warn('[STT-Only] WebSocket not open. State:', ws.readyState)
      }
    },
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end' }))
        setTimeout(() => ws.close(), 100)
      } else {
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
 * @param {string[]} languages - 인식 언어 배열 (BCP-47 코드, 예: ["ko-KR", "en-US", "ja-JP"])
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @param {Function} callbacks.onConnected - WebSocket 연결 완료 콜백
 * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백 ({ text })
 * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백 ({ text, detected_language, translations })
 * @param {Function} callbacks.onError - 에러 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @returns {Object} WebSocket 및 제어 함수 { ws, send, close }
 */
export function createTranslationStream(languages = ['en-US'], callbacks = {}) {
  const wsUrl = `${getWebSocketProtocol()}//${getWebSocketHost()}/api/ai/voice/realtime`
  const selectedLanguages = Array.isArray(languages) ? languages : [languages]

  const ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    ws.send(JSON.stringify({ selected_languages: selectedLanguages }))

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

        case 'error':
          console.error('❌ [Translation] Error:', message.message || message.error)
          if (callbacks.onError) {
            callbacks.onError(message.message || message.error)
          }
          break

        case 'end':
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

  ws.onclose = () => {
    if (callbacks.onEnd) {
      callbacks.onEnd()
    }
  }

  ws.onerror = (error) => {
    if (callbacks.onError) {
      callbacks.onError(error.message || 'WebSocket error')
    }
  }

  return {
    ws,
    send(audioChunk) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(audioChunk)
      }
    },
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'end' }))
        setTimeout(() => ws.close(), 100)
      } else {
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
