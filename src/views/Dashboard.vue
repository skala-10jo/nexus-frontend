<template>
  <div class="h-full overflow-y-auto bg-gray-50/50 p-6 md:p-8">
    <div class="max-w-[1600px] mx-auto space-y-8">
      
      <!-- 1. Welcome Banner -->
      <div class="bg-blue-600 rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-blue-200">
        <!-- Background Pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute right-0 top-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute left-0 bottom-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="space-y-4 max-w-2xl">
            <h1 class="text-3xl md:text-4xl font-bold font-nanum-round-eb">Welcome back, {{ user?.fullName || 'User' }}!</h1>
            <div class="space-y-1 opacity-90">
              <p class="text-lg font-medium">
                📅 <span class="font-bold">{{ upcomingEvents.length }}</span> schedules remaining today!
              </p>
              <p class="text-lg font-medium">
                💬 Today's Expression: <span class="font-bold underline decoration-2 underline-offset-4">"Let's touch base later."</span>
              </p>
            </div>
          </div>
          
          <!-- 3D Avatar Placeholder -->
          <div class="hidden md:block w-48 h-48 -my-10 relative">
            <img 
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist.png"
              alt="User Avatar"
              class="w-full h-full object-contain drop-shadow-2xl transform hover:scale-110 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column (Content) -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- 2. Small Talk / Scenario Practice -->
          <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-[500px] flex flex-col relative group hover:shadow-md transition-all">
            <div class="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h2 class="text-lg font-bold text-gray-900">Let's Practice Small Talk!</h2>
              </div>
              <button class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>

            <!-- Chat Area -->
            <div class="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-6">
              <!-- AI Message -->
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-md">AI</div>
                <div class="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 max-w-[80%]">
                  <p class="text-gray-800 leading-relaxed text-lg">
                    Hi {{ user?.fullName }}! I noticed you have a meeting with the design team later.
                    <br>Want to practice some casual openers?
                  </p>
                </div>
              </div>

              <!-- User Message (Mockup) -->
              <div class="flex items-start gap-4 justify-end opacity-50">
                <div class="bg-blue-600 p-5 rounded-2xl rounded-tr-none shadow-sm text-white max-w-[80%]">
                  <p class="text-lg">Sure, let's try that.</p>
                </div>
              </div>
            </div>

            <!-- Input Area -->
            <div class="p-6 bg-white border-t border-gray-100">
              <div class="flex gap-4">
                <button class="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 group">
                  <svg class="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Input
                </button>
                <button class="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl bg-white border-2 border-gray-100 text-gray-700 font-bold hover:bg-gray-50 hover:border-gray-200 transition-all">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Text Input
                </button>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Performance & Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Performance Chart -->
            <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-bold text-gray-900">Performance</h3>
                <select class="text-xs font-bold text-gray-500 bg-gray-50 rounded-lg px-2 py-1 border-none focus:ring-0">
                  <option>Overall</option>
                  <option>Weekly</option>
                </select>
              </div>
              
              <!-- Mockup Chart -->
              <div class="relative h-48 w-full">
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
              <div class="flex justify-between mt-2 text-xs text-gray-400">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
              <h3 class="font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div class="grid grid-cols-2 gap-4">
                <router-link to="/management/documents" class="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                  <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold">Upload</span>
                </router-link>

                <router-link to="/translation/text" class="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-amber-50 hover:text-amber-600 transition-all group">
                  <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-amber-600 group-hover:scale-110 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold">Translate</span>
                </router-link>

                <router-link to="/management/project" class="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 transition-all group">
                  <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-emerald-600 group-hover:scale-110 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold">New Project</span>
                </router-link>

                <router-link to="/collaboration/mail" class="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 hover:bg-rose-50 hover:text-rose-600 transition-all group">
                  <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-rose-600 group-hover:scale-110 transition-all">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span class="text-xs font-bold">Mail</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column (Sidebar) -->
        <div class="lg:col-span-4 space-y-8">
          
          <!-- 3. Mini Calendar -->
          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-gray-900 uppercase tracking-wider text-sm">{{ currentMonthName }} {{ currentYear }}</h3>
              <div class="flex gap-2">
                <button @click="prevMonth" class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button @click="nextMonth" class="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>

            <!-- Calendar Grid -->
            <div class="grid grid-cols-7 gap-2 text-center mb-2">
              <span v-for="day in ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']" :key="day" class="text-xs font-bold text-gray-400 py-2">{{ day }}</span>
            </div>
            <div class="grid grid-cols-7 gap-2 text-center">
              <div v-for="{ date, isCurrentMonth, isToday, hasEvent } in calendarDays" :key="date.toISOString()" 
                class="aspect-square flex flex-col items-center justify-center relative rounded-full text-sm font-medium transition-colors cursor-pointer hover:bg-gray-50"
                :class="[
                  !isCurrentMonth ? 'text-gray-300' : isToday ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200' : 'text-gray-700'
                ]"
              >
                {{ date.getDate() }}
                <div v-if="hasEvent && !isToday" class="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500"></div>
              </div>
            </div>
          </div>

          <!-- 4. Upcoming Tasks -->
          <div class="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-6">
              <h3 class="font-bold text-gray-900">Upcoming Tasks</h3>
              <router-link to="/management/schedule" class="text-xs font-bold text-blue-600 hover:text-blue-700">See all</router-link>
            </div>

            <div class="space-y-4">
              <div v-if="loadingEvents" class="space-y-3">
                <div v-for="i in 3" :key="i" class="h-20 bg-gray-50 rounded-xl animate-pulse"></div>
              </div>
              
              <div v-else-if="upcomingEvents.length === 0" class="text-center py-8 text-gray-400">
                <p class="text-sm">No upcoming tasks</p>
              </div>

              <div v-else v-for="event in upcomingEvents" :key="event.id" class="group flex items-center gap-4 p-4 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                <!-- Date Badge -->
                <div class="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                  :class="{'bg-blue-600 text-white': isToday(event.start)}"
                >
                  <span class="text-xs font-bold uppercase" :class="{'text-blue-100': isToday(event.start), 'text-gray-400': !isToday(event.start)}">{{ formatMonth(event.start) }}</span>
                  <span class="text-lg font-bold">{{ formatDay(event.start) }}</span>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <h4 class="font-bold text-gray-900 truncate">{{ event.title }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-xs text-gray-500">{{ formatTime(event.start) }}</span>
                    <span v-if="event.extendedProps?.project" class="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold truncate max-w-[100px]">
                      {{ event.extendedProps.project.name }}
                    </span>
                  </div>
                </div>

                <!-- Action Button -->
                <button @click="goToPractice(event)" class="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all shadow-sm">
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

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

// Schedule Logic
const { allEvents, fetchAllEvents, loading: loadingEvents } = useScheduleEvents();

const upcomingEvents = computed(() => {
  const now = new Date();
  return allEvents.value
    .filter(event => new Date(event.start) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start))
    .slice(0, 4); // Take top 4
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
    days.unshift({ date: d, isCurrentMonth: false, isToday: false, hasEvent: false });
  }
  
  // Current month
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    const isToday = d.toDateString() === today.toDateString();
    
    // Check for events
    const hasEvent = allEvents.value.some(e => {
      const eDate = new Date(e.start);
      return eDate.toDateString() === d.toDateString();
    });

    days.push({ date: d, isCurrentMonth: true, isToday, hasEvent });
  }
  
  // Next month padding (to fill 6 rows = 42 cells)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: d, isCurrentMonth: false, isToday: false, hasEvent: false });
  }
  
  return days;
});

function prevMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1);
}

// Helpers
const formatMonth = (date) => new Date(date).toLocaleString('en-US', { month: 'short' });
const formatDay = (date) => new Date(date).getDate();
const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
const isToday = (date) => new Date(date).toDateString() === new Date().toDateString();

function goToPractice(event) {
  // Navigate to scenario practice
  // If event has a linked scenario ID, use it. Otherwise go to general scenario page.
  router.push('/conversation/scenario');
}

onMounted(async () => {
  await fetchAllEvents();
});
</script>
