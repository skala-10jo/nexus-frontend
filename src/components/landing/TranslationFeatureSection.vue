<template>
  <section ref="sectionRef" class="py-48 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <!-- Left: Text Content -->
        <div
          class="flex-1 transition-all duration-1000"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <LanguageIcon class="w-4 h-4" />
            <span>텍스트 · 음성 · 영상</span>
          </div>

          <!-- Title -->
          <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            전문용어 기반 통합 번역
          </h3>

          <!-- Description -->
          <p class="text-lg text-gray-600 mb-6 leading-relaxed">
            프로젝트 문서에서 추출한 전문용어를 기반으로 일관성 있게 번역합니다.
          </p>

          <!-- Feature List -->
          <div class="space-y-3 mb-8">
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <DocumentTextIcon class="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <span class="font-medium text-gray-900">텍스트 번역</span>
                <span class="text-gray-600"> - 문서 기반 전문용어 자동 인식</span>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MicrophoneIcon class="w-3.5 h-3.5 text-green-600" />
              </div>
              <div>
                <span class="font-medium text-gray-900">음성 번역</span>
                <span class="text-gray-600"> - 실시간 다국어 음성 인식 및 번역</span>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <div class="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FilmIcon class="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div>
                <span class="font-medium text-gray-900">영상 번역</span>
                <span class="text-gray-600"> - 자막 자동 생성 및 용어 통일</span>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <router-link
            to="/translation"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 group"
          >
            <span>자세히 보기</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>

        <!-- Right: Card Swap Animation -->
        <div class="flex-1 w-full">
          <div
            class="relative transition-all duration-1000 delay-300"
            :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
          >
            <!-- Card Stack Container -->
            <div
              ref="cardContainerRef"
              class="relative h-[420px] w-full max-w-[560px] mx-auto cursor-pointer"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @click="manualSwap"
            >
              <!-- Text Translation Card -->
              <div
                ref="card0"
                class="absolute top-[40px] left-[20px] w-[460px] card-item"
              >
                <TextTranslationMockUI
                  ref="textMockUI"
                  :isVisible="currentCardIndex === 0 && isVisible"
                  @animation-complete="onCardAnimationComplete(0)"
                />
              </div>

              <!-- Voice Translation Card -->
              <div
                ref="card1"
                class="absolute top-[40px] left-[20px] w-[460px] card-item"
              >
                <VoiceTranslationMockUI
                  ref="voiceMockUI"
                  :isVisible="currentCardIndex === 1 && isVisible"
                  @animation-complete="onCardAnimationComplete(1)"
                />
              </div>

              <!-- Video Translation Card -->
              <div
                ref="card2"
                class="absolute top-[40px] left-[20px] w-[460px] card-item"
              >
                <VideoTranslationMockUI
                  ref="videoMockUI"
                  :isVisible="currentCardIndex === 2 && isVisible"
                  @animation-complete="onCardAnimationComplete(2)"
                />
              </div>
            </div>

            <!-- Card Indicators -->
            <div class="flex justify-center gap-2 mt-4">
              <button
                v-for="(_, index) in 3"
                :key="index"
                class="w-2 h-2 rounded-full transition-all duration-300"
                :class="currentCardIndex === index ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400'"
                @click.stop="goToCard(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { LanguageIcon, DocumentTextIcon, MicrophoneIcon, FilmIcon } from '@heroicons/vue/24/outline'
import TextTranslationMockUI from './mockui/TextTranslationMockUI.vue'
import VoiceTranslationMockUI from './mockui/VoiceTranslationMockUI.vue'
import VideoTranslationMockUI from './mockui/VideoTranslationMockUI.vue'

// Refs
const sectionRef = ref(null)
const cardContainerRef = ref(null)
const card0 = ref(null)
const card1 = ref(null)
const card2 = ref(null)
const textMockUI = ref(null)
const voiceMockUI = ref(null)
const videoMockUI = ref(null)

