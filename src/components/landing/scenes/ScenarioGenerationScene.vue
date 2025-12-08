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
      <!-- Phase 1: Zoomed Schedule View with Practice Button -->
      <div
        v-if="phase === 'schedule'"
        class="absolute inset-0 bg-gray-50/50"
      >
        <!-- Zoomed Event List (from ProjectScheduleMockUI) -->
        <div
          ref="zoomedViewRef"
          class="absolute inset-0 flex items-center justify-center"
          :style="{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }"
        >
          <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-4 w-80">
            <!-- Project Header -->
            <div class="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-sm font-bold text-gray-900">글로벌 마케팅 캠페인</h3>
                <p class="text-[10px] text-gray-400">Nexus 플랫폼 기반 다국어...</p>
              </div>
              <span class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">5</span>
            </div>

            <!-- Event List -->
            <div class="space-y-1">
              <div
                v-for="(event, index) in scheduleEvents"
                :key="event.id"
                :ref="el => eventRefs[index] = el"
                class="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all"
                :class="highlightedEvent === index ? 'bg-blue-50 ring-2 ring-blue-300' : 'hover:bg-gray-50'"
                :style="{ opacity: visibleEvents[index] ? 1 : 0, transform: visibleEvents[index] ? 'translateX(0)' : 'translateX(-10px)' }"
              >
                <div
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: event.color }"
                ></div>
                <span class="text-[10px] font-medium text-gray-400 w-8">{{ event.date }}</span>
                <span class="text-[11px] font-medium text-gray-700 flex-1 truncate">{{ event.title }}</span>
                <!-- 회화 연습 버튼 -->
                <button
                  :ref="el => { if (index === highlightedEvent) practiceButtonRef = el }"
                  class="px-2 py-1 rounded-full text-[10px] font-bold transition-all flex-shrink-0"
                  :class="highlightedEvent === index && buttonHighlighted
                    ? 'bg-blue-500 text-white ring-4 ring-blue-300 shadow-lg scale-110'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                >
                  회화 연습
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Magnifying Glass -->
        <div
          ref="magnifierRef"
          v-if="showMagnifier"
          class="absolute magnifier-container pointer-events-none"
          :style="magnifierStyle"
        >
          <!-- Lens -->
          <div class="relative w-24 h-24 rounded-full border-[6px] border-amber-600 bg-white shadow-2xl overflow-hidden">
            <!-- Magnified button inside -->
            <div class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
              <button
                class="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150"
                :class="isButtonPressed
                  ? 'bg-blue-600 text-white scale-90 shadow-inner'
                  : 'bg-blue-500 text-white shadow-lg'"
              >
                회화 연습
              </button>
            </div>
            <!-- Glass shine -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent pointer-events-none"></div>
            <div class="absolute top-2 left-3 w-6 h-2 bg-white/70 rounded-full blur-sm"></div>
          </div>
          <!-- Handle -->
          <div class="absolute -bottom-10 left-1/2 -translate-x-1/2 rotate-[40deg] origin-top">
            <div class="w-5 h-16 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-full shadow-xl"></div>
          </div>
        </div>

        <!-- Click Effect -->
        <div
          v-if="showClickEffect"
          class="absolute rounded-full border-4 border-blue-400 pointer-events-none animate-ping"
          :style="clickEffectStyle"
        ></div>

        <!-- Dark Overlay for transition -->
        <div
          class="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500"
          :style="{ opacity: overlayOpacity }"
        ></div>
      </div>

      <!-- Phase 2: AI Analyzing -->
      <div
        v-if="phase === 'analyzing'"
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        <!-- Grid Background -->
        <div class="absolute inset-0 opacity-10">
          <div v-for="i in 20" :key="'h'+i" class="absolute left-0 right-0 h-px bg-cyan-400" :style="{ top: (i * 5) + '%' }"></div>
          <div v-for="i in 20" :key="'v'+i" class="absolute top-0 bottom-0 w-px bg-cyan-400" :style="{ left: (i * 5) + '%' }"></div>
        </div>

        <!-- AI Sphere -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="relative" :style="{ opacity: sphereOpacity, transform: `scale(${sphereScale})` }">
            <!-- Outer glow -->
            <div class="absolute -inset-8 rounded-full bg-cyan-500/20 blur-2xl animate-pulse"></div>

            <!-- Core sphere -->
            <div class="relative w-28 h-28">
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 animate-spin-slow"></div>
              <div class="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 opacity-80"></div>
              <div class="absolute inset-6 rounded-full bg-white/80 blur-md animate-pulse"></div>

              <!-- Orbital rings -->
              <div class="absolute inset-0 rounded-full border-2 border-cyan-300/40 rotate-45 scale-125"></div>
              <div class="absolute inset-0 rounded-full border border-blue-300/30 -rotate-45 scale-150"></div>
            </div>

            <!-- Status text -->
            <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <p class="text-cyan-400 font-bold text-xs tracking-widest animate-pulse">AI ANALYZING...</p>
            </div>
          </div>
        </div>

        <!-- Floating fragments -->
        <div
          v-for="(frag, i) in floatingFragments"
          :key="i"
          class="absolute text-[10px] font-bold text-cyan-300/80 whitespace-nowrap"
          :style="frag.style"
        >
          {{ frag.text }}
        </div>

        <!-- Corner decorations -->
        <div class="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30"></div>
      </div>

      <!-- Phase 3: Scenario Results -->
      <div
        v-if="phase === 'result'"
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6"
      >
        <!-- Grid Background -->
        <div class="absolute inset-0 opacity-10">
          <div v-for="i in 20" :key="'h'+i" class="absolute left-0 right-0 h-px bg-cyan-400" :style="{ top: (i * 5) + '%' }"></div>
          <div v-for="i in 20" :key="'v'+i" class="absolute top-0 bottom-0 w-px bg-cyan-400" :style="{ left: (i * 5) + '%' }"></div>
        </div>

        <!-- Header -->
        <div class="relative text-center mb-6">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full border border-cyan-500/30">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-cyan-300 font-bold text-sm">AI 시나리오 생성 완료</span>
          </div>
        </div>

        <!-- Scenario Cards -->
        <div class="relative grid grid-cols-3 gap-4">
          <div
            v-for="(scenario, index) in scenarios"
            :key="index"
            class="bg-white/10 backdrop-blur rounded-xl p-4 border transition-all duration-300 cursor-pointer"
            :class="selectedScenario === index
              ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-white/20'
              : 'border-white/10 hover:border-white/30'"
            :style="getCardStyle(index)"
            @click="selectedScenario = index"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-lg">{{ scenario.flag }}</span>
              <span
                class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                :class="scenario.difficultyClass"
              >
                {{ scenario.difficulty }}
              </span>
            </div>
            <h4 class="text-white font-bold text-sm mb-1">{{ scenario.title }}</h4>
            <p class="text-gray-400 text-[10px] mb-3">{{ scenario.description }}</p>
            <div class="flex gap-2 text-[9px]">
              <span class="px-2 py-0.5 bg-white/10 rounded text-gray-300">{{ scenario.userRole }}</span>
              <span class="px-2 py-0.5 bg-white/10 rounded text-gray-300">vs</span>
              <span class="px-2 py-0.5 bg-white/10 rounded text-gray-300">{{ scenario.aiRole }}</span>
            </div>
          </div>
        </div>

        <!-- Start Button -->
        <div class="relative text-center mt-6">
          <button
            v-if="selectedScenario !== null"
            class="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 shadow-lg shadow-cyan-500/30"
            :style="{ opacity: showStartButton ? 1 : 0 }"
          >
            연습 시작하기 →
          </button>
        </div>

        <!-- Corner decorations -->
        <div class="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
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
const zoomedViewRef = ref(null)
const practiceButtonRef = ref(null)
const magnifierRef = ref(null)
const eventRefs = ref([])

