/**
 * Slack Agent Composable
 *
 * Slack 메시지 번역 및 BizGuide 기반 초안 작성 기능
 * 세션 기반 챗봇 대화 지원
 *
 * NOTE: 이 composable은 싱글톤 패턴을 사용합니다.
 * 모든 컴포넌트에서 같은 상태를 공유합니다.
 */
import { ref, computed, watch } from 'vue'
import { translateMessage, createDraft, sendChatMessage, deleteSession } from '@/services/slackAgentService'
import { userAPI } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

// Language options
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
]

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Decode HTML entities from Slack messages
 * Slack API returns messages with HTML entities encoded
 */
const decodeHtmlEntities = (text) => {
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
// SINGLETON STATE (shared across all instances)
// ============================================

// Translation State (싱글톤)
const isTranslating = ref(false)
const translationError = ref(null)
const translatedMessages = ref({}) // Map: messageId -> translated text

// Draft State (싱글톤)
const isDrafting = ref(false)
const draftError = ref(null)
const currentDraft = ref(null)
const draftSuggestions = ref([])

// Chat State (싱글톤) - 세션 기반 대화
const chatSessionId = ref(null)
const chatMessages = ref([]) // [{role: 'user'|'assistant', content: string, draft?: string, actionType?: string}]
const isChatLoading = ref(false)
const chatError = ref(null)

// Temporary Language (세션 동안만 유지, 싱글톤)
const temporaryLanguage = ref(null)

// ============================================
// COMPOSABLE FUNCTION
// ============================================

export function useSlackAgent() {
  const authStore = useAuthStore()

  // preferredLanguage는 authStore.user에서 직접 computed로 가져옴 (반응형)
  const preferredLanguage = computed(() => authStore.user?.preferredLanguage || 'ko')

  // 실제 사용할 언어 (임시 언어가 있으면 임시, 없으면 기본)
  const activeLanguage = computed(() => temporaryLanguage.value || preferredLanguage.value)

  // Get language label by code
  const getLanguageLabel = (code) => {
    const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
    return lang ? `${lang.flag} ${lang.label}` : code
  }

  /**
   * Set temporary language for current session only (not saved to DB)
   * @param {string} languageCode - Language code to set temporarily
   */
  const setTemporaryLanguage = (languageCode) => {
    temporaryLanguage.value = languageCode
    // Clear cached translations when language changes
    translatedMessages.value = {}
  }

  /**
   * Reset to default language (clear temporary)
   */
  const resetToDefaultLanguage = () => {
    temporaryLanguage.value = null
    translatedMessages.value = {}
  }

  /**
   * Translate a message to user's active language (temporary or preferred)
   * @param {object} message - Message object with text and id
   * @returns {Promise<string>} - Translated text
   */
  const translateMessageToPreferred = async (message) => {
    const messageId = message.timestamp || message.ts || message.id

    // Check if already translated
    if (translatedMessages.value[messageId]) {
      return translatedMessages.value[messageId]
    }

    isTranslating.value = true
    translationError.value = null

    try {
      // Decode HTML entities before sending to translation API
      // Slack encodes <, >, & as &lt;, &gt;, &amp;
      const decodedText = decodeHtmlEntities(message.text)

      const result = await translateMessage(
        decodedText,
        activeLanguage.value,  // Use activeLanguage (temporary or preferred)
        'auto'
      )

      // Cache the translation
      translatedMessages.value[messageId] = result.translated_text

      return result.translated_text
    } catch (error) {
      console.error('Translation failed:', error)
      translationError.value = error.response?.data?.detail || '번역에 실패했습니다'
      throw error
    } finally {
      isTranslating.value = false
    }
  }

  /**
   * Get translated text for a message (if available)
   * @param {string} messageId - Message ID
   * @returns {string|null} - Translated text or null
   */
  const getTranslation = (messageId) => {
    return translatedMessages.value[messageId] || null
  }

  /**
   * Clear translation for a message
   * @param {string} messageId - Message ID
   */
  const clearTranslation = (messageId) => {
    delete translatedMessages.value[messageId]
  }

  /**
   * Update user's preferred (default) language - saves to DB
   * Used in Profile settings page for permanent change
   * @param {string} languageCode - New language code
   */
  const updatePreferredLanguage = async (languageCode) => {
    try {
      const user = authStore.user
      if (!user) return

      // Update on server (permanent)
      await userAPI.updatePreferredLanguage(user.id, languageCode)

      // Update authStore (automatically syncs to localStorage)
      authStore.setUser({ ...user, preferredLanguage: languageCode })

      // Clear temporary language (now using new default)
      temporaryLanguage.value = null

      // Clear all cached translations (they're now in wrong language)
      translatedMessages.value = {}

    } catch (error) {
      console.error('Failed to update preferred language:', error)
      throw error
    }
  }

  /**
   * Create a business message draft using BizGuide RAG
   * @param {string} intent - User's intent/what they want to say
   * @param {string[]} keywords - Optional keywords for RAG search
   * @returns {Promise<{draft, suggestions}>}
   */
  const createBizDraft = async (intent, keywords = null) => {
    isDrafting.value = true
    draftError.value = null
    currentDraft.value = null
    draftSuggestions.value = []

    try {
      const result = await createDraft(intent, preferredLanguage.value, keywords)

      currentDraft.value = result.draft
      draftSuggestions.value = result.suggestions || []

      return result
    } catch (error) {
      console.error('Draft creation failed:', error)
      draftError.value = error.response?.data?.detail || '초안 작성에 실패했습니다'
      throw error
    } finally {
      isDrafting.value = false
    }
  }

  /**
   * Clear the current draft
   */
  const clearDraft = () => {
    currentDraft.value = null
    draftSuggestions.value = []
    draftError.value = null
  }

  // ============================================
  // CHAT FUNCTIONS (Session-based conversation)
  // ============================================

  /**
   * Send a chat message and get AI response
   * Supports draft creation, translation, and refinement
   *
   * @param {string} message - User's message
   * @returns {Promise<{draft, actionType, suggestions}>}
   */
  const sendChat = async (message) => {
    if (!message.trim()) return null

    isChatLoading.value = true
    chatError.value = null

    // Add user message to chat
    chatMessages.value.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })

    try {
      const result = await sendChatMessage(
        message,
        chatSessionId.value,
        preferredLanguage.value
      )

      // Update session ID if new session was created
      chatSessionId.value = result.session_id

      // Add assistant response to chat
      chatMessages.value.push({
        role: 'assistant',
        content: result.message,
        draft: result.draft,
        actionType: result.action_type,
        suggestions: result.suggestions || [],
        timestamp: new Date().toISOString()
      })

      // Also update currentDraft for compatibility
      if (result.draft) {
        currentDraft.value = result.draft
        draftSuggestions.value = result.suggestions || []
      }

      return result
    } catch (error) {
      console.error('Chat failed:', error)
      chatError.value = error.response?.data?.detail || '메시지 전송에 실패했습니다'

      // Add error message to chat
      chatMessages.value.push({
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
        isError: true,
        timestamp: new Date().toISOString()
      })

      throw error
    } finally {
      isChatLoading.value = false
    }
  }

  /**
   * Start a new chat session (clear history)
   */
  const startNewChat = async () => {
    // Delete previous session if exists
    if (chatSessionId.value) {
      try {
        await deleteSession(chatSessionId.value)
      } catch (error) {
        console.warn('Failed to delete previous session:', error)
      }
    }

    chatSessionId.value = null
    chatMessages.value = []
    chatError.value = null
    currentDraft.value = null
    draftSuggestions.value = []
  }

  /**
   * Get the latest draft from chat
   */
  const getLatestDraft = computed(() => {
    const assistantMessages = chatMessages.value.filter(m => m.role === 'assistant' && m.draft)
    if (assistantMessages.length === 0) return null
    return assistantMessages[assistantMessages.length - 1].draft
  })

  // No initialization needed - preferredLanguage is now computed from authStore

  return {
    // Translation
    isTranslating,
    translationError,
    translatedMessages,
    translateMessageToPreferred,
    getTranslation,
    clearTranslation,

    // Draft (legacy - for backward compatibility)
    isDrafting,
    draftError,
    currentDraft,
    draftSuggestions,
    createBizDraft,
    clearDraft,

    // Chat (session-based conversation)
    chatSessionId,
    chatMessages,
    isChatLoading,
    chatError,
    sendChat,
    startNewChat,
    getLatestDraft,

    // Language
    preferredLanguage,           // 기본 언어 (DB에 저장된 값)
    temporaryLanguage,           // 임시 언어 (세션 동안만)
    activeLanguage,              // 실제 사용 언어 (임시 > 기본)
    updatePreferredLanguage,     // DB에 저장 (프로필 설정용)
    setTemporaryLanguage,        // 임시 변경 (채널 헤더용)
    resetToDefaultLanguage,      // 임시 언어 초기화
    getLanguageLabel,
    SUPPORTED_LANGUAGES
  }
}
