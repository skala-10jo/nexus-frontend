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
      <!-- Phase 1: Schedule View -->
      <div v-if="phase === 'schedule'" class="absolute inset-0">
        <SchedulePhaseUI
          :schedule-events="scheduleEvents"
          :calendar-weeks="calendarWeeks"
          :highlighted-event-index="highlightedEventIndex"
          :button-highlighted="buttonHighlighted"
          :get-events-for-week="getEventsForWeek"
          :get-event-style="getEventStyle"
          :event-item-refs="eventItemRefs"
        />

        <!-- Magnifier -->
        <MagnifierUI
          :show="showMagnifier"
          :position="magnifierPosition"
          :is-active="isLensActive"
          :is-pressed="isButtonPressed"
        />

        <!-- Click Ripple Effects -->
        <div
          v-for="(ripple, index) in ripples"
          :key="'ripple-' + index"
          class="absolute rounded-full pointer-events-none z-40"
          :style="ripple.style"
        ></div>

        <!-- Dark Overlay for transition -->
        <div
          class="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 z-30"
          :style="{ opacity: overlayOpacity }"
        ></div>
      </div>

      <!-- Phase 2: Extracting -->
      <ExtractingPhaseUI
        v-if="phase === 'extracting'"
        :show-doc-stack="showDocStack"
        :doc-stack-opacity="docStackOpacity"
        :sphere-opacity="sphereOpacity"
        :sphere-scale="sphereScale"
        :flying-documents="flyingDocuments"
        :extracted-keywords="extractedKeywords"
        :data-particles="dataParticles"
      />

      <!-- Phase 3: Results -->
      <ResultPhaseUI
        v-if="phase === 'result'"
        :scenarios="scenarios"
        :card-visibility="cardVisibility"
        :selected-scenario="selectedScenario"
        @select-scenario="selectedScenario = $event"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

// 하위 컴포넌트
import SchedulePhaseUI from './parts/SchedulePhaseUI.vue'
import ExtractingPhaseUI from './parts/ExtractingPhaseUI.vue'
import ResultPhaseUI from './parts/ResultPhaseUI.vue'
import MagnifierUI from './parts/MagnifierUI.vue'

// 공유 데이터 import
import { getSidebarEvents, events, getEventColorClass } from '../data/scheduleData'
import { scenarios } from '../data/scenarioData'
import { useCalendar } from '@/composables/landing/useCalendar'
import { useScenarioAnimation } from '@/composables/landing/useScenarioAnimation'

const props = defineProps({
  isActive: { type: Boolean, default: false }
})

const emit = defineEmits(['animationComplete'])

// Refs
const containerRef = ref(null)
const eventItemRefs = ref([])

// 공유 데이터 사용
const scheduleEvents = getSidebarEvents()

// 캘린더 이벤트 (colorClass 추가)
const calendarEvents = events.map(e => ({
  ...e,
  colorClass: getEventColorClass(e.color)
}))

// 캘린더 composable 사용
const { calendarWeeks, getEventsForWeek: getEventsForWeekBase, getEventStyle } = useCalendar()

// 로컬 이벤트로 필터링
const getEventsForWeek = (weekIndex) => {
  return getEventsForWeekBase(weekIndex, calendarEvents)
}

// 시나리오 애니메이션 composable 사용
const {
  flyingDocuments,
  sphereOpacity,
  sphereScale,
  docStackOpacity,
  dataParticles,
  extractedKeywords,
  showDocStack,
  ripples,
  createRipples,
  runExtractionAnimation,
  resetExtractionState
} = useScenarioAnimation()

// Phase: 'schedule' | 'extracting' | 'result'
const phase = ref('schedule')
const headerTitle = ref('프로젝트 일정')

// Schedule phase state
const highlightedEventIndex = ref(null)
const buttonHighlighted = ref(false)
const showMagnifier = ref(false)
const magnifierPosition = ref({ x: 600, y: 50 })
const isLensActive = ref(false)
const isButtonPressed = ref(false)
const overlayOpacity = ref(0)

// Result phase state
const cardVisibility = ref([false, false, false, false, false, false])
const selectedScenario = ref(null)

let timeline = null

// Reset state
const resetState = () => {
  phase.value = 'schedule'
  headerTitle.value = '프로젝트 일정'
  highlightedEventIndex.value = null
  buttonHighlighted.value = false
  showMagnifier.value = false
  magnifierPosition.value = { x: 600, y: 50 }
  isLensActive.value = false
  isButtonPressed.value = false
  overlayOpacity.value = 0
  cardVisibility.value = [false, false, false, false, false, false]
  selectedScenario.value = null
  resetExtractionState()
}

// Run animation
const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // Phase 1: Show schedule, then magnifier appears
  timeline.add(() => {
    showMagnifier.value = true
    isLensActive.value = false
  }, 0.5)

  // Move magnifier to the practice button
  timeline.to(magnifierPosition.value, {
    x: 195,
    y: 235,
    duration: 1.2,
    ease: 'power2.inOut'
  }, 0.8)

  // Highlight the event row
  timeline.add(() => {
    highlightedEventIndex.value = 1
  }, 1.5)

  // Activate lens
  timeline.add(() => {
    isLensActive.value = true
  }, 2.0)

  // Highlight the button
  timeline.add(() => {
    buttonHighlighted.value = true
  }, 2.3)

  // Button press effect + ripples
  timeline.add(() => {
    isButtonPressed.value = true
    createRipples(195, 235)
  }, 3.0)

  timeline.add(() => {
    isButtonPressed.value = false
  }, 3.3)

  // Fade to transition
  timeline.to(overlayOpacity, { value: 1, duration: 0.5 }, 3.5)

  // Phase 2: Extracting
  timeline.add(() => {
    phase.value = 'extracting'
    headerTitle.value = 'AI 시나리오 분석'
    showMagnifier.value = false
    runExtractionAnimation()
  }, 4.0)

  // Phase 3: Results
  timeline.add(() => {
    phase.value = 'result'
    headerTitle.value = 'AI 시나리오 생성 완료'
  }, 8.0)

  // Cards appear staggered
  timeline.add(() => { cardVisibility.value[0] = true }, 8.2)
  timeline.add(() => { cardVisibility.value[1] = true }, 8.35)
  timeline.add(() => { cardVisibility.value[2] = true }, 8.5)
  timeline.add(() => { cardVisibility.value[3] = true }, 8.65)
  timeline.add(() => { cardVisibility.value[4] = true }, 8.8)
  timeline.add(() => { cardVisibility.value[5] = true }, 8.95)

  // Auto-select first card
  timeline.add(() => { selectedScenario.value = 0 }, 9.3)
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
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-spin-reverse {
  animation: spin-reverse 12s linear infinite;
}
</style>
