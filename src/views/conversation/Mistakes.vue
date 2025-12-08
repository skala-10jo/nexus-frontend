<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">오답노트</h1>
          <p class="text-sm text-gray-500 font-medium mt-0.5">학습 중 틀린 내용과 피드백을 복습해보세요</p>
        </div>

        <!-- Header Actions (Dynamic based on active tab) -->
        <div v-if="activeTab === 'biz' && bizMistakesRef" class="flex items-center gap-2">
          <template v-if="bizMistakesRef.viewMode === 'list' && bizMistakesRef.mistakes?.length > 0">
            <button @click="bizMistakesRef.confirmClearAll"
              class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium">
              Clear All
            </button>
          </template>
          <button v-else-if="bizMistakesRef.viewMode === 'quiz'" @click="bizMistakesRef.viewMode = 'list'"
            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
            Exit Quiz
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-8 px-8 border-b border-gray-100 bg-white">
      <button @click="activeTab = 'feedback'" class="pb-4 pt-2 text-sm font-medium transition-colors relative"
        :class="activeTab === 'feedback' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'">
        회화 피드백 노트
        <div v-if="activeTab === 'feedback'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full">
        </div>
      </button>
      <button @click="activeTab = 'biz'" class="pb-4 pt-2 text-sm font-medium transition-colors relative"
        :class="activeTab === 'biz' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'">
        Biz 표현 오답노트
        <div v-if="activeTab === 'biz'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full"></div>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-hidden relative">
      <KeepAlive>
        <component :is="activeComponent" ref="activeComponentRef" />
      </KeepAlive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConversationFeedbackMistakes from '@/components/conversation/mistakes/ConversationFeedbackMistakes.vue'
import BizExpressionMistakes from '@/components/conversation/mistakes/BizExpressionMistakes.vue'

const activeTab = ref('feedback')
const bizMistakesRef = ref(null)

const activeComponent = computed(() => {
  switch (activeTab.value) {
    case 'feedback':
      return ConversationFeedbackMistakes
    case 'biz':
      return BizExpressionMistakes
    default:
      return ConversationFeedbackMistakes
  }
})

const activeComponentRef = computed({
  get: () => {
    if (activeTab.value === 'biz') return bizMistakesRef.value
    return null
  },
  set: (val) => {
    if (activeTab.value === 'biz') bizMistakesRef.value = val
  }
})
</script>
