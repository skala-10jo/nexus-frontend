<template>
  <div class="space-y-4">
    <!-- Project Selection -->
    <div class="space-y-2 relative">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">프로젝트 (선택)</label>
      <button
        @click="$emit('toggle-project-dropdown')"
        class="w-full px-4 py-3 bg-gray-50 border border-transparent hover:bg-gray-100 rounded-xl font-medium text-gray-900 transition-all text-left flex items-center justify-between"
      >
        <span :class="!selectedProjectId ? 'text-gray-500' : 'text-gray-900'">
          {{ selectedProjectName }}
        </span>
        <ChevronDownIcon class="w-5 h-5 text-gray-400" />
      </button>

      <!-- Project Dropdown -->
      <div
        v-if="showProjectDropdown"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-60 overflow-y-auto"
      >
        <button
          @click="$emit('select-project', null)"
          class="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-50"
        >
          선택 안함
        </button>
        <button
          v-for="project in projects"
          :key="project.id"
          @click="$emit('select-project', project.id)"
          class="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-900"
          :class="{ 'bg-blue-50 text-blue-700': selectedProjectId === project.id }"
        >
          {{ project.name }}
        </button>
      </div>
    </div>

    <!-- Schedule Selection (only when project selected) -->
    <div v-if="selectedProjectId" class="space-y-2 relative">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">일정 (선택)</label>
      <button
        @click="$emit('toggle-schedule-dropdown')"
        class="w-full px-4 py-3 bg-gray-50 border border-transparent hover:bg-gray-100 rounded-xl font-medium text-gray-900 transition-all text-left flex items-center justify-between"
      >
        <span :class="!selectedScheduleId ? 'text-gray-500' : 'text-gray-900'">
          {{ selectedScheduleName }}
        </span>
        <ChevronDownIcon class="w-5 h-5 text-gray-400" />
      </button>

      <!-- Schedule Dropdown -->
      <div
        v-if="showScheduleDropdown"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-20 max-h-60 overflow-y-auto"
      >
        <button
          @click="$emit('select-schedule', null)"
          class="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-500 border-b border-gray-50"
        >
          선택 안함 (프로젝트 전체)
        </button>
        <button
          v-for="schedule in filteredSchedules"
          :key="schedule.id"
          @click="$emit('select-schedule', schedule.id)"
          class="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-900"
          :class="{ 'bg-blue-50 text-blue-700': selectedScheduleId === schedule.id }"
        >
          {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  projects: {
    type: Array,
    default: () => []
  },
  filteredSchedules: {
    type: Array,
    default: () => []
  },
  selectedProjectId: {
    type: [String, Number, null],
    default: null
  },
  selectedScheduleId: {
    type: [String, Number, null],
    default: null
  },
  showProjectDropdown: {
    type: Boolean,
    default: false
  },
  showScheduleDropdown: {
    type: Boolean,
    default: false
  },
  formatScheduleTime: {
    type: Function,
    required: true
  }
})

defineEmits([
  'select-project',
  'select-schedule',
  'toggle-project-dropdown',
  'toggle-schedule-dropdown'
])

// Computed
const selectedProjectName = computed(() => {
  if (!props.selectedProjectId) return '선택 안함'
  const project = props.projects.find(p => p.id === props.selectedProjectId)
  return project?.name || '선택 안함'
})

const selectedScheduleName = computed(() => {
  if (!props.selectedScheduleId) return '선택 안함 (프로젝트 전체)'
  const schedule = props.filteredSchedules.find(s => s.id === props.selectedScheduleId)
  return schedule?.title || '선택 안함 (프로젝트 전체)'
})
</script>
