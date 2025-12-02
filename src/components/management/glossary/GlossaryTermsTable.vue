<script setup>
/**
 * 용어사전 용어 테이블 컴포넌트
 * @description 용어 목록 테이블, 체크박스 선택, 행 동작
 */
import {
  BookOpenIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/vue/24/solid'

defineProps({
  /** 용어 목록 */
  terms: {
    type: Array,
    required: true
  },
  /** 선택된 용어 ID 목록 */
  selectedIds: {
    type: Array,
    required: true
  },
  /** 전체 선택 여부 */
  isAllSelected: {
    type: Boolean,
    default: false
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 상태 라벨 헬퍼 함수 */
  getStatusLabel: {
    type: Function,
    required: true
  },
  /** 상태 배지 클래스 헬퍼 함수 */
  getStatusBadgeClass: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  /** 용어 클릭 (상세 보기) */
  'click-term',
  /** 개별 선택 토글 */
  'toggle-select',
  /** 전체 선택 토글 */
  'toggle-select-all',
  /** 검증 */
  'verify',
  /** 검증 취소 */
  'unverify',
  /** 수정 */
  'edit',
  /** 삭제 */
  'delete',
  /** 용어 추가 */
  'add-term'
])
</script>

<template>
  <div class="flex-1 overflow-y-auto custom-scrollbar relative">
    <!-- Loading Overlay -->
    <div
      v-if="loading && terms.length === 0"
      class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-xs font-medium text-gray-500">불러오는 중...</p>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!loading && terms.length === 0"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <BookOpenIcon class="w-12 h-12 text-gray-200 mb-3" />
      <h3 class="text-sm font-bold text-gray-900 mb-1">용어가 없습니다</h3>
      <p class="text-xs text-gray-500 mb-4">새 용어를 추가하거나 문서에서 추출하세요</p>
      <button
        @click="emit('add-term')"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
      >
        용어 추가
      </button>
    </div>

    <!-- Data Table -->
    <table v-else class="w-full">
      <thead class="sticky top-0 z-10 bg-gray-50 shadow-sm">
        <tr class="border-b border-gray-100">
          <th class="px-4 py-2.5 text-left w-10">
            <input
              type="checkbox"
              :checked="isAllSelected"
              @change="emit('toggle-select-all')"
              class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-36">한국어</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-40">영어</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-40">베트남어</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">약어</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">상태</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">검증</th>
          <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-24">작업</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="term in terms"
          :key="term.id"
          class="group hover:bg-blue-50/30 transition-colors"
          :class="{ 'bg-blue-50/50': selectedIds.includes(term.id) }"
        >
          <td class="px-4 py-2">
            <input
              type="checkbox"
              :checked="selectedIds.includes(term.id)"
              @change="emit('toggle-select', term.id)"
              class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
          </td>
          <td class="px-4 py-2">
            <button
              @click="emit('click-term', term)"
              class="text-xs font-bold text-gray-900 hover:text-blue-600 text-left"
            >
              {{ term.koreanTerm }}
            </button>
          </td>
          <td class="px-4 py-2">
            <span class="text-xs text-gray-600">{{ term.englishTerm || '-' }}</span>
          </td>
          <td class="px-4 py-2">
            <span class="text-xs text-gray-600">{{ term.vietnameseTerm || '-' }}</span>
          </td>
          <td class="px-4 py-2">
            <span class="text-xs text-gray-500">{{ term.abbreviation || '-' }}</span>
          </td>
          <td class="px-4 py-2">
            <span
              class="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase"
              :class="getStatusBadgeClass(term.status)"
            >
              {{ getStatusLabel(term.status) }}
            </span>
          </td>
          <td class="px-4 py-2">
            <div v-if="term.isVerified" class="flex items-center gap-1 text-green-600">
              <CheckCircleIcon class="w-3.5 h-3.5" />
              <span class="text-[10px] font-bold">검증</span>
            </div>
            <div v-else class="flex items-center gap-1 text-gray-400">
              <div class="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>
              <span class="text-[10px] font-bold">미검증</span>
            </div>
          </td>
          <td class="px-4 py-2">
            <div class="flex items-center gap-0.5">
              <button
                v-if="!term.isVerified"
                @click="emit('verify', term)"
                class="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                title="검증"
              >
                <CheckIcon class="w-3.5 h-3.5" />
              </button>
              <button
                v-else
                @click="emit('unverify', term)"
                class="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                title="검증 취소"
              >
                <XMarkIcon class="w-3.5 h-3.5" />
              </button>
              <button
                @click="emit('edit', term)"
                class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="수정"
              >
                <PencilIcon class="w-3.5 h-3.5" />
              </button>
              <button
                @click="emit('delete', term)"
                class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="삭제"
              >
                <TrashIcon class="w-3.5 h-3.5" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
