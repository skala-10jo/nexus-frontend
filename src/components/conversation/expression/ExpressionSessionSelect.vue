<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div class="flex items-center gap-2 mb-6">
      <span class="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-sm">3</span>
      <h2 class="text-lg font-semibold text-gray-900">학습 세션 선택</h2>
    </div>

    <p class="text-gray-600 mb-6">
      이 챕터에는 총 <strong>{{ totalExpressions }}</strong>개의 표현이 있습니다.
      학습 효율을 위해 <strong>{{ sessions.length }}개의 세션</strong>으로 나누어 학습합니다.
    </p>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button
        v-for="(session, idx) in sessions"
        :key="idx"
        @click="$emit('start-session', idx)"
        class="p-5 rounded-xl border-2 transition-all duration-200 text-left"
        :class="session.completed
          ? 'bg-green-50 border-green-500'
          : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm'"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex items-center gap-2">
            <span
              class="flex items-center justify-center w-10 h-10 rounded-full font-bold"
              :class="session.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'"
            >
              <CheckIcon v-if="session.completed" class="w-6 h-6" />
              <span v-else>{{ idx + 1 }}</span>
            </span>
            <div>
              <h3 class="font-semibold text-gray-900">세션 {{ idx + 1 }}</h3>
              <p class="text-sm text-gray-500">{{ session.expressions.length }}개 표현</p>
            </div>
          </div>
        </div>

        <div class="space-y-1">
          <p class="text-xs text-gray-500 truncate" v-for="(expr, exprIdx) in session.expressions.slice(0, 3)" :key="exprIdx">
            • {{ expr.expression }}
          </p>
          <p v-if="session.expressions.length > 3" class="text-xs text-gray-400">
            ... 외 {{ session.expressions.length - 3 }}개
          </p>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-100">
          <span
            class="text-sm font-medium"
            :class="session.completed ? 'text-green-600' : 'text-gray-700'"
          >
            {{ session.completed ? '완료됨' : '학습하기 →' }}
          </span>
        </div>
      </button>
    </div>

    <!-- Chapter Complete Check -->
    <div v-if="allSessionsCompleted" class="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
      <div class="flex items-center gap-3">
        <CheckCircleIcon class="w-8 h-8 text-green-500" />
        <div>
          <h4 class="font-semibold text-green-800">챕터 학습 완료!</h4>
          <p class="text-sm text-green-600">모든 세션을 완료했습니다. 다른 챕터를 선택하거나 복습할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { CheckIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  sessions: {
    type: Array,
    required: true
  },
  totalExpressions: {
    type: Number,
    required: true
  },
  allSessionsCompleted: {
    type: Boolean,
    default: false
  }
})

defineEmits(['start-session'])
</script>
