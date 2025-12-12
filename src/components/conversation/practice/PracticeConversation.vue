<script setup>
/**
 * Practice 대화 영역 컴포넌트
 *
 * 메시지 목록, 아바타 뷰, 로딩 상태를 표시합니다.
 */
import { ref, computed, watch, nextTick } from 'vue'
import AvatarPanel from './AvatarPanel.vue'
import PracticeMessageList from './PracticeMessageList.vue'
import PracticeAvatarView from './PracticeAvatarView.vue'
import { usePracticeAvatar } from '@/composables/conversation/usePracticeAvatar'

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

// Avatar Composable
const avatarEnabled = computed(() => props.avatarEnabled)
const lastAiMessage = computed(() => props.lastAiMessage)
const scenario = computed(() => props.scenario)

const avatar = usePracticeAvatar({
  avatarEnabled,
  lastAiMessage,
  scenario
})

// 채팅 오버레이 표시 상태
const showChatOverlay = ref(false)

// 채팅 오버레이 리사이즈 관련 상태
const overlayHeight = ref(310)  // 현재 높이 (px)
const MIN_HEIGHT = 310  // 최소 높이 (px)
const MAX_HEIGHT = 650  // 최대 높이 (px)
const isResizing = ref(false)

// Message List Ref
const messageListRef = ref(null)
const avatarViewRef = ref(null)

/**
 * 스크롤을 맨 아래로 이동
 */
const scrollToBottom = (smooth = true) => {
  if (messageListRef.value) {
    messageListRef.value.scrollToBottom(smooth)
  }
}

// 메시지 변경 시 스크롤 맨 아래로
watch(
  () => props.messages,
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

/**
 * Avatar Video Element가 준비되면 composable에 전달
 */
const handleVideoRefReady = (videoElement) => {
  avatar.webrtcVideoRef.value = videoElement
}

// 외부에서 호출 가능하도록 expose
defineExpose({
  scrollToBottom,
  showChatOverlay,
  // 아바타 관련
  selectedCharacter: avatar.selectedCharacter,
  selectedStyle: avatar.selectedStyle,
  isChangingAvatar: avatar.isChangingAvatar,
  isWebRTCReady: avatar.isWebRTCReady,
  AVATAR_OPTIONS: avatar.AVATAR_OPTIONS,
  applyAvatarChange: avatar.applyAvatarChange
})
</script>

<template>
  <!-- Avatar Panel (독립 모듈 - TTS 결과 구독) -->
  <AvatarPanel
    :tts-text="lastAiMessage"
    :language="avatar.estimatedLanguage.value"
  />

  <!-- Avatar View (v-show로 변경하여 한 번 로드되면 유지) -->
  <PracticeAvatarView
    v-if="avatarEnabled"
    v-show="avatarEnabled"
    ref="avatarViewRef"
    :avatar-options="avatar.AVATAR_OPTIONS"
    :selected-character="avatar.selectedCharacter.value"
    :selected-style="avatar.selectedStyle.value"
    :is-web-r-t-c-ready="avatar.isWebRTCReady.value"
    :avatar-error="avatar.avatarError.value"
    :is-changing-avatar="avatar.isChangingAvatar.value"
    :stt-is-connecting="sttIsConnecting"
    :is-recording="isRecording"
    :is-processing-voice="isProcessingVoice"
    :recording-time="recordingTime"
    :final-texts="finalTexts"
    :interim-text="interimText"
    :show-chat-overlay="showChatOverlay"
    @update:selected-character="avatar.selectedCharacter.value = $event"
    @update:selected-style="avatar.selectedStyle.value = $event"
    @update:show-chat-overlay="showChatOverlay = $event"
    @apply-change="avatar.applyAvatarChange"
    @video-ref-ready="handleVideoRefReady"
  />

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

    <!-- Message List -->
    <PracticeMessageList
      ref="messageListRef"
      :messages="messages"
      :scenario="scenario"
      :is-loading="isLoading"
      :translation-loading="translationLoading"
      :hint-loading="hintLoading"
      :selected-message-index="selectedMessageIndex"
      :user-messages="userMessages"
      :is-speaking="isSpeaking"
      :speaking-message-index="speakingMessageIndex"
      @message-click="emit('messageClick', $event)"
      @play-message="(text, idx) => emit('playMessage', text, idx)"
      @stop-message="emit('stopMessage')"
      @toggle-translation="(idx) => emit('toggleTranslation', idx)"
      @toggle-hint="(idx) => emit('toggleHint', idx)"
    />
  </div>

  <!-- 일반 모드: 전체 화면 메시지 리스트 -->
  <PracticeMessageList
    v-if="!avatarEnabled"
    ref="messageListRef"
    :messages="messages"
    :scenario="scenario"
    :is-loading="isLoading"
    :translation-loading="translationLoading"
    :hint-loading="hintLoading"
    :selected-message-index="selectedMessageIndex"
    :user-messages="userMessages"
    :is-speaking="isSpeaking"
    :speaking-message-index="speakingMessageIndex"
    @message-click="emit('messageClick', $event)"
    @play-message="(text, idx) => emit('playMessage', text, idx)"
    @stop-message="emit('stopMessage')"
    @toggle-translation="(idx) => emit('toggleTranslation', idx)"
    @toggle-hint="(idx) => emit('toggleHint', idx)"
  />
</template>
