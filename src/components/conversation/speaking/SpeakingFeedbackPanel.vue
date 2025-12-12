<script setup>
/**
 * Speaking Feedback Panel 컴포넌트
 *
 * AI 코칭 피드백 패널 (모바일에서는 Bottom Sheet)
 */
import {
  SparklesIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'

defineProps({
  /** 선택된 발화 */
  selectedUtterance: {
    type: Object,
    default: null
  },
  /** 피드백 로딩 중 */
  isLoadingFeedback: {
    type: Boolean,
    default: false
  },
  /** 모바일 피드백 표시 여부 */
  showMobileFeedback: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'request-feedback',
  'go-to-learning'
])

// Utility Functions
function getScoreBgColor(score) {
  if (score >= 9) return 'bg-green-100 text-green-600'
  if (score >= 7) return 'bg-blue-100 text-blue-600'
  if (score >= 5) return 'bg-yellow-100 text-yellow-600'
  return 'bg-red-100 text-red-600'
}

function getScoreLabel(key) {
  const labels = {
    grammar: '문법',
    vocabulary: '어휘',
    fluency: '유창성',
    clarity: '명확성'
  }
  return labels[key] || key
}
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-50 h-[85vh] md:h-auto md:static md:w-[45%] md:flex-shrink-0 flex flex-col transition-transform duration-300 transform md:transform-none"
    :class="showMobileFeedback ? 'translate-y-0' : 'translate-y-full md:translate-y-0'"
  >
    <div class="bg-white rounded-t-3xl md:rounded-2xl border border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-lg h-full overflow-hidden flex flex-col relative">

      <!-- Mobile Handle -->
      <div class="md:hidden flex justify-center pt-3 pb-1" @click="emit('close')">
        <div class="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      <!-- Background Decoration -->
      <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none"></div>

      <template v-if="selectedUtterance">
        <!-- Header -->
        <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
          <div class="flex items-center gap-2">
            <div class="p-2 bg-indigo-50 rounded-lg">
              <SparklesIcon class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 class="text-lg font-bold text-gray-900">AI 코칭 피드백</h4>
              <p class="text-xs text-gray-500">선택한 발화에 대한 상세 분석입니다</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="!selectedUtterance.hasFeedback"
              @click="emit('request-feedback')"
              :disabled="isLoadingFeedback"
              class="hidden md:flex px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black hover:shadow-lg hover:shadow-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2 transform active:scale-95"
            >
              <SparklesIcon class="w-4 h-4" :class="{ 'animate-spin': isLoadingFeedback }" />
              {{ isLoadingFeedback ? '분석 중...' : '피드백 받기' }}
            </button>

            <!-- Mobile Close Button -->
            <button
              @click="emit('close')"
              class="md:hidden p-2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide">
          <template v-if="selectedUtterance.feedback">
            <!-- Score Section -->
            <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div class="flex items-center justify-between mb-6">
                <div>
                  <h5 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">종합 점수</h5>
                  <div class="flex items-baseline gap-2">
                    <span class="text-4xl font-black text-gray-900">{{ selectedUtterance.feedback.score }}</span>
                    <span class="text-lg text-gray-400 font-medium">/ 10</span>
                  </div>
                </div>
                <div class="w-16 h-16 rounded-full flex items-center justify-center"
                     :class="getScoreBgColor(selectedUtterance.feedback.score)">
                  <!-- Excellent (9-10) -->
                  <img
                    v-if="selectedUtterance.feedback.score >= 9"
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Beaming%20Face%20with%20Smiling%20Eyes.png"
                    alt="Excellent"
                    class="w-12 h-12 object-contain drop-shadow-sm"
                  />
                  <!-- Good (7-8) -->
                  <img
                    v-else-if="selectedUtterance.feedback.score >= 7"
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nerd%20Face.png"
                    alt="Good"
                    class="w-12 h-12 object-contain drop-shadow-sm"
                  />
                  <!-- Average (5-6) -->
                  <img
                    v-else-if="selectedUtterance.feedback.score >= 5"
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Crying%20Face.png"
                    alt="Average"
                    class="w-12 h-12 object-contain drop-shadow-sm"
                  />
                  <!-- Poor (0-4) -->
                  <img
                    v-else
                    src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Nauseated%20Face.png"
                    alt="Poor"
                    class="w-12 h-12 object-contain drop-shadow-sm"
                  />
                </div>
              </div>

              <!-- Score Breakdown Grid -->
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="(value, key) in selectedUtterance.feedback.scoreBreakdown"
                  :key="key"
                  class="bg-gray-50 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-100 transition-colors"
                >
                  <span class="text-xs font-medium text-gray-500 group-hover:text-gray-700">{{ getScoreLabel(key) }}</span>
                  <span class="text-sm font-bold text-gray-900">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- Grammar Corrections -->
            <div class="space-y-3">
              <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ExclamationTriangleIcon v-if="selectedUtterance.feedback.grammarCorrections?.length" class="w-4 h-4 text-amber-500" />
                <CheckBadgeIcon v-else class="w-4 h-4 text-amber-500" />
                문법 교정
              </h5>
              <!-- 교정 사항이 있는 경우 -->
              <div v-if="selectedUtterance.feedback.grammarCorrections?.length" class="bg-amber-50/50 rounded-2xl border border-amber-100 overflow-hidden">
                <div
                  v-for="(correction, idx) in selectedUtterance.feedback.grammarCorrections"
                  :key="idx"
                  class="p-4 border-b border-amber-100 last:border-0 flex gap-3"
                >
                  <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ correction }}</p>
                </div>
              </div>
              <!-- 교정 사항이 없는 경우 -->
              <div v-else class="bg-amber-50/50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">👏</span>
                <p class="text-sm text-gray-900">훌륭해요! 올바른 문법을 사용하고 있습니다.</p>
              </div>
            </div>

            <!-- Suggestions -->
            <div v-if="selectedUtterance.feedback.suggestions?.length" class="space-y-3">
              <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LightBulbIcon class="w-4 h-4 text-blue-500" />
                더 나은 표현 제안
              </h5>
              <div class="bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden">
                <div
                  v-for="(suggestion, idx) in selectedUtterance.feedback.suggestions"
                  :key="idx"
                  class="p-4 border-b border-blue-100 last:border-0 flex gap-3"
                >
                  <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                  <p class="text-sm text-gray-700 leading-relaxed">{{ suggestion }}</p>
                </div>
              </div>
            </div>

            <!-- Improved Sentence -->
            <div v-if="selectedUtterance.feedback.improvedSentence" class="space-y-3">
              <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckBadgeIcon class="w-4 h-4 text-emerald-500" />
                추천 문장
              </h5>
              <div class="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 relative overflow-hidden group">
                <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <CheckBadgeIcon class="w-16 h-16 text-emerald-600" />
                </div>
                <p class="text-base text-emerald-900 font-medium relative z-10 leading-relaxed">
                  "{{ selectedUtterance.feedback.improvedSentence }}"
                </p>
              </div>
            </div>

            <!-- Action Button -->
            <div class="pt-4 pb-2">
              <button
                @click="emit('go-to-learning')"
                class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
              >
                <AcademicCapIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                이 문장으로 학습하기
              </button>
            </div>
          </template>

          <!-- Loading State -->
          <template v-else-if="isLoadingFeedback">
            <div class="flex flex-col items-center justify-center py-20 text-center">
              <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
              <h4 class="text-lg font-bold text-gray-900 mb-2">AI가 분석 중입니다</h4>
              <p class="text-sm text-gray-500">문법, 표현, 뉘앙스를 꼼꼼히 체크하고 있어요</p>
            </div>
          </template>

          <!-- Empty Feedback State -->
          <template v-else>
            <div class="flex flex-col items-center justify-center py-20 text-center px-6">
              <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <SparklesIcon class="w-10 h-10 text-indigo-400" />
              </div>
              <h4 class="text-lg font-bold text-gray-900 mb-2">피드백을 받아보세요</h4>
              <p class="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                AI가 문법 오류를 교정하고 더 자연스러운 표현을 제안해드립니다.
              </p>
              <button
                @click="emit('request-feedback')"
                class="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-300"
              >
                피드백 생성하기
              </button>
            </div>
          </template>
        </div>
      </template>

      <!-- No Utterance Selected State (Desktop Only) -->
      <template v-else>
        <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
          <div class="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
            <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-300" />
          </div>
          <h4 class="text-lg font-bold text-gray-900 mb-2">대화를 선택해주세요</h4>
          <p class="text-sm text-gray-500 max-w-xs mx-auto">
            왼쪽 타임라인에서 분석하고 싶은 발화를 클릭하면 상세한 AI 피드백을 확인할 수 있습니다.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
