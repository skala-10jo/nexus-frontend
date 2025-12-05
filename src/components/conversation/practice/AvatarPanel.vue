<script setup>
/**
 * Avatar Panel 컴포넌트
 *
 * Azure AI Speech Avatar WebRTC 또는 Viseme 기반 입모양 렌더링
 * 기존 TTS 흐름과 독립적으로 동작하며, 패널이 열린 경우에만 활성화
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { avatarAdapter } from '@/services/avatarAdapter'
import voiceAvatarService from '@/services/voiceAvatarService'
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

const avatarStore = useAvatarStore()

// ========== Local State ==========

/** 현재 입 모양 (viseme 이름) */
const currentMouthShape = ref('silence')

/** Viseme 스케줄러 컨트롤러 */
let visemeController = null

/** 캔버스 ref (Fallback용) */
const canvasRef = ref(null)

/** 비디오 ref (WebRTC용) */
const videoRef = ref(null)

/** 2D 컨텍스트 */
let ctx = null

/** Avatar 모드: 'webrtc' | 'viseme' */
const avatarMode = ref('webrtc')

/** WebRTC 초기화 상태 */
const isWebRTCInitialized = ref(false)

// ========== Computed ==========

const isPanelOpen = computed(() => avatarStore.isPanelOpen)
const isLoading = computed(() => avatarStore.isLoading)
const isSpeaking = computed(() => avatarStore.isSpeaking)
const connectionStatus = computed(() => avatarStore.connectionStatus)
const error = computed(() => avatarStore.error)

// ========== Watchers ==========

/**
 * 패널 열림 상태 감시 - WebRTC 초기화
 */
