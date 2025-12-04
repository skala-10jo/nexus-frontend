<template>
  <div class="h-full overflow-hidden bg-gray-50/50 p-4 md:p-6">
    <div class="max-w-[1600px] mx-auto h-full flex flex-col gap-4">
      
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
            <div class="space-y-0.5 opacity-90">
              <p class="text-base font-medium">
                📅 <span class="font-bold">{{ upcomingEvents.length }}</span> schedules remaining {{ selectedDate ? 'on selected date' : 'today' }}!
              </p>
              <p class="text-base font-medium">
                💬 Today's Expression: <span class="font-bold underline decoration-2 underline-offset-4">"Let's touch base later."</span>
              </p>
            </div>
          </div>
          
          <!-- 3D Avatar Placeholder -->
          <div class="hidden md:block w-32 h-32 -my-6 relative">
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
              alt="User Avatar"
              class="w-full h-full object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        <!-- Left Column (Content) -->
        <div class="lg:col-span-8 flex flex-col gap-4 h-full overflow-hidden">
          
          <!-- 2. Small Talk / Scenario Practice -->
          <!-- Reduced height to 50% to prevent cutting off bottom row -->
          <div class="h-1/2 shrink-0 relative">
            <SmallTalkChat />
          </div>

          <!-- Bottom Row: Performance & Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-1/2 min-h-0 shrink-0">
            <!-- Performance Chart -->
            <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
              <div class="flex items-center justify-between mb-3 shrink-0">
                <h3 class="font-bold text-gray-900 text-sm">Performance</h3>
                <select class="text-xs font-bold text-gray-500 bg-gray-50 rounded-lg px-2 py-1 border-none focus:ring-0">
                  <option>Overall</option>
                  <option>Weekly</option>
                </select>
              </div>
              
              <!-- Mockup Chart -->
              <div class="relative flex-1 w-full min-h-0">
                <!-- Grid Lines -->
                <div class="absolute inset-0 flex flex-col justify-between text-xs text-gray-300">
                  <div class="border-b border-gray-50 w-full h-0"></div>
                  <div class="border-b border-gray-50 w-full h-0"></div>
                  <div class="border-b border-gray-50 w-full h-0"></div>
                  <div class="border-b border-gray-50 w-full h-0"></div>
                  <div class="border-b border-gray-50 w-full h-0"></div>
                </div>
                
                <!-- SVG Wave -->
                <svg class="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:0.2" />
                      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 C50,80 100,120 150,60 C200,0 250,40 300,80 L300,200 L0,200 Z" fill="url(#gradient)" />
                  <path d="M0,100 C50,80 100,120 150,60 C200,0 250,40 300,80" fill="none" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
                  <!-- Points -->
                  <circle cx="150" cy="60" r="4" fill="#3b82f6" stroke="white" stroke-width="2" />
                  <circle cx="300" cy="80" r="4" fill="#3b82f6" stroke="white" stroke-width="2" />
                </svg>
              </div>
              <div class="flex justify-between mt-2 text-xs text-gray-400 shrink-0">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>

            <!-- Quick Actions (Swiper) -->
            <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden">
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
        <div class="lg:col-span-4 flex flex-col gap-4 h-full overflow-hidden">
          
          <!-- 3. Mini Calendar (Strict 1:1 Ratio, Overflow Hidden) -->
          <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 h-1/2 min-h-0 flex flex-col overflow-hidden relative z-10">
            <div class="flex items-center justify-between mb-2 shrink-0">
              <h3 class="font-bold text-gray-900 uppercase tracking-wider text-xs">{{ currentMonthName }} {{ currentYear }}</h3>
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
            <div class="flex-1 flex flex-col justify-start overflow-hidden">
              <div class="grid grid-cols-7 gap-1 text-center">
                <div
                  v-for="{ date, isCurrentMonth, isToday, eventInfo } in calendarDays"
                  :key="date.toISOString()"
                  class="aspect-square relative" 
                >
                  <button
                    @click="selectDate(date)"
                    class="
                      absolute 
                      inset-[5%]        
                      flex items-center justify-center
                      rounded-full
                      text-xs font-medium
                      transition-all
                      cursor-pointer
                    "
                    :class="[
                      // Base text color
                      !isCurrentMonth ? 'text-gray-300' : 'text-gray-700',

                      // Hover state (only if not an event start)
                      !eventInfo?.isStart && isCurrentMonth ? 'hover:bg-gray-100' : '',

                      // Event Styling (Start Date - Solid Color)
                      eventInfo?.isStart ? `${eventInfo.color} text-white shadow-md` : '',

                      // Event Styling (Continued - Light Color)
                      eventInfo?.isContinued ? `${eventInfo.lightColor} text-gray-700` : '',

                      // Selected State (if no event)
                      isSelected(date) && !eventInfo ? 'ring-2 ring-blue-600 ring-offset-2' : ''
                    ]"
                  >
                    {{ date.getDate() }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Upcoming Tasks (Strict 1:1 Ratio) -->
          <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 h-1/2 min-h-0 flex flex-col overflow-hidden relative z-20">
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
import 'swiper/css';
import 'swiper/css/pagination';

import SmallTalkChat from '@/components/dashboard/SmallTalkChat.vue';

import {
  DocumentTextIcon,
  LanguageIcon,
  FolderPlusIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  VideoCameraIcon
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
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = 6;
  
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
  const remaining = 42 - days.length;
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
  await fetchAllEvents();
});
</script>