const isVisible = ref(false)
const isPaused = ref(false)
const isAnimating = ref(false)
const cardOrder = ref([0, 1, 2]) // 현재 카드 순서 (맨 앞이 index 0)
const cycleCount = ref(0) // 몇 바퀴 돌았는지
const isFirstCycle = ref(true) // 첫 회차인지

let observer = null
let intervalId = null
let timeline = null

// 설정값
const CARD_DISTANCE = 35 // 수평 거리
const VERTICAL_DISTANCE = 25 // 수직 거리
const SKEW_AMOUNT = 4 // 기울기
const SECOND_CYCLE_DELAY = 2500 // 2회차부터 스왑 간격 (2초)

// 현재 맨 앞 카드 인덱스
const currentCardIndex = computed(() => cardOrder.value[0])

// 카드 refs 배열
const getCardRefs = () => [card0.value, card1.value, card2.value]

// 슬롯 위치 계산
const calculateSlots = () => {
  return [
    { x: 0, y: 0, rotate: -SKEW_AMOUNT, zIndex: 3, scale: 1 },
    { x: CARD_DISTANCE, y: VERTICAL_DISTANCE, rotate: 0, zIndex: 2, scale: 0.97 },
    { x: CARD_DISTANCE * 2, y: VERTICAL_DISTANCE * 2, rotate: SKEW_AMOUNT, zIndex: 1, scale: 0.94 }
  ]
}

// 카드 위치 초기화
const initCardPositions = () => {
  const cards = getCardRefs()
  const slots = calculateSlots()

  cardOrder.value.forEach((cardIndex, slotIndex) => {
    const card = cards[cardIndex]
    if (!card) return

    const slot = slots[slotIndex]
    gsap.set(card, {
      x: slot.x,
      y: slot.y,
      rotation: slot.rotate,
      zIndex: slot.zIndex,
      scale: slot.scale,
      opacity: 1
    })
  })
}

// 각 카드 애니메이션 완료 시 호출
const onCardAnimationComplete = (cardIndex) => {
  // 첫 회차이고, 현재 보이는 카드의 애니메이션이 완료되면 바로 다음 카드로
  if (isFirstCycle.value && cardOrder.value[0] === cardIndex && !isPaused.value && isVisible.value) {
    // 약간의 딜레이 후 스왑 (자연스러운 전환)
    setTimeout(() => {
      if (!isPaused.value && isVisible.value && isFirstCycle.value) {
        swapCards()
      }
    }, 500)
  }
}

// 카드 스왑 애니메이션
const swapCards = () => {
  if (isPaused.value || isAnimating.value || !isVisible.value) return

  isAnimating.value = true
  const cards = getCardRefs()
  const frontCardIndex = cardOrder.value[0]
  const frontCard = cards[frontCardIndex]

  if (!frontCard) {
    isAnimating.value = false
    return
  }

  if (timeline) timeline.kill()

  timeline = gsap.timeline({
    onComplete: () => {
      isAnimating.value = false

      // 한 바퀴 완료 체크 (0 -> 1 -> 2 -> 0으로 돌아왔을 때)
      if (cardOrder.value[0] === 0 && cycleCount.value === 0) {
        cycleCount.value = 1
        isFirstCycle.value = false
        // 2회차부터는 인터벌 시작
        startInterval()
      }
    }
  })

  // 1단계: 앞 카드를 아래로 떨어뜨림
  timeline.to(frontCard, {
    y: 180,
    rotation: 0,
    opacity: 0.6,
    scale: 0.85,
    duration: 0.4,
    ease: 'power2.in'
  })

  // 2단계: 순서 변경
  timeline.add(() => {
    const newOrder = [...cardOrder.value]
    const first = newOrder.shift()
    newOrder.push(first)
    cardOrder.value = newOrder
  })

  // 3단계: 앞 카드를 맨 뒤 위치로 이동
  const backSlot = calculateSlots()[2]
  timeline.to(frontCard, {
    x: backSlot.x,
    y: backSlot.y,
    rotation: backSlot.rotate,
    opacity: 1,
    scale: backSlot.scale,
    zIndex: backSlot.zIndex,
    duration: 0.8,
    ease: 'elastic.out(1, 0.7)'
  }, '-=0.1')

  // 4단계: 나머지 카드들 앞으로 이동
  timeline.add(() => {
    const slots = calculateSlots()
    cardOrder.value.forEach((cardIndex, slotIndex) => {
      if (cardIndex === frontCardIndex) return
      const card = cards[cardIndex]
      if (!card) return

      const slot = slots[slotIndex]
      gsap.to(card, {
        x: slot.x,
        y: slot.y,
        rotation: slot.rotate,
        zIndex: slot.zIndex,
        scale: slot.scale,
        duration: 0.7,
        ease: 'elastic.out(1, 0.6)'
      })
    })
  }, '-=0.6')
}

