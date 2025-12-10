<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-blue-50 px-4 py-3 border-b border-blue-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <div class="ml-4 flex items-center gap-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm text-blue-700 font-medium">텍스트 번역</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-5 min-h-[380px]">
      <!-- Language Selector -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">한국어</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span class="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">English</span>
        </div>
        <div class="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span class="text-xs text-green-600 font-medium">용어집 적용중</span>
        </div>
      </div>

      <!-- Translation Panels -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Source Text (Korean) - 항상 고정 표시 -->
        <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p class="text-xs text-gray-400 mb-2 font-medium">원문 (한국어)</p>
          <div class="min-h-[180px]">
            <p class="text-sm text-gray-700 leading-relaxed">
              <template v-for="(char, i) in sourceText" :key="'src-' + i">
                <span
                  :class="isSourceTermHighlight(i) ? 'bg-blue-200 text-blue-800 font-bold px-0.5 rounded' : ''"
                >{{ char }}</span>
              </template>
            </p>
          </div>
        </div>

        <!-- Translated Text (English) - 타이핑 애니메이션 -->
        <div class="bg-green-50/50 rounded-xl p-4 border border-green-100">
          <p class="text-xs text-green-400 mb-2 font-medium">번역 (English)</p>
          <div class="min-h-[180px]">
            <p class="text-sm text-gray-700 leading-relaxed">
              <template v-for="(char, i) in displayedTranslatedText" :key="'tr-' + i">
                <span
                  :class="isTranslatedTermHighlight(i) ? 'bg-green-200 text-green-800 font-bold px-0.5 rounded' : ''"
                >{{ char }}</span>
              </template>
              <span v-if="isTyping" class="inline-block w-0.5 h-4 bg-green-500 animate-pulse ml-0.5"></span>
            </p>
          </div>
        </div>
      </div>

      <!-- Terminology Matches -->
      <div
        v-if="showTermMatches"
        class="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100"
      >
        <div class="flex items-center gap-2 mb-2">
          <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span class="text-xs font-bold text-blue-700">전문용어 매칭</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <div
            v-for="(term, idx) in visibleTerms"
            :key="idx"
            class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm"
          >
            <span class="text-xs font-bold text-blue-600">{{ term.ko }}</span>
            <svg class="w-3 h-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            <span class="text-xs font-bold text-green-600">{{ term.en }}</span>
          </div>
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
const displayedTranslatedText = ref('')
const isTyping = ref(false)
const showTermMatches = ref(false)
const visibleTerms = ref([])
const animationCompleted = ref(false)

// Data - 한국어 원문은 고정, 영어 번역만 타이핑
const sourceText = "API 엔드포인트는 보안 접근을 위해 OAuth 인증이 필요합니다. 배포 파이프라인을 그에 맞게 구성해 주세요."
const translatedText = "The API endpoint requires OAuth authentication for secure access. Please configure the deployment pipeline accordingly."

// 한국어 원문 전문용어 위치
const sourceTermRanges = [
  { start: 0, end: 8 },    // "API 엔드포인트"
  { start: 21, end: 26 },  // "OAuth"
  { start: 40, end: 42 },  // "배포"
  { start: 43, end: 49 }   // "파이프라인"
]

// 영어 번역 전문용어 위치
const translatedTermRanges = [
  { start: 4, end: 16 },   // "API endpoint"
  { start: 26, end: 31 },  // "OAuth"
  { start: 78, end: 88 },  // "deployment"
  { start: 89, end: 97 }   // "pipeline"
]

const terms = [
  { ko: 'API 엔드포인트', en: 'API endpoint' },
  { ko: 'OAuth', en: 'OAuth' },
  { ko: '배포', en: 'deployment' },
  { ko: '파이프라인', en: 'pipeline' }
]

const isSourceTermHighlight = (index) => {
  return sourceTermRanges.some(r => index >= r.start && index < r.end)
}

const isTranslatedTermHighlight = (index) => {
  return translatedTermRanges.some(r => index >= r.start && index < r.end)
}

// Animation
let animationTimeouts = []

const clearAllTimeouts = () => {
  animationTimeouts.forEach(t => clearTimeout(t))
  animationTimeouts = []
}

const resetState = () => {
  displayedTranslatedText.value = ''
  isTyping.value = false
  showTermMatches.value = false
  visibleTerms.value = []
  animationCompleted.value = false
}

const startAnimation = () => {
  if (animationCompleted.value) return // 이미 완료됐으면 다시 실행 안함

  // 바로 번역 타이핑 시작
  animationTimeouts.push(setTimeout(() => {
    isTyping.value = true
  }, 300))

  // Type translated text (영어)
  for (let i = 0; i <= translatedText.length; i++) {
    animationTimeouts.push(setTimeout(() => {
      displayedTranslatedText.value = translatedText.slice(0, i)
    }, 400 + i * 25))
  }

  const translatedEndTime = 400 + translatedText.length * 25

  animationTimeouts.push(setTimeout(() => {
    isTyping.value = false
  }, translatedEndTime))

  // Show term matches
  animationTimeouts.push(setTimeout(() => {
    showTermMatches.value = true
  }, translatedEndTime + 200))

  // Show terms one by one
  terms.forEach((term, idx) => {
    animationTimeouts.push(setTimeout(() => {
      visibleTerms.value.push(term)
    }, translatedEndTime + 300 + idx * 150))
  })

  // Mark complete & emit event
  animationTimeouts.push(setTimeout(() => {
    animationCompleted.value = true
    emit('animation-complete')
  }, translatedEndTime + 300 + terms.length * 150 + 300))
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
