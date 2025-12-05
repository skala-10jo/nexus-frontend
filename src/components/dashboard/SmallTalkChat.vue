<script setup>
/**
 * Small Talk 채팅 컴포넌트
 *
 * Dashboard.vue의 Small Talk 섹션에서 사용되는 채팅 인터페이스.
 * 대시보드 진입 시 자동으로 대화가 시작됨.
 */
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  ArrowPathIcon,
  LightBulbIcon,
  XMarkIcon,
  StopIcon
} from '@heroicons/vue/24/outline'
import { useSmallTalk } from '@/composables/dashboard/useSmallTalk'
import { useRealtimeSTT } from '@/composables/useRealtimeSTT'
import SmallTalkFeedbackPopup from './SmallTalkFeedbackPopup.vue'

// Composable
const {
  messages,
  isLoading,
  isStarted,
  error,
  feedbackLoading,
  selectedMessageIndex,
  userMessages,
  selectedMessageFeedback,
  startConversation,
  sendMessage,
  selectMessage,
  requestHint,
  resetConversation,
  clearError
} = useSmallTalk()

// Realtime STT
const {
  isRecording: sttIsRecording,
  isConnecting: sttIsConnecting,
  interimText: sttInterimText,
  finalTexts: sttFinalTexts,
  fullText: sttFullText,
  recordingTime: sttRecordingTime,
  startRecording: startRealtimeSTT,
  stopRecording: stopRealtimeSTT,
  clearResults: clearSTTResults
} = useRealtimeSTT()

// Local state
const inputText = ref('')
const chatContainer = ref(null)
const showHintPopup = ref(false)
const hints = ref([])
const hintLoading = ref(false)
const showFeedbackPopup = ref(false)

// Voice recording state
const isRecording = computed(() => sttIsRecording.value)
const isConnecting = computed(() => sttIsConnecting.value)
const isProcessingVoice = ref(false)

// Computed
const canSend = computed(() => {
  return inputText.value.trim() && !isLoading.value && isStarted.value
})

const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
})

// 사용자 메시지 인덱스 매핑
const userMessageIndexMap = computed(() => {
  const map = new Map()
  let userIdx = 0
  messages.value.forEach((msg, idx) => {
    if (msg.speaker === 'user') {
      map.set(idx, userIdx)
      userIdx++
    }
  })
  return map
})

const hasUserInteracted = computed(() => {
  return messages.value.some(msg => msg.speaker === 'user')
})

// Methods
// 마지막 오디오 blob 저장 (발음 평가용)
const lastAudioBlob = ref(null)

async function handleSend() {
  if (!canSend.value) return

  const text = inputText.value.trim()
  inputText.value = ''

  // 오디오 blob이 있으면 발음 평가용으로 전달
  const audioBlob = lastAudioBlob.value
  lastAudioBlob.value = null

  await sendMessage(text, audioBlob)
  await scrollToBottom()
}

async function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    await handleSend()
  }
}

async function handleReset() {
  hints.value = []
  showHintPopup.value = false
  resetConversation()
  // 리셋 후 자동으로 새 대화 시작
  await startConversation()
  await scrollToBottom()
}

async function handleHint() {
  if (hintLoading.value) return

  hintLoading.value = true
  try {
    const result = await requestHint()
    if (result) {
      hints.value = result.hints || []
      showHintPopup.value = true
    }
  } finally {
    hintLoading.value = false
  }
}

function useHint(hint) {
  inputText.value = hint
  showHintPopup.value = false
}

function handleMessageClick(message, messageIndex) {
  if (message.speaker !== 'user') return

  const userIdx = userMessageIndexMap.value.get(messageIndex)
  if (userIdx !== undefined) {
    selectMessage(userIdx)
    showFeedbackPopup.value = true
  }
}

function closeFeedbackPopup() {
  showFeedbackPopup.value = false
}

function handleFeedbackSelectMessage(index) {
  selectMessage(index)
}

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Voice recording methods
async function startRecording() {
  try {
    clearSTTResults()
    // 영어 기본, 한국어 보조
    await startRealtimeSTT('en-US', 'ko-KR')
    console.log('Recording started')
  } catch (err) {
    console.error('Failed to start recording:', err)
  }
}

