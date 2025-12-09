<template>
  <div class="h-full flex flex-col relative bg-white pb-24 md:pb-0">
    <!-- Header Section -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-20 overflow-visible">
      <!-- Row 1: Title -->
      <div class="flex items-center gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">텍스트 번역</h1>
          <p class="text-sm text-gray-500 font-medium mt-0.5">프로젝트 맥락을 반영한 전문 번역</p>
        </div>
      </div>

      <!-- Row 2: Controls -->
      <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
        <LanguageSwitcher
          v-model:source-language="sourceLang"
          v-model:target-language="targetLang"
          @swap="onLanguageSwap"
          class="w-full md:w-auto"
        />

        <div class="hidden md:block h-10 w-px bg-gray-200 mx-2"></div>

        <ProjectSelector
          v-model="selectedProjectId"
          :projects="projects"
          :context-info="contextInfo"
          @change="onProjectChange"
          class="w-full md:w-auto md:min-w-[240px]"
        />
      </div>
    </div>

    <!-- Workspace Section -->
    <div class="flex-1 bg-gray-50/50 p-4 md:p-6 overflow-y-auto md:overflow-hidden">
      <div class="h-auto md:h-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-[1920px] mx-auto">
        
        <!-- Input Card -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden group transition-all hover:shadow-md h-[300px] md:h-full">
          <div class="flex-1 relative p-8">
            <textarea
              v-model="sourceText"
              class="w-full h-full text-lg leading-relaxed resize-none focus:outline-none bg-transparent placeholder-gray-300"
              :placeholder="inputPlaceholder"
              spellcheck="false"
            ></textarea>
            
            <button 
              v-if="sourceText"
              @click="handleClear"
              class="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Input Action Bar -->
          <div class="h-20 px-8 border-t border-gray-50 flex justify-between items-center bg-white flex-shrink-0">
            <div class="text-xs font-bold text-gray-300 tracking-wider">
              {{ sourceText.length }} / 5000 CHARS
            </div>
            <div class="flex gap-3">
              <button 
                @click="handlePaste"
                class="px-4 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                Paste
              </button>
              <button 
                @click="handleTranslate"
                :disabled="!sourceText || isTranslating"
                class="px-8 py-2.5 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-105 transition-all shadow-lg shadow-gray-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                <span v-if="isTranslating" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span v-else>Translate</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Output Card -->
        <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col overflow-hidden relative h-[300px] md:h-full">
          <!-- Output Header -->
          <div class="h-16 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-50 bg-white">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Result</span>
            <div v-if="translationResult" class="flex gap-2">
              <span v-if="translationResult.contextUsed" class="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                Context
              </span>
              <span v-if="translationResult.termsCount > 0" class="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                {{ translationResult.termsCount }} Terms
              </span>
            </div>
          </div>

          <div class="flex-1 relative overflow-y-auto p-8 bg-gray-50/30">
            <!-- Loading -->
            <div v-if="isTranslating" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10 transition-all">
              <div class="w-12 h-12 border-4 border-gray-100 border-t-black rounded-full animate-spin mb-4"></div>
              <p class="text-sm font-bold text-gray-500">Translating...</p>
            </div>

            <!-- Empty -->
            <div v-if="!translatedText && !isTranslating" class="h-full flex flex-col items-center justify-center text-gray-400">
              <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 rotate-12">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
              </div>
              <p class="text-sm font-medium text-gray-400">Translation will appear here</p>
            </div>

            <!-- Content -->
            <TranslatedText
              v-else
              :text="translatedText"
              :detected-terms="detectedTerms"
              @term-click="handleTermClick"
              class="text-lg leading-relaxed text-gray-800"
            />

          </div>

          <!-- Detected Terms Bar (하단 고정) -->
          <DetectedTermsBar
            v-if="detectedTerms.length > 0 && translatedText"
            :terms="detectedTerms"
            @term-click="handleTermClick"
            class="flex-shrink-0 mx-4 mb-2"
          />

          <!-- Output Action Bar -->
          <div class="h-20 px-8 border-t border-gray-50 flex justify-end items-center gap-3 bg-white flex-shrink-0">
            <button 
              v-if="translatedText"
              @click="handleCopy"
              class="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Copy
            </button>
            <button 
              v-if="translatedText"
              @click="handleExport"
              class="px-5 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:border-blue-500 hover:text-blue-600 hover:shadow-md transition-all flex items-center gap-2 shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Export
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- Context Panel (Floating) -->
    <div 
      v-if="selectedProjectId && translationResult"
      class="absolute bottom-12 left-12 z-30"
    >
      <div 
        class="bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 overflow-hidden"
        :class="contextExpanded ? 'w-96' : 'w-auto'"
      >
        <button 
          @click="contextExpanded = !contextExpanded"
          class="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-50 transition-colors"
        >
          <div class="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <span class="font-bold text-sm text-gray-800 whitespace-nowrap">Context Details</span>
          <svg 
            class="w-4 h-4 text-gray-400 ml-auto transition-transform duration-300"
            :class="contextExpanded ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div v-if="contextExpanded" class="p-4 border-t border-gray-100 bg-gray-50/50">
          <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Context Summary</h4>
          <p class="text-sm text-gray-600 leading-relaxed bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            {{ translationResult.contextSummary || 'No context summary available.' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Term Detail Modal -->
    <TermDetailModal
      v-if="selectedTerm"
      :term="selectedTerm"
      @close="selectedTerm = null"
    />

    <!-- Toast Notifications -->
    <Transition name="toast">
      <div v-if="toast.show" class="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 bg-black text-white rounded-2xl shadow-2xl">
        <svg v-if="toast.type === 'success'" class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
        <svg v-else class="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span class="font-medium text-sm">{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ProjectSelector from '@/components/translation/ProjectSelector.vue'
