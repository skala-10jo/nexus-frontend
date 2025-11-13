<template>
  <div class="sticky top-0 z-10 bg-gray-50 pt-4 pb-4 -mx-4 px-4">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col lg:flex-row gap-4">
        <!-- Left Section: Search and Filters -->
        <div class="flex-1 flex flex-col sm:flex-row gap-3">
          <!-- Search -->
          <div class="relative flex-1 min-w-0">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              :value="search"
              @input="$emit('update:search', $event.target.value)"
              type="search"
              placeholder="파일명으로 검색..."
              class="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all"
            />
            <button
              v-if="search"
              @click="$emit('update:search', '')"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- File Type Filter -->
          <select
            :value="fileType"
            @change="$emit('update:fileType', $event.target.value)"
            class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all cursor-pointer bg-white"
          >
            <option value="">모든 타입</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="txt">TXT</option>
          </select>

          <!-- Status Filter -->
          <select
            :value="status"
            @change="$emit('update:status', $event.target.value)"
            class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all cursor-pointer bg-white"
          >
            <option value="">모든 상태</option>
            <option value="UPLOADED">업로드됨</option>
            <option value="PROCESSING">분석 중</option>
            <option value="PROCESSED">처리 완료</option>
            <option value="FAILED">오류</option>
          </select>

          <!-- Sort -->
          <select
            :value="sort"
            @change="$emit('update:sort', $event.target.value)"
            class="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all cursor-pointer bg-white"
          >
            <option value="uploadDate:desc">최신순</option>
            <option value="uploadDate:asc">오래된순</option>
            <option value="filename:asc">이름순 (A-Z)</option>
            <option value="filename:desc">이름순 (Z-A)</option>
            <option value="fileSize:desc">크기 (큰 순)</option>
            <option value="fileSize:asc">크기 (작은 순)</option>
          </select>
        </div>

        <!-- Right Section: View Toggle and Actions -->
        <div class="flex items-center gap-2">
          <!-- Result Count -->
          <span class="text-sm text-gray-600 mr-2 whitespace-nowrap">
            {{ totalCount }}개
          </span>

          <!-- View Toggle -->
          <div class="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              @click="$emit('update:view', 'grid')"
              :class="[
                'p-2 rounded-md transition-all',
                view === 'grid'
                  ? 'bg-white text-orange-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
              title="그리드 뷰"
            >
              <Squares2X2Icon class="w-5 h-5" />
            </button>
            <button
              @click="$emit('update:view', 'list')"
              :class="[
                'p-2 rounded-md transition-all',
                view === 'list'
                  ? 'bg-white text-orange-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              ]"
              title="리스트 뷰"
            >
              <Bars3Icon class="w-5 h-5" />
            </button>
          </div>

          <!-- Refresh Button -->
          <button
            @click="$emit('refresh')"
            class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="새로고침"
          >
            <ArrowPathIcon class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  Squares2X2Icon,
  Bars3Icon,
  ArrowPathIcon
} from '@heroicons/vue/20/solid';

defineProps({
  search: {
    type: String,
    default: ''
  },
  fileType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  sort: {
    type: String,
    default: 'uploadDate:desc'
  },
  view: {
    type: String,
    default: 'grid'
  },
  totalCount: {
    type: Number,
    default: 0
  }
});

defineEmits([
  'update:search',
  'update:fileType',
  'update:status',
  'update:sort',
  'update:view',
  'refresh'
]);
</script>
