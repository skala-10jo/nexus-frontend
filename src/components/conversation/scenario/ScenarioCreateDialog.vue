<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4"
    @click="handleClose"
  >
    <div class="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-6xl md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col" @click.stop>
      <!-- Header -->
      <div class="p-4 md:p-8 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
        <h3 class="text-xl md:text-2xl font-bold text-gray-900">시나리오 생성</h3>
        <button @click="handleClose" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile Tabs -->
      <div class="flex md:hidden border-b border-gray-100 shrink-0">
        <button
          @click="mobileTab = 'form'"
          class="flex-1 py-3 text-sm font-bold transition-colors relative"
          :class="mobileTab === 'form' ? 'text-gray-900' : 'text-gray-400'"
        >
          시나리오 설정
          <div v-if="mobileTab === 'form'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
        </button>
        <button
          @click="mobileTab = 'chat'"
          class="flex-1 py-3 text-sm font-bold transition-colors relative"
          :class="mobileTab === 'chat' ? 'text-gray-900' : 'text-gray-400'"
        >
          AI Assistant
          <div v-if="mobileTab === 'chat'" class="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></div>
        </button>
      </div>

      <!-- Content: Two Column Layout -->
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
        <!-- Left Column: Scenario Form -->
        <div
          class="flex-1 overflow-y-auto p-4 md:p-8 border-r-0 md:border-r border-gray-100"
          :class="{ 'hidden md:block': mobileTab !== 'form' }"
        >
          <!-- Settings with Toggle Buttons -->
          <div class="mb-8">
            <LanguageDifficultyToggle
              v-model="generateOptions"
              :languageOptions="languageOptions"
              :difficultyOptions="difficultyOptions"
            />
          </div>

          <!-- Project/Schedule Selection -->
          <div class="mb-8">
            <ProjectScheduleSelector
              :projects="projects"
              :filteredSchedules="filteredSchedules"
              :selectedProjectId="selectedProjectId"
              :selectedScheduleId="selectedScheduleId"
              :showProjectDropdown="showProjectDropdown"
              :showScheduleDropdown="showScheduleDropdown"
              :formatScheduleTime="formatScheduleTime"
              @select-project="selectProject"
              @select-schedule="selectSchedule"
              @toggle-project-dropdown="toggleProjectDropdown"
              @toggle-schedule-dropdown="toggleScheduleDropdown"
            />
          </div>

          <!-- Scenario Form -->
          <ScenarioFormSection
            v-model:formData="formData"
            :isGenerating="isGenerating"
            @generate="generateAllFields"
          />
        </div>

        <!-- Right Column: AI Chatbot -->
        <ScenarioAIChat
          :class="{ 'hidden md:flex': mobileTab !== 'chat' }"
          :messages="chatMessages"
          v-model:inputValue="chatInput"
          :isLoading="isChatLoading"
          @send="sendChatMessage"
          @reset="resetChat"
        />
      </div>

      <!-- Footer -->
      <div class="p-4 md:p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
        <button @click="handleClose" class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">
          취소
        </button>
        <button
          @click="handleCreate"
          :disabled="!isFormValid"
          class="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          시나리오 생성
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useScenarioCreateDialog } from '@/composables/conversation/useScenarioCreateDialog'

// Components
import LanguageDifficultyToggle from './LanguageDifficultyToggle.vue'
import ProjectScheduleSelector from './ProjectScheduleSelector.vue'
import ScenarioFormSection from './ScenarioFormSection.vue'
import ScenarioAIChat from './ScenarioAIChat.vue'

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

// Use composable for all business logic
const {
  // Constants
  languageOptions,
  difficultyOptions,

  // State - Form
  generateOptions,
  formData,

  // State - Selection
  selectedProjectId,
  selectedScheduleId,

  // State - Dropdown
  showProjectDropdown,
  showScheduleDropdown,

  // State - UI
  mobileTab,
  isGenerating,

  // State - Chat
  chatMessages,
  chatInput,
  isChatLoading,

  // Computed
  filteredSchedules,
  isFormValid,

  // Methods - Utility
  formatScheduleTime,

  // Methods - Form Management
  resetChat,
  handleClose,
  handleCreate,

  // Methods - Selection
  selectProject,
  selectSchedule,
  toggleProjectDropdown,
  toggleScheduleDropdown,

  // Methods - AI
  generateAllFields,
  sendChatMessage
} = useScenarioCreateDialog(props, emit)
</script>
