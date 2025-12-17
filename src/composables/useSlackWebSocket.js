import { ref, onUnmounted } from 'vue';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// WebSocket 엔드포인트 (/api/* nginx 설정 활용)
const WS_URL = import.meta.env.PROD
  ? 'https://api.sk-nexus.world/api/ws'
  : 'http://localhost:3000/api/ws';

/**
 * Composable for Slack real-time messaging via STOMP WebSocket
 *
 * Java Backend의 Spring STOMP WebSocket을 통해 실시간 메시지 수신
 * - 연결: /ws (SockJS)
 * - 구독: /topic/slack/{channelId}
 * - 전송: /app/slack/send
 *
 * @param {string} channelId - Slack channel ID to subscribe to
 * @returns {object} Messaging utilities
 */
export function useSlackWebSocket(channelId) {
  const messages = ref([]);
  const connected = ref(false);
  const error = ref(null);

  let stompClient = null;
  let subscription = null;
  let reconnectAttempts = 0;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  /**
   * Connect to STOMP WebSocket
   */
  const connect = () => {
    if (!channelId) {
      console.warn('[WebSocket] No channel ID provided');
      return;
    }

    if (stompClient && stompClient.active) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to:', WS_URL);

    // STOMP 클라이언트 생성
    stompClient = new Client({
      // SockJS를 통한 WebSocket 연결 (브라우저 호환성)
      webSocketFactory: () => new SockJS(WS_URL),

      // 디버그 로그 (개발 환경에서만)
      debug: (str) => {
        if (!import.meta.env.PROD) {
          console.log('[STOMP Debug]', str);
        }
      },

      // 재연결 설정
      reconnectDelay: RECONNECT_DELAY,

      // Heartbeat 설정 (서버와 연결 유지)
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      // 연결 성공 콜백
      onConnect: (frame) => {
        console.log('[WebSocket] Connected:', frame);
        connected.value = true;
        error.value = null;
        reconnectAttempts = 0;

        // 채널 구독
        subscribeToChannel();
      },

      // 연결 에러 콜백
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP error:', frame.headers['message']);
        error.value = frame.headers['message'] || 'WebSocket connection error';
      },

      // WebSocket 에러 콜백
      onWebSocketError: (event) => {
        console.error('[WebSocket] Connection error:', event);
        error.value = 'WebSocket connection failed';
        connected.value = false;
      },

      // 연결 종료 콜백
      onWebSocketClose: (event) => {
        console.log('[WebSocket] Connection closed:', event);
        connected.value = false;

        // 자동 재연결 시도
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`[WebSocket] Reconnecting... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        } else {
          error.value = 'Maximum reconnection attempts reached';
        }
      }
    });

    // JWT 토큰이 있으면 헤더에 추가
    const token = localStorage.getItem('token');
    if (token) {
      stompClient.connectHeaders = {
        Authorization: `Bearer ${token}`
      };
    }

    // 연결 시작
    stompClient.activate();
  };

  /**
   * Subscribe to channel messages
   */
  const subscribeToChannel = () => {
    if (!stompClient || !stompClient.active) {
      console.warn('[WebSocket] Cannot subscribe - not connected');
      return;
    }

    // 기존 구독 해제
    if (subscription) {
      subscription.unsubscribe();
    }

    const destination = `/topic/slack/${channelId}`;
    console.log('[WebSocket] Subscribing to:', destination);

    subscription = stompClient.subscribe(destination, (message) => {
      try {
        const receivedMessage = JSON.parse(message.body);
        console.log('[WebSocket] Received message:', receivedMessage);

        // 중복 메시지 체크 (timestamp 기준)
        const exists = messages.value.some(
          (m) => m.ts === receivedMessage.timestamp || m.timestamp === receivedMessage.timestamp
        );

        if (!exists) {
          // 메시지 형식 통일
          const normalizedMessage = {
            text: receivedMessage.text,
            channelId: receivedMessage.channelId,
            userId: receivedMessage.userId,
            username: receivedMessage.username,
            ts: receivedMessage.timestamp,
            timestamp: receivedMessage.timestamp,
            type: receivedMessage.type || 'text'
          };

          messages.value.push(normalizedMessage);
          console.log('[WebSocket] Message added, total:', messages.value.length);
        }
      } catch (e) {
        console.error('[WebSocket] Failed to parse message:', e);
      }
    });

    console.log('[WebSocket] Subscribed to channel:', channelId);
  };

  /**
   * Send message via STOMP
   *
   * @param {string} text - Message text
   * @param {string} username - Username (optional, for fallback auth)
   */
  const sendMessage = async (text, username = null) => {
    if (!text || text.trim() === '') {
      console.warn('[WebSocket] Empty message, not sending');
      return;
    }

    if (!stompClient || !stompClient.active) {
      console.error('[WebSocket] Cannot send - not connected');
      error.value = 'WebSocket not connected';
      throw new Error('WebSocket not connected');
    }

    try {
      const messageBody = {
        channelId: channelId,
        text: text.trim()
      };

      // username 추가 (WebSocket 인증 fallback용)
      if (username) {
        messageBody.username = username;
      }

      console.log('[WebSocket] Sending message:', messageBody);

      stompClient.publish({
        destination: '/app/slack/send',
        body: JSON.stringify(messageBody)
      });

      console.log('[WebSocket] Message sent successfully');
    } catch (err) {
      console.error('[WebSocket] Failed to send message:', err);
      error.value = err.message;
      throw err;
    }
  };

  /**
   * Disconnect from WebSocket
   */
  const disconnect = () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }

    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }

    connected.value = false;
    console.log('[WebSocket] Disconnected');
  };

  /**
   * Clear messages
   */
  const clearMessages = () => {
    messages.value = [];
  };

  /**
   * Change channel subscription
   *
   * @param {string} newChannelId - New channel ID to subscribe
   */
  const changeChannel = (newChannelId) => {
    if (newChannelId === channelId) {
      return;
    }

    console.log('[WebSocket] Changing channel:', channelId, '->', newChannelId);

    // 기존 구독 해제
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }

    // 메시지 초기화
    clearMessages();

    // 새 채널 구독
    if (stompClient && stompClient.active) {
      const destination = `/topic/slack/${newChannelId}`;
      subscription = stompClient.subscribe(destination, (message) => {
        try {
          const receivedMessage = JSON.parse(message.body);
          const exists = messages.value.some(
            (m) => m.ts === receivedMessage.timestamp || m.timestamp === receivedMessage.timestamp
          );

          if (!exists) {
            const normalizedMessage = {
              text: receivedMessage.text,
              channelId: receivedMessage.channelId,
              userId: receivedMessage.userId,
              username: receivedMessage.username,
              ts: receivedMessage.timestamp,
              timestamp: receivedMessage.timestamp,
              type: receivedMessage.type || 'text'
            };
            messages.value.push(normalizedMessage);
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      });

      console.log('[WebSocket] Subscribed to new channel:', newChannelId);
    }
  };

  // Auto-disconnect on component unmount
  onUnmounted(() => {
    disconnect();
  });

  return {
    messages,
    connected,
    error,
    connect,
    disconnect,
    sendMessage,
    clearMessages,
    changeChannel
  };
}
