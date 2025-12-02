<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="handleClose"
  >
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 class="text-2xl font-bold text-gray-900">Create Scenario</h3>
        <button @click="handleClose" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content: Two Column Layout -->
      <div class="flex-1 flex overflow-hidden">
        <!-- Left Column: Scenario Form -->
        <div class="flex-1 overflow-y-auto p-8 border-r border-gray-100">
          <!-- Settings with Toggle Buttons -->
          <div class="space-y-6 mb-8">
            <!-- Language Toggle -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Language</label>
              <div class="flex gap-3">
                <button
                  v-for="lang in languageOptions"
                  :key="lang.value"
                  @click="generateOptions.language = lang.value"
                  :class="[
                    'flex-1 px-4 py-3 rounded-xl font-bold transition-all',
                    generateOptions.language === lang.value
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ lang.label }}
                </button>
              </div>
            </div>

            <!-- Difficulty Toggle -->
            <div class="space-y-3">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
              <div class="flex gap-3">
                <button
                  v-for="diff in difficultyOptions"
                  :key="diff.value"
                  @click="generateOptions.difficulty = diff.value"
                  :class="[
                    'flex-1 px-4 py-3 rounded-xl font-bold transition-all',
                    generateOptions.difficulty === diff.value
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  ]"
                >
                  {{ diff.label }}
                </button>
              </div>
            </div>
          </div>

          <!-- Project/Schedule Selection -->
          <div class="space-y-4 mb-8">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Project (Optional)</label>
              <select
                v-model="selectedProjectId"
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
              >
                <option :value="null">None</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <div v-if="selectedProjectId" class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule (Optional)</label>
              <select
                v-model="selectedScheduleId"
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
              >
                <option :value="null">None (Use entire project)</option>
                <option v-for="schedule in filteredSchedules" :key="schedule.id" :value="schedule.id">
                  {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Scenario Form -->
          <div class="space-y-6">
            <!-- Title with Unified AI Generate Button -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                <button
                  @click="generateAllFields"
                  :disabled="isGenerating"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <svg class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {{ isGenerating ? 'Generating...' : 'AI Generate' }}
                </button>
              </div>
              <input
                v-model="formData.title"
                type="text"
                placeholder="e.g. Product Demo Meeting"
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
              >
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Brief summary)</label>
              <textarea
                v-model="formData.description"
                rows="2"
                placeholder="Brief description shown on card..."
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"
              ></textarea>
            </div>

            <!-- Scenario Text -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Scenario Text (Full content)</label>
              <textarea
                v-model="formData.scenarioText"
                rows="6"
                placeholder="Full scenario content for practice..."
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"
              ></textarea>
            </div>

            <!-- Roles -->
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Role</label>
                <input
                  v-model="formData.userRole"
                  type="text"
                  placeholder="e.g. PM"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
                >
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Partner Role</label>
                <input
                  v-model="formData.aiRole"
                  type="text"
                  placeholder="e.g. Developer"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
                >
              </div>
            </div>

            <!-- Keywords -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Keywords (Comma separated)</label>
              <input
                v-model="formData.requiredTerminology"
                type="text"
                placeholder="e.g. agile, sprint, backlog"
                class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
              >
            </div>
          </div>
        </div>

        <!-- Right Column: AI Chatbot -->
        <div class="w-96 flex flex-col bg-gray-50">
          <!-- Chat Header -->
          <div class="p-4 border-b border-gray-200 flex items-start justify-between">
            <div>
              <h4 class="font-bold text-gray-900">AI Assistant</h4>
              <p class="text-xs text-gray-500 mt-1">프롬프트로 시나리오를 수정하세요</p>
            </div>
            <button
              @click="resetChat"
              class="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
              title="대화 초기화"
            >
              <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-if="chatMessages.length === 0" class="text-center text-gray-400 text-sm mt-8">
              시나리오에 대해 질문하거나<br>수정 요청을 해보세요
            </div>

            <div
              v-for="(msg, index) in chatMessages"
              :key="index"
              class="flex"
              :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                :class="[
                  'p-3 rounded-lg max-w-[80%]',
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800 border border-gray-200'
                ]"
              >
                <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
              </div>
            </div>

            <div v-if="isChatLoading" class="flex justify-start">
              <div class="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg max-w-[80%]">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input -->
          <div class="p-4 border-t border-gray-200">
            <div class="flex gap-2">
              <input
                v-model="chatInput"
                @keyup.enter="sendChatMessage"
                type="text"
                placeholder="예: 역할을 더 구체적으로 바꿔줘"
                class="flex-1 px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              />
              <button
                @click="sendChatMessage"
                :disabled="!chatInput.trim() || isChatLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                전송
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
        <button @click="handleClose" class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button
          @click="handleCreate"
          :disabled="!isFormValid"
          class="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Scenario
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { scenarioService } from '@/services/scenarioService'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  projects: {
    type: Array,
    default: () => []
  },
  upcomingSchedules: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'created'])

// Constants
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'ko', label: '한국어' }
]

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
]

// Form State
const generateOptions = ref({
  language: 'en',
  difficulty: 'intermediate'
})

