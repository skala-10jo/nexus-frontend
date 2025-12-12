<template>
  <div
    ref="scrollContainer"
    class="flex-1 overflow-y-auto scroll-smooth p-6 space-y-6"
  >
    <!-- Empty State -->
    <div v-if="!isLoading && messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
      <ChatBubbleLeftRightIcon class="w-16 h-16 opacity-20" />
      <p>대화를 시작해보세요!</p>
    </div>

    <!-- Messages -->
    <PracticeMessageBubble
      v-for="(message, index) in messages"
      :key="index"
      :message="message"
      :message-index="index"
      :scenario="scenario"
      :is-selected="isMessageSelected(message)"
      :is-speaking="isSpeaking"
      :speaking-message-index="speakingMessageIndex"
      :translation-loading="translationLoading[index]"
      :hint-loading="hintLoading[index]"
      @message-click="$emit('messageClick', message)"
      @play-message="(text, idx) => $emit('playMessage', text, idx)"
      @stop-message="$emit('stopMessage')"
      @toggle-translation="(idx) => $emit('toggleTranslation', idx)"
      @toggle-hint="(idx) => $emit('toggleHint', idx)"
    />

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

<script setup>
import { ref } from 'vue'
import { ChatBubbleLeftRightIcon } from '@heroicons/vue/24/outline'
import PracticeMessageBubble from './PracticeMessageBubble.vue'

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
  /** 힌트 로딩 상태 */
  hintLoading: {
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
  /** TTS 재생 중 여부 */
  isSpeaking: {
    type: Boolean,
    default: false
  },
  /** 현재 재생 중인 메시지 인덱스 */
  speakingMessageIndex: {
    type: Number,
    default: -1
  }
})

defineEmits([
  'messageClick',
  'playMessage',
  'stopMessage',
  'toggleTranslation',
  'toggleHint'
])

// 스크롤 컨테이너 ref
const scrollContainer = ref(null)

/**
 * 메시지가 선택되었는지 확인
 */
const isMessageSelected = (message) => {
  if (message.speaker !== 'user') return false
  const index = props.userMessages.findIndex(m => m === message)
  return index === props.selectedMessageIndex
}

/**
 * 스크롤을 맨 아래로 이동
 * @param {boolean} smooth - 부드러운 스크롤 여부
 */
const scrollToBottom = (smooth = true) => {
  // 이중 requestAnimationFrame으로 레이아웃 완전 반영 후 스크롤
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTo({
          top: scrollContainer.value.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant'
        })
      }
    })
  })
}

// 외부에서 호출 가능하도록 expose
defineExpose({
  scrollToBottom
})
</script>
