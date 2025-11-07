<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden transition-all duration-300">
    <!-- Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
      @click="$emit('toggle')"
    >
      <div class="flex items-center gap-3">
        <CloudArrowUpIcon class="w-6 h-6 text-orange-primary" />
        <h2 class="text-lg font-semibold text-gray-900">파일 업로드</h2>
      </div>
      <button
        class="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>{{ isCollapsed ? '펼치기' : '접기' }}</span>
        <ChevronDownIcon
          class="w-5 h-5 transition-transform duration-300"
          :class="{ 'transform rotate-180': !isCollapsed }"
        />
      </button>
    </div>

    <!-- Upload Area -->
    <Transition name="slide-down">
      <div v-show="!isCollapsed" class="p-6">
        <!-- Dropzone -->
        <div
          class="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200"
          :class="isDragActive
            ? 'border-orange-primary bg-orange-50 scale-[1.02]'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'"
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragActive = true"
          @dragleave="isDragActive = false"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt"
            @change="handleFileSelect"
            hidden
          />

          <!-- Icon -->
          <div class="mb-4">
            <CloudArrowUpIcon
              class="w-16 h-16 mx-auto transition-colors duration-200"
              :class="isDragActive ? 'text-orange-primary' : 'text-gray-400'"
            />
          </div>

          <!-- Text -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드' }}
          </h3>
          <p class="text-sm text-gray-600 mb-4">
            여러 파일을 동시에 업로드할 수 있습니다
          </p>

          <!-- Format Info -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-xs text-gray-600">
            <InformationCircleIcon class="w-4 h-4" />
            <span>지원 형식: PDF, DOCX, TXT (최대 50MB)</span>
          </div>
        </div>

        <!-- Upload Progress -->
        <Transition name="fade">
          <div v-if="uploadingFiles.length > 0" class="mt-6 space-y-3">
            <div
              v-for="file in uploadingFiles"
              :key="file.id"
              class="bg-gray-50 rounded-lg p-4 border border-gray-200"
              :class="{ 'border-red-300 bg-red-50': file.error }"
            >
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                  <DocumentTextIcon class="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.filename }}</p>
                    <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="!file.error" class="text-sm font-medium text-gray-700">
                    {{ file.progress }}%
                  </span>
                  <CheckCircleIcon v-if="file.progress === 100 && !file.error" class="w-5 h-5 text-green-600" />
                  <XCircleIcon v-if="file.error" class="w-5 h-5 text-red-600" />
                </div>
              </div>

              <!-- Progress Bar -->
              <div v-if="!file.error" class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-orange-primary to-orange-medium transition-all duration-300 ease-out"
                  :style="{ width: `${file.progress}%` }"
                ></div>
              </div>

              <!-- Error Message -->
              <div v-if="file.error" class="flex items-center justify-between mt-2">
                <p class="text-sm text-red-600">{{ file.error }}</p>
                <button
                  @click.stop="retryUpload(file)"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  재시도
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  CloudArrowUpIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';
import { useDocumentStore } from '@/stores/documents';

const props = defineProps({
  isCollapsed: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle', 'upload-start', 'upload-complete', 'upload-error']);

const documentStore = useDocumentStore();

// State
const fileInput = ref(null);
const isDragActive = ref(false);
const uploadingFiles = ref([]);

// Methods
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDrop = (e) => {
  isDragActive.value = false;
  const files = Array.from(e.dataTransfer.files);
  uploadFiles(files);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  uploadFiles(files);
  e.target.value = '';
};

const uploadFiles = async (files) => {
  // Validate files
  const validFiles = files.filter(file => {
    const isValidType = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'].includes(file.type);
    const isValidSize = file.size <= 50 * 1024 * 1024;

    if (!isValidType) {
      emit('upload-error', new Error(`${file.name}: 지원하지 않는 파일 형식입니다`));
      return false;
    }
    if (!isValidSize) {
      emit('upload-error', new Error(`${file.name}: 파일 크기가 50MB를 초과합니다`));
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) return;

  // Upload files
  for (const file of validFiles) {
    const uploadId = Date.now() + Math.random();
    const uploadItem = {
      id: uploadId,
      filename: file.name,
      size: file.size,
      progress: 0,
      error: null,
      file: file
    };

    uploadingFiles.value.push(uploadItem);
    emit('upload-start');

    try {
      await documentStore.uploadDocument(file, (progress) => {
        const item = uploadingFiles.value.find(u => u.id === uploadId);
        if (item) item.progress = progress;
      });

      // Wait a moment to show 100% before removing
      setTimeout(() => {
        uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== uploadId);
        if (uploadingFiles.value.length === 0) {
          emit('upload-complete');
        }
      }, 1000);
    } catch (error) {
      const item = uploadingFiles.value.find(u => u.id === uploadId);
      if (item) {
        item.error = error.message;
        item.progress = 0;
      }
      emit('upload-error', error);
    }
  }
};

const retryUpload = async (uploadItem) => {
  uploadItem.error = null;
  uploadItem.progress = 0;

  try {
    await documentStore.uploadDocument(uploadItem.file, (progress) => {
      uploadItem.progress = progress;
    });

    setTimeout(() => {
      uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== uploadItem.id);
      if (uploadingFiles.value.length === 0) {
        emit('upload-complete');
      }
    }, 1000);
  } catch (error) {
    uploadItem.error = error.message;
    emit('upload-error', error);
  }
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
};
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 1000px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
