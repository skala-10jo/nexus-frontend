import { ref } from 'vue'
import { scheduleAPI } from '@/services/api'
import { parseLocalDateTime } from './useScheduleDateFormat'

/**
 * 일정 이벤트 CRUD 관리
 * @description 일정 조회, 생성, 수정, 삭제, Outlook 동기화 로직을 관리
 */
export function useScheduleEvents() {
  const allEvents = ref([])
  const loading = ref(false)
  const error = ref(null)
  const outlookSyncStatus = ref(null)
  const syncingOutlook = ref(false)

  /**
   * 모든 일정 조회
   * @returns {Promise<Array>} 이벤트 배열
   */
  const fetchAllEvents = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await scheduleAPI.getAllSchedules()
      if (response.data.success) {
        const events = response.data.data.map((schedule) => {
          const startDate = schedule.startTime ? new Date(schedule.startTime) : null
          const endDate = schedule.endTime ? new Date(schedule.endTime) : null

          // Use first category color if available, otherwise use schedule color
          const categoryColor =
            schedule.categories && schedule.categories.length > 0
              ? schedule.categories[0].color
              : schedule.color || '#3b82f6'

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
              project: schedule.project || null,
              // Outlook 연동 정보
              isFromOutlook: schedule.isFromOutlook || false,
              attendees: schedule.attendees,
              organizer: schedule.organizer
            }
          }
        })

        allEvents.value = events
        return events
      }
      return []
    } catch (err) {
      console.error('Failed to load schedules:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * FullCalendar 이벤트 소스 함수
   * @param {Object} fetchInfo - fetch 정보
   * @param {Function} successCallback - 성공 콜백
   * @param {Function} failureCallback - 실패 콜백
   * @param {string|null} selectedProjectId - 선택된 프로젝트 ID
   */
  const loadEventsForCalendar = async (
    fetchInfo,
    successCallback,
    failureCallback,
    selectedProjectId = null
  ) => {
    try {
      const events = await fetchAllEvents()

      // Filter by selected project if one is selected
      let filteredEvents = events
      if (selectedProjectId) {
        filteredEvents = events.filter(
          (event) =>
            event.extendedProps.project &&
            event.extendedProps.project.id === selectedProjectId
        )
      }

      successCallback(filteredEvents)
    } catch (err) {
      failureCallback(err)
    }
  }

  /**
   * 일정 생성
   * @param {Object} formData - 폼 데이터
   * @returns {Promise<Object>} 결과
   */
  const createEvent = async (formData) => {
    loading.value = true
    error.value = null

    try {
      const scheduleData = prepareScheduleData(formData)
      await scheduleAPI.createSchedule(scheduleData)
      return { success: true }
    } catch (err) {
      console.error('Failed to create schedule:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 일정 수정
   * @param {string} eventId - 이벤트 ID
   * @param {Object} formData - 폼 데이터
   * @returns {Promise<Object>} 결과
   */
  const updateEvent = async (eventId, formData) => {
    loading.value = true
    error.value = null

    try {
      const scheduleData = prepareScheduleData(formData)
      await scheduleAPI.updateSchedule(eventId, scheduleData)
      return { success: true }
    } catch (err) {
      console.error('Failed to update schedule:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 일정 삭제
   * @param {string} eventId - 이벤트 ID
   * @returns {Promise<Object>} 결과
   */
  const deleteEvent = async (eventId) => {
    loading.value = true
    error.value = null

    try {
      await scheduleAPI.deleteSchedule(eventId)
      return { success: true }
    } catch (err) {
      console.error('Failed to delete schedule:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * 드래그/리사이즈로 이벤트 업데이트
   * @param {Object} event - FullCalendar 이벤트 객체
   * @returns {Promise<Object>} 결과
   */
  const updateEventFromDrag = async (event) => {
    try {
      await scheduleAPI.updateSchedule(event.id, {
        title: event.title,
        description: event.extendedProps.description || '',
        startTime: event.start.toISOString(),
        endTime: event.end ? event.end.toISOString() : null,
        allDay: event.allDay,
        color: event.backgroundColor,
        location: event.extendedProps.location || '',
        projectId: event.extendedProps.project?.id || null,
        categoryIds: event.extendedProps.categories?.map((c) => c.id) || []
      })
      return { success: true }
    } catch (err) {
      console.error('Failed to update schedule:', err)
      return { success: false, error: err.message }
    }
  }

  /**
   * 폼 데이터를 API 요청 데이터로 변환
   * @param {Object} formData - 폼 데이터
   * @returns {Object} API 요청 데이터
   */
  const prepareScheduleData = (formData) => {
    let startTime, endTime

    if (formData.allDay) {
      // 날짜만 있는 경우 (YYYY-MM-DD 형식) - 자정부터 자정까지
      const startDate = parseLocalDateTime(formData.startTime + 'T00:00')
      const endDate = formData.endTime
        ? parseLocalDateTime(formData.endTime + 'T23:59')
        : null

      startTime = startDate.toISOString()
      endTime = endDate ? endDate.toISOString() : null
    } else {
      // 날짜와 시간이 모두 있는 경우 - 로컬 시간을 명시적으로 파싱
      const startDate = parseLocalDateTime(formData.startTime)
      const endDate = formData.endTime ? parseLocalDateTime(formData.endTime) : null

      startTime = startDate.toISOString()
      endTime = endDate ? endDate.toISOString() : null
    }

    return {
      title: formData.title,
      description: formData.description,
      startTime: startTime,
      endTime: endTime,
      allDay: formData.allDay,
      color: formData.color,
      location: formData.location,
      projectId: formData.projectId,
      categoryIds: formData.categoryIds || []
    }
  }

  /**
   * 프로젝트별 이벤트 필터링
   * @param {string} projectId - 프로젝트 ID
   * @returns {Array} 필터링된 이벤트 배열
   */
  const getProjectEvents = (projectId) => {
    return allEvents.value.filter(
      (event) =>
        event.extendedProps.project && event.extendedProps.project.id === projectId
    )
  }

  // ============================================
  // Outlook Calendar Sync
  // ============================================

  /**
   * Outlook 일정 동기화 상태 조회
   * @returns {Promise<Object>} 동기화 상태
   */
  const getOutlookCalendarStatus = async () => {
    try {
      const response = await scheduleAPI.getOutlookCalendarStatus()
      if (response.data.success) {
        outlookSyncStatus.value = response.data.data
        return response.data.data
      }
      return null
    } catch (err) {
      console.error('Failed to get Outlook calendar status:', err)
      return null
    }
  }

  /**
   * Outlook 일정 동기화
   * @returns {Promise<Object>} 동기화 결과
   */
  const syncOutlookCalendar = async () => {
    syncingOutlook.value = true
    error.value = null

    try {
      const response = await scheduleAPI.syncOutlookCalendar()
      if (response.data.success) {
        outlookSyncStatus.value = response.data.data
        // 동기화 후 일정 목록 새로고침
        await fetchAllEvents()
        return { success: true, data: response.data.data, message: response.data.message }
      }
      return { success: false, error: response.data.message }
    } catch (err) {
      console.error('Failed to sync Outlook calendar:', err)
      const errorMessage = err.response?.data?.message || err.message
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      syncingOutlook.value = false
    }
  }

  /**
   * Outlook에서 가져온 일정만 필터링
   * @returns {Array} Outlook 일정 배열
   */
  const getOutlookEvents = () => {
    return allEvents.value.filter((event) => event.extendedProps.isFromOutlook)
  }

  /**
   * 로컬에서 직접 추가한 일정만 필터링
   * @returns {Array} 로컬 일정 배열
   */
  const getLocalEvents = () => {
    return allEvents.value.filter((event) => !event.extendedProps.isFromOutlook)
  }

  return {
    // State
    allEvents,
    loading,
    error,
    outlookSyncStatus,
    syncingOutlook,

    // Actions
    fetchAllEvents,
    loadEventsForCalendar,
    createEvent,
    updateEvent,
    deleteEvent,
    updateEventFromDrag,
    getProjectEvents,

    // Outlook Calendar Sync
    getOutlookCalendarStatus,
    syncOutlookCalendar,
    getOutlookEvents,
    getLocalEvents
  }
}
