<template>
  <div class="min-h-full md:h-full flex flex-col bg-gray-50/50 pb-24 md:pb-0 md:overflow-hidden">
    <!-- ==================== LIST VIEW ==================== -->
    <template v-if="currentView === 'list'">
      <!-- Header -->
      <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 flex items-center gap-3">
              영상 번역
              <span v-if="videos.length > 0" class="px-2.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                {{ videos.length }}
              </span>
            </h1>
            <p class="text-sm text-gray-500 font-medium mt-0.5">업로드한 영상의 자막을 추출하고 번역하세요</p>
          </div>
          <button
            @click="showUploadModal = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
          >
            <PlusIcon class="w-5 h-5" />
            영상 업로드
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto">
          <!-- Loading State -->
          <div v-if="isLoadingVideos" class="flex items-center justify-center py-20">
            <ArrowPathIcon class="w-8 h-8 text-blue-600 animate-spin" />
          </div>

          <!-- Video Grid -->
          <div v-else-if="videos.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VideoCard
              v-for="video in videos"
              :key="video.id"
              :video="video"
              @click="selectVideo"
              @delete="handleDeleteVideo"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-20">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <VideoCameraIcon class="w-10 h-10 text-gray-300" />
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">업로드된 영상이 없습니다</h3>
            <p class="text-gray-500 mb-8">영상을 업로드하여 자막 추출 및 번역을 시작하세요</p>
            <button
              @click="showUploadModal = true"
              class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg"
            >
              <PlusIcon class="w-5 h-5" />
              첫 영상 업로드
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== DETAIL VIEW ==================== -->
    <template v-else-if="currentView === 'detail' && selectedVideo">
      <!-- Header -->
      <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <button
              @click="goBackToList"
              class="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              <ArrowLeftIcon class="w-5 h-5" />
              목록으로
            </button>
            <div class="h-6 w-px bg-gray-200"></div>
            <div>
              <h1 class="text-lg font-bold text-gray-900 line-clamp-1">{{ selectedVideo.originalFilename || selectedVideo.fileName }}</h1>
              <div class="flex items-center gap-3 mt-0.5">
                <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ formatFileSize(selectedVideo.fileSize) }}</span>
                <span class="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{{ sourceLang.toUpperCase() }} → {{ targetLang.toUpperCase() }}</span>
              </div>
            </div>
          </div>
          <button @click="handleDeleteVideo(selectedVideo.id)" class="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all">
            <TrashIcon class="w-4 h-4" />
            삭제
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-visible md:overflow-y-auto p-4 md:p-8">
        <div class="max-w-7xl mx-auto space-y-6">
          <!-- Language Config (자막 추출 전까지 표시) -->
          <div v-if="!subtitles.length" class="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
            <div class="flex items-end justify-center gap-3 md:gap-8">
              <!-- Source Language -->
              <div class="flex-1 max-w-[140px] md:max-w-xs space-y-1.5 md:space-y-2">
                <label class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">원본</label>
                <div class="relative" ref="sourceDropdownRef">
                  <button
                    @click="toggleSourceDropdown"
                    type="button"
                    class="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base font-bold transition-all"
                    :class="{ 'border-blue-500 ring-2 ring-blue-100': isSourceDropdownOpen }"
                  >
                    <div class="flex items-center gap-2 md:gap-3">
                      <span class="text-lg md:text-xl">{{ getLanguageFlag(sourceLang) }}</span>
                      <span class="text-gray-900 truncate">{{ getLanguageName(sourceLang) }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                      :class="{ 'rotate-180': isSourceDropdownOpen }"
                    />
                  </button>

                  <!-- Source Dropdown -->
                  <Transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <div
                      v-if="isSourceDropdownOpen"
                      class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <ul class="py-1">
                        <li v-for="lang in languageOptions" :key="`source-${lang.code}`">
                          <button
                            @click="selectSourceLanguage(lang.code)"
                            type="button"
                            class="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base hover:bg-gray-50 transition-colors flex items-center justify-between"
                            :class="sourceLang === lang.code ? 'bg-blue-50/50' : ''"
                            :disabled="lang.code === targetLang"
                          >
                            <div class="flex items-center gap-2 md:gap-3" :class="lang.code === targetLang ? 'opacity-40' : ''">
                              <span class="text-lg md:text-xl">{{ lang.flag }}</span>
                              <span class="font-bold" :class="sourceLang === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                            </div>
                            <svg v-if="sourceLang === lang.code" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Swap Button -->
              <button
                @click="swapLanguages"
                type="button"
                class="pb-2.5 md:pb-3 p-2 rounded-lg hover:bg-blue-50 hover:scale-110 transition-all group"
                title="언어 교환"
              >
                <svg class="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              <!-- Target Language -->
              <div class="flex-1 max-w-[140px] md:max-w-xs space-y-1.5 md:space-y-2">
                <label class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">번역</label>
                <div class="relative" ref="targetDropdownRef">
                  <button
                    @click="toggleTargetDropdown"
                    type="button"
                    class="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base font-bold transition-all"
                    :class="{ 'border-blue-500 ring-2 ring-blue-100': isTargetDropdownOpen }"
                  >
                    <div class="flex items-center gap-2 md:gap-3">
                      <span class="text-lg md:text-xl">{{ getLanguageFlag(targetLang) }}</span>
                      <span class="text-gray-900 truncate">{{ getLanguageName(targetLang) }}</span>
                    </div>
                    <ChevronDownIcon
                      class="w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
                      :class="{ 'rotate-180': isTargetDropdownOpen }"
                    />
                  </button>

                  <!-- Target Dropdown -->
                  <Transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-100"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-100"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <div
                      v-if="isTargetDropdownOpen"
                      class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <ul class="py-1">
                        <li v-for="lang in languageOptions" :key="`target-${lang.code}`">
                          <button
                            @click="selectTargetLanguage(lang.code)"
                            type="button"
                            class="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base hover:bg-gray-50 transition-colors flex items-center justify-between"
                            :class="targetLang === lang.code ? 'bg-blue-50/50' : ''"
                            :disabled="lang.code === sourceLang"
                          >
                            <div class="flex items-center gap-2 md:gap-3" :class="lang.code === sourceLang ? 'opacity-40' : ''">
                              <span class="text-lg md:text-xl">{{ lang.flag }}</span>
                              <span class="font-bold" :class="targetLang === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                            </div>
                            <svg v-if="targetLang === lang.code" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>

          <!-- Project Context Selection (Text.vue 방식과 동일) -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <button @click="glossaryExpanded = !glossaryExpanded" class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors rounded-t-2xl">
              <div class="flex items-center gap-3">
                <BookOpenIcon class="w-5 h-5 text-gray-400" />
                <span class="font-bold text-gray-700">프로젝트 전문용어사전 선택</span>
                <span v-if="selectedProjectId && contextInfo" class="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {{ contextInfo.termsCount }}개 용어
                </span>
              </div>
              <ChevronDownIcon
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                :class="{ 'rotate-180': glossaryExpanded }"
              />
            </button>

            <div v-if="glossaryExpanded" class="p-6 border-t border-gray-100 bg-gray-50/30">
              <ProjectSelector
                v-model="selectedProjectId"
                :projects="projects"
                :context-info="contextInfo"
                @change="onProjectChange"
              />

              <!-- 프로젝트 선택 시 컨텍스트 정보 표시 -->
              <div v-if="selectedProjectId && contextInfo" class="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <div class="flex items-center gap-2 text-blue-700">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span class="text-sm font-medium">
                    프로젝트의 {{ contextInfo.documentsCount }}개 문서에서 {{ contextInfo.termsCount }}개 용어가 번역에 반영됩니다.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Language Selector -->
          <LanguageSelector
            v-if="subtitleData.availableLanguages.length > 0"
            :available-languages="subtitleData.availableLanguages"
            :current-language="currentLanguage"
            @language-change="handleLanguageChange"
          >
            <template #add-language>
              <button
                @click="showAddTranslationModal = true"
                class="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                <PlusIcon class="w-4 h-4" />
                언어 추가
              </button>
            </template>
          </LanguageSelector>

          <!-- Player & Subtitles -->
          <div v-if="displaySubtitles.length > 0" class="flex flex-col lg:flex-row gap-6 h-auto lg:h-[600px]">
            <!-- Player -->
            <div class="flex-1 bg-black rounded-2xl overflow-hidden relative group">
              <video
                ref="videoPlayerRef"
                :src="videoUrl"
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleVideoLoaded"
                class="w-full h-full object-contain"
                controls
              ></video>

              <div v-if="currentSubtitle" class="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[90%] px-6 py-3 bg-black/80 backdrop-blur-sm rounded-xl text-white text-center font-medium text-lg pointer-events-none">
                {{ currentSubtitle.displayText || currentSubtitle.text }}
              </div>
            </div>

            <!-- Subtitle List -->
            <div class="w-full lg:w-96 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
              <div class="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 class="font-bold text-gray-900">자막</h3>
                <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ displaySubtitles.length }}</span>
              </div>

              <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <div
                  v-for="subtitle in displaySubtitles"
                  :key="subtitle.id"
                  class="p-4 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all group"
                  :class="{ 'border-blue-500 bg-blue-50': currentSubtitle?.id === subtitle.id }"
                  @click="seekToSubtitle(subtitle)"
                >
                  <div class="text-xs font-mono text-gray-400 mb-2">{{ formatTime(subtitle.startTime) }}</div>
                  <p class="text-sm text-gray-500 mb-1">{{ subtitle.originalText }}</p>
                  <p v-if="currentLanguage !== subtitleData.originalLanguage" class="text-sm font-bold text-gray-900">
                    {{ subtitle.displayText }}
                  </p>

                  <div v-if="subtitle.detectedTerms?.length > 0" class="flex flex-wrap gap-2 mt-2">
                    <span
                      v-for="(term, idx) in subtitle.detectedTerms"
                      :key="idx"
                      class="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[10px] font-bold border border-green-100"
                      :title="term.definition"
                    >
                      {{ term.koreanTerm || term.matchedText }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-center gap-4 py-4">
            <button
              v-if="!subtitles.length"
              @click="handleExtractSubtitles"
              :disabled="isExtracting"
              class="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ArrowPathIcon v-if="isExtracting" class="w-5 h-5 animate-spin" />
              <SparklesIcon v-else class="w-5 h-5" />
              {{ isExtracting ? '처리 중...' : '자막 추출' }}
            </button>

            <div v-if="isTranslated" class="relative">
              <button
                @click="downloadDropdownOpen = !downloadDropdownOpen"
                class="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <ArrowDownTrayIcon class="w-5 h-5" />
                다운로드
                <ChevronDownIcon class="w-4 h-4 ml-1" />
              </button>

              <div v-if="downloadDropdownOpen" class="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-10">
                <button @click="downloadSubtitle('original')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <DocumentTextIcon class="w-4 h-4" />
                  원본 (SRT)
                </button>
                <button @click="downloadSubtitle('translated')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <LanguageIcon class="w-4 h-4" />
                  번역본 (SRT)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ==================== MODALS ==================== -->
    <!-- Upload Modal -->
    <VideoUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      @close="showUploadModal = false"
      @upload="handleVideoUpload"
    />

    <!-- Add Translation Modal -->
    <AddTranslationModal
      :show="showAddTranslationModal"
      :available-languages="subtitleData.availableLanguages"
      :source-language="subtitleData.originalLanguage"
      :projects="projects"
      @close="showAddTranslationModal = false"
      @translate="handleAddTranslation"
    />

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-4 opacity-0"
      enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform translate-y-4 opacity-0"
    >
      <div v-if="toast.show" class="fixed bottom-8 right-8 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-50" :class="toast.type === 'success' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'">
        <CheckCircleIcon v-if="toast.type === 'success'" class="w-5 h-5 text-green-400" />
        <ExclamationCircleIcon v-else class="w-5 h-5 text-white" />
        <span class="font-medium">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import ProjectSelector from '@/components/translation/ProjectSelector.vue'
import LanguageSelector from '@/components/translation/LanguageSelector.vue'
import AddTranslationModal from '@/components/translation/AddTranslationModal.vue'
import VideoUploadModal from '@/components/translation/VideoUploadModal.vue'
import VideoCard from '@/components/translation/VideoCard.vue'
import {
  getVideos,
  deleteVideo,
  uploadVideo,
  extractSubtitles,
  translateSubtitles,
  getMultilingualSubtitles,
  downloadSubtitles
} from '@/services/videoService'
import { getUserProjects } from '@/services/projectService'
import {
  VideoCameraIcon,
  TrashIcon,
  BookOpenIcon,
  ChevronDownIcon,
  PlusIcon,
  ArrowPathIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  LanguageIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from '@heroicons/vue/24/solid'

const router = useRouter()

// ==================== VIEW STATE ====================
const currentView = ref('list') // 'list' | 'detail'
const selectedVideo = ref(null)

// ==================== LIST VIEW STATE ====================
const videos = ref([])
const isLoadingVideos = ref(false)
const showUploadModal = ref(false)
const uploadModalRef = ref(null)

// ==================== DETAIL VIEW STATE ====================
const videoUrl = ref(null)

// Language State
const sourceLang = ref('en')
const targetLang = ref('ko')

// Language Dropdown State
const languageOptions = [
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
]
const isSourceDropdownOpen = ref(false)
const isTargetDropdownOpen = ref(false)
const sourceDropdownRef = ref(null)
const targetDropdownRef = ref(null)

// Glossary State (Text.vue 방식과 동일)
const glossaryExpanded = ref(false)
const selectedProjectId = ref(null)
const projects = ref([])
const contextInfo = ref(null)

// Video Player State
const videoPlayerRef = ref(null)
const videoDuration = ref(0)
const currentTime = ref(0)

// 다국어 자막 상태
const subtitleData = ref({
  originalLanguage: 'ko',
  availableLanguages: [],
  subtitles: []
})
const currentLanguage = ref('ko')

// 레거시 호환성
const subtitles = ref([])
const currentSubtitle = ref(null)

// Processing State
const isExtracting = ref(false)
const isTranslated = ref(false)
const downloadDropdownOpen = ref(false)
const showAddTranslationModal = ref(false)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// ==================== COMPUTED ====================
const totalTermsCount = computed(() => {
  return contextInfo.value?.termsCount || 0
})

// 선택한 언어의 자막만 표시
const displaySubtitles = computed(() => {
  if (!subtitleData.value.subtitles.length) return []

  return subtitleData.value.subtitles.map((segment) => ({
    ...segment,
    displayText:
      currentLanguage.value === subtitleData.value.originalLanguage
        ? segment.originalText
        : segment.translations[currentLanguage.value] || segment.originalText
  }))
})

// ==================== LIST VIEW METHODS ====================

async function loadVideos() {
  isLoadingVideos.value = true
  try {
    const response = await getVideos()
    videos.value = response.data?.content || []
  } catch (error) {
    console.error('Failed to load videos:', error)
    showToast('영상 목록을 불러오는데 실패했습니다.', 'error')
  } finally {
    isLoadingVideos.value = false
  }
}

async function selectVideo(video) {
  selectedVideo.value = video
  currentView.value = 'detail'

  // Set languages from video metadata
  if (video.originalLanguage) {
    sourceLang.value = video.originalLanguage
  }

  // Load video URL
  try {
    // Create video URL from server with token for authentication
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const token = localStorage.getItem('token')
    videoUrl.value = `${API_URL}/videos/${video.id}/stream?token=${token}`

    // Load existing subtitles if available
    // Support both hasSubtitles field and sttStatus fallback
    const hasSubtitles = video.hasSubtitles || video.sttStatus === 'completed'
    if (hasSubtitles) {
      await loadExistingSubtitles(video.id)
    }
  } catch (error) {
    console.error('Failed to load video:', error)
    showToast('영상을 불러오는데 실패했습니다.', 'error')
  }
}

async function loadExistingSubtitles(videoId) {
  try {
    const result = await getMultilingualSubtitles(videoId)

    subtitleData.value = {
      originalLanguage: result.originalLanguage,
      availableLanguages: result.availableLanguages,
      subtitles: result.subtitles
    }

    currentLanguage.value = result.originalLanguage
    subtitles.value = result.subtitles
    isTranslated.value = result.availableLanguages.length > 1
  } catch (error) {
    console.error('Failed to load subtitles:', error)
  }
}

function goBackToList() {
  currentView.value = 'list'
  resetDetailView()
  loadVideos() // Refresh list
}

function resetDetailView() {
  selectedVideo.value = null
  videoUrl.value = null
  subtitles.value = []
  currentSubtitle.value = null
  isTranslated.value = false
  selectedProjectId.value = null
  contextInfo.value = null
  subtitleData.value = {
    originalLanguage: 'ko',
    availableLanguages: [],
    subtitles: []
  }
}

async function handleVideoUpload({ file, sourceLanguage, targetLanguage }) {
  try {
    // Update modal state
    uploadModalRef.value?.setProgress(10)
    uploadModalRef.value?.setUploading(true)

    // Create FormData
    const formData = new FormData()
    formData.append('file', file)

    // Add request metadata as JSON
    const request = {
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      projectId: selectedProjectId.value
    }
    formData.append('request', JSON.stringify(request))

    // Get user ID
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      showToast('로그인이 필요합니다.', 'error')
      router.push('/login')
      return
    }

    uploadModalRef.value?.setProgress(30)

    // Upload to Java Backend
    const response = await uploadVideo(formData)

    uploadModalRef.value?.setProgress(100)

    // Close modal and refresh
    showUploadModal.value = false
    uploadModalRef.value?.resetState()

    showToast('영상 업로드가 완료되었습니다!', 'success')

    // Set languages for detail view
    sourceLang.value = sourceLanguage
    targetLang.value = targetLanguage

    // Select the uploaded video to go to detail view
    selectVideo({
      id: response.id,
      originalFilename: file.name,
      fileName: file.name,
      fileSize: file.size,
      originalLanguage: sourceLanguage,
      hasSubtitles: false
    })

    // Create local video URL for immediate playback
    videoUrl.value = URL.createObjectURL(file)

  } catch (error) {
    console.error('Video upload error:', error)
    showToast('영상 업로드에 실패했습니다.', 'error')
    uploadModalRef.value?.setUploading(false)
  }
}

async function handleDeleteVideo(videoId) {
  if (!confirm('이 영상을 삭제하시겠습니까?')) return

  try {
    await deleteVideo(videoId)
    showToast('영상이 삭제되었습니다.', 'success')

    if (currentView.value === 'detail') {
      goBackToList()
    } else {
      loadVideos()
    }
  } catch (error) {
    console.error('Failed to delete video:', error)
    showToast('영상 삭제에 실패했습니다.', 'error')
  }
}

// ==================== LANGUAGE METHODS ====================

function getLanguageFlag(code) {
  return languageOptions.find(l => l.code === code)?.flag || ''
}

function getLanguageName(code) {
  return languageOptions.find(l => l.code === code)?.name || code
}

function toggleSourceDropdown() {
  isSourceDropdownOpen.value = !isSourceDropdownOpen.value
  isTargetDropdownOpen.value = false
}

function toggleTargetDropdown() {
  isTargetDropdownOpen.value = !isTargetDropdownOpen.value
  isSourceDropdownOpen.value = false
}

function selectSourceLanguage(code) {
  if (code !== targetLang.value) {
    sourceLang.value = code
    isSourceDropdownOpen.value = false
  }
}

function selectTargetLanguage(code) {
  if (code !== sourceLang.value) {
    targetLang.value = code
    isTargetDropdownOpen.value = false
  }
}

function swapLanguages() {
  const temp = sourceLang.value
  sourceLang.value = targetLang.value
  targetLang.value = temp
}

function handleDropdownClickOutside(event) {
  if (sourceDropdownRef.value && !sourceDropdownRef.value.contains(event.target)) {
    isSourceDropdownOpen.value = false
  }
  if (targetDropdownRef.value && !targetDropdownRef.value.contains(event.target)) {
    isTargetDropdownOpen.value = false
  }
}

// ==================== PROJECT METHODS ====================

async function loadProjects() {
  try {
    const response = await getUserProjects()
    projects.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    showToast('프로젝트 목록을 불러오는데 실패했습니다.', 'error')
  }
}

function onProjectChange(projectId) {
  if (projectId) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      contextInfo.value = {
        documentsCount: project.documentCount || 0,
        termsCount: project.termCount || 0
      }
    }
  } else {
    contextInfo.value = null
  }
}

