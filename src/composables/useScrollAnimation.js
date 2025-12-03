/**
 * Scroll-based animation composable
 * Intersection Observer를 사용한 스크롤 애니메이션
 */
import { ref, onMounted, onUnmounted } from 'vue'

export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.2,
    rootMargin = '0px 0px -50px 0px'
  } = options

  const isVisible = ref(false)
  const elementRef = ref(null)
  let observer = null

  onMounted(() => {
    if (!elementRef.value) return

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin }
    )

    observer.observe(elementRef.value)
  })

  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
    }
  })

  return {
    elementRef,
    isVisible
  }
}
