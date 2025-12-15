<script setup>
/**
 * Practice 입력 영역 컴포넌트
 *
 * 텍스트/음성 입력 UI 및 컨트롤을 담당합니다.
 */
import {
  ArrowPathIcon,
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  UserCircleIcon,
  CommandLineIcon,
  SignalIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** 입력 모드 (text/voice) */
  inputMode: {
    type: String,
    default: 'text'
  },
  /** 사용자 입력 텍스트 (ref 또는 string) */
  userInput: {
    type: [String, Object],
    default: ''
  },
  /** 로딩 상태 */
  isLoading: {
    type: Boolean,
    default: false
  },
  /** 녹음 중 */
  isRecording: {
    type: Boolean,
    default: false
  },
  /** STT 연결 중 */
  sttIsConnecting: {
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
  /** 아바타 활성화 */
  avatarEnabled: {
    type: Boolean,
    default: false
  },
  /** 아바타 초기화 중 */
  isAvatarInitializing: {
    type: Boolean,
    default: false
  },
  /** STT 모드 ('manual' | 'auto') */
  sttMode: {
    type: String,
    default: 'manual'
  }
})

import { computed, isRef, watch } from 'vue'

const emit = defineEmits([
  'update:userInput',
  'toggleInputMode',
  'toggleAvatar',
  'toggleSTTMode',
  'startRecording',
  'stopRecording',
  'sendMessage',
  'inputAreaResized'
])

// 입력 모드 변경 시 부모에게 resize 알림 (voice 모드 진입 시 Voice Input Status 영역 표시)
watch(() => props.inputMode, (newVal) => {
  if (newVal === 'voice') {
    // voice 모드 진입 시 입력 영역이 확장되므로 스크롤 조정 필요
    emit('inputAreaResized')
  }
})

// 녹음 상태 변경 시 부모에게 resize 알림 (스크롤 조정용)
watch(() => props.isRecording, (newVal) => {
  if (newVal) {
    // 녹음 시작 시 입력 영역이 확장되므로 스크롤 조정 필요
    emit('inputAreaResized')
  }
})

// finalTexts 변경 시에도 스크롤 조정 (텍스트가 늘어날 때)
watch(() => props.finalTexts.length, () => {
  if (props.isRecording) {
    emit('inputAreaResized')
  }
})

// userInput이 ref인 경우와 string인 경우 모두 처리
const userInputValue = computed(() => {
  if (isRef(props.userInput)) {
    return props.userInput.value || ''
  }
  return props.userInput || ''
})
</script>

