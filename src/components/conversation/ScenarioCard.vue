<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex gap-2">
        <span class="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 text-xl hover:scale-110 transition-transform">
          {{ languageFlag }}
        </span>
        <span
          class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center"
          :class="difficultyClass"
        >
          {{ difficultyLabel }}
        </span>
      </div>

      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="$emit('edit', scenario)"
          class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', scenario.id)"
          class="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Title & Description -->
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
      {{ scenario.title }}
    </h3>
    <p class="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
      {{ scenario.description }}
    </p>

    <!-- Project & Schedule Link -->
    <div v-if="linkedProject || linkedSchedule" class="mb-4 space-y-1.5">
      <!-- Project -->
      <div v-if="linkedProject" class="flex items-center gap-2 text-xs">
        <span class="w-5 h-5 bg-blue-100 rounded-md flex items-center justify-center">
          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </span>
        <span class="text-gray-500 font-medium truncate">{{ linkedProject.name }}</span>
      </div>
      <!-- Schedule -->
      <div v-if="linkedSchedule" class="flex items-center gap-2 text-xs">
        <span class="w-5 h-5 bg-green-100 rounded-md flex items-center justify-center shrink-0">
          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <span class="text-gray-500 font-medium truncate">{{ linkedSchedule.title }}</span>
        <span v-if="formattedScheduleDateTime" class="text-gray-400 shrink-0">{{ formattedScheduleDateTime }}</span>
      </div>
    </div>

    <!-- Roles -->
    <div class="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
      <div class="flex items-center gap-2 text-xs">
        <span class="w-16 text-gray-400 font-medium">You</span>
        <span class="font-bold text-gray-800">{{ scenario.roles.user }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="w-16 text-gray-400 font-medium">AI</span>
        <span class="font-bold text-gray-800">{{ scenario.roles.ai }}</span>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="$emit('start', scenario.id)"
      class="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
    >
      <span>연습 시작</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  },
  /** 프로젝트 목록 (이름 조회용) */
  projects: {
    type: Array,
    default: () => []
  },
  /** 일정 목록 (이름 조회용) */
  schedules: {
    type: Array,
    default: () => []
  }
})

/**
 * 연결된 프로젝트 정보
 */
const linkedProject = computed(() => {
  if (!props.scenario.projectIds?.length || !props.projects.length) return null
  const projectId = props.scenario.projectIds[0]
  return props.projects.find(p => String(p.id) === String(projectId))
})

/**
 * 연결된 일정 정보
 */
const linkedSchedule = computed(() => {
  if (!props.scenario.scheduleIds?.length || !props.schedules.length) return null
  const scheduleId = props.scenario.scheduleIds[0]
  return props.schedules.find(s => String(s.id) === String(scheduleId))
})

/**
 * 일정 날짜/시간 포맷팅
 */
const formattedScheduleDateTime = computed(() => {
  if (!linkedSchedule.value?.startTime) return ''
  const date = new Date(linkedSchedule.value.startTime)
  const month = date.getMonth() + 1
  const day = date.getDate()

  // 종일 이벤트인 경우
  if (linkedSchedule.value.allDay) {
    return `${month}/${day} 종일`
  }

  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}/${day} ${hours}:${minutes}`
})

defineEmits(['edit', 'delete', 'start'])

const languageFlag = computed(() => {
  const flags = {
    'EN': '🇺🇸',
    'VI': '🇻🇳',
    'KO': '🇰🇷',
    'JA': '🇯🇵',
    'ZH': '🇨🇳',
    'ES': '🇪🇸',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'PT': '🇧🇷',
    'RU': '🇷🇺',
    'TH': '🇹🇭',
    'ID': '🇮🇩'
  }
  const lang = props.scenario.language?.toUpperCase()
  return flags[lang] || '🌐'
})

const difficultyClass = computed(() => {
  const classes = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  }
  return classes[props.scenario.difficulty] || 'bg-gray-100 text-gray-700'
})

const difficultyLabel = computed(() => {
  const labels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[props.scenario.difficulty] || props.scenario.difficulty
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
