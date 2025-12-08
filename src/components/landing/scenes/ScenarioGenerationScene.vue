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
      <!-- ======================== -->
      <!-- Step 1: 프로젝트 화면 + 회화 연습 버튼 클릭 -->
      <!-- ======================== -->
      <div
        v-show="currentStep === 1"
        class="absolute inset-0 bg-gray-50/50"
      >
        <!-- 프로젝트 카드 -->
        <div
          ref="projectCardRef"
          class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform"
          :style="{ transform: `translate(-50%, -50%) scale(${cardScale})` }"
          :class="{ 'animate-shake': isCardShaking }"
        >
          <div class="bg-white rounded-xl border border-gray-200 shadow-lg p-5 w-[340px]">
            <!-- Project Header -->
            <div class="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
              <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 ref="projectTitleRef" class="text-sm font-bold text-gray-900">글로벌 마케팅 캠페인</h3>
                <p class="text-[10px] text-gray-400 line-clamp-1">Nexus 플랫폼 기반 다국어 콘텐츠 제작...</p>
              </div>
              <span class="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">진행중</span>
            </div>

            <!-- 연결된 문서 파일들 -->
            <div ref="documentsRef" class="mb-4">
              <p class="text-[10px] font-medium text-gray-500 mb-2">연결된 문서</p>
              <div class="flex gap-2">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="flex items-center gap-1.5 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-[10px] text-gray-600">{{ doc.name }}</span>
                </div>
              </div>
            </div>

            <!-- 전문용어 칩 -->
            <div ref="termsRef" class="mb-4">
              <p class="text-[10px] font-medium text-gray-500 mb-2">프로젝트 용어</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="term in glossaryTerms"
                  :key="term"
                  class="px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-medium rounded-full border border-purple-100"
                >
                  {{ term }}
                </span>
              </div>
            </div>

            <!-- 일정 이벤트 목록 -->
            <div ref="eventsRef" class="space-y-1.5">
              <div
                v-for="(event, index) in scheduleEvents"
                :key="event.id"
                class="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all"
                :class="highlightedEvent === index ? 'bg-blue-50 ring-2 ring-blue-300' : 'bg-gray-50'"
              >
                <div
                  class="w-2 h-2 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: event.color }"
                ></div>
                <span class="text-[10px] font-medium text-gray-400 w-8">{{ event.date }}</span>
                <span class="text-[11px] font-medium text-gray-700 flex-1 truncate">{{ event.title }}</span>
                <!-- 회화 연습 버튼 -->
                <button
                  ref="practiceButtonRef"
                  class="px-2 py-1 rounded-full text-[10px] font-bold transition-all flex-shrink-0"
                  :class="getButtonClass(index)"
                  :style="getButtonStyle(index)"
                >
                  회화 연습
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Spotlight/돋보기 효과 -->
        <div
          v-if="showSpotlight"
          class="absolute pointer-events-none transition-all duration-300"
          :style="spotlightStyle"
        >
          <!-- 스포트라이트 링 -->
          <div class="relative">
            <div class="w-20 h-20 rounded-full border-4 border-yellow-400 bg-yellow-400/10 animate-pulse"></div>
            <div class="absolute inset-0 w-20 h-20 rounded-full border-2 border-yellow-300 animate-ping"></div>
          </div>
        </div>

        <!-- 클릭 이펙트 -->
        <div
          v-if="showClickRipple"
          class="absolute pointer-events-none"
          :style="clickRippleStyle"
        >
          <div class="w-16 h-16 rounded-full bg-blue-400/30 animate-ripple"></div>
          <div class="absolute inset-0 w-16 h-16 rounded-full bg-blue-500/20 animate-ripple-delay"></div>
        </div>
      </div>

      <!-- ======================== -->
      <!-- Step 2: 프로젝트 정보 흡수 연출 -->
      <!-- ======================== -->
      <div
        v-show="currentStep === 2"
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        <!-- 떠오르는 파편들 -->
        <div
          v-for="(fragment, index) in floatingFragments"
          :key="'frag-' + index"
          class="absolute transition-all pointer-events-none"
          :style="fragment.style"
        >
          <!-- 제목 텍스트 파편 -->
          <div v-if="fragment.type === 'title'" class="text-white font-bold text-sm px-3 py-1.5 bg-blue-500/30 rounded-lg border border-blue-400/50 backdrop-blur">
            {{ fragment.text }}
          </div>
          <!-- 문서 아이콘 -->
          <div v-else-if="fragment.type === 'document'" class="flex items-center gap-2 px-3 py-2 bg-red-500/20 rounded-lg border border-red-400/40 backdrop-blur">
            <svg class="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"/>
            </svg>
            <span class="text-red-300 text-[11px] font-medium">{{ fragment.text }}</span>
            <!-- 빛의 꼬리 -->
            <div class="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-0.5 bg-gradient-to-r from-red-400 to-transparent"></div>
          </div>
          <!-- 전문용어 칩 -->
          <div v-else-if="fragment.type === 'term'" class="px-3 py-1 bg-purple-500/30 rounded-full border border-purple-400/50 backdrop-blur">
            <span class="text-purple-300 text-[10px] font-bold">{{ fragment.text }}</span>
          </div>
          <!-- 일정 태그 점 -->
          <div v-else-if="fragment.type === 'schedule'" class="w-3 h-3 rounded-full" :style="{ backgroundColor: fragment.color }">
            <div class="absolute inset-0 rounded-full animate-ping" :style="{ backgroundColor: fragment.color, opacity: 0.5 }"></div>
          </div>
        </div>

        <!-- 중앙 수렴 포인트 표시 -->
        <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            class="w-4 h-4 rounded-full bg-cyan-400/50 transition-all duration-500"
            :style="{ transform: `scale(${convergenceScale})`, opacity: convergenceOpacity }"
          ></div>
        </div>
      </div>

      <!-- ======================== -->
      <!-- Step 3: AI Processing Sphere -->
      <!-- ======================== -->
      <div
        v-show="currentStep === 3"
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      >
        <!-- Grid Background -->
        <div class="absolute inset-0 opacity-10">
          <div v-for="i in 20" :key="'h'+i" class="absolute left-0 right-0 h-px bg-cyan-400" :style="{ top: (i * 5) + '%' }"></div>
          <div v-for="i in 20" :key="'v'+i" class="absolute top-0 bottom-0 w-px bg-cyan-400" :style="{ left: (i * 5) + '%' }"></div>
        </div>

        <!-- AI Sphere -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="relative transition-all duration-500"
            :style="{ opacity: sphereOpacity, transform: `scale(${sphereScale})` }"
          >
            <!-- Outer glow layers -->
            <div class="absolute -inset-16 rounded-full bg-cyan-500/10 blur-3xl animate-pulse"></div>
            <div class="absolute -inset-10 rounded-full bg-blue-500/20 blur-2xl animate-pulse-slow"></div>

            <!-- Core sphere -->
            <div class="relative w-32 h-32">
              <!-- Main gradient sphere -->
              <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 animate-spin-slow"></div>

              <!-- Inner layers -->
              <div class="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-300 opacity-70 animate-spin-reverse"></div>
              <div class="absolute inset-4 rounded-full bg-gradient-to-bl from-cyan-300 to-blue-400 opacity-60"></div>

              <!-- Bright core -->
              <div class="absolute inset-8 rounded-full bg-white/90 blur-md" :class="{ 'animate-pulse-fast': isProcessing }"></div>

              <!-- 전류 웨이브 효과 -->
              <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle
                  v-for="wave in electricWaves"
                  :key="wave.id"
                  cx="50" cy="50"
                  :r="wave.radius"
                  fill="none"
                  stroke="cyan"
                  :stroke-width="wave.width"
                  :opacity="wave.opacity"
                  class="animate-wave"
                />
              </svg>

              <!-- Orbital rings -->
              <div class="absolute -inset-4 rounded-full border-2 border-cyan-300/40 rotate-45"></div>
              <div class="absolute -inset-6 rounded-full border border-blue-300/30 -rotate-45"></div>
              <div class="absolute -inset-8 rounded-full border border-purple-300/20 rotate-12"></div>
            </div>

            <!-- Processing text -->
            <div class="absolute -bottom-16 left-1/2 -translate-x-1/2 whitespace-nowrap text-center">
              <p class="text-cyan-400 font-bold text-sm tracking-widest mb-1" :class="{ 'animate-pulse': isProcessing }">
                {{ processingText }}
              </p>
              <div class="flex justify-center gap-1">
                <div v-for="i in 3" :key="i" class="w-2 h-2 rounded-full bg-cyan-400" :class="`animate-bounce-${i}`"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 흡수되는 파편들 (Sphere 주변) -->
        <div
          v-for="(particle, index) in absorbingParticles"
          :key="'particle-' + index"
          class="absolute w-2 h-2 rounded-full transition-all"
          :style="particle.style"
        ></div>

        <!-- Corner decorations -->
        <div class="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-cyan-500/30"></div>
        <div class="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-cyan-500/30"></div>
      </div>

      <!-- ======================== -->
      <!-- Step 4: 시나리오 카드 생성 -->
      <!-- ======================== -->
      <div
        v-show="currentStep === 4"
        class="absolute inset-0 bg-gray-50 p-6"
      >
        <!-- Burst effect (Sphere 터짐) -->
        <div
          v-if="showBurst"
          class="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2"
        >
          <div v-for="i in 8" :key="i" class="absolute w-3 h-3 rounded-full bg-cyan-400 animate-burst" :style="getBurstStyle(i)"></div>
        </div>

        <!-- Header -->
        <div class="text-center mb-6" :style="{ opacity: headerOpacity }">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-200">
            <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-gray-800 font-bold text-sm">AI 시나리오 생성 완료</span>
          </div>
          <p class="text-gray-500 text-xs mt-2">프로젝트 문맥을 분석하여 3개의 실무 회화 시나리오를 생성했습니다</p>
        </div>

        <!-- Scenario Cards -->
        <div class="grid grid-cols-3 gap-4">
          <div
            v-for="(scenario, index) in scenarioCards"
            :key="index"
            class="bg-white rounded-xl p-4 border-2 transition-all duration-500 cursor-pointer hover:shadow-lg"
            :class="selectedScenario === index
              ? 'border-blue-400 shadow-lg shadow-blue-100'
              : 'border-gray-100 hover:border-gray-200'"
            :style="getScenarioCardStyle(index)"
            @click="selectedScenario = index"
          >
            <!-- Card Icon -->
            <div class="flex items-center justify-between mb-3">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl" :class="scenario.iconBg">
                {{ scenario.icon }}
              </div>
              <span
                class="text-[10px] font-bold px-2 py-1 rounded-full"
                :class="scenario.difficultyClass"
              >
                {{ scenario.difficulty }}
              </span>
            </div>

            <!-- Title & Description -->
            <h4 class="text-gray-900 font-bold text-sm mb-2 leading-tight">{{ scenario.title }}</h4>
            <p class="text-gray-500 text-[11px] mb-3 leading-relaxed">{{ scenario.description }}</p>

            <!-- Sample Dialogue -->
            <div class="bg-gray-50 rounded-lg p-2.5 mb-3">
              <p class="text-[10px] text-gray-400 mb-1">예시 대화</p>
              <p class="text-[10px] text-gray-600 italic">"{{ scenario.sampleDialogue }}"</p>
            </div>

            <!-- Role Tags -->
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium">{{ scenario.userRole }}</span>
              <span class="text-gray-300 text-[10px]">vs</span>
              <span class="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-medium">{{ scenario.aiRole }}</span>
            </div>
          </div>
        </div>

        <!-- Start Button -->
        <div class="text-center mt-6">
          <button
            v-if="showStartButton"
            class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm rounded-xl transition-all hover:scale-105 hover:shadow-lg shadow-blue-200"
          >
            <span class="flex items-center gap-2">
              연습 시작하기
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
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
const projectCardRef = ref(null)
const practiceButtonRef = ref(null)

