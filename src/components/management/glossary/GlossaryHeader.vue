<script setup>
/**
 * 용어사전 페이지 헤더 컴포넌트
 * @description 제목, 부제목, 선택 삭제, 용어 추가 버튼
 */
import { TrashIcon, PlusIcon } from '@heroicons/vue/24/solid'

defineProps({
  /** 선택된 용어 ID 목록 */
  selectedCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  /** 용어 추가 클릭 */
  'add-term',
  /** 일괄 삭제 클릭 */
  'bulk-delete'
])
</script>

<template>
  <div class="flex-shrink-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-3 border-b border-gray-100">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">전문용어사전</h1>
        <p class="text-sm text-gray-500 mt-1 font-medium">
          프로젝트 용어를 관리하고 자동으로 추출하세요
        </p>
      </div>
      <div class="flex gap-2 items-center">
        <!-- 선택된 항목 표시 및 일괄 삭제 -->
        <div
          v-if="selectedCount > 0"
          class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm"
        >
          <span class="text-xs font-bold text-gray-600">{{ selectedCount }} 선택</span>
          <button
            @click="emit('bulk-delete')"
            class="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1"
          >
            <TrashIcon class="w-3.5 h-3.5" />
            삭제
          </button>
        </div>

        <!-- 용어 추가 버튼 -->
        <button
          @click="emit('add-term')"
          class="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md"
        >
          <PlusIcon class="w-4 h-4" />
          용어 추가
        </button>
      </div>
    </div>
  </div>
</template>
