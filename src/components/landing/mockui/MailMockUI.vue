<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">{{ headerTitle }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex h-[420px]">
      <!-- Left: Mail/Slack Preview -->
      <div class="w-[50%] flex flex-col border-r border-gray-100">
        <!-- Tab Header -->
        <div class="flex border-b border-gray-200">
          <button
            v-for="(tab, idx) in tabs"
            :key="idx"
            class="flex-1 px-3 py-2 text-[10px] font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
            :class="activeTab === idx
              ? 'text-blue-600 border-b-2 border-blue-500 bg-white'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'"
            @click="activeTab = idx"
          >
            <component :is="tab.icon" class="w-3.5 h-3.5" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Mail Preview -->
        <div v-if="activeTab === 0" class="flex-1 p-3 overflow-hidden bg-gray-50/50">
          <div class="bg-white rounded-lg border border-gray-200 shadow-sm h-full flex flex-col">
            <div class="px-3 py-2 border-b border-gray-100 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-400 w-8">To:</span>
                <span class="text-xs text-gray-700">{{ mailTo }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] text-gray-400 w-8">제목:</span>
                <span class="text-xs text-gray-700 font-medium">{{ displayedSubject }}<span v-if="isTypingSubject" class="inline-block w-0.5 h-3 bg-gray-800 animate-blink ml-0.5"></span></span>
              </div>
            </div>
            <div ref="mailBodyRef" class="flex-1 px-3 py-2 overflow-y-auto">
              <p class="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{{ displayedBody }}<span v-if="isTypingBody" class="inline-block w-0.5 h-3 bg-gray-800 animate-blink ml-0.5"></span></p>
            </div>
            <div class="px-3 py-2 border-t border-gray-100">
              <button
                class="w-full py-1.5 rounded-lg text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                :class="canSend
                  ? (isSending ? 'bg-green-500 text-white' : 'bg-blue-500 text-white hover:bg-blue-600')
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              >
                <svg v-if="isSending" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <svg v-else-if="isSent" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {{ isSent ? '전송 완료!' : (isSending ? '전송 중...' : '메일 보내기') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Slack Preview -->
        <div v-if="activeTab === 1" class="flex-1 p-3 overflow-hidden bg-gray-50/50">
          <div class="bg-[#1a1d21] rounded-lg border border-gray-700 shadow-sm h-full flex flex-col">
            <div class="px-3 py-2 border-b border-gray-700 flex items-center gap-2">
              <div class="w-5 h-5 rounded bg-green-600 flex items-center justify-center">
                <span class="text-[8px] text-white font-bold">MJ</span>
              </div>
              <span class="text-white font-bold text-xs">Mr. Johnson</span>
              <span class="text-green-400 text-[9px]">● 온라인</span>
            </div>
            <div class="flex-1 px-3 py-2 overflow-y-auto">
              <div v-if="showSlackMessage" class="flex gap-2">
                <div class="w-7 h-7 rounded bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                  <span class="text-[10px] text-white font-bold">나</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-0.5">
                    <span class="text-white text-xs font-bold">김지현</span>
                    <span class="text-gray-500 text-[10px]">오후 2:35</span>
                  </div>
                  <p class="text-gray-300 text-xs leading-relaxed whitespace-pre-wrap">{{ displayedSlackMessage }}</p>
                </div>
              </div>
            </div>
            <div class="px-3 py-2 border-t border-gray-700">
              <button
                class="w-full py-1.5 rounded text-[10px] font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                :class="canSendSlack
                  ? (isSendingSlack ? 'bg-green-600 text-white' : 'bg-[#007a5a] text-white hover:bg-[#148567]')
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'"
              >
                <svg v-if="isSentSlack" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ isSentSlack ? '전송 완료!' : 'Slack DM 보내기' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: Chatbot -->
      <div class="w-[50%] flex flex-col">
        <div class="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <p class="text-xs font-bold text-gray-800">AI 메일 어시스턴트</p>
              <p class="text-[10px] text-gray-500">영어 비즈니스 메일 작성 도우미</p>
            </div>
          </div>
        </div>

        <div ref="chatMessagesRef" class="flex-1 p-3 space-y-3 overflow-y-auto bg-gray-50/30">
          <!-- AI Welcome -->
          <div v-if="showWelcome" class="flex gap-2 animate-message-in">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <span class="text-[10px] text-white font-bold">AI</span>
            </div>
            <div class="bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100 max-w-[85%]">
              <p class="text-[11px] text-gray-700 leading-relaxed">안녕하세요! 영어 비즈니스 메일 작성을 도와드릴게요. 어떤 메일을 작성하시겠어요?</p>
            </div>
          </div>

          <!-- User Message -->
          <div v-if="showUserMessage" class="flex gap-2 justify-end animate-message-in">
            <div class="bg-blue-500 text-white rounded-xl rounded-tr-sm px-3 py-2 shadow-sm max-w-[85%]">
              <p class="text-[11px] leading-relaxed">{{ userMessage }}</p>
            </div>
            <div class="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center shrink-0">
              <span class="text-[10px] text-gray-600 font-bold">나</span>
            </div>
          </div>

          <!-- AI Response -->
          <div v-if="showAIResponse" class="flex gap-2 animate-message-in">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <span class="text-[10px] text-white font-bold">AI</span>
            </div>
            <div class="bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100 max-w-[85%]">
              <p class="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">{{ displayedAIResponse }}<span v-if="isTypingAI" class="inline-block w-0.5 h-3 bg-purple-500 animate-blink ml-0.5"></span></p>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="showTypingIndicator" class="flex gap-2 animate-message-in">
            <div class="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
              <span class="text-[10px] text-white font-bold">AI</span>
            </div>
            <div class="bg-white rounded-xl rounded-tl-sm px-3 py-2 shadow-sm border border-gray-100">
              <div class="flex gap-1">
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style="animation-delay: 0ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style="animation-delay: 150ms"></span>
                <span class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce-dot" style="animation-delay: 300ms"></span>
              </div>
            </div>
          </div>

          <!-- Tips -->
          <div v-if="showTips" class="flex gap-2 animate-message-in">
            <div class="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div class="bg-purple-50 rounded-xl rounded-tl-sm px-3 py-2 shadow-sm border border-purple-100 max-w-[85%]">
              <p class="text-[10px] font-bold text-purple-700 mb-0.5">💡 번역 품질 향상 팁</p>
              <p class="text-[10px] text-gray-600 leading-relaxed">"Please" 대신 "I would appreciate if..."를 사용하면 더 공손해요!</p>
            </div>
          </div>
        </div>

        <!-- Chat Input -->
        <div class="p-2 border-t border-gray-100 bg-white">
          <div class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-200">
            <input
              type="text"
              :value="inputText"
              readonly
              placeholder="메시지를 입력하세요..."
              class="flex-1 bg-transparent text-[11px] text-gray-700 placeholder-gray-400 outline-none"
            />
            <button class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center hover:bg-blue-600 transition-colors">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * MailMockUI - 메일/Slack 작성 시연 UI
 *
 * @description AI 메일 어시스턴트 시연
 */
import { ref, markRaw, h } from 'vue'
import { useMailAnimation } from '@/composables/landing/useMailAnimation'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Icons
const EnvelopeIcon = {
  render() {
    return h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
    ])
  }
}

const SlackIcon = {
  render() {
    return h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
      h('path', { d: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z' })
    ])
  }
}

const tabs = [
  { label: '메일', icon: markRaw(EnvelopeIcon) },
  { label: 'Slack', icon: markRaw(SlackIcon) }
]

// Refs
const mailBodyRef = ref(null)
const chatMessagesRef = ref(null)

// Animation composable
const {
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
  resetState,
  restartAnimation
} = useMailAnimation(props, { mailBodyRef, chatMessagesRef })

defineExpose({ resetState, restartAnimation })
</script>

<style scoped>
.animate-blink {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-message-in {
  animation: messageIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animate-bounce-dot {
  animation: bounceDot 1.4s infinite ease-in-out both;
}

@keyframes bounceDot {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
