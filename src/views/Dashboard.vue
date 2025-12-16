<template>
  <div class="min-h-full overflow-y-auto bg-gray-50/50 p-4 md:p-6">
    <div class="max-w-[1600px] mx-auto flex flex-col gap-4">

      <!-- Mobile Layout -->
      <div class="flex flex-col gap-4 pb-16 lg:hidden">
        <!-- Greeting + Check-in + Schedule -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-5">
          <div class="flex items-start gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-semibold text-gray-500">환영합니다</div>
              <p class="text-2xl font-bold text-gray-900">
                {{ greeting }},
              </p>
              <p class="text-2xl font-bold">
                <span class="text-blue-900">{{ userName }}</span><span class="text-gray-900"> 님!</span>
              </p>

              <div class="mt-4 flex flex-col gap-2 pr-4">
                <div class="text-sm font-semibold text-gray-500">오늘의 일정</div>
                <div
                  v-if="!scheduleMessage?.eventTitle"
                  class="text-lg font-bold text-gray-900"
                >
                  오늘 예정된 일정이 없어요
                </div>
                <p
                  v-if="scheduleMessage?.text"
                  class="text-base font-semibold text-gray-700 break-words"
                >
                  <template
                    v-for="(segment, index) in formattedScheduleTextSegments"
                    :key="index"
                  >
                    <span
                      v-if="segment.bold"
                      class="font-bold text-blue-900"
                    >
                      {{ segment.text }}
                    </span>
                    <span v-else>{{ segment.text }}</span>
                  </template>
                </p>
              </div>
            </div>
            <div class="flex flex-col items-center w-28 shrink-0 self-end gap-2">
              <div class="relative flex flex-col items-center">
                <div class="speech-bubble text-xs font-semibold text-gray-700 text-center">
                  <span>{{ isCheckedIn ? '출석 완료! 🌟' : '출석하세용 ⭐️' }}</span>
                  <!-- 출석 버튼 -->
                  <button
                    @click="handleCheckIn"
                    :disabled="isCheckedIn"
                    class="mt-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all w-full flex items-center justify-center gap-1"
                    :class="isCheckedIn
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95'"
                  >
                    <span>{{ isCheckedIn ? '완료' : '출check' }}</span>
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
              <img
                src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
                alt="User Avatar"
                class="w-20 h-20 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <!-- 회화 연습 버튼 (일정 있으면 표시) -->
          <button
            v-if="scheduleMessage?.hasSchedule"
            @click="goToPractice(scheduleMessage?.link?.query?.scheduleId)"
            class="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-100 hover:bg-blue-100 transition-colors"
          >
            회화 연습 바로가기
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <!-- 오늘의 표현 -->
        <ExpressionCarousel
          :expressions="expressions"
          class="shadow-none border border-gray-100"
        />

        <!-- 퀴즈 통계 -->
        <PerformanceChart />

        <!-- 달력 -->
        <MiniCalendar
          :all-events="allEvents"
          :selected-date="selectedDate"
          :has-attendance="hasAttendance"
          :get-event-color="getEventColor"
          @select-date="selectDate"
        />

        <!-- 퀵 액션 -->
        <QuickActionsSwiper />
      </div>

      <!-- Desktop Layout -->
      <div class="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        <!-- 왼쪽 열 (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-4">
          <!-- 1. Scenario Cards -->
          <ScenarioCards
            :user="user"
            :upcoming-events="upcomingEvents"
            :schedule-message="scheduleMessage"
            :is-checked-in="isCheckedIn"
            :banner-scenarios="bannerScenarios"
            :loading-scenarios="loadingScenarios"
            @check-in="handleCheckIn"
          />

          <!-- 2. Expression Carousel -->
          <ExpressionCarousel
            :expressions="expressions"
          />

          <!-- 3. Performance Chart & Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <PerformanceChart />
            <QuickActionsSwiper />
          </div>
        </div>

        <!-- 오른쪽 열 (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4">
          <!-- 1. Mini Calendar -->
          <MiniCalendar
            :all-events="allEvents"
            :selected-date="selectedDate"
            :has-attendance="hasAttendance"
            :get-event-color="getEventColor"
            @select-date="selectDate"
          />

          <!-- 4. Upcoming Tasks -->
          <UpcomingTasks
            :events="upcomingEvents"
            :loading="loadingEvents"
            :selected-date="selectedDate"
            @clear-date="clearSelectedDate"
            @go-to-practice="goToPractice"
          />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Dashboard 페이지
 *
 * @description 레이아웃 조립 및 컴포넌트 연결만 담당
 */
import { computed } from 'vue'
import ScenarioCards from '@/components/dashboard/ScenarioCards.vue'
import ExpressionCarousel from '@/components/dashboard/ExpressionCarousel.vue'
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue'
import QuickActionsSwiper from '@/components/dashboard/QuickActionsSwiper.vue'
import MiniCalendar from '@/components/dashboard/MiniCalendar.vue'
import UpcomingTasks from '@/components/dashboard/UpcomingTasks.vue'

import { useDashboard } from '@/composables/dashboard/useDashboard'

// Composable로 모든 로직 위임
const {
  // State
  user,
  selectedDate,
  todayExpression,
  expressions,
  allEvents,
  loadingEvents,
  isCheckedIn,
  bannerScenarios,
  loadingScenarios,

  // Computed
  upcomingEvents,
  scheduleMessage,

  // Actions
  handleCheckIn,
  selectDate,
  clearSelectedDate,
  goToPractice,
  getEventColor,
  hasAttendance
} = useDashboard()

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Good Morning'
  if (hour >= 12 && hour < 18) return 'Good Afternoon'
  return 'Good Evening'
})

const userName = computed(() => user.value?.fullName || user.value?.username || '사용자')

const formattedScheduleTextSegments = computed(() => {
  const text = scheduleMessage.value?.text || ''
  if (!text) return []

  const segments = []
  const regex = /"([^"]+)"/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        bold: false
      })
    }
    segments.push({ text: match[1], bold: true })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      bold: false
    })
  }

  if (segments.length === 0) {
    return [{ text, bold: false }]
  }

  return segments
})
</script>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

.speech-bubble {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  gap: 0.35rem;
  background: #fff;
  padding: 0.6rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 1.5rem;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1);
  min-width: 90px;
}

.speech-bubble::before {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -10px;
  transform: translateX(-50%);
  border-width: 10px 9px 0 9px;
  border-style: solid;
  border-color: #e5e7eb transparent transparent transparent;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -9px;
  transform: translateX(-50%);
  border-width: 9px 8px 0 8px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}
</style>
