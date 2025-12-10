<template>
  <div class="bg-white rounded-xl md:rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6">
    <div class="flex items-center justify-between mb-3 md:mb-4">
      <h2 class="text-base md:text-lg font-semibold text-gray-900">Practice Quiz</h2>
      <span class="text-sm text-gray-500">{{ currentIndex + 1 }} / {{ totalCount }}</span>
    </div>

    <div v-if="mistake">
      <!-- Question -->
      <div class="bg-gray-50 rounded-lg md:rounded-xl p-4 md:p-6 mb-3 md:mb-4">
        <p class="text-xs md:text-sm text-gray-600 mb-1 md:mb-2">Fill in the blank:</p>
        <p class="text-base md:text-lg font-medium text-gray-900" v-html="questionHtml"></p>
        <p class="text-sm md:text-base text-gray-600 mt-2">{{ mistake.exampleTranslation }}</p>
      </div>

      <!-- Hint -->
      <div class="mb-3 md:mb-4">
        <button
          @click="$emit('toggle-hint')"
          class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <LightBulbIcon class="w-4 h-4" />
          {{ showHint ? 'Hide hint' : 'Show hint' }}
        </button>
        <p v-if="showHint" class="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
          Meaning: {{ formatMeaning(mistake.meaning) }}
        </p>
      </div>

      <!-- Answer Input -->
      <div class="mb-3 md:mb-4">
        <input
          :value="userAnswer"
          @input="$emit('update:userAnswer', $event.target.value)"
          @keyup.enter="$emit('check-answer')"
          type="text"
          placeholder="Type your answer"
          class="w-full px-3 md:px-4 py-2.5 md:py-3 border-2 rounded-lg md:rounded-xl focus:outline-none focus:border-black text-base md:text-lg"
          :class="{
            'border-green-500 bg-green-50': answerStatus === 'correct',
            'border-red-500 bg-red-50': answerStatus === 'wrong',
            'border-gray-200': answerStatus === null
          }"
          :disabled="answerStatus !== null"
        />
      </div>

      <!-- Feedback -->
      <div v-if="answerStatus === 'correct'" class="mb-3 md:mb-4 p-3 md:p-4 bg-green-100 rounded-lg md:rounded-xl">
        <p class="text-green-700 font-semibold flex items-center gap-2 text-sm md:text-base">
          <CheckCircleIcon class="w-5 h-5 flex-shrink-0" />
          Correct!
        </p>
      </div>
      <div v-else-if="answerStatus === 'wrong'" class="mb-3 md:mb-4 p-3 md:p-4 bg-red-100 rounded-lg md:rounded-xl">
        <p class="text-red-700 font-semibold flex items-center gap-2 text-sm md:text-base">
          <XCircleIcon class="w-5 h-5 flex-shrink-0" />
          <span>Wrong. Answer: <span class="font-bold">{{ mistake.expression }}</span></span>
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 md:gap-3">
        <button
          v-if="answerStatus === null"
          @click="$emit('check-answer')"
          :disabled="!userAnswer.trim()"
          class="flex-1 py-2.5 md:py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 text-sm md:text-base font-medium"
        >
          Check Answer
        </button>
        <button
          v-else-if="!isLastQuestion"
          @click="$emit('next-question')"
          class="flex-1 py-2.5 md:py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition text-sm md:text-base font-medium"
        >
          Next Question
        </button>
        <button
          v-else
          @click="$emit('finish-quiz')"
          class="flex-1 py-2.5 md:py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition text-sm md:text-base font-medium"
        >
          Finish Quiz
        </button>
      </div>
    </div>

    <!-- Quiz Progress -->
    <div class="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
      <div class="flex justify-between text-xs md:text-sm text-gray-600 mb-2">
        <span>Progress</span>
        <span>{{ correctCount }} / {{ totalCount }} correct</span>
      </div>
      <div class="w-full h-1.5 md:h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-black rounded-full transition-all duration-300"
          :style="{ width: `${(currentIndex / totalCount) * 100}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

defineProps({
  mistake: {
    type: Object,
    default: null
  },
  questionHtml: {
    type: String,
    default: ''
  },
  currentIndex: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  correctCount: {
    type: Number,
    required: true
  },
  userAnswer: {
    type: String,
    default: ''
  },
  answerStatus: {
    type: String,
    default: null
  },
  showHint: {
    type: Boolean,
    default: false
  },
  isLastQuestion: {
    type: Boolean,
    default: false
  },
  formatMeaning: {
    type: Function,
    required: true
  }
})

defineEmits(['update:userAnswer', 'check-answer', 'next-question', 'finish-quiz', 'toggle-hint'])
</script>
