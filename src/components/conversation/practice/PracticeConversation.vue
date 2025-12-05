<script setup>
/**
 * Practice 대화 영역 컴포넌트
 *
 * 메시지 목록, 아바타 뷰, 로딩 상태를 표시합니다.
 */
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount, nextTick } from 'vue'
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  LightBulbIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
  ChartBarIcon,
  SpeakerWaveIcon,
  StopIcon
} from '@heroicons/vue/24/outline'
import AvatarPanel from './AvatarPanel.vue'
import voiceAvatarService from '@/services/voiceAvatarService'

// Azure Avatar 캐릭터 및 스타일 옵션 (실시간 API 지원 Video Avatars)
// https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/standard-avatars
// 주의: Lisa는 실시간 API에서 casual-sitting만 지원
const AVATAR_OPTIONS = {
  lisa: { name: 'Lisa', styles: ['casual-sitting'] },
  harry: { name: 'Harry', styles: ['business', 'casual', 'youthful'] },
  jeff: { name: 'Jeff', styles: ['business', 'formal'] },
  lori: { name: 'Lori', styles: ['casual', 'graceful', 'formal'] },
  max: { name: 'Max', styles: ['business', 'casual', 'formal'] },
  meg: { name: 'Meg', styles: ['formal', 'casual', 'business'] }
}

// WebRTC Avatar video ref
const webrtcVideoRef = ref(null)
const isWebRTCReady = ref(false)
const avatarError = ref(null)

// 아바타 선택 상태
const selectedCharacter = ref('lisa')
const selectedStyle = ref('casual-sitting')
const isChangingAvatar = ref(false)

// 아바타 모드에서 대화창 오버레이 표시 상태
const showChatOverlay = ref(false)

// 채팅 오버레이 리사이즈 관련 상태
const overlayHeight = ref(310)  // 현재 높이 (px)
const MIN_HEIGHT = 310  // 최소 높이 (px)
const MAX_HEIGHT = 650  // 최대 높이 (px)
const isResizing = ref(false)

// 캐릭터 변경 시 첫 번째 스타일로 자동 선택
watch(selectedCharacter, (newChar) => {
  const styles = AVATAR_OPTIONS[newChar]?.styles
  if (styles && styles.length > 0) {
    selectedStyle.value = styles[0]
  }
})

// 스크롤 컨테이너 ref
const scrollContainer = ref(null)

/**
 * 스크롤을 맨 아래로 이동
 * @param {boolean} smooth - 부드러운 스크롤 여부
 */
const scrollToBottom = (smooth = true) => {
  // 이중 requestAnimationFrame으로 레이아웃 완전 반영 후 스크롤
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTo({
          top: scrollContainer.value.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant'
        })
      }
    })
  })
}

// 외부에서 호출 가능하도록 expose
defineExpose({
  scrollToBottom,
  showChatOverlay,
  // 아바타 관련
  selectedCharacter,
  selectedStyle,
  isChangingAvatar,
  isWebRTCReady,
  AVATAR_OPTIONS,
  applyAvatarChange
})

const props = defineProps({
  /** 메시지 목록 */
  messages: {
    type: Array,
    default: () => []
  },
  /** 시나리오 정보 */
  scenario: {
    type: Object,
    default: null
  },
  /** 로딩 상태 */
  isLoading: {
    type: Boolean,
    default: false
  },
  /** 번역 로딩 상태 */
  translationLoading: {
    type: Object,
    default: () => ({})
  },
  /** 힌트 로딩 상태 */
  hintLoading: {
    type: Object,
    default: () => ({})
  },
  /** 선택된 메시지 인덱스 */
  selectedMessageIndex: {
    type: Number,
    default: 0
  },
  /** 사용자 메시지 목록 */
  userMessages: {
    type: Array,
    default: () => []
  },
  /** 아바타 활성화 여부 */
  avatarEnabled: {
    type: Boolean,
    default: false
  },
  /** STT 연결 중 */
  sttIsConnecting: {
    type: Boolean,
    default: false
  },
  /** 녹음 중 */
  isRecording: {
    type: Boolean,
    default: false
  },
  /** 음성 처리 중 */
  isProcessingVoice: {
    type: Boolean,
    default: false
  },
  /** 인식된 텍스트 */
  recognizedText: {
    type: String,
    default: ''
  },
  /** 녹음 시간 */
  recordingTime: {
    type: Number,
    default: 0
  },
  /** 최종 텍스트 목록 */
  finalTexts: {
    type: Array,
    default: () => []
  },
  /** 중간 텍스트 */
  interimText: {
    type: String,
    default: ''
  },
  /** 마지막 AI 메시지 (아바타용) */
  lastAiMessage: {
    type: String,
    default: ''
  },
  /** TTS 재생 중 여부 */
  isSpeaking: {
    type: Boolean,
    default: false
  },
  /** 현재 재생 중인 메시지 인덱스 */
  speakingMessageIndex: {
    type: Number,
    default: -1
  }
})

