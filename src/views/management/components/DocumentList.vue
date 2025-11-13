<template>
  <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              문서명
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              크기
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              업로드 날짜
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              작업
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr
            v-for="doc in documents"
            :key="doc.id"
            class="hover:bg-gray-50 cursor-pointer transition-colors"
            @click="$emit('view', doc)"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <component
                  :is="getFileIcon(doc.fileType)"
                  class="w-5 h-5 text-gray-400 mr-3"
                />
                <span class="text-sm font-medium text-gray-900">{{ doc.originalFilename }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatFileSize(doc.fileSize) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(doc.uploadDate) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', getStatusClass(doc.status)]">
                {{ getStatusText(doc.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
              <button
                @click="$emit('download', doc)"
                class="text-orange-primary hover:text-orange-medium mr-3"
                title="다운로드"
              >
                <ArrowDownTrayIcon class="w-5 h-5" />
              </button>
              <button
                @click="$emit('delete', doc)"
                class="text-gray-400 hover:text-red-600"
                title="삭제"
              >
                <TrashIcon class="w-5 h-5" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { DocumentTextIcon, DocumentIcon, DocumentChartBarIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/vue/24/outline';

defineProps({
  documents: {
    type: Array,
    required: true
  }
});

defineEmits(['view', 'download', 'delete']);

const getFileIcon = (fileType) => {
  const icons = { pdf: DocumentTextIcon, docx: DocumentIcon, txt: DocumentChartBarIcon };
  return icons[fileType] || DocumentTextIcon;
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
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>
