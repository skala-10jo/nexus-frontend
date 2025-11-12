<template>
  <div class="translation-page">
    <!-- Header Section -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            텍스트 번역
          </h1>
          <p class="page-subtitle">AI 기반 고품질 다국어 번역</p>
        </div>
      </div>

      <!-- Project & Language Selector -->
      <div class="control-bar">
        <ProjectSelector
          v-model="selectedProjectId"
          :projects="projects"
          :context-info="contextInfo"
          @change="onProjectChange"
        />

        <LanguageSwitcher
          v-model:source-language="sourceLang"
          v-model:target-language="targetLang"
          @swap="onLanguageSwap"
        />
      </div>
    </header>

    <!-- Main Workspace -->
    <div class="translation-workspace">
      <div class="workspace-grid">
        <!-- Input Panel -->
        <div class="workspace-column">
          <InputPanel
            v-model="sourceText"
            :is-translating="isTranslating"
            :placeholder="inputPlaceholder"
            @translate="handleTranslate"
            @clear="handleClear"
            @paste="handlePaste"
          />
        </div>

        <!-- Output Panel -->
        <div class="workspace-column">
          <OutputPanel
            :translated-text="translatedText"
            :detected-terms="detectedTerms"
            :translation-result="translationResult"
            :is-translating="isTranslating"
            @copy="handleCopy"
            @export="handleExport"
          />
        </div>
      </div>
    </div>

    <!-- Context Panel (Expandable) -->
    <div
      v-if="selectedProjectId && translationResult"
      class="context-panel"
      :class="{ expanded: contextExpanded }"
    >
      <button @click="contextExpanded = !contextExpanded" class="context-toggle">
        <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>컨텍스트 상세 보기</span>
      </button>

      <div v-if="contextExpanded" class="context-content">
        <div class="context-section">
          <h4 class="context-title">📄 사용된 컨텍스트</h4>
          <p class="context-summary">
            {{ translationResult.contextSummary || '컨텍스트 요약이 없습니다.' }}
          </p>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import ProjectSelector from '@/components/translation/ProjectSelector.vue'
import LanguageSwitcher from '@/components/translation/LanguageSwitcher.vue'
import InputPanel from '@/components/translation/InputPanel.vue'
import OutputPanel from '@/components/translation/OutputPanel.vue'
import { translateText } from '@/services/translationService'
import { getUserProjects } from '@/services/projectService'

const router = useRouter()

// State
const sourceText = ref('')
const translatedText = ref('')
const sourceLang = ref('ko')
const targetLang = ref('en')
const selectedProjectId = ref(null)
const projects = ref([])
const contextInfo = ref(null)
const detectedTerms = ref([])
const translationResult = ref(null)
const isTranslating = ref(false)
const contextExpanded = ref(false)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// Computed
const inputPlaceholder = computed(() => {
  if (selectedProjectId.value) {
    return '프로젝트 컨텍스트를 활용하여 번역합니다. 텍스트를 입력하세요...'
  }
  return '번역할 텍스트를 입력하세요...'
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

async function handleTranslate() {
  if (!sourceText.value.trim()) {
    showToast('번역할 텍스트를 입력해주세요.', 'error')
    return
  }

  if (sourceLang.value === targetLang.value) {
    showToast('원본 언어와 목표 언어가 같습니다.', 'error')
    return
  }

  isTranslating.value = true
  translatedText.value = ''
  detectedTerms.value = []
  translationResult.value = null

  try {
    // Get user ID from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const userId = user.id

    if (!userId) {
      showToast('로그인이 필요합니다.', 'error')
      router.push('/login')
      return
    }

    const result = await translateText({
      text: sourceText.value,
      sourceLang: sourceLang.value,
      targetLang: targetLang.value,
      userId,
      projectId: selectedProjectId.value
    })

    translatedText.value = result.translatedText
    detectedTerms.value = result.detectedTerms || []
    translationResult.value = {
      contextUsed: result.contextUsed,
      contextSummary: result.contextSummary,
      termsCount: result.termsCount || 0
    }

    showToast('번역이 완료되었습니다!', 'success')

    // Scroll to output if on mobile
    if (window.innerWidth < 768) {
      setTimeout(() => {
        document.querySelector('.workspace-column:last-child')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }, 300)
    }
  } catch (error) {
    console.error('Translation error:', error)
    const errorMessage = error.response?.data?.detail || error.message || '번역 중 오류가 발생했습니다.'
    showToast(errorMessage, 'error')
  } finally {
    isTranslating.value = false
  }
}

function handleClear() {
  sourceText.value = ''
  translatedText.value = ''
  detectedTerms.value = []
  translationResult.value = null
}

function handlePaste(event) {
  // Auto-translate after paste if option enabled
  // Can be implemented later
}

function handleCopy() {
  showToast('번역 결과가 복사되었습니다!', 'success')
}

function handleExport(data) {
  // Export translation result
  const blob = new Blob([data.translatedText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `translation-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  showToast('번역 결과가 다운로드되었습니다!', 'success')
}

function onProjectChange(projectId) {
  if (projectId) {
    // Load project context info
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

function onLanguageSwap() {
  // Swap source and target text if available
  if (translatedText.value && sourceText.value) {
    const temp = sourceText.value
    sourceText.value = translatedText.value
    translatedText.value = temp
    detectedTerms.value = []
  }
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
})
</script>

<style scoped>
.translation-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  min-height: 100vh;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.title-icon {
  width: 2.5rem;
  height: 2.5rem;
  color: #2563EB;
}

.page-subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
}

.control-bar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background-color: #FFFFFF;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.translation-workspace {
  flex: 1;
}

.workspace-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  min-height: 500px;
}

.workspace-column {
  display: flex;
  background-color: #FFFFFF;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.context-panel {
  background-color: #FFFFFF;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.context-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4B5563;
  background-color: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.context-toggle:hover {
  color: #2563EB;
  background-color: #F9FAFB;
}

.toggle-icon {
  width: 1.25rem;
  height: 1.25rem;
  transition: transform 0.3s ease;
}

.context-panel.expanded .toggle-icon {
  transform: rotate(180deg);
}

.context-content {
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.context-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.context-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.context-summary {
  font-size: 0.875rem;
  line-height: 1.75;
  color: #4B5563;
  font-style: italic;
  margin: 0;
  padding: 1rem;
  background-color: #F9FAFB;
  border-left: 4px solid #2563EB;
  border-radius: 0.5rem;
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
@media (max-width: 1024px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .translation-page {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .title-icon {
    width: 2rem;
    height: 2rem;
  }

  .control-bar {
    padding: 1rem;
  }

  .workspace-column {
    padding: 1rem;
  }

  .toast {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
  }
}
</style>
