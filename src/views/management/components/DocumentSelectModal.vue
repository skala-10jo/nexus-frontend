<template>
  <Transition name="modal">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" class="text-xl font-semibold text-gray-900">용어 추출할 문서 선택</h2>
          <button
            @click="$emit('close')"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <XMarkIcon class="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <!-- Search Bar -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="문서 검색..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Document List -->
        <div class="px-6 py-4 overflow-y-auto max-h-[calc(90vh-220px)]">
          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-primary"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="text-center py-12">
            <ExclamationCircleIcon class="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p class="text-gray-600">문서 목록을 불러오지 못했습니다.</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredDocuments.length === 0" class="text-center py-12">
            <DocumentTextIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p class="text-gray-600">업로드된 문서가 없습니다.</p>
          </div>

          <!-- Document Grid -->
          <div v-else class="grid grid-cols-1 gap-3">
            <button
              v-for="document in filteredDocuments"
              :key="document.id"
              @click="selectDocument(document)"
              class="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-orange-primary hover:bg-orange-50 transition-all text-left group"
            >
              <!-- File Icon -->
              <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 group-hover:from-orange-100 group-hover:to-orange-200 transition-colors flex-shrink-0">
                <component :is="getFileIcon(document.fileType)" class="w-6 h-6 text-orange-primary" />
              </div>

              <!-- Document Info -->
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-gray-900 mb-1 truncate">
                  {{ document.originalFilename }}
                </h3>
                <div class="flex items-center gap-3 text-sm text-gray-500">
                  <span class="flex items-center gap-1">
                    <CalendarIcon class="w-4 h-4" />
                    {{ formatDate(document.uploadDate) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <DocumentIcon class="w-4 h-4" />
                    {{ formatFileSize(document.fileSize) }}
                  </span>
                  <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getStatusClass(document.status)]">
                    <component :is="getStatusIcon(document.status)" class="w-3 h-3" />
                    {{ getStatusText(document.status) }}
                  </span>
                </div>
              </div>

              <!-- Select Arrow -->
              <div class="flex items-center">
                <ChevronRightIcon class="w-5 h-5 text-gray-400 group-hover:text-orange-primary transition-colors" />
              </div>
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            총 <span class="font-semibold text-gray-900">{{ filteredDocuments.length }}</span>개의 문서
          </p>
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  DocumentIcon,
  CalendarIcon,
  ChevronRightIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon
} from '@heroicons/vue/20/solid';

import { documentService } from '@/services/documentService';

const emit = defineEmits(['close', 'select']);

// State
const documents = ref([]);
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');

// Computed
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value;

  const query = searchQuery.value.toLowerCase();
  return documents.value.filter(doc =>
    doc.originalFilename.toLowerCase().includes(query)
  );
});

// Methods
const loadDocuments = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await documentService.getDocuments({
      page: 0,
      size: 100,
      sort: 'uploadDate,desc'
    });

    const data = response.data.data || response.data;
    documents.value = data.content || data;
  } catch (err) {
    console.error('Failed to load documents:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const selectDocument = (document) => {
  if (document.status !== 'READY') {
    alert('이 문서는 아직 준비되지 않았습니다. 처리가 완료된 문서만 선택할 수 있습니다.');
    return;
  }

  emit('select', document.id);
};

const getFileIcon = (fileType) => {
  const icons = {
    pdf: DocumentTextIcon,
    docx: DocumentIcon,
    txt: DocumentTextIcon
  };
  return icons[fileType] || DocumentTextIcon;
};

const getStatusIcon = (status) => {
  const icons = {
    UPLOADED: ArrowPathIcon,
    PROCESSING: ArrowPathIcon,
    READY: CheckCircleIcon,
    ERROR: XCircleIcon
  };
  return icons[status] || CheckCircleIcon;
};

const getStatusClass = (status) => {
  const classes = {
    UPLOADED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    READY: 'bg-green-100 text-green-700',
    ERROR: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusText = (status) => {
  const texts = {
    UPLOADED: '업로드됨',
    PROCESSING: '처리 중',
    READY: '준비됨',
    ERROR: '오류'
  };
  return texts[status] || status;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  loadDocuments();
});
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
