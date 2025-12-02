<template>
  <div class="h-full flex flex-col bg-white">
    <!-- Header -->
    <div class="flex-shrink-0 border-b px-6 py-4 flex justify-between items-start bg-white sticky top-0 z-10">
      <div class="flex-1">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">
          새 프로젝트 생성
        </h2>
        <p class="text-sm text-gray-500">
          새로운 프로젝트를 생성하고 문서를 연결하세요.
        </p>
      </div>
      <button
        @click="$emit('cancel')"
        class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="닫기"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
      <div class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">프로젝트 이름</label>
          <input
            v-model="formData.name"
            type="text"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            placeholder="프로젝트 이름을 입력하세요"
            required
            autofocus
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">설명</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white"
            placeholder="프로젝트에 대한 설명을 입력하세요"
          ></textarea>
        </div>

        <div class="pt-4 border-t border-gray-100">
          <label class="block text-sm font-semibold text-gray-700 mb-4">관련 문서 연결</label>
          
          <!-- Document List -->
          <div v-if="allDocuments.length > 0" class="border border-gray-200 rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
            <div
              v-for="doc in allDocuments"
              :key="doc.id"
              class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
              @click="toggleDocumentSelection(doc.id)"
            >
              <div class="relative flex items-center">
                <input
                  type="checkbox"
                  :checked="formData.documentIds.includes(doc.id)"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  @click.stop
                  @change="toggleDocumentSelection(doc.id)"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ doc.originalFilename }}</p>
                <p class="text-xs text-gray-500">
                  {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }}
                </p>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p class="text-gray-500 text-sm">
              사용 가능한 문서가 없습니다
            </p>
          </div>

          <!-- Selected Count -->
          <div class="mt-3 flex justify-between items-center text-sm">
            <span class="text-gray-500">{{ formData.documentIds.length }}개 문서 선택됨</span>
            <button 
              v-if="formData.documentIds.length > 0"
              @click="formData.documentIds = []"
              class="text-blue-600 hover:text-blue-700 font-medium text-xs"
            >
              전체 해제
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex-shrink-0 border-t px-6 py-4 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
      <button
        @click="$emit('cancel')"
        class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
      >
        취소
      </button>
      <button
        @click="save"
        class="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!formData.name"
      >
        프로젝트 생성
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  allDocuments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['save', 'cancel']);

const formData = ref({
  name: '',
  description: '',
  documentIds: []
});

function save() {
  if (!formData.value.name.trim()) return;
  emit('save', formData.value);
}

function toggleDocumentSelection(docId) {
  const index = formData.value.documentIds.indexOf(docId);
  if (index === -1) {
    formData.value.documentIds.push(docId);
  } else {
    formData.value.documentIds.splice(index, 1);
  }
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
