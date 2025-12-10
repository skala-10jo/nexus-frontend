<template>
  <div class="h-full md:overflow-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-6 pb-24 md:pb-6">
    <div class="max-w-[1600px] mx-auto h-auto md:h-full flex flex-col gap-4">

      <!-- 1. Welcome Banner -->
      <WelcomeBanner
        :user="user"
        :schedule-message="scheduleMessage"
        :today-expression="todayExpression"
        :is-checked-in="isCheckedIn"
        @check-in="handleCheckIn"
      />

      <!-- Main Grid -->
      <div class="flex-1 md:min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">

        <!-- Left Column (Content) -->
        <div class="lg:col-span-8 flex flex-col gap-4 h-auto md:h-full md:overflow-hidden">

          <!-- 2. Small Talk / Scenario Practice -->
          <div class="h-[400px] md:flex-1 md:min-h-0 relative">
            <SmallTalkChat />
          </div>

          <!-- Bottom Row: Performance & Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:flex-1 md:min-h-0">
            <!-- Performance Chart -->
            <PerformanceChart />

            <!-- Quick Actions -->
            <QuickActionsSwiper />
          </div>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="lg:col-span-4 flex flex-col gap-4 h-auto md:h-full md:overflow-y-auto">

          <!-- 3. Mini Calendar -->
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
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import SmallTalkChat from '@/components/dashboard/SmallTalkChat.vue'
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
  allEvents,
  loadingEvents,
  isCheckedIn,

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
