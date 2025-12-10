<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">{{ headerTitle }}</span>
      </div>
    </div>

    <!-- Phase 1: Upload -->
    <div v-if="phase === 'upload'" class="p-4 bg-gray-50/50 min-h-[420px]">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <!-- Upload Area -->
        <div
          class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300"
          :class="isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'"
        >
          <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-700 mb-1">회의 음성 파일 업로드</p>
          <p class="text-xs text-gray-400">MP3, WAV, M4A (최대 100MB)</p>
        </div>

        <!-- Uploading Progress -->
        <div v-if="isUploading" class="mt-4">
          <div class="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-800">meeting_recording.mp3</p>
              <div class="mt-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-blue-500 rounded-full transition-all duration-100"
                  :style="{ width: uploadProgress + '%' }"
                ></div>
              </div>
            </div>
            <span class="text-xs text-blue-600 font-medium">{{ uploadProgress }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Phase 2: Analysis Result -->
    <div v-else-if="phase === 'result'" class="flex min-h-[420px]">
      <!-- Left: Conversation -->
      <div class="flex-1 border-r border-gray-100 flex flex-col">
        <div class="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="text-xs font-bold text-gray-700">Speakers</span>
          </div>
          <!-- Speaker Tags -->
          <div class="flex flex-wrap gap-1.5 mt-1.5">
            <span
              v-for="(speaker, idx) in speakers"
              :key="idx"
              class="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              :class="speaker.color"
            >
              {{ speaker.name }} · {{ speaker.count }}
            </span>
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 p-2 space-y-1.5 overflow-hidden">
          <div
            v-for="(msg, idx) in visibleMessages"
            :key="idx"
            class="flex gap-2 p-1.5 rounded-lg cursor-pointer transition-all duration-200"
            :class="selectedMessage === idx ? 'bg-blue-50 ring-1 ring-blue-200' : 'hover:bg-gray-50'"
            @click="selectMessage(idx)"
          >
            <div
              class="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0"
              :class="speakers[msg.speaker].color"
            >
              {{ speakers[msg.speaker].name[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-medium text-gray-700">{{ speakers[msg.speaker].name }}</span>
                <span class="text-[9px] text-gray-400">{{ msg.time }}</span>
                <span
                  v-if="selectedMessage === idx && msg.score"
                  class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold"
                  :class="msg.score >= 8 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'"
                >
                  {{ msg.score }}
                </span>
              </div>
              <p class="text-[11px] text-gray-600 leading-snug line-clamp-2">{{ msg.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: AI Feedback (선택된 발화가 있을 때만 표시) -->
      <div
        class="w-[160px] bg-gray-50/50 flex flex-col transition-all duration-300"
        :class="selectedMessage !== null ? 'opacity-100' : 'opacity-0'"
      >
        <div class="px-3 py-2 border-b border-gray-100">
          <div class="flex items-center gap-1.5">
            <span class="text-sm">✨</span>
            <span class="text-[10px] font-bold text-gray-700">AI Feedback</span>
          </div>
        </div>

        <div class="p-2.5 space-y-2.5">
          <!-- Score -->
          <div class="text-center">
            <div class="text-2xl font-bold text-gray-900">{{ currentMessageScore }}<span class="text-sm text-gray-400">/10</span></div>
            <div class="flex justify-center gap-2 mt-1 text-[9px]">
              <div><span class="text-gray-400">명확성</span> <span class="font-bold text-gray-700">8</span></div>
              <div><span class="text-gray-400">유창성</span> <span class="font-bold text-gray-700">8</span></div>
            </div>
          </div>

          <!-- Suggestion -->
          <div class="p-2 bg-green-50 rounded-lg">
            <p class="text-[9px] font-medium text-green-700 mb-0.5">더 나은 표현</p>
            <p class="text-[9px] text-green-600 leading-relaxed">"Okay team" 대신 "Alright" 사용</p>
          </div>

          <!-- Practice Button -->
          <button
            class="w-full py-1.5 text-white text-[10px] font-bold rounded-lg transition-all duration-200 relative overflow-hidden"
            :class="isButtonPressed ? 'bg-blue-700 scale-95' : 'bg-blue-500 hover:bg-blue-600'"
          >
            학습 모드
            <!-- Click ripple effect -->
            <div
              v-if="showButtonRipple"
              class="absolute inset-0 bg-white/30 animate-ripple rounded-lg"
            ></div>
          </button>
        </div>
      </div>

    </div>

    <!-- Phase 3: Practice Mode -->
    <div v-else-if="phase === 'practice'" class="p-4 bg-gray-50/50 min-h-[420px]">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <!-- Progress -->
        <div class="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
          <span class="text-xs font-bold text-gray-700">학습 모드</span>
          <span class="text-[10px] text-gray-400">1/16</span>
        </div>

        <!-- Original vs Corrected -->
        <div class="p-3 grid grid-cols-2 gap-2">
          <div class="p-2.5 bg-red-50 rounded-lg">
            <p class="text-[9px] font-medium text-red-600 mb-1">원문</p>
            <p class="text-[11px] text-gray-700 leading-snug">"Alright team, we have the investor meeting..."</p>
          </div>
          <div class="p-2.5 bg-green-50 rounded-lg">
            <p class="text-[9px] font-medium text-green-600 mb-1">교정문</p>
            <p class="text-[11px] text-gray-700 leading-snug">"Okay team, we have the investor meeting..."</p>
          </div>
        </div>

        <!-- Recording Section -->
        <div class="px-4 pb-4">
          <div class="p-4 bg-purple-50 rounded-xl text-center">
            <div
              class="w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all duration-300"
              :class="isPracticeRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-500'"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <p class="text-xs text-purple-600 mt-2">{{ isPracticeRecording ? '녹음 중...' : '버튼을 클릭하여 녹음 시작' }}</p>
          </div>

          <!-- Practice Result -->
          <div
            v-if="showPracticeResult"
            class="mt-3 p-3 bg-white border border-gray-200 rounded-lg animate-fade-in"
          >
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-gray-700">발음 평가 결과</span>
              <span class="text-lg font-bold text-blue-600">87점</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center">
              <div class="p-2 bg-green-50 rounded">
                <p class="text-base font-bold text-green-600">93</p>
                <p class="text-[9px] text-gray-500">정확도</p>
              </div>
              <div class="p-2 bg-blue-50 rounded">
                <p class="text-base font-bold text-blue-600">96</p>
                <p class="text-[9px] text-gray-500">유창성</p>
              </div>
              <div class="p-2 bg-amber-50 rounded">
                <p class="text-base font-bold text-amber-600">72</p>
                <p class="text-[9px] text-gray-500">억양</p>
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
const phase = ref('upload')
const headerTitle = ref('Meeting Analysis')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const visibleMessages = ref([])
const selectedMessage = ref(null)
const isPracticeRecording = ref(false)
const showPracticeResult = ref(false)
const animationCompleted = ref(false)

// Button click animation state
const isButtonPressed = ref(false)
const showButtonRipple = ref(false)

// Computed
const currentMessageScore = computed(() => {
  if (selectedMessage.value !== null && visibleMessages.value[selectedMessage.value]) {
    return visibleMessages.value[selectedMessage.value].score || 0
  }
  return 0
})

// Data
const speakers = [
  { name: 'David', color: 'bg-blue-500', count: 16 },
  { name: 'Sarah', color: 'bg-purple-500', count: 10 },
  { name: 'Mike', color: 'bg-amber-500', count: 9 },
  { name: 'Jane', color: 'bg-green-500', count: 10 }
]

const messages = [
  { speaker: 0, time: '0:00', text: "Alright team, we have the investor meeting in three days.", score: 8 },
  { speaker: 1, time: '0:09', text: "The financials have been updated. Our burn rate is lower.", score: 7 },
  { speaker: 0, time: '0:16', text: "That's good news. How much lower?", score: 8 },
  { speaker: 1, time: '0:18', text: "About 15% we saved on marketing spendings.", score: 7 },
  { speaker: 2, time: '0:25', text: "Wait, you cut the marketing budget without telling me?", score: 7 },
  { speaker: 1, time: '0:31', text: "I'm sorry, but we had to make tough decisions.", score: 8 },
  { speaker: 3, time: '0:38', text: "Let's focus on what we can present to investors.", score: 9 }
]

// Methods
const selectMessage = (idx) => {
  selectedMessage.value = idx
}

// Animation
let animationTimeouts = []

const clearAllTimeouts = () => {
  animationTimeouts.forEach(t => clearTimeout(t))
  animationTimeouts = []
}

const resetState = () => {
  phase.value = 'upload'
  headerTitle.value = 'Meeting Analysis'
  isDragging.value = false
  isUploading.value = false
  uploadProgress.value = 0
  visibleMessages.value = []
  selectedMessage.value = null
  isPracticeRecording.value = false
  showPracticeResult.value = false
  animationCompleted.value = false
  isButtonPressed.value = false
  showButtonRipple.value = false
}

const startAnimation = () => {
  if (animationCompleted.value) {
    // 애니메이션이 완료된 상태에서 다시 보이면 재시작
    resetState()
  }

  // Phase 1: Upload (빠르게)
  animationTimeouts.push(setTimeout(() => {
    isDragging.value = true
  }, 300))

  animationTimeouts.push(setTimeout(() => {
    isDragging.value = false
    isUploading.value = true
  }, 600))

  // Upload progress (빠르게 - 1초 내에 완료)
  for (let i = 0; i <= 100; i += 10) {
    animationTimeouts.push(setTimeout(() => {
      uploadProgress.value = i
    }, 600 + i * 8))
  }

  // Phase 2: Result (1.5초 후)
  animationTimeouts.push(setTimeout(() => {
    phase.value = 'result'
    headerTitle.value = '분석 결과'
  }, 1600))

  // Show messages one by one (빠르게)
  messages.forEach((msg, idx) => {
    animationTimeouts.push(setTimeout(() => {
      visibleMessages.value.push(msg)
    }, 1800 + idx * 150))
  })

  // 첫번째 메시지 자동 선택 (메시지 다 나온 후)
  animationTimeouts.push(setTimeout(() => {
    selectedMessage.value = 0
  }, 2900))

  // 다른 메시지 선택 시뮬레이션
  animationTimeouts.push(setTimeout(() => {
    selectedMessage.value = 2
  }, 3800))

  animationTimeouts.push(setTimeout(() => {
    selectedMessage.value = 4
  }, 4700))

  // Result Phase 더 오래 보여주기 (5.5초까지 대기)

  // 버튼 클릭 효과 시작 (6초)
  animationTimeouts.push(setTimeout(() => {
    isButtonPressed.value = true
    showButtonRipple.value = true
  }, 6000))

  // 버튼 클릭 효과 끝 (6.3초)
  animationTimeouts.push(setTimeout(() => {
    isButtonPressed.value = false
    showButtonRipple.value = false
  }, 6300))

  // Phase 3: Practice (6.5초 후 - 버튼 클릭 후 바로 전환)
  animationTimeouts.push(setTimeout(() => {
    phase.value = 'practice'
    headerTitle.value = '학습 모드'
  }, 6500))

  animationTimeouts.push(setTimeout(() => {
    isPracticeRecording.value = true
  }, 7200))

  animationTimeouts.push(setTimeout(() => {
    isPracticeRecording.value = false
    showPracticeResult.value = true
  }, 8800))

  // 애니메이션 완료 표시 (마지막 장면에서 정지)
  animationTimeouts.push(setTimeout(() => {
    animationCompleted.value = true
  }, 9500))
}

watch(() => props.isVisible, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    // 영역에 들어왔을 때
    if (animationCompleted.value) {
      // 완료된 상태면 재시작
      resetState()
      startAnimation()
    } else if (phase.value === 'upload' && !isUploading.value) {
      // 아직 시작 안했으면 시작
      startAnimation()
    }
  } else if (!newVal) {
    // 영역에서 나갔을 때 - 타이머만 정리 (상태 유지)
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

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Ripple animation */
.animate-ripple {
  animation: ripple 0.4s ease-out forwards;
}

@keyframes ripple {
  from {
    opacity: 0.6;
    transform: scale(0.8);
  }
  to {
    opacity: 0;
    transform: scale(1.2);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
