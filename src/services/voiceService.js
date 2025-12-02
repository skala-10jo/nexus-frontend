/**
 * Voice Translation 서비스
 *
 * 실시간 음성 번역 전용 서비스 (Voice Translation 페이지 전용)
 * WebSocket 기반 다국어 STT + 자동 번역
 */

export const voiceService = {
  /**
   * WebSocket 다국어 STT 스트리밍 연결 생성 (자동 언어 감지 + 번역)
   *
   * @param {string[]} selectedLanguages - 선택된 언어 목록 (BCP-47 코드, 예: ["ko-KR", "en-US", "ja-JP"])
   * @param {Object} callbacks - 이벤트 콜백 함수
   * @param {Function} callbacks.onConnected - WebSocket 연결 완료 콜백
   * @param {Function} callbacks.onRecognizing - 중간 인식 결과 콜백 (번역 없음)
   * @param {Function} callbacks.onRecognized - 최종 인식 결과 + 번역 콜백
   * @param {Function} callbacks.onError - 에러 콜백
   * @param {Function} callbacks.onEnd - 종료 콜백
   * @returns {Object} WebSocket 및 제어 함수 { ws, send, close }
   */
  createMultiLangSTTStream(selectedLanguages = ['ko-KR', 'en-US'], callbacks = {}) {
    // WebSocket URL 생성 (realtime 엔드포인트 사용)
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsHost = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).host
      : 'localhost:8000'
    const wsUrl = `${wsProtocol}//${wsHost}/api/ai/voice/realtime`

    // WebSocket 연결
    const ws = new WebSocket(wsUrl)

    // 연결 성공 시 초기 설정 전송 (다국어 모드)
    ws.onopen = () => {
      ws.send(JSON.stringify({ selected_languages: selectedLanguages }))

      // 연결 완료 콜백 호출
      if (callbacks.onConnected) {
        callbacks.onConnected()
      }
    }

    // 메시지 수신
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)

        switch (message.type) {
          case 'recognizing':
            // 중간 인식 결과 (번역 없음)
            if (callbacks.onRecognizing) {
              callbacks.onRecognizing(message)
            }
            break

          case 'recognized':
            // 최종 인식 결과 + 번역
            if (callbacks.onRecognized) {
              callbacks.onRecognized(message)
            }
            break

          case 'error':
            // 에러
            if (callbacks.onError) {
              callbacks.onError(message.message || message.error)
            }
            break

          case 'end':
            // 종료
            if (callbacks.onEnd) {
              callbacks.onEnd()
            }
            break

          default:
            break
        }
      } catch (error) {
        if (callbacks.onError) {
          callbacks.onError(error.message)
        }
      }
    }

    // 연결 종료
    ws.onclose = () => {
      if (callbacks.onEnd) {
        callbacks.onEnd()
      }
    }

    // 에러
    ws.onerror = (error) => {
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
}

// Named export (하위 호환성)
export const createMultiLangSTTStream = voiceService.createMultiLangSTTStream.bind(voiceService)

export default voiceService