// ==================== SUBTITLE METHODS ====================

async function handleExtractSubtitles() {
  if (!selectedVideo.value) return

  console.log('Video File ID:', selectedVideo.value.id)

  isExtracting.value = true

  try {
    // Step 1: STT 처리 (원본 언어)
    await extractSubtitles({
      videoDocumentId: selectedVideo.value.id,
      sourceLanguage: sourceLang.value
    })

    // Step 2: 자동 번역 (목표 언어가 있고 원본과 다르면)
    if (targetLang.value && targetLang.value !== sourceLang.value) {
      await translateSubtitles({
        videoDocumentId: selectedVideo.value.id,
        projectId: selectedProjectId.value,
        sourceLanguage: sourceLang.value,
        targetLanguage: targetLang.value
      })
    }

    // Step 3: 다국어 자막 조회
    const result = await getMultilingualSubtitles(selectedVideo.value.id)

    // Step 4: 상태 업데이트
    subtitleData.value = {
      originalLanguage: result.originalLanguage,
      availableLanguages: result.availableLanguages,
      subtitles: result.subtitles
    }

    currentLanguage.value = result.originalLanguage
    subtitles.value = result.subtitles
    isTranslated.value = result.availableLanguages.length > 1

    const languageInfo =
      result.availableLanguages.length > 1
        ? ` (${result.availableLanguages.join(', ').toUpperCase()})`
        : ''
    showToast(`자막 생성 완료!${languageInfo}`, 'success')
  } catch (error) {
    console.error('Subtitle extraction error:', error)
    showToast('자막 처리에 실패했습니다.', 'error')
  } finally {
    isExtracting.value = false
  }
}

