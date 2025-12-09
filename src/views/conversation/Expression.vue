<template>
  <div class="h-full flex flex-col relative">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Biz 표현 학습</h1>
          <p class="text-sm text-gray-500 font-medium mt-0.5">
            멋진 비즈니스 맨이 되는 법
          </p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden bg-gray-50/50">
      <div class="w-full h-full overflow-y-auto px-4 py-4 md:px-8 md:py-8 pb-24 md:pb-8">
        <div class="max-w-[1920px] mx-auto">

          <!-- Progress Indicator -->
          <div v-if="currentView !== 'selection'"
            class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
            <div class="flex items-center gap-4">
              <button @click="handleBackButton" class="flex-shrink-0 text-gray-600 hover:text-gray-800 transition">
                <ChevronLeftIcon class="w-5 h-5" />
              </button>
              <div class="flex-shrink-0 flex items-center gap-2">
                <span class="text-base font-bold text-gray-900">{{ selectedUnit }}</span>
                <span class="text-gray-300">/</span>
                <span class="px-3 py-1 bg-blue-50 text-blue-700 text-base font-bold rounded-lg">{{ selectedChapter }}</span>
              </div>
              <!-- Session Progress Bar -->
              <div v-if="currentView === 'practice'" class="flex-1 flex items-center gap-3">
                <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 rounded-full transition-all duration-300"
                    :style="{ width: `${(practiceCompletedCount / currentSessionExpressions.length) * 100}%` }"></div>
                </div>
                <button v-if="allPracticeCompleted" @click="handleGoToQuiz"
                  class="flex-shrink-0 px-4 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition flex items-center gap-1">
                  <AcademicCapIcon class="w-4 h-4" />
                  퀴즈
                </button>
              </div>
            </div>
          </div>

          <!-- View: Unit/Chapter Selection -->
          <div v-if="currentView === 'selection'">
            <ExpressionUnitGrid :units="units" :unit-chapters="unitChapters"
              :get-progress-bar-color="getProgressBarColor" @select-chapter="selectChapterDirect" />

            <!-- Error State -->
            <div v-if="error" class="flex justify-center items-center py-12">
              <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p class="text-red-600 font-medium">{{ error }}</p>
                <button @click="fetchUnits"
                  class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                  다시 시도
                </button>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          </div>

          <!-- View: Session Selection -->
          <ExpressionSessionSelect v-else-if="currentView === 'sessionSelect'" :sessions="sessions"
            :total-expressions="allExpressions.length" :all-sessions-completed="allSessionsCompleted"
            @start-session="handleStartSession" />

          <!-- View: Pronunciation Practice -->
          <div v-else-if="currentView === 'practice'" class="relative">
            <!-- 매칭 사전 계산 로딩 오버레이 -->
            <div v-if="isPrecomputingMatches" class="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center rounded-2xl">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3"></div>
              <p class="text-gray-700 font-medium">예문 하이라이트 준비 중...</p>
              <p class="text-gray-500 text-sm mt-1">{{ precomputeProgress }}%</p>
            </div>
            <ExpressionPracticeCard :expression="currentExpression"
              :current-index="currentExpressionIndex" :total-count="currentSessionExpressions.length"
              :practice-completed="practiceCompletedForCurrent" :all-practice-completed="allPracticeCompleted"
              :is-last-expression="currentExpressionIndex === currentSessionExpressions.length - 1"
              :tts-loading="ttsLoading" :is-recording="isRecording" :format-meaning="formatMeaning"
              :highlight-expression="highlightExpression"
              @play-tts="playTTS" @start-practice="handleStartPractice" @prev="prevExpression" @next="nextExpression"
              @go-to-quiz="handleGoToQuiz" />
          </div>

          <!-- View: Quiz -->
          <div v-else-if="currentView === 'quiz'" class="relative">
            <!-- 퀴즈 생성 로딩 오버레이 -->
            <div v-if="isGeneratingQuiz" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center">
              <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-3"></div>
              <p class="text-gray-700 font-medium">퀴즈 생성 중...</p>
              <p class="text-gray-500 text-sm mt-1">AI가 문제를 분석하고 있습니다</p>
            </div>
            <ExpressionQuizCard v-else :question="currentQuizQuestion"
              :current-index="currentQuizIndex" :total-count="quizQuestions.length" :correct-count="quizCorrectCount"
              v-model:user-answer="userAnswer" :answer-status="answerStatus" :show-hint="showHint"
              :is-last-question="currentQuizIndex >= quizQuestions.length - 1" @check-answer="checkAnswer"
              @next-quiz="nextQuiz" @complete-session="handleCompleteSession" @toggle-hint="showHint = !showHint" />
          </div>

          <!-- Session Complete Modal -->
          <ExpressionCompletionModal :show="showCompletionModal" :session-index="currentSessionIndex"
            :expression-count="currentSessionExpressions.length" :correct-count="quizCorrectCount"
            :total-count="quizQuestions.length" :has-next-session="hasNextSession" @next-session="handleNextSession"
            @back-to-session-select="handleBackToSessionSelect" />

          <!-- Recording Modal -->
          <ExpressionRecordingModal :show="showRecordingModal" :reference-text="referenceText"
            :is-recording="isRecording" :recording-status="recordingStatus" :pronunciation-result="pronunciationResult"
            :selected-word-index="selectedWordIndex" :recorded-audio-url="recordedAudioUrl"
            :is-playing-recording="isPlayingRecording" :get-score-color-class="getScoreColorClass"
            :get-phoneme-color-class="getPhonemeColorClass" @close="closeRecordingModal"
            @start-recording="handleStartRecording" @stop-recording="stopRecording" @play-recording="playRecordedAudio"
            @stop-playing="stopPlayingRecordedAudio" @toggle-phoneme="togglePhonemeView"
            @mark-complete="handleMarkPracticeComplete" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, AcademicCapIcon } from '@heroicons/vue/24/outline'

