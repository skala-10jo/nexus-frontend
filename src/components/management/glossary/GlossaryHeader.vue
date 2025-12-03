<script setup>
/**
 * 용어사전 페이지 헤더 컴포넌트
 * @description 제목, 부제목, 용어 추가 버튼
 */
import { PlusIcon } from '@heroicons/vue/24/solid'

defineProps({
  /** 선택된 용어 ID 목록 (현재 미사용, 향후 확장용) */
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  /** 용어 추가 클릭 */
  'add-term'
])
</script>

<template>
  <button
    @click="emit('add-term')"
    class="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
  >
    <PlusIcon class="w-5 h-5" />
    용어 추가
  </button>
</template>
