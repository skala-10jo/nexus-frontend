<script setup>
/**
 * 용어사전 파일 업로드 모달 컴포넌트
 * @description 드래그 앤 드롭 파일 업로드, 진행률 표시
 */
import { ref } from 'vue'
import {
  CloudArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid'

defineProps({
  /** 모달 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 업로드 중인 파일 목록 */
  uploadingFiles: {
    type: Array,
    default: () => []
  },
  /** 드래그 활성 상태 */
  isDragActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  /** 모달 닫기 */
  'close',
  /** 드래그 활성화 */
  'drag-active',
  /** 드래그 비활성화 */
  'drag-inactive',
  /** 파일 드롭 */
  'drop',
  /** 파일 선택 트리거 */
  'trigger-input',
  /** 파일 선택 */
  'file-select'
])

const fileInput = ref(null)

const handleDrop = (e) => {
  emit('drop', e)
}

const handleDragOver = () => {
  emit('drag-active')
}

const handleDragLeave = () => {
  emit('drag-inactive')
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  emit('file-select', e)
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <!-- Header -->
        <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 class="text-base font-bold text-gray-900">문서 업로드</h3>
          <button
            @click="emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-5">
          <!-- Dropzone -->
          <div
            class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
            :class="isDragActive
              ? 'border-blue-500 bg-blue-50 scale-[1.01]'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'"
            @drop.prevent="handleDrop"
            @dragover.prevent="handleDragOver"
            @dragleave="handleDragLeave"
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

            <CloudArrowUpIcon
              class="w-10 h-10 mx-auto mb-2 transition-colors"
              :class="isDragActive ? 'text-blue-500' : 'text-gray-400'"
            />

            <h4 class="text-sm font-bold text-gray-900 mb-1">
              {{ isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭' }}
            </h4>
            <p class="text-xs text-gray-500 mb-2">여러 파일 동시 업로드 가능</p>
            <span class="inline-flex px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
              PDF, DOCX, TXT (최대 50MB)
            </span>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploadingFiles.length > 0" class="mt-3 space-y-2">
            <div
              v-for="file in uploadingFiles"
              :key="file.id"
              class="bg-gray-50 rounded-lg p-2.5 border border-gray-200"
              :class="{ 'border-red-300 bg-red-50': file.error }"
            >
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs font-medium text-gray-900 truncate flex-1">{{ file.filename }}</span>
                <span v-if="!file.error" class="text-xs font-bold text-gray-600 ml-2">{{ file.progress }}%</span>
                <CheckCircleIcon v-if="file.progress === 100 && !file.error" class="w-4 h-4 text-green-500 ml-1" />
              </div>
              <div v-if="!file.error" class="w-full bg-gray-200 rounded-full h-1">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all duration-300"
                  :style="{ width: `${file.progress}%` }"
                ></div>
              </div>
              <p v-if="file.error" class="text-xs text-red-600 mt-1">{{ file.error }}</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            @click="emit('close')"
            class="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
