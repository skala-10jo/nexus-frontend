<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
    <!-- Expression Summary with Navigation -->
    <div class="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
      <div class="flex items-center justify-between gap-4">
        <!-- Expression Content (Left) -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <h2 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {{ expression.expression }}
            </h2>
            <button
              @click="$emit('play-tts', expression.expression)"
              :disabled="ttsLoading"
              class="flex-shrink-0 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
              title="표현 발음 듣기"
            >
              <SpeakerWaveIcon class="w-4 h-4" />
            </button>
            <span
              v-if="practiceCompleted"
              class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"
            >
              <CheckIcon class="w-3 h-3" />
            </span>
          </div>
          <p class="text-gray-600 text-sm font-medium">
            {{ formatMeaning(expression.meaning) }}
          </p>
        </div>

        <!-- Navigation (Right) -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="text-sm text-gray-500">{{ currentIndex + 1 }} / {{ totalCount }}</span>
          <button
            @click="$emit('prev')"
            :disabled="currentIndex === 0"
            class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <button
            @click="$emit('next')"
            :disabled="currentIndex === totalCount - 1"
            class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Example Sentences -->
    <div v-if="expression.examples && expression.examples.length > 0">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">예문 연습</h3>
      <div class="space-y-3">
        <div
          v-for="(example, idx) in expression.examples"
          :key="idx"
          class="bg-gray-50 rounded-xl p-4 border border-gray-200"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <p class="text-base font-medium text-gray-900 mb-1" v-html="highlightExpression(example.text, expression.expression)"></p>
              <p class="text-gray-600 text-base">{{ example.translation }}</p>
            </div>
            <div class="flex gap-2 flex-shrink-0">
              <button
                @click="$emit('play-tts', example.text)"
                :disabled="ttsLoading"
                class="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                title="발음 듣기"
              >
                <SpeakerWaveIcon class="w-4 h-4" />
              </button>
              <button
                @click="$emit('start-practice', 'example', idx)"
                :disabled="isRecording"
                class="p-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                title="Biz 표현 학습"
              >
                <MicrophoneIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Progress hint -->
    <div v-if="!allPracticeCompleted" class="mt-4 pt-4 border-t border-gray-100">
      <p class="text-center text-gray-400 text-xs">
        모든 표현의 발음 연습을 완료하면 퀴즈로 넘어갈 수 있습니다
      </p>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

defineProps({
  expression: {
    type: Object,
    required: true
  },
  currentIndex: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  practiceCompleted: {
    type: Boolean,
    default: false
  },
  allPracticeCompleted: {
    type: Boolean,
    default: false
  },
  ttsLoading: {
    type: Boolean,
    default: false
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  formatMeaning: {
    type: Function,
    required: true
  },
  highlightExpression: {
    type: Function,
    required: true
  }
})

defineEmits(['play-tts', 'start-practice', 'prev', 'next'])
</script>
