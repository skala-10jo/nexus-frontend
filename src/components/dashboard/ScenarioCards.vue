<script setup>
/**
 * Scenario Cards 컴포넌트
 *
 * 예정된 일정 기반 시나리오 카드 3개 표시 또는 일정 생성 안내
 * + 출석 체크 및 캐릭터 표시
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  /** 예정된 일정 목록 */
  upcomingEvents: {
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
  },
  /** 배너 일정의 시나리오 목록 */
  bannerScenarios: {
    type: Array,
    default: () => []
  },
  /** 시나리오 로딩 상태 */
  loadingScenarios: {
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

// 배너 일정의 시나리오 추출 (최대 3개)
const topScenarios = computed(() => {
  if (props.bannerScenarios && props.bannerScenarios.length > 0) {
    return props.bannerScenarios.slice(0, 3)
  }
  return []
})

// 연습 카드에는 2개만 노출 (CTA 카드 + 최대 2개)
const practiceScenarios = computed(() => topScenarios.value.slice(0, 2))

// 시나리오의 역할 정보 표시용 헬퍼
const getRoles = (scenario) => {
  return {
    user: scenario?.roles?.user || 'User',
    assistant: scenario?.roles?.ai || scenario?.roles?.assistant || 'Manager'
  }
}

const getTitleLines = (title = '') => {
  const words = title.split(/\s+/).filter(Boolean)
  if (words.length <= 1) return [title]
  const half = Math.ceil(words.length / 2)
  return [
    words.slice(0, half).join(' '),
    words.slice(half).join(' ')
  ]
}

const userName = computed(() => props.user?.fullName || props.user?.username || 'User')
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

const startPractice = (scenarioId) => {
  if (!scenarioId) return
  router.push(`/conversation/practice/${scenarioId}`)
}

const handleCheckIn = () => {
  emit('check-in')
}
</script>

<template>
  <div class="bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-sky-50/50 rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">

    <!-- Header Section -->
    <div class="z-10 mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
        {{ greeting }} <span class="text-blue-900">{{ userName }}</span>님!
      </h2>
      <div class="text-gray-600">
        <p class="text-base md:text-lg mb-2">{{ scheduleMessage.text }}</p>
        <p
          v-if="hasSchedule"
          @click="goToScenario(scheduleMessage.link?.query?.scheduleId)"
          class="text-blue-800 hover:text-blue-600 font-bold cursor-pointer transition-colors text-xl md:text-2xl"
        >
          {{ scheduleMessage.eventTitle }}에 대한 회화 연습 하러 갈까요?
        </p>
      </div>
    </div>

    <!-- Content Section -->
    <div v-if="loadingScenarios" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 z-10 pr-0 md:pr-40 mb-2">
      <!-- Loading Skeleton -->
      <div v-for="i in 3" :key="i" class="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-3 animate-pulse">
        <div class="w-12 h-12 rounded-full bg-gray-200 shrink-0"></div>
        <div class="flex-1 min-w-0 space-y-2">
          <div class="h-3 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
    <div v-else-if="hasSchedule" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 z-10 pr-0 md:pr-40 mb-2">
      <!-- Scenario Create CTA -->
      <div
        @click="goToScenario(scheduleMessage.link?.query?.scheduleId)"
        class="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md hover:scale-102 transition-all duration-300 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
      >
        <div class="flex flex-col min-w-0">
          <span class="text-xs font-semibold text-gray-500 mb-1 truncate">{{ scheduleMessage.eventTitle || '시나리오' }}</span>
          <h3 class="text-xl font-bold text-gray-900 leading-snug">시나리오 생성하기</h3>
        </div>
      </div>

      <!-- Existing scenarios (up to 2) -->
      <div
        v-for="scenario in practiceScenarios"
        :key="scenario.id"
        @click="startPractice(scenario.id)"
        class="bg-white rounded-2xl p-4 cursor-pointer hover:shadow-md hover:scale-102 transition-all duration-300 border border-gray-200 flex items-start sm:items-center gap-3 group"
      >
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 transition-colors group-hover:bg-blue-200">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">시나리오</div>
          <div class="font-bold text-gray-900 text-sm leading-snug mb-1 truncate">
            {{ scenario.title }}
          </div>
          <div class="text-xs font-medium text-gray-500 space-y-0.5">
            <div class="flex items-center gap-1 min-w-0">
              <span class="shrink-0">나:</span>
              <span class="text-gray-900 font-semibold truncate">{{ getRoles(scenario).user }}</span>
            </div>
            <div class="flex items-center gap-1 min-w-0">
              <span class="shrink-0">상대:</span>
              <span class="text-gray-900 font-semibold truncate">{{ getRoles(scenario).assistant }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State (일정도 없을 때) -->
    <div v-else class="z-10 mb-2">
      <div
        @click="goToSchedule"
        class="bg-white rounded-2xl p-5 cursor-pointer hover:shadow-md hover:scale-102 transition-all duration-300 border border-gray-200 flex items-center gap-4 group max-w-sm"
      >
        <!-- Icon -->
        <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0 transition-colors group-hover:bg-blue-100 group-hover:text-blue-600">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        <!-- Text Info -->
        <div class="flex-1 min-w-0">
          <span class="text-xs font-medium text-gray-500 mb-1">일정 등록</span>
          <h3 class="font-bold text-gray-900 text-base">시나리오 회화 연습 시작하기</h3>
        </div>

        <!-- Arrow -->
        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>

    <!-- Right Bottom: Character & Attendance Speech Bubble -->
    <div class="hidden md:flex md:flex-col md:items-end gap-3 z-20 md:absolute md:bottom-6 md:right-6">
      <!-- Attendance Speech Bubble (위로) -->
      <div class="relative group">
        <div class="bg-white text-gray-800 px-4 py-3 md:px-6 md:py-4 rounded-2xl rounded-br-none shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 border-b-4 border-b-gray-200 flex flex-col items-center gap-2 md:gap-3 min-w-[120px] md:min-w-[140px] transform transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)]">
          <p class="text-xs md:text-sm font-bold whitespace-nowrap flex items-center gap-1.5 text-gray-700">
            {{ isCheckedIn ? '출석 완료! 🌟' : '출석하세용 ⭐️'}}
          </p>

          <button
            v-if="!isCheckedIn"
            @click="handleCheckIn"
            class="px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all w-full flex items-center justify-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-105 active:scale-95"
          >
            <span>출check하기</span>
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
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

    <!-- Mobile Avatar & Check-in -->
    <div class="mt-6 flex flex-col items-center justify-center gap-4 md:hidden w-full">
      <div class="bg-white text-gray-800 px-5 py-4 rounded-2xl shadow-md border border-gray-100 flex flex-col items-center gap-2">
        <p class="text-sm font-bold flex items-center gap-2 text-gray-700">
          {{ isCheckedIn ? '출석 완료! 🌟' : '출석하세용 ⭐️'}}
        </p>
        <button
          v-if="!isCheckedIn"
          @click="handleCheckIn"
          class="px-6 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 bg-blue-50 text-blue-600 hover:bg-blue-100"
        >
          <span>출check하기</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      <div class="w-20 h-20 relative filter drop-shadow-2xl">
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
          alt="User Avatar"
          class="w-full h-full object-contain"
        />
      </div>
    </div>
  </div>
</template>
