<script setup>
/**
 * Speaking Learning Mode 컴포넌트
 *
 * 학습 모드 UI - 문장 교정, 발음 연습, Azure Speech 평가
 */
import {
  AcademicCapIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  SpeakerWaveIcon,
  MicrophoneIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** 학습 항목 목록 */
  learningItems: {
    type: Array,
    default: () => []
  },
  /** 현재 학습 인덱스 */
  currentLearningIndex: {
    type: Number,
    default: 0
  },
  /** 현재 학습 항목 */
  currentLearningItem: {
    type: Object,
    default: null
  },
  /** Learning Voice Composable State */
  isRecording: {
    type: Boolean,
    default: false
  },
  isConnecting: {
    type: Boolean,
    default: false
  },
  recordingTime: {
    type: Number,
    default: 0
  },
  interimText: {
    type: String,
    default: ''
  },
  recognizedText: {
    type: String,
    default: ''
  },
  isAssessing: {
    type: Boolean,
    default: false
  },
  assessmentResult: {
    type: Object,
    default: null
  },
  assessmentError: {
    type: String,
    default: null
  },
  formattedFeedback: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'exit',
  'prev',
  'next',
  'speak-text',
  'toggle-recording',
  'reset-to-first'
])

// Utility Functions
function getScoreBgColor(score) {
  if (score >= 9) return 'bg-green-100 text-green-600'
  if (score >= 7) return 'bg-blue-100 text-blue-600'
  if (score >= 5) return 'bg-yellow-100 text-yellow-600'
  return 'bg-red-100 text-red-600'
}

