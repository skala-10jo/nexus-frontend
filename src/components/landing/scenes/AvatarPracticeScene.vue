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
      <!-- Phase 1: Scenario Selection -->
      <ScenarioSelectionPhase
        v-if="phase === 'scenario'"
        :scenarios="scenarios"
        :selected-scenario="selectedScenario"
        :show-click-ripple="showClickRipple"
        :click-ripple-style="clickRippleStyle"
      />

      <!-- Phase 2: Practice Screen -->
      <PracticePhase
        v-if="phase === 'practice'"
        :avatar-video-src="avatarVideoSrc"
        :avatar-opacity="avatarOpacity"
        :is-speaking="isSpeaking"
        :is-listening="isListening"
        :visible-messages="visibleMessages"
        :show-typing="showTyping"
        :user-input="userInput"
        :is-recording="isRecording"
        :waveform-heights="waveformHeights"
        :show-hint-bubble="showHintBubble"
        :current-hint="currentHint"
        :show-feedback="showFeedback"
        :show-score="showScore"
        :display-score="displayScore"
        :show-breakdown="showBreakdown"
        :visible-feedbacks="visibleFeedbacks"
        :score-items="scoreItems"
        @video-ref="handleVideoRef"
      />

      <!-- Transition Overlay -->
      <div
        class="absolute inset-0 bg-white pointer-events-none z-40 transition-opacity duration-500"
        :style="{ opacity: transitionOverlay }"
      ></div>
    </div>
  </div>
</template>

<script setup>
/**
 * AvatarPracticeScene - 아바타 회화 연습 시연 컴포넌트
 *
 * @description 시나리오 선택 → 아바타 회화 연습 → 피드백 시연
 */
import { ref } from 'vue'
import { scenarios } from '../data/scenarioData'
import { useAvatarPracticeAnimation } from '@/composables/landing/useAvatarPracticeAnimation'
import ScenarioSelectionPhase from './parts/ScenarioSelectionPhase.vue'
import PracticePhase from './parts/PracticePhase.vue'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animationComplete'])

// Refs
const containerRef = ref(null)
const avatarVideoRef = ref(null)

const handleVideoRef = (el) => {
  avatarVideoRef.value = el
}

// Animation composable
const {
  phase,
  headerTitle,
  selectedScenario,
  showClickRipple,
  clickRippleStyle,
  transitionOverlay,
  avatarVideoSrc,
  avatarOpacity,
  isSpeaking,
  isListening,
  visibleMessages,
  showTyping,
  userInput,
  isRecording,
  waveformHeights,
  showHintBubble,
  currentHint,
  showFeedback,
  showScore,
  displayScore,
  showBreakdown,
  visibleFeedbacks,
  scoreItems,
  restartAnimation
} = useAvatarPracticeAnimation(props, emit, avatarVideoRef)

defineExpose({ restartAnimation })
</script>
