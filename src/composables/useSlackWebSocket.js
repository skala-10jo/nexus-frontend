import { ref, onUnmounted } from 'vue';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Composable for Slack WebSocket real-time messaging
 *
 * @param {string} channelId - Slack channel ID to subscribe to
 * @returns {object} WebSocket utilities
 */
export function useSlackWebSocket(channelId) {
  const messages = ref([]);
  const connected = ref(false);
  const error = ref(null);

  let stompClient = null;
  let subscription = null;

  /**
   * Connect to WebSocket and subscribe to channel
   */
  const connect = () => {
    if (!channelId) {
      console.warn('[WebSocket] No channel ID provided');
      return;
    }

    try {
      // Use relative path (proxied by Vite to backend)
      const wsUrl = window.location.origin + '/ws';

      console.log('[WebSocket] Connecting to:', wsUrl);

      // Get JWT token from localStorage
      const token = localStorage.getItem('token');

      // Create STOMP client with SockJS
      stompClient = new Client({
        webSocketFactory: () => new SockJS(wsUrl),

        connectHeaders: {
          Authorization: `Bearer ${token}`
        },

        debug: (str) => {
          console.log('[WebSocket Debug]', str);
        },

        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,

        onConnect: () => {
          console.log('[WebSocket] Connected to channel:', channelId);
          connected.value = true;
          error.value = null;

          // Subscribe to channel topic
          const topic = `/topic/slack/${channelId}`;
          console.log('[WebSocket] Subscribing to topic:', topic);

          subscription = stompClient.subscribe(
            topic,
            (message) => {
              try {
                console.log('[WebSocket] Raw message received:', message);
                const parsedMessage = JSON.parse(message.body);
                console.log('[WebSocket] Parsed message:', parsedMessage);

                // Add message to list
                messages.value.push(parsedMessage);
                console.log('[WebSocket] Messages array length:', messages.value.length);
              } catch (err) {
                console.error('[WebSocket] Failed to parse message:', err);
              }
            }
          );

          console.log('[WebSocket] Subscription created:', subscription);
        },

        onStompError: (frame) => {
          console.error('[WebSocket] STOMP error:', frame);
          error.value = frame.headers['message'];
          connected.value = false;
        },

        onWebSocketError: (evt) => {
          console.error('[WebSocket] WebSocket error:', evt);
          error.value = 'WebSocket connection failed';
          connected.value = false;
        },

        onDisconnect: () => {
          console.log('[WebSocket] Disconnected');
          connected.value = false;
        }
      });

      // Activate the client
      stompClient.activate();

    } catch (err) {
      console.error('[WebSocket] Connection error:', err);
      error.value = err.message;
      connected.value = false;
    }
  };

  /**
   * Send text message via WebSocket
   *
   * @param {string} text - Message text
   */
  const sendMessage = (text) => {
    if (!stompClient || !connected.value) {
      console.warn('[WebSocket] Not connected, cannot send message');
      return;
    }

    if (!text || text.trim() === '') {
      console.warn('[WebSocket] Empty message, not sending');
      return;
    }

    try {
      // Get username from localStorage (stored during login)
      const userStr = localStorage.getItem('user');
      let username = null;
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          username = user.username;
        } catch (e) {
          console.error('[WebSocket] Failed to parse user from localStorage');
        }
      }

      stompClient.publish({
        destination: '/app/slack/send',
        body: JSON.stringify({
          channelId: channelId,
          text: text.trim(),
          username: username  // Include username for authentication fallback
        })
      });

      console.log('[WebSocket] Message sent:', text);
    } catch (err) {
      console.error('[WebSocket] Failed to send message:', err);
      error.value = err.message;
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
    console.log('[WebSocket] Disconnected manually');
  };

  /**
   * Clear messages
   */
  const clearMessages = () => {
    messages.value = [];
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
    clearMessages
  };
}
