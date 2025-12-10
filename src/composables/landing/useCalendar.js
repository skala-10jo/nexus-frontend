/**
 * 캘린더 관련 공통 로직
 * 사용 파일: ProjectScheduleScene, ProjectScheduleMockUI, ScenarioGenerationScene
 */
import { computed } from 'vue'

/**
 * 캘린더 주차 및 이벤트 관리 composable
 * @param {Object} options - 옵션
 * @param {number} options.year - 연도 (기본값: 2025)
 * @param {number} options.month - 월 (기본값: 1)
 * @param {number} options.todayDate - 오늘 날짜 (기본값: 6)
 * @returns {Object} 캘린더 유틸리티 함수들
 */
export function useCalendar(options = {}) {
  const { year = 2025, month = 1, todayDate = 6 } = options

  // 캘린더 주차 생성
  const calendarWeeks = computed(() => {
    const weeks = []
    const allDays = []

    // 이전 달 날짜 (12월 29-31일)
    for (let i = 29; i <= 31; i++) {
      allDays.push({
        date: i,
        isOtherMonth: true,
        fullDate: `2024-12-${i}`
      })
    }

    // 현재 달 날짜 (1월 1-31일)
    for (let i = 1; i <= 31; i++) {
      allDays.push({
        date: i,
        isOtherMonth: false,
        isToday: i === todayDate,
        fullDate: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      })
    }

    // 다음 달 날짜 (2월 1일)
    for (let i = 1; i <= 1; i++) {
      allDays.push({
        date: i,
        isOtherMonth: true,
        fullDate: `${year}-02-0${i}`
      })
    }

    // 7일씩 주차로 분할
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7))
    }

    return weeks
  })

  // 날짜 문자열로 주차/요일 인덱스 찾기
  const getDayIndex = (dateStr) => {
    for (let weekIndex = 0; weekIndex < calendarWeeks.value.length; weekIndex++) {
      const week = calendarWeeks.value[weekIndex]
      for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
        if (week[dayIndex].fullDate === dateStr) {
          return { weekIndex, dayIndex }
        }
      }
    }
    return null
  }

  // 특정 주차에 해당하는 이벤트 필터링
  const getEventsForWeek = (weekIndex, events) => {
    const week = calendarWeeks.value[weekIndex]
    if (!week) return []

    const weekStart = week[0].fullDate
    const weekEnd = week[6].fullDate

    return events.filter(event => {
      return event.startDate <= weekEnd && event.endDate >= weekStart
    })
  }

  // 이벤트의 위치 및 너비 계산
  const getEventStyle = (event, weekIndex) => {
    const week = calendarWeeks.value[weekIndex]
    const weekStart = week[0].fullDate
    const weekEnd = week[6].fullDate

    const displayStart = event.startDate < weekStart ? weekStart : event.startDate
    const displayEnd = event.endDate > weekEnd ? weekEnd : event.endDate

    const startPos = getDayIndex(displayStart)
    const endPos = getDayIndex(displayEnd)

    if (!startPos || !endPos) return { display: 'none' }

    const startDay = startPos.dayIndex
    const endDay = endPos.dayIndex
    const span = endDay - startDay + 1

    const cellWidth = 100 / 7
    const left = startDay * cellWidth + 0.3
    const width = span * cellWidth - 0.6

    return {
      left: `${left}%`,
      width: `${width}%`,
      top: `${(event.row || 0) * 22}px`
    }
  }

  // 날짜 포맷 (1/6 형식)
  const formatEventDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  return {
    calendarWeeks,
    getDayIndex,
    getEventsForWeek,
    getEventStyle,
    formatEventDate
  }
}
