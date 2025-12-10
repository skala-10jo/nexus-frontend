<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-green-50 px-4 py-3 border-b border-green-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <div class="ml-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <span class="text-sm text-green-700 font-medium">음성 번역</span>
        </div>
        <!-- Recording Indicator -->
        <div v-if="isRecording" class="ml-auto flex items-center gap-2">
          <div class="flex gap-0.5 items-end h-4">
            <div v-for="i in 5" :key="i"
                 class="w-1 bg-red-400 rounded-full animate-bounce"
                 :style="{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 80}ms` }">
            </div>
          </div>
          <span class="text-xs text-red-500 font-medium">녹음중</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-5 min-h-[380px]">
      <!-- Recording Status Bar -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <!-- Recording Button -->
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
            :class="isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-200'"
          >
            <svg v-if="isRecording" class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            <svg v-else class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">
              {{ isRecording ? '음성 인식 중...' : '대기 중' }}
            </p>
            <p class="text-xs text-gray-400">{{ recordingTime }}</p>
          </div>
        </div>
        <!-- Language Badges -->
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">KO</span>
          <span class="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">EN</span>
          <span class="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">JA</span>
        </div>
      </div>

      <!-- Waveform Visualization -->
      <div class="flex items-center justify-center gap-0.5 h-12 mb-5 bg-gray-50 rounded-xl px-4">
        <div
          v-for="i in 40"
          :key="i"
          class="w-1 bg-green-400 rounded-full transition-all duration-75"
          :style="{ height: isRecording ? `${waveHeights[i - 1]}px` : '4px' }"
        ></div>
      </div>

      <!-- Original Korean Text (Source) - 바로 표시 -->
      <div v-if="showOriginal" class="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 bg-blue-500 text-white rounded text-[10px] font-bold">원문</span>
          <span class="text-xs text-blue-600 font-medium">한국어</span>
        </div>
        <p class="text-sm text-gray-800 leading-relaxed">
          <template v-for="(char, i) in originalText" :key="'orig-' + i">
            <span
              :class="isOriginalTermHighlight(i) ? 'bg-blue-200 text-blue-800 font-bold px-0.5 rounded' : ''"
            >{{ char }}</span>
          </template>
        </p>
      </div>

      <!-- Translation Results - 바로 표시 (타이핑 없음) -->
      <div class="space-y-3">
        <!-- English Translation -->
        <div
          v-if="showEnglish"
          class="p-3 bg-green-50 rounded-xl border border-green-100 animate-fade-in"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 bg-green-500 text-white rounded text-[10px] font-bold">EN</span>
            <span class="text-xs text-green-600 font-medium">English</span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            <template v-for="(char, i) in englishText" :key="'en-' + i">
              <span
                :class="isEnglishTermHighlight(i) ? 'bg-green-200 text-green-800 font-bold px-0.5 rounded' : ''"
              >{{ char }}</span>
            </template>
          </p>
        </div>

        <!-- Japanese Translation -->
        <div
          v-if="showJapanese"
          class="p-3 bg-purple-50 rounded-xl border border-purple-100 animate-fade-in"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="px-2 py-0.5 bg-purple-500 text-white rounded text-[10px] font-bold">JA</span>
            <span class="text-xs text-purple-600 font-medium">日本語</span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            <template v-for="(char, i) in japaneseText" :key="'ja-' + i">
              <span
                :class="isJapaneseTermHighlight(i) ? 'bg-purple-200 text-purple-800 font-bold px-0.5 rounded' : ''"
              >{{ char }}</span>
            </template>
          </p>
        </div>
      </div>

      <!-- Terminology Info -->
      <div v-if="showTermInfo" class="mt-4 p-2 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in">
        <div class="flex items-center gap-2 text-xs text-gray-500">
          <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>전문용어 자동 인식 · 일관된 번역 적용</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animation-complete'])

// State
const isRecording = ref(false)
const recordingTime = ref('00:00')
const waveHeights = ref(Array(40).fill(4))

const showOriginal = ref(false)
const showEnglish = ref(false)
const showJapanese = ref(false)
const showTermInfo = ref(false)
const animationCompleted = ref(false)

