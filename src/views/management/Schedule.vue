<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Schedule</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            Manage and track your project timelines
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          <PlusIcon class="w-5 h-5" />
          Add Event
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Calendar Section -->
        <div class="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm" style="min-height: calc(100vh - 200px);">
          <FullCalendar ref="fullCalendar" :options="calendarOptions" class="h-full w-full" />
        </div>
      </div>
    </div>

    <!-- Event Detail/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Modal Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditMode ? 'Edit Event' : 'New Event' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <!-- Modal Form -->
        <form @submit.prevent="saveEvent" class="flex-1 overflow-y-auto">
          <div class="p-8 space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
              <input
                v-model="eventForm.title"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                v-model="eventForm.description"
                rows="3"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white"
                placeholder="Enter event description"
              ></textarea>
            </div>

            <div>
              <label class="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  v-model="eventForm.allDay"
                  type="checkbox"
                  class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-3 text-sm font-medium text-gray-700">All Day Event</span>
              </label>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  {{ eventForm.allDay ? 'Start Date *' : 'Start Time *' }}
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
                  {{ eventForm.allDay ? 'End Date' : 'End Time' }}
                </label>
                <input
                  v-model="eventForm.endTime"
                  :type="eventForm.allDay ? 'date' : 'datetime-local'"
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
              <input
                v-model="eventForm.location"
                type="text"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter location"
              />
            </div>

            <!-- Project Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Project</label>
              <select
                v-model="eventForm.projectId"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              >
                <option :value="null">No Project</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <!-- Category Selector -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
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
              Delete
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Category Manager Modal -->
    <CategoryManager v-if="showCategoryManager" @close="showCategoryManager = false" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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

const fullCalendar = ref(null);
const showModal = ref(false);
const showCategoryManager = ref(false);
const isEditMode = ref(false);
const currentEventId = ref(null);
const categoryStore = useScheduleCategoryStore();
const projectStore = useProjectStore();
const projects = ref([]);

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
  locale: 'en', // Changed to English for consistency
  buttonText: {
    today: 'Today',
    month: 'Month',
    week: 'Week',
    day: 'Day',
    list: 'List'
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
  height: '100%', // Use 100% height
  contentHeight: 'auto',
  expandRows: true, // Expand rows to fill height
  stickyHeaderDates: true,
  dayHeaderFormat: { weekday: 'short' }, // Short weekday names
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: 'short'
  }
};

// FullCalendar의 events 함수 - 이벤트를 동적으로 로드
async function loadEvents(fetchInfo, successCallback, failureCallback) {
  try {
    const response = await scheduleAPI.getAllSchedules();
    if (response.data.success) {
      const events = response.data.data.map(schedule => {
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
    alert('Failed to move event.');
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
    alert('Failed to resize event.');
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
    alert('Failed to save event.');
  }
}

async function deleteEvent() {
  if (!confirm('Are you sure you want to delete this event?')) return;

  try {
    await scheduleAPI.deleteSchedule(currentEventId.value);

    // 캘린더 이벤트 새로고침
    refreshCalendar();
    closeModal();
  } catch (error) {
    console.error('Failed to delete schedule:', error);
    alert('Failed to delete event.');
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

onMounted(() => {
  // 초기 로드는 FullCalendar가 자동으로 처리
  loadProjects();
  categoryStore.fetchCategories();
});
</script>

<style scoped>
/* FullCalendar Custom Styles */
:deep(.fc) {
  --fc-border-color: #f3f4f6;
  --fc-button-bg-color: #3b82f6;
  --fc-button-border-color: #3b82f6;
  --fc-button-hover-bg-color: #2563eb;
  --fc-button-hover-border-color: #2563eb;
  --fc-button-active-bg-color: #1d4ed8;
  --fc-button-active-border-color: #1d4ed8;
  --fc-event-bg-color: #3b82f6;
  --fc-event-border-color: #3b82f6;
  --fc-today-bg-color: #eff6ff;
  --fc-neutral-bg-color: #f9fafb;
  --fc-list-event-hover-bg-color: #f3f4f6;
  font-family: inherit;
}

:deep(.fc-toolbar-title) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 12px 0;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  padding: 8px;
}

:deep(.fc-button) {
  border-radius: 0.75rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  text-transform: capitalize;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.fc-button-group) {
  gap: 0.5rem;
}

:deep(.fc-button-group > .fc-button) {
  border-radius: 0.75rem;
  margin-left: 0 !important;
}

:deep(.fc-event) {
  border-radius: 0.5rem;
  padding: 2px 4px;
  font-size: 0.85rem;
  font-weight: 500;
  border: none;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

:deep(.fc-daygrid-day-frame) {
  padding: 4px;
}

:deep(.fc-scrollgrid) {
  border: none;
}

:deep(.fc-scrollgrid-section-header > td) {
  border-bottom-width: 1px;
}
</style>