function handleLanguageChange(lang) {
  currentLanguage.value = lang
  console.log(`Language changed: ${lang}`)
}

async function handleAddTranslation({ targetLanguage, projectId: modalProjectId }) {
  if (!selectedVideo.value) return

  isExtracting.value = true

  try {
    await translateSubtitles({
      videoDocumentId: selectedVideo.value.id,
      projectId: modalProjectId || selectedProjectId.value,
      sourceLanguage: subtitleData.value.originalLanguage,
      targetLanguage: targetLanguage
    })

    const updatedData = await getMultilingualSubtitles(selectedVideo.value.id)

    subtitleData.value = {
      originalLanguage: updatedData.originalLanguage,
      availableLanguages: updatedData.availableLanguages,
      subtitles: updatedData.subtitles
    }

    subtitles.value = updatedData.subtitles
    isTranslated.value = updatedData.availableLanguages.length > 1
    currentLanguage.value = targetLanguage

    showToast(`${targetLanguage.toUpperCase()} 번역이 완료되었습니다!`, 'success')
  } catch (error) {
    console.error('Additional translation error:', error)
    showToast('번역에 실패했습니다.', 'error')
  } finally {
    isExtracting.value = false
  }
}

async function downloadSubtitle(language) {
  try {
    const blob = await downloadSubtitles({
      videoDocumentId: selectedVideo.value.id,
      language: language
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const filename = selectedVideo.value.originalFilename || selectedVideo.value.fileName || 'video'
    a.download = `${filename.replace(/\.[^/.]+$/, '')}_${language}.srt`
    a.click()
    URL.revokeObjectURL(url)

    downloadDropdownOpen.value = false
    showToast('자막 파일이 다운로드되었습니다!', 'success')
  } catch (error) {
    console.error('Download error:', error)
    showToast('다운로드에 실패했습니다.', 'error')
  }
}

// ==================== VIDEO PLAYER METHODS ====================

function handleTimeUpdate(event) {
  currentTime.value = event.target.currentTime

  const current = displaySubtitles.value.find(
    (sub) => currentTime.value >= sub.startTime && currentTime.value <= sub.endTime
  )
  currentSubtitle.value = current || null
}

function handleVideoLoaded(event) {
  videoDuration.value = event.target.duration
}

function seekToSubtitle(subtitle) {
  if (videoPlayerRef.value) {
    videoPlayerRef.value.currentTime = subtitle.startTime
    videoPlayerRef.value.play()
  }
}

// ==================== UTILITY METHODS ====================

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function showToast(message, type = 'success') {
  toast.value = {
    show: true,
    message,
    type
  }

  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ==================== LIFECYCLE ====================

onMounted(() => {
  loadVideos()
  loadProjects()

  document.addEventListener('click', handleDropdownClickOutside)
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      downloadDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleDropdownClickOutside)
  if (videoUrl.value && videoUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(videoUrl.value)
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
