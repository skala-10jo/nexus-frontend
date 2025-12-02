import { ref, watch } from 'vue'
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'
import { formatDateTimeLocal, formatDateOnly } from './useScheduleDateFormat'

/**
 * 일정 폼 상태 관리
 * @description 일정 생성/수정 폼의 상태와 로직을 관리
 */
export function useScheduleEventForm() {
  const categoryStore = useScheduleCategoryStore()

  // Form State
  const eventForm = ref({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    allDay: false,
    color: '#3b82f6',
    location: '',
    projectId: null,
    categoryIds: []
  })

  // Edit Mode State
  const isEditMode = ref(false)
  const currentEventId = ref(null)

  // Watch categoryIds and automatically set color to first category's color
  watch(
    () => eventForm.value.categoryIds,
    (newCategoryIds) => {
      if (newCategoryIds && newCategoryIds.length > 0) {
        const firstCategory = categoryStore.getCategoryById(newCategoryIds[0])
        if (firstCategory) {
          eventForm.value.color = firstCategory.color
        }
      } else {
        // No category selected, use default color
        eventForm.value.color = '#3b82f6'
      }
    },
    { deep: true }
  )

  /**
   * 새 일정 생성을 위한 폼 초기화
   * @param {Object} options - 초기값 옵션
   */
  const initCreateForm = (options = {}) => {
    isEditMode.value = false
    currentEventId.value = null

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)

    eventForm.value = {
      title: '',
      description: '',
      startTime: options.startTime || formatDateTimeLocal(now),
      endTime: options.endTime || formatDateTimeLocal(tomorrow),
      allDay: options.allDay || false,
      color: '#3b82f6',
      location: '',
      projectId: options.projectId || null,
      categoryIds: []
    }
  }

  /**
   * 날짜 선택 시 폼 초기화
   * @param {Object} selectInfo - FullCalendar 선택 정보
   */
  const initFromDateSelect = (selectInfo) => {
    isEditMode.value = false
    currentEventId.value = null

    const startTimeFormatted = selectInfo.allDay
      ? formatDateOnly(selectInfo.start)
      : formatDateTimeLocal(selectInfo.start)
    const endTimeFormatted = selectInfo.allDay
      ? formatDateOnly(selectInfo.end || selectInfo.start)
      : formatDateTimeLocal(selectInfo.end || selectInfo.start)

    eventForm.value = {
      title: '',
      description: '',
      startTime: startTimeFormatted,
      endTime: endTimeFormatted,
      allDay: selectInfo.allDay,
      color: '#3b82f6',
      location: '',
      projectId: null,
      categoryIds: []
    }
  }

  /**
   * 기존 이벤트 수정을 위한 폼 초기화
   * @param {Object} event - FullCalendar 이벤트 객체
   */
  const initFromEvent = (event) => {
    isEditMode.value = true
    currentEventId.value = event.id

    eventForm.value = {
      title: event.title,
      description: event.extendedProps.description || '',
      startTime: event.allDay
        ? formatDateOnly(event.start)
        : formatDateTimeLocal(event.start),
      endTime: event.end
        ? event.allDay
          ? formatDateOnly(event.end)
          : formatDateTimeLocal(event.end)
        : '',
      allDay: event.allDay,
      color: event.backgroundColor,
      location: event.extendedProps.location || '',
      projectId: event.extendedProps.project?.id || null,
      categoryIds: event.extendedProps.categories?.map((c) => c.id) || []
    }
  }

  /**
   * 폼 초기화 (빈 상태)
   */
  const resetForm = () => {
    isEditMode.value = false
    currentEventId.value = null
    eventForm.value = {
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      allDay: false,
      color: '#3b82f6',
      location: '',
      projectId: null,
      categoryIds: []
    }
  }

  /**
   * 폼 데이터 반환
   * @returns {Object} 폼 데이터
   */
  const getFormData = () => {
    return { ...eventForm.value }
  }

  return {
    // State
    eventForm,
    isEditMode,
    currentEventId,

    // Actions
    initCreateForm,
    initFromDateSelect,
    initFromEvent,
    resetForm,
    getFormData
  }
}
