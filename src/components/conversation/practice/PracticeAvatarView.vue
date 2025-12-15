<template>
  <div class="flex-1 bg-white flex flex-col relative overflow-hidden">
    <!-- WebRTC Avatar Video (전체 화면) -->
    <video
      ref="videoRef"
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
        :value="selectedCharacter"
        @change="$emit('update:selectedCharacter', $event.target.value)"
        class="bg-white text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        :disabled="isChangingAvatar"
      >
        <option v-for="(info, key) in avatarOptions" :key="key" :value="key">
          {{ info.name }}
        </option>
      </select>
      <select
        :value="selectedStyle"
        @change="$emit('update:selectedStyle', $event.target.value)"
        class="bg-white text-gray-900 text-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
        :disabled="isChangingAvatar || !avatarOptions[selectedCharacter]?.styles?.length"
      >
        <option v-for="style in avatarOptions[selectedCharacter]?.styles || []" :key="style" :value="style">
          {{ style }}
        </option>
      </select>
      <button
        @click="$emit('applyChange')"
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

    <!-- Voice Status Overlay -->
    <div
      v-if="sttIsConnecting || isRecording || isProcessingVoice"
      class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl p-6 text-center max-w-lg border border-white/10 transition-all"
    >
      <div v-if="sttIsConnecting" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
        <ArrowPathIcon class="w-6 h-6 animate-spin" />
        연결 중...
      </div>
      <div v-else-if="isRecording" class="space-y-3">
        <div class="flex items-center justify-center gap-2 text-red-400 font-bold animate-pulse">
          <span class="w-3 h-3 bg-red-500 rounded-full"></span>
          녹음 중... {{ recordingTime }}초
        </div>
        <div class="space-y-1">
          <p v-for="(text, idx) in finalTexts" :key="idx" class="text-white font-medium">{{ text }}</p>
          <p v-if="interimText" class="text-blue-300 italic animate-pulse">{{ interimText }}</p>
          <p v-else class="text-gray-400">음성을 기다리는 중...</p>
        </div>
      </div>
      <div v-else-if="isProcessingVoice" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
        <ArrowPathIcon class="w-6 h-6 animate-spin" />
        메시지 전송 중...
      </div>
    </div>

    <!-- Chat Overlay Toggle Button (Bottom Right) -->
    <button
      @click="$emit('update:showChatOverlay', !showChatOverlay)"
      class="absolute bottom-4 right-4 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white hover:bg-black/80 transition-all z-30"
      :class="showChatOverlay ? 'ring-2 ring-blue-400' : ''"
      title="대화창 보기"
    >
      <ChatBubbleOvalLeftEllipsisIcon v-if="!showChatOverlay" class="w-6 h-6" />
      <XMarkIcon v-else class="w-6 h-6" />
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  ArrowPathIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** Avatar Options */
  avatarOptions: {
    type: Object,
    required: true
  },
  /** 선택된 캐릭터 */
  selectedCharacter: {
    type: String,
    required: true
  },
  /** 선택된 스타일 */
  selectedStyle: {
    type: String,
    required: true
  },
  /** WebRTC 준비 상태 */
  isWebRTCReady: {
    type: Boolean,
    default: false
  },
  /** Avatar 에러 */
  avatarError: {
    type: String,
    default: null
  },
  /** Avatar 변경 중 */
  isChangingAvatar: {
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
  /** 채팅 오버레이 표시 여부 */
  showChatOverlay: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:selectedCharacter',
  'update:selectedStyle',
  'update:showChatOverlay',
  'applyChange',
  'videoRefReady'
])

const videoRef = ref(null)

// video ref를 외부에서 접근할 수 있도록 expose
defineExpose({
  videoRef
})

// videoRef가 마운트되면 부모에게 전달
onMounted(() => {
  if (videoRef.value) {
    emit('videoRefReady', videoRef.value)
  }
})
</script>
