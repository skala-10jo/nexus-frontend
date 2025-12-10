<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-amber-50 px-4 py-3 border-b border-amber-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <div class="ml-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span class="text-sm text-amber-700 font-medium">영상 번역</span>
        </div>
        <!-- Play indicator -->
        <div v-if="isPlaying" class="ml-auto flex items-center gap-1.5">
          <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span class="text-xs text-gray-500 font-mono">{{ formatTime(currentTime) }}</span>
        </div>
      </div>
    </div>

    <!-- Video Player Mock -->
    <div class="relative bg-gradient-to-br from-gray-800 to-gray-900 h-[220px]">
      <!-- Video Background with subtle animation -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"></div>
        <!-- Animated particles for visual interest -->
        <div v-if="isPlaying" class="absolute inset-0">
          <div v-for="i in 5" :key="i"
               class="absolute w-1 h-1 bg-white/10 rounded-full animate-float"
               :style="{
                 left: `${20 + i * 15}%`,
                 top: `${30 + (i % 3) * 20}%`,
                 animationDelay: `${i * 0.5}s`
               }">
          </div>
        </div>
      </div>

      <!-- Video placeholder with speaker icon -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div
            class="w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 mb-2"
            :class="isPlaying ? 'bg-amber-500/20 ring-2 ring-amber-500/40' : 'bg-white/10'"
          >
            <svg v-if="isPlaying" class="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <svg v-else class="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
          <p class="text-xs text-gray-400">Tech Conference 2025</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0">
        <div class="h-1 bg-gray-700">
          <div
            class="h-full bg-amber-500 transition-all duration-100"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Subtitle Overlay - 현재 자막 표시 (두 줄로 표시) -->
      <div class="absolute bottom-6 left-0 right-0 px-4">
        <div v-if="currentSubtitle" class="flex justify-center">
          <div class="px-4 py-2 bg-black/80 rounded-lg backdrop-blur-sm max-w-[85%]">
            <p class="text-white text-sm leading-relaxed text-center break-words whitespace-pre-wrap">
              <template v-for="(word, wi) in currentSubtitle.words" :key="wi"><span
                  :class="word.isTerm ? 'text-amber-300 font-bold' : ''"
                >{{ word.text }}</span>{{ wi < currentSubtitle.words.length - 1 ? ' ' : '' }}</template>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtitle Timeline -->
    <div class="p-4">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span class="text-xs font-bold text-gray-700">실시간 자막 생성</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium">EN</span>
          <span class="text-[10px] text-gray-400">자동 번역</span>
        </div>
      </div>

      <!-- 자막 리스트 - 3개 모두 표시 -->
      <div ref="subtitleListRef" class="space-y-2">
        <div
          v-for="(sub, index) in visibleSubtitles"
          :key="sub.id"
          class="flex items-start gap-3 p-2 rounded-lg transition-all duration-300 animate-fade-in"
          :class="activeSubtitleIndex === index ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'"
        >
          <span class="text-[10px] text-gray-400 font-mono w-10 shrink-0">{{ sub.time }}</span>
          <div class="flex-1 min-w-0 overflow-hidden">
            <p class="text-xs text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
              <template v-for="(word, wi) in sub.words" :key="wi"><span
                  :class="word.isTerm ? 'bg-amber-200 text-amber-800 font-bold px-0.5 rounded' : ''"
                >{{ word.text }}</span>{{ wi < sub.words.length - 1 ? ' ' : '' }}</template>
            </p>
          </div>
        </div>
      </div>

      <!-- Term detection info -->
      <div v-if="showTermInfo" class="mt-3 p-2 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
        <div class="flex items-center gap-2 text-xs text-green-600">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>전문용어 자동 인식 · 일관된 번역 적용</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animation-complete'])

// Refs
const subtitleListRef = ref(null)

// State
const isPlaying = ref(false)
const progress = ref(0)
const currentTime = ref(0)
const activeSubtitleIndex = ref(-1)
const visibleSubtitles = ref([])
const currentSubtitle = ref(null)
const showTermInfo = ref(false)
const animationCompleted = ref(false)

