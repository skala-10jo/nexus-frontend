<template>
  <div class="bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
    <!-- Channel Header (Hidden on mobile - shown in main header) -->
    <div v-if="selectedChannel" class="hidden md:block border-b border-gray-200 p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-800">
            # {{ selectedChannel.name }}
          </h3>
          <p v-if="integration" class="text-sm text-gray-500">
            {{ integration.workspaceName }}
          </p>
        </div>
        <!-- Language Selector (Temporary) -->
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">번역 언어:</span>
          <select
            v-model="selectedLanguage"
            @change="handleLanguageChange"
            class="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          >
            <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
              {{ lang.flag }} {{ lang.label }}
            </option>
          </select>
          <!-- Show reset button if using temporary language -->
          <button
            v-if="isUsingTemporary"
            @click="handleResetLanguage"
            class="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1"
            title="기본 언어로 복원"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>기본값</span>
          </button>
          <span v-if="isUsingTemporary" class="text-xs text-orange-500">(임시)</span>
        </div>
      </div>
    </div>

    <!-- Mobile Language Selector (Custom Dropdown) -->
    <div v-if="selectedChannel" class="md:hidden border-b border-gray-200 px-3 py-2 flex-shrink-0">
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">번역:</span>
        <div class="flex items-center gap-2 relative">
          <!-- Custom Dropdown Button -->
          <button
            @click="showMobileDropdown = !showMobileDropdown"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 active:bg-gray-50"
          >
            <span>{{ getCurrentLanguageFlag }}</span>
            <span>{{ getCurrentLanguageLabel }}</span>
            <svg class="w-4 h-4 text-gray-400" :class="{ 'rotate-180': showMobileDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showMobileDropdown"
            class="absolute top-full right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
          >
            <button
              v-for="lang in SUPPORTED_LANGUAGES"
              :key="lang.code"
              @click="selectLanguage(lang.code)"
              :class="[
                'w-full px-3 py-2.5 text-left text-sm flex items-center gap-2',
                selectedLanguage === lang.code ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              ]"
            >
              <span class="text-base">{{ lang.flag }}</span>
              <span>{{ lang.label }}</span>
              <svg v-if="selectedLanguage === lang.code" class="w-4 h-4 ml-auto text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>

          <!-- Backdrop to close dropdown -->
          <div
            v-if="showMobileDropdown"
            @click="showMobileDropdown = false"
            class="fixed inset-0 z-40"
          ></div>

          <button
            v-if="isUsingTemporary"
            @click="handleResetLanguage"
            class="text-xs text-gray-500 hover:text-purple-600"
            title="기본 언어로 복원"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Message Area -->
    <div v-if="selectedChannel" class="flex-1 flex flex-col overflow-hidden">
      <!-- Message History -->
      <div
        ref="messageContainer"
        class="flex-1 overflow-y-auto p-3 md:p-6 bg-gray-50"
        style="min-height: 0;"
      >
        <div v-if="loading && messages.length === 0" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        <div v-else-if="messages.length === 0" class="text-center py-8 text-gray-500">
          메시지가 없습니다
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'flex',
              isMyMessage(message) ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- Other person's message (left) -->
            <div v-if="!isMyMessage(message)" class="flex items-start gap-2 md:gap-3 max-w-[85%] md:max-w-[70%]">
              <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span class="text-purple-600 font-semibold text-xs md:text-sm">
                  {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="font-semibold text-gray-900 text-xs md:text-sm truncate">{{ message.username || 'Unknown' }}</span>
                  <span class="text-[10px] md:text-xs text-gray-500 flex-shrink-0">{{ formatTimestamp(message.timestamp) }}</span>
                </div>
                <div class="bg-white rounded-lg rounded-tl-none p-2.5 md:p-3 shadow-sm">
                  <p class="text-sm md:text-base text-gray-700 whitespace-pre-wrap break-words">{{ decodeHtmlEntities(message.text) }}</p>
                  <!-- Translated Text -->
                  <div v-if="getTranslation(getMessageId(message))" class="mt-2 pt-2 border-t border-gray-100">
                    <p class="text-sm text-purple-700 whitespace-pre-wrap">
                      <span class="text-xs text-purple-500 font-medium">{{ getLanguageLabel(selectedLanguage) }}</span><br>
                      {{ decodeHtmlEntities(getTranslation(getMessageId(message))) }}
                    </p>
                  </div>
                </div>
                <!-- Translate Button -->
                <div class="mt-1 flex gap-2">
                  <button
                    v-if="!getTranslation(getMessageId(message))"
                    @click="handleTranslate(message)"
                    :disabled="isTranslating"
                    class="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 disabled:opacity-50"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span v-if="translatingMessageId === getMessageId(message)">번역 중...</span>
                    <span v-else>번역</span>
                  </button>
                  <button
                    v-else
                    @click="clearTranslation(getMessageId(message))"
                    class="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>번역 숨기기</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- My message (right) -->
            <div v-else class="flex items-start gap-2 md:gap-3 max-w-[85%] md:max-w-[70%] flex-row-reverse">
              <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 font-semibold text-xs md:text-sm">
                  {{ currentUser ? currentUser.username.charAt(0).toUpperCase() : 'Me' }}
                </span>
              </div>
              <div class="min-w-0">
                <div class="flex items-baseline gap-2 mb-1 justify-end">
                  <span class="text-[10px] md:text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                  <span class="font-semibold text-gray-900 text-xs md:text-sm">나</span>
                </div>
                <div class="bg-purple-600 text-white rounded-lg rounded-tr-none p-2.5 md:p-3 shadow-sm">
                  <p class="text-sm md:text-base whitespace-pre-wrap break-words">{{ decodeHtmlEntities(message.text) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 bg-white p-3 md:p-4 flex-shrink-0">
        <!-- Main Input Area -->
        <div class="flex gap-2">
          <div class="flex-1 flex flex-col gap-1 md:gap-2">
            <textarea
              ref="textareaRef"
              :value="messageText"
              @input="handleTextareaInput"
              @keydown.ctrl.enter.prevent="handleCtrlEnterSend"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              placeholder="메시지를 입력하세요..."
              rows="1"
              class="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-sm md:text-base overflow-hidden"
              :style="{ height: textareaHeight + 'px', maxHeight: maxTextareaHeight + 'px', overflowY: textareaHeight >= maxTextareaHeight ? 'auto' : 'hidden' }"
            ></textarea>
            <!-- Hint (hidden on mobile) -->
            <div class="hidden md:flex justify-end">
              <span class="text-xs text-gray-400">Ctrl+Enter로 전송</span>
            </div>
          </div>

          <!-- Desktop: Always show send button -->
          <button
            class="hidden md:flex px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed self-start text-base font-medium active:scale-95 transition-transform"
            @click="$emit('send')"
            :disabled="!messageText.trim() || loading"
          >
            <span v-if="loading">전송 중...</span>
            <span v-else>전송</span>
          </button>

          <!-- Mobile: Dynamic button (Biz Guide or Send) -->
          <div class="md:hidden self-start">
            <!-- Show Biz Guide button when input is empty -->
            <button
              v-if="!messageText.trim()"
              @click="$emit('open-biz-guide')"
              class="w-11 h-11 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center active:scale-95 transition-transform shadow-sm"
              title="Biz Guide AI"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>
            <!-- Show Send button when there's input -->
            <button
              v-else
              @click="$emit('send')"
              :disabled="loading"
              class="w-11 h-11 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center active:scale-95 transition-transform shadow-sm"
            >
              <svg v-if="loading" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Channel Selected -->
    <div v-else class="flex-1 flex items-center justify-center p-6">
      <div class="text-center">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p class="text-gray-500">채널을 선택해주세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, onMounted } from 'vue'
import { useSlackAgent, SUPPORTED_LANGUAGES } from '@/composables/collaboration/messenger/useSlackAgent'

const props = defineProps({
  selectedChannel: {
    type: Object,
    default: null
  },
  integration: {
    type: Object,
    default: null
  },
  messages: {
    type: Array,
    required: true
  },
  messageText: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  },
  isMyMessage: {
    type: Function,
    required: true
  },
  formatTimestamp: {
    type: Function,
    required: true
  }
})

const emit = defineEmits(['update:messageText', 'send', 'open-biz-guide'])

// Slack Agent composable (translation features only)
const {
  isTranslating,
  translateMessageToPreferred,
  getTranslation,
  clearTranslation,
  preferredLanguage,
  temporaryLanguage,
  activeLanguage,
  setTemporaryLanguage,
  resetToDefaultLanguage,
  getLanguageLabel
} = useSlackAgent()

// Check if using temporary language
const isUsingTemporary = computed(() => temporaryLanguage.value !== null)

// Refs
const messageContainer = ref(null)
const textareaRef = ref(null)

// Local state
const selectedLanguage = ref(activeLanguage.value)
const translatingMessageId = ref(null)
const isComposing = ref(false)  // Korean IME composition state
const showMobileDropdown = ref(false)  // Mobile custom dropdown state

// Textarea auto-resize
const textareaHeight = ref(44)  // Initial height (approx 1 line)
const minTextareaHeight = 44
const maxTextareaHeight = 100  // Approx 3 lines

// Auto-resize textarea based on content
const adjustTextareaHeight = () => {
  if (!textareaRef.value) return

  // Reset height to auto to get the correct scrollHeight
  textareaRef.value.style.height = 'auto'
  const scrollHeight = textareaRef.value.scrollHeight

  // Clamp between min and max
  textareaHeight.value = Math.min(Math.max(scrollHeight, minTextareaHeight), maxTextareaHeight)
  textareaRef.value.style.height = textareaHeight.value + 'px'
}

// Handle textarea input with auto-resize
const handleTextareaInput = (event) => {
  emit('update:messageText', event.target.value)
  nextTick(() => adjustTextareaHeight())
}

// Reset textarea height when message is sent
watch(() => props.messageText, (newVal) => {
  if (!newVal) {
    textareaHeight.value = minTextareaHeight
    if (textareaRef.value) {
      textareaRef.value.style.height = minTextareaHeight + 'px'
    }
  }
})

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight
  }
}

