<template>
  <div class="mb-8">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <DocumentTextIcon class="w-8 h-8 text-orange-primary" />
          <h1 class="text-3xl font-bold text-gray-900">문서 관리</h1>
        </div>
        <p class="text-gray-600 text-sm">모든 문서를 한 곳에서 관리하세요</p>
      </div>

      <!-- Stats Cards -->
      <div class="flex gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px]">
          <div class="flex items-center gap-2 mb-1">
            <FolderIcon class="w-5 h-5 text-gray-400" />
            <p class="text-xs text-gray-500 font-medium">총 문서</p>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ totalCount }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px]">
          <div class="flex items-center gap-2 mb-1">
            <CircleStackIcon class="w-5 h-5 text-gray-400" />
            <p class="text-xs text-gray-500 font-medium">총 용량</p>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatTotalSize }}</p>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4 min-w-[140px]">
          <div class="flex items-center gap-2 mb-1">
            <ClockIcon class="w-5 h-5 text-gray-400" />
            <p class="text-xs text-gray-500 font-medium">최근 업로드</p>
          </div>
          <p class="text-sm font-semibold text-gray-900">{{ formatRecentUpload }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {
  DocumentTextIcon,
  FolderIcon,
  CircleStackIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  totalSize: {
    type: Number,
    default: 0
  },
  recentUpload: {
    type: String,
    default: null
  }
});

const formatTotalSize = computed(() => {
  const bytes = props.totalSize;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
});

const formatRecentUpload = computed(() => {
  if (!props.recentUpload) return '없음';

  const date = new Date(props.recentUpload);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
});
</script>
