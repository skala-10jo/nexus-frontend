<template>
  <div
    class="bg-white rounded-xl border border-gray-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer overflow-hidden group"
    @click="$emit('view', document)"
  >
    <!-- Card Header -->
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <!-- File Icon -->
        <div class="flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100">
          <component
            :is="getFileIcon(document.fileType)"
            class="w-8 h-8 text-orange-primary"
          />
        </div>

        <!-- Status Badge -->
        <span
          v-if="document.status !== 'PROCESSED'"
          :class="[
            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
            getStatusClass(document.status)
          ]"
        >
          <component :is="getStatusIcon(document.status)" class="w-3.5 h-3.5" />
          {{ getStatusText(document.status) }}
        </span>
      </div>

      <!-- File Name -->
      <h3
        class="text-base font-semibold text-gray-900 mb-2 line-clamp-2"
        :title="document.originalFilename"
      >
        {{ document.originalFilename }}
      </h3>

      <!-- Meta Info -->
      <div class="flex items-center gap-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <CircleStackIcon class="w-4 h-4" />
          <span>{{ formatFileSize(document.fileSize) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <CalendarIcon class="w-4 h-4" />
          <span>{{ formatDate(document.uploadDate) }}</span>
        </div>
      </div>
    </div>

    <!-- Card Footer: Actions -->
    <div
      class="flex items-center gap-2 px-6 py-3 bg-gray-50 border-t border-gray-100"
      @click.stop
    >
      <button
        @click="$emit('download', document)"
        class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-primary hover:bg-orange-50 rounded-lg transition-colors"
        title="다운로드"
      >
        <ArrowDownTrayIcon class="w-4 h-4" />
        <span>다운로드</span>
      </button>
      <button
        @click="$emit('view', document)"
        class="flex items-center justify-center p-2 text-gray-700 hover:text-orange-primary hover:bg-orange-50 rounded-lg transition-colors"
        title="상세보기"
      >
        <EyeIcon class="w-5 h-5" />
      </button>
      <button
        @click="$emit('delete', document)"
        class="flex items-center justify-center p-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="삭제"
      >
        <TrashIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  DocumentTextIcon,
  DocumentIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  CircleStackIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/vue/20/solid';

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
});

defineEmits(['view', 'download', 'delete']);

const getFileIcon = (fileType) => {
  const icons = {
    pdf: DocumentTextIcon,
    docx: DocumentIcon,
    txt: DocumentChartBarIcon
  };
  return icons[fileType] || DocumentTextIcon;
};

const getStatusIcon = (status) => {
  const icons = {
    UPLOADED: ArrowPathIcon,
    PROCESSING: ArrowPathIcon,
    PROCESSED: CheckCircleIcon,
    FAILED: XCircleIcon
  };
  return icons[status] || CheckCircleIcon;
};

const getStatusClass = (status) => {
  const classes = {
    UPLOADED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    PROCESSED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusText = (status) => {
  const texts = {
    UPLOADED: '업로드됨',
    PROCESSING: '분석 중',
    PROCESSED: '처리 완료',
    FAILED: '오류'
  };
  return texts[status] || status;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / 86400000);

  if (days === 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;

  return d.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric'
  });
};
</script>
