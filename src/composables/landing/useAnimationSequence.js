/**
 * 애니메이션 시퀀스 관리 composable
 * setTimeout 기반 애니메이션의 생성, 관리, 정리를 담당
 *
 * 사용 파일: 대부분의 MockUI 및 Scene 컴포넌트
 */
import { ref, onUnmounted } from 'vue'

/**
 * 애니메이션 시퀀스 관리
 * @returns {Object} 애니메이션 유틸리티 함수들
 */
export function useAnimationSequence() {
  const timeouts = ref([])
  const intervals = ref([])
  const isAnimating = ref(false)
  const animationCompleted = ref(false)

  /**
   * setTimeout 추가 및 관리
   * @param {Function} callback - 실행할 콜백
   * @param {number} delay - 지연 시간 (ms)
   * @returns {number} timeout ID
   */
  const addTimeout = (callback, delay) => {
    const id = setTimeout(callback, delay)
    timeouts.value.push(id)
    return id
  }

  /**
   * setInterval 추가 및 관리
   * @param {Function} callback - 실행할 콜백
   * @param {number} interval - 간격 (ms)
   * @returns {number} interval ID
   */
  const addInterval = (callback, interval) => {
    const id = setInterval(callback, interval)
    intervals.value.push(id)
    return id
  }

  /**
   * 모든 타이머 정리
   */
  const clearAllTimers = () => {
    timeouts.value.forEach(id => clearTimeout(id))
    intervals.value.forEach(id => clearInterval(id))
    timeouts.value = []
    intervals.value = []
  }

  /**
   * 애니메이션 상태 초기화
   */
  const resetAnimation = () => {
    clearAllTimers()
    isAnimating.value = false
    animationCompleted.value = false
  }

  /**
   * 애니메이션 시작 표시
   */
  const startAnimation = () => {
    isAnimating.value = true
    animationCompleted.value = false
  }

  /**
   * 애니메이션 완료 표시
   */
  const completeAnimation = () => {
    isAnimating.value = false
    animationCompleted.value = true
  }

  /**
   * 순차 애니메이션 실행
   * @param {Array<{callback: Function, delay: number}>} sequence - 애니메이션 시퀀스
   */
  const runSequence = (sequence) => {
    sequence.forEach(({ callback, delay }) => {
      addTimeout(callback, delay)
    })
  }

  // 컴포넌트 언마운트 시 자동 정리
  onUnmounted(() => {
    clearAllTimers()
  })

  return {
    timeouts,
    intervals,
    isAnimating,
    animationCompleted,
    addTimeout,
    addInterval,
    clearAllTimers,
    resetAnimation,
    startAnimation,
    completeAnimation,
    runSequence
  }
}