async function stopRecording() {
  // STT 결과 가져오기 (오디오 blob 포함)
  const result = stopRealtimeSTT()

  let fullText = ''
  let audioBlob = null

  if (result && typeof result === 'object') {
    fullText = result.text || ''
    audioBlob = result.audioBlob || null
  } else if (typeof result === 'string') {
    fullText = result
  }

  if (fullText && fullText.trim()) {
    inputText.value = fullText
    // 오디오 blob 저장 (발음 평가용)
    lastAudioBlob.value = audioBlob

    // 자동 전송
    isProcessingVoice.value = true

    setTimeout(async () => {
      isProcessingVoice.value = false
      await handleSend()
    }, 500)
  }
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// Watchers
watch(messages, async () => {
  await scrollToBottom()
}, { deep: true })

// Lifecycle - 대시보드 진입 시 자동으로 대화 시작
onMounted(async () => {
  await startConversation()
  await scrollToBottom()
})
</script>

<template>
  <div class="small-talk-chat h-full flex flex-col bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header -->
    <div class="bg-white border-b border-gray-100 p-4 shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 class="text-base font-bold text-gray-900">Let's Practice Small Talk!</h2>
        </div>

        <!-- Reset Button -->
        <button
          @click="handleReset"
          :disabled="isLoading"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          title="새 대화 시작"
        >
          <ArrowPathIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Chat Messages -->
    <div
      ref="chatContainer"
      class="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-3"
    >
      <!-- Loading (초기 로딩) -->
      <div v-if="isLoading && messages.length === 0" class="flex justify-start">
        <div class="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm">
          <div class="flex items-center gap-2">
            <div class="flex gap-1">
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
            <span class="text-xs text-gray-400">typing...</span>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div
        v-for="(message, index) in sortedMessages"
        :key="index"
        :class="[
          'flex',
          message.speaker === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <!-- AI Message -->
        <div
          v-if="message.speaker === 'ai'"
          class="flex items-start gap-3 max-w-[85%]"
        >
          <img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Slightly%20Smiling%20Face.png"
            alt="AI"
            class="w-12 h-12 object-contain shrink-0 drop-shadow-md"
          />
          <div 
            class="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100"
            :class="{ 'animate-gentle-bounce': !hasUserInteracted && index === sortedMessages.length - 1 }"
          >
            <p class="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">{{ message.message }}</p>
          </div>
        </div>

        <!-- User Message -->
        <div
          v-else
          @click="handleMessageClick(message, index)"
          class="bg-blue-600 p-3 rounded-2xl rounded-tr-none shadow-sm text-white max-w-[80%] cursor-pointer hover:bg-blue-700 transition-colors"
        >
          <p class="text-sm whitespace-pre-wrap">{{ message.message }}</p>
          <p class="text-xs text-blue-200 mt-1 opacity-70">(클릭하여 피드백 보기)</p>
        </div>
      </div>

      <!-- Loading indicator (대화 중) -->
      <div v-if="isLoading && messages.length > 0" class="flex justify-start">
        <div class="flex items-start gap-3">
          <img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Slightly%20Smiling%20Face.png"
            alt="AI"
            class="w-8 h-8 object-contain shrink-0 drop-shadow-md"
          />
          <div class="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
            <div class="flex items-center gap-2">
              <div class="flex gap-1">
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
              </div>
              <span class="text-xs text-gray-400">typing...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hint Popup -->
    <Transition name="popup">
      <div
        v-if="showHintPopup && hints.length > 0"
        class="absolute bottom-20 left-4 right-4 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-10"
      >
        <div class="flex items-center justify-between mb-3">
          <h4 class="font-bold text-gray-900 flex items-center gap-2">
            <LightBulbIcon class="w-5 h-5 text-yellow-500" />
            응답 힌트
          </h4>
          <button
            @click="showHintPopup = false"
            class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
        <div class="space-y-2">
          <button
            v-for="(hint, idx) in hints"
            :key="idx"
            @click="useHint(hint)"
            class="w-full p-3 text-left text-sm bg-yellow-50 hover:bg-yellow-100 border border-yellow-100 rounded-lg transition-colors"
          >
            {{ hint }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Input Area -->
    <div class="p-3 bg-white border-t border-gray-100 shrink-0">
      <!-- Error Message -->
      <div
        v-if="error"
        class="mb-3 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center justify-between"
      >
        <span>{{ error }}</span>
        <button @click="clearError" class="text-red-400 hover:text-red-600">
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>

      <!-- Voice Recording Status -->
      <div
        v-if="isRecording || isConnecting || isProcessingVoice"
        class="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200"
      >
        <!-- Connecting -->
        <div v-if="isConnecting" class="flex items-center justify-center gap-2 text-blue-500 text-sm">
          <ArrowPathIcon class="w-4 h-4 animate-spin" />
          <span>마이크 연결 중...</span>
        </div>
        <!-- Recording -->
        <div v-else-if="isRecording" class="flex flex-col items-center gap-1">
          <div class="flex items-center gap-2 text-red-500 font-medium text-sm animate-pulse">
            <span class="w-2 h-2 bg-red-500 rounded-full"></span>
            <span>녹음 중... {{ sttRecordingTime }}s</span>
          </div>
          <div class="text-center text-sm">
            <p v-if="sttFinalTexts.length" class="text-gray-800">{{ sttFinalTexts[sttFinalTexts.length - 1] }}</p>
            <p v-if="sttInterimText" class="text-blue-600 italic">{{ sttInterimText }}</p>
            <p v-else-if="!sttFinalTexts.length" class="text-gray-400 italic">Listening...</p>
          </div>
        </div>
        <!-- Processing -->
        <div v-else-if="isProcessingVoice" class="flex items-center justify-center gap-2 text-blue-500 text-sm">
          <ArrowPathIcon class="w-4 h-4 animate-spin" />
          <span>메시지 전송 중...</span>
        </div>
      </div>

      <div class="flex items-end gap-2">
        <!-- Hint Button -->
        <button
          @click="handleHint"
          :disabled="hintLoading || isLoading"
          class="p-3 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-colors disabled:opacity-50"
          title="힌트 보기"
        >
          <LightBulbIcon v-if="!hintLoading" class="w-6 h-6" />
          <div v-else class="w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </button>

        <!-- Text Input -->
        <div class="flex-1 relative">
          <textarea
            v-model="inputText"
            @keydown="handleKeydown"
            placeholder="메시지를 입력하세요..."
            rows="1"
            class="w-full px-4 py-3 bg-gray-100 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
            :disabled="isLoading || isRecording"
          ></textarea>
        </div>

        <!-- Voice Button -->
        <button
          @click="toggleRecording"
          :disabled="isConnecting || isProcessingVoice"
          :class="[
            'p-3 rounded-xl transition-colors',
            isRecording
              ? 'bg-red-500 text-white animate-pulse'
              : isConnecting
                ? 'bg-blue-400 text-white'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
          ]"
          title="음성 입력"
        >
          <ArrowPathIcon v-if="isConnecting" class="w-6 h-6 animate-spin" />
          <StopIcon v-else-if="isRecording" class="w-6 h-6" />
          <MicrophoneIcon v-else class="w-6 h-6" />
        </button>

        <!-- Send Button -->
        <button
          @click="handleSend"
          :disabled="!canSend"
          :class="[
            'p-3 rounded-xl transition-all',
            canSend
              ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400'
          ]"
        >
          <PaperAirplaneIcon class="w-6 h-6" />
        </button>
      </div>
    </div>

    <!-- Feedback Popup -->
    <SmallTalkFeedbackPopup
      :is-open="showFeedbackPopup"
      :user-messages="userMessages"
      :selected-index="selectedMessageIndex"
      :feedback="selectedMessageFeedback"
      :is-loading="feedbackLoading"
      @close="closeFeedbackPopup"
      @select-message="handleFeedbackSelectMessage"
    />
  </div>
</template>

<style scoped>
.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.animate-gentle-bounce {
  animation: gentle-bounce 2s infinite ease-in-out;
}
</style>
