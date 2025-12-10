<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-[775px]">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">{{ headerTitle }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative h-[500px] overflow-hidden">
      <!-- Phase 1: Scenario Selection (from ScenarioGenerationScene) -->
      <div
        v-if="phase === 'scenario'"
        class="absolute inset-0 bg-gray-50 p-4 overflow-hidden"
      >
        <!-- Header -->
        <div class="relative text-center mb-3">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-blue-700 font-bold text-xs">AI 시나리오 생성 완료</span>
          </div>
        </div>

        <!-- Scenario Cards -->
        <div class="relative grid grid-cols-3 gap-2.5">
          <div
            v-for="(scenario, index) in scenarios"
            :key="index"
            :ref="el => { if (index === 0) firstCardRef = el }"
            class="bg-white rounded-xl p-3 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            :class="selectedScenario === index
              ? 'border-blue-400 ring-2 ring-blue-200'
              : 'border-gray-100 hover:border-gray-200'"
          >
            <!-- Flag & Difficulty -->
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="text-base">{{ scenario.flag }}</span>
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                :class="scenario.difficultyClass"
              >
                {{ scenario.difficultyLabel }}
              </span>
            </div>

            <!-- Title & Description -->
            <h4 class="text-gray-900 font-bold text-[11px] mb-0.5 leading-tight">{{ scenario.title }}</h4>
            <p class="text-gray-500 text-[9px] mb-2 leading-tight">{{ scenario.description }}</p>

            <!-- Roles Box -->
            <div class="bg-gray-50 rounded-lg p-1.5 mb-2">
              <div class="flex items-center justify-between text-[8px]">
                <div class="text-center flex-1">
                  <span class="text-gray-400 block">You</span>
                  <span class="text-gray-700 font-semibold">{{ scenario.userRole }}</span>
                </div>
                <div class="text-gray-300 px-1">vs</div>
                <div class="text-center flex-1">
                  <span class="text-gray-400 block">AI</span>
                  <span class="text-gray-700 font-semibold">{{ scenario.aiRole }}</span>
                </div>
              </div>
            </div>

            <!-- Start Button -->
            <button
              :ref="el => { if (index === 0) startButtonRef = el }"
              class="w-full py-1.5 font-bold text-[9px] rounded-lg transition-all"
              :class="selectedScenario === index
                ? 'bg-blue-500 text-white hover:bg-blue-600 ring-2 ring-blue-300'
                : 'bg-gray-900 text-white hover:bg-gray-800'"
            >
              연습 시작
            </button>
          </div>
        </div>

        <!-- Click Ripple -->
        <div
          v-if="showClickRipple"
          class="absolute rounded-full border-4 border-blue-400 pointer-events-none z-50"
          :style="clickRippleStyle"
        ></div>
      </div>

      <!-- Phase 2: Practice Screen -->
      <div
        v-if="phase === 'practice'"
        class="absolute inset-0 flex bg-white"
      >
        <!-- Main Area (피드백 나오면 줄어듦) -->
        <div
          class="h-full flex flex-col transition-all duration-700 ease-out"
          :style="{ width: showFeedback ? 'calc(100% - 200px)' : '100%' }"
        >
          <!-- 상단: 시나리오 정보 바 -->
          <div class="bg-white border-b border-gray-200 px-4 py-2">
            <div class="flex items-center gap-2">
              <span class="text-lg">🇺🇸</span>
              <span class="text-sm font-bold text-gray-800">프로젝트 요구사항 협의</span>
              <span class="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">중급</span>
            </div>
          </div>

          <!-- 중앙: 아바타 영상 + 대화 오버레이 -->
          <div class="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
            <!-- Video (네모, 전체, 얼굴 위치 조절) -->
            <video
              ref="avatarVideoRef"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
              :style="{ opacity: avatarOpacity, objectPosition: '50% 1%' }"
              :src="avatarVideoSrc"
              muted
              playsinline
              loop
            ></video>

            <!-- 하단 그라데이션 오버레이 (텍스트 가독성) -->
            <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>

            <!-- 대화 메시지 (영상 하단에 붙어있음, 3개 표시) -->
            <div class="absolute bottom-0 left-0 right-0 px-4 pb-2">
              <div class="space-y-2">
                <TransitionGroup name="message">
                  <div
                    v-for="msg in visibleMessages.slice(-3)"
                    :key="'msg-' + msg.text"
                    class="flex"
                    :class="msg.speaker === 'user' ? 'justify-end' : 'justify-start'"
                  >
                    <div
                      class="max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-lg"
                      :class="msg.speaker === 'user'
                        ? 'bg-blue-500 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 rounded-bl-sm'"
                    >
                      {{ msg.text }}
                    </div>
                  </div>
                </TransitionGroup>

                <!-- Typing indicator -->
                <Transition name="fade">
                  <div v-if="showTyping" class="flex justify-start">
                    <div class="bg-white px-4 py-2 rounded-2xl rounded-bl-sm flex gap-1.5 shadow-lg">
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Speaking/Listening Indicator (상단에 표시) -->
            <Transition name="fade">
              <div v-if="isSpeaking" class="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-blue-500/90 rounded-full">
                <div class="w-1.5 h-4 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-1.5 h-5 bg-white rounded-full animate-bounce" style="animation-delay: 100ms"></div>
                <div class="w-1.5 h-4 bg-white rounded-full animate-bounce" style="animation-delay: 200ms"></div>
                <span class="text-xs font-bold text-white ml-1">말하는 중...</span>
              </div>
            </Transition>

            <Transition name="fade">
              <div v-if="isListening && !isSpeaking" class="absolute top-3 left-1/2 -translate-x-1/2">
                <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 rounded-full">
                  <div class="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
                  <span class="text-xs font-bold text-white">듣는 중...</span>
                </div>
              </div>
            </Transition>

            <!-- Hint Bubble (노란색, 더 크게) -->
            <Transition name="bubble">
              <div
                v-if="showHintBubble"
                class="absolute top-1/2 -translate-y-1/2 right-4 max-w-[220px] bg-amber-50 rounded-xl shadow-xl p-4 border-2 border-amber-300"
              >
                <div class="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-r-[10px] border-transparent border-r-amber-300"></div>
                <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[9px] border-b-[9px] border-r-[9px] border-transparent border-r-amber-50"></div>
                <div class="flex items-start gap-2.5">
                  <span class="text-xl">💡</span>
                  <div>
                    <p class="text-xs font-bold text-amber-700 mb-1">힌트</p>
                    <p class="text-xs text-amber-900 leading-relaxed">{{ currentHint }}</p>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- 하단: 입력 영역 -->
          <div class="bg-white border-t border-gray-200 px-3 py-2.5">
            <div class="flex items-center gap-2">
              <!-- Hint Button -->
              <button
                class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                :class="showHintBubble
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-gray-100 text-gray-500'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>

              <div class="flex-1">
                <input
                  type="text"
                  :value="userInput"
                  readonly
                  class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none"
                  placeholder="영어로 답변하세요..."
                />
              </div>

              <!-- Record Button -->
              <button
                class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                :class="isRecording
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200'
                  : 'bg-gray-900 text-white'"
              >
                <svg v-if="!isRecording" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <div v-else class="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
              </button>
            </div>

            <!-- Waveform -->
            <Transition name="slide-up">
              <div v-if="isRecording" class="mt-2 flex items-center justify-center gap-0.5 h-5">
                <div
                  v-for="(h, i) in waveformHeights"
                  :key="i"
                  class="w-1 bg-red-400 rounded-full transition-all duration-75"
                  :style="{ height: Math.min(h, 18) + 'px' }"
                ></div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Right: Feedback Panel -->
        <div
          class="w-[200px] bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-700 ease-out"
          :style="{
            marginRight: showFeedback ? '0' : '-200px',
            opacity: showFeedback ? 1 : 0
          }"
        >
          <div class="p-3 border-b border-gray-100 bg-white/50">
            <h3 class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              실시간 피드백
            </h3>
          </div>

          <div class="flex-1 p-3 space-y-3 overflow-y-auto">
            <!-- Score Card -->
            <Transition name="scale">
              <div v-if="showScore" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
                <div class="text-center">
                  <div class="text-2xl font-bold text-blue-600 mb-0.5">{{ displayScore }}</div>
                  <div class="text-[9px] text-gray-500 font-medium">종합 점수</div>
                </div>
              </div>
            </Transition>

            <!-- Score Breakdown -->
            <Transition name="slide-up">
              <div v-if="showBreakdown" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
                <div v-for="(item, idx) in scoreItems" :key="idx" class="flex justify-between items-center">
                  <span class="text-[10px] text-gray-600">{{ item.label }}</span>
                  <div class="flex items-center gap-1.5">
                    <div class="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-1000"
                        :class="item.colorClass"
                        :style="{ width: item.width }"
                      ></div>
                    </div>
                    <span class="text-[10px] text-gray-700 font-bold w-5">{{ item.score }}</span>
                  </div>
                </div>
              </div>
            </Transition>

            <!-- Feedback Timeline -->
            <TransitionGroup name="timeline" tag="div" class="space-y-2">
              <div
                v-for="(feedback, idx) in visibleFeedbacks"
                :key="'feedback-' + idx"
                class="rounded-xl p-2.5 shadow-sm border"
                :class="feedback.type === 'good' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'"
              >
                <div class="flex items-start gap-2">
                  <span class="text-sm">{{ feedback.icon }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[9px] font-bold mb-0.5" :class="feedback.type === 'good' ? 'text-green-700' : 'text-blue-700'">
                      {{ feedback.title }}
                    </p>
                    <p class="text-[9px] leading-relaxed" :class="feedback.type === 'good' ? 'text-green-600' : 'text-blue-600'">
                      {{ feedback.content }}
                    </p>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- Transition Overlay -->
      <div
        class="absolute inset-0 bg-white pointer-events-none z-40 transition-opacity duration-500"
        :style="{ opacity: transitionOverlay }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

// 공유 데이터 import
import { scenarios } from '../data/scenarioData'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animationComplete'])

// Refs
const containerRef = ref(null)
const avatarVideoRef = ref(null)
const firstCardRef = ref(null)
const startButtonRef = ref(null)

// scenarios는 scenarioData.js에서 import됨

// Messages
const messages = [
  { speaker: 'ai', text: "Good morning! Shall we discuss the project requirements for the partnership?" },
  { speaker: 'user', text: "Yes, let's discuss the key requirements first." },
  { speaker: 'ai', text: "Great! I've prepared a summary of the main deliverables." }
]

// Feedbacks
const feedbacks = [
  { type: 'good', icon: '🎯', title: '잘한 점', content: '"let\'s discuss"를 자연스럽게 사용했어요!' },
  { type: 'tip', icon: '💡', title: '개선 포인트', content: '"requirements" 발음에서 r 소리를 더 강조해보세요.' },
  { type: 'good', icon: '✨', title: '표현력', content: '비즈니스 상황에 적합한 표현을 선택했습니다.' }
]

// Score items
const scoreItems = ref([
  { label: '발음', score: 0, width: '0%', colorClass: 'bg-green-500' },
  { label: '유창성', score: 0, width: '0%', colorClass: 'bg-blue-500' },
  { label: '정확성', score: 0, width: '0%', colorClass: 'bg-purple-500' }
])

// State
const phase = ref('scenario')
const headerTitle = ref('AI 시나리오 생성 완료')
const selectedScenario = ref(null)
const showClickRipple = ref(false)
const clickRippleStyle = ref({})
const transitionOverlay = ref(0)

// Avatar state
const avatarVideoSrc = '/videos/avatar-practice.mov'
const avatarOpacity = ref(0)
const isSpeaking = ref(false)
const isListening = ref(false)

// Chat state
const visibleMessages = ref([])
const showTyping = ref(false)
const userInput = ref('')
const isRecording = ref(false)
const waveformHeights = ref(Array(20).fill(4))

// Hint state
const showHintBubble = ref(false)
const currentHint = ref('Try using "Let\'s discuss..." to start the conversation.')

// Feedback state
const showFeedback = ref(false)
const showScore = ref(false)
const displayScore = ref(0)
const showBreakdown = ref(false)
const visibleFeedbacks = ref([])

let timeline = null
let waveformInterval = null

// Methods
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

const playVideo = () => {
  if (avatarVideoRef.value) {
    avatarVideoRef.value.currentTime = 0
    avatarVideoRef.value.play().catch(() => {})
  }
}

const pauseVideo = () => {
  if (avatarVideoRef.value) {
    avatarVideoRef.value.pause()
  }
}

const resetState = () => {
  phase.value = 'scenario'
  headerTitle.value = 'AI 시나리오 생성 완료'
  selectedScenario.value = null
  showClickRipple.value = false
  clickRippleStyle.value = {}
  transitionOverlay.value = 0

  avatarOpacity.value = 0
  isSpeaking.value = false
  isListening.value = false

  visibleMessages.value = []
  showTyping.value = false
  userInput.value = ''
  isRecording.value = false
  waveformHeights.value = Array(20).fill(4)

  showHintBubble.value = false
  currentHint.value = 'Try using "Let\'s discuss..." to start the conversation.'

  showFeedback.value = false
  showScore.value = false
  displayScore.value = 0
  showBreakdown.value = false
  visibleFeedbacks.value = []

  scoreItems.value = [
    { label: '발음', score: 0, width: '0%', colorClass: 'bg-green-500' },
    { label: '유창성', score: 0, width: '0%', colorClass: 'bg-blue-500' },
    { label: '정확성', score: 0, width: '0%', colorClass: 'bg-purple-500' }
  ]

  stopWaveform()
  pauseVideo()
}

const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // Phase 1: Scenario Selection
  // Select first scenario
  timeline.add(() => {
    selectedScenario.value = 0
  }, 0.5)

  // Click effect on "연습 시작" button (첫번째 카드의 버튼 위치)
  timeline.add(() => {
    showClickRipple.value = true
    // 첫번째 카드 버튼 위치: 카드 왼쪽 상단(16px padding) + 카드 너비(~240px)/2 = 약 136px
    // 카드 높이: header(~44px) + card padding + content = 약 200px
    clickRippleStyle.value = {
      left: '136px',
      top: '160px',
      width: '20px',
      height: '20px',
      opacity: 1
    }
    gsap.to(clickRippleStyle.value, {
      width: '80px',
      height: '80px',
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    })
  }, 1.5)

  // Transition to practice
  timeline.to(transitionOverlay, { value: 1, duration: 0.4 }, 2.0)

  timeline.add(() => {
    phase.value = 'practice'
    headerTitle.value = '아바타 회화 연습'
    showClickRipple.value = false
  }, 2.4)

  timeline.to(transitionOverlay, { value: 0, duration: 0.4 }, 2.5)

  // Phase 2: Practice
  // Show avatar (검은 화면 시간 최소화 - 바로 아바타 등장)
  timeline.to(avatarOpacity, { value: 1, duration: 0.3 }, 2.5)

  timeline.add(() => {
    playVideo()
  }, 2.5)

  // AI speaks first message
  timeline.add(() => {
    isSpeaking.value = true
  }, 2.8)

  timeline.add(() => {
    visibleMessages.value = [messages[0]]
  }, 3.1)

  timeline.add(() => {
    isSpeaking.value = false
  }, 4.6)

  // Show hint
  timeline.add(() => {
    showHintBubble.value = true
  }, 5.1)

  timeline.add(() => {
    showHintBubble.value = false
  }, 7.1)

  // User starts recording
  timeline.add(() => {
    isListening.value = true
    isRecording.value = true
    startWaveform()
  }, 7.6)

  // User finishes recording
  timeline.add(() => {
    isRecording.value = false
    stopWaveform()
  }, 9.6)

  // Type user message
  const userText = messages[1].text
  for (let i = 0; i <= userText.length; i++) {
    timeline.add(() => {
      userInput.value = userText.slice(0, i)
    }, 9.6 + i * 0.03)
  }

  // Send user message
  timeline.add(() => {
    userInput.value = ''
    isListening.value = false
    visibleMessages.value = [messages[0], messages[1]]
  }, 11.1)

  // AI typing
  timeline.add(() => {
    showTyping.value = true
  }, 11.6)

  timeline.add(() => {
    isSpeaking.value = true
    showTyping.value = false
    visibleMessages.value = [...messages]
  }, 12.6)

  timeline.add(() => {
    isSpeaking.value = false
  }, 14.1)

  // Show feedback panel (오른쪽에서 슬라이딩)
  timeline.add(() => {
    showFeedback.value = true
  }, 14.6)

  timeline.add(() => {
    showScore.value = true
  }, 15.1)

  // Animate score
  timeline.to(displayScore, {
    value: 87,
    duration: 1.0,
    ease: 'power2.out',
    onUpdate: () => {
      displayScore.value = Math.round(displayScore.value)
    }
  }, 15.3)

  // Show breakdown with animation
  timeline.add(() => {
    showBreakdown.value = true
  }, 15.8)

  // Animate score bars
  timeline.add(() => {
    scoreItems.value[0] = { ...scoreItems.value[0], score: 85, width: '85%' }
  }, 16.0)
  timeline.add(() => {
    scoreItems.value[1] = { ...scoreItems.value[1], score: 90, width: '90%' }
  }, 16.2)
  timeline.add(() => {
    scoreItems.value[2] = { ...scoreItems.value[2], score: 88, width: '88%' }
  }, 16.4)

  // Show feedbacks one by one
  timeline.add(() => {
    visibleFeedbacks.value = [feedbacks[0]]
  }, 16.8)

  timeline.add(() => {
    visibleFeedbacks.value = [feedbacks[0], feedbacks[1]]
  }, 17.3)

  timeline.add(() => {
    visibleFeedbacks.value = [...feedbacks]
  }, 17.8)
}

const restartAnimation = () => {
  if (timeline) timeline.kill()
  resetState()
  nextTick(() => runAnimation())
}

defineExpose({ restartAnimation })

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
  pauseVideo()
})
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scale transition */
.scale-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-leave-active {
  transition: all 0.2s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Slide up transition */
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
}

/* Bubble transition */
.bubble-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-leave-active {
  transition: all 0.3s ease;
}
.bubble-enter-from {
  opacity: 0;
  transform: scale(0.5) translateX(-20px);
}
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Message transition */
.message-enter-active {
  transition: all 0.4s ease-out;
}
.message-leave-active {
  transition: all 0.2s ease;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.message-leave-to {
  opacity: 0;
}

/* Timeline transition for feedbacks */
.timeline-enter-active {
  transition: all 0.5s ease-out;
}
.timeline-leave-active {
  transition: all 0.2s ease;
}
.timeline-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.timeline-leave-to {
  opacity: 0;
}
</style>