watch(
  isPanelOpen,
  async (isOpen) => {
    if (isOpen && !isWebRTCInitialized.value) {
      await initializeWebRTC()
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
    await applyToAvatar(newText)
  }
)

/**
 * Viseme 인덱스 변경 시 입 모양 업데이트 (Fallback 모드용)
 */
watch(
  () => avatarStore.currentVisemeId,
  (visemeId) => {
    if (avatarMode.value === 'viseme') {
      currentMouthShape.value = avatarAdapter.visemeIdToName(visemeId)
      drawAvatar()
    }
  }
)

// ========== Methods ==========

/**
 * WebRTC 초기화
 */
async function initializeWebRTC() {
  if (isWebRTCInitialized.value) return

  try {
    avatarStore.setLoading(true)
    avatarStore.setConnectionStatus('connecting')

    // Video 엘리먼트가 준비될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 100))

    if (videoRef.value) {
      // WebRTC Avatar 초기화
      await voiceAvatarService.initializeAvatar(videoRef.value, {
        character: 'lisa',
        style: 'casual-sitting'
      })

      // 세션 시작
      await voiceAvatarService.startAvatarSession('lisa', 'casual-sitting')

      isWebRTCInitialized.value = true
      avatarMode.value = 'webrtc'
      avatarStore.setConnectionStatus('connected')
    } else {
      // Video 엘리먼트가 없으면 Viseme fallback
      avatarMode.value = 'viseme'
      initCanvas()
      avatarStore.setConnectionStatus('connected')
    }
  } catch (err) {
    // Fallback to viseme mode
    avatarMode.value = 'viseme'
    initCanvas()
    avatarStore.setConnectionStatus('connected')
  } finally {
    avatarStore.setLoading(false)
  }
}

/**
 * TTS 결과를 아바타에 적용
 */
async function applyToAvatar(text) {
  if (!text) return

  try {
    avatarStore.setLoading(true)
    avatarStore.clearError()

    if (avatarMode.value === 'webrtc' && isWebRTCInitialized.value) {
      // WebRTC 모드: 음성과 함께 아바타 구동
      await voiceAvatarService.speakWithAvatar(text, props.language)
      avatarStore.setConnectionStatus('connected')
    } else {
      // Viseme 모드: 백엔드에 아바타 적용 요청
      const result = await avatarAdapter.apply({
        text,
        audioUrl: props.audioUrl,
        language: props.language,
        avatarStyle: avatarStore.avatarStyle
      })

      // Store에 결과 적용
      avatarStore.applyTTSResult(result)

      // Viseme 애니메이션 시작
      startVisemeAnimation(result.visemes)
    }

    avatarStore.setConnectionStatus('connected')
  } catch (err) {
    console.error('[AvatarPanel] Apply error:', err)
    avatarStore.setError(err.message || '아바타 적용 실패')
  } finally {
    avatarStore.setLoading(false)
  }
}

/**
 * Viseme 애니메이션 시작
 */
function startVisemeAnimation(visemes) {
  // 이전 애니메이션 중지
  if (visemeController) {
    visemeController.stop()
  }

  if (!visemes || visemes.length === 0) return

  visemeController = avatarAdapter.scheduleVisemes(
    visemes,
    (visemeId, index) => {
      avatarStore.updateVisemeIndex(index)
    },
    () => {
      // 애니메이션 완료
      avatarStore.updateVisemeIndex(visemes.length)
      currentMouthShape.value = 'silence'
      drawAvatar()
    }
  )
}

/**
 * 패널 닫기
 */
async function closePanel() {
  if (visemeController) {
    visemeController.stop()
  }

  // WebRTC 연결 해제
  if (isWebRTCInitialized.value) {
    await voiceAvatarService.disconnectAvatar()
    isWebRTCInitialized.value = false
  }

  avatarStore.closePanel()
  emit('close')
}

/**
 * 재시도
 */
async function retry() {
  if (props.ttsText) {
    await applyToAvatar(props.ttsText)
  }
}

/**
 * 캔버스에 아바타 그리기 (간단한 2D 표현)
 */
function drawAvatar() {
  if (!ctx || !canvasRef.value) return

  const canvas = canvasRef.value
  const width = canvas.width
  const height = canvas.height
  const centerX = width / 2
  const centerY = height / 2

  // 배경 클리어
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, width, height)

  // 얼굴 (원)
  ctx.beginPath()
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
  ctx.fillStyle = '#ffd93d'
  ctx.fill()
  ctx.strokeStyle = '#ff6b6b'
  ctx.lineWidth = 3
  ctx.stroke()

  // 눈 (왼쪽)
  ctx.beginPath()
  ctx.arc(centerX - 30, centerY - 20, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#333'
  ctx.fill()

  // 눈 (오른쪽)
  ctx.beginPath()
  ctx.arc(centerX + 30, centerY - 20, 10, 0, Math.PI * 2)
  ctx.fillStyle = '#333'
  ctx.fill()

  // 입 (viseme에 따라 변경)
  drawMouth(centerX, centerY + 30)
}

/**
 * 입 모양 그리기
 */
function drawMouth(x, y) {
  if (!ctx) return

  ctx.beginPath()

  const shape = currentMouthShape.value

  switch (shape) {
    case 'silence':
      // 다물린 입
      ctx.moveTo(x - 25, y)
      ctx.lineTo(x + 25, y)
      ctx.strokeStyle = '#333'
      ctx.lineWidth = 3
      ctx.stroke()
      break

    case 'ae_ax_ah':
    case 'aa':
      // 크게 벌린 입 (아)
      ctx.ellipse(x, y, 25, 20, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
      break

    case 'ao':
    case 'ow':
      // 동그란 입 (오)
      ctx.arc(x, y, 15, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
      break

    case 'ey_eh_uh':
    case 'y_iy_ih_ix':
      // 옆으로 벌린 입 (이)
      ctx.ellipse(x, y, 20, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
      break

    case 'w_uw':
      // 입술 내민 입 (우)
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
      break

    case 'p_b_m':
      // 다문 입술
      ctx.moveTo(x - 20, y)
      ctx.lineTo(x + 20, y)
      ctx.strokeStyle = '#ff6b6b'
      ctx.lineWidth = 5
      ctx.stroke()
      break

    default:
      // 기본 (살짝 벌린)
      ctx.ellipse(x, y, 15, 10, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#ff6b6b'
      ctx.fill()
  }
}

/**
 * 캔버스 초기화
 */
function initCanvas() {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  canvas.width = 200
  canvas.height = 200

  ctx = canvas.getContext('2d')
  drawAvatar()
}

// ========== Lifecycle ==========

onMounted(() => {
  initCanvas()
})

onUnmounted(async () => {
  if (visemeController) {
    visemeController.stop()
  }

  // WebRTC 연결 정리
  if (isWebRTCInitialized.value) {
    await voiceAvatarService.disconnectAvatar()
  }
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
          @click="closePanel"
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
            @click="retry"
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
