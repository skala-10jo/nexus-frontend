import { ref, onUnmounted } from 'vue';
import { slackAPI } from '@/services/slackService';

/**
 * Composable for Slack messaging with REST API Polling
 * (WebSocket 대신 Polling 방식 사용 - Proxy 서버 WebSocket 미지원으로 인한 대안)
 *
 * @param {string} channelId - Slack channel ID to subscribe to
 * @returns {object} Messaging utilities
 */
export function useSlackWebSocket(channelId) {
  const messages = ref([]);
  const connected = ref(false);
  const error = ref(null);

  let pollingInterval = null;
  let lastMessageTs = null;

  /**
   * Connect (start polling for messages)
   */
  const connect = () => {
    if (!channelId) {
      console.warn('[Polling] No channel ID provided');
      return;
    }

    console.log('[Polling] Starting message polling for channel:', channelId);
    connected.value = true;
    error.value = null;

    // Initial fetch
    fetchMessages();

    // Poll every 3 seconds
    pollingInterval = setInterval(() => {
      fetchMessages();
    }, 3000);
  };

  /**
   * Fetch messages from REST API
   */
  const fetchMessages = async () => {
    try {
      const response = await slackAPI.getMessageHistory(channelId);

      if (response.data && response.data.data) {
        const fetchedMessages = response.data.data.messages || [];

        // Find new messages (after lastMessageTs)
        if (lastMessageTs) {
          const newMessages = fetchedMessages.filter(msg => msg.ts > lastMessageTs);
          if (newMessages.length > 0) {
            console.log('[Polling] New messages:', newMessages.length);
            // Add new messages to the list
            newMessages.forEach(msg => {
              // Check if message already exists (by ts)
              const exists = messages.value.some(m => m.ts === msg.ts);
              if (!exists) {
                messages.value.push(msg);
              }
            });
          }
        } else {
          // First fetch - set all messages
          messages.value = fetchedMessages;
        }

        // Update lastMessageTs
        if (fetchedMessages.length > 0) {
          lastMessageTs = fetchedMessages[fetchedMessages.length - 1].ts;
        }
      }
    } catch (err) {
      console.error('[Polling] Failed to fetch messages:', err);
      // Don't set error for polling failures, just log
    }
  };

  /**
   * Send text message via REST API
   *
   * @param {string} text - Message text
   */
  const sendMessage = async (text) => {
    if (!text || text.trim() === '') {
      console.warn('[Polling] Empty message, not sending');
      return;
    }

    try {
      console.log('[Polling] Sending message via REST API');

      await slackAPI.sendMessage({
        channelId: channelId,
        text: text.trim()
      });

      console.log('[Polling] Message sent successfully');

      // Immediately fetch to see the sent message
      await fetchMessages();
    } catch (err) {
      console.error('[Polling] Failed to send message:', err);
      error.value = err.message;
      throw err;
    }
  };

  /**
   * Disconnect (stop polling)
   */
  const disconnect = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }

    connected.value = false;
    lastMessageTs = null;
    console.log('[Polling] Stopped polling');
  };

  /**
   * Clear messages
   */
  const clearMessages = () => {
    messages.value = [];
    lastMessageTs = null;
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