// Schedule Events (from ProjectScheduleMockUI)
const scheduleEvents = [
  { id: 'e1', title: '킥오프', date: '1/2', color: '#3b82f6' },
  { id: 'e2', title: '요구사항 분석 회의', date: '1/6', color: '#22c55e' },
  { id: 'e3', title: 'UI/UX 회의', date: '1/14', color: '#f97316' },
  { id: 'e4', title: '백엔드 개발', date: '1/20', color: '#a855f7' },
  { id: 'e5', title: '시연 발표', date: '1/29', color: '#06b6d4' }
]

// Phase: 'schedule' | 'analyzing' | 'result'
const phase = ref('schedule')
const headerTitle = ref('프로젝트 · 일정')

// Schedule phase state
const zoomScale = ref(1)
const visibleEvents = ref([true, true, true, true, true])
const highlightedEvent = ref(1) // 요구사항 분석 회의
const buttonHighlighted = ref(false)
const showMagnifier = ref(false)
const magnifierPosition = ref({ x: 400, y: 100 })
const isButtonPressed = ref(false)
const showClickEffect = ref(false)
const clickEffectPosition = ref({ x: 0, y: 0 })
const overlayOpacity = ref(0)

// Analyzing state
const sphereOpacity = ref(0)
const sphereScale = ref(0)
const floatingFragments = ref([])

// Result state
const scenarios = [
  {
    flag: '🇺🇸',
    difficulty: '중급',
    difficultyClass: 'bg-yellow-500/30 text-yellow-300',
    title: '프로젝트 요구사항 협의',
    description: '베트남 파트너와 요구사항 논의',
    userRole: 'PM',
    aiRole: '파트너'
  },
  {
    flag: '🇻🇳',
    difficulty: '초급',
    difficultyClass: 'bg-green-500/30 text-green-300',
    title: '일정 조율 회의',
    description: '마일스톤 및 일정 조율',
    userRole: '개발자',
    aiRole: 'PM'
  },
  {
    flag: '🇺🇸',
    difficulty: '고급',
    difficultyClass: 'bg-red-500/30 text-red-300',
    title: '기술 스펙 리뷰',
    description: '상세 기술 사양 검토',
    userRole: 'Tech Lead',
    aiRole: 'Engineer'
  }
]
const cardVisibility = ref([false, false, false])
const selectedScenario = ref(null)
const showStartButton = ref(false)