const emit = defineEmits([
  'toggleTranslation',
  'toggleHint',
  'messageClick',
  'playMessage',
  'stopMessage'
])

/**
 * 메시지가 선택되었는지 확인
 */
const isMessageSelected = (message) => {
  if (message.speaker !== 'user') return false
  const index = props.userMessages.findIndex(m => m === message)
  return index === props.selectedMessageIndex
}

/**
 * 시간 포맷팅
 */
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 마지막 AI 메시지의 언어 추정
 */
const estimatedLanguage = computed(() => {
  return props.scenario?.language || 'en-US'
})

/**
 * avatarEnabled 모드에서 WebRTC Avatar 초기화
 * v-show 사용으로 DOM은 유지되므로, 처음 활성화 시에만 초기화
 * 모드 해제 시에는 연결을 유지하여 재진입 시 빠르게 사용 가능
 */
watch(
  () => props.avatarEnabled,
  async (enabled) => {
    if (enabled) {
      // 이미 연결되어 있으면 재초기화하지 않음
      if (isWebRTCReady.value) {
        console.log('[Avatar] 이미 연결됨, 재초기화 스킵')
        return
      }
      // 다음 틱에서 video element가 DOM에 있을 때 초기화
      await nextTick()
      await initializeWebRTCAvatar()
    }
    // 모드 해제 시에는 연결을 유지 (v-show로 DOM 유지됨)
    // 컴포넌트 언마운트 시에만 정리됨
  }
)

/**
 * lastAiMessage가 변경되면 Avatar로 발화
 */
watch(
  () => props.lastAiMessage,
  async (newMessage) => {
    if (!newMessage || !props.avatarEnabled || !isWebRTCReady.value) return
    try {
      await voiceAvatarService.speakWithAvatar(newMessage, estimatedLanguage.value)
    } catch (err) {
      console.error('[PracticeConversation] Avatar speak error:', err)
    }
  }
)

/**
 * WebRTC Avatar 초기화
 */
async function initializeWebRTCAvatar() {
  if (isWebRTCReady.value) return

  try {
    avatarError.value = null

    // video element가 준비될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 200))

    if (!webrtcVideoRef.value) {
      return
    }

    await voiceAvatarService.initializeAvatar(webrtcVideoRef.value, {
      character: selectedCharacter.value,
      style: selectedStyle.value,
      language: estimatedLanguage.value
    })

    isWebRTCReady.value = true
  } catch (err) {
    avatarError.value = err.message || 'Avatar 초기화 실패'
  }
}

/**
 * 아바타 캐릭터/스타일 변경 적용
 * Azure 서버 throttling 방지를 위해 충분한 대기 시간과 재시도 로직 포함
 */
