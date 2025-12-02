<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
    <!-- Header -->
    <ScheduleHeader
      :loading="eventsComposable.loading.value"
      @create="openCreateModal"
    />

    <div class="flex-1 flex min-h-0 px-6 pt-4 pb-12 overflow-hidden gap-6">
      <!-- Left Sidebar: Project List -->
      <ScheduleProjectSidebar
        :projects="projectsComposable.projects.value"
        :selected-project-id="projectsComposable.selectedProjectId.value"
        :all-events="eventsComposable.allEvents.value"
        @select-project="projectsComposable.selectProject"
        @create-project="projectsComposable.openCreateProject"
        @event-click="handleEventClick"
      />

      <!-- Right Content: Calendar, Project Detail, or Project Edit -->
      <div class="flex-1 flex flex-col min-w-0">
        <div class="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex-1 flex flex-col relative overflow-hidden">

          <!-- Project Edit View -->
          <ProjectEdit
            v-if="projectsComposable.selectedProjectId.value && projectsComposable.isProjectEditing.value"
            :project="projectsComposable.selectedProject.value"
            :all-documents="projectsComposable.allDocuments.value"
            class="h-full"
            @save="handleSaveProject"
            @cancel="projectsComposable.cancelEdit"
          />

          <!-- Project Create View -->
          <ProjectCreate
            v-else-if="projectsComposable.isProjectCreating.value"
            :all-documents="projectsComposable.allDocuments.value"
            class="h-full"
            @save="handleSaveNewProject"
            @cancel="projectsComposable.cancelCreate"
          />

          <!-- Project Detail View -->
          <ProjectDetail
            v-else-if="projectsComposable.selectedProjectId.value"
            :project="projectsComposable.selectedProject.value"
            :all-documents="projectsComposable.allDocuments.value"
            :show-close-button="true"
            class="h-full"
            @edit="projectsComposable.openEditProjectModal"
            @delete="handleDeleteProject"
            @close="projectsComposable.deselectProject"
          />

          <!-- Calendar View -->
          <FullCalendar
            v-else
            ref="fullCalendarRef"
            :options="calendarOptions"
            class="h-full w-full calendar-custom"
          />
        </div>
      </div>
    </div>

    <!-- Event Detail/Edit Modal -->
    <ScheduleEventModal
      v-model="eventFormComposable.eventForm.value"
      :show="showModal"
      :is-edit-mode="eventFormComposable.isEditMode.value"
      :projects="projectsComposable.projects.value"
      :saving="eventsComposable.loading.value"
      @close="closeModal"
      @save="saveEvent"
      @delete="deleteEvent"
      @open-category-manager="showCategoryManager = true"
    />

    <!-- Category Manager Modal -->
    <CategoryManager
      v-if="showCategoryManager"
      @close="showCategoryManager = false"
    />
  </div>
</template>

<script setup>
/**
 * 일정 관리 페이지
 * @description 프로젝트와 일정을 관리하는 메인 페이지
 *
 * 리팩토링 구조:
 * - composables: 비즈니스 로직 분리
 * - components: UI 컴포넌트 분리
 */
