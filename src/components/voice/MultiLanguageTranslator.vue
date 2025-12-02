<template>
  <div class="h-full flex flex-col bg-white relative">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center gap-4 mb-2">
        <div class="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-300">
          <MicrophoneIcon class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Voice Translation</h2>
          <p class="text-sm text-gray-500 font-medium mt-0.5">Real-time multi-language translation with auto-detection</p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Controls (Fixed) -->
      <div class="w-80 border-r border-gray-200 bg-white flex flex-col">

        <!-- Fixed Language Settings Area -->
        <div class="flex-shrink-0 p-6 pb-0">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-200">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Language Settings</h3>

            <!-- Multi-Select Languages -->
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Select Languages (2-4)</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="lang in languageOptions"
                  :key="lang.value"
                  @click="toggleLanguage(lang.value)"
                  :disabled="isRecording"
                  class="px-3 py-2 rounded-lg text-sm font-bold transition-all duration-200 border flex items-center gap-2"
                  :class="[
                    selectedLanguages.includes(lang.value)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                    isRecording ? 'opacity-40 cursor-not-allowed' : ''
                  ]"
                >
                  <span>{{ lang.flag }}</span>
                  <span>{{ lang.label }}</span>
                </button>
              </div>
              <p v-if="selectedLanguages.length < 2" class="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1">
                <ExclamationCircleIcon class="w-4 h-4" />
                Select at least 2 languages to enable recording
              </p>
              <p v-else-if="selectedLanguages.length > 4" class="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1">
                <ExclamationCircleIcon class="w-4 h-4" />
                Maximum 4 languages supported (Azure limit)
              </p>
              <p v-else class="mt-3 text-xs text-green-600 font-medium flex items-center gap-1">
                <CheckCircleIcon class="w-4 h-4" />
                {{ selectedLanguages.length }} languages selected - Auto-detect enabled
              </p>
            </div>
          </div>
        </div>

        <!-- Fixed Recording Control (directly below language settings) -->
        <div class="flex-shrink-0 p-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col items-center">
          <!-- Status Indicator -->
          <div class="mb-4 flex flex-col items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div
                class="w-2 h-2 rounded-full transition-colors duration-300"
                :class="isConnected ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
              {{ isConnected ? 'Connected' : 'Ready' }}
            </div>
          </div>

          <!-- Main Record Button -->
          <button
            @click="toggleRecording"
            :disabled="selectedLanguages.length < 2 || selectedLanguages.length > 4"
            class="relative group transition-all duration-300"
          >
            <!-- Ripple Effect -->
            <div
              v-if="isRecording"
              class="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"
            ></div>

            <div
              class="w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-105 group-active:scale-95"
              :class="[
                isRecording
                  ? 'bg-white border-4 border-red-500 text-red-500'
                  : 'bg-black text-white hover:bg-gray-900',
                (selectedLanguages.length < 2 || selectedLanguages.length > 4) ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <StopIcon v-if="isRecording" class="w-8 h-8" />
              <MicrophoneIcon v-else class="w-8 h-8" />
            </div>
          </button>

          <p class="mt-4 text-xs font-medium text-gray-400 text-center">
            {{ isRecording ? 'Recording...' : 'Click to start recording' }}
          </p>

          <!-- Error Message -->
          <div v-if="error" class="mt-3 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg text-center flex items-center gap-2">
            <ExclamationCircleIcon class="w-4 h-4" />
            {{ error }}
          </div>
          </div>
        </div>
      </div>

      <!-- Right Panel: Results -->
      <div class="flex-1 flex flex-col bg-white relative overflow-hidden">
        <!-- Results Header -->
        <div class="h-14 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-200 bg-white">
          <div class="flex items-center gap-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Transcript</span>
            <div v-if="translationCards.length > 0" class="flex items-center gap-2">
              <span class="px-2 py-1 bg-white text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wide border border-gray-200">
                {{ translationCards.length }} Segments
              </span>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              v-if="translationCards.length > 0"
              @click="clearCards"
              :disabled="isRecording"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Clear All"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Recognizing Text (실시간 인식 중) - 상단 고정 -->
        <div v-if="recognizingText" class="flex-shrink-0 mx-8 mt-4 px-6 py-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-center justify-center gap-2 mb-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span class="text-xs font-bold text-blue-600 uppercase">Recognizing...</span>
          </div>
          <p class="text-base text-blue-800 font-medium text-center">{{ recognizingText }}</p>
        </div>

        <!-- Results List (스크롤 영역) -->
        <div
          ref="resultsContainer"
          class="flex-1 overflow-y-auto px-8 py-6 scroll-smooth"
        >
          <div v-if="translationCards.length > 0" class="space-y-4">
            <TransitionGroup name="card-list">
              <TranslationCard
                v-for="card in translationCards"
                :key="card.id"
                :original="card.original"
                :detected-lang="card.detectedLang"
                :translations="card.translations"
              />
            </TransitionGroup>
          </div>

          <!-- Empty State -->
          <div v-else class="h-full flex flex-col items-center justify-center text-gray-300">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-gray-200">
              <MicrophoneIcon class="w-10 h-10 text-gray-300" />
            </div>
            <p class="text-lg font-bold text-gray-400">No translations yet</p>
            <p class="text-sm text-gray-400 mt-1">Start recording to see live translations</p>
            <p class="text-xs text-gray-300 mt-4">Your speech will be auto-detected and translated</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAzureSTT } from '@/composables/useAzureSTT'
import TranslationCard from './TranslationCard.vue'
import {
  MicrophoneIcon,
  StopIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid'

// 언어 옵션 (BCP-47 코드 + 플래그)
const languageOptions = [
  { value: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
  { value: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'zh-CN', label: 'Chinese', flag: '🇨🇳' }
]

// 선택된 언어 (기본: 한국어, 영어)
const selectedLanguages = ref(['ko-KR', 'en-US'])

// 결과 컨테이너 참조
const resultsContainer = ref(null)

// Azure STT Composable (백엔드 Agent 기반)
const {
  isRecording,
  isConnected,
  error,
  translationCards,
  recognizingText,
  startRecording,
  stopRecording,
  clearCards
} = useAzureSTT()

// 언어 토글 (최대 4개 제한 - Azure 자동 언어 감지 제한)
function toggleLanguage(value) {
  if (isRecording.value) return

  const index = selectedLanguages.value.indexOf(value)
  if (index === -1) {
    // 최대 4개까지만 선택 가능
    if (selectedLanguages.value.length < 4) {
      selectedLanguages.value.push(value)
    }
  } else {
    // 최소 1개는 유지
    if (selectedLanguages.value.length > 1) {
      selectedLanguages.value.splice(index, 1)
    }
  }
}

// 녹음 토글
async function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    if (selectedLanguages.value.length < 2) return

    try {
      await startRecording(selectedLanguages.value)
    } catch (err) {
      console.error('Recording failed:', err)
    }
  }
}

// 카드 추가 시 자동 스크롤
function scrollToBottom() {
  nextTick(() => {
    if (resultsContainer.value) {
      resultsContainer.value.scrollTop = resultsContainer.value.scrollHeight
    }
  })
}
</script>

<style scoped>
/* Card Transition */
.card-list-enter-active {
  transition: all 0.3s ease;
}

.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
