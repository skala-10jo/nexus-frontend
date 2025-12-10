<script setup>
/**
 * Welcome Banner 컴포넌트
 *
 * 대시보드 상단 환영 배너 - 사용자 정보, 일정 메시지, 오늘의 표현, 출석 체크
 */
import { computed } from 'vue'

const props = defineProps({
  /** 사용자 정보 */
  user: {
    type: Object,
    default: null
  },
  /** 일정 메시지 객체 */
  scheduleMessage: {
    type: Object,
    required: true
  },
  /** 오늘의 표현 */
  todayExpression: {
    type: Object,
    default: null
  },
  /** 출석 완료 여부 */
  isCheckedIn: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'check-in'
])

const userName = computed(() => props.user?.fullName || 'User')
</script>

<template>
  <div class="bg-blue-600 rounded-[2rem] p-5 md:p-6 text-white relative overflow-hidden shadow-lg shadow-blue-200 shrink-0">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute left-0 bottom-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
    </div>

    <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="space-y-2 max-w-2xl">
        <h1 class="text-2xl md:text-3xl font-bold font-nanum-round-eb">Welcome back, {{ userName }}!</h1>
        <div class="hidden md:block space-y-0.5 opacity-90">
          <p class="text-base font-medium">
            🗓️ {{ scheduleMessage.text }}
            <router-link
              v-if="scheduleMessage.hasSchedule"
              :to="scheduleMessage.link"
              class="font-bold underline decoration-2 underline-offset-4 hover:text-blue-200 cursor-pointer transition-colors"
            >
              {{ scheduleMessage.eventTitle }}에 대한 회화 연습 하러 갈까요?
            </router-link>
            <router-link
              v-else
              to="/management/schedule"
              class="font-bold underline decoration-2 underline-offset-4 hover:text-blue-200 cursor-pointer transition-colors"
            >
              일정 등록하러 가기
            </router-link>
          </p>
          <p class="text-base font-medium">
            💬 오늘의 Biz 표현:
            <router-link
              v-if="todayExpression"
              to="/conversation/expression"
              class="font-bold underline decoration-2 underline-offset-4 hover:text-blue-200 cursor-pointer transition-colors"
            >
              "{{ todayExpression.expression }} ({{ todayExpression.meaning }})"
            </router-link>
            <span v-else class="font-bold underline decoration-2 underline-offset-4 opacity-50">Loading...</span>
          </p>
        </div>
      </div>

      <!-- Attendance Bubble & Avatar Wrapper -->
      <div class="flex flex-row md:flex-row items-center gap-4 md:gap-6 relative self-end md:self-auto mt-4 md:mt-0">
        <!-- Attendance Speech Bubble -->
        <div class="relative z-20 group">
          <div class="bg-white text-gray-800 px-4 py-3 md:px-6 md:py-4 rounded-2xl rounded-tr-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 border-b-4 border-b-gray-200 flex flex-col items-center gap-2 md:gap-3 min-w-[120px] md:min-w-[140px] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">
            <p class="text-xs md:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 text-gray-700">
              {{ isCheckedIn ? '출석 완료! 🌟' : '출석하세용 ⭐️'}}
            </p>

            <button
              v-if="!isCheckedIn"
              @click="emit('check-in')"
              class="bg-blue-50 text-blue-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-1"
            >
              <span>출check</span>
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>

            <!-- Tail -->
            <div class="absolute -right-3 top-0 w-0 h-0 border-t-[12px] border-t-white border-r-[12px] border-r-transparent drop-shadow-sm"></div>
          </div>
        </div>

        <!-- 3D Avatar Placeholder -->
        <div class="w-24 h-24 md:w-32 md:h-32 -my-6 relative filter drop-shadow-2xl">
          <img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
            alt="User Avatar"
            class="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300"
          />
        </div>
      </div>
    </div>
  </div>
</template>