import { ref, computed, onMounted, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'

// Components
import ScheduleHeader from '@/components/management/schedule/ScheduleHeader.vue'
import ScheduleProjectSidebar from '@/components/management/schedule/ScheduleProjectSidebar.vue'
import ScheduleEventModal from '@/components/management/schedule/ScheduleEventModal.vue'
import CategoryManager from '@/components/schedule/CategoryManager.vue'
import ProjectDetail from '@/components/ProjectDetail.vue'
import ProjectEdit from '@/components/ProjectEdit.vue'
import ProjectCreate from '@/components/ProjectCreate.vue'

// Composables
import { useScheduleCalendar } from '@/composables/management/useScheduleCalendar'
import { useScheduleEvents } from '@/composables/management/useScheduleEvents'
import { useScheduleProjects } from '@/composables/management/useScheduleProjects'
import { useScheduleEventForm } from '@/composables/management/useScheduleEventForm'

// Stores
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'

// ============================================
// Composables Setup
// ============================================
const calendarComposable = useScheduleCalendar()
const eventsComposable = useScheduleEvents()
const projectsComposable = useScheduleProjects()
const eventFormComposable = useScheduleEventForm()
const categoryStore = useScheduleCategoryStore()

// ============================================
// State
// ============================================
const showModal = ref(false)
const showCategoryManager = ref(false)
const fullCalendarRef = ref(null)

// ============================================
// Calendar Options
// ============================================
const calendarOptions = computed(() =>
  calendarComposable.createCalendarOptions({
    loadEvents: handleLoadEvents,
    onDateSelect: handleDateSelect,
    onEventClick: handleEventClick,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize
  })
)

// ============================================
// Calendar Event Handlers
// ============================================

/**
 * 캘린더 이벤트 로드
 */
function handleLoadEvents(fetchInfo, successCallback, failureCallback) {
  eventsComposable.loadEventsForCalendar(
    fetchInfo,
    successCallback,
    failureCallback,
    projectsComposable.selectedProjectId.value
  )
}

/**
 * 날짜 선택 핸들러
 */
function handleDateSelect(selectInfo) {
  const calendarApi = selectInfo.view.calendar
  calendarApi.unselect()

  eventFormComposable.initFromDateSelect(selectInfo)
  showModal.value = true
}

/**
 * 이벤트 클릭 핸들러
 */
function handleEventClick(clickInfo) {
  const event = clickInfo.event
  eventFormComposable.initFromEvent(event)
  showModal.value = true
}

/**
 * 이벤트 드래그 핸들러
 */
async function handleEventDrop(dropInfo) {
  const result = await eventsComposable.updateEventFromDrag(dropInfo.event)
  if (!result.success) {
    alert('일정 이동에 실패했습니다.')
    dropInfo.revert()
  }
}

/**
 * 이벤트 리사이즈 핸들러
 */
async function handleEventResize(resizeInfo) {
  const result = await eventsComposable.updateEventFromDrag(resizeInfo.event)
  if (!result.success) {
    alert('일정 크기 조정에 실패했습니다.')
    resizeInfo.revert()
  }
}

// ============================================
// Modal Handlers
// ============================================

/**
 * 일정 추가 모달 열기
 */
function openCreateModal() {
  eventFormComposable.initCreateForm()
  showModal.value = true
}

/**
 * 모달 닫기
 */
function closeModal() {
  showModal.value = false
}

/**
 * 일정 저장
 */
async function saveEvent() {
  const formData = eventFormComposable.getFormData()
  let result

  if (eventFormComposable.isEditMode.value) {
    result = await eventsComposable.updateEvent(
      eventFormComposable.currentEventId.value,
      formData
    )
  } else {
    result = await eventsComposable.createEvent(formData)
  }

  if (result.success) {
    refreshCalendar()
    closeModal()
  } else {
    alert('일정 저장에 실패했습니다.')
  }
}

/**
 * 일정 삭제
 */
async function deleteEvent() {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return

  const result = await eventsComposable.deleteEvent(
    eventFormComposable.currentEventId.value
  )

  if (result.success) {
    refreshCalendar()
    closeModal()
  } else {
    alert('일정 삭제에 실패했습니다.')
  }
}

// ============================================
// Project Handlers
// ============================================

/**
 * 새 프로젝트 저장
 */
async function handleSaveNewProject(formData) {
  const result = await projectsComposable.saveNewProject(formData)
  if (!result.success) {
    alert('프로젝트 생성에 실패했습니다.')
  }
}

/**
 * 프로젝트 저장
 */
async function handleSaveProject(formData) {
  const result = await projectsComposable.saveProject(formData)
  if (!result.success) {
    alert('프로젝트 저장에 실패했습니다.')
  }
}

/**
 * 프로젝트 삭제
 */
async function handleDeleteProject(project) {
  const result = await projectsComposable.deleteProject(project)
  if (result.success) {
    refreshCalendar()
  } else {
    alert('프로젝트 삭제에 실패했습니다.')
  }
}

// ============================================
// Utilities
// ============================================

/**
 * 캘린더 새로고침
 */
function refreshCalendar() {
  if (fullCalendarRef.value) {
    const calendarApi = fullCalendarRef.value.getApi()
    calendarApi.refetchEvents()
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  projectsComposable.loadProjects()
  projectsComposable.loadDocuments()
  categoryStore.fetchCategories()
})

// 프로젝트 선택 변경 시 캘린더 새로고침
watch(
  () => projectsComposable.selectedProjectId.value,
  (newVal, oldVal) => {
    if (newVal !== oldVal && !newVal) {
      refreshCalendar()
    }
  }
)
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
  --fc-today-bg-color: #f0f9ff;
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
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
}

:deep(.fc-button) {
  border-radius: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  text-transform: capitalize;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #f3f4f6;
  font-size: 0.875rem;
}

:deep(.fc-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  background-color: white;
  border-color: #e5e7eb;
}

:deep(.fc-button-active) {
  background-color: #1f2937 !important;
  border-color: #1f2937 !important;
  color: white !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

:deep(.fc-button-group) {
  gap: 0.5rem;
}

:deep(.fc-button-group > .fc-button) {
  border-radius: 0.75rem !important;
  margin-left: 0 !important;
}

/* Calendar Grid */
:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #f3f4f6;
}

:deep(.fc-col-header-cell-cushion) {
  padding: 12px 0;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

:deep(.fc-daygrid-day-number) {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  padding: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 4px;
  border-radius: 50%;
  transition: all 0.2s;
}

:deep(.fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* Weekend Background */
:deep(.fc-day-sat),
:deep(.fc-day-sun) {
  background-color: #fafafa;
}

/* Events */
:deep(.fc-event) {
  border-radius: 0.375rem;
  padding: 2px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  border: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 2px;
  cursor: pointer;
  line-height: 1.3;
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
  padding: 4px;
}

:deep(.fc-scrollgrid) {
  border: none;
}

:deep(.fc-scrollgrid-section-header > td) {
  border-bottom: 1px solid #f3f4f6;
}

/* TimeGrid View */
:deep(.fc-timegrid-slot) {
  height: 3rem;
  border-bottom: 1px dashed #f3f4f6;
}

:deep(.fc-timegrid-slot-label) {
  font-size: 0.75rem;
  font-weight: 500;
  color: #9ca3af;
}

:deep(.fc-v-event) {
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
