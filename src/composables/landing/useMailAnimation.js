/**
 * MailMockUI 애니메이션 로직
 *
 * @description 메일/Slack 작성 시연 애니메이션 관리
 */
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  fullAIResponse,
  fullSubject,
  fullBody,
  fullSlackMessage,
  defaultMailTo,
  defaultUserMessage,
  defaultHeaderTitle
} from '@/components/landing/data/mailMockData'

export function useMailAnimation(props, refs) {
  // ============================================
  // State
  // ============================================
  const headerTitle = ref(defaultHeaderTitle)
  const activeTab = ref(0)

  // Chat state
  const showWelcome = ref(false)
  const showUserMessage = ref(false)
  const showTypingIndicator = ref(false)
  const showAIResponse = ref(false)
  const isTypingAI = ref(false)
  const displayedAIResponse = ref('')
  const userMessage = ref(defaultUserMessage)
  const inputText = ref('')

  // Mail state
  const mailTo = ref(defaultMailTo)
  const displayedSubject = ref('')
  const displayedBody = ref('')
  const isTypingSubject = ref(false)
  const isTypingBody = ref(false)
  const canSend = ref(false)
  const isSending = ref(false)
  const isSent = ref(false)

  // Slack state
  const showSlackMessage = ref(false)
  const displayedSlackMessage = ref('')
  const canSendSlack = ref(false)
  const isSendingSlack = ref(false)
  const isSentSlack = ref(false)

  // Tips
  const showTips = ref(false)

  let timeouts = []

  // ============================================
  // Helper Functions
  // ============================================
  const clearTimeouts = () => {
    timeouts.forEach(t => clearTimeout(t))
    timeouts = []
  }

  const resetState = () => {
    showWelcome.value = false
    showUserMessage.value = false
    showTypingIndicator.value = false
    showAIResponse.value = false
    isTypingAI.value = false
    displayedAIResponse.value = ''
    inputText.value = ''
    displayedSubject.value = ''
    displayedBody.value = ''
    isTypingSubject.value = false
    isTypingBody.value = false
    canSend.value = false
    isSending.value = false
    isSent.value = false
    showSlackMessage.value = false
    displayedSlackMessage.value = ''
    canSendSlack.value = false
    isSendingSlack.value = false
    isSentSlack.value = false
    showTips.value = false
    activeTab.value = 0
  }

  const scrollMailBodyToBottom = () => {
    nextTick(() => {
      if (refs.mailBodyRef?.value) {
        refs.mailBodyRef.value.scrollTop = refs.mailBodyRef.value.scrollHeight
      }
    })
  }

  const scrollChatToBottom = () => {
    nextTick(() => {
      if (refs.chatMessagesRef?.value) {
        refs.chatMessagesRef.value.scrollTop = refs.chatMessagesRef.value.scrollHeight
      }
    })
  }

  const typeText = (text, setter, typingSetter, speed = 25, scrollFn = null) => {
    return new Promise((resolve) => {
      let index = 0
      typingSetter.value = true
      const type = () => {
        if (index < text.length) {
          setter.value = text.slice(0, index + 1)
          index++
          if (scrollFn) scrollFn()
          timeouts.push(setTimeout(type, speed))
        } else {
          typingSetter.value = false
          resolve()
        }
      }
      type()
    })
  }

  // ============================================
  // Animation
  // ============================================
  const startAnimation = async () => {
    resetState()

    // 1. Welcome message
    timeouts.push(setTimeout(() => {
      showWelcome.value = true
      scrollChatToBottom()
    }, 300))

    // 2. User typing input
    timeouts.push(setTimeout(() => {
      let i = 0
      const typeInput = () => {
        if (i < userMessage.value.length) {
          inputText.value = userMessage.value.slice(0, i + 1)
          i++
          timeouts.push(setTimeout(typeInput, 40))
        } else {
          timeouts.push(setTimeout(() => {
            inputText.value = ''
            showUserMessage.value = true
            scrollChatToBottom()
          }, 300))
        }
      }
      typeInput()
    }, 1500))

    // 3. AI typing indicator
    timeouts.push(setTimeout(() => {
      showTypingIndicator.value = true
      scrollChatToBottom()
    }, 4000))

    // 4. AI response with typing effect
    timeouts.push(setTimeout(() => {
      showTypingIndicator.value = false
      showAIResponse.value = true
      scrollChatToBottom()
      typeText(fullAIResponse, displayedAIResponse, isTypingAI, 20, scrollChatToBottom)
    }, 5000))

    // 5. Start typing mail subject
    timeouts.push(setTimeout(() => {
      isTypingSubject.value = true
      typeText(fullSubject, displayedSubject, isTypingSubject, 35).then(() => {
        typeText(fullBody, displayedBody, isTypingBody, 15, scrollMailBodyToBottom).then(() => {
          canSend.value = true
          timeouts.push(setTimeout(() => {
            showTips.value = true
            scrollChatToBottom()
          }, 500))
        })
      })
    }, 6500))

    // 7. Click send button
    timeouts.push(setTimeout(() => {
      isSending.value = true
    }, 13000))

    timeouts.push(setTimeout(() => {
      isSending.value = false
      isSent.value = true
    }, 14000))

    // 8. Switch to Slack tab
    timeouts.push(setTimeout(() => {
      activeTab.value = 1
      showSlackMessage.value = true
      displayedSlackMessage.value = fullSlackMessage
      canSendSlack.value = true
    }, 15000))

    // 9. Send Slack message
    timeouts.push(setTimeout(() => {
      isSendingSlack.value = true
    }, 17000))

    timeouts.push(setTimeout(() => {
      isSendingSlack.value = false
      isSentSlack.value = true
    }, 17500))
  }

  const restartAnimation = () => {
    clearTimeouts()
    resetState()
    startAnimation()
  }

  // ============================================
  // Lifecycle
  // ============================================
  watch(() => props.isVisible, (visible) => {
    if (visible) {
      startAnimation()
    } else {
      clearTimeouts()
    }
  })

  onMounted(() => {
    if (props.isVisible) {
      startAnimation()
    }
  })

  onUnmounted(() => {
    clearTimeouts()
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    headerTitle,
    activeTab,
    showWelcome,
    showUserMessage,
    showTypingIndicator,
    showAIResponse,
    isTypingAI,
    displayedAIResponse,
    userMessage,
    inputText,
    mailTo,
    displayedSubject,
    displayedBody,
    isTypingSubject,
    isTypingBody,
    canSend,
    isSending,
    isSent,
    showSlackMessage,
    displayedSlackMessage,
    canSendSlack,
    isSendingSlack,
    isSentSlack,
    showTips,

    // Methods
    resetState,
    restartAnimation
  }
}
