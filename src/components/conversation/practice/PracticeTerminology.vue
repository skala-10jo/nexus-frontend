<script setup>
/**
 * Practice 필수 용어 컴포넌트
 *
 * 필수 용어 목록과 탐지 상태를 표시합니다.
 */
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

defineProps({
  /** 필수 용어 목록 */
  requiredTerms: {
    type: Array,
    default: () => []
  },
  /** 탐지된 용어 목록 */
  detectedTerms: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <div class="bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-10 shrink-0">
    <div class="flex items-center justify-between gap-4">
      <!-- 필수 용어 영역 -->
      <div class="flex items-center gap-3 flex-wrap flex-1 min-w-0">
        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <CheckCircleIcon class="w-4 h-4 text-blue-500" />
          필수 용어
        </h3>
        <div class="flex flex-wrap gap-2 items-center">
          <span
            v-for="term in requiredTerms"
            :key="term"
            class="px-2.5 py-1 rounded-lg text-sm font-bold border transition-all duration-300 flex items-center gap-1"
            :class="[
              detectedTerms.includes(term)
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-gray-50 text-gray-500 border-gray-200'
            ]"
          >
            {{ term }}
            <CheckCircleIcon
              v-if="detectedTerms.includes(term)"
              class="w-3.5 h-3.5 text-white"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