// Header
const headerTitle = ref('프로젝트 · 일정')

// Current Step (1-4)
const currentStep = ref(1)

// ===== Step 1 State =====
const cardScale = ref(1)
const isCardShaking = ref(false)
const highlightedEvent = ref(1)
const showSpotlight = ref(false)
const spotlightPosition = ref({ x: 0, y: 0 })
const showClickRipple = ref(false)
const clickRipplePosition = ref({ x: 0, y: 0 })
const buttonPressed = ref(false)
const buttonGlow = ref(false)

const documents = [
  { id: 1, name: '기획서.pdf' },
  { id: 2, name: 'API Spec.docx' },
  { id: 3, name: '일정표.xlsx' }
]

const glossaryTerms = ['API Spec', 'UX Flow', 'Milestone', 'MVP']

const scheduleEvents = [
  { id: 'e1', title: '킥오프', date: '1/2', color: '#3b82f6' },
  { id: 'e2', title: '요구사항 분석 회의', date: '1/6', color: '#22c55e' },
  { id: 'e3', title: 'UI/UX 회의', date: '1/14', color: '#f97316' },
  { id: 'e4', title: '백엔드 개발', date: '1/20', color: '#a855f7' },
  { id: 'e5', title: '시연 발표', date: '1/29', color: '#06b6d4' }
]

