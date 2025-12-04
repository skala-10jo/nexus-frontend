<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 class="text-xl font-bold text-gray-900">오디오 파일 업로드</h3>
        <button @click="handleClose" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Upload Zone -->
        <div
          class="border-2 border-dashed rounded-2xl p-8 transition-all duration-200 cursor-pointer"
          :class="isDragging ? 'border-blue-500 bg-blue-50' : selectedFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleFileDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept=".wav,.mp3,.m4a,.ogg,.flac"
            @change="handleFileSelect"
          />

          <div class="flex flex-col items-center text-center">
            <div
              class="w-14 h-14 rounded-full flex items-center justify-center mb-4"
              :class="selectedFile ? 'bg-green-100' : 'bg-blue-100'"
            >
              <svg v-if="selectedFile" class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>

            <template v-if="selectedFile">
              <h4 class="font-bold text-gray-900 mb-1">{{ selectedFile.name }}</h4>
              <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              <button
                @click.stop="clearFile"
                class="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                파일 제거
              </button>
            </template>
            <template v-else>
              <h4 class="font-bold text-gray-900 mb-1">회의 녹음 파일을 선택하세요</h4>
              <p class="text-sm text-gray-500 mb-4">드래그 앤 드롭 또는 클릭하여 업로드</p>
              <div class="flex items-center gap-3 text-xs text-gray-400">
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  WAV, MP3, M4A, OGG, FLAC
                </span>
                <span class="flex items-center gap-1">
                  <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  최대 100MB
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Language Selection -->
        <div class="space-y-3">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">분석 언어</label>
          <div class="bg-gray-100 p-1 rounded-xl flex">
            <button
              v-for="lang in languageOptions"
              :key="lang.value"
              @click="selectedLanguage = lang.value"
              :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                selectedLanguage === lang.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              ]"
            >
              {{ lang.label }}
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-100 rounded-xl">
          <p class="text-sm text-red-600 flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ errorMessage }}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
        <button
          @click="handleClose"
          class="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
        >
          취소
        </button>
        <button
          @click="handleUpload"
          :disabled="!selectedFile || isUploading"
          class="px-6 py-2.5 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <template v-if="isUploading">
            <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            업로드 중...
          </template>
          <template v-else>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            분석 시작
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'upload'])

// State
const fileInput = ref(null)
const selectedFile = ref(null)
const selectedLanguage = ref('en-US')
const isDragging = ref(false)
const isUploading = ref(false)
const errorMessage = ref(null)

// Language options
const languageOptions = [
  { value: 'en-US', label: '영어' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'ja-JP', label: '일본어' },
  { value: 'zh-CN', label: '중국어' }
]

// Reset when dialog closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const files = event.target.files
  if (files?.length > 0) {
    validateAndSetFile(files[0])
  }
}

function handleFileDrop(event) {
  isDragging.value = false
  const files = event.dataTransfer.files
  if (files?.length > 0) {
    validateAndSetFile(files[0])
  }
}

function validateAndSetFile(file) {
  errorMessage.value = null

  const allowedExtensions = ['.wav', '.mp3', '.m4a', '.ogg', '.flac']
  const ext = '.' + file.name.split('.').pop().toLowerCase()

  if (!allowedExtensions.includes(ext)) {
    errorMessage.value = '지원하지 않는 파일 형식입니다. WAV, MP3, M4A, OGG, FLAC 파일을 사용해주세요.'
    return
  }

  if (file.size > 100 * 1024 * 1024) {
    errorMessage.value = '파일이 너무 큽니다. 최대 100MB까지 지원합니다.'
    return
  }

  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function resetForm() {
  selectedFile.value = null
  selectedLanguage.value = 'en-US'
  isDragging.value = false
  isUploading.value = false
  errorMessage.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleClose() {
  emit('close')
}

function handleUpload() {
  if (!selectedFile.value) return

  isUploading.value = true
  emit('upload', {
    file: selectedFile.value,
    language: selectedLanguage.value
  })
}

// Expose for parent to reset uploading state
defineExpose({
  setUploading: (val) => { isUploading.value = val },
  setError: (msg) => { errorMessage.value = msg; isUploading.value = false }
})
</script>
