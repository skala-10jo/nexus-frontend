<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">영상 번역</span>
      </div>
    </div>

    <!-- Video Player Mock -->
    <div class="relative bg-gray-900 aspect-video">
      <!-- Video placeholder -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <svg class="w-10 h-10 text-white/80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
        <div
          class="h-full bg-blue-500 transition-all duration-100"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <!-- Subtitle -->
      <div v-if="currentSubtitle" class="absolute bottom-8 left-0 right-0 text-center px-4">
        <div class="inline-block px-4 py-2 bg-black/70 rounded-lg">
          <p class="text-white text-sm">{{ currentSubtitle.text }}</p>
          <p class="text-blue-300 text-xs mt-1">{{ currentSubtitle.translation }}</p>
        </div>
      </div>
    </div>

    <!-- Subtitle list -->
    <div class="p-4 max-h-32 overflow-hidden">
      <p class="text-xs text-gray-400 mb-2">자막 미리보기</p>
      <div class="space-y-2">
        <div
          v-for="(sub, index) in visibleSubtitles"
          :key="index"
          class="flex gap-3 text-sm animate-fade-in"
          :class="{ 'text-blue-600 font-medium': index === activeSubtitleIndex }"
        >
          <span class="text-gray-400 w-12">{{ sub.time }}</span>
          <span>{{ sub.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const subtitles = [
  { time: '00:01', text: '안녕하세요', translation: 'Hello' },
  { time: '00:03', text: '오늘 발표를 시작하겠습니다', translation: "I'll start today's presentation" },
  { time: '00:06', text: '먼저 프로젝트 개요를 설명드리겠습니다', translation: "First, I'll explain the project overview" },
  { time: '00:10', text: '질문이 있으시면 말씀해주세요', translation: 'Please feel free to ask questions' }
]

const progress = ref(0)
const activeSubtitleIndex = ref(-1)
const visibleSubtitles = ref([])
const currentSubtitle = computed(() => {
  if (activeSubtitleIndex.value >= 0 && activeSubtitleIndex.value < subtitles.length) {
    return subtitles[activeSubtitleIndex.value]
  }
  return null
})

let animationInterval = null

const startAnimation = () => {
  progress.value = 0
  activeSubtitleIndex.value = -1
  visibleSubtitles.value = []

  const duration = 12000 // 12 seconds total
  const interval = 50
  let elapsed = 0

  animationInterval = setInterval(() => {
    elapsed += interval
    progress.value = (elapsed / duration) * 100

    // Show subtitles at specific times
    if (elapsed >= 1000 && visibleSubtitles.value.length < 1) {
      visibleSubtitles.value.push(subtitles[0])
      activeSubtitleIndex.value = 0
    }
    if (elapsed >= 3000 && visibleSubtitles.value.length < 2) {
      visibleSubtitles.value.push(subtitles[1])
      activeSubtitleIndex.value = 1
    }
    if (elapsed >= 6000 && visibleSubtitles.value.length < 3) {
      visibleSubtitles.value.push(subtitles[2])
      activeSubtitleIndex.value = 2
    }
    if (elapsed >= 10000 && visibleSubtitles.value.length < 4) {
      visibleSubtitles.value.push(subtitles[3])
      activeSubtitleIndex.value = 3
    }

    if (elapsed >= duration) {
      clearInterval(animationInterval)
      // Restart after delay
      setTimeout(startAnimation, 2000)
    }
  }, interval)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationInterval) clearInterval(animationInterval)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