// ===== Step 2 State =====
const floatingFragments = ref([])
const convergenceScale = ref(0)
const convergenceOpacity = ref(0)

// ===== Step 3 State =====
const sphereOpacity = ref(0)
const sphereScale = ref(0.5)
const isProcessing = ref(false)
const processingText = ref('AI ANALYZING...')
const electricWaves = ref([
  { id: 1, radius: 20, width: 1, opacity: 0.8 },
  { id: 2, radius: 30, width: 0.5, opacity: 0.5 },
  { id: 3, radius: 40, width: 0.3, opacity: 0.3 }
])
const absorbingParticles = ref([])

// ===== Step 4 State =====
const showBurst = ref(false)
const headerOpacity = ref(0)
const cardVisibility = ref([0, 0, 0])
const selectedScenario = ref(null)
const showStartButton = ref(false)

const scenarioCards = [
  {
    icon: '💼',
    iconBg: 'bg-blue-50',
    difficulty: '중급',
    difficultyClass: 'bg-yellow-100 text-yellow-700',
    title: '디자인 리뷰 회의에서 요구사항을 명확히 확인하기',
    description: '프로젝트 문서 기반으로 생성된 회화 시나리오입니다. 디자인 요구사항을 영어로 논의하는 연습을 합니다.',
    sampleDialogue: 'Could you clarify the requirements for the UX flow?',
    userRole: 'PM',
    aiRole: '디자이너'
  },
  {
    icon: '🤝',
    iconBg: 'bg-green-50',
    difficulty: '초급',
    difficultyClass: 'bg-green-100 text-green-700',
    title: 'PM과 개발자 간 일정 조율 회의 연습',
    description: '협업 상황 기반 시나리오입니다. 마일스톤과 일정을 조율하는 비즈니스 영어를 연습합니다.',
    sampleDialogue: 'When do you think we can complete the MVP?',
    userRole: '개발자',
    aiRole: 'PM'
  },
  {
    icon: '📊',
    iconBg: 'bg-purple-50',
    difficulty: '고급',
    difficultyClass: 'bg-red-100 text-red-700',
    title: '프로젝트 핵심 용어를 활용한 실무 대화 연습',
    description: '전문용어 기반 시나리오입니다. API Spec, UX Flow 등의 용어를 활용한 기술 대화를 연습합니다.',
    sampleDialogue: 'Let me walk you through the API specifications.',
    userRole: 'Tech Lead',
    aiRole: 'Engineer'
  }
]

