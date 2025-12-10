<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">AI Translation Hub</span>
      </div>
    </div>

    <!-- Main Content: 3-Split Layout with Center Core -->
    <div class="relative min-h-[480px] bg-gradient-to-br from-gray-50 to-blue-50/30">
      <!-- Center: AI Terminology Core -->
      <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div
          class="relative w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl flex items-center justify-center transition-all duration-500"
          :class="coreActive ? 'scale-110 shadow-2xl shadow-blue-300/50' : ''"
        >
          <!-- Glow effect -->
          <div
            class="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"
            :class="coreActive ? 'opacity-100' : 'opacity-0'"
          ></div>

          <!-- Core icon -->
          <div class="relative z-10 text-white text-center">
            <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p class="text-[8px] font-bold mt-0.5">TERMS</p>
          </div>
        </div>

        <!-- Floating Terms (extracted terminology) -->
        <TransitionGroup name="term">
          <div
            v-for="(term, idx) in floatingTerms"
            :key="term.id"
            class="absolute px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-lg"
            :style="term.style"
            :class="term.class"
          >
            {{ term.text }}
          </div>
        </TransitionGroup>
      </div>

      <!-- Connection Lines (animated) -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 520 480">
        <!-- Text connection -->
        <path
          :d="textConnectionPath"
          fill="none"
          stroke="url(#gradient-text)"
          stroke-width="2"
          stroke-dasharray="8 4"
          class="transition-all duration-500"
          :class="textActive ? 'opacity-100' : 'opacity-20'"
        />
        <!-- Voice connection -->
        <path
          :d="voiceConnectionPath"
          fill="none"
          stroke="url(#gradient-voice)"
          stroke-width="2"
          stroke-dasharray="8 4"
          class="transition-all duration-500"
          :class="voiceActive ? 'opacity-100' : 'opacity-20'"
        />
        <!-- Video connection -->
        <path
          :d="videoConnectionPath"
          fill="none"
          stroke="url(#gradient-video)"
          stroke-width="2"
          stroke-dasharray="8 4"
          class="transition-all duration-500"
          :class="videoActive ? 'opacity-100' : 'opacity-20'"
        />
        <!-- Gradients -->
        <defs>
          <linearGradient id="gradient-text" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#3B82F6" />
            <stop offset="100%" stop-color="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient-voice" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#10B981" />
            <stop offset="100%" stop-color="#8B5CF6" />
          </linearGradient>
          <linearGradient id="gradient-video" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Left Panel: Text Translation -->
      <div class="absolute left-3 top-3 w-[160px] z-30">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500"
          :class="textActive ? 'ring-2 ring-blue-300' : ''"
        >
          <div class="px-3 py-2 bg-blue-50 border-b border-blue-100">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-[10px] font-bold text-blue-700">Text</span>
            </div>
          </div>

          <!-- Source Text -->
          <div class="p-2 border-b border-gray-50">
            <p class="text-[9px] text-gray-400 mb-1">EN</p>
            <p class="text-[11px] text-gray-700 leading-relaxed">
              <span v-for="(char, i) in displayedSourceText" :key="i">
                <span
                  v-if="isTermHighlight(i, 'source')"
                  class="bg-blue-100 text-blue-700 font-bold px-0.5 rounded"
                >{{ char }}</span>
                <span v-else>{{ char }}</span>
              </span>
              <span v-if="isTypingSource" class="inline-block w-0.5 h-3 bg-blue-500 animate-pulse ml-0.5"></span>
            </p>
          </div>

          <!-- Translated Text -->
          <div class="p-2 bg-gray-50/50">
            <p class="text-[9px] text-gray-400 mb-1">KO</p>
            <p class="text-[11px] text-gray-700 leading-relaxed">
              <span v-for="(char, i) in displayedTranslatedText" :key="i">
                <span
                  v-if="isTermHighlight(i, 'translated')"
                  class="bg-purple-100 text-purple-700 font-bold px-0.5 rounded"
                >{{ char }}</span>
                <span v-else>{{ char }}</span>
              </span>
              <span v-if="isTypingTranslated" class="inline-block w-0.5 h-3 bg-purple-500 animate-pulse ml-0.5"></span>
            </p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Voice Translation -->
      <div class="absolute right-3 top-3 w-[160px] z-30">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500"
          :class="voiceActive ? 'ring-2 ring-green-300' : ''"
        >
          <div class="px-3 py-2 bg-green-50 border-b border-green-100">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span class="text-[10px] font-bold text-green-700">Voice</span>
              <!-- Waveform indicator -->
              <div v-if="voiceActive" class="ml-auto flex gap-0.5 items-end">
                <div v-for="i in 4" :key="i" class="w-1 bg-green-400 rounded-full animate-bounce" :style="{ height: `${8 + Math.random() * 8}px`, animationDelay: `${i * 100}ms` }"></div>
              </div>
            </div>
          </div>

          <!-- Voice Messages -->
          <div class="p-2 space-y-1.5 max-h-[200px] overflow-hidden">
            <TransitionGroup name="message">
              <div
                v-for="(msg, idx) in voiceMessages"
                :key="msg.id"
                class="p-1.5 rounded-lg text-[10px]"
                :class="msg.isUser ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-700'"
              >
                <div class="flex items-center gap-1 mb-0.5">
                  <span class="font-bold">{{ msg.lang }}</span>
                  <span class="text-gray-400">·</span>
                  <span class="text-gray-400">{{ msg.speaker }}</span>
                </div>
                <p class="leading-snug">
                  <template v-for="(word, wi) in msg.words" :key="wi">
                    <span
                      :class="word.isTerm ? 'bg-green-200 text-green-800 font-bold px-0.5 rounded' : ''"
                    >{{ word.text }}</span>
                    <span v-if="wi < msg.words.length - 1"> </span>
                  </template>
                </p>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- Bottom Panel: Video Translation -->
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 w-[280px] z-30">
        <div
          class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-500"
          :class="videoActive ? 'ring-2 ring-amber-300' : ''"
        >
          <div class="px-3 py-2 bg-amber-50 border-b border-amber-100">
            <div class="flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span class="text-[10px] font-bold text-amber-700">Video</span>
              <!-- Play indicator -->
              <div v-if="videoActive" class="ml-auto flex items-center gap-1">
                <div class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                <span class="text-[9px] text-gray-500">{{ videoTime }}</span>
              </div>
            </div>
          </div>

          <!-- Video Preview -->
          <div class="relative bg-gray-900 h-[90px]">
            <!-- Fake video content -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div class="w-10 h-10 mx-auto rounded-full bg-gray-700 flex items-center justify-center mb-1">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p class="text-[9px] text-gray-500">Business Presentation</p>
              </div>
            </div>

            <!-- Subtitle -->
            <div class="absolute bottom-2 left-2 right-2">
              <div class="bg-black/70 rounded px-2 py-1 text-center">
                <p class="text-[11px] text-white leading-snug">
                  <TransitionGroup name="subtitle-char">
                    <span
                      v-for="(char, i) in videoSubtitleChars"
                      :key="i"
                      :class="char.isTerm ? 'text-amber-300 font-bold' : ''"
                      class="inline-block"
                      :style="{ animationDelay: `${i * 30}ms` }"
                    >{{ char.text }}</span>
                  </TransitionGroup>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// State
