<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="show"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click="handleClose"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="show"
          class="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <VideoCameraIcon class="w-5 h-5 text-blue-600" />
              </div>
              영상 업로드
            </h3>
            <button
              @click="handleClose"
              class="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon class="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Upload Zone -->
            <div
              class="border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer"
              :class="uploadZoneClass"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleFileDrop"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                accept="video/mp4,video/mov,video/avi,video/mkv,video/webm"
                @change="handleFileSelect"
              />

              <div class="flex flex-col items-center text-center">
                <div
                  class="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  :class="selectedFile ? 'bg-green-100' : 'bg-blue-100'"
                >
                  <CheckIcon v-if="selectedFile" class="w-7 h-7 text-green-600" />
                  <CloudArrowUpIcon v-else class="w-7 h-7 text-blue-600" />
                </div>

                <template v-if="selectedFile">
                  <h4 class="font-bold text-gray-900 mb-1">{{ selectedFile.name }}</h4>
                  <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  <button
                    @click.stop="clearFile"
                    class="mt-3 text-sm text-red-600 font-medium hover:underline"
                  >
                    파일 제거
                  </button>
                </template>
                <template v-else>
                  <h4 class="font-bold text-gray-900 mb-1">번역할 영상을 선택하세요</h4>
                  <p class="text-sm text-gray-500 mb-4">드래그 앤 드롭 또는 클릭하여 업로드</p>
                  <div class="flex items-center gap-3 text-xs text-gray-400">
                    <span>MP4, MOV, AVI, MKV, WebM</span>
                    <span>•</span>
                    <span>최대 500MB</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- Source Language Selection -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                영상 언어 (자막 추출용)
              </label>
              <div class="bg-gray-100 p-1 rounded-xl flex">
                <button
                  v-for="lang in languageOptions"
                  :key="lang.code"
                  @click="sourceLanguage = lang.code"
                  :class="[
                    'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                    sourceLanguage === lang.code
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  {{ lang.flag }} {{ lang.name }}
                </button>
              </div>
            </div>

            <!-- Target Language Selection -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                번역 언어
              </label>
              <div class="bg-gray-100 p-1 rounded-xl flex">
                <button
                  v-for="lang in targetLanguageOptions"
                  :key="lang.code"
                  @click="targetLanguage = lang.code"
                  :class="[
                    'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                    targetLanguage === lang.code
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  ]"
                >
                  {{ lang.flag }} {{ lang.name }}
                </button>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="p-4 bg-red-50 border border-red-100 rounded-xl">
              <p class="text-sm text-red-600 flex items-center gap-2">
                <ExclamationCircleIcon class="w-5 h-5" />
                {{ errorMessage }}
              </p>
            </div>

            <!-- Upload Progress -->
            <div v-if="isUploading" class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600 font-medium">업로드 중...</span>
                <span class="text-blue-600 font-bold">{{ uploadProgress }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-600 transition-all duration-300"
                  :style="{ width: uploadProgress + '%' }"
                ></div>
              </div>
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
              class="px-6 py-2.5 bg-black text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <template v-if="isUploading">
                <ArrowPathIcon class="w-4 h-4 animate-spin" />
                업로드 중...
              </template>
              <template v-else>
                <ArrowUpTrayIcon class="w-4 h-4" />
                업로드
              </template>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import {
  VideoCameraIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'upload'])

// State
const fileInputRef = ref(null)
const selectedFile = ref(null)
const sourceLanguage = ref('en')
const targetLanguage = ref('ko')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')

// Language options
const languageOptions = [
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
]

// Target language options (exclude source language)
const targetLanguageOptions = computed(() => {
  return languageOptions.filter(lang => lang.code !== sourceLanguage.value)
})

// Watch source language to update target if needed
watch(sourceLanguage, (newVal) => {
  if (newVal === targetLanguage.value) {
    // Find first available target language
    const available = languageOptions.find(l => l.code !== newVal)
    if (available) {
      targetLanguage.value = available.code
    }
  }
})

// Upload zone class
const uploadZoneClass = computed(() => {
  if (isDragging.value) {
    return 'border-blue-500 bg-blue-50'
  }
  if (selectedFile.value) {
    return 'border-green-300 bg-green-50'
  }
  return 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
})

// Methods
function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function handleFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    validateAndSetFile(file)
  }
}

function validateAndSetFile(file) {
  errorMessage.value = ''

  // Check file type
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm']
  if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|mov|avi|mkv|webm)$/i)) {
    errorMessage.value = '지원하지 않는 파일 형식입니다. MP4, MOV, AVI, MKV, WebM 파일을 선택하세요.'
    return
  }

  // Check file size (500MB limit)
  const maxSize = 500 * 1024 * 1024
  if (file.size > maxSize) {
    errorMessage.value = '파일 크기는 500MB를 초과할 수 없습니다.'
    return
  }

  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  errorMessage.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleClose() {
  if (!isUploading.value) {
    resetState()
    emit('close')
  }
}

function resetState() {
  selectedFile.value = null
  sourceLanguage.value = 'en'
  targetLanguage.value = 'ko'
  isDragging.value = false
  isUploading.value = false
  uploadProgress.value = 0
  errorMessage.value = ''
}

async function handleUpload() {
  if (!selectedFile.value) return

  isUploading.value = true
  uploadProgress.value = 0

  try {
    // Emit upload event with file and language settings
    emit('upload', {
      file: selectedFile.value,
      sourceLanguage: sourceLanguage.value,
      targetLanguage: targetLanguage.value
    })
  } catch (error) {
    console.error('Upload error:', error)
    errorMessage.value = '업로드에 실패했습니다. 다시 시도해주세요.'
    isUploading.value = false
  }
}

// Update progress from parent
function setProgress(progress) {
  uploadProgress.value = progress
}

function setUploading(uploading) {
  isUploading.value = uploading
}

// Expose methods for parent component
defineExpose({
  setProgress,
  setUploading,
  resetState
})

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
