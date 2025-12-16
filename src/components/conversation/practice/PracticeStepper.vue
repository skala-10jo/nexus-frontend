<script setup>
/**
 * Practice Stepper 컴포넌트
 *
 * 시나리오의 Step by Step 진행 상태를 표시합니다.
 * (예: 1. 아이스브레이킹 → 2. Agenda1 → 3. Agenda2)
 *
 * @props steps - 스텝 배열 [{ id, title, description? }]
 * @props currentStepIndex - 현재 활성화된 스텝 인덱스 (0-based)
 * @props completedStepIndices - 완료된 스텝 인덱스 배열 (optional)
 * @props clickable - 스텝 클릭 가능 여부 (default: false)
 * @emits step-click - 스텝 클릭 시 발생 (stepIndex)
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { CheckCircleIcon, PlayCircleIcon, LightBulbIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  /** 스텝 목록 */
  steps: {
    type: Array,
    default: () => []
    // [{ id: 'ice-breaking', title: '아이스브레이킹', description: '가벼운 인사와 안부를 나누며...' }]
  },
  /** 현재 활성화된 스텝 인덱스 (0-based) */
  currentStepIndex: {
    type: Number,
    default: 0
  },
  /** 완료된 스텝 인덱스 배열 */
  completedStepIndices: {
    type: Array,
    default: () => []
  },
  /** 스텝 클릭 가능 여부 */
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['step-click'])

// ============================================
// Refs
// ============================================
const scrollContainer = ref(null)
const stepRefs = ref([])

// ============================================
// Scroll State
// ============================================
const canScrollLeft = ref(false)
const canScrollRight = ref(false)
const isOverflowing = ref(false)

/**
 * 스텝 상태 계산: 'complete' | 'active' | 'upcoming'
 */
const getStepStatus = (index) => {
  if (props.completedStepIndices.includes(index)) return 'complete'
  if (index === props.currentStepIndex) return 'active'
  if (index < props.currentStepIndex) return 'complete' // 현재보다 이전이면 완료로 처리
  return 'upcoming'
}

/**
 * 현재 활성화된 스텝 정보
 */
const currentStep = computed(() => {
  return props.steps[props.currentStepIndex] || null
})

/**
 * 진행률 계산 (0-100)
 */
const progressPercentage = computed(() => {
  if (props.steps.length <= 1) return 0
  return (props.currentStepIndex / (props.steps.length - 1)) * 100
})

/**
 * 스텝 클릭 핸들러
 */
const handleStepClick = (index) => {
  if (props.clickable) {
    emit('step-click', index)
  }
}

// ============================================
// Scroll Functions
// ============================================

/**
 * 스크롤 상태 업데이트 (화살표 표시 여부)
 */
const updateScrollState = () => {
  if (!scrollContainer.value) return

  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value
  const threshold = 5 // 스크롤 감지 임계값

  isOverflowing.value = scrollWidth > clientWidth + threshold
  canScrollLeft.value = scrollLeft > threshold
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - threshold
}

/**
 * 왼쪽으로 스크롤
 */
const scrollLeft = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({
    left: -150,
    behavior: 'smooth'
  })
}

/**
 * 오른쪽으로 스크롤
 */
const scrollRight = () => {
  if (!scrollContainer.value) return
  scrollContainer.value.scrollBy({
    left: 150,
    behavior: 'smooth'
  })
}

/**
 * 특정 스텝이 보이도록 자동 스크롤
 */
const scrollToStep = (index) => {
  if (!scrollContainer.value || !stepRefs.value[index]) return

  const container = scrollContainer.value
  const stepElement = stepRefs.value[index]

  if (!stepElement) return

  const containerRect = container.getBoundingClientRect()
  const stepRect = stepElement.getBoundingClientRect()

  // 스텝이 컨테이너 영역 밖에 있으면 스크롤
  if (stepRect.left < containerRect.left || stepRect.right > containerRect.right) {
    const scrollOffset = stepRect.left - containerRect.left - (containerRect.width / 2) + (stepRect.width / 2)
    container.scrollBy({
      left: scrollOffset,
      behavior: 'smooth'
    })
  }
}

/**
 * stepRef 설정 헬퍼
 */
const setStepRef = (el, index) => {
  if (el) {
    stepRefs.value[index] = el
  }
}

// ============================================
// Watchers
// ============================================

// currentStepIndex 변경 시 해당 스텝으로 자동 스크롤
watch(
  () => props.currentStepIndex,
  async (newIndex) => {
    await nextTick()
    scrollToStep(newIndex)
    updateScrollState()
  }
)

// steps 변경 시 스크롤 상태 업데이트 + 현재 스텝으로 자동 스크롤
watch(
  () => props.steps,
  async (newSteps) => {
    await nextTick()
    updateScrollState()
    // steps가 로드되면 현재 스텝으로 자동 스크롤 (캐시된 진행도 복원 시)
    if (newSteps && newSteps.length > 0) {
      await nextTick() // stepRefs가 설정될 때까지 대기
      scrollToStep(props.currentStepIndex)
    }
  },
  { deep: true }
)

