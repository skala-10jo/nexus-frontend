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
              @click="handleSelectVideo"
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
          <VideoLanguageConfig
            v-if="!hasSubtitles"
            :source-lang="sourceLang"
            :target-lang="targetLang"
            @update:source-lang="sourceLang = $event"
            @update:target-lang="targetLang = $event"
          />

          <!-- Project Context Selection -->
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

          <!-- Language Selector (다국어 자막 있을 때) -->
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
              v-if="!hasSubtitles"
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
                <button @click="handleDownloadSubtitle('original')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <DocumentTextIcon class="w-4 h-4" />
                  원본 (SRT)
                </button>
                <button @click="handleDownloadSubtitle('translated')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
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
    <VideoUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      @close="showUploadModal = false"
      @upload="onVideoUpload"
    />

    <AddTranslationModal
      :show="showAddTranslationModal"
      :available-languages="subtitleData.availableLanguages"
      :source-language="subtitleData.originalLanguage"
      :projects="projects"
      @close="showAddTranslationModal = false"
      @translate="onAddTranslation"
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Components
import ProjectSelector from '@/components/translation/ProjectSelector.vue'
import LanguageSelector from '@/components/translation/LanguageSelector.vue'
import AddTranslationModal from '@/components/translation/AddTranslationModal.vue'
import VideoUploadModal from '@/components/translation/VideoUploadModal.vue'
import VideoCard from '@/components/translation/VideoCard.vue'
import VideoLanguageConfig from '@/components/translation/VideoLanguageConfig.vue'

// Composables
import { useVideoPage } from '@/composables/translation/useVideoPage'
import { useVideoPlayer } from '@/composables/translation/useVideoPlayer'
import { useVideoSubtitle } from '@/composables/translation/useVideoSubtitle'
// Toast는 로컬 상태로 관리 (기존 방식 유지)

// Icons
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

// ==================== COMPOSABLES ====================
const {
  currentView,
  selectedVideo,
  videos,
  isLoadingVideos,
  showUploadModal,
  uploadModalRef,
  glossaryExpanded,
  selectedProjectId,
  projects,
  contextInfo,
  downloadDropdownOpen,
  showAddTranslationModal,
  loadVideos,
  selectVideo,
  goBackToList,
  handleVideoUpload,
  handleDeleteVideo,
  onProjectChange,
  formatFileSize,
  resetDetailView
} = useVideoPage()

const {
  videoPlayerRef,
  videoUrl,
  currentTime,
  setVideoUrl,
  setLocalVideoUrl,
  handleTimeUpdate: _handleTimeUpdate,
  handleVideoLoaded,
  seekToSubtitle,
  formatTime,
  reset: resetPlayer
} = useVideoPlayer()

const {
  subtitleData,
  currentLanguage,
  subtitles,
  currentSubtitle,
  isExtracting,
  isTranslated,
  displaySubtitles,
  hasSubtitles,
  loadExistingSubtitles,
  handleExtractSubtitles: _extractSubtitles,
  handleAddTranslation: _addTranslation,
  handleLanguageChange,
  handleDownloadSubtitle: _downloadSubtitle,
  findCurrentSubtitle,
  reset: resetSubtitles
} = useVideoSubtitle()

// Toast 로컬 상태 (기존 Video.vue 방식)
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  setTimeout(() => {
    toast.value.show = false
  }, 3000)
}

// ==================== REFS ====================
const languageConfigRef = ref(null)

// 언어 상태 (Video.vue에서 직접 관리)
const sourceLang = ref('en')
const targetLang = ref('ko')

// ==================== HANDLERS ====================

// 비디오 선택 처리
async function handleSelectVideo(video) {
  selectVideo(video)

  // 언어 설정
  if (video.originalLanguage) {
    sourceLang.value = video.originalLanguage
  }

  // 비디오 URL 설정
  setVideoUrl(video.id)

  // 기존 자막 로드
  const hasExistingSubtitles = video.hasSubtitles || video.sttStatus === 'completed'
  if (hasExistingSubtitles) {
    try {
      await loadExistingSubtitles(video.id)
    } catch (error) {
      console.error('Failed to load subtitles:', error)
      showToast('자막을 불러오는데 실패했습니다.', 'error')
    }
  }
}

// 비디오 업로드 처리
async function onVideoUpload({ file, sourceLanguage, targetLanguage }) {
  try {
    const uploadedVideo = await handleVideoUpload(
      { file, sourceLanguage, targetLanguage },
      {
        onProgress: (progress) => uploadModalRef.value?.setProgress(progress)
      }
    )

    if (uploadedVideo) {
      showUploadModal.value = false
      uploadModalRef.value?.resetState()

      // 언어 설정
      sourceLang.value = sourceLanguage
      targetLang.value = targetLanguage

      // 상세 뷰로 이동
      selectVideo(uploadedVideo)
      setLocalVideoUrl(file)
    }
  } catch (error) {
    uploadModalRef.value?.setUploading(false)
  }
}

// 자막 추출 처리
async function handleExtractSubtitles() {
  if (!selectedVideo.value) return

  try {
    const result = await _extractSubtitles({
      videoDocumentId: selectedVideo.value.id,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      projectId: selectedProjectId.value
    })

    const languageInfo = result.availableLanguages.length > 1
      ? ` (${result.availableLanguages.join(', ').toUpperCase()})`
      : ''
    showToast(`자막 생성 완료!${languageInfo}`, 'success')
  } catch (error) {
    console.error('Subtitle extraction error:', error)
    showToast('자막 처리에 실패했습니다.', 'error')
  }
}

// 추가 번역 처리
async function onAddTranslation({ targetLanguage, projectId: modalProjectId }) {
  if (!selectedVideo.value) return

  try {
    await _addTranslation({
      videoDocumentId: selectedVideo.value.id,
      targetLanguage,
      projectId: modalProjectId || selectedProjectId.value
    })

    showToast(`${targetLanguage.toUpperCase()} 번역이 완료되었습니다!`, 'success')
  } catch (error) {
    console.error('Additional translation error:', error)
    showToast('번역에 실패했습니다.', 'error')
  }
}

// 자막 다운로드 처리
async function handleDownloadSubtitle(language) {
  try {
    const filename = selectedVideo.value.originalFilename || selectedVideo.value.fileName || 'video'
    await _downloadSubtitle({
      videoDocumentId: selectedVideo.value.id,
      language,
      filename
    })

    downloadDropdownOpen.value = false
    showToast('자막 파일이 다운로드되었습니다!', 'success')
  } catch (error) {
    showToast('다운로드에 실패했습니다.', 'error')
  }
}

// 시간 업데이트 (자막 동기화 포함)
function handleTimeUpdate(event) {
  _handleTimeUpdate(event)
  findCurrentSubtitle(currentTime.value)
}

// ==================== LIFECYCLE ====================
onMounted(() => {
  // 다운로드 드롭다운 외부 클릭 처리
  const handleClickOutside = (event) => {
    if (!event.target.closest('.relative')) {
      downloadDropdownOpen.value = false
    }
  }
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  resetPlayer()
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
