<script setup>
/**
 * MailChatPanel Component
 * AI 메일 채팅 사이드 패널
 */
defineProps({
  /** 패널 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 채팅 메시지 목록 */
  messages: {
    type: Array,
    default: () => []
  },
  /** 입력 값 */
  inputValue: {
    type: String,
    default: ''
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'send',
  'update:inputValue',
  'open-email'
])

const handleKeyEnter = () => {
  emit('send')
}
</script>

<template>
  <transition name="slide-left">
    <div
      v-if="show"
      class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl flex flex-col border-l border-gray-200 z-40"
    >
      <!-- Header -->
      <div class="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 class="font-bold text-lg">AI Assistant</h3>
        </div>
        <button @click="emit('close')" class="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        <div v-for="(msg, idx) in messages" :key="idx">
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm text-sm">
              {{ msg.content }}
            </div>
          </div>

          <!-- AI Response -->
          <div v-else class="flex justify-start">
            <div class="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%] shadow-sm border border-gray-100 text-sm">
              <div v-if="msg.queryType !== 'draft' && msg.queryType !== 'translate'" class="whitespace-pre-wrap">{{ msg.content }}</div>

              <!-- Draft Result -->
              <div v-if="msg.queryType === 'draft' && msg.emailDraft" class="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                <div class="text-xs text-blue-700 font-bold mb-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Draft Generated
                </div>
                <div class="space-y-2">
                  <div v-if="msg.subject" class="text-sm">
                    <span class="font-semibold text-gray-700">Subject:</span>
                    <span class="ml-2 text-gray-900">{{ msg.subject }}</span>
                  </div>
                  <div class="border-t border-blue-100 pt-2">
                    <div class="text-gray-800 whitespace-pre-wrap font-sans">{{ msg.emailDraft }}</div>
                  </div>
                </div>
              </div>

              <!-- Translation Result -->
              <div v-if="msg.queryType === 'translate' && msg.translatedEmail" class="bg-green-50 border border-green-100 rounded-xl p-3 mt-2">
                <div class="text-xs text-green-700 font-bold mb-2 flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  Translation
                </div>
                <div class="text-gray-800 whitespace-pre-wrap font-sans">{{ msg.translatedEmail }}</div>
              </div>

              <!-- Search Results -->
              <div v-if="msg.searchResults && msg.searchResults.length > 0" class="mt-3 space-y-2">
                <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Found {{ msg.searchResults.length }} emails</div>
                <div
                  v-for="result in msg.searchResults"
                  :key="result.email_id"
                  @click="emit('open-email', result.email_id)"
                  class="bg-gray-50 border border-gray-200 rounded-lg p-2.5 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition text-xs"
                >
                  <div class="font-semibold text-gray-900 truncate">{{ result.subject }}</div>
                  <div class="text-gray-600 mt-0.5">{{ result.from_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex justify-start">
          <div class="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-4 bg-white border-t border-gray-200">
        <div class="flex gap-2">
          <input
            :value="inputValue"
            @input="emit('update:inputValue', $event.target.value)"
            @keyup.enter="handleKeyEnter"
            type="text"
            placeholder="무엇이든 물어보세요!"
            class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all"
          >
          <button
            @click="emit('send')"
            :disabled="!inputValue.trim() || loading"
            class="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
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
</style>
