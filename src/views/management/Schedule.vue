<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
    <!-- Header -->
    <ScheduleHeader
      :loading="eventsComposable.loading.value"
      :syncing-outlook="eventsComposable.syncingOutlook.value"
      :is-outlook-connected="outlookAuthComposable.authStatus.value.isConnected"
      :outlook-email="outlookAuthComposable.authStatus.value.outlookEmail"
      @create="openCreateModal"
      @sync-outlook="handleSyncOutlook"
      @connect-outlook="handleConnectOutlook"
    />

    <!-- Mobile Tabs -->
    <ScheduleMobileTabs
      :active-tab="activeTab"
      @switch-tab="switchTab"
    />

    <div class="flex-1 flex flex-col md:flex-row min-h-0 px-4 md:px-6 pt-4 pb-24 md:pb-12 overflow-hidden gap-4 md:gap-6">
      <!-- Left Sidebar: Project List -->
      <div
        class="w-full md:w-80 flex-shrink-0 flex flex-col h-full"
        :class="{'hidden md:flex': activeTab !== 'projects'}"
      >
        <ScheduleProjectSidebar
          :projects="projectsComposable.projects.value"
          :selected-project-id="projectsComposable.selectedProjectId.value"
          :all-events="eventsComposable.allEvents.value"
          @select-project="handleProjectSelect"
          @create-project="projectsComposable.openCreateProject"
          @event-click="handleEventClick"
          class="h-full"
        />
      </div>

      <!-- Right Content: Calendar, Project Detail, or Project Edit -->
      <div
        class="flex-1 flex flex-col min-w-0 h-full"
        :class="{'hidden md:flex': activeTab !== 'schedule'}"
      >
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

    <!-- Outlook Auth Modal -->
    <OutlookAuthModal
      :show="outlookAuthComposable.showAuthModal.value"
      :device-code="outlookAuthComposable.deviceCode.value"
      :auth-timeout="outlookAuthComposable.authTimeout.value"
      @close="outlookAuthComposable.closeAuthModal"
      @open-auth-page="outlookAuthComposable.openAuthPage"
    />
  </div>
</template>

<script setup>
/**
 * 일정 관리 페이지
 * @description 프로젝트와 일정을 관리하는 메인 페이지
 *
 * 리팩토링 구조:
 * - composables: 비즈니스 로직 분리 (5개)
 * - components: UI 컴포넌트 분리 (9개)
 * - styles: FullCalendar 커스텀 스타일 분리
 */
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FullCalendar from '@fullcalendar/vue3'

// Components
import ScheduleHeader from '@/components/management/schedule/ScheduleHeader.vue'
import ScheduleProjectSidebar from '@/components/management/schedule/ScheduleProjectSidebar.vue'
import ScheduleEventModal from '@/components/management/schedule/ScheduleEventModal.vue'
import ScheduleMobileTabs from '@/components/management/schedule/ScheduleMobileTabs.vue'
import CategoryManager from '@/components/management/schedule/CategoryManager.vue'
import ProjectDetail from '@/components/ProjectDetail.vue'
import ProjectEdit from '@/components/ProjectEdit.vue'
import ProjectCreate from '@/components/ProjectCreate.vue'
import OutlookAuthModal from '@/components/outlook/OutlookAuthModal.vue'

// Composables
import { useScheduleCalendar } from '@/composables/management/useScheduleCalendar'
import { useScheduleEvents } from '@/composables/management/useScheduleEvents'
import { useScheduleProjects } from '@/composables/management/useScheduleProjects'
import { useScheduleEventForm } from '@/composables/management/useScheduleEventForm'
import { useOutlookAuth } from '@/composables/outlook/useOutlookAuth'

// Stores
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'

// Styles
import '@/styles/components/fullcalendar-custom.css'

// ============================================
// Composables Setup
// ============================================
const calendarComposable = useScheduleCalendar()
const eventsComposable = useScheduleEvents()
const projectsComposable = useScheduleProjects()
const eventFormComposable = useScheduleEventForm()
const categoryStore = useScheduleCategoryStore()
const outlookAuthComposable = useOutlookAuth()

// ============================================
// State
// ============================================
const showModal = ref(false)
const showCategoryManager = ref(false)
const fullCalendarRef = ref(null)

const route = useRoute()
const router = useRouter()
const activeTab = ref('projects') // 'projects' | 'schedule'

// ============================================
// Tab Navigation
// ============================================
function switchTab(tab) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

function handleProjectSelect(project) {
  projectsComposable.selectProject(project)
  // 모바일에서는 프로젝트 선택 시 스케줄 탭(상세 보기)으로 이동
  if (window.innerWidth < 768) {
    switchTab('schedule')
  }
}

// ============================================
// Calendar Options
// ============================================
const calendarOptions = computed(() =>
  calendarComposable.createCalendarOptions({
    loadEvents: handleLoadEvents,
    onDateSelect: handleDateSelect,
    onEventClick: handleEventClick,
    onEventDrop: handleEventDrop,
    onEventResize: handleEventResize,
    onCreateClick: openCreateModal
  })
)