function getScoreBgClass(score) {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

function getWordScoreClass(score) {
  if (score >= 80) return 'bg-green-100 text-green-700 border border-green-200'
  if (score >= 60) return 'bg-yellow-100 text-yellow-700 border border-yellow-200'
  return 'bg-red-100 text-red-700 border border-red-200'
}
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-slate-50 to-gray-100">
    <div class="flex-1 flex flex-col min-h-0 p-4">
      <div class="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200/60 shadow-lg overflow-hidden">

        <!-- Learning Mode Header (Fixed) -->
        <div class="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <AcademicCapIcon class="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-900">학습 모드</h3>
              <p class="text-xs text-gray-500">교정된 문장을 따라 연습해보세요</p>
            </div>
          </div>
          <button
            @click="emit('exit')"
            class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2"
          >
            <ArrowLeftIcon class="w-4 h-4" />
            나가기
          </button>
        </div>

        <!-- Progress Header (Fixed) -->
        <div class="flex-shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-3">
              <span class="text-sm font-bold text-gray-900">
                {{ currentLearningIndex + 1 }} / {{ learningItems.length }}
              </span>
              <span class="text-xs text-gray-500">학습 진행률</span>
            </div>
            <!-- Score Badge -->
            <div v-if="currentLearningItem?.score" class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                   :class="getScoreBgColor(currentLearningItem.score)">
                {{ currentLearningItem.score }}
              </div>
              <span class="text-xs font-medium text-gray-600">점</span>
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gray-900 h-2 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${((currentLearningIndex + 1) / learningItems.length) * 100}%` }"
            ></div>
          </div>
        </div>

        <!-- Scrollable Content Area -->
        <div v-if="currentLearningItem" class="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
          <!-- Original vs Improved Comparison -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <!-- Original Text -->
            <div class="bg-white rounded-xl border border-red-200 overflow-hidden">
              <div class="px-3 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
                <ExclamationCircleIcon class="w-4 h-4 text-red-500" />
                <span class="text-sm font-bold text-red-700">원래 문장</span>
              </div>
              <div class="p-3">
                <p class="text-sm text-gray-700 leading-relaxed">{{ currentLearningItem.originalText }}</p>
              </div>
            </div>

            <!-- Improved Text -->
            <div class="bg-white rounded-xl border border-emerald-200 overflow-hidden">
              <div class="px-3 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <CheckBadgeIcon class="w-4 h-4 text-emerald-500" />
                  <span class="text-sm font-bold text-emerald-700">교정된 문장</span>
                </div>
                <button
                  @click="emit('speak-text', currentLearningItem.improvedText)"
                  class="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition"
                  title="듣기"
                >
                  <SpeakerWaveIcon class="w-4 h-4" />
                </button>
              </div>
              <div class="p-3">
                <p class="text-sm text-gray-700 font-medium leading-relaxed">{{ currentLearningItem.improvedText }}</p>
              </div>
            </div>
          </div>

          <!-- Grammar Corrections -->
          <div v-if="currentLearningItem.grammarCorrections?.length" class="bg-white rounded-xl border border-amber-200 overflow-hidden">
            <div class="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <ExclamationTriangleIcon class="w-4 h-4 text-amber-600" />
              <span class="text-sm font-bold text-amber-700">문법 교정</span>
              <span class="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                {{ currentLearningItem.grammarCorrections.length }}
              </span>
            </div>
            <div class="p-3 space-y-2">
              <div
                v-for="(correction, idx) in currentLearningItem.grammarCorrections"
                :key="idx"
                class="flex gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span class="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {{ idx + 1 }}
                </span>
                <p class="text-sm text-gray-700 leading-relaxed">{{ correction }}</p>
              </div>
            </div>
          </div>

          <!-- Expression Suggestions -->
          <div v-if="currentLearningItem.suggestions?.length" class="bg-white rounded-xl border border-blue-200 overflow-hidden">
            <div class="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
              <LightBulbIcon class="w-4 h-4 text-blue-600" />
              <span class="text-sm font-bold text-blue-700">더 나은 표현 제안</span>
              <span class="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                {{ currentLearningItem.suggestions.length }}
              </span>
            </div>
            <div class="p-3 space-y-2">
              <div
                v-for="(suggestion, idx) in currentLearningItem.suggestions"
                :key="idx"
                class="flex gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
              >
                <span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                  <LightBulbIcon class="w-3 h-3" />
                </span>
                <p class="text-sm text-gray-700 leading-relaxed">{{ suggestion }}</p>
              </div>
            </div>
          </div>

          <!-- Empty state when no corrections or suggestions -->
          <div v-if="!currentLearningItem.grammarCorrections?.length && !currentLearningItem.suggestions?.length"
               class="bg-white rounded-xl border border-green-200 p-4 text-center">
            <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckBadgeIcon class="w-5 h-5 text-green-600" />
            </div>
            <p class="text-sm text-green-700 font-medium">문법적으로 훌륭한 문장입니다!</p>
          </div>

          <!-- Practice Section (Azure Speech 발음 평가) -->
          <div class="bg-white rounded-xl border border-violet-200 overflow-hidden">
            <div class="px-3 py-2 bg-violet-50 border-b border-violet-200 flex items-center gap-2">
              <MicrophoneIcon class="w-4 h-4 text-violet-600" />
              <span class="text-sm font-bold text-violet-700">따라하기 연습</span>
              <span class="text-xs text-violet-500 ml-auto">Azure Speech</span>
            </div>
            <div class="p-4">
              <!-- Recording Controls -->
              <div class="flex flex-col items-center gap-3">
                <button
                  @click="emit('toggle-recording')"
                  :disabled="isConnecting || isAssessing"
                  class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  :class="isRecording
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white animate-pulse shadow-red-200'
                    : isConnecting
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-200'
                      : isAssessing
                        ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white animate-pulse shadow-blue-200'
                        : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-violet-200'"
                >
                  <MicrophoneIcon v-if="!isConnecting && !isAssessing" class="w-8 h-8" />
                  <svg v-else class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </button>
                <div class="text-center">
                  <p class="text-xs font-medium flex items-center justify-center gap-1" :class="isRecording ? 'text-red-600' : isConnecting ? 'text-yellow-600' : isAssessing ? 'text-blue-600' : 'text-violet-700'">
                    <span v-if="isConnecting" class="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
                    <span v-else-if="isRecording" class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span v-else-if="isAssessing" class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                    {{ isConnecting ? '연결 중...' : isRecording ? `녹음 중 (${recordingTime}초)` : isAssessing ? '발음 평가 중...' : '버튼을 클릭하여 녹음 시작' }}
                  </p>
                  <!-- Interim Text -->
                  <p v-if="interimText && isRecording" class="text-xs text-gray-400 mt-1 italic">{{ interimText }}</p>
                </div>
              </div>

              <!-- Recognized Text -->
              <div v-if="recognizedText && !isRecording" class="mt-4 p-3 bg-white rounded-lg border border-violet-100">
                <p class="text-xs text-gray-500 mb-1 text-center">인식된 문장</p>
                <p class="text-sm text-gray-900 font-medium text-center leading-relaxed">{{ recognizedText }}</p>
              </div>

              <!-- Assessment Error -->
              <div v-if="assessmentError" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                <p class="text-xs text-red-600 text-center">{{ assessmentError }}</p>
              </div>

              <!-- Pronunciation Assessment Results -->
              <div v-if="assessmentResult && !isRecording" class="mt-4 space-y-4">
                <!-- Overall Score -->
                <div class="bg-white rounded-xl border border-violet-100 p-4">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-bold text-gray-700">발음 평가 결과</span>
                    <span
                      class="px-3 py-1 rounded-full text-lg font-bold"
                      :class="getScoreBgClass(assessmentResult.pronunciation_score)"
                    >
                      {{ Math.round(assessmentResult.pronunciation_score) }}점
                    </span>
                  </div>

                  <!-- Score Breakdown -->
                  <div class="grid grid-cols-3 gap-2 mb-4">
                    <div class="text-center p-2 bg-gray-50 rounded-lg">
                      <p class="text-xs text-gray-500 mb-1">정확도</p>
                      <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.accuracy_score)">
                        {{ Math.round(assessmentResult.accuracy_score) }}
                      </p>
                    </div>
                    <div class="text-center p-2 bg-gray-50 rounded-lg">
                      <p class="text-xs text-gray-500 mb-1">유창성</p>
                      <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.fluency_score)">
                        {{ Math.round(assessmentResult.fluency_score) }}
                      </p>
                    </div>
                    <div class="text-center p-2 bg-gray-50 rounded-lg">
                      <p class="text-xs text-gray-500 mb-1">운율</p>
                      <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.prosody_score)">
                        {{ Math.round(assessmentResult.prosody_score) }}
                      </p>
                    </div>
                  </div>

                  <!-- Feedback Message -->
                  <div v-if="formattedFeedback" class="p-3 bg-violet-50 rounded-lg border border-violet-100">
                    <p class="text-sm text-violet-800 font-medium mb-2">{{ formattedFeedback.overallFeedback }}</p>
                    <ul v-if="formattedFeedback.detailedFeedback.length > 0" class="space-y-1">
                      <li v-for="(feedback, idx) in formattedFeedback.detailedFeedback" :key="idx" class="text-xs text-violet-600">
                        {{ feedback }}
                      </li>
                    </ul>
                  </div>
                </div>

                <!-- Word-by-Word Analysis -->
                <div v-if="assessmentResult.words && assessmentResult.words.length > 0" class="bg-white rounded-xl border border-violet-100 p-4">
                  <p class="text-sm font-bold text-gray-700 mb-3">단어별 평가</p>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="(word, idx) in assessmentResult.words"
                      :key="idx"
                      class="group relative"
                    >
                      <span
                        class="inline-block px-2 py-1 rounded-md text-sm font-medium cursor-help transition-all"
                        :class="getWordScoreClass(word.accuracy_score)"
                      >
                        {{ word.word }}
                        <span class="text-xs opacity-70 ml-1">({{ Math.round(word.accuracy_score) }})</span>
                      </span>

                      <!-- Phoneme Tooltip -->
                      <div v-if="word.phonemes && word.phonemes.length > 0"
                           class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                        <div class="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap">
                          <p class="font-bold mb-1">음소별 평가</p>
                          <div class="flex flex-wrap gap-1">
                            <span
                              v-for="(phoneme, pIdx) in word.phonemes"
                              :key="pIdx"
                              class="px-1.5 py-0.5 rounded"
                              :class="phoneme.accuracy_score >= 80 ? 'bg-green-600' : phoneme.accuracy_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'"
                            >
                              {{ phoneme.phoneme }} ({{ Math.round(phoneme.accuracy_score) }})
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="text-xs text-gray-400 mt-2">* 단어 위에 마우스를 올리면 음소별 점수를 볼 수 있어요</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Completion Card -->
          <div v-if="currentLearningIndex >= learningItems.length - 1 && learningItems.length > 0"
               class="bg-white rounded-xl border border-emerald-200 p-6 text-center">
            <div class="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon class="w-7 h-7 text-emerald-600" />
            </div>
            <h4 class="text-lg font-bold text-gray-900 mb-1">모든 학습을 완료했습니다!</h4>
            <p class="text-sm text-gray-600 mb-4">총 {{ learningItems.length }}개의 문장을 학습했어요.</p>
            <div class="flex items-center justify-center gap-2">
              <button
                @click="emit('reset-to-first')"
                class="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-all duration-200"
              >
                처음부터 다시
              </button>
              <button
                @click="emit('exit')"
                class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200"
              >
                돌아가기
              </button>
            </div>
          </div>
        </div>

        <!-- Navigation (Fixed at Bottom) -->
        <div class="flex-shrink-0 px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
          <button
            @click="emit('prev')"
            :disabled="currentLearningIndex === 0"
            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            <ChevronLeftIcon class="w-4 h-4" />
            이전
          </button>

          <!-- Page indicator dots -->
          <div class="flex items-center gap-1">
            <template v-for="(_, idx) in learningItems.slice(0, Math.min(learningItems.length, 7))" :key="idx">
              <div
                class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                :class="idx === currentLearningIndex
                  ? 'bg-gray-900 w-3'
                  : idx < currentLearningIndex
                    ? 'bg-gray-500'
                    : 'bg-gray-300'"
              ></div>
            </template>
            <span v-if="learningItems.length > 7" class="text-xs text-gray-400 ml-1">
              +{{ learningItems.length - 7 }}
            </span>
          </div>

          <button
            @click="emit('next')"
            :disabled="currentLearningIndex >= learningItems.length - 1"
            class="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
          >
            다음
            <ChevronRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
