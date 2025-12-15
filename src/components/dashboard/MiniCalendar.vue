<script setup>
/**
 * Mini Calendar 컴포넌트
 *
 * 대시보드 사이드바 캘린더 - 월별 날짜 표시, 이벤트 표시, 출석 표시
 */
import { ref, computed } from 'vue'

const props = defineProps({
  /** 모든 이벤트 배열 */
  allEvents: {
    type: Array,
    default: () => []
  },
  /** 선택된 날짜 */
  selectedDate: {
    type: Date,
    default: null
  },
  /** 출석 확인 함수 */
  hasAttendance: {
    type: Function,
    required: true
  },
  /** 이벤트 색상 반환 함수 */
  getEventColor: {
    type: Function,
    required: true
  }
})

const emit = defineEmits([
  'select-date',
  'update:selectedDate'
])

// Local state for calendar navigation
const currentDate = ref(new Date())

// Computed
const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('en-US', { month: 'long' })
})

const currentYear = computed(() => {
  return currentDate.value.getFullYear()
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days = []

  // Previous month padding (Sunday start: 0 = Sun, 6 = Sat)
  const startPadding = firstDay.getDay()

  for (let i = 0; i < startPadding; i++) {
    const d = new Date(year, month, 0 - i)
    days.unshift({ date: d, isCurrentMonth: false, isToday: false, eventInfo: null })
  }

  // Current month
  const today = new Date()
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i)
    const isToday = d.toDateString() === today.toDateString()

    // Find events covering this day
    const dayEvents = props.allEvents.filter(e => {
      const start = new Date(e.start)
      const end = e.end ? new Date(e.end) : new Date(start)
      const check = new Date(d.getFullYear(), d.getMonth(), d.getDate())
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      const e_ = new Date(end.getFullYear(), end.getMonth(), end.getDate())

      return check >= s && check <= e_
    })

    let eventInfo = null
    if (dayEvents.length > 0) {
      // Priority: Earliest End Date
      dayEvents.sort((a, b) => {
        const endA = a.end ? new Date(a.end) : new Date(a.start)
        const endB = b.end ? new Date(b.end) : new Date(b.start)
        return endA - endB
      })

      const topEvent = dayEvents[0]
      const colors = props.getEventColor(topEvent.id)
      const start = new Date(topEvent.start)
      const isStart = start.toDateString() === d.toDateString()

      eventInfo = {
        id: topEvent.id,
        color: colors.bg,
        lightColor: colors.light,
        isStart,
        isContinued: !isStart
      }
    }

    days.push({ date: d, isCurrentMonth: true, isToday, eventInfo })
  }

  // Next month padding
  const totalCells = days.length
  const rows = Math.ceil(totalCells / 7)
  const targetCells = rows * 7
  const remaining = targetCells - totalCells

  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i)
    days.push({ date: d, isCurrentMonth: false, isToday: false, eventInfo: null })
  }

  return days
})

// Methods
function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

function selectDate(date) {
  if (props.selectedDate && props.selectedDate.toDateString() === date.toDateString()) {
    emit('select-date', null)
    emit('update:selectedDate', null)
  } else {
    emit('select-date', date)
    emit('update:selectedDate', date)
  }
}

function isSelected(date) {
  return props.selectedDate && props.selectedDate.toDateString() === date.toDateString()
}
</script>

<template>
  <div class="bg-white rounded-[2rem] p-5 shadow-sm border border-gray-100 flex flex-col relative z-10">
    <div class="flex items-center justify-between mb-3 shrink-0">
      <h3 class="font-bold text-gray-900 uppercase tracking-wider text-xs">
        {{ currentMonthName }} {{ currentYear }}
      </h3>
      <div class="flex gap-1">
        <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="mt-3 space-y-2">
      <!-- Day headers (Sun ~ Sat) -->
      <div class="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 tracking-wider">
        <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
          {{ day }}
        </span>
      </div>

      <!-- Date grid -->
      <div class="grid grid-cols-7 gap-x-1 gap-y-1 text-center">
        <div
          v-for="{ date, isCurrentMonth, isToday, eventInfo } in calendarDays"
          :key="date.toISOString()"
          class="flex items-center justify-center py-1"
        >
          <button
            @click="selectDate(date)"
            class="
              relative
              w-10 h-10 md:w-11 md:h-11
              flex items-center justify-center
              rounded-full
              text-[12px] md:text-xs font-medium
              transition-all
              cursor-pointer
            "
            :class="[
              !isCurrentMonth ? 'text-gray-300' : 'text-gray-700',
              !eventInfo?.isStart && isCurrentMonth && !isToday ? 'hover:bg-gray-100' : '',
              eventInfo?.isStart ? `${eventInfo.color} text-white shadow-md` : '',
              eventInfo?.isContinued ? `${eventInfo.lightColor} text-gray-700` : '',
              isSelected(date) && !eventInfo ? 'ring-2 ring-blue-600 ring-offset-2' : '',
              isToday ? 'ring-[3px] ring-inset ring-gray-900 font-extrabold z-10 overflow-hidden' : ''
            ]"
          >
            <span class="relative z-10">{{ date.getDate() }}</span>

            <img
              v-if="hasAttendance(date)"
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Star.png"
              alt="Attendance"
              class="absolute inset-0 w-full h-full object-contain p-0.5 opacity-90 z-0 pointer-events-none"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