const coreActive = ref(false)
const textActive = ref(false)
const voiceActive = ref(false)
const videoActive = ref(false)

// Text Translation State
const sourceText = "The API endpoint requires OAuth authentication for secure access."
const translatedText = "API 엔드포인트는 보안 접근을 위해 OAuth 인증이 필요합니다."
const displayedSourceText = ref('')
const displayedTranslatedText = ref('')
const isTypingSource = ref(false)
const isTypingTranslated = ref(false)

// Term highlight ranges
const sourceTermRanges = [
  { start: 4, end: 16 }, // "API endpoint"
  { start: 26, end: 31 }, // "OAuth"
]
const translatedTermRanges = [
  { start: 0, end: 7 }, // "API 엔드포인트"
  { start: 20, end: 25 }, // "OAuth"
]

const isTermHighlight = (index, type) => {
  const ranges = type === 'source' ? sourceTermRanges : translatedTermRanges
  return ranges.some(r => index >= r.start && index < r.end)
}

// Voice Translation State
const voiceMessages = ref([])
const voiceMessageData = [
  { id: 1, lang: 'EN', speaker: 'David', isUser: true, words: [
    { text: 'We', isTerm: false },
    { text: 'need', isTerm: false },
    { text: 'to', isTerm: false },
    { text: 'deploy', isTerm: true },
    { text: 'the', isTerm: false },
    { text: 'update.', isTerm: false }
  ]},
  { id: 2, lang: 'KO', speaker: '번역', isUser: false, words: [
    { text: '업데이트를', isTerm: false },
    { text: '배포해야', isTerm: true },
    { text: '합니다.', isTerm: false }
  ]},
  { id: 3, lang: 'EN', speaker: 'Sarah', isUser: true, words: [
    { text: 'The', isTerm: false },
    { text: 'CI/CD', isTerm: true },
    { text: 'pipeline', isTerm: true },
    { text: 'is', isTerm: false },
    { text: 'ready.', isTerm: false }
  ]},
  { id: 4, lang: 'KO', speaker: '번역', isUser: false, words: [
    { text: 'CI/CD', isTerm: true },
    { text: '파이프라인', isTerm: true },
    { text: '준비', isTerm: false },
    { text: '완료.', isTerm: false }
  ]}
]

// Video Translation State
const videoTime = ref('0:00')
const videoSubtitleChars = ref([])
const videoSubtitles = [
  { text: "Our API integration enables seamless connectivity.", terms: ['API', 'integration'] },
  { text: "API 통합으로 원활한 연결이 가능합니다.", terms: ['API', '통합'] }
]

// Floating Terms
const floatingTerms = ref([])
const termData = [
  { id: 1, text: 'API', class: 'bg-blue-500 text-white' },
  { id: 2, text: 'OAuth', class: 'bg-purple-500 text-white' },
  { id: 3, text: 'Deploy', class: 'bg-green-500 text-white' },
  { id: 4, text: 'CI/CD', class: 'bg-amber-500 text-white' }
]

