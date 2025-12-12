/**
 * TranslationFeatureSection 카드 스왑 애니메이션 로직
 *
 * @description 번역 기능 카드 스택 스왑 애니메이션 관리
 */
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { cardAnimationConfig } from '@/components/landing/data/translationFeatureData'

export function useCardSwapAnimation(sectionRef, cardRefs, mockUIRefs) {
  // ============================================
  // State
  // ============================================
  const isVisible = ref(false)
  const isPaused = ref(false)
  const isAnimating = ref(false)
  const cardOrder = ref([0, 1, 2])
  const cycleCount = ref(0)
  const isFirstCycle = ref(true)

  let observer = null
  let intervalId = null
  let timeline = null

  // ============================================
  // Config
  // ============================================
  const {
    cardDistance,
    verticalDistance,
    skewAmount,
    secondCycleDelay,
    cardSwapDelay,
    manualSwapDelay
  } = cardAnimationConfig

  // ============================================
  // Computed
  // ============================================
  const currentCardIndex = computed(() => cardOrder.value[0])

  // ============================================
  // Helper Functions
  // ============================================
  const getCardRefs = () => [
    cardRefs.card0.value,
    cardRefs.card1.value,
    cardRefs.card2.value
  ]

  const calculateSlots = () => [
    { x: 0, y: 0, rotate: -skewAmount, zIndex: 3, scale: 1 },
    { x: cardDistance, y: verticalDistance, rotate: 0, zIndex: 2, scale: 0.97 },
    { x: cardDistance * 2, y: verticalDistance * 2, rotate: skewAmount, zIndex: 1, scale: 0.94 }
  ]

  // ============================================
  // Card Position Management
  // ============================================
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

  // ============================================
  // Interval Management
  // ============================================
  const startInterval = () => {
    stopInterval()
    if (!isPaused.value && isVisible.value) {
      intervalId = setInterval(() => {
        if (!isPaused.value && isVisible.value) {
          swapCards()
        }
      }, secondCycleDelay)
    }
  }

  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // ============================================
  // Card Swap Animation
  // ============================================
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

        // 한 바퀴 완료 체크
        if (cardOrder.value[0] === 0 && cycleCount.value === 0) {
          cycleCount.value = 1
          isFirstCycle.value = false
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

  // ============================================
  // Public Methods
  // ============================================
  const onCardAnimationComplete = (cardIndex) => {
    if (isFirstCycle.value && cardOrder.value[0] === cardIndex && !isPaused.value && isVisible.value) {
      setTimeout(() => {
        if (!isPaused.value && isVisible.value && isFirstCycle.value) {
          swapCards()
        }
      }, cardSwapDelay)
    }
  }

  const goToCard = (targetIndex) => {
    if (isAnimating.value) return
    if (cardOrder.value[0] === targetIndex) return

    stopInterval()

    const swapUntilTarget = () => {
      if (cardOrder.value[0] === targetIndex) {
        if (!isFirstCycle.value) {
          startInterval()
        }
        return
      }
      swapCards()
      setTimeout(swapUntilTarget, manualSwapDelay)
    }

    swapUntilTarget()
  }

  const manualSwap = () => {
    if (!isAnimating.value) {
      stopInterval()
      swapCards()
      if (!isFirstCycle.value) {
        startInterval()
      }
    }
  }

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

  // ============================================
  // MockUI Reset Methods
  // ============================================
  const resetAllMockUIs = () => {
    if (mockUIRefs.textMockUI.value?.resetState) mockUIRefs.textMockUI.value.resetState()
    if (mockUIRefs.voiceMockUI.value?.resetState) mockUIRefs.voiceMockUI.value.resetState()
    if (mockUIRefs.videoMockUI.value?.resetState) mockUIRefs.videoMockUI.value.resetState()
  }

  const restartCurrentCardAnimation = () => {
    const currentCard = currentCardIndex.value
    if (currentCard === 0 && mockUIRefs.textMockUI.value?.restartAnimation) {
      mockUIRefs.textMockUI.value.restartAnimation()
    } else if (currentCard === 1 && mockUIRefs.voiceMockUI.value?.restartAnimation) {
      mockUIRefs.voiceMockUI.value.restartAnimation()
    } else if (currentCard === 2 && mockUIRefs.videoMockUI.value?.restartAnimation) {
      mockUIRefs.videoMockUI.value.restartAnimation()
    }
  }

  const resetState = () => {
    stopInterval()
    if (timeline) timeline.kill()

    cardOrder.value = [0, 1, 2]
    cycleCount.value = 0
    isFirstCycle.value = true
    isAnimating.value = false
    isPaused.value = false

    resetAllMockUIs()
  }

  // ============================================
  // Lifecycle
  // ============================================
  watch(isVisible, (visible, prevVisible) => {
    if (visible) {
      if (!prevVisible) {
        nextTick(() => {
          resetState()
          initCardPositions()
          setTimeout(() => {
            restartCurrentCardAnimation()
          }, 100)
        })
      }
    } else {
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

  // ============================================
  // Return
  // ============================================
  return {
    // State
    isVisible,
    currentCardIndex,

    // Methods
    onCardAnimationComplete,
    goToCard,
    manualSwap,
    handleMouseEnter,
    handleMouseLeave
  }
}
