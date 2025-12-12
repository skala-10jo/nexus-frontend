<template>
  <div
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
        message.speaker === 'user' && isSelected ? 'ring-2 ring-offset-2 ring-blue-400' : ''
      ]"
      @click="message.speaker === 'user' ? $emit('messageClick', message) : null"
    >
      <!-- Message Content -->
      <p>{{ message.showTranslation ? (message.translatedText || message.message) : message.message }}</p>

      <!-- AI Message Actions -->
      <div v-if="message.speaker === 'ai'" class="absolute -bottom-9 left-0 flex items-center gap-2 z-10">
        <!-- Play/Stop Button -->
        <button
          @click.stop="isSpeaking && speakingMessageIndex === messageIndex ? $emit('stopMessage') : $emit('playMessage', message.message, messageIndex)"
          class="text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors shadow-sm border"
          :class="isSpeaking && speakingMessageIndex === messageIndex
            ? 'text-red-600 hover:text-red-800 bg-red-50 border-red-100'
            : 'text-green-600 hover:text-green-800 bg-green-50 border-green-100'"
        >
          <StopIcon v-if="isSpeaking && speakingMessageIndex === messageIndex" class="w-3.5 h-3.5" />
          <SpeakerWaveIcon v-else class="w-3.5 h-3.5" />
          {{ isSpeaking && speakingMessageIndex === messageIndex ? '중지' : '재생' }}
        </button>

        <!-- Translation Button -->
        <button
          @click.stop="$emit('toggleTranslation', messageIndex)"
          :disabled="translationLoading"
          class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-100"
        >
          <LanguageIcon class="w-3.5 h-3.5" />
          {{ translationLoading ? '번역 중...' : (message.showTranslation ? '원문 보기' : '번역') }}
        </button>

        <!-- Hint Button -->
        <button
          @click.stop="$emit('toggleHint', messageIndex)"
          :disabled="hintLoading"
          class="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-amber-100"
        >
          <LightBulbIcon class="w-3.5 h-3.5" />
          {{ hintLoading ? '생성 중...' : (message.showHint ? '힌트 닫기' : '힌트') }}
        </button>
      </div>

      <!-- Hint Display - Multiple Hints -->
      <div
        v-if="message.speaker === 'ai' && message.showHint && message.hints?.length"
        class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 relative animate-fade-in-down"
      >
        <div class="absolute -top-1.5 left-20 w-3 h-3 bg-amber-50 border-t border-l border-amber-100 transform rotate-45"></div>

        <!-- Header -->
        <div class="flex items-center gap-2 mb-3">
          <div class="p-1 bg-amber-100 rounded-full text-amber-600">
            <LightBulbIcon class="w-3.5 h-3.5" />
          </div>
          <p class="text-[13px] font-bold text-amber-600 uppercase tracking-wider">이렇게 말해보세요!</p>
        </div>

        <!-- Hints List -->
        <div class="space-y-3">
          <div
            v-for="(hint, hintIdx) in message.hints"
            :key="hintIdx"
            class="group/hint"
          >
            <!-- Hint Text -->
            <div class="flex items-start gap-2">
              <span class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center">
                {{ hintIdx + 1 }}
              </span>
              <div class="flex-1">
                <p class="text-sm text-gray-900 font-medium leading-relaxed">"{{ hint }}"</p>
                <!-- Hint Explanation (Korean) -->
                <p
                  v-if="message.hintExplanations?.[hintIdx]"
                  class="text-xs text-gray-500 mt-1 pl-0.5"
                >
                  {{ message.hintExplanations[hintIdx] }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminology Suggestions -->
        <div
          v-if="message.terminologySuggestions?.length"
          class="mt-3 pt-3 border-t border-amber-100"
        >
          <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">추천 용어</p>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="term in message.terminologySuggestions"
              :key="term"
              class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"
            >
              {{ term }}
            </span>
          </div>
        </div>
      </div>

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
</template>

<script setup>
import {
  SpeakerWaveIcon,
  StopIcon,
  LanguageIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** 메시지 객체 */
  message: {
    type: Object,
    required: true
  },
  /** 메시지 인덱스 */
  messageIndex: {
    type: Number,
    required: true
  },
  /** 시나리오 정보 */
  scenario: {
    type: Object,
    default: null
  },
  /** 선택 여부 */
  isSelected: {
    type: Boolean,
    default: false
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
  },
  /** 번역 로딩 상태 */
  translationLoading: {
    type: Boolean,
    default: false
  },
  /** 힌트 로딩 상태 */
  hintLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits([
  'messageClick',
  'playMessage',
  'stopMessage',
  'toggleTranslation',
  'toggleHint'
])

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
