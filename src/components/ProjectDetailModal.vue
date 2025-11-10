<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('close')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start">
          <div class="flex-1">
            <h2 id="modal-title" class="text-2xl font-bold text-gray-800 mb-2">
              {{ project.name }}
            </h2>
            <span
              :class="[
                'inline-block px-3 py-1 text-xs font-medium rounded-full',
                getStatusClass(project.status)
              ]"
            >
              {{ getStatusText(project.status) }}
            </span>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto px-6 py-6">
          <!-- Basic Info -->
          <section class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              기본 정보
            </h3>
            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
              <div class="flex items-start">
                <span class="text-sm font-medium text-gray-500 w-24">설명</span>
                <p class="text-sm text-gray-800 flex-1">
                  {{ project.description || '설명 없음' }}
                </p>
              </div>
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-500 w-24">상태</span>
                <span class="text-sm text-gray-800">
                  {{ getStatusText(project.status) }}
                </span>
              </div>
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-500 w-24">생성일</span>
                <span class="text-sm text-gray-800">
                  {{ formatDate(project.createdAt) }}
                </span>
              </div>
            </div>
          </section>

          <!-- Statistics -->
          <section class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              통계
            </h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div class="flex items-center gap-2 mb-1">
                <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium text-blue-800">문서</span>
              </div>
              <p class="text-2xl font-bold text-blue-900">{{ project.documentCount || 0 }}</p>
            </div>
          </section>

          <!-- Linked Documents -->
          <section v-if="project.documentCount > 0" class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              연결된 문서 ({{ project.documentCount }})
            </h3>
            <div v-if="linkedDocuments.length > 0" class="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
              <div
                v-for="doc in linkedDocuments"
                :key="doc.id"
                class="p-3 hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <svg class="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-800 truncate">{{ doc.originalFilename }}</p>
                    <p class="text-xs text-gray-500">
                      {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="bg-gray-50 rounded-lg p-4 text-center">
              <p class="text-sm text-gray-500">문서 정보를 불러오는 중...</p>
            </div>
          </section>

          <!-- Empty State -->
          <section v-else class="mb-6">
            <div class="bg-gray-50 rounded-lg p-8 text-center">
              <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-sm text-gray-500">아직 연결된 문서가 없습니다</p>
            </div>
          </section>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            닫기
          </button>
          <button
            @click="$emit('edit', project)"
            class="px-6 py-2 text-sm font-medium text-white bg-orange-primary hover:bg-orange-medium rounded-lg transition-colors"
          >
            편집
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  project: {
    type: Object,
    required: true
  },
  allDocuments: {
    type: Array,
    default: () => []
  }
});

defineEmits(['close', 'edit']);

// Compute linked documents from project's documentIds
const linkedDocuments = computed(() => {
  if (!props.project.documentIds || props.project.documentIds.length === 0) {
    return [];
  }
  return props.allDocuments.filter(doc =>
    props.project.documentIds.includes(doc.id)
  );
});

const getStatusClass = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800';
    case 'DELETED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'ACTIVE':
      return '활성';
    case 'ARCHIVED':
      return '보관됨';
    case 'DELETED':
      return '삭제됨';
    default:
      return status;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
