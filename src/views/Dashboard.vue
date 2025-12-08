<template>
  <div class="h-full md:overflow-hidden overflow-y-auto bg-gray-50/50 p-4 md:p-6 pb-24 md:pb-6">
    <div class="max-w-[1600px] mx-auto h-auto md:h-full flex flex-col gap-4">
      
      <!-- 1. Welcome Banner -->
      <div class="bg-blue-600 rounded-[2rem] p-5 md:p-6 text-white relative overflow-hidden shadow-lg shadow-blue-200 shrink-0">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute left-0 bottom-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div class="space-y-2 max-w-2xl">
            <h1 class="text-2xl md:text-3xl font-bold font-nanum-round-eb">Welcome back, {{ user?.fullName || 'User' }}!</h1>
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
          <!-- Attendance Bubble & Avatar Wrapper -->
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
                  @click="handleCheckIn"
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

      <!-- Main Grid -->
      <div class="flex-1 md:min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left Column (Content) -->
        <div class="lg:col-span-8 flex flex-col gap-4 h-auto md:h-full md:overflow-hidden">
          
          <!-- 2. Small Talk / Scenario Practice -->
          <!-- Reduced height to 50% to prevent cutting off bottom row -->
          <div class="h-[400px] md:h-1/2 shrink-0 relative">
            <SmallTalkChat />
          </div>

          <!-- Bottom Row: Performance & Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-auto md:h-1/2 md:min-h-0 shrink-0">
            <!-- Performance Chart (Biz 표현학습 일일 통계) -->
            <PerformanceChart />

            <!-- Quick Actions (Swiper) -->
            <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col h-[300px] md:h-full relative overflow-hidden">
              <h3 class="font-bold text-gray-900 text-sm mb-3 shrink-0">Quick Actions</h3>
              
              <swiper
                :modules="modules"
                :pagination="{ clickable: true }"
                class="w-full h-full pb-6"
              >
                <!-- Slide 1: 2 Rows, 2 Columns -->
                <swiper-slide>
                  <div class="grid grid-cols-2 gap-3 h-full">
                    <router-link v-for="action in quickActions.slice(0, 4)" :key="action.name" :to="action.path" 
                      class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group h-full"
                    >
                      <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                        <component :is="action.icon" class="w-5 h-5" />
                      </div>
                      <span class="text-xs font-bold text-center leading-tight">{{ action.name }}</span>
                    </router-link>
                  </div>
                </swiper-slide>

                <!-- Slide 2: 2 Rows, 2 Columns -->
                <swiper-slide>
                  <div class="grid grid-cols-2 gap-3 h-full">
                    <router-link v-for="action in quickActions.slice(4, 8)" :key="action.name" :to="action.path" 
                      class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group h-full"
                    >
                      <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                        <component :is="action.icon" class="w-5 h-5" />
                      </div>
                      <span class="text-xs font-bold text-center leading-tight">{{ action.name }}</span>
                    </router-link>
                  </div>
                </swiper-slide>
              </swiper>
            </div>
          </div>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="lg:col-span-4 flex flex-col gap-4 h-auto md:h-full md:overflow-y-auto">
          
          <!-- 3. Mini Calendar (Strict 1:1 Ratio, Overflow Hidden) -->
          <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col relative z-10">
          <div class="flex items-center justify-between mb-2 shrink-0">
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
            <!-- Changed justify-center to justify-start to prevent top clipping -->
            <div class="mt-2 space-y-1">
              <!-- 1) 요일 헤더 (일 ~ 토) -->
              <div class="grid grid-cols-7 text-center text-[10px] font-semibold text-gray-400 tracking-wider">
                <span v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day">
                  {{ day }}
                </span>
              </div>

              <!-- 2) 날짜 그리드 -->
              <div class="grid grid-cols-7 gap-x-1 gap-y-0.5 text-center">
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
                      alt="Fire"
                      class="absolute inset-0 w-full h-full object-contain p-0.5 opacity-90 z-0 pointer-events-none"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Upcoming Tasks (Strict 1:1 Ratio) -->
          <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col md:flex-1 min-h-[300px] md:min-h-[250px]">
            <div class="flex items-center justify-between mb-3 shrink-0">
              <h3 class="font-bold text-gray-900">
                {{ selectedDate ? 'Tasks for ' + formatMonth(selectedDate) + ' ' + formatDay(selectedDate) : 'Upcoming Tasks' }}
              </h3>
              <button v-if="selectedDate" @click="selectedDate = null" class="text-xs font-bold text-gray-400 hover:text-gray-600">Show All</button>
              <router-link v-else to="/management/schedule" class="text-xs font-bold text-blue-600 hover:text-blue-700">See all</router-link>
            </div>

            <div class="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              <div v-if="loadingEvents" class="space-y-2">
                <div v-for="i in 3" :key="i" class="h-14 bg-gray-50 rounded-xl animate-pulse"></div>
              </div>

              <div v-else-if="upcomingEvents.length === 0" class="text-center py-4 text-gray-400">
                <p class="text-sm">No tasks {{ selectedDate ? 'on this day' : 'upcoming' }}</p>
              </div>

              <div v-else v-for="event in upcomingEvents" :key="event.id"
                class="group flex items-center gap-4 p-4 rounded-2xl transition-all border border-transparent hover:shadow-md shrink-0"
                :class="[event.lightColorClass]"
              >
                <!-- Date Badge -->
                <div class="flex flex-col items-center justify-center w-12 h-12 rounded-full shadow-sm shrink-0 transition-colors"
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
                <button @click="goToPractice(event)" class="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useScheduleEvents } from '@/composables/management/useScheduleEvents';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Pagination } from 'swiper/modules';