// ============================================
// Calendar Event Handlers
// ============================================

/** 캘린더 이벤트 로드 */
function handleLoadEvents(fetchInfo, successCallback, failureCallback) {
  // 프로젝트 객체 전달 (id와 name 포함) - 카테고리 이름으로도 필터링 가능하도록
  const selectedProject = projectsComposable.selectedProjectId.value
    ? projectsComposable.selectedProject.value
    : null

  eventsComposable.loadEventsForCalendar(
    fetchInfo,
    successCallback,
    failureCallback,
    selectedProject
  )
}

/** 날짜 선택 핸들러 */
function handleDateSelect(selectInfo) {
  const calendarApi = selectInfo.view.calendar
  calendarApi.unselect()

  eventFormComposable.initFromDateSelect(selectInfo)
  showModal.value = true
}

/** 이벤트 클릭 핸들러 */
function handleEventClick(clickInfo) {
  const event = clickInfo.event
  eventFormComposable.initFromEvent(event)
  showModal.value = true
}

/** 이벤트 드래그 핸들러 */
async function handleEventDrop(dropInfo) {
  const result = await eventsComposable.updateEventFromDrag(dropInfo.event)
  if (!result.success) {
    alert('일정 이동에 실패했습니다.')
    dropInfo.revert()
  }
}

/** 이벤트 리사이즈 핸들러 */
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

/** 일정 추가 모달 열기 */
function openCreateModal() {
  eventFormComposable.initCreateForm()
  showModal.value = true
}

/** 모달 닫기 */
function closeModal() {
  showModal.value = false
}

/** 일정 저장 */
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

/** 일정 삭제 */
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

/** 새 프로젝트 저장 */
async function handleSaveNewProject(formData) {
  const result = await projectsComposable.saveNewProject(formData)
  if (result.success) {
    // 백엔드에서 프로젝트 생성 시 카테고리가 자동 동기화되므로 새로고침
    await categoryStore.fetchCategories()
  } else {
    alert('프로젝트 생성에 실패했습니다.')
  }
}

/** 프로젝트 저장 */
async function handleSaveProject(formData) {
  const result = await projectsComposable.saveProject(formData)
  if (result.success) {
    // 백엔드에서 프로젝트 이름 변경 시 카테고리도 자동 동기화되므로 새로고침
    await categoryStore.fetchCategories()
  } else {
    alert('프로젝트 저장에 실패했습니다.')
  }
}

/** 프로젝트 삭제 */
async function handleDeleteProject(project) {
  const result = await projectsComposable.deleteProject(project)
  if (result.success) {
    refreshCalendar()
    // 백엔드에서 프로젝트 삭제 시 카테고리도 자동 동기화되므로 새로고침
    await categoryStore.fetchCategories()
  } else {
    alert('프로젝트 삭제에 실패했습니다.')
  }
}

// ============================================
// Outlook Calendar Sync
// ============================================

/** Outlook 연동 시작 */
function handleConnectOutlook() {
  outlookAuthComposable.connectOutlook(async () => {
    // 연동 성공 시 캘린더 동기화 실행
    await handleSyncOutlook()
  })
}

/** Outlook 캘린더 동기화 실행 */
async function handleSyncOutlook() {
  const result = await eventsComposable.syncOutlookCalendar()
  if (result.success) {
    refreshCalendar()
    // 카테고리 새로고침 및 프로젝트 자동 생성
    await categoryStore.fetchCategories()
    const syncResult = await projectsComposable.syncProjectsFromCategories()

    let message = result.message || 'Outlook 일정 동기화가 완료되었습니다.'
    const changes = []
    if (syncResult.created > 0) {
      changes.push(`${syncResult.created}개 생성`)
    }
    if (syncResult.deleted > 0) {
      changes.push(`${syncResult.deleted}개 삭제`)
    }
    if (changes.length > 0) {
      message += ` (프로젝트: ${changes.join(', ')})`
    }
    alert(message)
  } else {
    // JWT/토큰 관련 오류인지 확인
    const errorMsg = result.error || ''
    const isTokenError = errorMsg.includes('JWT') ||
                         errorMsg.includes('token') ||
                         errorMsg.includes('Token') ||
                         errorMsg.includes('IDX14100') ||
                         errorMsg.includes('unauthorized') ||
                         errorMsg.includes('Unauthorized')

    if (isTokenError) {
      alert('Outlook 연결이 만료되었습니다. 다시 연결해주세요.')
      // 연결 상태 새로고침
      await outlookAuthComposable.checkAuthStatus()
    } else {
      alert('동기화 실패: ' + (result.error || '알 수 없는 오류'))
    }
  }
}

// ============================================
// Utilities
// ============================================

/** 캘린더 새로고침 */
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
  // Outlook 연동 상태 확인
  outlookAuthComposable.checkAuthStatus()
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

// 탭 상태 동기화
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab === 'schedule' || newTab === 'projects') {
      activeTab.value = newTab
    } else {
      activeTab.value = 'projects'
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* Layout styles only - FullCalendar styles are in @/styles/components/fullcalendar-custom.css */
</style>