async function applyAvatarChange() {
  if (!props.avatarEnabled || isChangingAvatar.value) return

  console.log('[Avatar] applyAvatarChange called with:', {
    character: selectedCharacter.value,
    style: selectedStyle.value
  })

  try {
    isChangingAvatar.value = true
    avatarError.value = null

    // 기존 연결 해제
    await cleanupWebRTCAvatar()

    // Azure Avatar throttling 방지를 위해 충분히 대기 (연결 해제 완료 보장)
    // Azure 서버에서 이전 세션 정리에 시간이 필요함
    console.log('[Avatar] Waiting for Azure server cleanup...')
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 재시도 로직 (최대 2회)
    let lastError = null
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Avatar] Connection attempt ${attempt}/2`)

        // 새로운 설정으로 초기화
        await voiceAvatarService.initializeAvatar(webrtcVideoRef.value, {
          character: selectedCharacter.value,
          style: selectedStyle.value,
          language: estimatedLanguage.value
        })

        isWebRTCReady.value = true
        console.log('[Avatar] Successfully connected to new avatar')
        return // 성공 시 종료
      } catch (err) {
        lastError = err
        console.warn(`[Avatar] Attempt ${attempt} failed:`, err.message)

        if (attempt < 2) {
          // 재시도 전 추가 대기
          console.log('[Avatar] Retrying after delay...')
          await new Promise(resolve => setTimeout(resolve, 3000))
        }
      }
    }

    // 모든 시도 실패
    throw lastError
  } catch (err) {
    avatarError.value = err.message || 'Avatar 변경 실패'
    console.error('[Avatar] All connection attempts failed:', err)
  } finally {
    isChangingAvatar.value = false
  }
}

/**
 * WebRTC Avatar 정리
 */
async function cleanupWebRTCAvatar() {
  if (!isWebRTCReady.value) return

  try {
    await voiceAvatarService.disconnectAvatar()
    isWebRTCReady.value = false
  } catch (err) {
    // 무시
  }
}

/**
 * 페이지 언로드 핸들러 (새로고침, 탭 닫기 등)
 */
const handleBeforeUnload = () => {
  // 동기적으로 정리 (async 대기 불가)
  voiceAvatarService.disconnectAvatarSync()
}

// 컴포넌트 마운트 시 beforeunload 이벤트 등록
onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

// 컴포넌트 언마운트 전 정리 시작
onBeforeUnmount(async () => {
  // beforeunload 이벤트 제거
  window.removeEventListener('beforeunload', handleBeforeUnload)
  // Avatar 연결 해제
  await cleanupWebRTCAvatar()
})

// 컴포넌트 언마운트 시 추가 정리 (백업)
onUnmounted(() => {
  // onBeforeUnmount에서 정리가 안 됐을 경우 동기 정리
  voiceAvatarService.disconnectAvatarSync()

  // 리사이즈 이벤트 정리
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
})
// 메시지 변경 시 자동 스크롤
watch(
  () => props.messages.length,
  async () => {
    await nextTick()
    scrollToBottom()
  }
)

// 로딩 상태 변경 시에도 스크롤 (AI 응답 대기 중)
watch(
  () => props.isLoading,
  async (newVal) => {
    if (newVal) {
      await nextTick()
      scrollToBottom()
    }
  }
)

// 대화창 오버레이 열릴 때 스크롤 맨 아래로 (애니메이션 없이 즉시)
watch(showChatOverlay, async (newVal) => {
  if (newVal) {
    await nextTick()
    scrollToBottom(false)
  }
})

// 아바타 모드 → 일반 모드 전환 시 스크롤 맨 아래로
watch(
  () => props.avatarEnabled,
  async (newVal, oldVal) => {
    // 아바타 비활성화 (true → false) 시 스크롤을 맨 아래로
    if (oldVal === true && newVal === false) {
      await nextTick()
      scrollToBottom()
    }
  }
)

// ============================================
// 채팅 오버레이 리사이즈 핸들러
// ============================================

let startY = 0
let startHeight = 0

/**
 * 리사이즈 시작
 */
const onResizeStart = (e) => {
  isResizing.value = true
  startY = e.clientY
  startHeight = overlayHeight.value

  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = 'ns-resize'
  document.body.style.userSelect = 'none'
}

/**
 * 리사이즈 중
 */
const onResizeMove = (e) => {
  if (!isResizing.value) return

  const deltaY = startY - e.clientY  // 위로 드래그하면 양수
  let newHeight = startHeight + deltaY

  // min/max 제한
  newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight))
  overlayHeight.value = newHeight
}

/**
 * 리사이즈 종료
 */
const onResizeEnd = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}
</script>

<template>
  <!-- Avatar Panel (독립 모듈 - TTS 결과 구독) -->
  <AvatarPanel
    :tts-text="lastAiMessage"
    :language="estimatedLanguage"
  />


  <!-- Avatar View (v-show로 변경하여 한 번 로드되면 유지) -->
  <div v-show="avatarEnabled" class="flex-1 bg-white flex flex-col relative overflow-hidden">
    <!-- WebRTC Avatar Video (전체 화면) -->
    <video
      ref="webrtcVideoRef"
      autoplay
      playsinline
      class="w-full h-full object-cover"
    />

    <!-- Error State -->
    <div v-if="avatarError" class="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/80 text-white text-sm rounded-lg">
      {{ avatarError }}
    </div>

    <!-- Loading State -->
    <div v-if="!isWebRTCReady && !avatarError" class="absolute inset-0 flex items-center justify-center bg-black/50">
      <div class="flex flex-col items-center gap-3">
        <ArrowPathIcon class="w-10 h-10 text-white animate-spin" />
        <span class="text-white/80 text-sm">Avatar 연결 중...</span>
      </div>
    </div>

    <!-- 캐릭터/스타일 선택 (우측 상단) -->
    <div class="absolute top-3 right-3 flex items-center gap-2 z-30">
      <select
        v-model="selectedCharacter"
        class="bg-white text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        :disabled="isChangingAvatar"
      >
        <option v-for="(info, key) in AVATAR_OPTIONS" :key="key" :value="key">
          {{ info.name }}
        </option>
      </select>
      <select
        v-model="selectedStyle"
        class="bg-white text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        :disabled="isChangingAvatar || !AVATAR_OPTIONS[selectedCharacter]?.styles?.length"
      >
        <option v-for="style in AVATAR_OPTIONS[selectedCharacter]?.styles || []" :key="style" :value="style">
          {{ style }}
        </option>
      </select>
      <button
        @click="applyAvatarChange"
        :disabled="isChangingAvatar || !isWebRTCReady"
        class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all backdrop-blur-md"
        :class="isChangingAvatar
          ? 'bg-blue-400/50 text-white cursor-wait'
          : 'bg-blue-500/80 text-white hover:bg-blue-600/80 border border-white/20'"
      >
        <span v-if="isChangingAvatar" class="flex items-center gap-1.5">
          <ArrowPathIcon class="w-4 h-4 animate-spin" />
        </span>
        <span v-else>적용</span>
      </button>
    </div>

    <!-- Voice Status Overlay (녹음 중/처리 중 상태만 표시, recognizedText는 아래 입력 영역에서 표시) -->
    <div
      v-if="sttIsConnecting || isRecording || isProcessingVoice"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl p-6 text-center max-w-lg border border-white/10 transition-all"
    >
      <div v-if="sttIsConnecting" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
        <ArrowPathIcon class="w-6 h-6 animate-spin" />
        Connecting...
      </div>
      <div v-else-if="isRecording" class="space-y-3">
        <div class="flex items-center justify-center gap-2 text-red-400 font-bold animate-pulse">
          <span class="w-3 h-3 bg-red-500 rounded-full"></span>
          Recording... {{ recordingTime }}s
        </div>
        <div class="space-y-1">
          <p v-for="(text, idx) in finalTexts" :key="idx" class="text-white font-medium">{{ text }}</p>
          <p v-if="interimText" class="text-blue-300 italic animate-pulse">{{ interimText }}</p>
          <p v-else class="text-gray-400">Listening...</p>
        </div>
      </div>
      <div v-else-if="isProcessingVoice" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
        <ArrowPathIcon class="w-6 h-6 animate-spin" />
        Sending message...
      </div>
    </div>

    <!-- Chat Overlay Toggle Button (Bottom Right) -->
    <button
      @click="showChatOverlay = !showChatOverlay"
      class="absolute bottom-4 right-4 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all z-30"
      :class="showChatOverlay ? 'ring-2 ring-blue-400' : ''"
      title="대화창 보기"
    >
      <ChatBubbleOvalLeftEllipsisIcon v-if="!showChatOverlay" class="w-6 h-6" />
      <XMarkIcon v-else class="w-6 h-6" />
    </button>
  </div>

  <!-- Chat View (일반 모드: 전체, 아바타+오버레이: 리사이즈 가능한 오버레이) -->
  <!-- 아바타 오버레이 모드: 리사이즈 가능한 컨테이너 -->
  <div
    v-if="avatarEnabled && showChatOverlay"
    class="absolute bottom-[182px] left-0 right-0 z-20 flex flex-col bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-lg"
    :style="{ height: overlayHeight + 'px' }"
  >
    <!-- 리사이즈 핸들 (상단) -->
    <div
      @mousedown="onResizeStart"
      class="h-3 flex items-center justify-center cursor-ns-resize bg-gray-100 border-b border-gray-200 shrink-0 hover:bg-gray-200 transition-colors"
    >
      <div
        class="w-8 h-0.5 rounded-full transition-all"
        :class="isResizing ? 'bg-blue-500 w-12' : 'bg-gray-400'"
      ></div>
    </div>

    <!-- 메시지 영역 -->
    <div
      ref="scrollContainer"
      class="flex-1 overflow-y-auto scroll-smooth p-6 space-y-6"
    >
    <!-- Empty State -->
    <div v-if="!isLoading && messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
      <ChatBubbleLeftRightIcon class="w-16 h-16 opacity-20" />
      <p>대화를 시작해보세요!</p>
    </div>

    <!-- Messages -->
    <div
      v-for="(message, index) in messages"
      :key="index"
      class="flex flex-col max-w-3xl"
      :class="message.speaker === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
    >
      <!-- Speaker Name -->
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ message.speaker === 'user' ? (scenario?.roles?.user || 'Me') : (scenario?.roles?.ai || 'AI') }}
      </span>

      <!-- Bubble -->
      <div
        class="relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed group transition-all duration-200"
        :class="[
          message.speaker === 'user'
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm cursor-pointer hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm',
          message.speaker === 'user' && isMessageSelected(message) ? 'ring-2 ring-offset-2 ring-blue-400' : ''
        ]"
        @click="message.speaker === 'user' ? emit('messageClick', message) : null"
      >
        <!-- Message Content -->
        <p>{{ message.showTranslation ? (message.translatedText || message.message) : message.message }}</p>

        <!-- AI Message Actions -->
        <div v-if="message.speaker === 'ai'" class="absolute -bottom-9 left-0 flex items-center gap-2 z-10">
          <!-- Play/Stop Button -->
          <button
            @click.stop="isSpeaking && speakingMessageIndex === index ? emit('stopMessage') : emit('playMessage', message.message, index)"
            class="text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors shadow-sm border"
            :class="isSpeaking && speakingMessageIndex === index
              ? 'text-red-600 hover:text-red-800 bg-red-50 border-red-100'
              : 'text-green-600 hover:text-green-800 bg-green-50 border-green-100'"
          >
            <StopIcon v-if="isSpeaking && speakingMessageIndex === index" class="w-3.5 h-3.5" />
            <SpeakerWaveIcon v-else class="w-3.5 h-3.5" />
            {{ isSpeaking && speakingMessageIndex === index ? '중지' : '재생' }}
          </button>

          <!-- Translation Button -->
          <button
            @click.stop="emit('toggleTranslation', index)"
            :disabled="translationLoading[index]"
            class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-100"
          >
            <LanguageIcon class="w-3.5 h-3.5" />
            {{ translationLoading[index] ? '번역 중...' : (message.showTranslation ? '원문 보기' : '번역') }}
          </button>

          <!-- Hint Button -->
          <button
            @click.stop="emit('toggleHint', index)"
            :disabled="hintLoading[index]"
            class="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-amber-100"
          >
            <LightBulbIcon class="w-3.5 h-3.5" />
            {{ hintLoading[index] ? '생성 중...' : (message.showHint ? '힌트 닫기' : '힌트') }}
          </button>
        </div>

        <!-- Hint Display - Multiple Hints -->
        <div
          v-if="message.speaker === 'ai' && message.showHint && message.hints?.length"
          class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 relative animate-fade-in-down"
        >
          <div class="absolute -top-1.5 left-20 w-3 h-3 bg-amber-50 border-t border-l border-amber-100 transform rotate-45"></div>

          <!-- Header -->
          <div class="flex items-center gap-2 mb-3">
            <div class="p-1 bg-amber-100 rounded-full text-amber-600">
              <LightBulbIcon class="w-3.5 h-3.5" />
            </div>
            <p class="text-[13px] font-bold text-amber-600 uppercase tracking-wider">이렇게 말해보세요!</p>
          </div>

          <!-- Hints List -->
          <div class="space-y-3">
            <div
              v-for="(hint, hintIdx) in message.hints"
              :key="hintIdx"
              class="group/hint"
            >
              <!-- Hint Text -->
              <div class="flex items-start gap-2">
                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {{ hintIdx + 1 }}
                </span>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 font-medium leading-relaxed">"{{ hint }}"</p>
                  <!-- Hint Explanation (Korean) -->
                  <p
                    v-if="message.hintExplanations?.[hintIdx]"
                    class="text-xs text-gray-500 mt-1 pl-0.5"
                  >
                    {{ message.hintExplanations[hintIdx] }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Terminology Suggestions -->
          <div
            v-if="message.terminologySuggestions?.length"
            class="mt-3 pt-3 border-t border-amber-100"
          >
            <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">추천 용어</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="term in message.terminologySuggestions"
                :key="term"
                class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium"
              >
                {{ term }}
              </span>
            </div>
          </div>
        </div>

        <!-- Feedback Indicator (User only) -->
        <div
          v-if="message.speaker === 'user'"
          class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-400"
        >
          <ChartBarIcon class="w-4 h-4" />
        </div>
      </div>

      <!-- Timestamp -->
      <span
        class="text-[10px] text-gray-400 px-1 transition-all"
        :class="message.speaker === 'ai' ? 'mt-10' : 'mt-1'"
      >
        {{ formatTime(message.timestamp) }}
      </span>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex flex-col items-start max-w-3xl mr-auto">
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ scenario?.roles?.ai || 'AI' }}
      </span>
      <div class="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
      </div>
    </div>
    </div><!-- 메시지 영역 닫기 -->
  </div><!-- 아바타 오버레이 컨테이너 닫기 -->

  <!-- 일반 모드 Chat View (아바타 비활성 또는 오버레이 숨김) -->
  <div
    v-if="!avatarEnabled"
    ref="scrollContainer"
    class="flex-1 flex flex-col min-h-0 overflow-y-auto scroll-smooth bg-gray-50 p-6 space-y-6"
  >
    <!-- Empty State -->
    <div v-if="!isLoading && messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
      <ChatBubbleLeftRightIcon class="w-16 h-16 opacity-20" />
      <p>대화를 시작해보세요!</p>
    </div>

    <!-- Messages -->
    <div
      v-for="(message, index) in messages"
      :key="'normal-' + index"
      class="flex flex-col max-w-3xl"
      :class="message.speaker === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
    >
      <!-- Speaker Name -->
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ message.speaker === 'user' ? (scenario?.roles?.user || 'Me') : (scenario?.roles?.ai || 'AI') }}
      </span>

      <!-- Bubble -->
      <div
        class="relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed group transition-all duration-200"
        :class="[
          message.speaker === 'user'
            ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm cursor-pointer hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
            : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm',
          message.speaker === 'user' && isMessageSelected(message) ? 'ring-2 ring-offset-2 ring-blue-400' : ''
        ]"
        @click="message.speaker === 'user' ? emit('messageClick', message) : null"
      >
        <!-- Message Content -->
        <p>{{ message.showTranslation ? (message.translatedText || message.message) : message.message }}</p>

        <!-- AI Message Actions -->
        <div v-if="message.speaker === 'ai'" class="absolute -bottom-9 left-0 flex items-center gap-2 z-10">
          <!-- Play/Stop Button -->
          <button
            @click.stop="isSpeaking && speakingMessageIndex === index ? emit('stopMessage') : emit('playMessage', message.message, index)"
            class="text-xs font-bold flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors shadow-sm border"
            :class="isSpeaking && speakingMessageIndex === index
              ? 'text-red-600 hover:text-red-800 bg-red-50 border-red-100'
              : 'text-green-600 hover:text-green-800 bg-green-50 border-green-100'"
          >
            <StopIcon v-if="isSpeaking && speakingMessageIndex === index" class="w-3.5 h-3.5" />
            <SpeakerWaveIcon v-else class="w-3.5 h-3.5" />
            {{ isSpeaking && speakingMessageIndex === index ? '중지' : '재생' }}
          </button>
          <button
            @click.stop="emit('toggleTranslation', index)"
            :disabled="translationLoading[index]"
            class="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-100"
          >
            <LanguageIcon class="w-3.5 h-3.5" />
            {{ translationLoading[index] ? '번역 중...' : (message.showTranslation ? '원문 보기' : '번역') }}
          </button>
          <button
            @click.stop="emit('toggleHint', index)"
            :disabled="hintLoading[index]"
            class="text-xs font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1.5 bg-amber-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-amber-100"
          >
            <LightBulbIcon class="w-3.5 h-3.5" />
            {{ hintLoading[index] ? '생성 중...' : (message.showHint ? '힌트 닫기' : '힌트') }}
          </button>
        </div>

        <!-- Hint Display -->
        <div
          v-if="message.speaker === 'ai' && message.showHint && message.hints?.length"
          class="mt-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 relative animate-fade-in-down"
        >
          <div class="absolute -top-1.5 left-20 w-3 h-3 bg-amber-50 border-t border-l border-amber-100 transform rotate-45"></div>
          <div class="flex items-center gap-2 mb-3">
            <div class="p-1 bg-amber-100 rounded-full text-amber-600">
              <LightBulbIcon class="w-3.5 h-3.5" />
            </div>
            <p class="text-[13px] font-bold text-amber-600 uppercase tracking-wider">이렇게 말해보세요!</p>
          </div>
          <div class="space-y-3">
            <div v-for="(hint, hintIdx) in message.hints" :key="hintIdx" class="group/hint">
              <div class="flex items-start gap-2">
                <span class="flex-shrink-0 w-5 h-5 rounded-full bg-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center">
                  {{ hintIdx + 1 }}
                </span>
                <div class="flex-1">
                  <p class="text-sm text-gray-900 font-medium leading-relaxed">"{{ hint }}"</p>
                  <p v-if="message.hintExplanations?.[hintIdx]" class="text-xs text-gray-500 mt-1 pl-0.5">
                    {{ message.hintExplanations[hintIdx] }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="message.terminologySuggestions?.length" class="mt-3 pt-3 border-t border-amber-100">
            <p class="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1.5">추천 용어</p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="term in message.terminologySuggestions" :key="term" class="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                {{ term }}
              </span>
            </div>
          </div>
        </div>

        <!-- Feedback Indicator -->
        <div v-if="message.speaker === 'user'" class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-400">
          <ChartBarIcon class="w-4 h-4" />
        </div>
      </div>

      <!-- Timestamp -->
      <span class="text-[10px] text-gray-400 px-1 transition-all" :class="message.speaker === 'ai' ? 'mt-10' : 'mt-1'">
        {{ formatTime(message.timestamp) }}
      </span>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex flex-col items-start max-w-3xl mr-auto">
      <span class="text-xs font-medium text-gray-500 mb-1 px-1">
        {{ scenario?.roles?.ai || 'AI' }}
      </span>
      <div class="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
        <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
      </div>
    </div>
  </div>
</template>