let timeline = null

// Computed styles
const spotlightStyle = computed(() => ({
  left: `${spotlightPosition.value.x}px`,
  top: `${spotlightPosition.value.y}px`,
  transform: 'translate(-50%, -50%)'
}))

const clickRippleStyle = computed(() => ({
  left: `${clickRipplePosition.value.x}px`,
  top: `${clickRipplePosition.value.y}px`,
  transform: 'translate(-50%, -50%)'
}))

const getButtonClass = (index) => {
  if (highlightedEvent.value === index && buttonGlow.value) {
    return 'bg-blue-500 text-white ring-4 ring-blue-300 shadow-lg'
  }
  if (highlightedEvent.value === index && buttonPressed.value) {
    return 'bg-blue-600 text-white scale-90 shadow-inner'
  }
  return 'bg-blue-50 text-blue-600 hover:bg-blue-100'
}

const getButtonStyle = (index) => {
  if (highlightedEvent.value === index && buttonPressed.value) {
    return { transform: 'scale(0.9)' }
  }
  if (highlightedEvent.value === index && buttonGlow.value) {
    return { transform: 'scale(1.1)' }
  }
  return {}
}

const getScenarioCardStyle = (index) => ({
  opacity: cardVisibility.value[index],
  transform: `translateY(${(1 - cardVisibility.value[index]) * 40}px)`
})

const getBurstStyle = (index) => {
  const angle = (index / 8) * 360
  return {
    transform: `rotate(${angle}deg) translateX(60px)`,
    animationDelay: `${index * 0.05}s`
  }
}

// Reset all state
const resetState = () => {
  currentStep.value = 1
  headerTitle.value = '프로젝트 · 일정'

  // Step 1
  cardScale.value = 1
  isCardShaking.value = false
  highlightedEvent.value = 1
  showSpotlight.value = false
  showClickRipple.value = false
  buttonPressed.value = false
  buttonGlow.value = false

  // Step 2
  floatingFragments.value = []
  convergenceScale.value = 0
  convergenceOpacity.value = 0

  // Step 3
  sphereOpacity.value = 0
  sphereScale.value = 0.5
  isProcessing.value = false
  processingText.value = 'AI ANALYZING...'
  absorbingParticles.value = []

  // Step 4
  showBurst.value = false
  headerOpacity.value = 0
  cardVisibility.value = [0, 0, 0]
  selectedScenario.value = null
  showStartButton.value = false
}

