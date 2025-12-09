<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full cursor-pointer"
    @click="$emit('click', video)"
  >
    <!-- Thumbnail / Video Preview -->
    <div class="relative aspect-video bg-gray-100 rounded-2xl mb-4 overflow-hidden">
      <!-- Generated Thumbnail -->
      <img
        v-if="thumbnailDataUrl"
        :src="thumbnailDataUrl"
        :alt="video.originalFilename"
        class="w-full h-full object-cover"
      />
      <!-- Server Thumbnail (fallback) -->
      <img
        v-else-if="video.thumbnailUrl"
        :src="video.thumbnailUrl"
        :alt="video.originalFilename"
        class="w-full h-full object-cover"
      />
      <!-- Loading / Placeholder -->
      <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
        <VideoCameraIcon v-if="!isLoadingThumbnail" class="w-12 h-12 text-gray-300" />
        <div v-else class="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>

      <!-- Hidden video for thumbnail generation -->
      <video
        v-if="!thumbnailDataUrl && !video.thumbnailUrl"
        ref="videoRef"
        :src="videoStreamUrl"
        class="hidden"
        crossorigin="anonymous"
        preload="metadata"
        muted
        @loadeddata="generateThumbnail"
        @error="handleVideoError"
      />

      <!-- Play Button Overlay -->
      <div class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
        <div class="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all shadow-lg">
          <PlayIcon class="w-6 h-6 text-gray-900 ml-1" />
        </div>
      </div>

      <!-- Duration Badge -->
      <span
        v-if="formattedDuration"
        class="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded-lg"
      >
        {{ formattedDuration }}
      </span>

      <!-- Subtitle Status Badge -->
      <span
        v-if="hasSubtitles"
        class="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg flex items-center gap-1"
      >
        <ChatBubbleLeftIcon class="w-3 h-3" />
        자막
      </span>

      <!-- Delete Button (hover) -->
      <button
        @click.stop="$emit('delete', video.id)"
        class="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
      >
        <TrashIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Card Content -->
    <div class="flex-1 flex flex-col">
      <!-- Language Flags -->
      <div class="flex gap-1 mb-2">
        <span
          v-for="lang in displayLanguages"
          :key="lang"
          class="w-6 h-6 rounded-md flex items-center justify-center text-sm bg-gray-50"
          :title="getLanguageName(lang)"
        >
          {{ getLanguageFlag(lang) }}
        </span>
        <span
          v-if="video.availableLanguages && video.availableLanguages.length > 3"
          class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-bold"
        >
          +{{ video.availableLanguages.length - 3 }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-base font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
        {{ video.originalFilename || video.fileName }}
      </h3>

      <!-- Meta Info -->
      <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span>{{ formatFileSize(video.fileSize) }}</span>
        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>{{ formatDate(video.uploadDate || video.createdAt) }}</span>
      </div>

      <!-- Action Button -->
      <button
        @click.stop="$emit('click', video)"
        class="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-auto"
      >
        <span>자막 확인</span>
        <ArrowRightIcon class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  VideoCameraIcon,
  PlayIcon,
  ChatBubbleLeftIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  video: {
    type: Object,
    required: true
  }
})

defineEmits(['click', 'delete'])

// Thumbnail generation
const videoRef = ref(null)
const thumbnailDataUrl = ref(null)
const isLoadingThumbnail = ref(false)

// Video stream URL with token
const videoStreamUrl = computed(() => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
  const token = localStorage.getItem('token')
  return `${API_URL}/videos/${props.video.id}/stream?token=${token}`
})

// Generate thumbnail from video
function generateThumbnail() {
  const video = videoRef.value
  if (!video) return

  try {
    // Seek to 1 second for a better frame (avoid black frames at start)
    video.currentTime = Math.min(1, video.duration * 0.1)
  } catch (e) {
    captureThumbnail()
  }

  video.onseeked = () => {
    captureThumbnail()
  }
}

function captureThumbnail() {
  const video = videoRef.value
  if (!video) return

  try {
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 320
    canvas.height = video.videoHeight || 180

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    thumbnailDataUrl.value = canvas.toDataURL('image/jpeg', 0.8)
    isLoadingThumbnail.value = false
  } catch (e) {
    console.warn('Failed to generate thumbnail:', e)
    isLoadingThumbnail.value = false
  }
}

function handleVideoError() {
  isLoadingThumbnail.value = false
}

onMounted(() => {
  if (!props.video.thumbnailUrl && !thumbnailDataUrl.value) {
    isLoadingThumbnail.value = true
  }
})

// Language mapping
const languageMap = {
  ko: { name: '한국어', flag: '🇰🇷' },
  en: { name: 'English', flag: '🇺🇸' },
  ja: { name: '日本語', flag: '🇯🇵' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  zh: { name: '中文', flag: '🇨🇳' }
}

// Computed
const displayLanguages = computed(() => {
  if (props.video.availableLanguages && props.video.availableLanguages.length > 0) {
    return props.video.availableLanguages.slice(0, 3)
  }
  // Fallback to original language
  if (props.video.originalLanguage) {
    return [props.video.originalLanguage]
  }
  return []
})

const formattedDuration = computed(() => {
  // Support both 'duration' and 'durationSeconds' fields
  const seconds = props.video.duration || props.video.durationSeconds
  if (!seconds) return null
  return formatDuration(seconds)
})

// Check if video has subtitles
const hasSubtitles = computed(() => {
  // Direct hasSubtitles field from backend
  if (props.video.hasSubtitles !== undefined) {
    return props.video.hasSubtitles
  }
  // Fallback: check sttStatus
  if (props.video.sttStatus === 'completed') {
    return true
  }
  return false
})

// Methods
function getLanguageFlag(code) {
  return languageMap[code]?.flag || '🌐'
}

function getLanguageName(code) {
  return languageMap[code]?.name || code
}

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatDate(dateString) {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '오늘'
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`
  } else {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
}
</script>
