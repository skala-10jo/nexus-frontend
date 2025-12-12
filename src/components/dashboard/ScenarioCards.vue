<script setup>
/**
 * Scenario Cards 컴포넌트
 * 
 * 오늘 일정 기반 시나리오 카드 3개 표시 또는 일정 생성 안내
 * + 출석 체크 및 캐릭터 표시
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  /** 오늘의 일정 목록 */
  todayEvents: {
    type: Array,
    default: () => []
  },
  /** 스케줄 메시지 */
  scheduleMessage: {
    type: Object,
    required: true
  },
  /** 사용자 정보 */
  user: {
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

const router = useRouter()

// 시간대별 인사말
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return 'Good Morning'
  } else if (hour >= 12 && hour < 18) {
    return 'Good Afternoon'
  } else {
    return 'Good Evening'
  }
})

// 대표 시나리오 3개 추출
const topScenarios = computed(() => {
  if (!props.todayEvents || props.todayEvents.length === 0) {
    return []
  }
  return props.todayEvents.slice(0, 3)
})

const userName = computed(() => props.user?.name || 'User')
const hasSchedule = computed(() => props.scheduleMessage?.hasSchedule)

const goToScenario = (scheduleId) => {
  if (scheduleId) {
    router.push({ path: '/conversation/scenario', query: { scheduleId } })
  } else {
    router.push('/conversation/scenario')
  }
}

const goToSchedule = () => {
  router.push('/management/schedule')
}

const handleCheckIn = () => {
  emit('check-in')
}
</script>

<template>
  <div class="bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-pink-50/50 rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 h-full flex flex-col relative overflow-hidden">

    <!-- Header Section -->
    <div class="z-10 mb-4">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        {{ greeting }} <span class="text-purple-600">{{ userName }}</span>!
      </h2>
      <div class="text-gray-600">
        <p class="text-base md:text-lg mb-2">{{ scheduleMessage.text }}</p>
        <p 
          v-if="hasSchedule" 
          @click="goToScenario(scheduleMessage.link?.query?.scheduleId)"
          class="text-purple-600 hover:text-purple-700 font-semibold cursor-pointer transition-colors text-sm md:text-base"
        >
          {{ scheduleMessage.eventTitle }}에 대한 회화 연습 하러 갈까요?
        </p>
      </div>
    </div>

    <!-- Content Section -->
    <div v-if="topScenarios.length > 0" class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 z-10 pr-0 md:pr-40">
      <!-- Scenario Cards -->
      <div 
        v-for="(event, index) in topScenarios" 
        :key="event.id"
        @click="goToScenario(event.id)"
        class="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-200 flex items-center gap-4 group"
      >
        <!-- Icon -->
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0 transition-colors group-hover:bg-purple-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
        </div>
        
        <!-- Text Info -->
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <span class="text-xs font-medium text-gray-500 mb-0.5">User vs Manager</span>
          <h3 class="font-bold text-gray-900 text-sm truncate">{{ event.title }}</h3>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex-1 flex flex-col items-center justify-center text-center z-10">
      <div class="bg-gray-50 rounded-2xl p-8 max-w-md">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-gray-600 mb-4">일정을 등록하고<br/>시나리오 회화 연습을 시작해보세요!</p>
        <button 
          @click="goToSchedule"
          class="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
        >
          일정 등록하기
        </button>
      </div>
    </div>

    <!-- Right Bottom: Character & Attendance Speech Bubble -->
    <div class="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-20">
      <!-- Attendance Speech Bubble (위로) -->
      <div class="relative group">
        <div class="bg-white text-gray-800 px-4 py-3 md:px-6 md:py-4 rounded-2xl rounded-br-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 border-b-4 border-b-gray-200 flex flex-col items-center gap-2 md:gap-3 min-w-[120px] md:min-w-[140px] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">
          <p class="text-xs md:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 text-gray-700">
            {{ isCheckedIn ? '출석 완료! 🌟' : '출석하세용 ⭐️'}}
          </p>

          <button
            v-if="!isCheckedIn"
            @click="handleCheckIn"
            class="bg-blue-50 text-blue-600 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold hover:bg-blue-100 hover:scale-105 active:scale-95 transition-all w-full flex items-center justify-center gap-1"
          >
            <span>출check</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>

          <!-- Tail (아래 오른쪽으로) -->
          <div class="absolute -bottom-3 right-0 w-0 h-0 border-l-[12px] border-l-white border-b-[12px] border-b-transparent drop-shadow-sm"></div>
        </div>
      </div>

      <!-- 3D Avatar (아래) -->
      <div class="w-24 h-24 md:w-32 md:h-32 relative filter drop-shadow-2xl">
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
          alt="User Avatar"
          class="w-full h-full object-contain transform hover:scale-110 transition-transform duration-300"
        />
      </div>
    </div>
  </div>
</template>
