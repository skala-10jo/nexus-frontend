<script setup>
/**
 * 시나리오 페이지 프로젝트 사이드바 컴포넌트
 * @description 프로젝트 목록과 각 프로젝트의 일정을 표시 (다중 선택 지원)
 */

defineProps({
  /** 프로젝트 목록 */
  projects: {
    type: Array,
    required: true,
    default: () => []
  },
  /** 선택된 프로젝트 목록 */
  selectedProjects: {
    type: Array,
    default: () => []
  },
  /** 선택된 일정 목록 */
  selectedSchedules: {
    type: Array,
    default: () => []
  },
  /** 모든 일정 */
  upcomingSchedules: {
    type: Array,
    default: () => []
  },
  /** 프로젝트 로딩 상태 */
  projectsLoading: {
    type: Boolean,
    default: false
  },
  /** 일정 로딩 상태 */
  schedulesLoading: {
    type: Boolean,
    default: false
  },
  /** 시나리오 목록 (프로젝트별 개수 계산용) */
  scenarios: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  /** 프로젝트 선택 토글 */
  'toggle-project',
  /** 일정 선택 토글 */
  'toggle-schedule',
  /** 전체 시나리오 보기 */
  'show-all'
])

/**
 * 프로젝트별 일정 필터링
 */
const getProjectSchedules = (projectId, schedules) => {
  return schedules.filter(schedule => schedule.projectId === projectId)
}

/**
 * 프로젝트가 선택되었는지 확인
 */
const isProjectSelected = (projectId, selectedProjects) => {
  return selectedProjects.some(p => p.id === projectId)
}

/**
 * 일정이 선택되었는지 확인
 */
const isScheduleSelected = (scheduleId, selectedSchedules) => {
  return selectedSchedules.some(s => s.id === scheduleId)
}

/**
 * 프로젝트별 시나리오 개수 계산
 */
const getProjectScenarioCount = (projectId, scenarios) => {
  return scenarios.filter(scenario => {
    const projectIds = scenario.projectIds || []
    return projectIds.includes(projectId)
  }).length
}

/**
 * 날짜 포맷팅 (M/D 형식)
 */
const formatDate = (dateTimeString) => {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return `${date.getMonth() + 1}/${date.getDate()}`
}
</script>

<template>
  <div
    class="w-1/4 min-w-[280px] max-w-[400px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
    <!-- Header -->
    <div class="p-5 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900">프로젝트</h2>
      <div class="flex items-center gap-2">
        <span v-if="selectedProjects.length > 0" class="text-xs text-blue-600 font-bold">
          {{ selectedProjects.length }}개 선택됨
        </span>
        <router-link to="/management/project"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          title="프로젝트 페이지로 이동">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </router-link>
      </div>
    </div>

    <!-- Show All Button -->
    <div class="px-3 pb-2">
      <button
        @click="emit('show-all')"
        class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
        :class="selectedProjects.length === 0 && selectedSchedules.length === 0
          ? 'bg-blue-50 text-blue-800 font-bold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <div class="w-6 h-6 rounded flex items-center justify-center transition-colors flex-shrink-0"
          :class="selectedProjects.length === 0 && selectedSchedules.length === 0 ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
        <span class="text-base font-medium">전체 프로젝트</span>
        <span class="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto"
          :class="selectedProjects.length === 0 && selectedSchedules.length === 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
          {{ scenarios.length }}
        </span>
      </button>
    </div>

    <div class="mx-3 border-t border-gray-100 mb-2"></div>

    <!-- Loading State -->
    <div v-if="projectsLoading" class="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
      <div v-for="i in 3" :key="i" class="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
    </div>

    <!-- Project List -->
    <div v-else-if="projects.length > 0" class="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
      <div v-for="project in projects" :key="project.id" class="space-y-2">
        <button
          class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group relative overflow-hidden"
          :class="isProjectSelected(project.id, selectedProjects)
            ? 'bg-blue-50 text-blue-800 font-bold'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'" @click="emit('toggle-project', project)">
          <div class="w-6 h-6 rounded flex items-center justify-center transition-colors flex-shrink-0"
            :class="isProjectSelected(project.id, selectedProjects) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <span class="text-base font-medium truncate"
                :class="isProjectSelected(project.id, selectedProjects) ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'">
                {{ project.name }}
              </span>
              <span class="text-xs font-semibold px-1.5 py-0.5 rounded-full transition-colors"
                :class="isProjectSelected(project.id, selectedProjects) ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'">
                {{ getProjectScenarioCount(project.id, scenarios) }}
              </span>
            </div>
          </div>
        </button>

        <!-- Project Schedules List -->
        <div v-if="getProjectSchedules(project.id, upcomingSchedules).length > 0"
          class="ml-6 pl-3 border-l border-gray-200 my-1 space-y-0.5">
          <div v-for="schedule in getProjectSchedules(project.id, upcomingSchedules)" :key="schedule.id"
            class="text-xs py-1.5 px-2 rounded cursor-pointer flex items-center gap-2 transition-colors group/schedule"
            :class="isScheduleSelected(schedule.id, selectedSchedules)
              ? 'bg-blue-50 text-blue-700'
              : 'hover:bg-gray-50 text-gray-600'" @click.stop="emit('toggle-schedule', schedule)">
            <div class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover/schedule:scale-125"
              :class="isScheduleSelected(schedule.id, selectedSchedules) ? 'bg-blue-500' : 'bg-gray-400'"></div>
            <span class="font-medium w-16 flex-shrink-0 tabular-nums tracking-tight"
              :class="isScheduleSelected(schedule.id, selectedSchedules) ? 'text-blue-600' : 'text-gray-500'">
              {{ formatDate(schedule.startTime) }}
            </span>
            <span class="truncate font-medium group-hover/schedule:text-gray-900"
              :class="isScheduleSelected(schedule.id, selectedSchedules) ? 'text-blue-700' : 'text-gray-700'">
              {{ schedule.title }}
            </span>
            <!-- Schedule Selected Indicator -->
            <div v-if="isScheduleSelected(schedule.id, selectedSchedules)"
              class="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0 ml-auto"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex items-center justify-center text-gray-400 p-6">
      <div class="text-center">
        <svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <p class="text-sm font-medium">프로젝트가 없습니다</p>
        <router-link to="/management/project" class="text-xs text-blue-600 hover:underline mt-1 inline-block">
          프로젝트 생성하기
        </router-link>
      </div>
    </div>

    <!-- Selected Schedules Summary -->
    <div v-if="selectedSchedules.length > 0" class="p-3 border-t border-gray-200 bg-blue-50/50">
      <div class="flex items-center justify-between text-xs">
        <span class="text-blue-700 font-medium">
          {{ selectedSchedules.length }}개 일정 선택됨
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
