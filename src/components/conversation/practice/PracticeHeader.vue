<script setup>
/**
 * Practice 헤더 컴포넌트
 *
 * 시나리오 정보, 역할 표시 및 액션 버튼을 담당합니다.
 */
import { ArrowPathIcon } from '@heroicons/vue/24/outline'

defineProps({
  /** 시나리오 정보 */
  scenario: {
    type: Object,
    default: null
  },
  /** 로딩 상태 */
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['reset', 'end'])
</script>

<template>
  <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-4 min-w-0 flex-1 mr-2">
      <div class="min-w-0">
        <h1 class="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 truncate">
          <span class="truncate">{{ scenario?.title || '회화 연습' }}</span>
          <span
            v-if="scenario?.category"
            class="shrink-0 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
          >
            {{ scenario.category }}
          </span>
        </h1>
        <p class="text-sm text-gray-500 mt-0.5 hidden md:block truncate">
          {{ scenario?.description }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 md:gap-3 shrink-0">
      <!-- Role Info -->
      <div
        v-if="scenario"
        class="hidden md:flex items-center gap-4 text-sm text-gray-600 mr-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100"
      >
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">나의 역할:</span>
          <span>{{ scenario.roles?.user || 'User' }}</span>
        </div>
        <div class="w-px h-4 bg-gray-300"></div>
        <div class="flex items-center gap-2">
          <span class="font-semibold text-gray-900">상대 역할:</span>
          <span>{{ scenario.roles?.ai || 'AI' }}</span>
        </div>
      </div>

      <!-- Reset Button -->
      <button
        @click="emit('reset')"
        :disabled="isLoading"
        class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="대화 초기화"
      >
        <ArrowPathIcon class="w-5 h-5" />
      </button>

      <!-- End Button -->
      <button
        @click="emit('end')"
        class="px-3 py-1.5 md:px-4 md:py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
      >
        종료
      </button>
    </div>
  </header>
</template>
