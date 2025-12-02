<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircleIcon class="w-12 h-12 text-green-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">세션 {{ sessionIndex + 1 }} 완료!</h3>
      <p class="text-gray-600 mb-4">
        {{ expressionCount }}개 표현 학습을 완료했습니다.
      </p>
      <div class="bg-gray-50 rounded-xl p-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">퀴즈 점수</p>
            <p class="text-2xl font-bold text-gray-900">{{ correctCount }} / {{ totalCount }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">정답률</p>
            <p class="text-2xl font-bold text-green-600">{{ Math.round((correctCount / totalCount) * 100) }}%</p>
          </div>
        </div>
      </div>

      <!-- Next Session or Back -->
      <div class="space-y-3">
        <button
          v-if="hasNextSession"
          @click="$emit('next-session')"
          class="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          다음 세션으로 (세션 {{ sessionIndex + 2 }})
        </button>
        <button
          @click="$emit('back-to-session-select')"
          class="w-full py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
        >
          세션 선택으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  sessionIndex: {
    type: Number,
    required: true
  },
  expressionCount: {
    type: Number,
    required: true
  },
  correctCount: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  },
  hasNextSession: {
    type: Boolean,
    default: false
  }
})

defineEmits(['next-session', 'back-to-session-select'])
</script>
