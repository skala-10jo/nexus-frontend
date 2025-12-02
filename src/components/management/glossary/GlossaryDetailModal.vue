<script setup>
/**
 * 용어사전 용어 상세 모달 컴포넌트
 * @description 용어 상세 정보 표시
 */
import { XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'

defineProps({
  /** 모달 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 선택된 용어 */
  term: {
    type: Object,
    default: null
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
  /** 모달 닫기 */
  'close',
  /** 수정 */
  'edit'
])
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show && term"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div>
            <h3 class="text-xl font-bold text-gray-900">{{ term.koreanTerm }}</h3>
            <p class="text-sm text-gray-500 font-medium mt-0.5">{{ term.englishTerm }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
              :class="getStatusBadgeClass(term.status)"
            >
              {{ getStatusLabel(term.status) }}
            </span>
            <button
              @click="emit('close')"
              class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-6">
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">베트남어</p>
              <p class="text-base font-medium text-gray-900">{{ term.vietnameseTerm || '-' }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">약어</p>
              <p class="text-base font-medium text-gray-900">{{ term.abbreviation || '-' }}</p>
            </div>
          </div>

          <div v-if="term.definition">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">정의</p>
            <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              {{ term.definition }}
            </p>
          </div>

          <div v-if="term.context">
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">문맥</p>
            <p class="text-sm text-gray-600 italic">"{{ term.context }}"</p>
          </div>

          <div class="flex items-center justify-between pt-4 border-t border-gray-100">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase">검증:</span>
              <span v-if="term.isVerified" class="text-green-600 font-bold text-xs flex items-center gap-1">
                <CheckCircleIcon class="w-3.5 h-3.5" /> 검증됨
              </span>
              <span v-else class="text-gray-400 font-bold text-xs">미검증</span>
            </div>

            <button
              @click="emit('edit')"
              class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
