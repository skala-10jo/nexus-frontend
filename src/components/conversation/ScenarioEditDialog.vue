<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click="$emit('close')"
  >
    <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 class="text-2xl font-bold text-gray-900">Edit Scenario</h3>
        <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Content -->
      <div class="flex-1 overflow-y-auto p-8 space-y-6">
        <!-- Title -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
          <input
            v-model="localScenario.title"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
          >
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Description (Brief summary)</label>
          <textarea
            v-model="localScenario.description"
            rows="2"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"
            placeholder="Brief description shown on card..."
          ></textarea>
        </div>

        <!-- Scenario Text -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Scenario Text (Full content)</label>
          <textarea
            v-model="localScenario.scenarioText"
            rows="6"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"
            placeholder="Full scenario content for practice..."
          ></textarea>
        </div>

        <!-- Roles -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Role</label>
            <input
              v-model="localScenario.roles.user"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
            >
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Role</label>
            <input
              v-model="localScenario.roles.ai"
              type="text"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
            >
          </div>
        </div>

        <!-- Language & Difficulty -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Language</label>
            <select
              v-model="localScenario.language"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
            >
              <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                {{ lang.label }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
            <select
              v-model="localScenario.difficulty"
              class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
            >
              <option v-for="diff in difficultyOptions" :key="diff.value" :value="diff.value">
                {{ diff.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Project Selection -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Project (Optional)</label>
          <select
            v-model="localScenario.projectId"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
          >
            <option :value="null">None</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>

        <!-- Schedule Selection -->
        <div v-if="localScenario.projectId" class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule (Optional)</label>
          <select
            v-model="localScenario.scheduleId"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
          >
            <option :value="null">None (Use entire project)</option>
            <option v-for="schedule in filteredSchedules" :key="schedule.id" :value="schedule.id">
              {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
            </option>
          </select>
        </div>

        <!-- Keywords -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Keywords</label>
          <input
            v-model="localScenario.requiredTerminologyText"
            type="text"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800"
          >
        </div>
      </div>

      <!-- Footer -->
      <div class="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
        <button
          @click="$emit('close')"
          class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!isFormValid"
          class="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  scenario: {
    type: Object,
    default: () => ({})
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

const emit = defineEmits(['close', 'save'])

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

const localScenario = ref({
  id: '',
  title: '',
  description: '',
  scenarioText: '',
  roles: { user: '', ai: '' },
  language: 'en',
  difficulty: 'intermediate',
  requiredTerminologyText: '',
  projectId: null,
  scheduleId: null
})

// Sync with prop when dialog opens
watch(() => props.scenario, (newVal) => {
  if (newVal && newVal.id) {
    localScenario.value = {
      id: newVal.id,
      title: newVal.title || '',
      description: newVal.description || '',
      scenarioText: newVal.scenarioText || newVal.description || '',
      roles: { user: newVal.roles?.user || '', ai: newVal.roles?.ai || '' },
      language: newVal.language || 'en',
      difficulty: newVal.difficulty || 'intermediate',
      requiredTerminologyText: newVal.requiredTerminology ? newVal.requiredTerminology.join(', ') : '',
      projectId: newVal.projectIds?.[0] || null,
      scheduleId: newVal.scheduleIds?.[0] || null
    }
  }
}, { immediate: true })

const filteredSchedules = computed(() => {
  if (!localScenario.value.projectId) return []
  return props.upcomingSchedules.filter(s => s.projectId === localScenario.value.projectId)
})

const isFormValid = computed(() => {
  return (
    localScenario.value.title.trim() !== '' &&
    localScenario.value.scenarioText.trim() !== '' &&
    localScenario.value.roles.user.trim() !== '' &&
    localScenario.value.roles.ai.trim() !== ''
  )
})

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

function generateDescriptionFromText(scenarioText, existingDescription = '') {
  const description = existingDescription.trim()
  if (description) return description

  const sentences = scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
  return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
}

function handleSave() {
  const description = generateDescriptionFromText(
    localScenario.value.scenarioText,
    localScenario.value.description
  )

  const updateData = {
    id: localScenario.value.id,
    title: localScenario.value.title,
    description: description || localScenario.value.scenarioText.substring(0, 100),
    scenarioText: localScenario.value.scenarioText,
    language: localScenario.value.language,
    difficulty: localScenario.value.difficulty,
    roles: localScenario.value.roles,
    requiredTerminology: localScenario.value.requiredTerminologyText
      ? localScenario.value.requiredTerminologyText.split(',').map(t => t.trim()).filter(t => t)
      : [],
    projectId: localScenario.value.projectId,
    scheduleId: localScenario.value.scheduleId
  }

  emit('save', updateData)
}
</script>
