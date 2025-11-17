/**
 * WebSocket 실시간 번역 Composable
 *
 * 기능:
 * - WebSocket 연결 관리
 * - 재연결 로직 (지수 백오프)
 * - 오디오 청크 전송
 * - 번역 결과 수신
 * - 에러 처리
 */
import { ref, onBeforeUnmount } from 'vue'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useWebSocketTranslation({ onTranslationResult, onConnected, onDisconnected }) {
  // 상태
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const lastError = ref(null)
  const sessionId = ref(null)

  // 내부 변수
  let ws = null
  let reconnectAttempts = 0
  const maxReconnectAttempts = 5
  let reconnectTimeout = null
  let pingInterval = null

  /**
   * WebSocket 연결
   */
  const connect = () => {
    return new Promise((resolve, reject) => {
      if (isConnected.value || isConnecting.value) {
        resolve()
        return
      }

      try {
        isConnecting.value = true
        lastError.value = null

        const wsUrl = `${WS_URL}/api/ai/voice/realtime`
        ws = new WebSocket(wsUrl)

        // 연결 성공
        ws.onopen = () => {
          isConnected.value = true
          isConnecting.value = false
          reconnectAttempts = 0

          // Ping-Pong 시작 (30초마다)
          startPingInterval()

          resolve()
        }

        // 메시지 수신
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            handleMessage(data)
          } catch (err) {
            console.error('메시지 파싱 실패:', err, event.data)
          }
        }

        // 에러 발생
        ws.onerror = (event) => {
          console.error('❌ WebSocket 에러:', event)
          lastError.value = 'WebSocket 연결 오류가 발생했습니다'
          isConnecting.value = false
          reject(new Error('WebSocket 연결 실패'))
        }

        // 연결 종료
        ws.onclose = (event) => {
          isConnected.value = false
          isConnecting.value = false
          sessionId.value = null

          stopPingInterval()

          // 콜백 호출
          if (onDisconnected) {
            onDisconnected()
          }

          // 비정상 종료 시 재연결 시도
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            scheduleReconnect()
          }
        }

      } catch (err) {
        console.error('WebSocket 생성 실패:', err)
        lastError.value = `연결 실패: ${err.message}`
        isConnecting.value = false
        reject(err)
      }
    })
  }

  /**
   * WebSocket 연결 종료
   */
  const disconnect = () => {
    stopPingInterval()

    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }

    if (ws) {
      ws.close(1000, '사용자가 연결을 종료했습니다')
      ws = null
    }

    isConnected.value = false
    isConnecting.value = false
    sessionId.value = null
  }

  /**
   * 세션 초기화
   */
  const sendInit = ({ inputLanguage, outputLanguages }) => {
    if (!isConnected.value || !ws) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    ws.send(JSON.stringify({
      type: 'init',
      inputLanguage,
      outputLanguages
    }))
  }

  /**
   * 오디오 청크 전송
   */
  const sendAudioChunk = async ({ audioBlob, audioEnergy, audioFormat }) => {
    if (!isConnected.value || !ws) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    // Blob 유효성 검증
    if (!audioBlob || audioBlob.size === 0) {
      return
    }

    // Blob을 base64로 변환
    const base64Audio = await blobToBase64(audioBlob)

    ws.send(JSON.stringify({
      type: 'audio_chunk',
      audioData: base64Audio,
      audioEnergy: audioEnergy || 0.5,
      audioFormat: audioFormat || { mimeType: 'audio/webm;codecs=opus', extension: 'webm' },
      timestamp: Date.now()
    }))
  }

  /**
   * 세션 통계 요청
   */
  const requestStats = () => {
    if (!isConnected.value || !ws) {
      throw new Error('WebSocket이 연결되지 않았습니다')
    }

    ws.send(JSON.stringify({
      type: 'get_stats'
    }))
  }

  /**
   * 메시지 처리
   */
  const handleMessage = (data) => {
    const { type } = data

    switch (type) {
      case 'connected':
        // 연결 확인
        sessionId.value = data.sessionId

        if (onConnected) {
          onConnected(data)
        }
        break

      case 'init_success':
        // 초기화 성공
        break

      case 'translation_result':
        // 번역 결과
        if (onTranslationResult) {
          onTranslationResult(data)
        }
        break

      case 'pong':
        // Ping-Pong 응답
        break

      case 'stats':
        // 통계 정보
        break

      case 'error':
        // 에러 메시지
        console.error('❌ 서버 에러:', data.message)
        lastError.value = data.message
        break

      default:
        break
    }
  }

  /**
   * 재연결 스케줄링 (지수 백오프)
   */
  const scheduleReconnect = () => {
    reconnectAttempts++

    // 지수 백오프: 2^n 초 (최대 30초)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)

    reconnectTimeout = setTimeout(() => {
      connect().catch(err => {
        console.error('재연결 실패:', err)
      })
    }, delay)
  }

  /**
   * Ping 전송 (연결 유지)
   */
  const startPingInterval = () => {
    stopPingInterval()

    pingInterval = setInterval(() => {
      if (isConnected.value && ws) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)  // 30초마다
  }

  /**
   * Ping 인터벌 중지
   */
  const stopPingInterval = () => {
    if (pingInterval) {
      clearInterval(pingInterval)
      pingInterval = null
    }
  }

  /**
   * Blob을 base64로 변환
   */
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        // "data:audio/webm;base64," 부분 제거
        const base64 = reader.result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  // 컴포넌트 언마운트 시 정리
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    isConnected,
    isConnecting,
    lastError,
    sessionId,
    connect,
    disconnect,
    sendInit,
    sendAudioChunk,
    requestStats
  }
}
