<template>
  <div class="video-translation-page">
    <!-- Compact Header -->
    <header class="page-header">
      <div class="header-row">
        <div class="header-left">
          <h1 class="page-title">
            <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <div class="title-content">
              <span class="title-text">영상 번역</span>
              <span class="title-subtitle">전문용어사전 기반 AI 자막 번역</span>
            </div>
          </h1>
        </div>
      </div>
    </header>

    <!-- Upload Section -->
    <section v-if="!uploadedVideo" class="upload-section">
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInputRef"
          type="file"
          accept="video/mp4,video/avi,video/mov,video/mkv"
          @change="handleFileSelect"
          class="file-input"
        />

        <div class="upload-content">
          <div class="upload-icon-wrapper">
            <svg class="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 class="upload-title">영상 파일을 드래그하거나 클릭하여 업로드</h3>
          <p class="upload-subtitle">MP4, AVI, MOV, MKV (최대 500MB)</p>
          <button @click="triggerFileInput" class="btn btn-primary btn-large">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            파일 선택
          </button>
        </div>

        <!-- Upload Progress -->
        <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <p class="progress-text">{{ uploadProgress }}% 업로드 중...</p>
        </div>
      </div>

      <!-- Language Selection -->
      <div class="language-config">
        <div class="config-row">
          <div class="config-item">
            <label class="config-label">원본 언어</label>
            <select v-model="sourceLang" class="config-select">
              <option value="ko">한국어</option>
              <option value="en">영어</option>
              <option value="ja">일본어</option>
              <option value="vi">베트남어</option>
            </select>
          </div>
          <div class="arrow-icon">→</div>
          <div class="config-item">
            <label class="config-label">목표 언어</label>
            <select v-model="targetLang" class="config-select">
              <option value="en">영어</option>
              <option value="ko">한국어</option>
              <option value="ja">일본어</option>
              <option value="vi">베트남어</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Video Info & Glossary Selection -->
    <section v-if="uploadedVideo" class="video-info-section">
      <div class="video-info-card">
        <div class="info-header">
          <div class="info-title">
            <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
              />
            </svg>
            <span>{{ uploadedVideo.filename }}</span>
          </div>
          <button @click="resetVideo" class="btn-reset">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            다시 업로드
          </button>
        </div>
        <div class="info-details">
          <span class="info-badge">{{ formatFileSize(uploadedVideo.fileSize) }}</span>
          <span class="info-badge">{{ uploadedVideo.duration || 'N/A' }}</span>
          <span class="info-badge">{{ sourceLang.toUpperCase() }} → {{ targetLang.toUpperCase() }}</span>
        </div>
      </div>

      <!-- Glossary Selection (Collapsible) -->
      <div class="glossary-section" :class="{ expanded: glossaryExpanded }">
        <button @click="glossaryExpanded = !glossaryExpanded" class="glossary-toggle">
          <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span class="toggle-text">전문용어사전 선택 (선택사항)</span>
          <span v-if="selectedDocuments.length > 0" class="selected-badge">
            {{ selectedDocuments.length }}개 선택됨
          </span>
        </button>

        <div v-if="glossaryExpanded" class="glossary-content">
          <ProjectSelector
            v-model="selectedProjectId"
            :projects="projects"
            @change="onProjectChange"
          />

          <div v-if="selectedProjectId && projectDocuments.length > 0" class="documents-list">
            <h4 class="documents-title">문서 선택</h4>
            <div class="documents-grid">
              <label
                v-for="doc in projectDocuments"
                :key="doc.id"
                class="document-item"
                :class="{ selected: selectedDocuments.includes(doc.id) }"
              >
                <input
                  type="checkbox"
                  :value="doc.id"
                  v-model="selectedDocuments"
                  class="document-checkbox"
                />
                <div class="document-info">
                  <span class="document-name">{{ doc.title }}</span>
                  <span class="document-terms">{{ doc.termCount || 0 }}개 용어</span>
                </div>
              </label>
            </div>

            <div v-if="selectedDocuments.length > 0" class="selection-summary">
              총 {{ selectedDocuments.length }}개 문서 · 약 {{ totalTermsCount }}개 용어 사용
            </div>
          </div>
        </div>
      </div>
    </section>

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
          class="add-lang-btn"
        >
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span class="btn-text">새 언어로 번역</span>
        </button>
      </template>
    </LanguageSelector>

    <!-- Video Player & Subtitle Editor -->
    <section v-if="displaySubtitles.length > 0" class="player-editor-section">
      <!-- Video Player -->
      <div class="player-card">
        <video
          ref="videoPlayerRef"
          :src="videoUrl"
          @timeupdate="handleTimeUpdate"
          @loadedmetadata="handleVideoLoaded"
          class="video-player"
          controls
        ></video>

        <!-- Current Subtitle Overlay -->
        <div v-if="currentSubtitle" class="subtitle-overlay">
          <p class="subtitle-text">{{ currentSubtitle.displayText || currentSubtitle.text }}</p>
        </div>
      </div>

      <!-- Subtitle List -->
      <div class="subtitle-section">
        <div class="subtitle-header">
          <h3 class="subtitle-title">자막 목록</h3>
          <span class="subtitle-count">{{ displaySubtitles.length }}개</span>
        </div>

        <div class="subtitle-list">
          <div
            v-for="subtitle in displaySubtitles"
            :key="subtitle.id"
            class="subtitle-item"
            :class="{ active: currentSubtitle?.id === subtitle.id }"
            @click="seekToSubtitle(subtitle)"
          >
            <div class="subtitle-time">{{ formatTime(subtitle.startTime) }}</div>
            <div class="subtitle-content">
              <p class="subtitle-original">{{ subtitle.originalText }}</p>
              <p v-if="currentLanguage !== subtitleData.originalLanguage" class="subtitle-translated">
                {{ subtitle.displayText }}
              </p>
              <div v-if="subtitle.detectedTerms?.length > 0" class="subtitle-terms">
                <span
                  v-for="(term, idx) in subtitle.detectedTerms"
                  :key="idx"
                  class="term-badge"
                  :title="term.definition"
                >
                  {{ term.koreanTerm || term.matchedText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Action Buttons -->
    <section v-if="uploadedVideo" class="action-section">
      <div class="action-buttons">
        <!-- 자막 추출 버튼 (자막이 없을 때만 표시) -->
        <button
          v-if="!subtitles.length"
          @click="handleExtractSubtitles"
          :disabled="isExtracting"
          class="btn btn-primary btn-large"
        >
          <svg v-if="!isExtracting" class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <svg v-else class="btn-icon animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>{{
            isExtracting
              ? targetLang !== sourceLang
                ? '자막 추출 및 번역 중...'
                : '자막 추출 중...'
              : '자막 추출'
          }}</span>
        </button>


        <!-- 자막 다운로드 (자막이 있을 때만 표시) -->
        <div v-if="isTranslated" class="download-dropdown">
          <button @click="downloadDropdownOpen = !downloadDropdownOpen" class="btn btn-success">
            <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            자막 다운로드
            <svg class="dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div v-if="downloadDropdownOpen" class="dropdown-menu">
            <button @click="downloadSubtitle('original')" class="dropdown-item">
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              원본 자막 (SRT)
            </button>
            <button @click="downloadSubtitle('translated')" class="dropdown-item">
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              번역 자막 (SRT)
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Add Translation Modal -->
    <AddTranslationModal
      :show="showAddTranslationModal"
      :available-languages="subtitleData.availableLanguages"
      :source-language="subtitleData.originalLanguage"
      :projects="projects"
      @close="showAddTranslationModal = false"
      @translate="handleAddTranslation"
    />

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="`toast-${toast.type}`">
        <svg v-if="toast.type === 'success'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="toast.type === 'error'" class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>{{ toast.message }}</span>
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
      documentId: response.documentId,
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
  console.log('📄 Document ID:', uploadedVideo.value.documentId)

  isExtracting.value = true

  try {
    // Step 1: STT 처리 (원본 언어)
    await extractSubtitles({
      videoDocumentId: uploadedVideo.value.documentId,
      sourceLanguage: sourceLang.value
    })

    // Step 2: 자동 번역 (목표 언어가 있고 원본과 다르면)
    if (targetLang.value && targetLang.value !== sourceLang.value) {
      await translateSubtitles({
        videoDocumentId: uploadedVideo.value.documentId,
        documentIds: selectedDocuments.value,
        sourceLanguage: sourceLang.value,
        targetLanguage: targetLang.value
      })
    }

    // Step 3: 다국어 자막 조회
    const result = await getMultilingualSubtitles(uploadedVideo.value.documentId)

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
      videoDocumentId: uploadedVideo.value.documentId,
      documentIds: documentIds,
      sourceLanguage: subtitleData.value.originalLanguage,
      targetLanguage: targetLanguage
    })

    // Step 2: 다국어 자막 다시 조회
    const updatedData = await getMultilingualSubtitles(uploadedVideo.value.documentId)

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
    if (!event.target.closest('.download-dropdown')) {
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
.video-translation-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 1800px;
  margin: 0 auto;
  min-height: 100vh;
}

