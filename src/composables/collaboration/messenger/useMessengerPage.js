/**
 * Messenger Page Composable
 *
 * Slack 메신저 페이지의 비즈니스 로직
 */
import { ref, watch, nextTick, onMounted } from 'vue'
import { useSlackStore } from '@/stores/slack'
import { storeToRefs } from 'pinia'
import { useSlackWebSocket } from '@/composables/useSlackWebSocket'

export function useMessengerPage() {
  const slackStore = useSlackStore()
  const { integration, isConnected, channels, selectedChannel, messages, loading, error } = storeToRefs(slackStore)

  // Local State
  const messageText = ref('')
  const messageContainer = ref(null)
  const currentUser = ref(null)
  const wsConnection = ref(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    nextTick(() => {
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight
      }
    })
  }

  // Watch for new messages
  watch(messages, () => {
    scrollToBottom()
  }, { deep: true })

  // Check if message is from current user
  const isMyMessage = (message) => {
    if (!currentUser.value) return false

    return message.username === currentUser.value.username ||
           message.userId === String(currentUser.value.id) ||
           message.userId === currentUser.value.id
  }

  // Format timestamp (handles both epoch seconds and ISO string formats)
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''

    let date
    // Check if it's an epoch timestamp (numeric string with possible decimal)
    if (/^\d+(\.\d+)?$/.test(timestamp)) {
      date = new Date(parseFloat(timestamp) * 1000)
    } else {
      // Try to parse as ISO string
      date = new Date(timestamp)
    }

    // Validate the date
    if (isNaN(date.getTime())) return ''

    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()

    if (isToday) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
  }

  // Check if channel is DM
  const isDM = (channel) => {
    return channel.isDM === true
  }

  // Initialize page
  const initPage = async () => {
    try {
      // Load current user from localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        currentUser.value = JSON.parse(userStr)
      }

      await slackStore.fetchIntegrationStatus()

      // If connected, load channels
      if (isConnected.value) {
        await slackStore.fetchChannels()
      }
    } catch (err) {
      console.error('Failed to fetch integration status:', err)
    }
  }

  // Slack Actions
  const connectSlack = async () => {
    try {
      const authUrl = await slackStore.getAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to connect Slack:', err)
    }
  }

  const disconnectSlack = async () => {
    if (!integration.value) return

    if (confirm(`정말로 "${integration.value.workspaceName}" 연동을 해제하시겠습니까?`)) {
      try {
        await slackStore.disconnectIntegration()
      } catch (err) {
        console.error('Failed to disconnect integration:', err)
      }
    }
  }

  const refreshChannels = async () => {
    await slackStore.fetchChannels()
  }

  // WebSocket message watcher cleanup function
  let stopMessageWatch = null

  // Helper: Parse timestamp to epoch seconds (handles both epoch and ISO formats)
  const parseTimestampToEpoch = (ts) => {
    if (!ts) return 0
    // If it looks like an epoch timestamp (numeric string with possible decimal)
    if (/^\d+(\.\d+)?$/.test(ts)) {
      return parseFloat(ts)
    }
    // Otherwise, try to parse as ISO string
    const date = new Date(ts)
    return isNaN(date.getTime()) ? 0 : date.getTime() / 1000
  }

  // Setup WebSocket message watch
  const setupMessageWatch = () => {
    if (!wsConnection.value) return

    // Stop previous watcher if exists
    if (stopMessageWatch) {
      stopMessageWatch()
      stopMessageWatch = null
    }

    // Watch the messages ref's VALUE (not the ref itself)
    // Using wsConnection.value.messages directly as it's a ref
    const wsMessages = wsConnection.value.messages

    stopMessageWatch = watch(wsMessages, (newMessages) => {
      if (newMessages && newMessages.length > 0) {
        // Process all new messages that aren't in the store yet
        newMessages.forEach(wsMsg => {
          const wsMsgEpoch = parseTimestampToEpoch(wsMsg.timestamp || wsMsg.ts)

          // Find if message already exists (including optimistic messages)
          const existingIndex = messages.value.findIndex(m => {
            // Check exact timestamp match (only if both have values)
            const timestampMatch = (m.timestamp && wsMsg.timestamp && m.timestamp === wsMsg.timestamp) ||
                                   (m.ts && wsMsg.ts && m.ts === wsMsg.ts)
            if (timestampMatch) return true

            // Check similar timestamp (within 2 seconds) with same text
            const mEpoch = parseTimestampToEpoch(m.timestamp || m.ts)
            if (m.text === wsMsg.text && Math.abs(mEpoch - wsMsgEpoch) < 2) return true

            // Check if this is an optimistic message with same text (within 10 seconds)
            if (m._optimistic && m.text === wsMsg.text && Math.abs(mEpoch - wsMsgEpoch) < 10) return true

            return false
          })

          if (existingIndex === -1) {
            // Message doesn't exist, add it
            messages.value.push(wsMsg)
          } else if (messages.value[existingIndex]._optimistic) {
            // Replace optimistic message with real server message
            messages.value[existingIndex] = wsMsg
          }
          // else: Message already exists (duplicate), skip
        })
      }
    }, { deep: true, immediate: true })
  }

  // Channel Selection
  const selectChannel = (channel) => {
    slackStore.selectChannel(channel)

    // Disconnect previous WebSocket
    if (wsConnection.value) {
      wsConnection.value.disconnect()
    }

    // Connect to new channel's WebSocket
    wsConnection.value = useSlackWebSocket(channel.id)
    wsConnection.value.connect()

    // Setup watch for this connection's messages
    setupMessageWatch()
  }

  // Send Message (with optimistic UI update)
  const sendSlackMessage = async () => {
    if (!messageText.value.trim() || !selectedChannel.value) {
      return
    }

    const textToSend = messageText.value.trim()
    const tempTimestamp = Date.now().toString() // Temporary timestamp for optimistic message

    // Optimistic UI update - show message immediately
    const optimisticMessage = {
      text: textToSend,
      channelId: selectedChannel.value.id,
      userId: currentUser.value?.id?.toString(),
      username: currentUser.value?.username || 'Me',
      timestamp: tempTimestamp,
      type: 'text',
      _optimistic: true // Mark as optimistic for potential rollback
    }

    // Add to messages immediately
    messages.value.push(optimisticMessage)
    messageText.value = '' // Clear input immediately for better UX

    try {
      // Check WebSocket connection - need to access .value of the ref
      const isWsConnected = wsConnection.value && wsConnection.value.connected.value

      if (isWsConnected) {
        console.log('[SendMessage] Using WebSocket')
        wsConnection.value.sendMessage(textToSend)
      } else {
        // Fallback to REST API
        console.log('[SendMessage] Using REST API (WebSocket not connected)')
        await slackStore.sendMessage(
          selectedChannel.value.id,
          textToSend
        )
      }

      // Remove optimistic marker on success (message will be replaced by server response)
      // We keep the optimistic message as the server will broadcast the real one
      // The duplicate detection in setupMessageWatch will handle this

    } catch (err) {
      console.error('Failed to send message:', err)
      // Rollback optimistic update on error
      const index = messages.value.findIndex(m => m.timestamp === tempTimestamp && m._optimistic)
      if (index !== -1) {
        messages.value.splice(index, 1)
      }
      messageText.value = textToSend // Restore the message text
      alert('메시지 전송에 실패했습니다.')
    }
  }

  // Lifecycle
  onMounted(() => {
    initPage()
  })

  return {
    // Store State
    integration,
    isConnected,
    channels,
    selectedChannel,
    messages,
    loading,
    error,

    // Local State
    messageText,
    messageContainer,
    currentUser,

    // Helpers
    isMyMessage,
    formatTimestamp,
    isDM,

    // Actions
    connectSlack,
    disconnectSlack,
    refreshChannels,
    selectChannel,
    sendSlackMessage
  }
}
