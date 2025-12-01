<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">일정 관리</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            프로젝트 타임라인을 관리하고 추적하세요
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
        >
          <PlusIcon class="w-5 h-5" />
          일정 추가
        </button>
      </div>
    </div>

    <div class="flex-1 flex min-h-0 px-6 pt-4 pb-12 overflow-hidden gap-6">
      <!-- Left Sidebar: Project List -->
      <div class="w-1/4 min-w-[280px] max-w-[400px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div class="p-5 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">프로젝트</h2>
          <button
            @click="openCreateProject"
            class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="새 프로젝트 생성"
          >
            <PlusIcon class="w-5 h-5" />
          </button>
        </div>
        
        <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
          <!-- All Projects Button -->
          <button
            @click="selectProject(null)"
            class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
            :class="!selectedProjectId ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
          >
            <div class="w-6 h-6 rounded flex items-center justify-center transition-colors"
              :class="!selectedProjectId ? 'text-gray-800' : 'text-gray-500 group-hover:text-gray-700'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <span class="text-base font-semibold">전체 프로젝트</span>
          </button>

          <!-- Project List -->
          <div v-for="project in projects" :key="project.id" class="space-y-0.5">
            <button
              @click="selectProject(project.id)"
              class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
              :class="selectedProjectId === project.id ? 'bg-blue-50 text-blue-800 font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
            >
              <div class="w-6 h-6 rounded flex items-center justify-center transition-colors flex-shrink-0"
                :class="selectedProjectId === project.id ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-600'">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>
              <span class="text-base font-medium truncate flex-1">{{ project.name }}</span>
              <span v-if="getProjectEvents(project.id).length > 0" 
                class="text-xs font-semibold px-1.5 py-0.5 rounded-full transition-colors"
                :class="selectedProjectId === project.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500 group-hover:text-gray-700'">
                {{ getProjectEvents(project.id).length }}
              </span>
            </button>

            <!-- Project Events List (Sidebar) -->
            <div v-if="getProjectEvents(project.id).length > 0" class="ml-6 pl-3 border-l border-gray-200 my-1 space-y-0.5">
              <div 
                v-for="event in getProjectEvents(project.id).slice(0, 3)" 
                :key="event.id"
                class="text-xs py-1.5 px-2 rounded hover:bg-gray-50 text-gray-600 cursor-pointer flex items-center gap-2 transition-colors group/event"
                @click.stop="handleEventClick({ event })"
              >
                <div class="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform group-hover/event:scale-125" :style="{ backgroundColor: event.backgroundColor }"></div>
                <span class="font-medium text-gray-500 w-14 flex-shrink-0 tabular-nums tracking-tight">{{ formatEventTime(event) }}</span>
                <span class="truncate text-gray-700 font-medium group-hover/event:text-gray-900">{{ event.title }}</span>
              </div>
              <div v-if="getProjectEvents(project.id).length > 3" class="pl-2 py-0.5 text-[11px] text-gray-400 font-medium hover:text-gray-600 cursor-pointer transition-colors">
                + {{ getProjectEvents(project.id).length - 3 }}개 더보기
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content: Calendar, Project Detail, or Project Edit -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-2xl shadow-blue-900/5 flex-1 flex flex-col relative overflow-hidden">
          
          <!-- Project Edit View -->
          <ProjectEdit
            v-if="selectedProjectId && isProjectEditing"
            :project="selectedProject"
            :allDocuments="allDocuments"
            class="h-full"
            @save="saveProject"
            @cancel="cancelEdit"
          />

          <!-- Project Create View -->
          <ProjectCreate
            v-else-if="isProjectCreating"
            :allDocuments="allDocuments"
            class="h-full"
            @save="saveNewProject"
            @cancel="cancelCreate"
          />

          <!-- Project Detail View -->
          <ProjectDetail
            v-else-if="selectedProjectId"
            :project="selectedProject"
            :allDocuments="allDocuments"
            :showCloseButton="false"
            class="h-full"
            @edit="openEditProjectModal"
          />

          <!-- Calendar View -->
          <FullCalendar 
            v-else
            ref="fullCalendar" 
            :options="calendarOptions" 
            class="h-full w-full calendar-custom" 
          />
        </div>
      </div>
    </div>

    <!-- Event Detail/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/20 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50 transform transition-all scale-100">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditMode ? '일정 수정' : '새 일정' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="saveEvent" class="flex-1 overflow-y-auto">
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">제목 *</label>
              <input
                v-model="eventForm.title"
                type="text"
                required
                class="w-full px-5 py-4 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white text-lg font-medium placeholder:text-gray-400"
                placeholder="일정 제목을 입력하세요"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">설명</label>
              <textarea
                ref="descriptionTextarea"
                v-model="eventForm.description"
                @input="autoResize"
                rows="3"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white overflow-hidden"
                placeholder="일정 설명을 입력하세요"
              ></textarea>
            </div>

            <div>
              <label class="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  v-model="eventForm.allDay"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-3 text-sm font-medium text-gray-700">종일</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ eventForm.allDay ? '시작 날짜 *' : '시작 시간 *' }}
                </label>
                <input
                  v-model="eventForm.startTime"
                  :type="eventForm.allDay ? 'date' : 'datetime-local'"
                  required
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ eventForm.allDay ? '종료 날짜' : '종료 시간' }}
                </label>
                <input
                  v-model="eventForm.endTime"
                  :type="eventForm.allDay ? 'date' : 'datetime-local'"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">장소</label>
              <input
                v-model="eventForm.location"
                type="text"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="장소를 입력하세요"
              />
            </div>

            <!-- Project Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">프로젝트</label>
              <select
                v-model="eventForm.projectId"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option :value="null">프로젝트 없음</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <!-- Category Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
              <CategorySelector
                v-model="eventForm.categoryIds"
                @open-manager="showCategoryManager = true"
              />
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
            <button
              v-if="isEditMode"
              type="button"
              @click="deleteEvent"
              class="px-6 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-xl hover:bg-red-100 transition-all"
            >
              삭제
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-8 py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Manager Modal -->
    <!-- Category Manager Modal -->
    <CategoryManager v-if="showCategoryManager" @close="showCategoryManager = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { scheduleAPI } from '@/services/api';