/* Header */
.page-header {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 0;
}

.title-icon {
  width: 2.25rem;
  height: 2.25rem;
  color: #F97316;
  flex-shrink: 0;
}

.title-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.title-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  font-weight: 400;
}

/* Upload Section */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-area {
  position: relative;
  background-color: #FFFFFF;
  border: 3px dashed #D1D5DB;
  border-radius: 1rem;
  padding: 3rem 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #F97316;
  background-color: #FFF7ED;
}

.file-input {
  display: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.upload-icon-wrapper {
  width: 5rem;
  height: 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%);
  border-radius: 50%;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #F97316;
}

.upload-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.upload-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.upload-progress {
  margin-top: 2rem;
  width: 100%;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #F97316 0%, #FB923C 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.progress-text {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: #6B7280;
  text-align: center;
}

/* Language Config */
.language-config {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.config-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  justify-content: center;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  max-width: 250px;
}

.config-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.config-select {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #111827;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.config-select:hover {
  border-color: #9CA3AF;
}

.config-select:focus {
  outline: none;
  border-color: #F97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.arrow-icon {
  font-size: 1.5rem;
  color: #9CA3AF;
  margin-top: 1.75rem;
}

/* Video Info Section */
.video-info-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.video-info-card {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.info-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #F97316;
}

