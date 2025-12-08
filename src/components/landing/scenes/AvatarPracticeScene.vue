<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-[775px]">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">아바타 회화 연습</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="h-[500px] bg-gradient-to-b from-blue-50 to-white flex">
      <!-- Left: Chat Area -->
      <div class="flex-1 flex flex-col">
        <!-- Scenario Badge -->
        <div class="px-4 py-3 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">🇺🇸</span>
            <span class="text-sm font-bold text-gray-900">프로젝트 요구사항 협의</span>
            <span class="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-bold">중급</span>
          </div>
        </div>

        <!-- Avatar Area -->
        <div
          class="relative h-28 bg-gradient-to-b from-blue-100/50 to-transparent flex items-center justify-center"
          :style="{ opacity: showAvatar ? 1 : 0 }"
        >
          <!-- Avatar with silhouette reveal -->
          <div class="relative">
            <!-- Silhouette overlay -->
            <div
              class="absolute inset-0 rounded-full bg-gray-900 z-20 transition-opacity duration-1000"
              :style="{ opacity: silhouetteOpacity }"
            ></div>

            <!-- Avatar -->
            <div class="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg z-10">
              <div class="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200">
                <!-- Hair -->
                <div class="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-10 bg-gray-800 rounded-t-full"></div>
                <!-- Face -->
                <div class="absolute top-6 left-1/2 -translate-x-1/2 w-12 h-14 bg-amber-100 rounded-full"></div>
                <!-- Eyes -->
                <div class="absolute top-10 left-1/2 -translate-x-1/2 flex gap-3" :class="{ 'translate-y-0.5': isListening }">
                  <div class="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                  <div class="w-1.5 h-1.5 bg-gray-800 rounded-full"></div>
                </div>
                <!-- Mouth -->
                <div
                  class="absolute top-14 left-1/2 -translate-x-1/2 w-3 bg-pink-400 rounded-full transition-all"
                  :class="isSpeaking ? 'h-2 animate-pulse' : 'h-0.5'"
                ></div>
                <!-- Body -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-6 bg-gray-700 rounded-t-xl"></div>
              </div>
            </div>

            <!-- Speaking indicator -->
            <div v-if="isSpeaking" class="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
              <div class="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-1 h-4 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 100ms"></div>
              <div class="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 200ms"></div>
            </div>
          </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 p-4 space-y-3 overflow-y-auto">
          <div
            v-for="(msg, index) in visibleMessages"
            :key="index"
            class="flex"
            :class="msg.speaker === 'user' ? 'justify-end' : 'justify-start'"
          >
            <div
              class="max-w-[70%] px-3 py-2 rounded-2xl text-sm"
              :class="msg.speaker === 'user'
                ? 'bg-blue-500 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-800 rounded-bl-md'"
            >
              {{ msg.text }}
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="showTyping" class="flex justify-start">
            <div class="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-md flex gap-1">
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-3 border-t border-gray-100 bg-white">
          <div class="flex items-center gap-2">
            <div class="flex-1 relative">
              <input
                type="text"
                :value="userInput"
                readonly
                class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none"
                placeholder="영어로 답변하세요..."
              />
            </div>
            <!-- Record Button -->
            <button
              class="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              :class="isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          <!-- Waveform -->
          <div v-if="isRecording" class="mt-2 flex items-center justify-center gap-0.5 h-8">
            <div
              v-for="(h, i) in waveformHeights"
              :key="i"
              class="w-1 bg-red-400 rounded-full transition-all duration-75"
              :style="{ height: h + 'px' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Right: Feedback Panel -->
      <div
        class="w-64 bg-gray-50 border-l border-gray-100 p-4 flex flex-col transition-all duration-500"
        :style="{ opacity: showFeedback ? 1 : 0, transform: showFeedback ? 'translateX(0)' : 'translateX(20px)' }"
      >
        <h3 class="text-sm font-bold text-gray-900 mb-4">실시간 피드백</h3>

        <!-- Score -->
        <div class="bg-white rounded-xl p-4 shadow-sm mb-4" :style="{ opacity: showScore ? 1 : 0 }">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 mb-1">{{ displayScore }}</div>
            <div class="text-[10px] text-gray-500">종합 점수</div>
          </div>
        </div>

        <!-- Breakdown -->
        <div class="space-y-2 mb-4" :style="{ opacity: showBreakdown ? 1 : 0 }">
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600">발음</span>
            <div class="flex items-center gap-1">
              <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-green-500 rounded-full" style="width: 85%"></div>
              </div>
              <span class="text-gray-700 font-bold">85</span>
            </div>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600">유창성</span>
            <div class="flex items-center gap-1">
              <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-blue-500 rounded-full" style="width: 90%"></div>
              </div>
              <span class="text-gray-700 font-bold">90</span>
            </div>
          </div>
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600">정확성</span>
            <div class="flex items-center gap-1">
              <div class="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div class="h-full bg-purple-500 rounded-full" style="width: 88%"></div>
              </div>
              <span class="text-gray-700 font-bold">88</span>
            </div>
          </div>
        </div>

        <!-- Suggestion -->
        <div
          class="bg-blue-50 rounded-xl p-3 mb-3"
          :style="{ opacity: showSuggestion ? 1 : 0 }"
        >
          <div class="flex items-start gap-2">
            <span class="text-lg">💡</span>
            <div>
              <p class="text-[10px] font-bold text-blue-700 mb-1">개선 포인트</p>
              <p class="text-[10px] text-blue-600">"requirements"의 발음에서 r 소리를 더 강하게 해보세요.</p>
            </div>
          </div>
        </div>

        <!-- Pronunciation -->
        <div
          class="bg-green-50 rounded-xl p-3"
          :style="{ opacity: showPronunciation ? 1 : 0 }"
        >
          <div class="flex items-start gap-2">
            <span class="text-lg">🎯</span>
            <div>
              <p class="text-[10px] font-bold text-green-700 mb-1">잘한 점</p>
              <p class="text-[10px] text-green-600">비즈니스 표현 "let's discuss"를 정확하게 사용했어요!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animationComplete'])

