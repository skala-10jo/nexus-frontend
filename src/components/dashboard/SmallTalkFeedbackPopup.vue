<script setup>
/**
 * Small Talk 피드백 팝업 컴포넌트
 *
 * 메시지 클릭 시 중앙에 뜨는 모달 팝업 형태.
 */
import {
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  MicrophoneIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  /** 팝업 표시 여부 */
  isOpen: {
    type: Boolean,
    default: false
  },
  /** 사용자 메시지 목록 */
  userMessages: {
    type: Array,
    default: () => []
  },
  /** 선택된 메시지 인덱스 */
  selectedIndex: {
    type: Number,
    default: 0
  },
  /** 선택된 메시지 피드백 */
  feedback: {
    type: Object,
    default: null
  },
  /** 피드백 로딩 중 */
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select-message'])

/**
 * 이전 메시지로 이동
 */
function prevMessage() {
  if (props.selectedIndex > 0) {
    emit('select-message', props.selectedIndex - 1)
  }
}

/**
 * 다음 메시지로 이동
 */
function nextMessage() {
  if (props.selectedIndex < props.userMessages.length - 1) {
    emit('select-message', props.selectedIndex + 1)
  }
}

/**
 * 단어 점수에 따른 스타일 클래스 반환
 */
function getWordScoreClass(score) {
  if (score >= 80) {
    return 'bg-green-100 text-green-700 border-green-200'
  } else if (score >= 60) {
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  } else {
    return 'bg-red-100 text-red-700 border-red-200'
  }
}
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black/50 z-40"
        @click="emit('close')"
      ></div>
    </Transition>

    <!-- Popup -->
    <Transition name="popup">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="bg-white rounded-2xl shadow-2xl max-h-[80vh] w-full max-w-md flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 class="font-bold text-gray-900 flex items-center gap-2">
            <ChartBarIcon class="w-5 h-5 text-blue-600" />
            피드백
          </h3>
          <button
            @click="emit('close')"
            class="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Loading State -->
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-8 text-gray-400">
            <div class="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p class="text-sm">피드백 생성 중...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="!feedback" class="text-center py-8 text-gray-400">
            <ChartBarIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p class="text-sm">메시지를 선택하면 피드백을 볼 수 있어요</p>
          </div>

          <!-- Feedback Content -->
          <div v-else class="space-y-4">
            <!-- Message Navigator -->
            <div class="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
              <button
                @click="prevMessage"
                :disabled="selectedIndex <= 0"
                class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
              </button>
              <span class="text-sm font-bold text-gray-700">
                메시지 {{ selectedIndex + 1 }} / {{ userMessages.length }}
              </span>
              <button
                @click="nextMessage"
                :disabled="selectedIndex >= userMessages.length - 1"
                class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronRightIcon class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <!-- Original Message -->
            <div class="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">나의 메시지</p>
              <p class="text-gray-900 font-medium text-sm">{{ userMessages[selectedIndex]?.message }}</p>
            </div>

            <!-- Scores -->
            <div v-if="feedback.score !== undefined" class="grid grid-cols-2 gap-3">
              <div class="bg-white border border-gray-100 rounded-xl p-3 text-center shadow-sm">
                <div class="text-2xl font-black text-blue-600 mb-0.5">{{ feedback.score }}</div>
                <div class="text-xs font-bold text-gray-400 uppercase">종합</div>
              </div>
              <div class="bg-white border border-gray-100 rounded-xl p-3 space-y-1.5 shadow-sm">
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500">문법</span>
                  <span class="font-bold text-gray-900">{{ feedback.score_breakdown?.grammar }}/10</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500">어휘</span>
                  <span class="font-bold text-gray-900">{{ feedback.score_breakdown?.vocabulary }}/10</span>
                </div>
                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-500">유창성</span>
                  <span class="font-bold text-gray-900">{{ feedback.score_breakdown?.fluency }}/10</span>
                </div>
              </div>
            </div>

            <!-- Grammar Corrections -->
            <div class="space-y-2">
              <h4 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ExclamationCircleIcon v-if="feedback.grammar_corrections?.length" class="w-4 h-4 text-amber-500" />
                <CheckCircleIcon v-else class="w-4 h-4 text-emerald-500" />
                문법 교정
              </h4>
              <div v-if="feedback.grammar_corrections?.length" class="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                <div v-for="(correction, idx) in feedback.grammar_corrections" :key="idx" class="flex gap-2 text-sm text-gray-700">
                  <span class="text-amber-500">•</span>
                  <span>{{ correction }}</span>
                </div>
              </div>
              <div v-else class="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p class="text-sm text-emerald-700 font-medium">문법을 정확하게 사용하셨어요!</p>
              </div>
            </div>

            <!-- Suggestions -->
            <div v-if="feedback.suggestions?.length" class="space-y-2">
              <h4 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <LightBulbIcon class="w-4 h-4 text-blue-500" />
                개선 제안
              </h4>
              <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-2">
                <div v-for="(suggestion, idx) in feedback.suggestions" :key="idx" class="flex gap-2 text-sm text-gray-700">
                  <span class="text-blue-500">•</span>
                  <span>{{ suggestion }}</span>
                </div>
              </div>
            </div>
            <!-- Pronunciation Score (발음 평가 결과가 있을 때만) -->
            <div v-if="feedback.pronunciation_details" class="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm">
              <div class="flex items-center gap-2 mb-3">
                <MicrophoneIcon class="w-4 h-4 text-purple-600" />
                <span class="text-xs font-bold text-purple-700 uppercase">발음 평가</span>
              </div>

              <!-- Score Summary -->
              <div class="flex items-center gap-6 mb-4">
                <!-- 전체 점수 -->
                <div class="text-center">
                  <div class="text-3xl font-black text-purple-600">{{ Math.round(feedback.pronunciation_details.pronunciation_score) }}</div>
                  <div class="text-xs text-purple-400 font-medium">전체 점수</div>
                </div>
                <!-- 상세 점수 -->
                <div class="flex-1 space-y-1">
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500">정확도</span>
                    <span class="font-bold text-gray-700">{{ Math.round(feedback.pronunciation_details.accuracy_score) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500">유창성</span>
                    <span class="font-bold text-gray-700">{{ Math.round(feedback.pronunciation_details.fluency_score) }}</span>
                  </div>
                  <div class="flex justify-between items-center text-xs">
                    <span class="text-gray-500">운율</span>
                    <span class="font-bold text-gray-700">{{ Math.round(feedback.pronunciation_details.prosody_score) }}</span>
                  </div>
                </div>
              </div>

              <!-- 단어별 발음 평가 -->
              <div v-if="feedback.pronunciation_details.words?.length" class="flex flex-wrap gap-2">
                <span
                  v-for="(word, idx) in feedback.pronunciation_details.words"
                  :key="idx"
                  class="px-3 py-1.5 rounded-lg text-sm font-medium border"
                  :class="getWordScoreClass(word.accuracy_score)"
                >
                  {{ word.word }}
                </span>
              </div>
            </div>
            <!-- Pronunciation Feedback -->
            <div v-if="feedback.pronunciation_feedback?.length" class="space-y-2">
              <h4 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                <MicrophoneIcon class="w-4 h-4 text-purple-500" />
                발음 피드백
              </h4>
              <div class="bg-purple-50 border border-purple-100 rounded-xl p-3 space-y-2">
                <div v-for="(tip, idx) in feedback.pronunciation_feedback" :key="idx" class="flex gap-2 text-sm text-gray-700">
                  <span class="text-purple-500">•</span>
                  <span>{{ tip }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.popup-enter-active,
.popup-leave-active {
  transition: all 0.2s ease;
}

.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
