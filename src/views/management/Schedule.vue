<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto">
      <!-- Header with Add Button -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">일정관리</h1>
        <button
          @click="openCreateModal"
          class="flex items-center px-5 py-2.5 bg-gradient-to-r from-orange-primary to-orange-medium text-white rounded-lg hover:from-orange-medium hover:to-orange-dark transition shadow-md"
        >
          <PlusIcon class="w-5 h-5 mr-2" />
          새 일정 추가
        </button>
      </div>

      <!-- Full Width Calendar -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <FullCalendar ref="fullCalendar" :options="calendarOptions" />
      </div>
    </div>

    <!-- Event Detail/Edit Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-gradient-to-r from-orange-primary to-orange-medium text-white px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-semibold">
            {{ isEditMode ? '일정 수정' : '새 일정 추가' }}
          </h2>
          <button @click="closeModal" class="text-white hover:text-gray-200">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveEvent" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
            <input
              v-model="eventForm.title"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              placeholder="일정 제목을 입력하세요"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <textarea
              v-model="eventForm.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              placeholder="일정에 대한 설명을 입력하세요"
            ></textarea>
          </div>

          <div>
            <label class="flex items-center mb-4">
              <input
                v-model="eventForm.allDay"
                type="checkbox"
                class="w-4 h-4 text-orange-primary border-gray-300 rounded focus:ring-orange-primary"
              />
              <span class="ml-2 text-sm text-gray-700">하루 종일</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ eventForm.allDay ? '시작 날짜 *' : '시작 시간 *' }}
              </label>
              <input
                v-model="eventForm.startTime"
                :type="eventForm.allDay ? 'date' : 'datetime-local'"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ eventForm.allDay ? '종료 날짜' : '종료 시간' }}
              </label>
              <input
                v-model="eventForm.endTime"
                :type="eventForm.allDay ? 'date' : 'datetime-local'"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">장소</label>
            <input
              v-model="eventForm.location"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              placeholder="장소를 입력하세요"
            />
          </div>

          <!-- Project Selector (Single Selection) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 (선택)</label>
            <select
              v-model="eventForm.projectId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            >
              <option :value="null">프로젝트 없음</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Category Selector (Multiple Selection) -->
          <CategorySelector
            v-model="eventForm.categoryIds"
            @open-manager="showCategoryManager = true"
          />

          <div class="flex justify-end space-x-3 pt-4">
            <button
              v-if="isEditMode"
              type="button"
              @click="deleteEvent"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              삭제
            </button>
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
            >
              취소
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-gradient-to-r from-orange-primary to-orange-medium text-white rounded-lg hover:from-orange-medium hover:to-orange-dark transition"
            >
              저장
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
  color: '#fb923c',
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
    eventForm.value.color = '#fb923c';
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
  locale: 'ko',
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
  height: 700,
  contentHeight: 650
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
          : schedule.color || '#fb923c';

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

  // 디버깅: 선택된 날짜/시간 정보 확인
  console.log('📅 Date Select:', {
    allDay: selectInfo.allDay,
    start: selectInfo.start,
    end: selectInfo.end,
    startISO: selectInfo.start.toISOString(),
    endISO: selectInfo.end?.toISOString()
  });

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

  console.log('📝 Formatted times:', {
    startTime: startTimeFormatted,
    endTime: endTimeFormatted
  });

  eventForm.value = {
    title: '',
    description: '',
    startTime: startTimeFormatted,
    endTime: endTimeFormatted,
    allDay: selectInfo.allDay,
    color: '#fb923c',
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
    alert('일정 크기 변경에 실패했습니다.');
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
    color: '#fb923c',
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

    console.log('💾 Saving event:', {
      allDay: eventForm.value.allDay,
      startTimeInput: eventForm.value.startTime,
      endTimeInput: eventForm.value.endTime
    });

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

    console.log('🌐 ISO times:', { startTime, endTime });

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

<style>
/* FullCalendar 커스텀 스타일 */
.fc {
  font-family: inherit;
}

.fc .fc-button-primary {
  background-color: #fb923c;
  border-color: #fb923c;
}

.fc .fc-button-primary:hover {
  background-color: #f97316;
  border-color: #f97316;
}

.fc .fc-button-primary:not(:disabled).fc-button-active {
  background-color: #ea580c;
  border-color: #ea580c;
}

.fc .fc-button-primary:disabled {
  background-color: #fdba74;
  border-color: #fdba74;
}

.fc-theme-standard td,
.fc-theme-standard th {
  border-color: #e5e7eb;
}

.fc .fc-daygrid-day.fc-day-today {
  background-color: #fff7ed;
}

.fc-event {
  cursor: pointer;
}
</style>
