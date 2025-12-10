<script setup>
/**
 * SlackBizGuidePanel Component
 * Biz Guide AI 챗봇 사이드 패널
 *
 * Features:
 * - 세션 기반 대화 (컨텍스트 유지)
 * - 초안 작성, 번역, 수정 요청 지원
 * - 대화 히스토리 표시
 */
import { ref, nextTick, watch, onMounted } from 'vue'
import { useSlackAgent } from '@/composables/collaboration/messenger/useSlackAgent'

const props = defineProps({
  /** 패널 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 모바일 여부 */
  isMobile: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'use-draft'
])

// Composable
const {
  chatMessages,
  isChatLoading,
  chatError,
  sendChat,
  startNewChat,
  getLatestDraft,
  preferredLanguage
} = useSlackAgent()

// Local State
const messageInput = ref('')
const chatContainer = ref(null)

// Auto-scroll to bottom when new messages arrive
watch(() => chatMessages.value.length, async () => {
  await nextTick()
  scrollToBottom()
})

// Scroll to bottom when panel opens
watch(() => props.show, async (show) => {
  if (show) {
    await nextTick()
    scrollToBottom()
  }
})

const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const handleSendMessage = async () => {
  if (!messageInput.value.trim() || isChatLoading.value) return

  const message = messageInput.value
  messageInput.value = ''

  try {
    await sendChat(message)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

const handleKeyDown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    handleSendMessage()
  }
}

const handleUseDraft = (draft) => {
  emit('use-draft', draft)
}

const handleNewChat = async () => {
  await startNewChat()
}

// Quick action buttons
const quickActions = [
  { label: '영어로 번역', icon: '🌐', message: '영어로 번역해줘' },
  { label: '더 격식있게', icon: '👔', message: '더 격식있게 수정해줘' },
  { label: '더 간결하게', icon: '✂️', message: '더 간결하게 수정해줘' }
]

const handleQuickAction = (action) => {
  messageInput.value = action.message
  handleSendMessage()
}

// Get action type label (minimal)
const getActionLabel = (actionType) => {
  switch (actionType) {
    case 'draft': return '초안'
    case 'translate': return '번역 결과'
    case 'refine': return '수정된 초안'
    default: return '결과'
  }
}
</script>

