/**
 * RealtimeMeetingMockUI 애니메이션 로직
 *
 * @description 회의 분석 및 학습 모드 시연 애니메이션 관리
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { messages, headerTitles } from '@/components/landing/data/realtimeMeetingData'

export function useRealtimeMeetingAnimation(props) {
  // ============================================
  // State
  // ============================================

  // Phase 관리
  const phase = ref('upload')
  const headerTitle = ref(headerTitles.upload)

  // Upload phase state
  const isDragging = ref(false)
  const isUploading = ref(false)
  const uploadProgress = ref(0)

  // Result phase state
  const visibleMessages = ref([])
  const selectedMessage = ref(null)

  // Practice phase state
  const isPracticeRecording = ref(false)
  const showPracticeResult = ref(false)

  // Button animation state
  const isButtonPressed = ref(false)
  const showButtonRipple = ref(false)

  // Animation control
  const animationCompleted = ref(false)
  let animationTimeouts = []

  // ============================================
  // Computed
  // ============================================
  const currentMessageScore = computed(() => {
    if (selectedMessage.value !== null && visibleMessages.value[selectedMessage.value]) {
      return visibleMessages.value[selectedMessage.value].score || 0
    }
    return 0
  })

  // ============================================
  // Methods
  // ============================================
  const selectMessage = (idx) => {
    selectedMessage.value = idx
  }

  const clearAllTimeouts = () => {
    animationTimeouts.forEach(t => clearTimeout(t))
    animationTimeouts = []
  }

  const resetState = () => {
    phase.value = 'upload'
    headerTitle.value = headerTitles.upload
    isDragging.value = false
    isUploading.value = false
    uploadProgress.value = 0
    visibleMessages.value = []
    selectedMessage.value = null
    isPracticeRecording.value = false
    showPracticeResult.value = false
    animationCompleted.value = false
    isButtonPressed.value = false
    showButtonRipple.value = false
  }

  const startAnimation = () => {
    if (animationCompleted.value) {
      resetState()
    }

    // Phase 1: Upload (빠르게)
    animationTimeouts.push(setTimeout(() => {
      isDragging.value = true
    }, 300))

    animationTimeouts.push(setTimeout(() => {
      isDragging.value = false
      isUploading.value = true
    }, 600))

    // Upload progress (빠르게 - 1초 내에 완료)
    for (let i = 0; i <= 100; i += 10) {
      animationTimeouts.push(setTimeout(() => {
        uploadProgress.value = i
      }, 600 + i * 8))
    }

    // Phase 2: Result (1.5초 후)
    animationTimeouts.push(setTimeout(() => {
      phase.value = 'result'
      headerTitle.value = headerTitles.result
    }, 1600))

    // Show messages one by one (빠르게)
    messages.forEach((msg, idx) => {
      animationTimeouts.push(setTimeout(() => {
        visibleMessages.value.push(msg)
      }, 1800 + idx * 150))
    })

    // 첫번째 메시지 자동 선택 (메시지 다 나온 후)
    animationTimeouts.push(setTimeout(() => {
      selectedMessage.value = 0
    }, 2900))

    // 다른 메시지 선택 시뮬레이션
    animationTimeouts.push(setTimeout(() => {
      selectedMessage.value = 2
    }, 3800))

    animationTimeouts.push(setTimeout(() => {
      selectedMessage.value = 4
    }, 4700))

    // 버튼 클릭 효과 시작 (6초)
    animationTimeouts.push(setTimeout(() => {
      isButtonPressed.value = true
      showButtonRipple.value = true
    }, 6000))

    // 버튼 클릭 효과 끝 (6.3초)
    animationTimeouts.push(setTimeout(() => {
      isButtonPressed.value = false
      showButtonRipple.value = false
    }, 6300))

    // Phase 3: Practice (6.5초 후)
    animationTimeouts.push(setTimeout(() => {
      phase.value = 'practice'
      headerTitle.value = headerTitles.practice
    }, 6500))

    animationTimeouts.push(setTimeout(() => {
      isPracticeRecording.value = true
    }, 7200))

    animationTimeouts.push(setTimeout(() => {
      isPracticeRecording.value = false
      showPracticeResult.value = true
    }, 8800))

    // 애니메이션 완료 표시
    animationTimeouts.push(setTimeout(() => {
      animationCompleted.value = true
    }, 9500))
  }

  // ============================================
  // Lifecycle
  // ============================================
  watch(() => props.isVisible, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      if (animationCompleted.value) {
        resetState()
        startAnimation()
      } else if (phase.value === 'upload' && !isUploading.value) {
        startAnimation()
      }
    } else if (!newVal) {
      clearAllTimeouts()
    }
  })

  onMounted(() => {
    if (props.isVisible) {
      startAnimation()
    }
  })

  onUnmounted(() => {
    clearAllTimeouts()
  })

  // ============================================
  // Return
  // ============================================
  return {
    // Phase state
    phase,
    headerTitle,

    // Upload phase
    isDragging,
    isUploading,
    uploadProgress,

    // Result phase
    visibleMessages,
    selectedMessage,
    currentMessageScore,

    // Practice phase
    isPracticeRecording,
    showPracticeResult,

    // Button animation
    isButtonPressed,
    showButtonRipple,

    // Methods
    selectMessage
  }
}
