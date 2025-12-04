<script setup>
/**
 * 일정 페이지 헤더 컴포넌트
 * @description 페이지 제목과 일정 추가 버튼을 표시
 */
import { PlusIcon } from '@heroicons/vue/24/outline'

defineProps({
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  /** 일정 추가 버튼 클릭 */
  'create'
])
</script>

<template>
  <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">프로젝트 · 일정 관리</h1>
        <p class="text-sm text-gray-500 font-medium mt-0.5">
          프로젝트 타임라인을 관리하고 추적하세요
        </p>
      </div>
      <button
        :disabled="loading"
        class="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="emit('create')"
      >
        <PlusIcon class="w-5 h-5" />
        일정 추가
      </button>
    </div>
  </div>
</template>
