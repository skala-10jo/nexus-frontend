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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col ring-1 ring-gray-900/5">
        <!-- Header -->
        <div class="px-8 py-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
          <div class="flex items-center gap-3">
            <h3 class="text-xl font-bold text-gray-900">용어 상세 정보</h3>
            <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-bold tracking-wide">
              {{ term.domain || '일반' }}
            </span>
          </div>
          <button
            @click="emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Content - Scrollable -->
        <div class="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-white">
          
          <!-- Primary Terms (Korean & English) -->
          <div class="grid grid-cols-2 gap-6">
            <div class="p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-colors group">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <p class="text-xs font-bold text-blue-600 uppercase tracking-wider">한국어 용어</p>
              </div>
              <p class="text-xl font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{{ term.koreanTerm }}</p>
            </div>
            
            <div class="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors group">
              <div class="flex items-center gap-2 mb-2">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <p class="text-xs font-bold text-gray-500 uppercase tracking-wider">영어 용어</p>
              </div>
              <p class="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{{ term.englishTerm || '-' }}</p>
            </div>
          </div>

          <!-- Translations Grid -->
          <div class="space-y-3">
            <h4 class="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">다국어 번역 및 약어</h4>
            <div class="grid grid-cols-4 gap-4">
              <!-- Vietnamese -->
              <div class="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">베트남어</p>
                <p class="text-sm font-semibold text-gray-800 break-words">{{ term.vietnameseTerm || '-' }}</p>
              </div>
              
              <!-- Japanese -->
              <div class="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">일본어</p>
                <p class="text-sm font-semibold text-gray-800 break-words">{{ term.japaneseTerm || '-' }}</p>
              </div>
              
              <!-- Chinese -->
              <div class="p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">중국어</p>
                <p class="text-sm font-semibold text-gray-800 break-words">{{ term.chineseTerm || '-' }}</p>
              </div>

              <!-- Abbreviation -->
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1.5">약어</p>
                <p class="text-sm font-bold text-gray-900">{{ term.abbreviation || '-' }}</p>
              </div>
            </div>
          </div>

          <hr class="border-gray-100" />

          <!-- Details Section -->
          <div class="grid grid-cols-1 gap-6">
            <!-- Definition -->
            <div v-if="term.definition" class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="p-1 bg-yellow-100 rounded text-yellow-600">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <h4 class="text-sm font-bold text-gray-900">정의</h4>
              </div>
              <div class="p-5 bg-yellow-50/50 rounded-xl border border-yellow-100 text-gray-800 text-sm leading-relaxed">
                {{ term.definition }}
              </div>
            </div>

            <!-- Context -->
            <div v-if="term.context" class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="p-1 bg-gray-100 rounded text-gray-500">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <h4 class="text-sm font-bold text-gray-900">문맥 / 사용 예시</h4>
              </div>
              <div class="p-5 bg-gray-50 rounded-xl border border-gray-100 text-gray-700 text-sm leading-relaxed">
                {{ term.context }}
              </div>
            </div>

            <!-- Example Sentence -->
            <div v-if="term.exampleSentence" class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="p-1 bg-purple-100 rounded text-purple-600">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </span>
                <h4 class="text-sm font-bold text-gray-900">예문</h4>
              </div>
              <div class="p-5 bg-purple-50/50 rounded-xl border border-purple-100 text-gray-800 text-sm leading-relaxed">
                {{ term.exampleSentence }}
              </div>
            </div>
            
            <!-- Note -->
            <div v-if="term.note" class="space-y-2">
              <h4 class="text-sm font-bold text-gray-900 px-1">비고</h4>
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 text-sm">
                {{ term.note }}
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between flex-shrink-0">
          <div class="flex items-center gap-4 text-xs text-gray-400 font-medium">
            <span>생성: {{ new Date(term.createdAt).toLocaleDateString('ko-KR') }}</span>
            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>수정: {{ new Date(term.updatedAt).toLocaleDateString('ko-KR') }}</span>
          </div>
          <button
            @click="emit('edit')"
            class="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-gray-900/20 flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            수정하기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