import { PlusIcon, XMarkIcon } from '@heroicons/vue/24/outline';
import CategorySelector from '@/components/schedule/CategorySelector.vue';
import CategoryManager from '@/components/schedule/CategoryManager.vue';
import { useScheduleCategoryStore } from '@/stores/scheduleCategory';
import { useProjectStore } from '@/stores/projects';
import ProjectDetail from '@/components/ProjectDetail.vue';
import ProjectEdit from '@/components/ProjectEdit.vue';
import ProjectCreate from '@/components/ProjectCreate.vue';
import { documentService } from '@/services/documentService';

const fullCalendar = ref(null);
const showModal = ref(false);
const showCategoryManager = ref(false);
const isEditMode = ref(false);
const currentEventId = ref(null);
const categoryStore = useScheduleCategoryStore();
const projectStore = useProjectStore();
const projects = ref([]);
const selectedProjectId = ref(null);
const allEvents = ref([]);
const allDocuments = ref([]);

// Project Edit State
const isProjectEditing = ref(false);
const isProjectCreating = ref(false);
const currentProjectId = ref(null);

const selectedProject = computed(() => {
  return projects.value.find(p => p.id === selectedProjectId.value) || {};
});

const eventForm = ref({
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  allDay: false,
  color: '#3b82f6',
  location: '',
  projectId: null, // Single project ID
  categoryIds: [] // Multiple category IDs
});

// Watch categoryIds and automatically set color to first category's color
watch(() => eventForm.value.categoryIds, (newCategoryIds) => {
  if (newCategoryIds && newCategoryIds.length > 0) {
    const firstCategory = categoryStore.getCategoryById(newCategoryIds[0]);
    if (firstCategory) {
      eventForm.value.color = firstCategory.color;
    }
  } else {
    // No category selected, use default color
    eventForm.value.color = '#3b82f6';
  }
}, { deep: true });

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
  },
  locale: 'ko', // Korean locale
  buttonText: {
    today: '오늘',
    month: '월',
    week: '주',
    day: '일',
    list: '목록'
  },
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  events: loadEvents,
  select: handleDateSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventResize: handleEventResize,
  height: '100%', // Use 100% height
  // contentHeight: 'auto', // REMOVED: This causes the calendar to expand and breaks internal scrolling
  expandRows: true, // Expand rows to fill height
  stickyHeaderDates: true,
  dayHeaderFormat: { weekday: 'short' }, // Short weekday names
  dragScroll: true,
  dragRevertDuration: 0, // Fix drag visual lag
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short'
  },
  dayCellContent: (arg) => {
    return arg.date.getDate().toString();
  }
};