.btn-reset {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #DC2626;
  background-color: #FEE2E2;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-reset:hover {
  background-color: #FCA5A5;
}

.btn-reset svg {
  width: 1rem;
  height: 1rem;
}

.info-details {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.info-badge {
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  background-color: #F3F4F6;
  border-radius: 9999px;
}

/* Glossary Section */
.glossary-section {
  background-color: #FFFFFF;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.glossary-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4B5563;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.glossary-toggle:hover {
  color: #2563EB;
  background-color: #F9FAFB;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.glossary-section.expanded .toggle-icon {
  transform: rotate(180deg);
}

.toggle-text {
  flex: 1;
  text-align: left;
}

.selected-badge {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  color: #065F46;
  background-color: #D1FAE5;
  border-radius: 9999px;
}

.glossary-content {
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.documents-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-item:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.document-item.selected {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.document-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.document-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.document-terms {
  font-size: 0.75rem;
  color: #6B7280;
}

.selection-summary {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #065F46;
  background-color: #D1FAE5;
  border-radius: 0.5rem;
  text-align: center;
}

/* Player & Editor Section */
.player-editor-section {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.player-card {
  position: relative;
  background-color: #000000;
  border-radius: 0.75rem;
  overflow: hidden;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.video-player {
  width: 100%;
  height: auto;
  display: block;
}

.subtitle-overlay {
  position: absolute;
  bottom: 4rem;
  left: 50%;
  transform: translateX(-50%);
  max-width: 90%;
  padding: 0.75rem 1.5rem;
  background-color: rgba(0, 0, 0, 0.85);
  border-radius: 0.5rem;
  pointer-events: none;
}

.subtitle-text {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #FFFFFF;
  text-align: center;
  line-height: 1.6;
}

/* Subtitle Section */
.subtitle-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subtitle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.subtitle-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.subtitle-count {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  background-color: #F3F4F6;
  border-radius: 9999px;
}

.subtitle-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.subtitle-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.subtitle-item:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.subtitle-item.active {
  border-color: #F97316;
  background-color: #FFF7ED;
}

.subtitle-time {
  flex-shrink: 0;
  width: 5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  font-family: monospace;
}

.subtitle-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.subtitle-original {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #4B5563;
}

.subtitle-translated {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: #111827;
  font-weight: 500;
}

.subtitle-terms {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.25rem;
}

.term-badge {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #065F46;
  background-color: #D1FAE5;
  border-radius: 0.25rem;
  cursor: help;
}

/* Action Section */
.action-section {
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Download Dropdown */
.download-dropdown {
  position: relative;
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  margin-left: 0.25rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 200px;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.dropdown-item:hover {
  background-color: #F3F4F6;
  color: #2563EB;
}

.item-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: 120px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-primary {
  color: #FFFFFF;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.35);
}

.btn-success {
  color: #FFFFFF;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.35);
}

.btn-secondary {
  color: #FFFFFF;
  background: linear-gradient(135deg, #6B7280 0%, #4B5563 100%);
  box-shadow: 0 2px 4px rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4B5563 0%, #374151 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(107, 114, 128, 0.35);
}

.btn-large {
  padding: 0.875rem 2rem;
  font-size: 0.9375rem;
  min-width: 150px;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #FFFFFF;
  background-color: #111827;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  z-index: 1000;
}

.toast-success {
  background-color: #10B981;
}

.toast-error {
  background-color: #EF4444;
}

.toast-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(1rem);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

/* Responsive */
@media (max-width: 1200px) {
  .subtitle-list {
    max-height: 400px;
  }
}

@media (max-width: 768px) {
  .video-translation-page {
    padding: 1rem;
    gap: 1rem;
  }

  .page-header {
    padding: 1rem;
  }

  .title-text {
    font-size: 1.25rem;
  }

  .config-row {
    flex-direction: column;
    gap: 1rem;
  }

  .config-item {
    max-width: 100%;
  }

  .arrow-icon {
    transform: rotate(90deg);
    margin-top: 0;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }

  .add-lang-btn {
    width: 100%;
  }
}

/* Add Language Button (in LanguageSelector) */
.add-lang-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: #FFFFFF;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: 2px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 160px;
}

.add-lang-btn:hover {
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.35);
}

.add-lang-btn .btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.add-lang-btn .btn-text {
  flex: 1;
  text-align: left;
}
</style>
