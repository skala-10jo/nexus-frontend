/**
 * UnifiedTranslationMockUI 애니메이션 로직
 *
 * @description 텍스트, 음성, 비디오 번역 시연 애니메이션 관리
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  sourceText,
  translatedText,
  sourceTermRanges,
  translatedTermRanges,
  voiceMessageData,
  videoSubtitles,
  termData,
  connectionPaths
} from '@/components/landing/data/unifiedTranslationData'

export function useUnifiedTranslationAnimation(props) {
  // ============================================
  // State
  // ============================================

  // Core state
  const coreActive = ref(false)

  // Panel active states
  const textActive = ref(false)
  const voiceActive = ref(false)
  const videoActive = ref(false)

  // Text Translation State
  const displayedSourceText = ref('')
  const displayedTranslatedText = ref('')
  const isTypingSource = ref(false)
  const isTypingTranslated = ref(false)

  // Voice Translation State
  const voiceMessages = ref([])

  // Video Translation State
  const videoTime = ref('0:00')
  const videoSubtitleChars = ref([])

  // Floating Terms
  const floatingTerms = ref([])

  // Animation control
  let animationTimeouts = []
  let videoInterval = null
  const animationCompleted = ref(false)

  // ============================================
  // Computed
  // ============================================
  const textConnectionPath = computed(() => connectionPaths.text)
  const voiceConnectionPath = computed(() => connectionPaths.voice)
  const videoConnectionPath = computed(() => connectionPaths.video)

  // ============================================
  // Methods
  // ============================================
  const isTermHighlight = (index, type) => {
    const ranges = type === 'source' ? sourceTermRanges : translatedTermRanges
    return ranges.some(r => index >= r.start && index < r.end)
  }

  const clearAllTimeouts = () => {
    animationTimeouts.forEach(t => clearTimeout(t))
    animationTimeouts = []
    if (videoInterval) {
      clearInterval(videoInterval)
      videoInterval = null
    }
  }

  const resetState = () => {
    coreActive.value = false
    textActive.value = false
    voiceActive.value = false
    videoActive.value = false
    displayedSourceText.value = ''
    displayedTranslatedText.value = ''
    isTypingSource.value = false
    isTypingTranslated.value = false
    voiceMessages.value = []
    videoTime.value = '0:00'
    videoSubtitleChars.value = []
    floatingTerms.value = []
    animationCompleted.value = false
  }

  const updateVideoTime = () => {
    let seconds = 0
    videoInterval = setInterval(() => {
      if (!videoActive.value || animationCompleted.value) {
        clearInterval(videoInterval)
        videoInterval = null
        return
      }
      seconds++
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      videoTime.value = `${mins}:${secs.toString().padStart(2, '0')}`
    }, 1000)
  }

  const showVideoSubtitle = (index) => {
    const subtitle = videoSubtitles[index]
    const chars = []

    for (let i = 0; i < subtitle.text.length; i++) {
      const char = subtitle.text[i]
      const isTerm = subtitle.terms.some(term => {
        const termStart = subtitle.text.indexOf(term)
        return i >= termStart && i < termStart + term.length
      })
      chars.push({ text: char, isTerm })
    }

    videoSubtitleChars.value = chars
  }

  const startAnimation = () => {
    if (animationCompleted.value) {
      resetState()
    }

    // 0.3s: Activate core
    animationTimeouts.push(setTimeout(() => {
      coreActive.value = true
    }, 300))

    // 0.5s: Add floating terms one by one
    termData.forEach((term, idx) => {
      animationTimeouts.push(setTimeout(() => {
        const angle = (idx * 90 + 45) * (Math.PI / 180)
        const radius = 55
        floatingTerms.value.push({
          ...term,
          style: {
            left: `${40 + Math.cos(angle) * radius}px`,
            top: `${40 + Math.sin(angle) * radius}px`,
            transform: 'translate(-50%, -50%)'
          }
        })
      }, 500 + idx * 200))
    })

    // 1.5s: Start text translation
    animationTimeouts.push(setTimeout(() => {
      textActive.value = true
      isTypingSource.value = true
    }, 1500))

    // Type source text
    for (let i = 0; i <= sourceText.length; i++) {
      animationTimeouts.push(setTimeout(() => {
        displayedSourceText.value = sourceText.slice(0, i)
      }, 1600 + i * 30))
    }

    // 3.5s: Start translated text
    animationTimeouts.push(setTimeout(() => {
      isTypingSource.value = false
      isTypingTranslated.value = true
    }, 3500))

    for (let i = 0; i <= translatedText.length; i++) {
      animationTimeouts.push(setTimeout(() => {
        displayedTranslatedText.value = translatedText.slice(0, i)
      }, 3600 + i * 35))
    }

    animationTimeouts.push(setTimeout(() => {
      isTypingTranslated.value = false
    }, 5200))

    // 2.5s: Start voice translation (parallel)
    animationTimeouts.push(setTimeout(() => {
      voiceActive.value = true
    }, 2500))

    voiceMessageData.forEach((msg, idx) => {
      animationTimeouts.push(setTimeout(() => {
        voiceMessages.value.push(msg)
      }, 2700 + idx * 600))
    })

    // 3.0s: Start video translation (parallel)
    animationTimeouts.push(setTimeout(() => {
      videoActive.value = true
      updateVideoTime()
    }, 3000))

    // Show first subtitle
    animationTimeouts.push(setTimeout(() => {
      showVideoSubtitle(0)
    }, 3200))

    // Show second subtitle
    animationTimeouts.push(setTimeout(() => {
      showVideoSubtitle(1)
    }, 5500))

    // Mark animation complete
    animationTimeouts.push(setTimeout(() => {
      animationCompleted.value = true
    }, 7500))
  }

  // ============================================
  // Lifecycle
  // ============================================
  watch(() => props.isVisible, (newVal, oldVal) => {
    if (newVal && !oldVal) {
      if (animationCompleted.value) {
        resetState()
        startAnimation()
      } else if (!coreActive.value) {
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
    // Core state
    coreActive,

    // Panel states
    textActive,
    voiceActive,
    videoActive,

    // Text translation
    displayedSourceText,
    displayedTranslatedText,
    isTypingSource,
    isTypingTranslated,

    // Voice translation
    voiceMessages,

    // Video translation
    videoTime,
    videoSubtitleChars,

    // Floating terms
    floatingTerms,

    // Connection paths
    textConnectionPath,
    voiceConnectionPath,
    videoConnectionPath,

    // Methods
    isTermHighlight
  }
}