// FullCalendar의 events 함수 - 이벤트를 동적으로 로드
async function loadEvents(fetchInfo, successCallback, failureCallback) {
  try {
    const response = await scheduleAPI.getAllSchedules();
    if (response.data.success) {
      let events = response.data.data.map(schedule => {
        // ISO 문자열을 Date 객체로 변환 (list view 호환성)
        const startDate = schedule.startTime ? new Date(schedule.startTime) : null;
        const endDate = schedule.endTime ? new Date(schedule.endTime) : null;

        // Use first category color if available, otherwise use schedule color
        const categoryColor = schedule.categories && schedule.categories.length > 0
          ? schedule.categories[0].color
          : schedule.color || '#3b82f6';

        return {
          id: schedule.id,
          title: schedule.title,
          start: startDate,
          end: endDate,
          allDay: schedule.allDay,
          backgroundColor: categoryColor,
          borderColor: categoryColor,
          extendedProps: {
            description: schedule.description,
            location: schedule.location,
            categories: schedule.categories || [],
            project: schedule.project || null
          }
        };
      });

      // Store all events for sidebar display
      allEvents.value = events;

      // Filter by selected project if one is selected
      if (selectedProjectId.value) {
        events = events.filter(event => 
          event.extendedProps.project && event.extendedProps.project.id === selectedProjectId.value
        );
      }

      console.log('📅 Loaded events:', events);
      successCallback(events);
    } else {
      failureCallback(new Error('Failed to load schedules'));
    }
  } catch (error) {
    console.error('Failed to load schedules:', error);
    failureCallback(error);
  }
}

function handleDateSelect(selectInfo) {
  const calendarApi = selectInfo.view.calendar;

  // 날짜 선택 해제
  calendarApi.unselect();

  // 모달 열기
  isEditMode.value = false;
  currentEventId.value = null;

  const startTimeFormatted = selectInfo.allDay
    ? formatDateOnly(selectInfo.start)
    : formatDateTimeLocal(selectInfo.start);
  const endTimeFormatted = selectInfo.allDay
    ? formatDateOnly(selectInfo.end || selectInfo.start)
    : formatDateTimeLocal(selectInfo.end || selectInfo.start);

  eventForm.value = {
    title: '',
    description: '',
    startTime: startTimeFormatted,
    endTime: endTimeFormatted,
    allDay: selectInfo.allDay,
    color: '#3b82f6',
    location: '',
    categoryIds: []
  };

  showModal.value = true;
}

function handleEventClick(clickInfo) {
  const event = clickInfo.event;
  isEditMode.value = true;
  currentEventId.value = event.id;

  eventForm.value = {
    title: event.title,
    description: event.extendedProps.description || '',
    startTime: event.allDay
      ? formatDateOnly(event.start)
      : formatDateTimeLocal(event.start),
    endTime: event.end
      ? (event.allDay ? formatDateOnly(event.end) : formatDateTimeLocal(event.end))
      : '',
    allDay: event.allDay,
    color: event.backgroundColor,
    location: event.extendedProps.location || '',
    projectId: event.extendedProps.project?.id || null,
    categoryIds: event.extendedProps.categories?.map(c => c.id) || []
  };

  showModal.value = true;
}

async function handleEventDrop(dropInfo) {
  const event = dropInfo.event;
  try {
    await scheduleAPI.updateSchedule(event.id, {
      title: event.title,
      description: event.extendedProps.description || '',
      startTime: event.start.toISOString(),
      endTime: event.end ? event.end.toISOString() : null,
      allDay: event.allDay,
      color: event.backgroundColor,
      location: event.extendedProps.location || ''
    });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    alert('일정 이동에 실패했습니다.');
    dropInfo.revert();
  }
}

async function handleEventResize(resizeInfo) {
  const event = resizeInfo.event;
  try {
    await scheduleAPI.updateSchedule(event.id, {
      title: event.title,
      description: event.extendedProps.description || '',
      startTime: event.start.toISOString(),
      endTime: event.end ? event.end.toISOString() : null,
      allDay: event.allDay,
      color: event.backgroundColor,
      location: event.extendedProps.location || ''
    });
  } catch (error) {
    console.error('Failed to update schedule:', error);
    alert('일정 크기 조정에 실패했습니다.');
    resizeInfo.revert();
  }
}