// Refs
const containerRef = ref(null)

// Messages
const messages = [
  { speaker: 'ai', text: "Good morning! Shall we discuss the project requirements for the Vietnam partnership?" },
  { speaker: 'user', text: "Yes, let's discuss the key requirements first." },
  { speaker: 'ai', text: "Great! I've prepared a summary of the main deliverables. Would you like me to go through them?" }
]

// State
const showAvatar = ref(false)
const silhouetteOpacity = ref(1)
const isSpeaking = ref(false)
const isListening = ref(false)
const isRecording = ref(false)
const showTyping = ref(false)
const visibleMessages = ref([])
const userInput = ref('')
const waveformHeights = ref(Array(20).fill(4))

// Feedback
const showFeedback = ref(false)
const showScore = ref(false)
const displayScore = ref(0)
const showBreakdown = ref(false)
const showSuggestion = ref(false)
const showPronunciation = ref(false)

let timeline = null
let waveformInterval = null

// Waveform animation
const startWaveform = () => {
  waveformInterval = setInterval(() => {
    waveformHeights.value = waveformHeights.value.map(() =>
      Math.floor(Math.random() * 24) + 4
    )
  }, 100)
}

const stopWaveform = () => {
  if (waveformInterval) {
    clearInterval(waveformInterval)
    waveformInterval = null
  }
  waveformHeights.value = Array(20).fill(4)
}

// Reset state
const resetState = () => {
  showAvatar.value = false
  silhouetteOpacity.value = 1
  isSpeaking.value = false
  isListening.value = false
  isRecording.value = false
  showTyping.value = false
  visibleMessages.value = []
  userInput.value = ''
  waveformHeights.value = Array(20).fill(4)
  showFeedback.value = false
  showScore.value = false
  displayScore.value = 0
  showBreakdown.value = false
  showSuggestion.value = false
  showPronunciation.value = false
  stopWaveform()
}

// Run animation
const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // Step 1: Show avatar silhouette (0s)
  timeline.add(() => {
    showAvatar.value = true
  }, 0)

  // Step 2: Reveal avatar (0.5s - 1.5s)
  timeline.to(silhouetteOpacity, {
    value: 0,
    duration: 1,
    ease: 'power2.inOut'
  }, 0.5)

  // Step 3: AI speaks first message (2s - 3.5s)
  timeline.add(() => { isSpeaking.value = true }, 2.0)
  timeline.add(() => { visibleMessages.value = [messages[0]] }, 2.3)
  timeline.add(() => { isSpeaking.value = false }, 3.5)

  // Step 4: User records (4s - 6s)
  timeline.add(() => {
    isListening.value = true
    isRecording.value = true
    startWaveform()
  }, 4.0)

  timeline.add(() => {
    isListening.value = false
    isRecording.value = false
    stopWaveform()
  }, 6.0)

  // Step 5: Type user message (6s - 7s)
  const userText = messages[1].text
  for (let i = 0; i <= userText.length; i++) {
    timeline.add(() => {
      userInput.value = userText.slice(0, i)
    }, 6.0 + i * 0.025)
  }

  // Step 6: Send user message (7.2s)
  timeline.add(() => {
    userInput.value = ''
    visibleMessages.value = [messages[0], messages[1]]
  }, 7.2)

  // Step 7: AI typing (7.5s - 8.5s)
  timeline.add(() => { showTyping.value = true }, 7.5)
  timeline.add(() => {
    isSpeaking.value = true
    showTyping.value = false
    visibleMessages.value = [...messages]
  }, 8.5)
  timeline.add(() => { isSpeaking.value = false }, 9.5)

  // Step 8: Show feedback panel (10s+)
  timeline.add(() => {
    showFeedback.value = true
    showScore.value = true
  }, 10.0)

  // Animate score
  timeline.to(displayScore, {
    value: 87,
    duration: 1.2,
    ease: 'power2.out',
    onUpdate: () => {
      displayScore.value = Math.round(displayScore.value)
    }
  }, 10.0)

  timeline.add(() => { showBreakdown.value = true }, 11.0)
  timeline.add(() => { showSuggestion.value = true }, 11.5)
  timeline.add(() => { showPronunciation.value = true }, 12.0)
}

// Restart animation
const restartAnimation = () => {
  if (timeline) timeline.kill()
  resetState()
  nextTick(() => runAnimation())
}

defineExpose({ restartAnimation })

// Watch isActive
watch(() => props.isActive, (active) => {
  if (active) {
    runAnimation()
  } else {
    if (timeline) timeline.kill()
    resetState()
  }
}, { immediate: true })

onUnmounted(() => {
  if (timeline) timeline.kill()
  stopWaveform()
})
</script>

<style scoped>
</style>
