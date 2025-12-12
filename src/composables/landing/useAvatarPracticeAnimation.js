/**
 * AvatarPracticeScene 애니메이션 로직
 *
 * @description 아바타 회화 연습 시연 애니메이션 관리
 */
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import {
  practiceMessages,
  practiceFeedbacks,
  initialScoreItems,
  targetScoreItems,
  defaultHint,
  avatarVideoPath
} from '@/components/landing/data/avatarPracticeData'

export function useAvatarPracticeAnimation(props, emit, avatarVideoRef) {
  // ============================================
  // State - Phase & UI
  // ============================================
  const phase = ref('scenario')
  const headerTitle = ref('AI 시나리오 생성 완료')
  const selectedScenario = ref(null)
  const showClickRipple = ref(false)
  const clickRippleStyle = ref({})
  const transitionOverlay = ref(0)

  // ============================================
  // State - Avatar
  // ============================================
  const avatarVideoSrc = avatarVideoPath
  const avatarOpacity = ref(0)
  const isSpeaking = ref(false)
  const isListening = ref(false)

  // ============================================
  // State - Chat
  // ============================================
  const visibleMessages = ref([])
  const showTyping = ref(false)
  const userInput = ref('')
  const isRecording = ref(false)
  const waveformHeights = ref(Array(20).fill(4))

  // ============================================
  // State - Hint
  // ============================================
  const showHintBubble = ref(false)
  const currentHint = ref(defaultHint)

  // ============================================
  // State - Feedback
  // ============================================
  const showFeedback = ref(false)
  const showScore = ref(false)
  const displayScore = ref(0)
  const showBreakdown = ref(false)
  const visibleFeedbacks = ref([])
  const scoreItems = ref([...initialScoreItems])

  // ============================================
  // Internal
  // ============================================
  let timeline = null
  let waveformInterval = null

  // ============================================
  // Waveform Methods
  // ============================================
  const startWaveform = () => {
    waveformInterval = setInterval(() => {
      waveformHeights.value = waveformHeights.value.map(() =>
        Math.floor(Math.random() * 24) + 4
      )
    }, 100)
  }

  const stopWaveform = () => {
    if (waveformInterval) {
      clearInterval(waveformInterval)
      waveformInterval = null
    }
    waveformHeights.value = Array(20).fill(4)
  }

  // ============================================
  // Video Methods
  // ============================================
  const playVideo = () => {
    if (avatarVideoRef.value) {
      avatarVideoRef.value.currentTime = 0
      avatarVideoRef.value.play().catch(() => {})
    }
  }

  const pauseVideo = () => {
    if (avatarVideoRef.value) {
      avatarVideoRef.value.pause()
    }
  }

  // ============================================
  // Reset State
  // ============================================
  const resetState = () => {
    phase.value = 'scenario'
    headerTitle.value = 'AI 시나리오 생성 완료'
    selectedScenario.value = null
    showClickRipple.value = false
    clickRippleStyle.value = {}
    transitionOverlay.value = 0

    avatarOpacity.value = 0
    isSpeaking.value = false
    isListening.value = false

    visibleMessages.value = []
    showTyping.value = false
    userInput.value = ''
    isRecording.value = false
    waveformHeights.value = Array(20).fill(4)

    showHintBubble.value = false
    currentHint.value = defaultHint

    showFeedback.value = false
    showScore.value = false
    displayScore.value = 0
    showBreakdown.value = false
    visibleFeedbacks.value = []
    scoreItems.value = [...initialScoreItems]

    stopWaveform()
    pauseVideo()
  }

  // ============================================
  // Animation Timeline
  // ============================================
  const runAnimation = () => {
    if (timeline) timeline.kill()
    resetState()

    timeline = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => emit('animationComplete')
    })

    // Phase 1: Scenario Selection
    timeline.add(() => {
      selectedScenario.value = 0
    }, 0.5)

    // Click effect
    timeline.add(() => {
      showClickRipple.value = true
      clickRippleStyle.value = {
        left: '136px',
        top: '160px',
        width: '20px',
        height: '20px',
        opacity: 1
      }
      gsap.to(clickRippleStyle.value, {
        width: '80px',
        height: '80px',
        opacity: 0,
        duration: 0.5,
        ease: 'power2.out'
      })
    }, 1.5)

    // Transition to practice
    timeline.to(transitionOverlay, { value: 1, duration: 0.4 }, 2.0)

    timeline.add(() => {
      phase.value = 'practice'
      headerTitle.value = '아바타 회화 연습'
      showClickRipple.value = false
    }, 2.4)

    timeline.to(transitionOverlay, { value: 0, duration: 0.4 }, 2.5)

    // Phase 2: Practice - Avatar
    timeline.to(avatarOpacity, { value: 1, duration: 0.3 }, 2.5)
    timeline.add(() => playVideo(), 2.5)

    // AI speaks first message
    timeline.add(() => { isSpeaking.value = true }, 2.8)
    timeline.add(() => { visibleMessages.value = [practiceMessages[0]] }, 3.1)
    timeline.add(() => { isSpeaking.value = false }, 4.6)

    // Show hint
    timeline.add(() => { showHintBubble.value = true }, 5.1)
    timeline.add(() => { showHintBubble.value = false }, 7.1)

    // User recording
    timeline.add(() => {
      isListening.value = true
      isRecording.value = true
      startWaveform()
    }, 7.6)

    timeline.add(() => {
      isRecording.value = false
      stopWaveform()
    }, 9.6)

    // Type user message
    const userText = practiceMessages[1].text
    for (let i = 0; i <= userText.length; i++) {
      timeline.add(() => {
        userInput.value = userText.slice(0, i)
      }, 9.6 + i * 0.03)
    }

    // Send user message
    timeline.add(() => {
      userInput.value = ''
      isListening.value = false
      visibleMessages.value = [practiceMessages[0], practiceMessages[1]]
    }, 11.1)

    // AI typing & response
    timeline.add(() => { showTyping.value = true }, 11.6)
    timeline.add(() => {
      isSpeaking.value = true
      showTyping.value = false
      visibleMessages.value = [...practiceMessages]
    }, 12.6)
    timeline.add(() => { isSpeaking.value = false }, 14.1)

    // Show feedback panel
    timeline.add(() => { showFeedback.value = true }, 14.6)
    timeline.add(() => { showScore.value = true }, 15.1)

    // Animate score
    timeline.to(displayScore, {
      value: 87,
      duration: 1.0,
      ease: 'power2.out',
      onUpdate: () => {
        displayScore.value = Math.round(displayScore.value)
      }
    }, 15.3)

    // Show breakdown
    timeline.add(() => { showBreakdown.value = true }, 15.8)

    // Animate score bars
    timeline.add(() => { scoreItems.value[0] = { ...targetScoreItems[0] } }, 16.0)
    timeline.add(() => { scoreItems.value[1] = { ...targetScoreItems[1] } }, 16.2)
    timeline.add(() => { scoreItems.value[2] = { ...targetScoreItems[2] } }, 16.4)

    // Show feedbacks
    timeline.add(() => { visibleFeedbacks.value = [practiceFeedbacks[0]] }, 16.8)
    timeline.add(() => { visibleFeedbacks.value = [practiceFeedbacks[0], practiceFeedbacks[1]] }, 17.3)
    timeline.add(() => { visibleFeedbacks.value = [...practiceFeedbacks] }, 17.8)
  }

  // ============================================
  // Restart
  // ============================================
  const restartAnimation = () => {
    if (timeline) timeline.kill()
    resetState()
    nextTick(() => runAnimation())
  }

  // ============================================
  // Lifecycle
  // ============================================
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
    stopWaveform()
    pauseVideo()
  })

  // ============================================
  // Return
  // ============================================
  return {
    // Phase & UI
    phase,
    headerTitle,
    selectedScenario,
    showClickRipple,
    clickRippleStyle,
    transitionOverlay,

    // Avatar
    avatarVideoSrc,
    avatarOpacity,
    isSpeaking,
    isListening,

    // Chat
    visibleMessages,
    showTyping,
    userInput,
    isRecording,
    waveformHeights,

    // Hint
    showHintBubble,
    currentHint,

    // Feedback
    showFeedback,
    showScore,
    displayScore,
    showBreakdown,
    visibleFeedbacks,
    scoreItems,

    // Methods
    restartAnimation
  }
}