import api from '@/services/api';
import 'swiper/css';
import 'swiper/css/pagination';

import SmallTalkChat from '@/components/dashboard/SmallTalkChat.vue';
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue';
import { useAttendance } from '@/composables/useAttendance';

import {
  DocumentTextIcon,
  LanguageIcon,
  FolderPlusIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  VideoCameraIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
const modules = [Pagination];

// Quick Actions Data
const quickActions = [
  { name: 'Upload', path: '/management/documents', icon: DocumentTextIcon },
  { name: 'Translate', path: '/translation/text', icon: LanguageIcon },
  { name: 'New Project', path: '/management/project', icon: FolderPlusIcon },
  { name: 'Mail', path: '/collaboration/mail', icon: EnvelopeIcon },
  { name: 'Schedule', path: '/management/schedule', icon: CalendarIcon },
  { name: 'Scenario', path: '/conversation/scenario', icon: ChatBubbleLeftRightIcon },
  { name: 'Expression', path: '/conversation/expression', icon: BookOpenIcon },
  { name: 'Video', path: '/translation/video', icon: VideoCameraIcon },
];

// Schedule Logic
const { allEvents, fetchAllEvents, loading: loadingEvents } = useScheduleEvents();
const selectedDate = ref(null);

// Attendance Logic
const { isCheckedIn, checkTodayStatus, submitCheckIn, fetchAttendanceRecords, hasAttendance } = useAttendance();
const showSuccessPopup = ref(false);

const handleCheckIn = async () => {
  const success = await submitCheckIn();
  if (success) {
    showSuccessPopup.value = true;
    setTimeout(() => {
      showSuccessPopup.value = false;
    }, 3000);
  }
};

// Today's Expression
const todayExpression = ref(null);

const fetchRandomExpression = async () => {
  try {
    // Unit 목록 가져오기
    const unitsResponse = await api.get('/expressions/units');
    const units = unitsResponse.data.data || [];

    if (units.length === 0) return;

    // 랜덤 Unit 선택
    const randomUnit = units[Math.floor(Math.random() * units.length)];

    // 해당 Unit에서 표현 1개 가져오기
    const expressionResponse = await api.get('/expressions', {
      params: {
        unit: randomUnit.unit,
        limit: 1
      }
    });

    const expressions = expressionResponse.data.data || [];
    if (expressions.length > 0) {
      const expr = expressions[0];
      // meaning에서 {} 제거
      if (expr.meaning) {
        expr.meaning = expr.meaning.replace(/[{}]/g, '');
      }
      todayExpression.value = expr;
    }
  } catch (err) {
    console.error('Failed to fetch random expression:', err);
    // 실패해도 조용히 처리 (fallback 표현 표시)
    todayExpression.value = { expression: "Let's touch base later.", meaning: "나중에 연락하자" };
  }
};

// ============================================================
// 이벤트 색상 팔레트 및 매핑
// ============================================================
const eventColors = [
  { bg: 'bg-blue-500', light: 'bg-blue-100' },
  { bg: 'bg-pink-500', light: 'bg-pink-100' },
  { bg: 'bg-green-500', light: 'bg-green-100' },
  { bg: 'bg-orange-500', light: 'bg-orange-100' },
  { bg: 'bg-purple-500', light: 'bg-purple-100' },
  { bg: 'bg-teal-500', light: 'bg-teal-100' },
]

// id → 색상 인덱스 매핑 (메모리 보관)
const eventColorMap = new Map()
let nextColorIndex = 0

/**
 * 이벤트 ID에 대해 일관된 색상 반환
 * - 같은 id는 항상 같은 색
 * - 새 id는 팔레트를 순서대로 순환하며 배정
 */
const getEventColor = (eventId) => {
  const key = eventId ?? '__no_id__'  // id 없을 때 대비

  if (!eventColorMap.has(key)) {
    eventColorMap.set(key, nextColorIndex)
    nextColorIndex = (nextColorIndex + 1) % eventColors.length
  }

  const index = eventColorMap.get(key)
  return eventColors[index]
}

const upcomingEvents = computed(() => {
  let events = allEvents.value;

  // Filter by selected date if set
  if (selectedDate.value) {
    events = events.filter(event => {
      const eStart = new Date(event.start);
      const eEnd = event.end ? new Date(event.end) : new Date(eStart);
      const sel = selectedDate.value;
      
      // Check if selected date is within event range
      // Normalize to YYYY-MM-DD for comparison
      const checkDate = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate());
      const startDate = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate());
      const endDate = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate());

      return checkDate >= startDate && checkDate <= endDate;
    });
  } else {
    // Default: Future events
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Include today's events
    events = events.filter(event => {
       const eEnd = event.end ? new Date(event.end) : new Date(event.start);
       return eEnd >= now;
    });
  }

  // Sort by start date
    const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start))

    return sorted.slice(0, 50).map(event => {
    const colors = getEventColor(event.id)
    return {
      ...event,
      colorClass: colors.bg,
      lightColorClass: colors.light
    };
  });
});