// Main animation sequence
const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // ===== STEP 1: 프로젝트 화면 + 버튼 클릭 (0s - 4s) =====

  // 1-1: 줌인
  timeline.to(cardScale, { value: 1.05, duration: 0.8 }, 0.3)

  // 1-2: 스포트라이트 나타남
  timeline.add(() => {
    showSpotlight.value = true
    spotlightPosition.value = { x: 600, y: 100 }
  }, 1.0)

  // 1-3: 스포트라이트가 버튼으로 이동
  timeline.to(spotlightPosition.value, {
    x: 295,
    y: 340,
    duration: 1.0,
    ease: 'power2.inOut'
  }, 1.2)

  // 1-4: 버튼 강조 (Glow)
  timeline.add(() => {
    buttonGlow.value = true
  }, 2.3)

  // 1-5: 버튼 클릭 (스프링 이징)
  timeline.add(() => {
    buttonPressed.value = true
    buttonGlow.value = false
    showClickRipple.value = true
    clickRipplePosition.value = { x: 295, y: 340 }
  }, 2.8)

  // 1-6: 카드 흔들림
  timeline.add(() => {
    isCardShaking.value = true
    buttonPressed.value = false
  }, 3.0)

  timeline.add(() => {
    isCardShaking.value = false
  }, 3.3)

  // ===== STEP 2: 프로젝트 정보 흡수 (4s - 7s) =====
  timeline.add(() => {
    currentStep.value = 2
    headerTitle.value = 'AI 시나리오 생성'
    showSpotlight.value = false
    showClickRipple.value = false

    // 떠오르는 파편들 생성
    floatingFragments.value = [
      // 제목
      { type: 'title', text: '글로벌 마케팅 캠페인', style: { left: '20%', top: '25%', opacity: 0, transform: 'scale(0.8)' } },
      // 문서들
      { type: 'document', text: '기획서.pdf', style: { left: '70%', top: '20%', opacity: 0, transform: 'scale(0.8)' } },
      { type: 'document', text: 'API Spec.docx', style: { left: '75%', top: '35%', opacity: 0, transform: 'scale(0.8)' } },
      { type: 'document', text: '일정표.xlsx', style: { left: '65%', top: '50%', opacity: 0, transform: 'scale(0.8)' } },
      // 전문용어 칩
      { type: 'term', text: 'API Spec', style: { left: '15%', top: '45%', opacity: 0, transform: 'scale(0.8)' } },
      { type: 'term', text: 'UX Flow', style: { left: '25%', top: '60%', opacity: 0, transform: 'scale(0.8)' } },
      { type: 'term', text: 'Milestone', style: { left: '10%', top: '70%', opacity: 0, transform: 'scale(0.8)' } },
      // 일정 태그들
      { type: 'schedule', color: '#3b82f6', style: { left: '80%', top: '65%', opacity: 0 } },
      { type: 'schedule', color: '#22c55e', style: { left: '85%', top: '75%', opacity: 0 } },
      { type: 'schedule', color: '#f97316', style: { left: '75%', top: '80%', opacity: 0 } }
    ]
  }, 3.8)

  // 파편들이 나타나고 중앙으로 이동
  timeline.add(() => {
    floatingFragments.value.forEach((frag, i) => {
      // 나타남
      gsap.to(frag.style, {
        opacity: 1,
        transform: 'scale(1)',
        duration: 0.4,
        delay: i * 0.08,
        ease: 'back.out(1.5)'
      })

      // 중앙으로 이동하며 사라짐
      gsap.to(frag.style, {
        left: '50%',
        top: '50%',
        opacity: 0,
        transform: 'scale(0.3)',
        duration: 1.0,
        delay: 0.8 + i * 0.08,
        ease: 'power3.in'
      })
    })

    // 수렴점 나타남
    gsap.to(convergenceScale, { value: 3, duration: 1.5, delay: 1.2, ease: 'power2.out' })
    gsap.to(convergenceOpacity, { value: 1, duration: 0.5, delay: 1.0 })
    gsap.to(convergenceOpacity, { value: 0, duration: 0.3, delay: 2.5 })
  }, 4.0)

  // ===== STEP 3: AI Processing Sphere (7s - 11s) =====
  timeline.add(() => {
    currentStep.value = 3
    isProcessing.value = true

    // 흡수되는 파티클들 생성
    absorbingParticles.value = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const distance = 150 + Math.random() * 50
      absorbingParticles.value.push({
        style: {
          left: `calc(50% + ${Math.cos(angle) * distance}px)`,
          top: `calc(50% + ${Math.sin(angle) * distance}px)`,
          backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#22c55e'][i % 4],
          opacity: 0.8
        }
      })
    }
  }, 6.5)

  // Sphere 나타남
  timeline.to(sphereOpacity, { value: 1, duration: 0.6, ease: 'power2.out' }, 6.7)
  timeline.to(sphereScale, { value: 1, duration: 0.8, ease: 'back.out(1.7)' }, 6.7)

  // 파티클들이 Sphere로 흡수
  timeline.add(() => {
    absorbingParticles.value.forEach((particle, i) => {
      gsap.to(particle.style, {
        left: '50%',
        top: '50%',
        opacity: 0,
        duration: 1.2,
        delay: i * 0.1,
        ease: 'power3.in'
      })
    })
  }, 7.5)

  // Processing text 변경
  timeline.add(() => {
    processingText.value = 'GENERATING SCENARIOS...'
  }, 9.0)

  // Sphere 밝아짐 (완료)
  timeline.to(sphereScale, { value: 1.3, duration: 0.5, ease: 'power2.out' }, 10.0)
  timeline.add(() => {
    processingText.value = 'COMPLETE!'
    isProcessing.value = false
  }, 10.5)

  // ===== STEP 4: 시나리오 카드 생성 (11s+) =====
  timeline.add(() => {
    currentStep.value = 4
    headerTitle.value = '시나리오 선택'
    showBurst.value = true
  }, 11.0)

  // Burst 사라짐
  timeline.add(() => {
    showBurst.value = false
  }, 11.5)

  // Header 나타남
  timeline.to(headerOpacity, { value: 1, duration: 0.5 }, 11.3)

  // Cards 순차적으로 슬라이드 업 (샤라락)
  timeline.to(cardVisibility.value, { 0: 1, duration: 0.5, ease: 'back.out(1.5)' }, 11.6)
  timeline.to(cardVisibility.value, { 1: 1, duration: 0.5, ease: 'back.out(1.5)' }, 11.8)
  timeline.to(cardVisibility.value, { 2: 1, duration: 0.5, ease: 'back.out(1.5)' }, 12.0)

  // 첫 번째 카드 자동 선택
  timeline.add(() => {
    selectedScenario.value = 0
  }, 12.5)

  // Start 버튼 나타남
  timeline.add(() => {
    showStartButton.value = true
  }, 13.0)
}

