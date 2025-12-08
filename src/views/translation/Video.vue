<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">영상 번역</h1>
          <p class="text-sm text-gray-500 font-medium mt-0.5">AI 기반 자막 번역 및 용어집 지원</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto space-y-6">

        <!-- Upload Section -->
        <div v-if="!uploadedVideo" class="flex flex-col gap-6">
          <div
            class="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-12 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group"
            :class="{ 'border-blue-500 bg-blue-50/50': isDragOver }"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="video/mp4,video/avi,video/mov,video/mkv"
              @change="handleFileSelect"
              class="hidden"
            />
            
            <div class="flex flex-col items-center gap-4">
              <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <CloudArrowUpIcon class="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900">Upload Video</h3>
                <p class="text-gray-500 mt-1">Drag & drop or click to browse</p>
                <p class="text-xs text-gray-400 mt-2">MP4, AVI, MOV, MKV (Max 500MB)</p>
              </div>
            </div>

            <!-- Progress -->
            <div v-if="uploadProgress > 0 && uploadProgress < 100" class="mt-8 max-w-md mx-auto">
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-blue-600 transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
              </div>
              <p class="text-sm text-gray-500 mt-2">{{ uploadProgress }}% Uploading...</p>
            </div>
          </div>

          <!-- Language Config -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div class="flex flex-col md:flex-row items-center justify-center gap-8">
              <div class="flex-1 w-full max-w-xs space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Source Language</label>
                <select v-model="sourceLang" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                  <option value="ko">Korean</option>
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
              
              <ArrowRightIcon class="w-6 h-6 text-gray-300 rotate-90 md:rotate-0" />

              <div class="flex-1 w-full max-w-xs space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Language</label>
                <select v-model="targetLang" class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                  <option value="en">English</option>
                  <option value="ko">Korean</option>
                  <option value="ja">Japanese</option>
                  <option value="vi">Vietnamese</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Video Info & Controls -->
        <div v-if="uploadedVideo" class="space-y-6">
          <!-- Info Card -->
          <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <VideoCameraIcon class="w-6 h-6" />
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-900">{{ uploadedVideo.filename }}</h3>
                <div class="flex items-center gap-3 mt-1">
                  <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ formatFileSize(uploadedVideo.fileSize) }}</span>
                  <span class="px-2.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">{{ uploadedVideo.duration || 'N/A' }}</span>
                  <span class="px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold">{{ sourceLang.toUpperCase() }} → {{ targetLang.toUpperCase() }}</span>
                </div>
              </div>
            </div>
            <button @click="resetVideo" class="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-xl transition-all">
              <TrashIcon class="w-4 h-4" />
              Reset
            </button>
          </div>

          <!-- Glossary Selection -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button @click="glossaryExpanded = !glossaryExpanded" class="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors">
              <div class="flex items-center gap-3">
                <BookOpenIcon class="w-5 h-5 text-gray-400" />
                <span class="font-bold text-gray-700">Glossary Selection</span>
                <span v-if="selectedDocuments.length > 0" class="px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                  {{ selectedDocuments.length }} selected
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
                @change="onProjectChange"
                class="mb-6"
              />

              <div v-if="selectedProjectId && projectDocuments.length > 0">
                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Select Documents</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <label
                    v-for="doc in projectDocuments"
                    :key="doc.id"
                    class="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all"
                    :class="{ 'border-blue-500 bg-blue-50/30': selectedDocuments.includes(doc.id) }"
                  >
                    <input
                      type="checkbox"
                      :value="doc.id"
                      v-model="selectedDocuments"
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p class="text-sm font-bold text-gray-900">{{ doc.title }}</p>
                      <p class="text-xs text-gray-500">{{ doc.termCount || 0 }} terms</p>
                    </div>
                  </label>
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
                Add Language
              </button>
            </template>
          </LanguageSelector>

          <!-- Player & Subtitles -->
          <div v-if="displaySubtitles.length > 0" class="flex flex-col lg:flex-row gap-6 h-[600px]">
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
                <h3 class="font-bold text-gray-900">Subtitles</h3>
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
              {{ isExtracting ? 'Processing...' : 'Extract Subtitles' }}
            </button>

            <div v-if="isTranslated" class="relative">
              <button 
                @click="downloadDropdownOpen = !downloadDropdownOpen"
                class="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <ArrowDownTrayIcon class="w-5 h-5" />
                Download
                <ChevronDownIcon class="w-4 h-4 ml-1" />
              </button>

              <div v-if="downloadDropdownOpen" class="absolute bottom-full mb-2 right-0 w-48 bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden z-10">
                <button @click="downloadSubtitle('original')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <DocumentTextIcon class="w-4 h-4" />
                  Original (SRT)
                </button>
                <button @click="downloadSubtitle('translated')" class="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2">
                  <LanguageIcon class="w-4 h-4" />
                  Translated (SRT)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals & Toasts -->
    <AddTranslationModal
      :show="showAddTranslationModal"
      :available-languages="subtitleData.availableLanguages"
      :source-language="subtitleData.originalLanguage"
      :projects="projects"
      @close="showAddTranslationModal = false"
      @translate="handleAddTranslation"
    />

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
import {
  uploadVideo,
  extractSubtitles,
  translateSubtitles,
  getMultilingualSubtitles,
  downloadSubtitles
} from '@/services/videoService'
import { getUserProjects } from '@/services/projectService'
import {
  CloudArrowUpIcon,
  ArrowRightIcon,
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
  ExclamationCircleIcon
} from '@heroicons/vue/24/solid'