let timeline = null

// Computed styles
const magnifierStyle = computed(() => ({
  left: `${magnifierPosition.value.x}px`,
  top: `${magnifierPosition.value.y}px`,
  transform: 'translate(-50%, -50%)',
  zIndex: 50
}))

const clickEffectStyle = computed(() => ({
  left: `${clickEffectPosition.value.x}px`,
  top: `${clickEffectPosition.value.y}px`,
  width: '50px',
  height: '50px',
  transform: 'translate(-50%, -50%)'
}))

const getCardStyle = (index) => ({
  opacity: cardVisibility.value[index] ? 1 : 0,
  transform: cardVisibility.value[index] ? 'translateY(0)' : 'translateY(30px)'
})

// Reset state
const resetState = () => {
  phase.value = 'schedule'
  headerTitle.value = '프로젝트 · 일정'
  zoomScale.value = 1
  visibleEvents.value = [true, true, true, true, true]
  highlightedEvent.value = 1
  buttonHighlighted.value = false
  showMagnifier.value = false
  magnifierPosition.value = { x: 400, y: 100 }
  isButtonPressed.value = false
  showClickEffect.value = false
  overlayOpacity.value = 0
  sphereOpacity.value = 0
  sphereScale.value = 0
  floatingFragments.value = []
  cardVisibility.value = [false, false, false]
  selectedScenario.value = null
  showStartButton.value = false
}

// Run animation
const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // Phase 1: Schedule View Animation (0s - 4s)
  // Initial state - show zoomed schedule
  timeline.to(zoomScale, { value: 1.3, duration: 0.8, ease: 'power2.out' }, 0.3)

  // Show magnifier and move to button
  timeline.add(() => {
    showMagnifier.value = true
  }, 1.0)

  // Move magnifier to the practice button
  timeline.to(magnifierPosition.value, {
    x: 520,
    y: 205,
    duration: 1.0,
    ease: 'power2.inOut'
  }, 1.2)

  // Highlight the button
  timeline.add(() => {
    buttonHighlighted.value = true
  }, 2.0)

  // Button press effect
  timeline.add(() => {
    isButtonPressed.value = true
    showClickEffect.value = true
    clickEffectPosition.value = { x: 520, y: 205 }
  }, 2.5)

  timeline.add(() => {
    isButtonPressed.value = false
  }, 2.8)

  // Fade to transition
  timeline.to(overlayOpacity, { value: 1, duration: 0.5 }, 3.0)

  // Phase 2: Analyzing (3.5s - 6s)
  timeline.add(() => {
    phase.value = 'analyzing'
    headerTitle.value = 'AI 시나리오 생성'
    showMagnifier.value = false
    floatingFragments.value = [
      { text: '요구사항', style: { left: '25%', top: '35%', opacity: 0 } },
      { text: '일정', style: { left: '70%', top: '30%', opacity: 0 } },
      { text: '파트너', style: { left: '30%', top: '65%', opacity: 0 } },
      { text: '미팅', style: { left: '65%', top: '60%', opacity: 0 } }
    ]
  }, 3.5)

  // Sphere appears
  timeline.to(sphereOpacity, { value: 1, duration: 0.5 }, 3.7)
  timeline.to(sphereScale, { value: 1, duration: 0.5, ease: 'back.out(1.7)' }, 3.7)

  // Fragments appear and move to center
  timeline.add(() => {
    floatingFragments.value.forEach((frag, i) => {
      gsap.to(frag.style, {
        opacity: 1,
        duration: 0.3,
        delay: i * 0.1
      })
      gsap.to(frag.style, {
        left: '50%',
        top: '50%',
        opacity: 0,
        duration: 0.8,
        delay: 0.5 + i * 0.1,
        ease: 'power2.in'
      })
    })
  }, 4.0)

  // Phase 3: Results (6s+)
  timeline.add(() => {
    phase.value = 'result'
  }, 6.0)

  // Cards appear staggered
  timeline.add(() => { cardVisibility.value[0] = true }, 6.2)
  timeline.add(() => { cardVisibility.value[1] = true }, 6.4)
  timeline.add(() => { cardVisibility.value[2] = true }, 6.6)

  // Auto-select first card
  timeline.add(() => { selectedScenario.value = 0 }, 7.0)

  // Show start button
  timeline.add(() => { showStartButton.value = true }, 7.5)
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
})
</script>

<style scoped>
.magnifier-container {
  filter: drop-shadow(0 12px 30px rgba(0, 0, 0, 0.4));
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}
</style>