// Restart animation (for scene revisit)
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
/* 카드 흔들림 */
@keyframes shake {
  0%, 100% { transform: translate(-50%, -50%) rotate(0deg); }
  25% { transform: translate(-50%, -50%) rotate(-1deg) translateX(-2px); }
  50% { transform: translate(-50%, -50%) rotate(1deg) translateX(2px); }
  75% { transform: translate(-50%, -50%) rotate(-0.5deg) translateX(-1px); }
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

/* 클릭 리플 */
@keyframes ripple {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
}

.animate-ripple {
  animation: ripple 0.6s ease-out forwards;
}

.animate-ripple-delay {
  animation: ripple 0.6s ease-out 0.1s forwards;
}

/* Sphere 회전 */
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

.animate-spin-reverse {
  animation: spin-reverse 6s linear infinite;
}

/* Pulse variations */
.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-pulse-fast {
  animation: pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Wave animation */
@keyframes wave {
  0% { r: 20; opacity: 0.8; }
  100% { r: 50; opacity: 0; }
}

.animate-wave {
  animation: wave 1.5s ease-out infinite;
}

/* Bounce dots */
@keyframes bounce-1 {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.animate-bounce-1 { animation: bounce-1 0.6s ease-in-out infinite; }
.animate-bounce-2 { animation: bounce-1 0.6s ease-in-out 0.1s infinite; }
.animate-bounce-3 { animation: bounce-1 0.6s ease-in-out 0.2s infinite; }

/* Burst effect */
@keyframes burst {
  0% { transform: rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
  100% { transform: rotate(var(--angle)) translateX(100px) scale(0); opacity: 0; }
}

.animate-burst {
  animation: burst 0.5s ease-out forwards;
}
</style>