// ============================================
// Lifecycle
// ============================================

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  updateScrollState()

  // 초기 로드 시 현재 스텝으로 스크롤 (캐시된 진행도가 있을 경우)
  if (props.steps.length > 0 && props.currentStepIndex > 0) {
    await nextTick()
    scrollToStep(props.currentStepIndex)
  }

  // 컨테이너 크기 변화 감지
  if (scrollContainer.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      updateScrollState()
    })
    resizeObserver.observe(scrollContainer.value)
  }

  // 스크롤 이벤트 리스너
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateScrollState)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('scroll', updateScrollState)
  }
})
</script>

<template>
  <div class="bg-white border-b border-gray-200 shadow-sm z-10 shrink-0">
    <!-- 스텝이 없을 때 -->
    <div v-if="steps.length === 0" class="px-4 md:px-6 py-3 flex items-center justify-center text-gray-400 text-sm">
      <PlayCircleIcon class="w-4 h-4 mr-2" />
      시나리오를 불러오는 중...
    </div>

    <!-- 스텝 표시 -->
    <div v-else>
      <!-- 상단: 스텝 인디케이터들 -->
      <div class="px-4 md:px-6 py-3 flex items-center w-full">
        <!-- 왼쪽 화살표 버튼 -->
        <button
          v-if="isOverflowing"
          @click.stop="scrollLeft"
          class="shrink-0 p-1 mr-2 rounded-full transition-all duration-200"
          :class="canScrollLeft
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            : 'text-gray-300 cursor-not-allowed'"
          :disabled="!canScrollLeft"
          aria-label="이전 스텝 보기"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>

        <!-- 스크롤 가능한 스텝 컨테이너 -->
        <div
          ref="scrollContainer"
          class="flex items-center flex-1 overflow-x-auto scrollbar-hide"
        >
          <template v-for="(step, index) in steps" :key="step.id || index">
            <!-- 스텝 아이템 -->
            <div
              :ref="(el) => setStepRef(el, index)"
              class="flex items-center shrink-0 transition-all duration-300"
              :class="[
                clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
              ]"
              @click="handleStepClick(index)"
            >
              <!-- 스텝 원형 인디케이터 -->
              <div
                class="relative flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs transition-all duration-300 shrink-0"
                :class="{
                  'bg-blue-600 text-white shadow-md shadow-blue-200': getStepStatus(index) === 'active',
                  'bg-green-500 text-white': getStepStatus(index) === 'complete',
                  'bg-gray-100 text-gray-400 border border-gray-200': getStepStatus(index) === 'upcoming'
                }"
              >
                <!-- 완료 체크 아이콘 -->
                <CheckCircleIcon
                  v-if="getStepStatus(index) === 'complete'"
                  class="w-4 h-4"
                />
                <!-- 현재 스텝 펄스 애니메이션 -->
                <template v-else-if="getStepStatus(index) === 'active'">
                  <span class="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30"></span>
                  <span class="relative">{{ index + 1 }}</span>
                </template>
                <!-- 대기 중 스텝 번호 -->
                <span v-else>{{ index + 1 }}</span>
              </div>

              <!-- 스텝 제목 -->
              <div class="ml-2 mr-1">
                <span
                  class="text-xs md:text-sm font-medium whitespace-nowrap transition-colors duration-300"
                  :class="{
                    'text-blue-700 font-bold': getStepStatus(index) === 'active',
                    'text-green-600': getStepStatus(index) === 'complete',
                    'text-gray-400': getStepStatus(index) === 'upcoming'
                  }"
                >
                  {{ step.title }}
                </span>
              </div>
            </div>

            <!-- 연결선 (마지막 스텝 제외) -->
            <div
              v-if="index < steps.length - 1"
              class="relative flex-1 min-w-[20px] max-w-[60px] h-0.5 mx-2 bg-gray-200 rounded-full overflow-hidden"
            >
              <!-- 진행 바 (애니메이션) -->
              <div
                class="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500 ease-out"
                :style="{
                  width: index < currentStepIndex ? '100%' : '0%'
                }"
              ></div>
            </div>
          </template>
        </div>

        <!-- 오른쪽 화살표 버튼 -->
        <button
          v-if="isOverflowing"
          @click.stop="scrollRight"
          class="shrink-0 p-1 ml-2 rounded-full transition-all duration-200"
          :class="canScrollRight
            ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            : 'text-gray-300 cursor-not-allowed'"
          :disabled="!canScrollRight"
          aria-label="다음 스텝 보기"
        >
          <ChevronRightIcon class="w-5 h-5" />
        </button>

        <!-- 진행률 표시 -->
        <div class="hidden md:flex items-center ml-4 pl-4 border-l border-gray-200 shrink-0">
          <span class="text-xs text-gray-500 whitespace-nowrap">
            {{ currentStepIndex + 1 }} / {{ steps.length }}
          </span>
        </div>
      </div>

      <!-- 하단: 현재 스텝 Description (있을 때만 표시) -->
      <div
        v-if="currentStep?.description"
        class="px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-100"
      >
        <div class="flex items-start gap-2">
          <LightBulbIcon class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p class="text-sm text-gray-700 leading-relaxed">
            {{ currentStep.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 스크롤바 숨기기 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 펄스 애니메이션 */
@keyframes ping {
  75%, 100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
