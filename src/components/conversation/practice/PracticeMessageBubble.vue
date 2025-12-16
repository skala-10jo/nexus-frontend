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

      <!-- Hint Display - 2-Level Progressive Hints (wordHints → fullSentence) -->
      <div
        v-if="message.speaker === 'ai' && message.showHint && message.hintData"
        class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 relative animate-fade-in-down"
      >
        <div class="absolute -top-1.5 left-20 w-3 h-3 bg-amber-50 border-t border-l border-amber-100 transform rotate-45"></div>

        <!-- Header with Level Indicator -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1 bg-amber-100 rounded-full text-amber-600">
              <LightBulbIcon class="w-3.5 h-3.5" />
            </div>
            <p class="text-[13px] font-bold text-amber-600 uppercase tracking-wider">이렇게 말해보세요!</p>
          </div>
          <!-- Level Indicator (2 dots for 2-level system) -->
          <div class="flex items-center gap-1">
            <span
              v-for="level in 2"
              :key="level"
              class="w-2 h-2 rounded-full transition-colors"
              :class="(message.hintLevel ?? 0) >= level - 1 ? 'bg-amber-500' : 'bg-amber-200'"
            />
          </div>
        </div>

        <!-- Level 0: Word Hints (핵심 단어) -->
        <div class="space-y-3">
          <!-- Word Hints Tags -->
          <div v-if="message.hintData.wordHints?.length" class="mb-3">
            <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">핵심 단어</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="(word, idx) in message.hintData.wordHints"
                :key="idx"
                class="text-sm bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium"
              >
                {{ word }}
              </span>
            </div>
          </div>

          <!-- Level 1: Full Sentence (전체 문장) -->
          <div v-if="(message.hintLevel ?? 0) >= 1 && message.hintData.fullSentence" class="pt-3 border-t border-amber-100">
            <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-2">예시 문장</p>
            <p class="text-sm text-gray-900 font-medium leading-relaxed bg-white/50 px-3 py-2 rounded-lg">
              "{{ message.hintData.fullSentence }}"
            </p>
            <!-- Explanation -->
            <p v-if="message.hintData.explanation" class="text-xs text-gray-500 mt-2 pl-1">
              {{ message.hintData.explanation }}
            </p>
          </div>

          <!-- More Hint Button (Level 0 → Level 1) -->
          <button
            v-if="(message.hintLevel ?? 0) < 1"
            @click.stop="$emit('increaseHintLevel', messageIndex)"
            class="w-full mt-2 text-xs font-medium text-amber-600 hover:text-amber-800 flex items-center justify-center gap-1 py-2 rounded-lg hover:bg-amber-100/50 transition-colors"
          >
            <ChevronDownIcon class="w-4 h-4" />
            전체 문장 보기
          </button>
        </div>

        <!-- Step Info (optional) -->
        <div v-if="message.hintData.stepInfo" class="mt-3 pt-3 border-t border-amber-100">
          <p class="text-[10px] text-gray-400">
            Step: {{ message.hintData.stepInfo.title || message.hintData.stepInfo.name }}
          </p>
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
  ChartBarIcon,
  ChevronDownIcon
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
  'toggleHint',
  'increaseHintLevel'
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