// Schedule Message for Banner
const scheduleMessage = computed(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  // 오늘 일정 찾기
  const todayEvents = allEvents.value.filter(event => {
    const eStart = new Date(event.start);
    const eEnd = event.end ? new Date(event.end) : new Date(eStart);
    // 오늘이 일정 범위 안에 있는지 확인
    const startDate = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate());
    const endDate = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate());
    return today >= startDate && today <= endDate;
  });

  if (todayEvents.length > 0) {
    // 오늘 일정이 있음
    const event = todayEvents[0];
    return {
      text: `오늘은 "${event.title}" 일정이 있어요! `,
      hasSchedule: true,
      eventTitle: event.title,
      link: { path: '/conversation/scenario', query: { scheduleId: event.id } }
    };
  }

  // 다가올 일정 찾기 (오늘 이후)
  const futureEvents = allEvents.value
    .filter(event => {
      const eStart = new Date(event.start);
      eStart.setHours(0, 0, 0, 0);
      return eStart > today;
    })
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  if (futureEvents.length > 0) {
    const event = futureEvents[0];
    return {
      text: `곧 "${event.title}" 일정이 있어요! `,
      hasSchedule: true,
      eventTitle: event.title,
      link: { path: '/conversation/scenario', query: { scheduleId: event.id } }
    };
  }

  // 일정이 아예 없음
  return {
    text: '일정을 등록하고 시나리오 회화 연습해보는건 어때요? ',
    hasSchedule: false,
    eventTitle: '',
    link: '/management/schedule'
  };
});