// Watch for channel changes - scroll to bottom
watch(() => props.selectedChannel, async (newChannel) => {
  if (newChannel) {
    await nextTick()
    // Small delay to ensure messages are rendered
    setTimeout(scrollToBottom, 100)
  }
})

// Watch for new messages - scroll to bottom
watch(() => props.messages.length, async () => {
  await scrollToBottom()
})

// Computed for current language display
const getCurrentLanguageFlag = computed(() => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage.value)
  return lang?.flag || '🌐'
})

const getCurrentLanguageLabel = computed(() => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage.value)
  return lang?.label || '언어 선택'
})

// Select language from custom dropdown
const selectLanguage = (code) => {
  selectedLanguage.value = code
  setTemporaryLanguage(code)
  showMobileDropdown.value = false
}

// Decode HTML entities from Slack messages
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

// Handle Ctrl+Enter send (prevents Korean IME duplicate character bug)
const handleCtrlEnterSend = (event) => {
  // If IME is composing (e.g., typing Korean), wait for composition to end
  if (isComposing.value || event.isComposing) {
    return
  }
  emit('send')
}

// Watch for active language changes from composable
watch(activeLanguage, (newVal) => {
  selectedLanguage.value = newVal
})

// Get message ID
const getMessageId = (message) => {
  return message.timestamp || message.ts || message.id
}

// Handle language change (temporary, session only)
const handleLanguageChange = () => {
  // Use temporary language change (not saved to DB)
  setTemporaryLanguage(selectedLanguage.value)
}

// Handle reset to default language
const handleResetLanguage = () => {
  resetToDefaultLanguage()
  selectedLanguage.value = preferredLanguage.value
}

// Handle translate button click
const handleTranslate = async (message) => {
  const messageId = getMessageId(message)
  translatingMessageId.value = messageId
  try {
    await translateMessageToPreferred(message)
  } catch (error) {
    console.error('Translation failed:', error)
  } finally {
    translatingMessageId.value = null
  }
}
</script>
