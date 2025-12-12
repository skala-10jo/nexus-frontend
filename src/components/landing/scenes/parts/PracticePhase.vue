<template>
  <div class="absolute inset-0 flex bg-white">
    <!-- Main Area -->
    <div
      class="h-full flex flex-col transition-all duration-700 ease-out"
      :style="{ width: showFeedback ? 'calc(100% - 200px)' : '100%' }"
    >
      <!-- 상단: 시나리오 정보 바 -->
      <div class="bg-white border-b border-gray-200 px-4 py-2">
        <div class="flex items-center gap-2">
          <span class="text-lg">🇺🇸</span>
          <span class="text-sm font-bold text-gray-800">프로젝트 요구사항 협의</span>
          <span class="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold">중급</span>
        </div>
      </div>

      <!-- 중앙: 아바타 영상 + 대화 오버레이 -->
      <div class="flex-1 relative bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
        <!-- Video -->
        <video
          ref="videoRef"
          class="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
          :style="{ opacity: avatarOpacity, objectPosition: '50% 1%' }"
          :src="avatarVideoSrc"
          muted
          playsinline
          loop
        ></video>

        <!-- 하단 그라데이션 오버레이 -->
        <div class="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none"></div>

        <!-- 대화 메시지 -->
        <div class="absolute bottom-0 left-0 right-0 px-4 pb-2">
          <div class="space-y-2">
            <TransitionGroup name="message">
              <div
                v-for="msg in visibleMessages.slice(-3)"
                :key="'msg-' + msg.text"
                class="flex"
                :class="msg.speaker === 'user' ? 'justify-end' : 'justify-start'"
              >
                <div
                  class="max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-lg"
                  :class="msg.speaker === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm'"
                >
                  {{ msg.text }}
                </div>
              </div>
            </TransitionGroup>

            <!-- Typing indicator -->
            <Transition name="fade">
              <div v-if="showTyping" class="flex justify-start">
                <div class="bg-white px-4 py-2 rounded-2xl rounded-bl-sm flex gap-1.5 shadow-lg">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
              </div>
            </Transition>
          </div>
        </div>

        <!-- Speaking/Listening Indicator -->
        <Transition name="fade">
          <div v-if="isSpeaking" class="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-3 py-1.5 bg-blue-500/90 rounded-full">
            <div class="w-1.5 h-4 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></div>
            <div class="w-1.5 h-5 bg-white rounded-full animate-bounce" style="animation-delay: 100ms"></div>
            <div class="w-1.5 h-4 bg-white rounded-full animate-bounce" style="animation-delay: 200ms"></div>
            <span class="text-xs font-bold text-white ml-1">말하는 중...</span>
          </div>
        </Transition>

        <Transition name="fade">
          <div v-if="isListening && !isSpeaking" class="absolute top-3 left-1/2 -translate-x-1/2">
            <div class="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/90 rounded-full">
              <div class="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></div>
              <span class="text-xs font-bold text-white">듣는 중...</span>
            </div>
          </div>
        </Transition>

        <!-- Hint Bubble -->
        <Transition name="bubble">
          <div
            v-if="showHintBubble"
            class="absolute top-1/2 -translate-y-1/2 right-4 max-w-[220px] bg-amber-50 rounded-xl shadow-xl p-4 border-2 border-amber-300"
          >
            <div class="absolute -left-2.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[10px] border-b-[10px] border-r-[10px] border-transparent border-r-amber-300"></div>
            <div class="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[9px] border-b-[9px] border-r-[9px] border-transparent border-r-amber-50"></div>
            <div class="flex items-start gap-2.5">
              <span class="text-xl">💡</span>
              <div>
                <p class="text-xs font-bold text-amber-700 mb-1">힌트</p>
                <p class="text-xs text-amber-900 leading-relaxed">{{ currentHint }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 하단: 입력 영역 -->
      <div class="bg-white border-t border-gray-200 px-3 py-2.5">
        <div class="flex items-center gap-2">
          <!-- Hint Button -->
          <button
            class="w-8 h-8 rounded-full flex items-center justify-center transition-all"
            :class="showHintBubble ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-500'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <div class="flex-1">
            <input
              type="text"
              :value="userInput"
              readonly
              class="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none"
              placeholder="영어로 답변하세요..."
            />
          </div>

          <!-- Record Button -->
          <button
            class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            :class="isRecording ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-900 text-white'"
          >
            <svg v-if="!isRecording" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <div v-else class="w-3 h-3 bg-white rounded-sm animate-pulse"></div>
          </button>
        </div>

        <!-- Waveform -->
        <Transition name="slide-up">
          <div v-if="isRecording" class="mt-2 flex items-center justify-center gap-0.5 h-5">
            <div
              v-for="(h, i) in waveformHeights"
              :key="i"
              class="w-1 bg-red-400 rounded-full transition-all duration-75"
              :style="{ height: Math.min(h, 18) + 'px' }"
            ></div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Right: Feedback Panel -->
    <FeedbackPanel
      :show-feedback="showFeedback"
      :show-score="showScore"
      :display-score="displayScore"
      :show-breakdown="showBreakdown"
      :score-items="scoreItems"
      :visible-feedbacks="visibleFeedbacks"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import FeedbackPanel from './FeedbackPanel.vue'

const props = defineProps({
  avatarVideoSrc: String,
  avatarOpacity: Number,
  isSpeaking: Boolean,
  isListening: Boolean,
  visibleMessages: Array,
  showTyping: Boolean,
  userInput: String,
  isRecording: Boolean,
  waveformHeights: Array,
  showHintBubble: Boolean,
  currentHint: String,
  showFeedback: Boolean,
  showScore: Boolean,
  displayScore: Number,
  showBreakdown: Boolean,
  visibleFeedbacks: Array,
  scoreItems: Array
})

const emit = defineEmits(['video-ref'])

const videoRef = ref(null)

watch(videoRef, (el) => {
  if (el) emit('video-ref', el)
}, { immediate: true })
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide up transition */
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
}

/* Bubble transition */
.bubble-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bubble-leave-active {
  transition: all 0.3s ease;
}
.bubble-enter-from {
  opacity: 0;
  transform: scale(0.5) translateX(-20px);
}
.bubble-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Message transition */
.message-enter-active {
  transition: all 0.4s ease-out;
}
.message-leave-active {
  transition: all 0.2s ease;
}
.message-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.message-leave-to {
  opacity: 0;
}
</style>
