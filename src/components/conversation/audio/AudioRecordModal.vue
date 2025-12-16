<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 class="text-xl font-bold text-gray-900">음성 녹음</h3>
        <button @click="handleClose" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Recording Status -->
        <div class="flex flex-col items-center text-center py-8">
          <!-- Recording Animation -->
          <div
            class="relative w-32 h-32 flex items-center justify-center mb-6"
          >
            <!-- Pulse Animation when recording -->
            <div
              v-if="isRecording"
              class="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30"
            ></div>
            <div
              v-if="isRecording"
              class="absolute inset-2 bg-red-200 rounded-full animate-pulse opacity-50"
            ></div>

            <!-- Mic Icon Container -->
            <div
              class="relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300"
              :class="isRecording ? 'bg-red-500' : 'bg-gray-100'"
            >
              <svg
                class="w-12 h-12 transition-colors"
                :class="isRecording ? 'text-white' : 'text-gray-400'"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <!-- Timer -->
          <div class="text-4xl font-mono font-bold mb-2" :class="isRecording ? 'text-red-600' : 'text-gray-300'">
            {{ formattedTime }}
          </div>

          <!-- Status Text -->
          <p class="text-sm text-gray-500">
            <template v-if="!isRecording && !recordedBlob">
              녹음 버튼을 눌러 시작하세요
            </template>
            <template v-else-if="isRecording">
              녹음 중입니다...
            </template>
            <template v-else-if="recordedBlob">
              녹음이 완료되었습니다 ({{ formatFileSize(recordedBlob.size) }})
            </template>
          </p>

          <!-- Recorded Preview -->
          <div v-if="recordedBlob && !isRecording" class="mt-4 w-full max-w-xs">
            <audio ref="audioPreview" :src="recordedUrl" controls class="w-full"></audio>
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
              :disabled="isRecording"
              :class="[
                'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
                selectedLanguage === lang.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900',
                isRecording ? 'opacity-50 cursor-not-allowed' : ''
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
      <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center gap-3">
        <!-- Left: Close/Cancel -->
        <button
          @click="handleClose"
          class="px-5 py-2.5 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
        >
          취소
        </button>

        <!-- Center: Record/Stop Button -->
        <div class="flex-1 flex justify-center">
          <button
            v-if="!isRecording"
            @click="startRecording"
            :disabled="isUploading"
            class="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
          </button>
          <button
            v-else
            @click="stopRecording"
            class="w-16 h-16 bg-gray-800 hover:bg-gray-900 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-300"
          >
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        </div>

        <!-- Right: Upload Button -->
        <button
          @click="handleUpload"
          :disabled="!recordedBlob || isRecording || isUploading"
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
/**
 * AudioRecordModal.vue
 *
 * @description 브라우저 MediaRecorder API를 사용한 음성 녹음 모달
 * - 녹음 시작/중지
 * - 실시간 타이머 표시
 * - 녹음 완료 후 미리보기
 * - 파일 변환 후 업로드
 */
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'upload'])

// State
const selectedLanguage = ref('en-US')
const isRecording = ref(false)
const isUploading = ref(false)
const errorMessage = ref(null)
const recordingTime = ref(0)
const recordedBlob = ref(null)
const recordedUrl = ref(null)

// MediaRecorder references
let mediaRecorder = null
let audioChunks = []
let timerInterval = null
let audioStream = null

// Language options
const languageOptions = [
  { value: 'en-US', label: '영어' },
  { value: 'ko-KR', label: '한국어' },
  { value: 'ja-JP', label: '일본어' },
  { value: 'zh-CN', label: '중국어' }
]

// Computed
const formattedTime = computed(() => {
  const minutes = Math.floor(recordingTime.value / 60)
  const seconds = recordingTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Reset when dialog closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// Methods
async function startRecording() {
  try {
    errorMessage.value = null
    audioChunks = []

    // Request microphone permission
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 44100
      }
    })

    // Create MediaRecorder
    // Try to use webm format, fallback to other formats
    const mimeType = getSupportedMimeType()
    mediaRecorder = new MediaRecorder(audioStream, { mimeType })

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: mimeType })
      recordedBlob.value = blob
      recordedUrl.value = URL.createObjectURL(blob)
    }

    // Start recording
    mediaRecorder.start(100) // Collect data every 100ms
    isRecording.value = true
    recordingTime.value = 0

    // Start timer
    timerInterval = setInterval(() => {
      recordingTime.value++
    }, 1000)

  } catch (err) {
    console.error('Recording error:', err)
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      errorMessage.value = '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
    } else if (err.name === 'NotFoundError') {
      errorMessage.value = '마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.'
    } else {
      errorMessage.value = `녹음을 시작할 수 없습니다: ${err.message}`
    }
  }
}

function getSupportedMimeType() {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav'
  ]

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }

  return 'audio/webm' // Default fallback
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
    isRecording.value = false

    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }

    // Stop audio stream
    if (audioStream) {
      audioStream.getTracks().forEach(track => track.stop())
      audioStream = null
    }
  }
}

function handleUpload() {
  if (!recordedBlob.value) return

  isUploading.value = true

  // Create File object from Blob
  const extension = getFileExtension(recordedBlob.value.type)
  const filename = `recording_${Date.now()}.${extension}`
  const file = new File([recordedBlob.value], filename, { type: recordedBlob.value.type })

  emit('upload', {
    file,
    language: selectedLanguage.value
  })
}

function getFileExtension(mimeType) {
  const mimeToExt = {
    'audio/webm': 'webm',
    'audio/webm;codecs=opus': 'webm',
    'audio/ogg': 'ogg',
    'audio/ogg;codecs=opus': 'ogg',
    'audio/mp4': 'm4a',
    'audio/wav': 'wav',
    'audio/mpeg': 'mp3'
  }
  return mimeToExt[mimeType] || 'webm'
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function resetForm() {
  // Stop recording if active
  if (isRecording.value) {
    stopRecording()
  }

  // Cleanup
  if (recordedUrl.value) {
    URL.revokeObjectURL(recordedUrl.value)
  }

  // Reset state
  selectedLanguage.value = 'en-US'
  isRecording.value = false
  isUploading.value = false
  errorMessage.value = null
  recordingTime.value = 0
  recordedBlob.value = null
  recordedUrl.value = null
  audioChunks = []
}

function handleClose() {
  if (isRecording.value) {
    stopRecording()
  }
  emit('close')
}

// Cleanup on unmount
onUnmounted(() => {
  resetForm()
})

// Expose for parent to control state
defineExpose({
  setUploading: (val) => { isUploading.value = val },
  setError: (msg) => { errorMessage.value = msg; isUploading.value = false }
})
</script>

<style scoped>
@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