const router = useRouter()

// Upload State
const fileInputRef = ref(null)
const isDragOver = ref(false)
const uploadedVideo = ref(null)
const uploadProgress = ref(0)
const videoUrl = ref(null)

// Language State
const sourceLang = ref('ko')
const targetLang = ref('en')

// Glossary State
const glossaryExpanded = ref(false)
const selectedProjectId = ref(null)
const projects = ref([])
const projectDocuments = ref([])
const selectedDocuments = ref([])

// Video Player State
const videoPlayerRef = ref(null)
const videoDuration = ref(0)
const currentTime = ref(0)

// 다국어 자막 상태 (새로 추가)
const subtitleData = ref({
  originalLanguage: 'ko',
  availableLanguages: [],
  subtitles: []
})
const currentLanguage = ref('ko')

// 레거시 호환성 (기존 코드 유지)
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

// Computed
const totalTermsCount = computed(() => {
  return projectDocuments.value
    .filter((doc) => selectedDocuments.value.includes(doc.id))
    .reduce((sum, doc) => sum + (doc.termCount || 0), 0)
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

// Methods
async function loadProjects() {
  try {
    const response = await getUserProjects()
    projects.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    showToast('프로젝트 목록을 불러오는데 실패했습니다.', 'error')
  }
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    handleVideoFile(file)
  }
}

function handleDrop(event) {
  isDragOver.value = false
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('video/')) {
    handleVideoFile(file)
  } else {
    showToast('영상 파일만 업로드 가능합니다.', 'error')
  }
}

async function handleVideoFile(file) {
  // Validate file size (500MB limit)
  const maxSize = 500 * 1024 * 1024
  if (file.size > maxSize) {
    showToast('파일 크기는 500MB를 초과할 수 없습니다.', 'error')
    return
  }

  try {
    uploadProgress.value = 1

    // Create FormData
    const formData = new FormData()
    formData.append('file', file)

    // Add request metadata as JSON
    const request = {
      sourceLanguage: sourceLang.value,
      targetLanguage: targetLang.value,
      documentIds: selectedDocuments.value
    }
    formData.append('request', JSON.stringify(request))

    // Get user ID
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user.id) {
      showToast('로그인이 필요합니다.', 'error')
      router.push('/login')
      return
    }

    // Upload to Java Backend
    const response = await uploadVideo(formData)

    uploadedVideo.value = {
      id: response.id,
      filename: file.name,
      fileSize: file.size,
      duration: null
    }

    // Create local video URL
    videoUrl.value = URL.createObjectURL(file)

    uploadProgress.value = 100
    showToast('영상 업로드가 완료되었습니다!', 'success')

    // Reset progress after delay
    setTimeout(() => {
      uploadProgress.value = 0
    }, 1000)
  } catch (error) {
    console.error('Video upload error:', error)
    showToast('영상 업로드에 실패했습니다.', 'error')
    uploadProgress.value = 0
  }
}

