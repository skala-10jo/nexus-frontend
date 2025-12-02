<script setup>
/**
 * Practice 대화 영역 컴포넌트
 *
 * 메시지 목록, 아바타 뷰, 로딩 상태를 표시합니다.
 */
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** 메시지 목록 */
  messages: {
    type: Array,
    default: () => []
  },
  /** 시나리오 정보 */
  scenario: {
    type: Object,
    default: null
  },
  /** 로딩 상태 */
  isLoading: {
    type: Boolean,
    default: false
  },
  /** 번역 로딩 상태 */
  translationLoading: {
    type: Object,
    default: () => ({})
  },
  /** 선택된 메시지 인덱스 */
  selectedMessageIndex: {
    type: Number,
    default: 0
  },
  /** 사용자 메시지 목록 */
  userMessages: {
    type: Array,
    default: () => []
  },
  /** 아바타 활성화 여부 */
  avatarEnabled: {
    type: Boolean,
    default: false
  },
  /** STT 연결 중 */
  sttIsConnecting: {
    type: Boolean,
    default: false
  },
  /** 녹음 중 */
  isRecording: {
    type: Boolean,
    default: false
  },
  /** 음성 처리 중 */
  isProcessingVoice: {
    type: Boolean,
    default: false
  },
  /** 인식된 텍스트 */
  recognizedText: {
    type: String,
    default: ''
  },
  /** 녹음 시간 */
  recordingTime: {
    type: Number,
    default: 0
  },
  /** 최종 텍스트 목록 */
  finalTexts: {
    type: Array,
    default: () => []
  },
  /** 중간 텍스트 */
  interimText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'toggleTranslation',
  'messageClick'
])

/**
 * 메시지가 선택되었는지 확인
 */
const isMessageSelected = (message) => {
  if (message.speaker !== 'user') return false
  const index = props.userMessages.findIndex(m => m === message)
  return index === props.selectedMessageIndex
}

/**
 * 시간 포맷팅
 */
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <!-- Avatar View -->
  <div v-if="avatarEnabled" class="flex-1 bg-black flex flex-col">
    <div class="flex-1 relative flex items-center justify-center">
      <video
        class="w-full h-full object-contain"
        autoplay
        playsinline
      ></video>

      <!-- Avatar Status Badge -->
      <div class="absolute top-4 right-4">
        <div class="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 text-green-400 text-xs font-bold border border-white/10">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          아바타 활성
        </div>
      </div>

      <!-- Voice Status Overlay -->
      <div
        v-if="sttIsConnecting || isRecording || isProcessingVoice || recognizedText"
        class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl p-6 text-center max-w-lg border border-white/10 transition-all"
      >
        <div v-if="sttIsConnecting" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
          <ArrowPathIcon class="w-6 h-6 animate-spin" />
          Connecting...
        </div>
        <div v-else-if="isRecording" class="space-y-3">
          <div class="flex items-center justify-center gap-2 text-red-400 font-bold animate-pulse">
            <span class="w-3 h-3 bg-red-500 rounded-full"></span>
            Recording... {{ recordingTime }}s
          </div>
          <div class="space-y-1">
            <p v-for="(text, idx) in finalTexts" :key="idx" class="text-white font-medium">{{ text }}</p>
            <p v-if="interimText" class="text-blue-300 italic animate-pulse">{{ interimText }}</p>
            <p v-else class="text-gray-400">Listening...</p>
          </div>
        </div>
        <div v-else-if="isProcessingVoice" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
          <ArrowPathIcon class="w-6 h-6 animate-spin" />
          Sending message...
        </div>
        <div v-else-if="recognizedText" class="space-y-2">
          <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">You Said</p>
          <p class="text-white text-xl font-medium">"{{ recognizedText }}"</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Chat Mode View -->
  <div v-else class="flex-1 flex flex-col min-h-0 bg-gray-50 overflow-y-auto p-6 space-y-6 scroll-smooth">
    <!-- Empty State -->
    <div v-if="!isLoading && messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
      <ChatBubbleLeftRightIcon class="w-16 h-16 opacity-20" />
      <p>대화를 시작해보세요!</p>
    </div>

    <!-- Messages -->
    <div
      v-for="(message, index) in messages"
      :key="index"
      class="flex flex-col max-w-3xl"
      :class="message.speaker === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
    >
      <!-- Speaker Name -->
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ message.speaker === 'user' ? (scenario?.roles?.user || 'Me') : (scenario?.roles?.ai || 'AI') }}
      </span>

      <!-- Bubble -->
      <div
        class="relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed group transition-all duration-200"
        :class="[
          message.speaker === 'user'
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm cursor-pointer hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm',
          message.speaker === 'user' && isMessageSelected(message) ? 'ring-2 ring-offset-2 ring-blue-400' : ''
        ]"
        @click="message.speaker === 'user' ? emit('messageClick', message) : null"
      >
        <!-- Message Content -->
        <p>{{ message.showTranslation ? (message.translatedText || message.message) : message.message }}</p>

        <!-- Translation Button (AI only) -->
        <button
          v-if="message.speaker === 'ai'"
          @click.stop="emit('toggleTranslation', index)"
          :disabled="translationLoading[index]"
          class="absolute -bottom-9 left-0 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-100 z-10"
        >
          <LanguageIcon class="w-3.5 h-3.5" />
          {{ translationLoading[index] ? '번역 중...' : (message.showTranslation ? '원문 보기' : '번역') }}
        </button>

        <!-- Feedback Indicator (User only) -->
        <div
          v-if="message.speaker === 'user'"
          class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-400"
        >
          <ChartBarIcon class="w-4 h-4" />
        </div>
      </div>

      <!-- Timestamp -->
      <span
        class="text-[10px] text-gray-400 px-1 transition-all"
        :class="message.speaker === 'ai' ? 'mt-10' : 'mt-1'"
      >
        {{ formatTime(message.timestamp) }}
      </span>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex flex-col items-start max-w-3xl mr-auto">
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ scenario?.roles?.ai || 'AI' }}
      </span>
      <div class="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
      </div>
    </div>
  </div>
</template>