// Components
import ExpressionUnitGrid from '@/components/conversation/expression/ExpressionUnitGrid.vue'
import ExpressionSessionSelect from '@/components/conversation/expression/ExpressionSessionSelect.vue'
import ExpressionPracticeCard from '@/components/conversation/expression/ExpressionPracticeCard.vue'
import ExpressionQuizCard from '@/components/conversation/expression/ExpressionQuizCard.vue'
import ExpressionRecordingModal from '@/components/conversation/expression/ExpressionRecordingModal.vue'
import ExpressionCompletionModal from '@/components/conversation/expression/ExpressionCompletionModal.vue'

// Composables
import { useExpressionPage } from '@/composables/conversation/useExpressionPage'
import { useExpressionPractice } from '@/composables/conversation/useExpressionPractice'
import { useExpressionQuiz } from '@/composables/conversation/useExpressionQuiz'
import { useExpressionRecording } from '@/composables/conversation/useExpressionRecording'

// Page Logic
const {
  currentView,
  units,
  selectedUnit,
  selectedChapter,
  unitChapters,
  loading,
  error,
  allExpressions,
  sessions,
  currentSessionIndex,
  currentExpressionIndex,
  currentSessionExpressions,
  currentExpression,
  allSessionsCompleted,
  hasNextSession,
  isPrecomputingMatches,
  precomputeProgress,
  fetchUnits,
  selectChapterDirect,
  startSession,
  handleBackButton,
  goBackToSessionSelect,
  markSessionCompleted,
  goToNextSession,
  prevExpression,
  nextExpression,
  formatMeaning,
  highlightExpression,
  getProgressBarColor
} = useExpressionPage()

// Practice Logic
const {
  practiceCompletedSet,
  ttsLoading,
  practiceCompletedForCurrent,
  practiceCompletedCount,
  allPracticeCompleted,
  playTTS,
  markPracticeComplete,
  resetPractice
} = useExpressionPractice(currentSessionExpressions, currentExpression)

// Quiz Logic
const {
  quizQuestions,
  currentQuizIndex,
  userAnswer,
  answerStatus,
  showHint,
  quizCorrectCount,
  showCompletionModal,
  isGeneratingQuiz,
  currentQuizQuestion,
  goToQuiz,
  checkAnswer,
  nextQuiz,
  completeSession,
  resetQuiz
} = useExpressionQuiz(currentSessionExpressions, formatMeaning)

// Recording Logic
const {
  showRecordingModal,
  isRecording,
  recordingStatus,
  referenceText,
  pronunciationResult,
  selectedWordIndex,
  recordedAudioUrl,
  isPlayingRecording,
  startPronunciationPractice,
  startRecording,
  stopRecording,
  playRecordedAudio,
  stopPlayingRecordedAudio,
  closeRecordingModal,
  togglePhonemeView,
  getScoreColorClass,
  getPhonemeColorClass
} = useExpressionRecording()

// Event Handlers
const handleStartSession = (sessionIndex) => {
  resetPractice()
  resetQuiz()
  startSession(sessionIndex)
}

const handleGoToQuiz = () => {
  currentView.value = 'quiz'
  goToQuiz()
}

const handleStartPractice = (type, exampleIndex) => {
  startPronunciationPractice(type, exampleIndex, currentExpression.value)
}

const handleStartRecording = () => {
  startRecording(currentExpression.value.id)
}

const handleMarkPracticeComplete = () => {
  markPracticeComplete(currentExpression.value.id)
  closeRecordingModal()
}

const handleCompleteSession = async () => {
  const expressionIds = currentSessionExpressions.value.map(e => e.id)
  await completeSession(expressionIds, () => {
    markSessionCompleted()
    fetchUnits()
  })
}

const handleNextSession = () => {
  showCompletionModal.value = false
  resetPractice()
  resetQuiz()
  goToNextSession()
}

const handleBackToSessionSelect = () => {
  showCompletionModal.value = false
  resetPractice()
  resetQuiz()
  goBackToSessionSelect()
}

// Lifecycle
onMounted(() => {
  fetchUnits()
})

onUnmounted(() => {
  closeRecordingModal()
})
</script>
