<script setup>
/**
 * Upcoming Tasks 컴포넌트
 *
 * 대시보드 사이드바 예정 일정 목록
 */
const props = defineProps({
  /** 이벤트 목록 */
  events: {
    type: Array,
    default: () => []
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  },
  /** 선택된 날짜 */
  selectedDate: {
    type: Date,
    default: null
  }
})

const emit = defineEmits([
  'clear-date',
  'go-to-practice'
])

// Helpers
const formatMonth = (date) => new Date(date).toLocaleString('en-US', { month: 'short' })
const formatDay = (date) => new Date(date).getDate()
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

const formatDateRange = (start, end) => {
  const s = new Date(start)
  const e = end ? new Date(end) : s
  const sDay = s.getDate()
  const eDay = e.getDate()
  const month = s.toLocaleString('en-US', { month: 'short' })

  if (sDay === eDay) return `${sDay}th ${month} ${s.getFullYear()}`
  return `${sDay}th - ${eDay}th ${month} ${s.getFullYear()}`
}
</script>

<template>
  <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-1 min-h-[300px] md:min-h-[250px]">
    <div class="flex items-center justify-between mb-3 shrink-0">
      <h3 class="font-bold text-gray-900">
        {{ selectedDate ? 'Tasks for ' + formatMonth(selectedDate) + ' ' + formatDay(selectedDate) : 'Upcoming Tasks' }}
      </h3>
      <button v-if="selectedDate" @click="emit('clear-date')" class="text-xs font-bold text-gray-400 hover:text-gray-600">Show All</button>
      <router-link v-else to="/management/schedule" class="text-xs font-bold text-blue-600 hover:text-blue-700">See all</router-link>
    </div>

    <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
      <!-- Loading -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="h-14 bg-gray-50 rounded-xl animate-pulse"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="events.length === 0" class="text-center py-4 text-gray-400">
        <p class="text-sm">No tasks {{ selectedDate ? 'on this day' : 'upcoming' }}</p>
      </div>

      <!-- Event List -->
      <div
        v-else
        v-for="event in events"
        :key="event.id"
        class="group flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent hover:shadow-md shrink-0"
        :class="[event.lightColorClass]"
      >
        <!-- Date Badge -->
        <div
          class="flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-sm shrink-0 transition-colors"
          :class="[event.colorClass]"
        >
          <span class="text-lg font-bold text-white">{{ formatDay(event.start) }}</span>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h4 class="font-bold text-gray-900 text-sm truncate">{{ event.title }}</h4>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-gray-500">{{ formatDateRange(event.start, event.end) }}</span>
            <span class="w-1 h-1 rounded-full bg-gray-300"></span>
            <span class="text-xs text-gray-500">{{ formatTime(event.start) }} - {{ formatTime(event.end || event.start) }}</span>
          </div>
          <div v-if="event.extendedProps?.project" class="text-xs text-gray-500 mt-0.5 truncate">
            {{ event.extendedProps.project.name }}
          </div>
        </div>

        <!-- Action Button -->
        <button
          @click="emit('go-to-practice', event)"
          class="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
