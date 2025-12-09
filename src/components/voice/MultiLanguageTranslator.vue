<template>
  <div class="h-full flex flex-col bg-white relative">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="mb-2">
        <h2 class="text-2xl font-bold text-gray-900">음성 번역</h2>
        <p class="text-sm text-gray-500 font-medium mt-0.5">파파고 번역기를 넘는, '나만의 전문 번역'</p>
      </div>
    </div>

    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <div class="w-full md:w-64 h-auto md:h-full border-r-0 md:border-r border-b md:border-b-0 border-gray-200 bg-gray-50 flex flex-col p-4 md:p-6 overflow-y-auto md:overflow-visible shrink-0 transition-all duration-300">
        <div 
          class="flex items-center justify-between cursor-pointer md:cursor-default mb-4 md:mb-6"
          @click="toggleLanguagePanel"
        >
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Languages</h3>
          <ChevronDownIcon 
            class="w-5 h-5 text-gray-400 transition-transform duration-200 md:hidden"
            :class="{ 'rotate-180': isLanguagePanelExpanded }"
          />
        </div>

        <div :class="[isLanguagePanelExpanded ? 'block' : 'hidden', 'md:block']">
          <!-- Language Buttons (Vertical) -->
          <div class="grid grid-cols-2 md:flex md:flex-col gap-2 mb-4 md:mb-6">
          <button
            v-for="lang in languageOptions"
            :key="lang.value"
            @click="toggleLanguage(lang.value)"
            :disabled="isRecording"
            class="w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border flex items-center gap-3"
            :class="[
              selectedLanguages.includes(lang.value)
                ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
              isRecording ? 'opacity-40 cursor-not-allowed' : ''
            ]"
          >
            <span class="text-xl">{{ lang.flag }}</span>
            <span>{{ lang.label }}</span>
          </button>
        </div>

        <!-- Status Messages -->
        <div class="text-xs text-gray-500 mb-4">
          <p v-if="selectedLanguages.length < 2" class="text-amber-600 font-medium flex items-center gap-1">
            <ExclamationCircleIcon class="w-4 h-4" />
            Select at least 2 languages
          </p>
          <p v-else-if="selectedLanguages.length > 4" class="text-amber-600 font-medium flex items-center gap-1">
            <ExclamationCircleIcon class="w-4 h-4" />
            Maximum 4 languages
          </p>
          <p v-else class="text-green-600 font-medium flex items-center gap-1">
            <CheckCircleIcon class="w-4 h-4" />
            {{ selectedLanguages.length }} languages selected
          </p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mt-auto px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg flex items-center gap-2">
          <ExclamationCircleIcon class="w-4 h-4" />
          {{ error }}
        </div>
        </div>
      </div>

      <!-- Right Panel: Messages -->
      <div class="flex-1 flex flex-col bg-white relative overflow-hidden min-h-0">
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

        <!-- Results List (스크롤 영역) -->
        <div
          ref="resultsContainer"
          class="flex-1 overflow-y-auto px-8 py-6 scroll-smooth"
        >
          <!-- Empty State -->
          <div v-if="translationCards.length === 0" class="h-full flex flex-col items-center justify-center text-gray-300">
            <div class="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-gray-200">
              <MicrophoneIcon class="w-10 h-10 text-gray-300" />
            </div>
            <p class="text-lg font-bold text-gray-400">No translations yet</p>
            <p class="text-sm text-gray-400 mt-1">Start recording to see live translations</p>
          </div>

          <!-- Message Groups -->
          <div v-else class="space-y-6 max-w-4xl mx-auto">
            <TransitionGroup name="card-list">
              <div
                v-for="card in translationCards"
                :key="card.id"
                class="message-group bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <!-- Original Message -->
                <div class="flex items-center gap-3 mb-3">
                  <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0">
                    {{ getLanguageLabel(card.detectedLang) }}
                  </span>
                  <div class="flex-1">
                    <div class="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 text-sm leading-relaxed">
                      {{ card.original }}
                    </div>
                  </div>
                  <div class="text-xs text-gray-400 flex-shrink-0">
                    {{ formatTime(card.timestamp) }}
                  </div>
                </div>

                <!-- Translation Messages -->
                <div class="space-y-2">
                  <div
                    v-for="(translation, index) in card.translations"
                    :key="`${card.id}-${index}`"
                    class="flex items-center gap-3"
                  >
                    <span class="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold whitespace-nowrap flex-shrink-0">
                      {{ getLanguageLabel(translation.lang) }}
                    </span>
                    <div class="flex-1">
                      <div class="px-4 py-3 bg-blue-50 rounded-xl text-blue-900 text-sm leading-relaxed">
                        {{ translation.text }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>

        <!-- Recognizing Text (실시간 인식 중) - 마이크 위 -->
        <div v-if="recognizingText" class="flex-shrink-0 mx-8 mb-3 px-6 py-3 bg-blue-50 border border-blue-200 rounded-xl">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
            <span class="text-xs font-bold text-blue-600 uppercase">Recognizing</span>
            <span class="text-sm text-blue-800 font-medium">{{ recognizingText }}</span>
          </div>
        </div>

        <!-- Microphone Button - 하단 고정 -->
        <div class="flex-shrink-0 flex justify-center pt-7 pb-24 md:pb-14 border-t border-gray-200 bg-white">
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
              class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform group-hover:scale-105 group-active:scale-95"
              :class="[
                isRecording
                  ? 'bg-red-500 text-white'
                  : 'bg-black text-white hover:bg-gray-800',
                (selectedLanguages.length < 2 || selectedLanguages.length > 4) ? 'opacity-50 cursor-not-allowed' : ''
              ]"
            >
              <StopIcon v-if="isRecording" class="w-7 h-7" />
              <MicrophoneIcon v-else class="w-7 h-7" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import { useAzureSTT } from '@/composables/useAzureSTT'
