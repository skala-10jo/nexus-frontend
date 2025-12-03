<script setup>
/**
 * 용어사전 문서 관리 섹션 컴포넌트
 * @description 문서 목록 표시, 업로드, 추출, 다운로드, 삭제 기능
 */
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  ChevronDownIcon,
  FolderOpenIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/solid'

defineProps({
  /** 문서 목록 */
  documents: {
    type: Array,
    required: true
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 섹션 접힘 상태 */
  collapsed: {
    type: Boolean,
    default: false
  },
  /** 선택된 문서 ID 목록 */
  selectedIds: {
    type: Array,
    default: () => []
  },
  /** 전체 선택 여부 */
  isAllSelected: {
    type: Boolean,
    default: false
  },
  /** 파일 아이콘 헬퍼 함수 */
  getFileIcon: {
    type: Function,
    required: true
  },
  /** 문서 상태 클래스 헬퍼 함수 */
  getDocStatusClass: {
    type: Function,
    required: true
  },
  /** 문서 상태 텍스트 헬퍼 함수 */
  getDocStatusText: {
    type: Function,
    required: true
  },
  /** 파일 크기 포맷 헬퍼 함수 */
  formatFileSize: {
    type: Function,
    required: true
  },
  /** 날짜 포맷 헬퍼 함수 */
  formatDate: {
    type: Function,
    required: true
  },
  /** 현재 페이지 (0-based) */
  currentPage: {
    type: Number,
    default: 0
  },
  /** 전체 페이지 수 */
  totalPages: {
    type: Number,
    default: 0
  },
  /** 페이지 크기 */
  pageSize: {
    type: Number,
    default: 5
  },
  /** 표시할 페이지 번호 목록 */
  displayedPages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  /** 섹션 토글 */
  'toggle',
  /** 업로드 클릭 */
  'upload',
  /** 용어 추출 */
  'extract',
  /** 다운로드 */
  'download',
  /** 삭제 */
  'delete',
  /** 페이지 변경 */
  'change-page',
  /** 페이지 크기 변경 */
  'change-size',
  /** 개별 선택 토글 */
  'toggle-select',
  /** 전체 선택 토글 */
  'toggle-select-all',
  /** 일괄 삭제 */
  'bulk-delete',
  /** 선택 문서 용어 추출 */
  'extract-selected'
])
</script>

<template>
  <div class="flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <!-- Section Header -->
    <div
      class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
      :class="{ 'border-b border-gray-100': !collapsed }"
      @click="emit('toggle')"
    >
      <div class="flex items-center gap-2">
        <DocumentTextIcon class="w-4 h-4 text-blue-500" />
        <h2 class="text-sm font-bold text-gray-900">문서 관리</h2>
        <span class="text-xs text-gray-400 font-medium">({{ documents.length }})</span>
      </div>
      <div class="flex items-center gap-3">
        <!-- Bulk Delete Button -->
        <button
          v-if="selectedIds.length > 0"
          @click.stop="emit('bulk-delete')"
          class="flex items-center gap-1.5 px-3 py-1 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
        >
          <span class="text-gray-900">{{ selectedIds.length }}개 선택</span>
          <TrashIcon class="w-4 h-4 text-red-600" />
          <span class="text-red-600">삭제</span>
        </button>

        <button
          @click.stop="emit('upload')"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-all"
        >
          <CloudArrowUpIcon class="w-3.5 h-3.5" />
          업로드
        </button>
        <ChevronDownIcon
          class="w-4 h-4 text-gray-400 transition-transform duration-200"
          :class="{ 'rotate-180': !collapsed }"
        />
      </div>
    </div>

    <!-- Document List (Collapsible) -->
    <Transition name="collapse">
      <div v-show="!collapsed">
        <!-- Loading State -->
        <div v-if="loading && documents.length === 0" class="flex items-center justify-center py-6">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p class="text-xs font-medium text-gray-500">불러오는 중...</p>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="documents.length === 0" class="flex items-center justify-center py-6 gap-3">
          <FolderOpenIcon class="w-5 h-5 text-gray-300" />
          <span class="text-sm text-gray-500">업로드된 문서가 없습니다</span>
          <button
            @click="emit('upload')"
            class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
          >
            업로드
          </button>
        </div>

        <!-- Document Table -->
        <div v-else>
          <div class="max-h-[320px] overflow-y-auto custom-scrollbar">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10">
                <tr class="text-left border-b border-gray-100">
                  <th class="px-4 py-2 w-10">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="emit('toggle-select-all')"
                      class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th class="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 35%">파일명</th>
                  <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">크기</th>
                  <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">날짜</th>
                  <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">상태</th>
                  <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 20%">작업</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <tr
                  v-for="doc in documents"
                  :key="doc.id"
                  class="group hover:bg-blue-50/30 transition-colors"
                  :class="{ 'bg-blue-50/50': selectedIds.includes(doc.id) }"
                >
                  <td class="px-4 py-1.5">
                    <input
                      type="checkbox"
                      :checked="selectedIds.includes(doc.id)"
                      @change="emit('toggle-select', doc.id)"
                      class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td class="px-4 py-1.5">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="text-base flex-shrink-0">{{ getFileIcon(doc.fileType) }}</span>
                      <span class="text-xs font-medium text-gray-900 truncate">
                        {{ doc.originalFilename }}
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-1.5">
                    <span class="text-xs text-gray-500">{{ formatFileSize(doc.fileSize) }}</span>
                  </td>
                  <td class="px-3 py-1.5">
                    <span class="text-xs text-gray-500">{{ formatDate(doc.uploadDate) }}</span>
                  </td>
                  <td class="px-3 py-1.5">
                    <span
                      class="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase"
                      :class="getDocStatusClass(doc.status)"
                    >
                      {{ getDocStatusText(doc.status) }}
                    </span>
                  </td>
                  <td class="px-3 py-1.5">
                    <div class="flex items-center gap-1">
                      <button
                        v-if="doc.status === 'PROCESSED'"
                        @click="emit('extract', doc)"
                        class="flex items-center gap-1 px-2 py-1 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded text-[10px] font-bold transition-colors"
                      >
                        <SparklesIcon class="w-3 h-3" />
                        용어 추출
                      </button>
                      <button
                        @click="emit('download', doc)"
                        class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        title="다운로드"
                      >
                        <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                      </button>
                      <button
                        @click="emit('delete', doc)"
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

          <!-- Pagination Footer -->
          <div class="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
            <!-- Page Size Selector -->
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-gray-500 font-medium">페이지당 보기:</span>
              <select
                :value="pageSize"
                @change="emit('change-size', Number($event.target.value))"
                class="bg-white border border-gray-200 text-gray-700 text-[10px] rounded px-1.5 py-0.5 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option :value="5">5개</option>
                <option :value="10">10개</option>
                <option :value="15">15개</option>
              </select>
            </div>

            <!-- Pagination Controls -->
            <div class="flex items-center gap-1">
              <button
                @click="emit('change-page', currentPage - 1)"
                :disabled="currentPage === 0"
                class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronDownIcon class="w-3 h-3 rotate-90 text-gray-500" />
              </button>
              
              <div class="flex items-center gap-0.5">
                <template v-for="page in displayedPages" :key="page">
                  <span
                    v-if="page === '...'"
                    class="px-1.5 text-[10px] text-gray-400"
                  >...</span>
                  <button
                    v-else
                    @click="emit('change-page', page)"
                    class="min-w-[20px] h-5 flex items-center justify-center text-[10px] rounded transition-colors font-medium"
                    :class="currentPage === page ? 'bg-black text-white font-bold' : 'text-gray-600 hover:bg-gray-100'"
                  >
                    {{ page + 1 }}
                  </button>
                </template>
              </div>

              <button
                @click="emit('change-page', currentPage + 1)"
                :disabled="currentPage >= totalPages - 1"
                class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronDownIcon class="w-3 h-3 -rotate-90 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.15s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