// Data - English subtitles
const subtitles = [
  {
    id: 1,
    time: '00:02',
    text: "Welcome to our tech presentation on API integration.",
    words: [
      { text: 'Welcome', isTerm: false },
      { text: 'to', isTerm: false },
      { text: 'our', isTerm: false },
      { text: 'tech', isTerm: false },
      { text: 'presentation', isTerm: false },
      { text: 'on', isTerm: false },
      { text: 'API', isTerm: true },
      { text: 'integration.', isTerm: true }
    ]
  },
  {
    id: 2,
    time: '00:05',
    text: "The deployment pipeline handles all automated tasks.",
    words: [
      { text: 'The', isTerm: false },
      { text: 'deployment', isTerm: true },
      { text: 'pipeline', isTerm: true },
      { text: 'handles', isTerm: false },
      { text: 'all', isTerm: false },
      { text: 'automated', isTerm: false },
      { text: 'tasks.', isTerm: false }
    ]
  },
  {
    id: 3,
    time: '00:08',
    text: "OAuth ensures secure authentication across services.",
    words: [
      { text: 'OAuth', isTerm: true },
      { text: 'ensures', isTerm: false },
      { text: 'secure', isTerm: false },
      { text: 'authentication', isTerm: true },
      { text: 'across', isTerm: false },
      { text: 'services.', isTerm: false }
    ]
  }
]

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 스크롤을 아래로 고정
const scrollToBottom = () => {
  nextTick(() => {
    if (subtitleListRef.value) {
      subtitleListRef.value.scrollTop = subtitleListRef.value.scrollHeight
    }
  })
}

// Animation
let animationTimeouts = []
let progressInterval = null

const clearAllTimeouts = () => {
  animationTimeouts.forEach(t => clearTimeout(t))
  animationTimeouts = []
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

const resetState = () => {
  isPlaying.value = false
  progress.value = 0
  currentTime.value = 0
  activeSubtitleIndex.value = -1
  visibleSubtitles.value = []
  currentSubtitle.value = null
  showTermInfo.value = false
  animationCompleted.value = false
}

const startAnimation = () => {
  if (animationCompleted.value) return // 이미 완료됐으면 다시 실행 안함

  // Start playing
  animationTimeouts.push(setTimeout(() => {
    isPlaying.value = true
    progressInterval = setInterval(() => {
      currentTime.value += 0.1
      progress.value = (currentTime.value / 12) * 100
      if (progress.value >= 100) {
        if (progressInterval) {
          clearInterval(progressInterval)
          progressInterval = null
        }
      }
    }, 100)
  }, 300))

  // First subtitle at 00:02 - 바로 표시
  animationTimeouts.push(setTimeout(() => {
    currentSubtitle.value = subtitles[0]
    visibleSubtitles.value.push(subtitles[0])
    activeSubtitleIndex.value = 0
    scrollToBottom()
  }, 1000))

  // Second subtitle at 00:05 - 바로 표시
  animationTimeouts.push(setTimeout(() => {
    currentSubtitle.value = subtitles[1]
    visibleSubtitles.value.push(subtitles[1])
    activeSubtitleIndex.value = 1
    scrollToBottom()
  }, 2500))

  // Third subtitle at 00:08 - 바로 표시
  animationTimeouts.push(setTimeout(() => {
    currentSubtitle.value = subtitles[2]
    visibleSubtitles.value.push(subtitles[2])
    activeSubtitleIndex.value = 2
    scrollToBottom()
  }, 4000))

  // Show term info
  animationTimeouts.push(setTimeout(() => {
    showTermInfo.value = true
  }, 5000))

  // Stop playing (마지막 자막은 유지)
  animationTimeouts.push(setTimeout(() => {
    isPlaying.value = false
    // currentSubtitle는 유지하여 마지막 자막이 계속 보이도록 함
  }, 5500))

  // Mark complete & emit event
  animationTimeouts.push(setTimeout(() => {
    animationCompleted.value = true
    emit('animation-complete')
  }, 6000))
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
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 0.6;
  }
}

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
