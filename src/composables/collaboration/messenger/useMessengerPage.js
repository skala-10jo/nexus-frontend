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

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(parseFloat(timestamp) * 1000)
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

  // Setup WebSocket message watch
  const setupMessageWatch = () => {
    if (!wsConnection.value) return

    watch(() => wsConnection.value.messages, (newMessages) => {
      if (newMessages && newMessages.length > 0) {
        const lastMessage = newMessages[newMessages.length - 1]

        // Add to messages if not already present
        const exists = messages.value.some(m =>
          m.text === lastMessage.text &&
          m.timestamp === lastMessage.timestamp
        )

        if (!exists) {
          messages.value.push(lastMessage)
        }
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

  // Send Message
  const sendSlackMessage = async () => {
    if (!messageText.value.trim() || !selectedChannel.value) {
      return
    }

    try {
      if (wsConnection.value && wsConnection.value.connected) {
        wsConnection.value.sendMessage(messageText.value)
      } else {
        // Fallback to REST API
        await slackStore.sendMessage(
          selectedChannel.value.id,
          messageText.value
        )
      }

      messageText.value = ''
    } catch (err) {
      console.error('Failed to send message:', err)
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
