<script setup>
/**
 * Practice 피드백 사이드바 컴포넌트
 *
 * 대화별 피드백을 표시합니다.
 */
import { computed } from 'vue'
import {
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  MicrophoneIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
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
  /** 전체 회화에서 사용한 용어 (누적) */
  allUsedTerms: {
    type: Array,
    default: () => []
  },
  /** 모바일에서 열림 상태 */
  isMobileOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'selectMessage',
  'close'
])

/**
 * 실제 미사용 용어 (전체 회화에서 사용한 용어 제외)
 */
const filteredMissedTerms = computed(() => {
  const missed = props.selectedMessageFeedback?.terminology_usage?.missed || []
  const used = props.allUsedTerms || []

  // 이미 사용한 용어는 미사용 목록에서 제외
  return missed.filter(term => !used.includes(term))
})
</script>

<template>
  <aside class="bg-white border-l border-gray-200 flex flex-col shadow-xl z-50 transition-all duration-300
           md:w-[45%] md:min-w-[450px] md:max-w-[1400px] md:static md:h-auto md:border-l
           fixed inset-x-0 bottom-0 h-[85vh] rounded-t-2xl md:rounded-none w-full" :class="[
            isMobileOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0'
          ]">
    <!-- Header -->
    <div class="p-5 border-b border-gray-100 bg-white rounded-t-2xl md:rounded-none">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ChartBarIcon class="w-5 h-5 text-blue-700" />
          대화별 피드백
        </h2>
        <!-- Mobile Close Button -->
        <button @click="emit('close')"
          class="md:hidden p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
            stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">

      <!-- Message Analysis -->
      <div>
        <!-- Empty State -->
        <div v-if="userMessages.length === 0" class="text-center py-12 text-gray-400">
          <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p class="text-sm">메시지를 보내면 실시간 피드백을 받을 수 있어요</p>
        </div>

        <div v-else class="space-y-6">
          <!-- Message Navigator -->
          <div class="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
            <button @click="emit('selectMessage', Math.max(0, selectedMessageIndex - 1))"
              :disabled="selectedMessageIndex <= 0"
              class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
              <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
            </button>
            <span class="text-sm font-bold text-gray-700">
              메시지 {{ selectedMessageIndex + 1 }} / {{ userMessages.length }}
            </span>
            <button @click="emit('selectMessage', Math.min(userMessages.length - 1, selectedMessageIndex + 1))"
              :disabled="selectedMessageIndex >= userMessages.length - 1"
              class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
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
                  <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.vocabulary
                    }}/10</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500 font-medium">유창성</span>
                  <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.fluency }}/10</span>
                </div>
              </div>
            </div>

            <!-- Terminology Usage (누적) -->
            <div v-if="allUsedTerms?.length || selectedMessageFeedback.terminology_usage" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
                용어 사용
              </h3>
              <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                <!-- 사용한 용어 (누적) -->
                <div v-if="allUsedTerms?.length" class="space-y-2">
                  <p class="text-xs font-bold text-emerald-600 uppercase">사용한 용어</p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(term, idx) in allUsedTerms" :key="idx"
                      class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                      {{ term }}
                    </span>
                  </div>
                </div>
                <!-- 미사용 용어 (전체 회화에서 사용한 용어 제외) -->
                <div v-if="filteredMissedTerms.length" class="space-y-2">
                  <p class="text-xs font-bold text-gray-500 uppercase">미사용 용어</p>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="(term, idx) in filteredMissedTerms" :key="idx"
                      class="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                      {{ term }}
                    </span>
                  </div>
                </div>
                <div v-if="selectedMessageFeedback.terminology_usage?.feedback" class="text-sm text-gray-700 mt-2">
                  {{ selectedMessageFeedback.terminology_usage.feedback }}
                </div>
              </div>
            </div>

            <!-- Grammar Corrections -->
            <div class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ExclamationCircleIcon v-if="selectedMessageFeedback.grammar_corrections?.length"
                  class="w-4 h-4 text-amber-500" />
                <CheckCircleIcon v-else class="w-4 h-4 text-emerald-500" />
                문법 교정
              </h3>
              <!-- 문법 교정이 있는 경우 -->
              <div v-if="selectedMessageFeedback.grammar_corrections?.length"
                class="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                <div v-for="(correction, idx) in selectedMessageFeedback.grammar_corrections" :key="idx"
                  class="flex gap-2 text-sm text-gray-700">
                  <span class="text-amber-500">•</span>
                  <span>{{ correction }}</span>
                </div>
              </div>
              <!-- 문법 교정이 없는 경우 칭찬 메시지 -->
              <div v-else class="bg-amber-50/50 rounded-xl border border-amber-100 p-4 flex items-center gap-3">
                <span class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">👏</span>
                <p class="text-sm text-gray-900">훌륭해요! 올바른 문법을 사용하고 있습니다.</p>
              </div>
            </div>

            <!-- Suggestions -->
            <div v-if="selectedMessageFeedback.suggestions?.length" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LightBulbIcon class="w-4 h-4 text-blue-500" />
                개선 제안
              </h3>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                <div v-for="(suggestion, idx) in selectedMessageFeedback.suggestions" :key="idx"
                  class="flex gap-2 text-sm text-gray-700">
                  <span class="text-blue-500">•</span>
                  <span>{{ suggestion }}</span>
                </div>
              </div>
            </div>

            <!-- Pronunciation Analysis -->
            <div v-if="selectedMessageFeedback.pronunciation_details" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MicrophoneIcon class="w-4 h-4 text-purple-500" />
                발음 평가
              </h3>

              <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
                <!-- Scores -->
                <div class="grid grid-cols-2 gap-3">
                  <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">
                      {{ selectedMessageFeedback.pronunciation_details.pronunciation_score?.toFixed(0) }}
                    </div>
                    <div class="text-xs text-gray-500">전체 점수</div>
                  </div>
                  <div class="space-y-1 text-xs">
                    <div class="flex justify-between">
                      <span class="text-gray-500">정확도</span>
                      <span class="font-medium">{{
                        selectedMessageFeedback.pronunciation_details.accuracy_score?.toFixed(0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">유창성</span>
                      <span class="font-medium">{{
                        selectedMessageFeedback.pronunciation_details.fluency_score?.toFixed(0) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-500">운율</span>
                      <span class="font-medium">{{
                        selectedMessageFeedback.pronunciation_details.prosody_score?.toFixed(0) }}</span>
                    </div>
                  </div>
                </div>

                <!-- Word-level scores -->
                <div class="flex flex-wrap gap-2">
                  <span v-for="(word, idx) in selectedMessageFeedback.pronunciation_details.words" :key="idx"
                    class="px-2 py-1 rounded-lg text-sm font-medium border transition-colors cursor-help" :class="[
                      word.accuracy_score >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                        word.accuracy_score >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                    ]" :title="`Score: ${word.accuracy_score?.toFixed(0)}`">
                    {{ word.word }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Pronunciation Feedback Text (from GPT) -->
            <div v-if="selectedMessageFeedback.pronunciation_feedback?.length" class="space-y-3">
              <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MicrophoneIcon class="w-4 h-4 text-purple-500" />
                발음 피드백
              </h3>
              <div class="bg-purple-50 border border-purple-100 rounded-xl p-4 space-y-2">
                <div v-for="(tip, idx) in selectedMessageFeedback.pronunciation_feedback" :key="idx"
                  class="flex gap-2 text-sm text-gray-700">
                  <span class="text-purple-500">•</span>
                  <span>{{ tip }}</span>
                </div>
              </div>
            </div>
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
  from {
    opacity: 0;
    transform: translateY(5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