// Connection paths
const textConnectionPath = computed(() => 'M 170 120 Q 220 180, 260 240')
const voiceConnectionPath = computed(() => 'M 350 120 Q 300 180, 260 240')
const videoConnectionPath = computed(() => 'M 260 320 L 260 280')

// Animation
let animationTimeouts = []
const animationCompleted = ref(false)

const clearAllTimeouts = () => {
  animationTimeouts.forEach(t => clearTimeout(t))
  animationTimeouts = []
}

const resetState = () => {
  coreActive.value = false
  textActive.value = false
  voiceActive.value = false
  videoActive.value = false
  displayedSourceText.value = ''
  displayedTranslatedText.value = ''
  isTypingSource.value = false
  isTypingTranslated.value = false
  voiceMessages.value = []
  videoTime.value = '0:00'
  videoSubtitleChars.value = []
  floatingTerms.value = []
  animationCompleted.value = false
}

const startAnimation = () => {
  if (animationCompleted.value) {
    resetState()
  }

  // 0.3s: Activate core
  animationTimeouts.push(setTimeout(() => {
    coreActive.value = true
  }, 300))

  // 0.5s: Add floating terms one by one
  termData.forEach((term, idx) => {
    animationTimeouts.push(setTimeout(() => {
      const angle = (idx * 90 + 45) * (Math.PI / 180)
      const radius = 55
      floatingTerms.value.push({
        ...term,
        style: {
          left: `${40 + Math.cos(angle) * radius}px`,
          top: `${40 + Math.sin(angle) * radius}px`,
          transform: 'translate(-50%, -50%)'
        }
      })
    }, 500 + idx * 200))
  })

  // 1.5s: Start text translation
  animationTimeouts.push(setTimeout(() => {
    textActive.value = true
    isTypingSource.value = true
  }, 1500))

  // Type source text
  for (let i = 0; i <= sourceText.length; i++) {
    animationTimeouts.push(setTimeout(() => {
      displayedSourceText.value = sourceText.slice(0, i)
    }, 1600 + i * 30))
  }

  // 3.5s: Start translated text
  animationTimeouts.push(setTimeout(() => {
    isTypingSource.value = false
    isTypingTranslated.value = true
  }, 3500))

  for (let i = 0; i <= translatedText.length; i++) {
    animationTimeouts.push(setTimeout(() => {
      displayedTranslatedText.value = translatedText.slice(0, i)
    }, 3600 + i * 35))
  }

  animationTimeouts.push(setTimeout(() => {
    isTypingTranslated.value = false
  }, 5200))

  // 2.5s: Start voice translation (parallel)
  animationTimeouts.push(setTimeout(() => {
    voiceActive.value = true
  }, 2500))

  voiceMessageData.forEach((msg, idx) => {
    animationTimeouts.push(setTimeout(() => {
      voiceMessages.value.push(msg)
    }, 2700 + idx * 600))
  })

  // 3.0s: Start video translation (parallel)
  animationTimeouts.push(setTimeout(() => {
    videoActive.value = true
    updateVideoTime()
  }, 3000))

  // Show first subtitle
  animationTimeouts.push(setTimeout(() => {
    showVideoSubtitle(0)
  }, 3200))

  // Show second subtitle
  animationTimeouts.push(setTimeout(() => {
    showVideoSubtitle(1)
  }, 5500))

  // Mark animation complete
  animationTimeouts.push(setTimeout(() => {
    animationCompleted.value = true
  }, 7500))
}

const updateVideoTime = () => {
  let seconds = 0
  const interval = setInterval(() => {
    if (!videoActive.value || animationCompleted.value) {
      clearInterval(interval)
      return
    }
    seconds++
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    videoTime.value = `${mins}:${secs.toString().padStart(2, '0')}`
  }, 1000)
}

const showVideoSubtitle = (index) => {
  const subtitle = videoSubtitles[index]
  const chars = []

  for (let i = 0; i < subtitle.text.length; i++) {
    const char = subtitle.text[i]
    const isTerm = subtitle.terms.some(term => {
      const termStart = subtitle.text.indexOf(term)
      return i >= termStart && i < termStart + term.length
    })
    chars.push({ text: char, isTerm })
  }

  videoSubtitleChars.value = chars
}

watch(() => props.isVisible, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    if (animationCompleted.value) {
      resetState()
      startAnimation()
    } else if (!coreActive.value) {
      startAnimation()
    }
  } else if (!newVal) {
    clearAllTimeouts()
  }
})

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  clearAllTimeouts()
})
</script>

<style scoped>
/* Term animation */
.term-enter-active {
  transition: all 0.4s ease-out;
}
.term-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5);
}

/* Message animation */
.message-enter-active {
  transition: all 0.3s ease-out;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* Subtitle character animation */
.subtitle-char-enter-active {
  transition: all 0.2s ease-out;
}
.subtitle-char-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
</style>
