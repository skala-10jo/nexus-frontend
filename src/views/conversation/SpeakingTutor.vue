<template>
  <div class="h-full flex flex-col relative">
    <!-- Header (List/Home View) -->
    <div
      v-if="currentView === 'list'"
      class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10"
    >
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900">AI 실전 회화 피드백</h1>
            <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ sessions.length }}</span>
          </div>
          <p class="text-sm text-gray-500 font-medium mt-0.5">실제 대화를 분석하고, AI와 함께 더 나은 표현을 배워보세요</p>
        </div>
        <button
          @click="openUploadModal"
          class="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          오디오 업로드
        </button>
      </div>
    </div>

    <!-- Header (Results View) -->
    <div
      v-else-if="currentView === 'results'"
      class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-4 border-b border-gray-100"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="backToList"
            class="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ currentSession?.originalFilename || '분석 결과' }}</h2>
            <p class="text-sm text-gray-500">화자 {{ speakers.length }}명 · 발화 {{ utterances.length }}개</p>
          </div>
        </div>
        <button
          @click="startLearningMode"
          class="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <AcademicCapIcon class="w-4 h-4" />
          학습 모드
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- List View -->
      <div v-if="currentView === 'list'" class="flex-1 overflow-y-auto bg-white p-4 md:p-8">
        <!-- Mobile Upload Button -->
        <button
          @click="openUploadModal"
          class="md:hidden w-full mb-4 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-gray-900/20"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          오디오 업로드
        </button>

        <!-- Loading State -->
        <div v-if="sessionsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <!-- Session Grid -->
        <div v-else-if="sessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SpeakingSessionCard
            v-for="session in sessions"
            :key="session.id"
            :session="session"
            @select="handleSelectSession"
            @delete="handleDeleteSession"
          />
        </div>

        <!-- Empty State -->
        <SpeakingEmptyState v-else @upload="openUploadModal" />
      </div>

      <!-- Analysis in Progress -->
      <SpeakingAnalysisProgress
        v-else-if="currentView === 'analyzing'"
        :progress="analysisProgress"
        :message="analysisMessage"
        @back-to-list="backToList"
      />

      <!-- Analysis Results -->
      <div v-else-if="currentView === 'results'" class="flex-1 flex flex-col md:flex-row gap-0 md:gap-6 p-0 md:p-6 overflow-hidden relative">
        <!-- Mobile Feedback Backdrop -->
        <div
          v-if="showMobileFeedback"
          class="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          @click="closeMobileFeedback"
        ></div>

        <!-- Left Panel: Transcript Timeline -->
        <SpeakingTranscriptPanel
          :speakers="speakers"
          :filtered-utterances="filteredUtterances"
          :selected-speakers="selectedSpeakers"
          :selected-utterance="selectedUtterance"
          :editing-speaker-id="editingSpeakerId"
          :editing-speaker-label="editingSpeakerLabel"
          :is-saving-speaker-label="isSavingSpeakerLabel"
          @toggle-speaker-filter="toggleSpeakerFilter"
          @show-all-speakers="showAllSpeakers"
          @start-edit-speaker="startEditSpeaker"
          @save-speaker-label="saveSpeakerLabel"
          @cancel-edit-speaker="cancelEditSpeaker"
          @select-utterance="selectUtterance"
          @update:editingSpeakerLabel="editingSpeakerLabel = $event"
        />

        <!-- Right Panel: Feedback -->
        <SpeakingFeedbackPanel
          :selected-utterance="selectedUtterance"
          :is-loading-feedback="isLoadingFeedback"
          :show-mobile-feedback="showMobileFeedback"
          @close="closeMobileFeedback"
          @request-feedback="requestFeedback"
          @go-to-learning="goToLearningWithUtterance"
        />
      </div>

      <!-- Learning Mode -->
      <SpeakingLearningMode
        v-else-if="currentView === 'learning'"
        :learning-items="learningItems"
        :current-learning-index="currentLearningIndex"
        :current-learning-item="currentLearningItem"
        :is-recording="learningVoice.isRecording.value"
        :is-connecting="learningVoice.isConnecting.value"
        :recording-time="learningVoice.recordingTime.value"
        :interim-text="learningVoice.interimText.value"
        :recognized-text="learningVoice.recognizedText.value"
        :is-assessing="learningVoice.isAssessing.value"
        :assessment-result="learningVoice.assessmentResult.value"
        :assessment-error="learningVoice.assessmentError.value"
        :formatted-feedback="learningVoice.formattedFeedback.value"
        @exit="exitLearningMode"
        @prev="prevLearningItem"
        @next="nextLearningItem"
        @speak-text="speakText"
        @toggle-recording="toggleRecording"
        @reset-to-first="currentLearningIndex = 0"
      />
    </div>

    <!-- Upload Modal -->
    <AudioUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      @close="closeUploadModal"
      @upload="handleUpload"
    />

    <!-- Error Toast -->
    <div
      v-if="errorMessage"
      class="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50"
    >
      <ExclamationCircleIcon class="w-5 h-5" />
      <span>{{ errorMessage }}</span>
      <button @click="clearError" class="ml-2 hover:opacity-75">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