// Calendar Logic
const currentDate = ref(new Date());

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleString('en-US', { month: 'long' });
});

const currentYear = computed(() => {
  return currentDate.value.getFullYear();
});

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const days = [];
  
  // Previous month padding
  // Adjust for Monday start (0 = Sunday, 1 = Monday)
  // Previous month padding (Sunday start: 0 = Sun, 6 = Sat)
  const startPadding = firstDay.getDay();   // 0이면 패딩 없음, 1이면 1칸, ... 6이면 6칸

  for (let i = 0; i < startPadding; i++) {
    const d = new Date(year, month, 0 - i);
    days.unshift({ date: d, isCurrentMonth: false, isToday: false, eventInfo: null });
  }
  
  // Current month
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    const isToday = d.toDateString() === today.toDateString();
    
    // Find events covering this day
    const dayEvents = allEvents.value.filter(e => {
      const start = new Date(e.start);
      const end = e.end ? new Date(e.end) : new Date(start);
      // Normalize to start of day
      const check = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const e_ = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return check >= s && check <= e_;
    });

    let eventInfo = null;
    if (dayEvents.length > 0) {
      // Priority: Earliest End Date
      dayEvents.sort((a, b) => {
        const endA = a.end ? new Date(a.end) : new Date(a.start);
        const endB = b.end ? new Date(b.end) : new Date(b.start);
        return endA - endB;
      });
      
      const topEvent = dayEvents[0];
      const colors = getEventColor(topEvent.id);
      const start = new Date(topEvent.start);
      const isStart = start.toDateString() === d.toDateString();

      eventInfo = {
        id: topEvent.id,
        color: colors.bg,
        lightColor: colors.light,
        isStart,
        isContinued: !isStart
      };
    }

    days.push({ date: d, isCurrentMonth: true, isToday, eventInfo });
  }
  
  // Next month padding (to fill 6 rows = 42 cells)
  const totalCells = days.length;              // 현재: 이전달 패딩 + 이번달 날짜 수
  const rows = Math.ceil(totalCells / 7);      // 4 ~ 6 중 하나
  const targetCells = rows * 7;                // 이 달에 필요한 최소 칸 수
  const remaining = targetCells - totalCells;  // 모자란 칸만큼만 다음달 날짜로 채움

  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false, isToday: false, eventInfo: null });
  }

  return days;
});

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
}

function selectDate(date) {
  if (selectedDate.value && selectedDate.value.toDateString() === date.toDateString()) {
    selectedDate.value = null; // Deselect
  } else {
    selectedDate.value = date;
  }
}

const isSelected = (date) => {
  return selectedDate.value && selectedDate.value.toDateString() === date.toDateString();
};

// Helpers
const formatMonth = (date) => new Date(date).toLocaleString('en-US', { month: 'short' });
const formatDay = (date) => new Date(date).getDate();
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const formatDateRange = (start, end) => {
  const s = new Date(start);
  const e = end ? new Date(end) : s;
  const sDay = s.getDate();
  const eDay = e.getDate();
  const month = s.toLocaleString('en-US', { month: 'short' });
  
  if (sDay === eDay) return `${sDay}th ${month} ${s.getFullYear()}`;
  return `${sDay}th - ${eDay}th ${month} ${s.getFullYear()}`;
};

function goToPractice(event) {
  // Navigate to scenario practice
  // If event has a linked scenario ID, use it. Otherwise go to general scenario page.
  router.push('/conversation/scenario');
}

onMounted(async () => {
  await Promise.all([
    fetchAllEvents(),
    fetchRandomExpression(),
    checkTodayStatus(),
    fetchAttendanceRecords()
  ]);
});
</script>

<style scoped>
@keyframes wiggle {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

.animate-wiggle {
  animation: wiggle 1s ease-in-out infinite;
}

/* Custom Scrollbar for Tasks */
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
