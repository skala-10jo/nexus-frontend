<script setup>
/**
 * 용어사전 페이지네이션 컴포넌트
 * @description 페이지 이동 및 현재 위치 표시
 */
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

defineProps({
  /** 현재 페이지 (0부터 시작) */
  currentPage: {
    type: Number,
    required: true
  },
  /** 전체 페이지 수 */
  totalPages: {
    type: Number,
    required: true
  },
  /** 전체 요소 수 */
  totalElements: {
    type: Number,
    required: true
  },
  /** 페이지 크기 */
  pageSize: {
    type: Number,
    required: true
  },
  /** 표시할 페이지 목록 */
  displayedPages: {
    type: Array,
    required: true
  }
})

const emit = defineEmits([
  /** 페이지 이동 */
  'go-to-page'
])
</script>

<template>
  <div
    v-if="totalPages > 1"
    class="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-white flex items-center justify-between"
  >
    <p class="text-[10px] text-gray-500">
      전체 <span class="font-bold text-gray-700">{{ totalElements }}</span>개 중
      <span class="font-bold text-gray-700">{{ Math.min((currentPage + 1) * pageSize, totalElements) }}</span>개
    </p>
    <div class="flex items-center gap-1">
      <!-- Previous Button -->
      <button
        @click="emit('go-to-page', currentPage - 1)"
        :disabled="currentPage === 0"
        class="p-1 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
      >
        <ChevronLeftIcon class="w-4 h-4" />
      </button>

      <!-- Page Numbers -->
      <template v-for="page in displayedPages" :key="page">
        <button
          v-if="page !== '...'"
          @click="emit('go-to-page', page)"
          class="w-6 h-6 rounded text-[10px] font-bold transition-all"
          :class="currentPage === page ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'"
        >
          {{ page + 1 }}
        </button>
        <span v-else class="text-gray-400 text-[10px]">...</span>
      </template>

      <!-- Next Button -->
      <button
        @click="emit('go-to-page', currentPage + 1)"
        :disabled="currentPage >= totalPages - 1"
        class="p-1 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
      >
        <ChevronRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
