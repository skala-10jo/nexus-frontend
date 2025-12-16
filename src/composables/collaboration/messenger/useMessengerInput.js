/**
 * Messenger Input Composable
 *
 * 메신저 메시지 입력 영역의 상태 및 로직 관리
 * - Textarea 자동 크기 조절
 * - 한글 IME 처리
 * - 모바일 드롭다운 관리
 *
 * @module useMessengerInput
 */
import { ref, watch, nextTick } from 'vue'

/**
 * 메신저 입력 로직
 *
 * @param {Object} options - 옵션
 * @param {Function} options.emit - Vue emit 함수
 * @returns {Object} 입력 상태 및 메서드
 */
export function useMessengerInput({ emit }) {
  // ============================================
  // Refs
  // ============================================

  /** Textarea 엘리먼트 ref */
  const textareaRef = ref(null)

  /** 메시지 컨테이너 ref */
  const messageContainer = ref(null)

  // ============================================
  // State
  // ============================================

  /** Textarea 높이 */
  const textareaHeight = ref(44)

  /** 최소 높이 */
  const minTextareaHeight = 44

  /** 최대 높이 (약 3줄) */
  const maxTextareaHeight = 100

  /** 한글 IME 조합 상태 */
  const isComposing = ref(false)

  /** 모바일 드롭다운 표시 상태 */
  const showMobileDropdown = ref(false)

  // ============================================
  // Methods - Textarea
  // ============================================

  /**
   * Textarea 높이 자동 조절
   */
  function adjustTextareaHeight() {
    if (!textareaRef.value) return

    // 정확한 scrollHeight를 얻기 위해 높이 초기화
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight

    // 최소/최대 높이 제한
    textareaHeight.value = Math.min(Math.max(scrollHeight, minTextareaHeight), maxTextareaHeight)
    textareaRef.value.style.height = textareaHeight.value + 'px'
  }

  /**
   * Textarea 입력 핸들러
   *
   * @param {Event} event - 입력 이벤트
   */
  function handleTextareaInput(event) {
    emit('update:messageText', event.target.value)
    nextTick(() => adjustTextareaHeight())
  }

  /**
   * Ctrl+Enter 전송 핸들러 (한글 IME 중복 문자 버그 방지)
   *
   * @param {KeyboardEvent} event - 키보드 이벤트
   */
  function handleCtrlEnterSend(event) {
    if (isComposing.value || event.isComposing) {
      return
    }
    emit('send')
  }

  /**
   * Textarea 높이 리셋
   */
  function resetTextareaHeight() {
    textareaHeight.value = minTextareaHeight
    if (textareaRef.value) {
      textareaRef.value.style.height = minTextareaHeight + 'px'
    }
  }

  /**
   * 메시지 전송 후 Textarea 리셋을 위한 watcher 설정
   *
   * @param {Function} getMessageText - 메시지 텍스트 getter
   */
  function setupMessageTextWatcher(getMessageText) {
    watch(getMessageText, (newVal) => {
      if (!newVal) {
        resetTextareaHeight()
      }
    })
  }

  // ============================================
  // Methods - Scroll
  // ============================================

  /**
   * 메시지 목록 맨 아래로 스크롤
   */
  async function scrollToBottom() {
    await nextTick()
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  }

  // ============================================
  // Methods - Mobile Dropdown
  // ============================================

  /**
   * 모바일 드롭다운 토글
   */
  function toggleMobileDropdown() {
    showMobileDropdown.value = !showMobileDropdown.value
  }

  /**
   * 모바일 드롭다운 닫기
   */
  function closeMobileDropdown() {
    showMobileDropdown.value = false
  }

  // ============================================
  // Methods - Utilities
  // ============================================

  /**
   * HTML 엔티티 디코딩 (Slack 메시지용)
   *
   * @param {string} text - 디코딩할 텍스트
   * @returns {string} 디코딩된 텍스트
   */
  function decodeHtmlEntities(text) {
    if (!text) return ''
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Refs
    textareaRef,
    messageContainer,

    // State
    textareaHeight,
    minTextareaHeight,
    maxTextareaHeight,
    isComposing,
    showMobileDropdown,

    // Methods - Textarea
    adjustTextareaHeight,
    handleTextareaInput,
    handleCtrlEnterSend,
    resetTextareaHeight,
    setupMessageTextWatcher,

    // Methods - Scroll
    scrollToBottom,

    // Methods - Mobile Dropdown
    toggleMobileDropdown,
    closeMobileDropdown,

    // Methods - Utilities
    decodeHtmlEntities
  }
}