<template>
  <div class="p-4 pb-20 md:pb-6 bg-white border-t border-gray-200 z-20 shrink-0">
    <div class="max-w-4xl mx-auto flex flex-col gap-4">

      <!-- Voice Input Status (음성 모드일 때 항상 표시) -->
      <div
        v-if="inputMode === 'voice'"
        class="bg-gray-50 rounded-xl border border-gray-200 p-4 h-[82px] flex flex-col justify-center items-center relative overflow-hidden"
      >
        <!-- Connecting State -->
        <div v-if="sttIsConnecting" class="flex flex-col items-center gap-1 z-10 w-full">
          <div class="flex items-center gap-2 text-blue-500 font-bold text-sm">
            <ArrowPathIcon class="w-4 h-4 animate-spin" />
            연결 중...
          </div>
          <p class="text-gray-400 text-sm truncate">마이크 권한을 허용해주세요</p>
        </div>

        <!-- Recording State -->
        <div v-else-if="isRecording" class="flex flex-col items-center gap-1 z-10 w-full">
          <div class="flex items-center gap-2 text-red-500 font-bold animate-pulse text-sm">
            <span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span>
            녹음 중... {{ recordingTime }}초
          </div>
          <div class="text-center max-w-full px-4 text-sm truncate">
            <p v-if="finalTexts.length" class="text-gray-900 font-medium truncate">{{ finalTexts[finalTexts.length - 1] }}</p>
            <p v-if="interimText" class="text-blue-600 italic animate-pulse truncate">{{ interimText }}</p>
            <p v-else-if="!finalTexts.length" class="text-gray-400 italic">음성을 기다리는 중...</p>
          </div>
        </div>

        <!-- Processing State -->
        <div v-else-if="isProcessingVoice" class="flex items-center gap-2 text-blue-600 font-medium z-10">
          <ArrowPathIcon class="w-5 h-5 animate-spin" />
          메시지 전송 중...
        </div>

        <!-- Recognized Text -->
        <div v-else-if="recognizedText" class="text-center z-10 w-full h-full flex flex-col">
          <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 flex-shrink-0">인식된 문장</p>
          <div class="overflow-y-auto flex-1 px-2">
            <p class="text-gray-900 text-lg">{{ recognizedText }}</p>
          </div>
        </div>

        <!-- Idle State -->
        <div v-else class="text-gray-400 text-sm z-10">
          마이크를 눌러 말하기를 시작하세요
        </div>

        <!-- Waveform Animation -->
        <div v-if="isRecording" class="absolute inset-0 flex items-end justify-center gap-1 pb-2 opacity-10">
          <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1s_infinite]" style="height: 40%"></div>
          <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1.2s_infinite]" style="height: 70%"></div>
          <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_0.8s_infinite]" style="height: 50%"></div>
          <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1.1s_infinite]" style="height: 80%"></div>
          <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_0.9s_infinite]" style="height: 60%"></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="flex items-start gap-4 w-full">
        <!-- Mode Toggle -->
        <div class="flex flex-col items-center gap-1">
          <button
            @click="emit('toggleInputMode')"
            class="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
            :title="inputMode === 'text' ? '음성 입력으로 전환' : '텍스트 입력으로 전환'"
          >
            <svg
              v-if="inputMode === 'text'"
              class="w-6 h-6 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 3a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
              <path d="M7 10v2a5 5 0 0 0 10 0v-2" />
              <path d="M10 21h4" />
              <path d="M12 17v4" />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-blue-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 5h14" />
              <path d="M12 5v16" />
            </svg>
          </button>
          <span class="text-xs font-semibold text-gray-500">
            {{ inputMode === 'text' ? '음성' : '텍스트' }}
          </span>
        </div>

        <!-- Input/Voice Area -->
        <div class="flex-1">
          <!-- Text Mode -->
          <div v-if="inputMode === 'text'" class="flex items-start gap-3">
            <div class="flex-1 relative">
              <textarea
                :value="userInputValue"
                @input="emit('update:userInput', $event.target.value)"
                @keydown.enter.prevent="emit('sendMessage')"
                placeholder="메시지를 입력하세요"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-gray-900 placeholder-gray-400 transition-all"
                rows="1"
                style="min-height: 50px; max-height: 150px;"
              ></textarea>
            </div>
            <button
              @click="emit('sendMessage')"
              :disabled="!userInputValue.trim() || isLoading"
              class="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200/50"
            >
              <PaperAirplaneIcon class="w-6 h-6" />
            </button>
          </div>

          <!-- Voice Mode -->
          <div v-else class="flex items-start gap-3">
            <button
              class="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
              :class="[
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200'
                  : sttIsConnecting
                    ? 'bg-blue-400 text-white shadow-blue-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
              ]"
              :disabled="isProcessingVoice || sttIsConnecting"
              @click="isRecording ? emit('stopRecording') : emit('startRecording')"
            >
              <div v-if="isProcessingVoice" class="flex items-center gap-2">
                <ArrowPathIcon class="w-5 h-5 animate-spin" />
                <span>전송 중...</span>
              </div>
              <div v-else-if="sttIsConnecting" class="flex items-center gap-2">
                <ArrowPathIcon class="w-5 h-5 animate-spin" />
                <span>연결 중...</span>
              </div>
              <div v-else-if="isRecording" class="flex items-center gap-2">
                <StopIcon class="w-5 h-5" />
                <span>녹음 중지</span>
              </div>
              <div v-else class="flex items-center gap-2">
                <MicrophoneIcon class="w-5 h-5" />
                <span>녹음 시작</span>
              </div>
            </button>

            <div class="flex items-center gap-3">
              <div class="flex flex-col items-center gap-1">
                <button
                  @click="emit('toggleAvatar')"
                  class="p-3 rounded-xl transition-all border"
                  :class="avatarEnabled
                    ? 'bg-blue-600 text-white border-blue-500 shadow shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
                  :disabled="isAvatarInitializing"
                  title="Toggle Avatar"
                >
                  <ArrowPathIcon v-if="isAvatarInitializing" class="w-6 h-6 animate-spin" />
                  <UserCircleIcon v-else class="w-6 h-6" />
                </button>
                <span class="text-xs font-semibold text-gray-500">아바타</span>
              </div>

              <div class="flex flex-col items-center gap-1">
                <button
                  @click="emit('toggleSTTMode')"
                  class="p-3 rounded-xl transition-all border"
                  :class="sttMode === 'auto'
                    ? 'bg-blue-600 text-white border-blue-500 shadow shadow-blue-200'
                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'"
                  :disabled="isRecording"
                  :title="sttMode === 'auto' ? '자동 모드 (침묵 감지)' : '수동 모드 (수동 종료)'"
                >
                  <SignalIcon class="w-6 h-6" />
                </button>
                <span class="text-xs font-semibold text-gray-500">실시간</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