function resetVideo() {
  uploadedVideo.value = null
  videoUrl.value = null
  subtitles.value = []
  currentSubtitle.value = null
  isTranslated.value = false
  selectedDocuments.value = []
  uploadProgress.value = 0
}

async function onProjectChange(projectId) {
  if (projectId) {
    // TODO: Load project documents from API
    // For now, using mock data
    projectDocuments.value = []
    selectedDocuments.value = []
  } else {
    projectDocuments.value = []
    selectedDocuments.value = []
  }
}

async function handleExtractSubtitles() {
  if (!uploadedVideo.value) return

  console.log('🎬 Uploaded Video:', uploadedVideo.value)
  console.log('📄 Video File ID:', uploadedVideo.value.id)

  isExtracting.value = true

  try {
    // Step 1: STT 처리 (원본 언어)
    await extractSubtitles({
      videoDocumentId: uploadedVideo.value.id,
      sourceLanguage: sourceLang.value
    })

    // Step 2: 자동 번역 (목표 언어가 있고 원본과 다르면)
    if (targetLang.value && targetLang.value !== sourceLang.value) {
      await translateSubtitles({
        videoDocumentId: uploadedVideo.value.id,
        documentIds: selectedDocuments.value,
        sourceLanguage: sourceLang.value,
        targetLanguage: targetLang.value
      })
    }

    // Step 3: 다국어 자막 조회
    const result = await getMultilingualSubtitles(uploadedVideo.value.id)

    // Step 4: 상태 업데이트
    subtitleData.value = {
      originalLanguage: result.originalLanguage,
      availableLanguages: result.availableLanguages,
      subtitles: result.subtitles
    }

    currentLanguage.value = result.originalLanguage

    // 레거시 호환성
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

// 언어 선택 변경
function handleLanguageChange(lang) {
  currentLanguage.value = lang
  console.log(`🌐 언어 변경: ${lang}`)
}

// 번역 추가 (모달에서 호출)
async function handleAddTranslation({ targetLanguage, documentIds }) {
  if (!uploadedVideo.value) return

  isExtracting.value = true

  try {
    // Step 1: 번역 처리
    await translateSubtitles({
      videoDocumentId: uploadedVideo.value.id,
      documentIds: documentIds,
      sourceLanguage: subtitleData.value.originalLanguage,
      targetLanguage: targetLanguage
    })

    // Step 2: 다국어 자막 다시 조회
    const updatedData = await getMultilingualSubtitles(uploadedVideo.value.id)

    // Step 3: 상태 업데이트
    subtitleData.value = {
      originalLanguage: updatedData.originalLanguage,
      availableLanguages: updatedData.availableLanguages,
      subtitles: updatedData.subtitles
    }

    // 레거시 호환성
    subtitles.value = updatedData.subtitles
    isTranslated.value = updatedData.availableLanguages.length > 1

    // Step 4: 새로 번역된 언어로 자동 전환
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
      videoDocumentId: uploadedVideo.value.id,
      language: language
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${uploadedVideo.value.filename.replace(/\.[^/.]+$/, '')}_${language}.srt`
    a.click()
    URL.revokeObjectURL(url)

    downloadDropdownOpen.value = false
    showToast('자막 파일이 다운로드되었습니다!', 'success')
  } catch (error) {
    console.error('Download error:', error)
    showToast('다운로드에 실패했습니다.', 'error')
  }
}

function handleTimeUpdate(event) {
  currentTime.value = event.target.currentTime

  // Find current subtitle (displaySubtitles 사용)
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

// Lifecycle
onMounted(() => {
  loadProjects()

  // Close dropdown on outside click
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.relative')) {
      downloadDropdownOpen.value = false
    }
  })
})

onUnmounted(() => {
  if (videoUrl.value) {
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
