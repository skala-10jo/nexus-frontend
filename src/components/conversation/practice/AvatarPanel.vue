<script setup>
/**
 * Avatar Panel 컴포넌트
 *
 * Azure AI Speech Avatar WebRTC 또는 Viseme 기반 입모양 렌더링
 * 기존 TTS 흐름과 독립적으로 동작하며, 패널이 열린 경우에만 활성화
 */
import { onMounted, onUnmounted, watch } from 'vue'
import { useAvatarPanel } from '@/composables/conversation/useAvatarPanel'
import { useAvatarCanvas } from '@/composables/conversation/useAvatarCanvas'
import {
  XMarkIcon,
  SpeakerWaveIcon,
  ArrowPathIcon,
  UserCircleIcon,
  VideoCameraIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** TTS 텍스트 (외부에서 전달) */
  ttsText: {
    type: String,
    default: ''
  },
  /** TTS 언어 */
  language: {
    type: String,
    default: 'en-US'
  },
  /** 오디오 URL (있는 경우) */
  audioUrl: {
    type: String,
    default: null
  }
})

const emit = defineEmits(['close'])

// ========== Composables ==========

const {
  canvasRef,
  currentMouthShape,
  initCanvas,
  resetMouthShape
} = useAvatarCanvas()

const {
  videoRef,
  avatarMode,
  isPanelOpen,
  isLoading,
  isSpeaking,
  connectionStatus,
  error,
  initializeWebRTC,
  applyToAvatar,
  closePanel,
  retry,
  cleanup
} = useAvatarPanel({
  onMouthShapeReset: resetMouthShape
})

// ========== Watchers ==========

/**
 * 패널 열림 상태 감시 - WebRTC 초기화
 */
watch(
  isPanelOpen,
  async (isOpen) => {
    if (isOpen) {
      await initializeWebRTC(initCanvas)
    }
  }
)

/**
 * TTS 텍스트가 변경되면 아바타에 적용
 */
watch(
  () => props.ttsText,
  async (newText) => {
    if (!newText || !isPanelOpen.value) return
    await applyToAvatar(newText, props.language, props.audioUrl)
  }
)

/**
 * Viseme 모드에서 avatarMode 변경 감시
 */
watch(
  avatarMode,
  (mode) => {
    if (mode === 'viseme') {
      initCanvas()
    }
  }
)

// ========== Handlers ==========

function handleClose() {
  closePanel(() => emit('close'))
}

async function handleRetry() {
  await retry(props.ttsText, props.language)
}

// ========== Lifecycle ==========

onMounted(() => {
  initCanvas()
})

onUnmounted(async () => {
  await cleanup()
})
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div
      v-if="isPanelOpen"
      class="absolute top-4 left-4 z-50 bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
      style="width: 240px"
    >
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div class="flex items-center gap-2">
          <UserCircleIcon class="w-5 h-5 text-blue-400" />
          <span class="text-white font-medium text-sm">AI Avatar</span>
        </div>
        <button
          @click="handleClose"
          class="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <XMarkIcon class="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <!-- Avatar Display Area -->
      <div class="relative flex items-center justify-center p-4 bg-gradient-to-b from-gray-800/50 to-gray-900/50">
        <!-- WebRTC Video (Primary) -->
        <video
          v-show="avatarMode === 'webrtc'"
          ref="videoRef"
          autoplay
          playsinline
          class="rounded-xl shadow-inner w-[200px] h-[200px] object-cover bg-gray-800"
        />

        <!-- Canvas Fallback (Viseme Mode) -->
        <canvas
          v-show="avatarMode === 'viseme'"
          ref="canvasRef"
          class="rounded-xl shadow-inner"
        />

        <!-- Mode Indicator -->
        <div class="absolute top-2 left-2">
          <div class="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-400 flex items-center gap-1">
            <VideoCameraIcon v-if="avatarMode === 'webrtc'" class="w-3 h-3" />
            <span>{{ avatarMode === 'webrtc' ? 'WebRTC' : 'Viseme' }}</span>
          </div>
        </div>

        <!-- Status Badge -->
        <div class="absolute top-2 right-2">
          <div
            class="px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5"
            :class="{
              'bg-green-500/20 text-green-400': connectionStatus === 'connected',
              'bg-yellow-500/20 text-yellow-400': connectionStatus === 'connecting',
              'bg-red-500/20 text-red-400': connectionStatus === 'error',
              'bg-gray-500/20 text-gray-400': connectionStatus === 'disconnected'
            }"
          >
            <span
              class="w-1.5 h-1.5 rounded-full"
              :class="{
                'bg-green-400': connectionStatus === 'connected',
                'bg-yellow-400 animate-pulse': connectionStatus === 'connecting',
                'bg-red-400': connectionStatus === 'error',
                'bg-gray-400': connectionStatus === 'disconnected'
              }"
            />
            {{ connectionStatus === 'connected' ? 'Active' :
               connectionStatus === 'connecting' ? 'Connecting' :
               connectionStatus === 'error' ? 'Error' : 'Ready' }}
          </div>
        </div>

        <!-- Loading Overlay -->
        <div
          v-if="isLoading"
          class="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl"
        >
          <ArrowPathIcon class="w-8 h-8 text-white animate-spin" />
        </div>
      </div>

      <!-- Speaking Indicator -->
      <div
        v-if="isSpeaking"
        class="px-4 py-2 bg-blue-500/10 border-t border-white/5"
      >
        <div class="flex items-center gap-2">
          <SpeakerWaveIcon class="w-4 h-4 text-blue-400 animate-pulse" />
          <span class="text-blue-300 text-xs font-medium">Speaking...</span>
          <div class="flex-1 flex justify-end gap-0.5">
            <span class="w-1 h-3 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0ms" />
            <span class="w-1 h-4 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 150ms" />
            <span class="w-1 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 300ms" />
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-if="error"
        class="px-4 py-3 bg-red-500/10 border-t border-white/5"
      >
        <div class="flex items-center justify-between">
          <span class="text-red-400 text-xs">{{ error }}</span>
          <button
            @click="handleRetry"
            class="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Mouth Shape Debug (개발용) -->
      <div class="px-4 py-2 border-t border-white/5 text-center">
        <span class="text-gray-500 text-[10px] font-mono">
          {{ currentMouthShape }}
        </span>
      </div>
    </div>
  </Transition>
</template>
