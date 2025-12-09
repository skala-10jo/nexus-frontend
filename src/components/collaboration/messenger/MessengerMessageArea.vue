<template>
  <div class="col-span-8 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
    <!-- Channel Header -->
    <div v-if="selectedChannel" class="border-b border-gray-200 p-4 flex-shrink-0">
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

    <!-- Message Area -->
    <div v-if="selectedChannel" class="flex-1 flex flex-col overflow-hidden">
      <!-- Message History -->
      <div
        ref="messageContainer"
        class="flex-1 overflow-y-auto p-6 bg-gray-50"
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
            <div v-if="!isMyMessage(message)" class="flex items-start gap-3 max-w-[70%]">
              <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span class="text-purple-600 font-semibold text-sm">
                  {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                </span>
              </div>
              <div class="flex-1">
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="font-semibold text-gray-900 text-sm">{{ message.username || 'Unknown' }}</span>
                  <span class="text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                </div>
                <div class="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                  <p class="text-gray-700 whitespace-pre-wrap">{{ decodeHtmlEntities(message.text) }}</p>
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
            <div v-else class="flex items-start gap-3 max-w-[70%] flex-row-reverse">
              <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 font-semibold text-sm">
                  {{ currentUser ? currentUser.username.charAt(0).toUpperCase() : 'Me' }}
                </span>
              </div>
              <div>
                <div class="flex items-baseline gap-2 mb-1 justify-end">
                  <span class="text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                  <span class="font-semibold text-gray-900 text-sm">나</span>
                </div>
                <div class="bg-purple-600 text-white rounded-lg rounded-tr-none p-3 shadow-sm">
                  <p class="whitespace-pre-wrap">{{ decodeHtmlEntities(message.text) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <!-- Main Input Area -->
        <div class="flex gap-2">
          <div class="flex-1 flex flex-col gap-2">
            <textarea
              :value="messageText"
              @input="$emit('update:messageText', $event.target.value)"
              @keydown.ctrl.enter.prevent="handleCtrlEnterSend"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
              placeholder="메시지를 입력하세요... (Ctrl+Enter로 전송)"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            ></textarea>
            <!-- Hint -->
            <div class="flex justify-end">
              <span class="text-xs text-gray-400">Ctrl+Enter로 전송</span>
            </div>
          </div>
          <button
            @click="$emit('send')"
            :disabled="!messageText.trim() || loading"
            class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed self-start"
          >
            <span v-if="loading">전송 중...</span>
            <span v-else>전송</span>
          </button>
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
import { ref, watch, computed } from 'vue'
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

const emit = defineEmits(['update:messageText', 'send'])

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

// Local state
const selectedLanguage = ref(activeLanguage.value)
const translatingMessageId = ref(null)
const isComposing = ref(false)  // Korean IME composition state

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