/**
 * Speaking Tutor 페이지
 *
 * @description 레이아웃 조립 및 컴포넌트 연결만 담당
 */
import {
  AcademicCapIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/outline'

// Components
import AudioUploadModal from '@/components/conversation/AudioUploadModal.vue'
import SpeakingSessionCard from '@/components/conversation/SpeakingSessionCard.vue'
import SpeakingEmptyState from '@/components/conversation/SpeakingEmptyState.vue'
import SpeakingAnalysisProgress from '@/components/conversation/SpeakingAnalysisProgress.vue'
import SpeakingTranscriptPanel from '@/components/conversation/SpeakingTranscriptPanel.vue'
import SpeakingFeedbackPanel from '@/components/conversation/SpeakingFeedbackPanel.vue'
import SpeakingLearningMode from '@/components/conversation/SpeakingLearningMode.vue'

// Composable
import { useSpeakingTutor } from '@/composables/conversation/useSpeakingTutor'

// Composable로 모든 로직 위임
const {
  // View State
  currentView,
  showUploadModal,
  showMobileFeedback,
  uploadModalRef,

  // Analysis State
  currentSession,
  analysisProgress,
  analysisMessage,

  // Results State
  speakers,
  utterances,
  selectedSpeakers,
  selectedUtterance,
  isLoadingFeedback,

  // Speaker Edit State
  editingSpeakerId,
  editingSpeakerLabel,
  isSavingSpeakerLabel,

  // History State
  sessions,
  sessionsLoading,

  // Learning Mode State
  learningItems,
  currentLearningIndex,

  // Learning Voice
  learningVoice,

  // Error State
  errorMessage,

  // Computed
  filteredUtterances,
  currentLearningItem,

  // Session Management
  handleSelectSession,
  handleDeleteSession,

  // Upload & Analysis
  handleUpload,
  backToList,

  // Speaker Management
  toggleSpeakerFilter,
  showAllSpeakers,
  startEditSpeaker,
  cancelEditSpeaker,
  saveSpeakerLabel,

  // Utterance & Feedback
  selectUtterance,
  requestFeedback,

  // Learning Mode
  startLearningMode,
  exitLearningMode,
  goToLearningWithUtterance,
  prevLearningItem,
  nextLearningItem,

  // Voice & Recording
  speakText,
  toggleRecording,

  // UI Actions
  clearError,
  closeMobileFeedback,
  openUploadModal,
  closeUploadModal
} = useSpeakingTutor()
</script>

<style scoped>
.font-nanum-round-eb {
  font-family: 'NanumSquareRound', sans-serif;
  font-weight: 800;
}
</style>