import {
  MicrophoneIcon,
  StopIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/solid'

// 언어 옵션 (BCP-47 코드 + 플래그)
const languageOptions = [
  { value: 'ko-KR', label: 'Korean', flag: '🇰🇷' },
  { value: 'en-US', label: 'English', flag: '🇺🇸' },
  { value: 'ja-JP', label: 'Japanese', flag: '🇯🇵' },
  { value: 'vi-VN', label: 'Vietnamese', flag: '🇻🇳' },
  { value: 'zh-CN', label: 'Chinese', flag: '🇨🇳' }
]

// 언어 라벨 매핑
const languageLabels = {
  'ko-KR': { code: 'KR', name: '한국어' },
  'en-US': { code: 'US', name: 'English' },
  'ja-JP': { code: 'JP', name: '日本語' },
  'vi-VN': { code: 'VN', name: 'Tiếng Việt' },
  'zh-CN': { code: 'CN', name: '中文' }
}

// 선택된 언어 (기본: 한국어, 영어)
const selectedLanguages = ref(['ko-KR', 'en-US'])

// 언어 패널 확장 상태 (모바일용)
const isLanguagePanelExpanded = ref(true)

function toggleLanguagePanel() {
  isLanguagePanelExpanded.value = !isLanguagePanelExpanded.value
}

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

// 언어 라벨 가져오기
function getLanguageLabel(bcp47) {
  const label = languageLabels[bcp47]
  if (!label) return bcp47
  return `${label.code} ${label.name}`
}

// 시간 포맷
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

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

// 맨 아래로 스크롤
function scrollToBottom() {
  nextTick(() => {
    if (resultsContainer.value) {
      resultsContainer.value.scrollTop = resultsContainer.value.scrollHeight
    }
  })
}

// 컴포넌트 마운트 시 맨 아래로 스크롤
onMounted(() => {
  scrollToBottom()
})

// 카드 추가 시 자동 스크롤
watch(
  () => translationCards.value.length,
  () => {
    scrollToBottom()
  }
)

// recognizingText 변경 시에도 스크롤
watch(
  () => recognizingText.value,
  () => {
    scrollToBottom()
  }
)
</script>

<style scoped>
/* Language Badge */
.language-badge {
  width: 80px;
  text-align: left;
}

/* Message Box */
.message-box {
  word-break: break-word;
  line-height: 1.5;
}

/* Card Transition - 아래에서 위로 */
.card-list-enter-active {
  transition: all 0.3s ease;
}

.card-list-leave-active {
  transition: all 0.3s ease;
}

.card-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.card-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Message Group Transition */
.message-group {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