const formData = ref({
  title: '',
  description: '',
  scenarioText: '',
  category: 'General',
  userRole: '',
  aiRole: '',
  requiredTerminology: ''
})

const selectedProjectId = ref(null)
const selectedScheduleId = ref(null)
const isGenerating = ref(false)

// Chat State
const chatMessages = ref([])
const chatInput = ref('')
const isChatLoading = ref(false)

// Computed
const filteredSchedules = computed(() => {
  if (!selectedProjectId.value) return []
  return props.upcomingSchedules.filter(s => s.projectId === selectedProjectId.value)
})

const isFormValid = computed(() => {
  return (
    formData.value.title.trim() !== '' &&
    formData.value.scenarioText.trim() !== '' &&
    formData.value.userRole.trim() !== '' &&
    formData.value.aiRole.trim() !== ''
  )
})

// Reset form when dialog closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

// Methods
function formatScheduleTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const today = new Date()
  const dateOnly = date.toDateString()
  const todayOnly = today.toDateString()

  if (dateOnly === todayOnly) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function resetForm() {
  formData.value = {
    title: '',
    description: '',
    scenarioText: '',
    category: 'General',
    userRole: '',
    aiRole: '',
    requiredTerminology: ''
  }
  selectedProjectId.value = null
  selectedScheduleId.value = null
  resetChat()
}

function resetChat() {
  chatMessages.value = []
  chatInput.value = ''
  isChatLoading.value = false
}

function handleClose() {
  emit('close')
}

async function generateAllFields() {
  if (isGenerating.value) return

  isGenerating.value = true
  try {
    const projectIds = selectedProjectId.value ? [selectedProjectId.value] : []
    const scheduleIds = selectedScheduleId.value ? [selectedScheduleId.value] : []

    const requestData = {
      projectIds,
      scheduleIds,
      documentIds: [],
      language: generateOptions.value.language,
      difficulty: generateOptions.value.difficulty,
      count: 1,
      saveToDb: false
    }

    const response = await scenarioService.generateFromProjects(requestData)

    if (response.data.data && response.data.data.length > 0) {
      const generated = response.data.data[0]
      formData.value.title = generated.title
      formData.value.description = generated.description
      formData.value.scenarioText = generated.scenarioText
      formData.value.userRole = generated.roles.user
      formData.value.aiRole = generated.roles.ai
      formData.value.requiredTerminology = generated.requiredTerminology.join(', ')
      formData.value.category = generated.category || 'General'
    }
  } catch (error) {
    console.error('Failed to generate scenario:', error)
    alert('Failed to generate scenario. Please try again.')
  } finally {
    isGenerating.value = false
  }
}

async function sendChatMessage() {
  if (!chatInput.value.trim() || isChatLoading.value) return

  chatMessages.value.push({
    role: 'user',
    content: chatInput.value
  })

  const userMessage = chatInput.value
  chatInput.value = ''
  isChatLoading.value = true

  try {
    const currentScenario = {
      title: formData.value.title,
      description: formData.value.description,
      scenarioText: formData.value.scenarioText,
      userRole: formData.value.userRole,
      aiRole: formData.value.aiRole,
      category: formData.value.category,
      requiredTerminology: formData.value.requiredTerminology
    }

    const response = await scenarioService.modifyWithChat({
      currentScenario,
      userMessage,
      language: generateOptions.value.language,
      difficulty: generateOptions.value.difficulty
    })

    const modifiedFields = response.data.data.modifiedScenario
    if (modifiedFields.title) formData.value.title = modifiedFields.title
    if (modifiedFields.description) formData.value.description = modifiedFields.description
    if (modifiedFields.scenarioText) formData.value.scenarioText = modifiedFields.scenarioText
    if (modifiedFields.userRole) formData.value.userRole = modifiedFields.userRole
    if (modifiedFields.aiRole) formData.value.aiRole = modifiedFields.aiRole
    if (modifiedFields.category) formData.value.category = modifiedFields.category
    if (modifiedFields.requiredTerminology) formData.value.requiredTerminology = modifiedFields.requiredTerminology

    chatMessages.value.push({
      role: 'assistant',
      content: response.data.data.message
    })
  } catch (error) {
    console.error('Failed to send chat message:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
    })
  } finally {
    isChatLoading.value = false
  }
}

function generateDescriptionFromText(scenarioText, existingDescription = '') {
  const description = existingDescription.trim()
  if (description) return description

  const sentences = scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
  return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
}

function handleCreate() {
  const description = generateDescriptionFromText(
    formData.value.scenarioText,
    formData.value.description
  )

  const scenarioData = {
    title: formData.value.title,
    description: description || formData.value.scenarioText.substring(0, 100),
    scenarioText: formData.value.scenarioText,
    language: generateOptions.value.language,
    difficulty: generateOptions.value.difficulty,
    category: formData.value.category,
    roles: {
      user: formData.value.userRole,
      ai: formData.value.aiRole
    },
    requiredTerminology: formData.value.requiredTerminology
      ? formData.value.requiredTerminology.split(',').map(t => t.trim()).filter(t => t)
      : [],
    autoGenerated: false,
    projectId: selectedProjectId.value,
    scheduleId: selectedScheduleId.value
  }

  emit('created', scenarioData)
}
</script>
