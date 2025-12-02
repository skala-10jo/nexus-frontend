<script setup>
/**
 * Practice 피드백 사이드바 컴포넌트
 *
 * 대화별 피드백과 종합 피드백을 표시합니다.
 */
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  ArrowPathIcon,
  MicrophoneIcon
} from '@heroicons/vue/24/outline'

defineProps({
  /** 활성 탭 */
  activeTab: {
    type: String,
    default: 'messages'
  },
  /** 사용자 메시지 목록 */
  userMessages: {
    type: Array,
    default: () => []
  },
  /** 선택된 메시지 인덱스 */
  selectedMessageIndex: {
    type: Number,
    default: 0
  },
  /** 선택된 메시지 피드백 */
  selectedMessageFeedback: {
    type: Object,
    default: null
  },
  /** 종합 피드백 */
  comprehensiveFeedback: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'update:activeTab',
  'selectMessage'
])
</script>

<template>
  <aside class="w-[700px] bg-white border-l border-gray-200 flex flex-col shadow-xl z-30 shrink-0 transition-all duration-300">
    <!-- Header -->
    <div class="p-5 border-b border-gray-100 bg-white">
      <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
        <ChartBarIcon class="w-5 h-5 text-blue-700" />
        피드백
      </h2>

      <!-- Tabs -->
      <div class="flex p-1 bg-gray-100 rounded-xl">
        <button
          v-for="tab in ['messages', 'comprehensive']"
          :key="tab"
          @click="emit('update:activeTab', tab)"
          class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
          :class="[
            activeTab === tab
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          ]"
        >
          {{ tab === 'messages' ? '대화별 피드백' : '종합 피드백' }}
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

      <!-- Message Analysis Tab -->
      <div v-if="activeTab === 'messages'">
        <!-- Empty State -->
        <div v-if="userMessages.length === 0" class="text-center py-12 text-gray-400">
          <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p class="text-sm">메시지를 보내면 실시간 피드백을 받을 수 있어요</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Message Navigator -->
          <div class="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
            <button
              @click="emit('selectMessage', Math.max(0, selectedMessageIndex - 1))"
              :disabled="selectedMessageIndex <= 0"
              class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
            </button>
            <span class="text-sm font-bold text-gray-700">
              메시지 {{ selectedMessageIndex + 1 }} / {{ userMessages.length }}
            </span>
            <button
              @click="emit('selectMessage', Math.min(userMessages.length - 1, selectedMessageIndex + 1))"
              :disabled="selectedMessageIndex >= userMessages.length - 1"
              class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronRightIcon class="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <!-- Selected Message Feedback -->
          <div v-if="selectedMessageFeedback" class="space-y-6 animate-fadeIn">

            <!-- Original Message -->
            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">나의 메시지</p>
              <p class="text-gray-900 font-medium">{{ userMessages[selectedMessageIndex]?.message }}</p>
            </div>

            <!-- Scores -->
            <div v-if="selectedMessageFeedback.score !== undefined" class="grid grid-cols-2 gap-3">
              <div class="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                <div class="text-3xl font-black text-blue-600 mb-1">{{ selectedMessageFeedback.score }}</div>
                <div class="text-xs font-bold text-gray-400 uppercase">종합</div>
              </div>
              <div class="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-sm">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500 font-medium">문법</span>
                  <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.grammar }}/10</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500 font-medium">어휘</span>
                  <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.vocabulary }}/10</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500 font-medium">유창성</span>
                  <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.fluency }}/10</span>
                </div>
              </div>
            </div>

            <!-- Terminology Usage -->
            <div v-if="selectedMessageFeedback.terminology_usage" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
                용어 사용
              </h3>
              <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                <div v-if="selectedMessageFeedback.terminology_usage.used?.length" class="space-y-2">
                  <p class="text-xs font-bold text-emerald-600 uppercase">사용한 용어</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(term, idx) in selectedMessageFeedback.terminology_usage.used"
                      :key="idx"
                      class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium"
                    >
                      {{ term }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedMessageFeedback.terminology_usage.missed?.length" class="space-y-2">
                  <p class="text-xs font-bold text-gray-500 uppercase">미사용 용어</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="(term, idx) in selectedMessageFeedback.terminology_usage.missed"
                      :key="idx"
                      class="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium"
                    >
                      {{ term }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedMessageFeedback.terminology_usage.feedback" class="text-sm text-gray-700 mt-2">
                  {{ selectedMessageFeedback.terminology_usage.feedback }}
                </div>
              </div>
            </div>

            <!-- Grammar Corrections -->
            <div v-if="selectedMessageFeedback.grammar_corrections?.length" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ExclamationCircleIcon class="w-4 h-4 text-amber-500" />
                문법 교정
              </h3>
              <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                <div
                  v-for="(correction, idx) in selectedMessageFeedback.grammar_corrections"
                  :key="idx"
                  class="flex gap-2 text-sm text-gray-700"
                >
                  <span class="text-amber-500">•</span>
                  <span>{{ correction }}</span>
                </div>
              </div>
            </div>

            <!-- Suggestions -->
            <div v-if="selectedMessageFeedback.suggestions?.length" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LightBulbIcon class="w-4 h-4 text-blue-500" />
                개선 제안
              </h3>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <div
                  v-for="(suggestion, idx) in selectedMessageFeedback.suggestions"
                  :key="idx"
                  class="flex gap-2 text-sm text-gray-700"
                >
                  <span class="text-blue-500">•</span>
                  <span>{{ suggestion }}</span>
                </div>
              </div>
            </div>

            <!-- Pronunciation Analysis -->
            <div v-if="selectedMessageFeedback.pronunciation_details" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MicrophoneIcon class="w-4 h-4 text-purple-500" />
                발음
              </h3>

              <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div class="flex items-center justify-between mb-4">
                  <span class="text-sm font-medium text-gray-600">정확도</span>
                  <span class="text-lg font-bold text-purple-600">
                    {{ selectedMessageFeedback.pronunciation_details.pronunciation_score?.toFixed(1) }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="(word, idx) in selectedMessageFeedback.pronunciation_details.words"
                    :key="idx"
                    class="px-2 py-1 rounded-lg text-sm font-medium border transition-colors cursor-help"
                    :class="[
                      word.accuracy_score >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                      word.accuracy_score >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    ]"
                    :title="`Score: ${word.accuracy_score?.toFixed(0)}`"
                  >
                    {{ word.word }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comprehensive Report Tab -->
      <div v-else>
        <!-- Empty State -->
        <div v-if="!comprehensiveFeedback" class="text-center py-12 text-gray-400">
          <ChartBarIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p class="text-sm">대화를 완료하면 종합 리포트가 생성됩니다</p>
        </div>

        <div v-else class="space-y-6 animate-fadeIn">
          <!-- Overall Score Card -->
          <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <div class="text-center">
              <div class="text-sm font-medium text-blue-100 mb-1 uppercase tracking-wider">종합 점수</div>
              <div class="text-5xl font-black mb-2">{{ comprehensiveFeedback.overall_score?.toFixed(1) || 0 }}</div>
              <div class="flex justify-center gap-4 text-xs font-medium text-blue-100">
                <span>유창성: {{ comprehensiveFeedback.fluency_score?.toFixed(1) }}</span>
                <span>•</span>
                <span>정확도: {{ comprehensiveFeedback.accuracy_score?.toFixed(1) }}</span>
              </div>
            </div>
          </div>

          <!-- Strengths -->
          <div v-if="comprehensiveFeedback.strengths?.length" class="space-y-3">
            <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <CheckCircleIcon class="w-4 h-4 text-green-500" />
              잘한 점
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(strength, idx) in comprehensiveFeedback.strengths"
                :key="idx"
                class="flex gap-3 text-sm text-gray-600 bg-green-50/50 p-3 rounded-xl border border-green-100"
              >
                <span class="text-green-500 font-bold">•</span>
                {{ strength }}
              </li>
            </ul>
          </div>

          <!-- Improvements -->
          <div v-if="comprehensiveFeedback.areas_for_improvement?.length" class="space-y-3">
            <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ArrowPathIcon class="w-4 h-4 text-amber-500" />
              개선할 점
            </h3>
            <ul class="space-y-2">
              <li
                v-for="(area, idx) in comprehensiveFeedback.areas_for_improvement"
                :key="idx"
                class="flex gap-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100"
              >
                <span class="text-amber-500 font-bold">•</span>
                {{ area }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
