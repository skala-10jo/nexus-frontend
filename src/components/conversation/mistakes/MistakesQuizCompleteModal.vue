<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircleIcon class="w-12 h-12 text-green-500" />
      </div>
      <h3 class="text-xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
      <p class="text-gray-600 mb-4">
        You reviewed {{ totalCount }} expressions.
      </p>
      <div class="bg-gray-50 rounded-xl p-4 mb-6">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Score</p>
            <p class="text-2xl font-bold text-gray-900">{{ correctCount }} / {{ totalCount }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Accuracy</p>
            <p class="text-2xl font-bold text-green-600">{{ Math.round((correctCount / totalCount) * 100) }}%</p>
          </div>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
      >
        Done
      </button>
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
  correctCount: {
    type: Number,
    required: true
  },
  totalCount: {
    type: Number,
    required: true
  }
})

defineEmits(['close'])
</script>
