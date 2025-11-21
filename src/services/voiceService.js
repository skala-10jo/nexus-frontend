/**
 * Voice API 서비스
 *
 * 백엔드 Voice API (STT, Translation, TTS)를 호출하는 서비스
 * WebSocket STT 스트리밍 및 REST API 지원
 *
 * 주요 기능:
 * - WebSocket 기반 실시간 STT 스트리밍
 * - REST API 기반 번역
 * - REST API 기반 TTS (음성 합성)
 */
import api from './api'

const BASE_URL = '/ai/voice'

/**
 * STT: 음성 파일을 텍스트로 변환 (POST 업로드)
 *
 * @param {File} audioFile - 음성 파일 (WAV/MP3/OGG)
 * @param {string} language - BCP-47 언어 코드 (예: ko-KR, en-US, ja-JP)
 * @param {boolean} enableDiarization - 화자 분리 활성화 여부
 * @returns {Promise<Object>} STT 결과 { text, speaker_id, confidence, language }
 */
export async function speechToText(audioFile, language = 'ko-KR', enableDiarization = true) {
  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('language', language)
  formData.append('enable_diarization', enableDiarization)

  const response = await api.post(`${BASE_URL}/stt`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.data
}

/**
 * WebSocket STT 스트리밍 연결 생성
 *
 * @param {string} language - BCP-47 언어 코드
 * @param {boolean} enableDiarization - 화자 분리 활성화
 * @param {Object} callbacks - 이벤트 콜백 함수
 * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백
 * @param {Function} callbacks.onRecognized - 최종 인식 결과 콜백
 * @param {Function} callbacks.onError - 에러 콜백
 * @param {Function} callbacks.onEnd - 종료 콜백
 * @returns {Object} WebSocket 및 제어 함수 { ws, send, close }
 */
export function createSTTStream(language = 'ko-KR', enableDiarization = true, callbacks = {}) {
  // WebSocket URL 생성
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const wsHost = import.meta.env.VITE_API_URL
    ? new URL(import.meta.env.VITE_API_URL).host
    : 'localhost:8000'
  const wsUrl = `${wsProtocol}//${wsHost}${BASE_URL}/stt/stream`

  // WebSocket 연결
  const ws = new WebSocket(wsUrl)

  // 연결 성공 시 초기 설정 전송
  ws.onopen = () => {
    console.log('✅ WebSocket STT connected')
    ws.send(JSON.stringify({
      language,
      enable_diarization: enableDiarization
    }))
  }

  // 메시지 수신
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data)

      switch (message.type) {
        case 'recognizing':
          // 중간 인식 결과
          if (callbacks.onRecognizing) {
            callbacks.onRecognizing(message)
          }
          break

        case 'recognized':
          // 최종 인식 결과
          if (callbacks.onRecognized) {
            callbacks.onRecognized(message)
          }
          break

        case 'error':
          // 에러
          console.error('❌ STT error:', message.error)
          if (callbacks.onError) {
            callbacks.onError(message.error)
          }
          break

        case 'end':
          // 종료
          console.log('🔚 STT stream ended')
          if (callbacks.onEnd) {
            callbacks.onEnd()
          }
          break

        default:
          console.warn('Unknown message type:', message.type)
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
      if (callbacks.onError) {
        callbacks.onError(error.message)
      }
    }
  }

  // 연결 종료
  ws.onclose = () => {
    console.log('🔌 WebSocket STT disconnected')
    if (callbacks.onEnd) {
      callbacks.onEnd()
    }
  }

  // 에러
  ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error)
    if (callbacks.onError) {
      callbacks.onError(error.message || 'WebSocket error')
    }
  }

  // 제어 함수 반환
  return {
    ws,

    /**
     * 오디오 청크 전송
     * @param {Blob|ArrayBuffer} audioChunk - 오디오 데이터
     */
    send(audioChunk) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(audioChunk)
      } else {
        console.warn('WebSocket is not open. Ready state:', ws.readyState)
      }
    },

    /**
     * WebSocket 연결 종료
     */
    close() {
      if (ws.readyState === WebSocket.OPEN) {
        // 종료 메시지 전송
        ws.send(JSON.stringify({ type: 'end' }))
        // WebSocket 닫기
        setTimeout(() => ws.close(), 100)
      } else {
        ws.close()
      }
    }
  }
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
  const response = await api.post(`${BASE_URL}/translate`, {
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
  const response = await api.post(`${BASE_URL}/translate/batch`, {
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
  const response = await api.get(`${BASE_URL}/translate/languages`)
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
  const response = await api.post(
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
  const response = await api.get(`${BASE_URL}/tts/voices`)
  return response.data.data
}