// 특정 카드로 이동
const goToCard = (targetIndex) => {
  if (isAnimating.value) return

  // 현재 맨 앞 카드가 타겟이면 무시
  if (cardOrder.value[0] === targetIndex) return

  stopInterval()

  // 타겟 카드가 맨 앞으로 올 때까지 스왑
  const swapUntilTarget = () => {
    if (cardOrder.value[0] === targetIndex) {
      if (!isFirstCycle.value) {
        startInterval()
      }
      return
    }
    swapCards()
    setTimeout(swapUntilTarget, 600)
  }

  swapUntilTarget()
}

// 수동 스왑
const manualSwap = () => {
  if (!isAnimating.value) {
    stopInterval()
    swapCards()
    if (!isFirstCycle.value) {
      startInterval()
    }
  }
}

// 호버 핸들러
const handleMouseEnter = () => {
  isPaused.value = true
  stopInterval()
}

const handleMouseLeave = () => {
  isPaused.value = false
  if (!isFirstCycle.value && isVisible.value) {
    startInterval()
  }
}

// 인터벌 관리 (2회차부터 사용)
const startInterval = () => {
  stopInterval()
  if (!isPaused.value && isVisible.value) {
    intervalId = setInterval(() => {
      if (!isPaused.value && isVisible.value) {
        swapCards()
      }
    }, SECOND_CYCLE_DELAY)
  }
}

const stopInterval = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

// 모든 MockUI 상태 리셋
const resetAllMockUIs = () => {
  if (textMockUI.value?.resetState) textMockUI.value.resetState()
  if (voiceMockUI.value?.resetState) voiceMockUI.value.resetState()
  if (videoMockUI.value?.resetState) videoMockUI.value.resetState()
}

// 현재 카드의 애니메이션 재시작
const restartCurrentCardAnimation = () => {
  const currentCard = currentCardIndex.value
  if (currentCard === 0 && textMockUI.value?.restartAnimation) {
    textMockUI.value.restartAnimation()
  } else if (currentCard === 1 && voiceMockUI.value?.restartAnimation) {
    voiceMockUI.value.restartAnimation()
  } else if (currentCard === 2 && videoMockUI.value?.restartAnimation) {
    videoMockUI.value.restartAnimation()
  }
}

// 상태 리셋
const resetState = () => {
  stopInterval()
  if (timeline) timeline.kill()

  cardOrder.value = [0, 1, 2]
  cycleCount.value = 0
  isFirstCycle.value = true
  isAnimating.value = false
  isPaused.value = false

  // MockUI들도 리셋
  resetAllMockUIs()
}

// 가시성 감시
watch(isVisible, (visible, prevVisible) => {
  if (visible) {
    if (!prevVisible) {
      // 섹션에 진입할 때마다 완전히 리셋
      nextTick(() => {
        resetState()
        initCardPositions()
        // 첫 번째 카드 애니메이션 재시작
        setTimeout(() => {
          restartCurrentCardAnimation()
        }, 100)
      })
    }
  } else {
    // 섹션을 벗어날 때
    stopInterval()
    if (timeline) timeline.kill()
  }
})

onMounted(() => {
  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        isVisible.value = entry.isIntersecting
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  )

  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
  stopInterval()
  if (timeline) timeline.kill()
})
</script>

<style scoped>
.card-item {
  transform-origin: center center;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
