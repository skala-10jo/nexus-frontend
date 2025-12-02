<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">빈칸 채우기 퀴즈</h2>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">{{ currentIndex + 1 }} / {{ totalCount }}</span>
      </div>
    </div>

    <!-- Quiz Question -->
    <div v-if="question" class="mb-6">
      <div class="bg-gray-50 rounded-xl p-6 mb-4">
        <p class="text-sm text-gray-600 mb-2">다음 빈칸에 들어갈 표현을 입력하세요:</p>
        <p class="text-lg font-medium text-gray-900" v-html="question.questionHtml"></p>
        <p class="text-gray-600 mt-2">{{ question.translation }}</p>
      </div>

      <!-- Hint -->
      <div class="mb-4">
        <button
          @click="$emit('toggle-hint')"
          class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <LightBulbIcon class="w-4 h-4" />
          {{ showHint ? '힌트 숨기기' : '힌트 보기' }}
        </button>
        <p v-if="showHint" class="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
          의미: {{ question.meaning }}
        </p>
      </div>

      <!-- Answer Input -->
      <div class="mb-4">
        <input
          :value="userAnswer"
          @input="$emit('update:userAnswer', $event.target.value)"
          @keyup.enter="$emit('check-answer')"
          type="text"
          placeholder="정답을 입력하세요"
          class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black text-lg"
          :class="{
            'border-green-500 bg-green-50': answerStatus === 'correct',
            'border-red-500 bg-red-50': answerStatus === 'wrong',
            'border-gray-200': answerStatus === null
          }"
          :disabled="answerStatus !== null"
        />
      </div>

      <!-- Answer Feedback -->
      <div v-if="answerStatus === 'correct'" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
        <CheckCircleIcon class="w-5 h-5 text-green-600" />
        <span class="text-green-800 font-medium">정답입니다!</span>
      </div>
      <div v-else-if="answerStatus === 'wrong'" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center gap-2 mb-1">
          <XCircleIcon class="w-5 h-5 text-red-600" />
          <span class="text-red-800 font-medium">오답입니다</span>
        </div>
        <p class="text-red-700 text-sm">정답: {{ question.answer }}</p>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button
          v-if="answerStatus === null"
          @click="$emit('check-answer')"
          :disabled="!userAnswer.trim()"
          class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          정답 확인
        </button>
        <button
          v-else-if="!isLastQuestion"
          @click="$emit('next-quiz')"
          class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          다음 문제
        </button>
        <button
          v-else
          @click="$emit('complete-session')"
          class="flex-1 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
        >
          <CheckIcon class="w-5 h-5" />
          세션 완료
        </button>
      </div>
    </div>

    <!-- Quiz Progress -->
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="flex justify-between text-sm text-gray-600 mb-2">
        <span>퀴즈 진행률</span>
        <span>{{ correctCount }} / {{ totalCount }} 정답</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

defineProps({
  question: {
    type: Object,
    default: null
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
  }
})

defineEmits(['update:userAnswer', 'check-answer', 'next-quiz', 'complete-session', 'toggle-hint'])
</script>
