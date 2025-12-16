/**
 * BizGuide Chat Composable
 *
 * BizGuide 채팅 UI 로직 관리
 * - 메시지 입력 및 전송
 * - 스크롤 관리
 * - Quick Actions 처리
 *
 * @module useBizGuideChat
 */
import { ref, nextTick, watch } from 'vue'

/**
 * BizGuide 채팅 로직
 *
 * @param {Object} options - 옵션
 * @param {Function} options.sendChat - 메시지 전송 함수 (from useSlackAgent)
 * @param {Ref<boolean>} options.isChatLoading - 로딩 상태 (from useSlackAgent)
 * @param {Ref<Array>} options.chatMessages - 채팅 메시지 목록 (from useSlackAgent)
 * @param {Function} options.emit - Vue emit 함수
 * @returns {Object} 채팅 상태 및 메서드
 */
export function useBizGuideChat({ sendChat, isChatLoading, chatMessages, emit }) {
  // ============================================
  // Refs
  // ============================================

  /** 메시지 입력 값 */
  const messageInput = ref('')

  /** 채팅 컨테이너 ref */
  const chatContainer = ref(null)

  // ============================================
  // Quick Actions
  // ============================================

  /** 빠른 액션 버튼 목록 */
  const quickActions = [
    { label: '영어로 번역', icon: '🌐', message: '영어로 번역해줘' },
    { label: '더 격식있게', icon: '👔', message: '더 격식있게 수정해줘' },
    { label: '더 간결하게', icon: '✂️', message: '더 간결하게 수정해줘' }
  ]

  // ============================================
  // Methods - Scroll
  // ============================================

  /**
   * 채팅 목록 맨 아래로 스크롤
   */
  function scrollToBottom() {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight
    }
  }

  /**
   * 새 메시지 도착 시 자동 스크롤 watcher 설정
   */
  function setupAutoScroll() {
    watch(() => chatMessages.value.length, async () => {
      await nextTick()
      scrollToBottom()
    })
  }

  /**
   * 패널 열림 시 스크롤 watcher 설정
   *
   * @param {Function} getShow - show prop getter
   */
  function setupPanelOpenScroll(getShow) {
    watch(getShow, async (show) => {
      if (show) {
        await nextTick()
        scrollToBottom()
      }
    })
  }

  // ============================================
  // Methods - Message Handling
  // ============================================

  /**
   * 메시지 전송 핸들러
   */
  async function handleSendMessage() {
    if (!messageInput.value.trim() || isChatLoading.value) return

    const message = messageInput.value
    messageInput.value = ''

    try {
      await sendChat(message)
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  /**
   * 키보드 이벤트 핸들러 (Ctrl+Enter 전송)
   *
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  function handleKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      handleSendMessage()
    }
  }

  /**
   * Quick Action 클릭 핸들러
   *
   * @param {Object} action - 액션 객체
   */
  function handleQuickAction(action) {
    messageInput.value = action.message
    handleSendMessage()
  }

  /**
   * 초안 사용하기 핸들러
   *
   * @param {string} draft - 초안 텍스트
   */
  function handleUseDraft(draft) {
    emit('use-draft', draft)
  }

  // ============================================
  // Methods - Utilities
  // ============================================

  /**
   * 액션 타입에 따른 라벨 반환
   *
   * @param {string} actionType - 액션 타입
   * @returns {string} 라벨
   */
  function getActionLabel(actionType) {
    switch (actionType) {
      case 'draft': return '초안'
      case 'translate': return '번역 결과'
      case 'refine': return '수정된 초안'
      default: return '결과'
    }
  }

  /**
   * 예시 메시지 설정
   *
   * @param {string} message - 메시지 내용
   */
  function setExampleMessage(message) {
    messageInput.value = message
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Refs
    messageInput,
    chatContainer,

    // Quick Actions
    quickActions,

    // Methods - Scroll
    scrollToBottom,
    setupAutoScroll,
    setupPanelOpenScroll,

    // Methods - Message Handling
    handleSendMessage,
    handleKeyDown,
    handleQuickAction,
    handleUseDraft,

    // Methods - Utilities
    getActionLabel,
    setExampleMessage
  }
}
