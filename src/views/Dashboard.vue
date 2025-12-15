<template>
  <div class="h-full overflow-y-auto bg-gray-50/50 p-4 md:p-6">
    <div class="max-w-[1600px] mx-auto h-full flex flex-col gap-4">

      <!-- Main Grid: 왼쪽(시나리오+표현+차트) + 오른쪽(달력+태스크) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

        <!-- 왼쪽 열 (8 cols) -->
        <div class="lg:col-span-8 flex flex-col gap-4 h-full min-h-0">
          <!-- 1. Scenario Cards (Welcome 메시지 + 출석/캐릭터 포함) -->
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2 flex-1">
            <PerformanceChart />
            <QuickActionsSwiper />
          </div>
        </div>

        <!-- 오른쪽 열 (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-4 h-full min-h-0">
          <!-- 1. Mini Calendar (맨 위로 이동) -->
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
</script>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}
</style>
