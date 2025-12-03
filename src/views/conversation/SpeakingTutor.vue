<template>
  <div class="h-full flex flex-col relative">
    <!-- Header (List/Home View) -->
    <div
      v-if="currentView === 'list'"
      class="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between px-8 border-b border-gray-100"
    >
      <div class="flex flex-col">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-gray-800 font-nanum-round-eb">AI 스피킹 튜터</h2>
          <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ sessions.length }}</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">실제 대화를 분석하고, AI와 함께 더 나은 표현을 배워보세요</p>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="showUploadModal = true"
          class="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
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
    <div class="flex-1 flex overflow-hidden" :class="{ 'pt-20': currentView === 'list' }">
      <!-- List View -->
      <div v-if="currentView === 'list'" class="flex-1 overflow-y-auto bg-white p-8">
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
        <SpeakingEmptyState v-else @upload="showUploadModal = true" />
      </div>

      <!-- Analysis in Progress -->
      <div v-else-if="currentView === 'analyzing'" class="flex-1 flex items-center justify-center bg-gray-50/50 p-8">
        <div class="max-w-md w-full">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div class="w-20 h-20 mx-auto mb-6 relative">
              <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin"
                style="border-right-color: transparent; border-bottom-color: transparent;"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-blue-600">{{ analysisProgress }}%</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">녹음 파일 분석 중</h3>
            <p class="text-gray-500 mb-6">{{ analysisMessage }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${analysisProgress}%` }"
              ></div>
            </div>
            <button
              @click="backToList"
              class="mt-6 text-sm text-gray-500 hover:text-gray-700"
            >
              백그라운드에서 진행 (목록으로 돌아가기)
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-else-if="currentView === 'results'" class="flex-1 flex gap-6 p-6 overflow-hidden">
        <!-- Left Panel: Transcript Timeline -->
        <div class="w-[55%] min-w-0 flex flex-col gap-4 overflow-hidden">
          <!-- Speaker Filter -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
              <h4 class="text-sm font-semibold text-gray-900">화자</h4>
              <button
                @click="showAllSpeakers"
                class="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                전체 보기
              </button>
            </div>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="speaker in speakers"
                :key="speaker.id"
                @click="toggleSpeakerFilter(speaker.id)"
                class="px-3 py-1.5 rounded-full text-sm font-medium transition"
                :class="selectedSpeakers.includes(speaker.id)
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                  : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'"
              >
                <span
                  class="inline-block w-2 h-2 rounded-full mr-1.5"
                  :class="getSpeakerColor(speaker.id)"
                ></span>
                {{ speaker.label }} ({{ speaker.utteranceCount }})
              </button>
            </div>
          </div>

          <!-- Transcript List -->
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex-1 flex flex-col min-h-0">
            <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <h4 class="text-sm font-semibold text-gray-900">대화 타임라인</h4>
              <span class="text-xs text-gray-500">{{ filteredUtterances.length }}개 발화</span>
            </div>
            <div class="flex-1 overflow-y-auto">
              <div
                v-for="utterance in filteredUtterances"
                :key="utterance.id"
                @click="selectUtterance(utterance)"
                class="px-4 py-3 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50"
                :class="selectedUtterance?.id === utterance.id ? 'bg-blue-50' : ''"
              >
                <div class="flex items-start gap-3">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    :class="getSpeakerBgColor(utterance.speakerId)"
                  >
                    <UserIcon class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                      <span class="text-sm font-medium text-gray-900">{{ utterance.speakerLabel }}</span>
                      <span class="text-xs text-gray-400">{{ formatTime(utterance.startTimeMs) }}</span>
                    </div>
                    <p class="text-sm text-gray-700">{{ utterance.text }}</p>
                    <div v-if="utterance.hasFeedback" class="mt-2 flex items-center gap-2">
                      <span class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        점수: {{ utterance.feedback?.score || 0 }}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Feedback -->
        <div class="w-[45%] flex-shrink-0 overflow-hidden">
          <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-full overflow-y-auto flex flex-col">
            <template v-if="selectedUtterance">
              <div class="flex items-center justify-between mb-5">
                <h4 class="text-base font-bold text-gray-900">피드백</h4>
                <button
                  v-if="!selectedUtterance.hasFeedback"
                  @click="requestFeedback"
                  :disabled="isLoadingFeedback"
                  class="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  <SparklesIcon class="w-4 h-4" />
                  {{ isLoadingFeedback ? '분석 중...' : '피드백 받기' }}
                </button>
              </div>

              <!-- Feedback Content -->
              <template v-if="selectedUtterance.feedback">
                <!-- Score -->
                <div class="mb-4">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-sm font-medium text-gray-700">종합 점수</span>
                    <span class="text-xl font-bold" :class="getScoreColor(selectedUtterance.feedback.score)">
                      {{ selectedUtterance.feedback.score }}/10
                    </span>
                  </div>
                  <div class="grid grid-cols-4 gap-1.5">
                    <div
                      v-for="(value, key) in selectedUtterance.feedback.scoreBreakdown"
                      :key="key"
                      class="text-center p-1.5 bg-gray-50 rounded-lg"
                    >
                      <p class="text-xs text-gray-500">{{ getScoreLabel(key) }}</p>
                      <p class="text-sm font-bold text-gray-900">{{ value }}</p>
                    </div>
                  </div>
                </div>

                <!-- Grammar Corrections -->
                <div v-if="selectedUtterance.feedback.grammarCorrections?.length" class="mb-4">
                  <h5 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <ExclamationTriangleIcon class="w-4 h-4 text-yellow-500" />
                    문법 교정
                  </h5>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(correction, idx) in selectedUtterance.feedback.grammarCorrections"
                      :key="idx"
                      class="text-sm text-gray-600 pl-3 border-l-2 border-yellow-300"
                    >
                      {{ correction }}
                    </li>
                  </ul>
                </div>

                <!-- Suggestions -->
                <div v-if="selectedUtterance.feedback.suggestions?.length" class="mb-4">
                  <h5 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <LightBulbIcon class="w-4 h-4 text-blue-500" />
                    제안
                  </h5>
                  <ul class="space-y-1.5">
                    <li
                      v-for="(suggestion, idx) in selectedUtterance.feedback.suggestions"
                      :key="idx"
                      class="text-sm text-gray-600 pl-3 border-l-2 border-blue-300"
                    >
                      {{ suggestion }}
                    </li>
                  </ul>
                </div>

                <!-- Improved Sentence -->
                <div v-if="selectedUtterance.feedback.improvedSentence" class="mb-5">
                  <h5 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5">
                    <CheckBadgeIcon class="w-4 h-4 text-green-500" />
                    개선된 문장
                  </h5>
                  <div class="p-3 bg-green-50 rounded-lg border border-green-100">
                    <p class="text-sm text-green-800">{{ selectedUtterance.feedback.improvedSentence }}</p>
                  </div>
                </div>

                <!-- Go to Learning Button -->
                <div class="mt-auto pt-4 border-t border-gray-100">
                  <button
                    @click="goToLearningWithUtterance"
                    class="w-full py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-300 flex items-center justify-center gap-2"
                  >
                    <AcademicCapIcon class="w-5 h-5" />
                    이 문장 학습하러 가기
                  </button>
                </div>
              </template>

              <template v-else>
                <div class="text-center py-6 text-gray-400">
                  <SparklesIcon class="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p class="text-sm">"피드백 받기"를 클릭하여 이 발화를 분석하세요</p>
                </div>
              </template>
            </template>

            <template v-else>
              <div class="text-center py-8 text-gray-400">
                <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p class="font-medium text-sm">발화를 선택하세요</p>
                <p class="text-xs mt-1">메시지를 클릭하면 피드백 옵션을 볼 수 있습니다</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Learning Mode -->
      <div v-else-if="currentView === 'learning'" class="flex-1 overflow-y-auto p-8">
        <div class="max-w-4xl mx-auto">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <!-- Learning Mode Header -->
            <div class="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 class="text-xl font-bold text-gray-900">학습 모드</h3>
                <p class="text-sm text-gray-500 mt-1">교정된 문장을 연습해보세요</p>
              </div>
              <button
                @click="exitLearningMode"
                class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition flex items-center gap-2"
              >
                <ArrowLeftIcon class="w-4 h-4" />
                대화 기록으로 돌아가기
              </button>
            </div>

            <!-- Progress -->
            <div class="px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-700">
                  진행률: {{ currentLearningIndex + 1 }} / {{ learningItems.length }}
                </span>
                <span class="text-sm text-gray-500">
                  {{ Math.round((currentLearningIndex / learningItems.length) * 100) }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-green-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${((currentLearningIndex + 1) / learningItems.length) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Current Learning Item -->
            <div v-if="currentLearningItem" class="p-8">
              <!-- Original Text -->
              <div class="mb-8">
                <h4 class="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <ExclamationCircleIcon class="w-4 h-4 text-red-500" />
                  원래 문장
                </h4>
                <div class="p-4 bg-red-50 border border-red-100 rounded-xl">
                  <p class="text-lg text-red-800">{{ currentLearningItem.originalText }}</p>
                </div>
              </div>

              <!-- Grammar Points -->
              <div v-if="currentLearningItem.grammarPoints?.length" class="mb-8">
                <h4 class="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <LightBulbIcon class="w-4 h-4 text-yellow-500" />
                  문법 포인트
                </h4>
                <ul class="space-y-2">
                  <li
                    v-for="(point, idx) in currentLearningItem.grammarPoints"
                    :key="idx"
                    class="text-sm text-gray-700 pl-4 border-l-2 border-yellow-300 py-1"
                  >
                    {{ point }}
                  </li>
                </ul>
              </div>

              <!-- Improved Text -->
              <div class="mb-8">
                <h4 class="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                  <CheckBadgeIcon class="w-4 h-4 text-green-500" />
                  교정된 문장
                </h4>
                <div class="p-4 bg-green-50 border border-green-100 rounded-xl flex items-center justify-between">
                  <p class="text-lg text-green-800 font-medium">{{ currentLearningItem.improvedText }}</p>
                  <button
                    @click="speakText(currentLearningItem.improvedText)"
                    class="ml-4 p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition"
                    title="듣기"
                  >
                    <SpeakerWaveIcon class="w-6 h-6" />
                  </button>
                </div>
              </div>

              <!-- Practice Section -->
              <div class="p-6 bg-blue-50 rounded-xl border border-blue-100">
                <h4 class="text-sm font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <MicrophoneIcon class="w-4 h-4" />
                  따라하기 연습
                </h4>
                <div class="flex items-center justify-center gap-4">
                  <button
                    @click="toggleRecording"
                    class="w-16 h-16 rounded-full flex items-center justify-center transition transform hover:scale-105"
                    :class="isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-blue-600 text-white hover:bg-blue-700'"
                  >
                    <MicrophoneIcon class="w-8 h-8" />
                  </button>
                  <div class="text-sm text-blue-700">
                    {{ isRecording ? '녹음 중... 클릭하여 중지' : '버튼을 클릭하여 녹음 시작' }}
                  </div>
                </div>
                <p v-if="recordedText" class="mt-4 text-center text-gray-700">
                  <span class="text-sm text-gray-500">인식된 문장:</span><br />
                  <span class="font-medium">{{ recordedText }}</span>
                </p>
              </div>
            </div>

            <!-- Navigation -->
            <div class="p-6 border-t border-gray-100 flex items-center justify-between">
              <button
                @click="prevLearningItem"
                :disabled="currentLearningIndex === 0"
                class="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <ChevronLeftIcon class="w-5 h-5" />
                이전
              </button>
              <button
                @click="nextLearningItem"
                :disabled="currentLearningIndex >= learningItems.length - 1"
                class="px-6 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                다음
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Completion Card -->
          <div v-if="currentLearningIndex >= learningItems.length - 1 && learningItems.length > 0" class="mt-6 bg-green-50 rounded-xl border border-green-200 p-6 text-center">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckBadgeIcon class="w-8 h-8 text-green-600" />
            </div>
            <h4 class="text-lg font-bold text-green-800 mb-2">모든 학습을 완료했습니다!</h4>
            <p class="text-sm text-green-600 mb-4">계속 연습하여 실력을 향상시키세요.</p>
            <button
              @click="exitLearningMode"
              class="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition"
            >
              대화 기록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <AudioUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      @close="showUploadModal = false"
      @upload="handleUpload"
    />

    <!-- Error Toast -->
    <div
      v-if="errorMessage"
      class="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50"
    >
      <ExclamationCircleIcon class="w-5 h-5" />
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="ml-2 hover:opacity-75">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MicrophoneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  UserIcon
} from '@heroicons/vue/24/outline'
import { speakingTutorService } from '@/services/speakingTutorService'

// Components
import AudioUploadModal from '@/components/conversation/AudioUploadModal.vue'
import SpeakingSessionCard from '@/components/conversation/SpeakingSessionCard.vue'
import SpeakingEmptyState from '@/components/conversation/SpeakingEmptyState.vue'

// State
const currentView = ref('list') // 'list' | 'analyzing' | 'results' | 'learning'
const showUploadModal = ref(false)
const uploadModalRef = ref(null)

// Analysis State
const currentSessionId = ref(null)
const currentSession = ref(null)
const analysisProgress = ref(0)
const analysisMessage = ref('분석을 시작합니다...')
const pollingInterval = ref(null)

// Results State
const speakers = ref([])
const utterances = ref([])
const selectedSpeakers = ref([])
const selectedUtterance = ref(null)
const isLoadingFeedback = ref(false)

// History State
const sessions = ref([])
const sessionsLoading = ref(false)

// Learning Mode State
const learningItems = ref([])
const currentLearningIndex = ref(0)
const isRecording = ref(false)
const recordedText = ref('')
const mediaRecorder = ref(null)

// Error State
const errorMessage = ref(null)

// Computed
const filteredUtterances = computed(() => {
  if (selectedSpeakers.value.length === 0) {
    return utterances.value
  }
  return utterances.value.filter(u => selectedSpeakers.value.includes(u.speakerId))
})

const currentLearningItem = computed(() => {
  if (learningItems.value.length === 0) return null
  return learningItems.value[currentLearningIndex.value] || null
})

// Lifecycle
onMounted(async () => {
  await loadSessionHistory()
})

// Methods
async function loadSessionHistory() {
  sessionsLoading.value = true
  try {
    const result = await speakingTutorService.getSessions(0, 50)
    sessions.value = result.sessions || []
  } catch (error) {
    console.error('Failed to load sessions:', error)
  } finally {
    sessionsLoading.value = false
  }
}

function handleUpload({ file, language }) {
  uploadFile(file, language)
}

async function uploadFile(file, language) {
  try {
    showUploadModal.value = false
    currentView.value = 'analyzing'
    analysisProgress.value = 0
    analysisMessage.value = '파일 업로드 중...'

    const result = await speakingTutorService.uploadAudio(file, language)
    currentSessionId.value = result.sessionId
    analysisMessage.value = '파일이 업로드되었습니다. 분석을 시작합니다...'

    // Start polling for progress
    startPolling()
  } catch (error) {
    console.error('Upload failed:', error)
    errorMessage.value = error.response?.data?.detail || '업로드에 실패했습니다. 다시 시도해주세요.'
    currentView.value = 'list'
    if (uploadModalRef.value) {
      uploadModalRef.value.setError(errorMessage.value)
    }
  }
}

function startPolling() {
  pollingInterval.value = setInterval(async () => {
    try {
      const result = await speakingTutorService.getAnalysis(currentSessionId.value)

      if (result.status === 'COMPLETED') {
        clearInterval(pollingInterval.value)
        analysisProgress.value = 100
        loadResults(result)
      } else if (result.status === 'FAILED') {
        clearInterval(pollingInterval.value)
        errorMessage.value = result.message || '분석에 실패했습니다'
        currentView.value = 'list'
        await loadSessionHistory()
      } else {
        analysisProgress.value = result.progress || 0
        analysisMessage.value = result.message || '처리 중...'
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 2000)
}

function loadResults(result) {
  currentSession.value = result
  speakers.value = result.speakers || []
  utterances.value = result.utterances || []
  selectedSpeakers.value = speakers.value.map(s => s.id)
  currentView.value = 'results'
  loadSessionHistory()
}

async function handleSelectSession(sessionId) {
  try {
    currentSessionId.value = sessionId
    const result = await speakingTutorService.getAnalysis(sessionId)

    if (result.status === 'COMPLETED') {
      loadResults(result)
    } else if (result.status === 'PROCESSING' || result.status === 'PENDING') {
      currentView.value = 'analyzing'
      analysisProgress.value = result.progress || 0
      analysisMessage.value = result.message || '처리 중...'
      startPolling()
    } else {
      errorMessage.value = '세션을 불러올 수 없습니다'
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    errorMessage.value = '세션을 불러올 수 없습니다'
  }
}

async function handleDeleteSession(sessionId) {
  if (!confirm('이 분석 기록을 삭제하시겠습니까?')) return

  try {
    await speakingTutorService.deleteSession(sessionId)
    await loadSessionHistory()
  } catch (error) {
    console.error('Failed to delete session:', error)
    errorMessage.value = '삭제에 실패했습니다'
  }
}

function backToList() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  currentView.value = 'list'
  currentSession.value = null
  speakers.value = []
  utterances.value = []
  selectedUtterance.value = null
  loadSessionHistory()
}

function toggleSpeakerFilter(speakerId) {
  const idx = selectedSpeakers.value.indexOf(speakerId)
  if (idx >= 0) {
    selectedSpeakers.value.splice(idx, 1)
  } else {
    selectedSpeakers.value.push(speakerId)
  }
}

function showAllSpeakers() {
  selectedSpeakers.value = speakers.value.map(s => s.id)
}

function selectUtterance(utterance) {
  selectedUtterance.value = utterance
}

async function requestFeedback() {
  if (!selectedUtterance.value) return

  isLoadingFeedback.value = true
  try {
    const result = await speakingTutorService.generateFeedback(
      selectedUtterance.value.id,
      'business meeting'
    )

    // Update the utterance with feedback
    const idx = utterances.value.findIndex(u => u.id === selectedUtterance.value.id)
    if (idx >= 0) {
      utterances.value[idx] = {
        ...utterances.value[idx],
        hasFeedback: true,
        feedback: result.feedback
      }
      selectedUtterance.value = utterances.value[idx]
    }
  } catch (error) {
    console.error('Feedback generation failed:', error)
    errorMessage.value = '피드백 생성에 실패했습니다'
  } finally {
    isLoadingFeedback.value = false
  }
}

async function startLearningMode() {
  if (!currentSessionId.value) return

  try {
    // Get learning data from API
    const result = await speakingTutorService.getLearningData(
      currentSessionId.value,
      selectedUtterance.value?.speakerId
    )

    learningItems.value = result.learningItems || []
    currentLearningIndex.value = 0
    recordedText.value = ''

    if (learningItems.value.length === 0) {
      // If no learning items, check if we need feedback first
      const utterancesWithFeedback = utterances.value.filter(u => u.hasFeedback)
      if (utterancesWithFeedback.length === 0) {
        errorMessage.value = '피드백을 먼저 생성해주세요. 발화를 선택하고 "피드백 받기" 버튼을 클릭하세요.'
        return
      }

      // Build learning items from feedback
      learningItems.value = utterancesWithFeedback
        .filter(u => u.feedback?.improvedSentence && u.feedback.improvedSentence !== u.text)
        .map(u => ({
          utteranceId: u.id,
          originalText: u.text,
          improvedText: u.feedback.improvedSentence,
          grammarPoints: u.feedback.grammarCorrections || [],
          practiceCount: 0
        }))
    }

    if (learningItems.value.length === 0) {
      errorMessage.value = '학습할 항목이 없습니다. 교정이 필요한 발화가 없습니다.'
      return
    }

    currentView.value = 'learning'
  } catch (error) {
    console.error('Failed to start learning mode:', error)
    errorMessage.value = '학습 모드를 시작할 수 없습니다.'
  }
}

function exitLearningMode() {
  currentView.value = 'results'
  recordedText.value = ''
  isRecording.value = false
}

function goToLearningWithUtterance() {
  if (!selectedUtterance.value?.feedback) return

  // Create learning item for this specific utterance
  const utterance = selectedUtterance.value
  learningItems.value = [{
    utteranceId: utterance.id,
    originalText: utterance.text,
    improvedText: utterance.feedback.improvedSentence || utterance.text,
    grammarPoints: utterance.feedback.grammarCorrections || [],
    practiceCount: 0
  }]
  currentLearningIndex.value = 0
  recordedText.value = ''
  currentView.value = 'learning'
}

function prevLearningItem() {
  if (currentLearningIndex.value > 0) {
    currentLearningIndex.value--
    recordedText.value = ''
  }
}

function nextLearningItem() {
  if (currentLearningIndex.value < learningItems.value.length - 1) {
    currentLearningIndex.value++
    recordedText.value = ''
  }
}

function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    const lang = currentSession.value?.language || 'en-US'
    utterance.lang = lang.split('-')[0] === 'ko' ? 'ko-KR' : 'en-US'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  } else {
    errorMessage.value = '이 브라우저는 음성 합성을 지원하지 않습니다.'
  }
}

async function toggleRecording() {
  if (isRecording.value) {
    // Stop recording
    if (mediaRecorder.value && mediaRecorder.value.state === 'recording') {
      mediaRecorder.value.stop()
    }
    isRecording.value = false
  } else {
    // Start recording
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.value = new MediaRecorder(stream)

      // Use Web Speech API for recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        const recognition = new SpeechRecognition()
        const lang = currentSession.value?.language || 'en-US'
        recognition.lang = lang
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event) => {
          recordedText.value = event.results[0][0].transcript
        }

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          isRecording.value = false
        }

        recognition.onend = () => {
          isRecording.value = false
          stream.getTracks().forEach(track => track.stop())
        }

        recognition.start()
        isRecording.value = true
      } else {
        errorMessage.value = '이 브라우저는 음성 인식을 지원하지 않습니다.'
        stream.getTracks().forEach(track => track.stop())
      }
    } catch (error) {
      console.error('Microphone access error:', error)
      errorMessage.value = '마이크에 접근할 수 없습니다.'
    }
  }
}

// Utility Functions
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function getSpeakerColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function getSpeakerBgColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function getScoreColor(score) {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-yellow-600'
  return 'text-red-600'
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

<style scoped>
.font-nanum-round-eb {
  font-family: 'NanumSquareRound', sans-serif;
  font-weight: 800;
}
</style>