<template>
  <transition :name="isMobile ? 'slide-up' : 'slide-left'">
    <div
      v-if="show"
      :class="[
        'fixed bg-white shadow-2xl flex flex-col z-50 font-sans',
        isMobile
          ? 'inset-0 rounded-none'
          : 'top-0 right-0 h-full w-[420px] border-l border-gray-100'
      ]"
    >
      <!-- Header -->
      <div class="p-3 md:p-4 bg-white/90 backdrop-blur-md border-b border-gray-100 flex justify-between items-center sticky top-0 z-10 safe-area-top">
        <div class="flex items-center gap-2 md:gap-3">
          <!-- Icon (both mobile and desktop) -->
          <div class="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png"
              alt="BizGuide"
              class="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 text-base leading-tight tracking-tight">Biz Guide</h3>
            <p class="text-xs text-gray-500 hidden md:block">비즈니스 메시지 초안을 작성해드려요</p>
          </div>
        </div>
        <div class="flex items-center gap-1">
          <!-- Mobile: X button first (left), then refresh button -->
          <button
            v-if="isMobile"
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            @click="handleNewChat"
            class="text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-all p-2 rounded-xl"
            title="새 대화 시작"
          >
            <!-- Refresh icon instead of plus -->
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <!-- Desktop only: X button -->
          <button
            v-if="!isMobile"
            @click="emit('close')"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Chat Messages Area -->
      <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 scroll-smooth">
        <!-- Empty State -->
        <div v-if="chatMessages.length === 0 && !isChatLoading" class="h-full flex flex-col items-center justify-center text-center px-6">
          <div class="w-20 h-20 mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h4 class="font-bold text-gray-700 mb-2">메시지 작성을 도와드릴게요</h4>
          <p class="text-sm text-gray-500 mb-4">
            작성하고 싶은 내용을 자유롭게 말씀해주세요.<br/>
            Biz Guide를 참고하여 비즈니스 메시지를 작성해드려요.
          </p>
          <div class="space-y-2 text-left w-full">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wider">예시</p>
            <div class="space-y-1.5">
              <button
                @click="messageInput = '회의 일정 조율 요청 메시지'"
                class="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-purple-300 hover:bg-purple-50 transition"
              >
                💼 회의 일정 조율 요청 메시지
              </button>
              <button
                @click="messageInput = '프로젝트 진행 상황 보고'"
                class="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-purple-300 hover:bg-purple-50 transition"
              >
                📊 프로젝트 진행 상황 보고
              </button>
              <button
                @click="messageInput = '협조 요청하는 공손한 메시지'"
                class="w-full text-left px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-purple-300 hover:bg-purple-50 transition"
              >
                🤝 협조 요청하는 공손한 메시지
              </button>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <template v-for="(msg, idx) in chatMessages" :key="idx">
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="max-w-[85%] bg-purple-600 text-white rounded-2xl rounded-br-md px-4 py-2.5 shadow-sm">
              <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
            </div>
          </div>

          <!-- Assistant Message -->
          <div v-else class="flex justify-start">
            <div class="max-w-[90%] space-y-2">
              <div class="flex items-start gap-2">
                <div class="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-sm">📚</span>
                </div>
                <div class="flex-1 space-y-2">
                  <!-- Error Message (only show if error) -->
                  <div v-if="msg.isError" class="bg-red-50 rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-red-200">
                    <p class="text-sm text-red-700">{{ msg.content }}</p>
                  </div>

                  <!-- Draft Content (main response) -->
                  <div v-else-if="msg.draft" class="bg-white rounded-xl border border-purple-100 overflow-hidden shadow-sm">
                    <div class="px-3 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                      <div class="flex items-center gap-1.5">
                        <span class="text-xs font-semibold text-purple-700">{{ getActionLabel(msg.actionType) }}</span>
                      </div>
                      <button
                        @click="handleUseDraft(msg.draft)"
                        class="px-2.5 py-1 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition shadow-sm active:scale-95"
                      >
                        사용하기
                      </button>
                    </div>
                    <div class="p-3">
                      <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ msg.draft }}</p>
                    </div>
                  </div>

                  <!-- Fallback: plain text response (no draft) -->
                  <div v-else class="bg-white rounded-2xl rounded-bl-md px-4 py-2.5 shadow-sm border border-gray-100">
                    <p class="text-sm text-gray-700">{{ msg.content }}</p>
                  </div>

                  <!-- Suggestions (collapsed by default) -->
                  <details v-if="msg.suggestions && msg.suggestions.length > 0">
                    <summary class="text-xs text-gray-500 cursor-pointer hover:text-purple-600 transition">
                      📖 참고된 비즈니스 표현 {{ msg.suggestions.length }}개
                    </summary>
                    <div class="mt-2 space-y-2">
                      <div
                        v-for="(suggestion, sIdx) in msg.suggestions.slice(0, 3)"
                        :key="sIdx"
                        class="bg-gray-50 rounded-lg p-2.5 border border-gray-100"
                      >
                        <p class="text-xs text-gray-600 leading-relaxed">
                          "{{ suggestion.text.slice(0, 120) }}{{ suggestion.text.length > 120 ? '...' : '' }}"
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Loading Indicator -->
        <div v-if="isChatLoading" class="flex justify-start">
          <div class="flex items-start gap-2">
            <div class="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span class="text-sm">📚</span>
            </div>
            <div class="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div class="flex items-center gap-1.5">
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions (only show when there's a draft) -->
      <div v-if="getLatestDraft && !isChatLoading" class="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div class="flex gap-2 overflow-x-auto pb-1">
          <button
            v-for="action in quickActions"
            :key="action.label"
            @click="handleQuickAction(action)"
            class="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition whitespace-nowrap"
          >
            {{ action.icon }} {{ action.label }}
          </button>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-3 md:p-4 bg-white border-t border-gray-100 safe-area-bottom">
        <div class="relative">
          <textarea
            v-model="messageInput"
            @keydown="handleKeyDown"
            placeholder="메시지를 작성해주세요..."
            rows="2"
            class="w-full px-3 md:px-4 py-2.5 md:py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50 focus:bg-white transition-all resize-none placeholder-gray-400"
            :disabled="isChatLoading"
          ></textarea>
          <button
            @click="handleSendMessage"
            :disabled="!messageInput.trim() || isChatLoading"
            class="absolute right-2 bottom-2 w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
          >
            <svg v-if="isChatLoading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <div class="mt-1.5 md:mt-2 flex items-center justify-between text-xs text-gray-400">
          <span class="hidden md:inline">Ctrl+Enter로 전송</span>
          <span class="md:hidden"></span>
          <span v-if="chatMessages.length > 0">대화 {{ chatMessages.length }}개</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* Desktop: Slide from right */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}

/* Mobile: Slide from bottom */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
}

/* Safe area for iOS */
.safe-area-top {
  padding-top: max(0.75rem, env(safe-area-inset-top));
}

.safe-area-bottom {
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
