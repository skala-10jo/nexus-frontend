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
      class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl flex flex-col border-l border-gray-100 z-50 font-sans"
    >
      <!-- Header -->
      <div class="p-5 bg-white/90 backdrop-blur-md border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Animals/Bear.png"
              alt="Bear"
              class="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 text-lg leading-tight tracking-tight">AI Assistant</h3>
            <p class="text-xs text-gray-500 font-medium">메일을 검색하고 초안 작성을 부탁해보세요</p>
          </div>
        </div>
        <button 
          @click="emit('close')" 
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl active:scale-95"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 scroll-smooth">
        <div v-for="(msg, idx) in messages" :key="idx">
          <!-- User Message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] shadow-md shadow-blue-500/10 text-[15px] leading-relaxed">
              {{ msg.content }}
            </div>
          </div>

          <!-- AI Response -->
          <div v-else class="flex justify-start items-start gap-3">
             <!-- AI Avatar for message -->
             <div class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm flex-shrink-0 mt-1">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
            <div class="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] shadow-sm border border-gray-100 text-[15px] leading-relaxed">
              <div v-if="msg.queryType !== 'draft' && msg.queryType !== 'translate'" class="whitespace-pre-wrap">{{ msg.content }}</div>

              <!-- Draft Result -->
              <div v-if="msg.queryType === 'draft' && msg.emailDraft" class="group mt-3">
                <div class="bg-blue-50/50 border border-blue-100 rounded-xl overflow-hidden transition-all hover:border-blue-200">
                    <div class="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span class="text-xs font-bold text-blue-700 uppercase tracking-wider">Draft Generated</span>
                    </div>
                    <div class="p-4 space-y-3">
                        <div v-if="msg.subject" class="text-sm">
                            <span class="font-semibold text-gray-500">Subject:</span>
                            <span class="ml-2 text-gray-900 font-medium">{{ msg.subject }}</span>
                        </div>
                        <div class="text-gray-700 whitespace-pre-wrap font-sans text-sm bg-white p-3 rounded-lg border border-blue-50 shadow-sm">{{ msg.emailDraft }}</div>
                    </div>
                </div>
              </div>

              <!-- Translation Result -->
              <div v-if="msg.queryType === 'translate' && msg.translatedEmail" class="mt-3">
                 <div class="bg-emerald-50/50 border border-emerald-100 rounded-xl overflow-hidden transition-all hover:border-emerald-200">
                    <div class="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <span class="text-xs font-bold text-emerald-700 uppercase tracking-wider">Translation</span>
                    </div>
                    <div class="p-4">
                        <div class="text-gray-700 whitespace-pre-wrap font-sans text-sm bg-white p-3 rounded-lg border border-emerald-50 shadow-sm">{{ msg.translatedEmail }}</div>
                    </div>
                 </div>
              </div>

              <!-- Search Results -->
              <div v-if="msg.searchResults && msg.searchResults.length > 0" class="mt-4 space-y-2">
                <div class="text-xs text-gray-400 font-bold uppercase tracking-wider px-1">Found {{ msg.searchResults.length }} emails</div>
                <div
                  v-for="result in msg.searchResults"
                  :key="result.email_id"
                  @click="emit('open-email', result.email_id)"
                  class="bg-white border border-gray-100 rounded-xl p-3 hover:border-blue-300 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div class="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{{ result.subject }}</div>
                  <div class="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <span>From:</span>
                    <span class="font-medium">{{ result.from_name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="loading" class="flex justify-start items-center gap-3">
           <div class="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm flex-shrink-0">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
           </div>
          <div class="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100">
            <div class="flex gap-1.5">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="p-5 bg-white border-t border-gray-100">
        <div class="relative">
          <input
            :value="inputValue"
            @input="emit('update:inputValue', $event.target.value)"
            @keyup.enter="handleKeyEnter"
            type="text"
            placeholder="Ask AI anything..."
            class="w-full pl-5 pr-14 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm bg-gray-50/50 focus:bg-white transition-all shadow-sm placeholder-gray-400"
          >
          <button
            @click="emit('send')"
            :disabled="!inputValue.trim() || loading"
            class="absolute right-2 top-1.5 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:hover:bg-blue-600 shadow-md hover:shadow-lg active:scale-95 transform flex items-center justify-center"
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
