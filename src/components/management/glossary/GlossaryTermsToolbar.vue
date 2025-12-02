<script setup>
/**
 * 용어사전 용어 툴바 컴포넌트
 * @description 문서 필터, 검색, 상태 필터, 검증 필터, 새로고침
 */
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/solid'

defineProps({
  /** 문서 목록 */
  documents: {
    type: Array,
    required: true
  },
  /** 선택된 문서 ID */
  selectedDocumentId: {
    type: String,
    default: ''
  },
  /** 검색어 */
  searchQuery: {
    type: String,
    default: ''
  },
  /** 상태 필터 */
  filterStatus: {
    type: String,
    default: ''
  },
  /** 검증 필터 */
  filterVerified: {
    type: String,
    default: ''
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  /** 문서 선택 변경 */
  'update:selectedDocumentId',
  /** 검색어 변경 */
  'update:searchQuery',
  /** 상태 필터 변경 */
  'update:filterStatus',
  /** 검증 필터 변경 */
  'update:filterVerified',
  /** 문서 변경 */
  'document-change',
  /** 검색 */
  'search',
  /** 새로고침 */
  'refresh'
])

const handleDocumentChange = (e) => {
  emit('update:selectedDocumentId', e.target.value)
  emit('document-change')
}

const handleSearch = (e) => {
  emit('update:searchQuery', e.target.value)
  emit('search')
}

const handleStatusChange = (e) => {
  emit('update:filterStatus', e.target.value)
}

const handleVerifiedChange = (e) => {
  emit('update:filterVerified', e.target.value)
}
</script>

<template>
  <div class="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-white">
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <!-- Document Filter -->
      <div class="relative w-56 flex-shrink-0">
        <select
          :value="selectedDocumentId"
          @change="handleDocumentChange"
          class="w-full appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-gray-100"
        >
          <option value="">전체 문서</option>
          <option v-for="doc in documents" :key="doc.id" :value="doc.id">
            {{ doc.originalFilename }}
          </option>
        </select>
        <ChevronDownIcon class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
      </div>

      <!-- Search -->
      <div class="relative flex-1 max-w-sm">
        <input
          :value="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="용어 검색..."
          class="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- Status Filter -->
      <div class="relative">
        <select
          :value="filterStatus"
          @change="handleStatusChange"
          class="appearance-none pl-3 pr-7 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
        >
          <option value="">전체 상태</option>
          <option value="AUTO_EXTRACTED">AI 추출</option>
          <option value="USER_ADDED">사용자 추가</option>
          <option value="USER_EDITED">사용자 수정</option>
        </select>
        <ChevronDownIcon class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>

      <!-- Verified Filter -->
      <div class="relative">
        <select
          :value="filterVerified"
          @change="handleVerifiedChange"
          class="appearance-none pl-3 pr-7 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
        >
          <option value="">전체 검증</option>
          <option value="true">검증됨</option>
          <option value="false">미검증</option>
        </select>
        <ChevronDownIcon class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
      </div>

      <!-- Refresh Button -->
      <button
        @click="emit('refresh')"
        class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
        title="새로고침"
      >
        <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
      </button>
    </div>
  </div>
</template>
