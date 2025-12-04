import { ref } from 'vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

/**
 * FullCalendar 설정 및 조작
 * @description 캘린더 옵션, API 접근, 이벤트 핸들러 관리
 */
export function useScheduleCalendar() {
  const fullCalendar = ref(null)

  /**
   * 캘린더 옵션 생성
   * @param {Object} handlers - 이벤트 핸들러 객체
   * @returns {Object} FullCalendar 옵션
   */
  const createCalendarOptions = (handlers = {}) => {
    return {
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
      events: handlers.loadEvents || (() => []),
      select: handlers.onDateSelect || (() => { }),
      eventClick: handlers.onEventClick || (() => { }),
      eventDrop: handlers.onEventDrop || (() => { }),
      eventResize: handlers.onEventResize || (() => { }),
      height: '100%',
      expandRows: true,
      stickyHeaderDates: true,
      dayHeaderFormat: { weekday: 'short' },
      dragScroll: true,
      dragRevertDuration: 0,
      fixedMirrorParent: document.body,
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'short'
      },
      dayCellContent: (arg) => {
        return arg.date.getDate().toString()
      }
    }
  }

  /**
   * 캘린더 API 접근
   * @returns {Object|null} FullCalendar API 객체
   */
  const getCalendarApi = () => {
    if (fullCalendar.value) {
      return fullCalendar.value.getApi()
    }
    return null
  }

  /**
   * 이벤트 새로고침
   */
  const refetchEvents = () => {
    const api = getCalendarApi()
    if (api) {
      api.refetchEvents()
    }
  }

  /**
   * 선택 해제
   */
  const unselect = () => {
    const api = getCalendarApi()
    if (api) {
      api.unselect()
    }
  }

  /**
   * 특정 날짜로 이동
   * @param {Date|string} date - 이동할 날짜
   */
  const gotoDate = (date) => {
    const api = getCalendarApi()
    if (api) {
      api.gotoDate(date)
    }
  }

  /**
   * 뷰 변경
   * @param {string} viewName - 뷰 이름
   */
  const changeView = (viewName) => {
    const api = getCalendarApi()
    if (api) {
      api.changeView(viewName)
    }
  }

  return {
    // Refs
    fullCalendar,

    // Factory
    createCalendarOptions,

    // API Methods
    getCalendarApi,
    refetchEvents,
    unselect,
    gotoDate,
    changeView
  }
}