// Data
const originalText = "오늘 배포 파이프라인 점검하고 API 엔드포인트 테스트 진행하겠습니다."
const englishText = "Today, I will check the deployment pipeline and test the API endpoints."
const japaneseText = "本日、デプロイパイプラインを点検し、APIエンドポイントのテストを行います。"

// Term ranges
const originalTermRanges = [
  { start: 3, end: 5 },    // "배포"
  { start: 6, end: 12 },   // "파이프라인"
  { start: 18, end: 26 }   // "API 엔드포인트"
]
const englishTermRanges = [
  { start: 26, end: 36 },  // "deployment"
  { start: 37, end: 45 },  // "pipeline"
  { start: 59, end: 72 }   // "API endpoints"
]
const japaneseTermRanges = [
  { start: 3, end: 9 },    // "デプロイ"
  { start: 9, end: 16 },   // "パイプライン"
  { start: 23, end: 34 }   // "APIエンドポイント"
]

const isOriginalTermHighlight = (index) => {
  return originalTermRanges.some(r => index >= r.start && index < r.end)
}
const isEnglishTermHighlight = (index) => {
  return englishTermRanges.some(r => index >= r.start && index < r.end)
}
const isJapaneseTermHighlight = (index) => {
  return japaneseTermRanges.some(r => index >= r.start && index < r.end)
}

// Animation
let animationTimeouts = []
let waveInterval = null
let timeInterval = null
let seconds = 0

const clearAllTimeouts = () => {
  animationTimeouts.forEach(t => clearTimeout(t))
  animationTimeouts = []
  if (waveInterval) {
    clearInterval(waveInterval)
    waveInterval = null
  }
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
}

const resetState = () => {
  isRecording.value = false
  recordingTime.value = '00:00'
  waveHeights.value = Array(40).fill(4)
  showOriginal.value = false
  showEnglish.value = false
  showJapanese.value = false
  showTermInfo.value = false
  animationCompleted.value = false
  seconds = 0
}

const formatTime = (s) => {
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startAnimation = () => {
  if (animationCompleted.value) return // 이미 완료됐으면 다시 실행 안함

  // Start recording
  animationTimeouts.push(setTimeout(() => {
    isRecording.value = true
    waveInterval = setInterval(() => {
      waveHeights.value = Array(40).fill(0).map(() => Math.random() * 32 + 6)
    }, 80)
    timeInterval = setInterval(() => {
      seconds++
      recordingTime.value = formatTime(seconds)
    }, 1000)
  }, 300))

  // Show original (바로 표시)
  animationTimeouts.push(setTimeout(() => {
    showOriginal.value = true
  }, 800))

  // Show English translation (바로 표시)
  animationTimeouts.push(setTimeout(() => {
    showEnglish.value = true
  }, 1500))

  // Show Japanese translation (바로 표시)
  animationTimeouts.push(setTimeout(() => {
    showJapanese.value = true
  }, 2200))

  // Stop recording
  animationTimeouts.push(setTimeout(() => {
    isRecording.value = false
    if (waveInterval) {
      clearInterval(waveInterval)
      waveInterval = null
    }
    if (timeInterval) {
      clearInterval(timeInterval)
      timeInterval = null
    }
    waveHeights.value = Array(40).fill(4)
  }, 2800))

  // Show term info
  animationTimeouts.push(setTimeout(() => {
    showTermInfo.value = true
  }, 3000))

  // Mark complete & emit event
  animationTimeouts.push(setTimeout(() => {
    animationCompleted.value = true
    emit('animation-complete')
  }, 3500))
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    // 화면에 보이기 시작하면 애니메이션 시작
    if (!animationCompleted.value) {
      startAnimation()
    }
  } else {
    clearAllTimeouts()
  }
})

onMounted(() => {
  if (props.isVisible && !animationCompleted.value) {
    startAnimation()
  }
})

onUnmounted(() => {
  clearAllTimeouts()
})

// 외부에서 리셋 후 재시작 가능하도록 expose
const restartAnimation = () => {
  clearAllTimeouts()
  resetState()
  startAnimation()
}

defineExpose({ resetState, restartAnimation })
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
