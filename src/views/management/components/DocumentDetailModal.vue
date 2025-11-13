<template>
  <Transition name="modal">
    <div
      v-if="document"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" class="text-xl font-semibold text-gray-900">문서 상세 정보</h2>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <XMarkIcon class="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <!-- File Info -->
          <div class="flex items-start gap-4 mb-6">
            <div class="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100">
              <component :is="getFileIcon(document.fileType)" class="w-9 h-9 text-orange-primary" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold text-gray-900 mb-1 break-words">{{ document.originalFilename }}</h3>
              <div class="flex items-center gap-2">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', getStatusClass(document.status)]">
                  <component :is="getStatusIcon(document.status)" class="w-3.5 h-3.5" />
                  {{ getStatusText(document.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">파일 크기</p>
              <p class="text-sm text-gray-900">{{ formatFileSize(document.fileSize) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">파일 타입</p>
              <p class="text-sm text-gray-900 uppercase">{{ document.fileType }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">업로드 날짜</p>
              <p class="text-sm text-gray-900">{{ formatFullDate(document.uploadDate) }}</p>
            </div>
            <div>
              <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">MIME 타입</p>
              <p class="text-sm text-gray-900">{{ document.mimeType }}</p>
            </div>
          </div>

          <!-- Metadata Section -->
          <div v-if="document.metadata" class="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 class="text-sm font-semibold text-gray-900 mb-3">메타데이터</h4>
            <div class="grid grid-cols-2 gap-4">
              <div v-if="document.metadata.language">
                <p class="text-xs text-gray-500 mb-1">언어</p>
                <p class="text-sm text-gray-900">{{ document.metadata.language }}</p>
              </div>
              <div v-if="document.metadata.pageCount">
                <p class="text-xs text-gray-500 mb-1">페이지 수</p>
                <p class="text-sm text-gray-900">{{ document.metadata.pageCount }}페이지</p>
              </div>
              <div v-if="document.metadata.wordCount">
                <p class="text-xs text-gray-500 mb-1">단어 수</p>
                <p class="text-sm text-gray-900">{{ document.metadata.wordCount.toLocaleString() }}단어</p>
              </div>
              <div v-if="document.metadata.characterCount">
                <p class="text-xs text-gray-500 mb-1">문자 수</p>
                <p class="text-sm text-gray-900">{{ document.metadata.characterCount.toLocaleString() }}자</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer: Actions -->
        <div class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            @click="$emit('delete', document)"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon class="w-4 h-4" />
            <span>삭제</span>
          </button>
          <button
            @click="$emit('download', document)"
            class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-orange-primary hover:bg-orange-medium rounded-lg transition-colors"
          >
            <ArrowDownTrayIcon class="w-4 h-4" />
            <span>다운로드</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import {
  XMarkIcon,
  DocumentTextIcon,
  DocumentIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  TrashIcon
} from '@heroicons/vue/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/20/solid';

defineProps({
  document: {
    type: Object,
    default: null
  }
});

defineEmits(['close', 'download', 'delete']);

const getFileIcon = (fileType) => {
  const icons = { pdf: DocumentTextIcon, docx: DocumentIcon, txt: DocumentChartBarIcon };
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
  const texts = { UPLOADED: '업로드됨', PROCESSING: '분석 중', PROCESSED: '처리 완료', FAILED: '오류' };
  return texts[status] || status;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

const formatFullDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