function openCreateModal() {
  isEditMode.value = false;
  currentEventId.value = null;

  // 현재 날짜를 기본값으로 설정
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  eventForm.value = {
    title: '',
    description: '',
    startTime: formatDateTimeLocal(now),
    endTime: formatDateTimeLocal(tomorrow),
    allDay: false,
    color: '#3b82f6',
    location: '',
    projectId: null,
    categoryIds: []
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

async function saveEvent() {
  try {
    // allDay 이벤트의 경우 날짜만 사용, 시간은 자정으로 설정
    let startTime, endTime;

    if (eventForm.value.allDay) {
      // 날짜만 있는 경우 (YYYY-MM-DD 형식) - 자정부터 자정까지
      const startDate = parseLocalDateTime(eventForm.value.startTime + 'T00:00');
      const endDate = eventForm.value.endTime
        ? parseLocalDateTime(eventForm.value.endTime + 'T23:59')
        : null;

      startTime = startDate.toISOString();
      endTime = endDate ? endDate.toISOString() : null;
    } else {
      // 날짜와 시간이 모두 있는 경우 - 로컬 시간을 명시적으로 파싱
      const startDate = parseLocalDateTime(eventForm.value.startTime);
      const endDate = eventForm.value.endTime
        ? parseLocalDateTime(eventForm.value.endTime)
        : null;

      startTime = startDate.toISOString();
      endTime = endDate ? endDate.toISOString() : null;
    }

    const scheduleData = {
      title: eventForm.value.title,
      description: eventForm.value.description,
      startTime: startTime,
      endTime: endTime,
      allDay: eventForm.value.allDay,
      color: eventForm.value.color,
      location: eventForm.value.location,
      projectId: eventForm.value.projectId,
      categoryIds: eventForm.value.categoryIds || []
    };

    if (isEditMode.value) {
      await scheduleAPI.updateSchedule(currentEventId.value, scheduleData);
    } else {
      await scheduleAPI.createSchedule(scheduleData);
    }

    // 캘린더 이벤트 새로고침
    refreshCalendar();
    closeModal();
  } catch (error) {
    console.error('Failed to save schedule:', error);
    alert('일정 저장에 실패했습니다.');
  }
}

async function deleteEvent() {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return;

  try {
    await scheduleAPI.deleteSchedule(currentEventId.value);

    // 캘린더 이벤트 새로고침
    refreshCalendar();
    closeModal();
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    alert('일정 삭제에 실패했습니다.');
  }
}

function refreshCalendar() {
  // FullCalendar API를 통해 이벤트 소스 새로고침
  if (fullCalendar.value) {
    const calendarApi = fullCalendar.value.getApi();
    calendarApi.refetchEvents();
  }
}

function formatDateTimeLocal(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatDateOnly(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatShortDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1);
  const day = String(d.getDate());
  return `${month}/${day}`;
}

function formatEventTime(event) {
  if (!event.start) return '';
  const d = new Date(event.start);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const dateStr = `${month}/${day}`;

  if (event.allDay) {
    return dateStr;
  } else {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${dateStr} ${hours}:${minutes}`;
  }
}

function getProjectEvents(projectId) {
  return allEvents.value.filter(event => 
    event.extendedProps.project && event.extendedProps.project.id === projectId
  );
}

// datetime-local 문자열을 명시적으로 로컬 타임존 Date 객체로 변환
function parseLocalDateTime(dateTimeString) {
  if (!dateTimeString) return null;

  const [datePart, timePart] = dateTimeString.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);

  // Date 생성자에 개별 값을 전달하면 항상 로컬 타임존으로 해석됨
  return new Date(year, month - 1, day, hours, minutes);
}

// Load projects
async function loadProjects() {
  try {
    await projectStore.fetchProjects();
    projects.value = projectStore.projects;
  } catch (error) {
    console.error('Failed to load projects:', error);
  }
}

async function loadDocuments() {
  try {
    const response = await documentService.getAll({ page: 0, size: 1000 });
    allDocuments.value = response.data.data?.content || response.data?.content || response.content || [];
  } catch (error) {
    console.error('Failed to load documents:', error);
  }
}

function selectProject(projectId) {
  selectedProjectId.value = projectId;
  isProjectCreating.value = false;
  isProjectEditing.value = false;
  // Calendar refresh is not needed if we are hiding it, but good to keep if we switch back
  if (!projectId) {
    refreshCalendar();
  }
}

function openCreateProject() {
  selectedProjectId.value = null;
  isProjectEditing.value = false;
  isProjectCreating.value = true;
}

function cancelCreate() {
  isProjectCreating.value = false;
}

async function saveNewProject(formData) {
  try {
    const response = await projectStore.createProject(formData);
    const newProject = response.data?.data || response.data || response;
    
    await loadProjects(); // Refresh list
    
    // Select the new project
    if (newProject && newProject.id) {
      selectProject(newProject.id);
    } else {
      // Fallback if ID not immediately available (though it should be)
      cancelCreate();
    }
  } catch (error) {
    console.error('Failed to create project:', error);
    alert('프로젝트 생성에 실패했습니다.');
  }
}

function openEditProjectModal(project) {
  isProjectEditing.value = true;
  currentProjectId.value = project.id;
}

function cancelEdit() {
  isProjectEditing.value = false;
  currentProjectId.value = null;
}

async function saveProject(formData) {
  try {
    await projectStore.updateProject(currentProjectId.value, formData);
    // Update local projects list if needed, or rely on store reactivity
    // Refresh selected project if it was the one edited
    if (selectedProjectId.value === currentProjectId.value) {
      // Force update or re-fetch if necessary, but store should handle it
    }
    cancelEdit();
    loadProjects(); // Refresh list
  } catch (error) {
    console.error('Failed to save project:', error);
    alert('프로젝트 저장에 실패했습니다.');
  }
}

onMounted(() => {
  // 초기 로드는 FullCalendar가 자동으로 처리
  loadProjects();
  loadDocuments();
  categoryStore.fetchCategories();
});

const descriptionTextarea = ref(null);

const autoResize = () => {
  const element = descriptionTextarea.value;
  if (element) {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
  }
};

// Watch for modal open to resize textarea for existing content
watch(showModal, async (newVal) => {
  if (newVal) {
    // Wait for DOM update
    await nextTick();
    autoResize();
  }
});
</script>

<style scoped>
/* FullCalendar Custom Styles */
:deep(.fc) {
  --fc-border-color: transparent;
  --fc-button-bg-color: white;
  --fc-button-border-color: #e5e7eb;
  --fc-button-text-color: #374151;
  --fc-button-hover-bg-color: #f9fafb;
  --fc-button-hover-border-color: #d1d5db;
  --fc-button-active-bg-color: #f3f4f6;
  --fc-button-active-border-color: #d1d5db;
  --fc-event-bg-color: #3b82f6;
  --fc-event-border-color: transparent;
  --fc-today-bg-color: #eff6ff;
  --fc-neutral-bg-color: #f9fafb;
  --fc-list-event-hover-bg-color: #f3f4f6;
  font-family: inherit;
}

/* Header Toolbar */
:deep(.fc-header-toolbar) {
  margin-bottom: 2rem !important;
  padding: 0 0.5rem;
}

:deep(.fc-toolbar-title) {
  font-size: 1.75rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
}

:deep(.fc-button) {
  border-radius: 1rem;
  font-weight: 600;
  padding: 0.6rem 1.2rem;
  text-transform: capitalize;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
}

:deep(.fc-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(0, 0, 0, 0.05), 0 3px 6px -1px rgba(0, 0, 0, 0.03);
}

:deep(.fc-button-active) {
  background-color: #111827 !important;
  border-color: #111827 !important;
  color: white !important;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05) !important;
}

:deep(.fc-button-group) {
  gap: 0.75rem;
}

:deep(.fc-button-group > .fc-button) {
  border-radius: 1rem !important;
  margin-left: 0 !important;
}

/* Calendar Grid */
:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #f3f4f6;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 16px 0;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  padding: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background-color: #111827;
  color: white;
}

/* Weekend Background */
:deep(.fc-day-sat),
:deep(.fc-day-sun) {
  background-color: #f9fafb;
}

/* Events */
:deep(.fc-event) {
  border-radius: 0.5rem;
  padding: 1px 4px;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1px;
  cursor: pointer;
  line-height: 1.2;
}

:deep(.fc-event:hover) {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

:deep(.fc-daygrid-event-dot) {
  border-width: 3px;
  border-radius: 50%;
}

:deep(.fc-daygrid-day-frame) {
  padding: 8px;
}

:deep(.fc-scrollgrid) {
  border: none;
}

:deep(.fc-scrollgrid-section-header > td) {
  border-bottom: 1px solid #f3f4f6;
}

/* TimeGrid View */
:deep(.fc-timegrid-slot) {
  height: 0.5rem;
  border-bottom: 1px dashed #f3f4f6;
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
}

:deep(.fc-v-event) {
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* List View */
:deep(.fc-list) {
  border: none;
}

:deep(.fc-list-day-cushion) {
  background-color: transparent;
  padding: 1.5rem 1rem 0.5rem;
}

:deep(.fc-list-day-text) {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

:deep(.fc-list-day-side-text) {
  font-size: 1.1rem;
  font-weight: 500;
  color: #9ca3af;
}

:deep(.fc-list-event) {
  cursor: pointer;
}

:deep(.fc-list-event:hover td) {
  background-color: #f9fafb;
}

:deep(.fc-list-event-dot) {
  border-width: 4px;
}

:deep(.fc-list-event-title) {
  font-weight: 600;
  color: #374151;
}

:deep(.fc-list-event-time) {
  font-weight: 500;
  color: #6b7280;
}

/* Fix for drag mirror positioning */
:deep(.fc-event-dragging) {
  z-index: 9999 !important;
}
</style>