import LanguageSwitcher from '@/components/translation/LanguageSwitcher.vue'
import TranslatedText from '@/components/translation/TranslatedText.vue'
import DetectedTermsBar from '@/components/translation/DetectedTermsBar.vue'
import TermDetailModal from '@/components/translation/TermDetailModal.vue'
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
const selectedTerm = ref(null)

// Toast
const toast = ref({
  show: false,
  message: '',
  type: 'success'
})

// Computed
const inputPlaceholder = computed(() => {
  if (selectedProjectId.value) {
    return 'Translating with project context. Enter text...'
  }
  return 'Enter text to translate...'
})

// Methods
async function loadProjects() {
  try {
    const response = await getUserProjects()
    projects.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    showToast('Failed to load projects.', 'error')
  }
}

async function handleTranslate() {
  if (!sourceText.value.trim()) {
    showToast('Please enter text to translate.', 'error')
    return
  }

  if (sourceLang.value === targetLang.value) {
    showToast('Source and target languages are the same.', 'error')
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
      showToast('Login required.', 'error')
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

    showToast('Translation completed!', 'success')
  } catch (error) {
    console.error('Translation error:', error)
    const errorMessage = error.response?.data?.detail || error.message || 'An error occurred during translation.'
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

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText()
    sourceText.value += text
  } catch (error) {
    console.error('Failed to read clipboard:', error)
    showToast('Could not read clipboard.', 'error')
  }
}

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(translatedText.value)
    showToast('Copied to clipboard!', 'success')
  } catch (error) {
    console.error('Failed to copy:', error)
    showToast('Failed to copy.', 'error')
  }
}

function handleExport() {
  const blob = new Blob([translatedText.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `translation-${Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
  showToast('Translation exported!', 'success')
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

function onLanguageSwap() {
  if (translatedText.value && sourceText.value) {
    const temp = sourceText.value
    sourceText.value = translatedText.value
    translatedText.value = temp
    detectedTerms.value = []
  }
}

function handleTermClick(term) {
  selectedTerm.value = term
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

onMounted(() => {
  loadProjects()
})
</script>

<style scoped>
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
  transform: translateY(1rem);
}
</style>
