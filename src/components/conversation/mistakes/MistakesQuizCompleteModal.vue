<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl md:rounded-2xl p-6 md:p-8 max-w-md w-full shadow-xl text-center mx-4">
      <div class="w-16 h-16 md:w-20 md:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
        <CheckCircleIcon class="w-10 h-10 md:w-12 md:h-12 text-green-500" />
      </div>
      <h3 class="text-lg md:text-xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
      <p class="text-sm md:text-base text-gray-600 mb-3 md:mb-4">
        You reviewed {{ totalCount }} expressions.
      </p>
      <div class="bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 mb-5 md:mb-6">
        <div class="grid grid-cols-2 gap-3 md:gap-4">
          <div>
            <p class="text-xs md:text-sm text-gray-500">Score</p>
            <p class="text-xl md:text-2xl font-bold text-gray-900">{{ correctCount }} / {{ totalCount }}</p>
          </div>
          <div>
            <p class="text-xs md:text-sm text-gray-500">Accuracy</p>
            <p class="text-xl md:text-2xl font-bold text-green-600">{{ Math.round((correctCount / totalCount) * 100) }}%</p>
          </div>
        </div>
      </div>
      <button
        @click="$emit('close')"
        class="w-full py-2.5 md:py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition text-sm md:text-base font-medium"
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
