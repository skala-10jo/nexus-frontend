<template>
  <!-- Mobile: account for bottom nav (4rem) -->
  <div class="h-[calc(100vh-4rem)] md:h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="flex-shrink-0 px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div class="min-w-0 flex-1">
          <h1 class="text-xl md:text-2xl font-bold text-gray-900">오답노트</h1>
          <p class="hidden md:block text-sm text-gray-500 font-medium mt-0.5">틀린 표현을 복습하고 완벽하게 내 것으로 만드세요!</p>
        </div>

        <!-- Header Actions -->
        <div v-if="bizMistakesRef" class="flex items-center gap-2 flex-shrink-0">
          <template v-if="bizMistakesRef.viewMode === 'list' && bizMistakesRef.mistakes?.length > 0">
            <button @click="bizMistakesRef.confirmClearAll"
              class="px-3 md:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-xs md:text-sm font-medium">
              <span class="hidden sm:inline">Clear All</span>
              <span class="sm:hidden">전체삭제</span>
            </button>
          </template>
          <button v-else-if="bizMistakesRef.viewMode === 'quiz'" @click="bizMistakesRef.viewMode = 'list'"
            class="px-3 md:px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-xs md:text-sm font-medium">
            <span class="hidden sm:inline">Exit Quiz</span>
            <span class="sm:hidden">나가기</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden relative">
      <BizExpressionMistakes ref="bizMistakesRef" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BizExpressionMistakes from '@/components/conversation/mistakes/BizExpressionMistakes.vue'

const bizMistakesRef = ref(null)
</script>
