<script setup>
/**
 * 일정 페이지 프로젝트 사이드바 컴포넌트
 * @description 프로젝트 목록과 각 프로젝트의 이벤트를 표시
 */
import { PlusIcon } from '@heroicons/vue/24/outline'
import { formatEventTime } from '@/composables/management/useScheduleDateFormat'
import { useRouter } from 'vue-router'

const router = useRouter()

/**
 * 실무 시나리오 회화연습 페이지로 이동
 */
const goToScenarioPractice = (event) => {
  router.push({
    path: '/conversation/scenario',
    query: { scheduleId: event.id }
  })
}

defineProps({
  /** 프로젝트 목록 */
  projects: {
    type: Array,
    required: true,
    default: () => []
  },
  /** 선택된 프로젝트 ID */
  selectedProjectId: {
    type: String,
    default: null
  },
  /** 모든 이벤트 */
  allEvents: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  /** 프로젝트 선택 */
  'select-project',
  /** 새 프로젝트 생성 */
  'create-project',
  /** 이벤트 클릭 */
  'event-click'
])

/**
 * 프로젝트별 이벤트 필터링
 */
const getProjectEvents = (projectId, allEvents) => {
  return allEvents.filter(
    (event) =>
      event.extendedProps.project && event.extendedProps.project.id === projectId
  )
}
</script>

<template>
  <div class="w-full md:w-1/4 md:min-w-[280px] md:max-w-[400px] flex-shrink-0 flex flex-col bg-gray-50/50 rounded-2xl border border-gray-200/50 overflow-hidden backdrop-blur-sm">
    <!-- Header -->
    <div class="p-5 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900">프로젝트</h2>
      <div class="flex items-center gap-1">
        <router-link
          to="/management/project"
          class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all"
          title="프로젝트 페이지로 이동"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </router-link>
        <button
          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title="새 프로젝트 생성"
          @click="emit('create-project')"
        >
          <PlusIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Project List -->
    <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
      <div v-for="project in projects" :key="project.id" class="space-y-2">
        <button
          class="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-3 group relative overflow-hidden"
          :class="selectedProjectId === project.id
            ? 'bg-white shadow-md shadow-blue-900/5 ring-1 ring-black/5'
            : 'bg-white/50 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100'"
          @click="emit('select-project', project.id)"
        >
          <!-- Active Indicator -->
          <div
            v-if="selectedProjectId === project.id"
            class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-xl"
          ></div>

          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            :class="selectedProjectId === project.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600 group-hover:bg-gray-50'"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between mb-0.5">
              <span
                class="text-sm font-bold truncate"
                :class="selectedProjectId === project.id ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'"
              >
                {{ project.name }}
              </span>
              <span
                v-if="getProjectEvents(project.id, allEvents).length > 0"
                class="text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors"
                :class="selectedProjectId === project.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'"
              >
                {{ getProjectEvents(project.id, allEvents).length }}
              </span>
            </div>
            <p class="text-xs text-gray-400 truncate group-hover:text-gray-500 transition-colors">
              {{ project.description || '설명 없음' }}
            </p>
          </div>
        </button>

        <!-- Project Events List -->
        <div
          v-if="getProjectEvents(project.id, allEvents).length > 0"
          class="ml-6 pl-3 border-l border-gray-200 my-1 space-y-0.5"
        >
          <div
            v-for="event in getProjectEvents(project.id, allEvents)"
            :key="event.id"
            class="text-xs py-1.5 px-2 rounded hover:bg-gray-50 text-gray-600 cursor-pointer flex items-center gap-2 transition-colors group/event"
            @click.stop="emit('event-click', { event })"
          >
            <div
              class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover/event:scale-125"
              :style="{ backgroundColor: event.backgroundColor }"
            ></div>
            <span class="font-medium text-gray-500 w-14 flex-shrink-0 tabular-nums tracking-tight">
              {{ formatEventTime(event) }}
            </span>
            <span class="truncate text-gray-700 font-medium group-hover/event:text-gray-900 flex-1">
              {{ event.title }}
            </span>
            <!-- 실무 시나리오 회화연습 버튼 -->
            <button
              class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-semibold transition-colors flex-shrink-0"
              @click.stop="goToScenarioPractice(event)"
            >
              회화 연습
            </button>
          </div>
        </div>
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
