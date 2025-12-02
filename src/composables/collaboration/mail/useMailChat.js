import { ref } from 'vue'
import { mailService } from '@/services/collaboration/mailService'

/**
 * AI 메일 채팅 Composable
 */
export function useMailChat(openEmailCallback) {
  // ============================================
  // State
  // ============================================
  const showChatPanel = ref(false)
  const chatMessages = ref([])
  const chatInput = ref('')
  const chatLoading = ref(false)

  // ============================================
  // Helpers
  // ============================================

  /**
   * 사용자 ID 가져오기
   */
  const getUserId = () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr).id : null
  }

  // ============================================
  // Actions
  // ============================================

  /**
   * 채팅 패널 열기
   */
  const openChatPanel = () => {
    showChatPanel.value = true
  }

  /**
   * 채팅 패널 닫기
   */
  const closeChatPanel = () => {
    showChatPanel.value = false
  }

  /**
   * 채팅 메시지 전송
   */
  const sendChatMessage = async () => {
    if (!chatInput.value.trim()) return

    const userMessage = chatInput.value.trim()
    chatInput.value = ''

    // 사용자 메시지 추가
    chatMessages.value.push({
      role: 'user',
      content: userMessage
    })

    chatLoading.value = true

    try {
      const userId = getUserId()

      if (!userId) {
        throw new Error('User info not found. Please log in again.')
      }

      // 대화 기록 준비
      const conversationHistory = chatMessages.value
        .filter(msg => msg.role !== 'system')
        .map(msg => ({ role: msg.role, content: msg.content }))

      const data = await mailService.chat(userMessage, userId, conversationHistory)

      // AI 응답 추가
      chatMessages.value.push({
        role: 'assistant',
        content: data.answer,
        queryType: data.query_type,
        searchResults: data.search_results,
        emailDraft: data.email_draft,
        subject: data.subject,
        translatedEmail: data.translated_email,
        ragSections: data.rag_sections
      })
    } catch (error) {
      console.error('Chat API failed:', error)
      chatMessages.value.push({
        role: 'assistant',
        content: 'Sorry, an error occurred. Please try again.'
      })
    } finally {
      chatLoading.value = false
    }
  }

  /**
   * 검색 결과에서 메일 열기
   */
  const openEmailFromChat = async (emailId) => {
    if (openEmailCallback) {
      await openEmailCallback(emailId)
    }
  }

  /**
   * 채팅 기록 초기화
   */
  const clearChatHistory = () => {
    chatMessages.value = []
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    showChatPanel,
    chatMessages,
    chatInput,
    chatLoading,

    // Actions
    openChatPanel,
    closeChatPanel,
    sendChatMessage,
    openEmailFromChat,
    clearChatHistory
  }
}
