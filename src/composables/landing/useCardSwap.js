import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'

/**
 * CardSwap 애니메이션 composable
 * react-bits의 CardSwap 컴포넌트를 Vue 3로 포팅
 *
 * @param {Object} options - 설정 옵션
 * @param {number} options.cardDistance - 카드 간 수평 거리 (기본: 60)
 * @param {number} options.verticalDistance - 카드 간 수직 거리 (기본: 30)
 * @param {number} options.delay - 스왑 간격 ms (기본: 5000)
 * @param {boolean} options.pauseOnHover - 호버 시 일시정지 (기본: true)
 * @param {number} options.skewAmount - 카드 기울기 (기본: 6)
 * @param {string} options.easing - 애니메이션 이징 ('elastic' | 'smooth') (기본: 'elastic')
 */
export function useCardSwap(options = {}) {
  const {
    cardDistance = 60,
    verticalDistance = 30,
    delay = 5000,
    pauseOnHover = true,
    skewAmount = 6,
    easing = 'elastic'
  } = options

  const containerRef = ref(null)
  const cardRefs = ref([])
  const cardOrder = ref([])
  const isPaused = ref(false)
  const isAnimating = ref(false)

  let intervalId = null
  let timeline = null

  // 카드 슬롯 위치 계산
  const calculateSlots = (totalCards) => {
    const slots = []
    for (let i = 0; i < totalCards; i++) {
      slots.push({
        x: i * cardDistance,
        y: i * verticalDistance,
        z: totalCards - i,
        rotate: -skewAmount + (i * (skewAmount * 2) / (totalCards - 1 || 1)),
        zIndex: totalCards - i
      })
    }
    return slots
  }

  // 카드 위치 업데이트
  const updateCardPositions = (animate = true) => {
    const cards = cardRefs.value
    if (!cards || cards.length === 0) return

    const slots = calculateSlots(cards.length)
    const duration = easing === 'elastic' ? 1.5 : 0.6
    const ease = easing === 'elastic' ? 'elastic.out(1, 0.6)' : 'power2.out'

    cardOrder.value.forEach((cardIndex, slotIndex) => {
      const card = cards[cardIndex]
      if (!card) return

      const slot = slots[slotIndex]
      const props = {
        x: slot.x,
        y: slot.y,
        rotation: slot.rotate,
        zIndex: slot.zIndex,
        scale: 1 - (slotIndex * 0.02)
      }

      if (animate) {
        gsap.to(card, {
          ...props,
          duration,
          ease
        })
      } else {
        gsap.set(card, props)
      }
    })
  }

  // 카드 스왑 애니메이션
  const swapCards = () => {
    if (isPaused.value || isAnimating.value) return
    if (cardOrder.value.length < 2) return

    isAnimating.value = true
    const frontCardIndex = cardOrder.value[0]
    const frontCard = cardRefs.value[frontCardIndex]

    if (!frontCard) {
      isAnimating.value = false
      return
    }

    // 앞 카드를 아래로 떨어뜨리고 뒤로 보내기
    const duration = easing === 'elastic' ? 1.2 : 0.5

    if (timeline) timeline.kill()

    timeline = gsap.timeline({
      onComplete: () => {
        isAnimating.value = false
      }
    })

    // 1단계: 앞 카드를 아래로 떨어뜨림
    timeline.to(frontCard, {
      y: 150,
      rotation: 0,
      opacity: 0.5,
      scale: 0.9,
      duration: duration * 0.4,
      ease: 'power2.in'
    })

    // 2단계: 순서 변경 및 위치 업데이트
    timeline.add(() => {
      // 앞 카드를 맨 뒤로 이동
      const newOrder = [...cardOrder.value]
      const first = newOrder.shift()
      newOrder.push(first)
      cardOrder.value = newOrder
    })

    // 3단계: 앞 카드를 새 위치로 이동
    timeline.to(frontCard, {
      y: (cardOrder.value.length - 1) * verticalDistance,
      x: (cardOrder.value.length - 1) * cardDistance,
      rotation: skewAmount,
      opacity: 1,
      scale: 1 - ((cardOrder.value.length - 1) * 0.02),
      zIndex: 1,
      duration: duration * 0.6,
      ease: easing === 'elastic' ? 'elastic.out(1, 0.7)' : 'power2.out'
    }, '-=0.1')

    // 4단계: 나머지 카드들 앞으로 이동
    timeline.add(() => {
      const slots = calculateSlots(cardRefs.value.length)
      cardOrder.value.forEach((cardIndex, slotIndex) => {
        if (cardIndex === frontCardIndex) return
        const card = cardRefs.value[cardIndex]
        if (!card) return

        const slot = slots[slotIndex]
        gsap.to(card, {
          x: slot.x,
          y: slot.y,
          rotation: slot.rotate,
          zIndex: slot.zIndex,
          scale: 1 - (slotIndex * 0.02),
          duration: duration * 0.8,
          ease: easing === 'elastic' ? 'elastic.out(1, 0.6)' : 'power2.out'
        })
      })
    }, `-=${duration * 0.5}`)
  }

  // 인터벌 시작
  const startInterval = () => {
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(swapCards, delay)
  }

  // 인터벌 정지
  const stopInterval = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // 호버 핸들러
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      isPaused.value = true
    }
  }

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      isPaused.value = false
    }
  }

  // 수동 스왑 (클릭 시)
  const manualSwap = () => {
    if (!isAnimating.value) {
      stopInterval()
      swapCards()
      startInterval()
    }
  }

  // 초기화
  const initCards = (cards) => {
    cardRefs.value = cards
    cardOrder.value = cards.map((_, i) => i)
    nextTick(() => {
      updateCardPositions(false)
      startInterval()
    })
  }

  // 정리
  const cleanup = () => {
    stopInterval()
    if (timeline) timeline.kill()
  }

  onUnmounted(cleanup)

  return {
    containerRef,
    cardRefs,
    cardOrder,
    isPaused,
    isAnimating,
    initCards,
    swapCards,
    manualSwap,
    handleMouseEnter,
    handleMouseLeave,
    updateCardPositions,
    startInterval,
    stopInterval,
    cleanup
  }
}
