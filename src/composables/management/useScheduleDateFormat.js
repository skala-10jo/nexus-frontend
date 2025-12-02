/**
 * 일정 관련 날짜 포맷팅 유틸리티
 * @description 날짜/시간 변환 및 포맷팅 함수 제공
 */

/**
 * Date 객체를 datetime-local 입력 형식으로 변환
 * @param {Date|string} date - 변환할 날짜
 * @returns {string} YYYY-MM-DDTHH:mm 형식
 */
export function formatDateTimeLocal(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Date 객체를 날짜만 형식으로 변환
 * @param {Date|string} date - 변환할 날짜
 * @returns {string} YYYY-MM-DD 형식
 */
export function formatDateOnly(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 짧은 날짜 형식으로 변환 (MM/DD)
 * @param {Date|string} date - 변환할 날짜
 * @returns {string} M/D 형식
 */
export function formatShortDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const month = String(d.getMonth() + 1)
  const day = String(d.getDate())
  return `${month}/${day}`
}

/**
 * 이벤트 시간 표시용 포맷
 * @param {Object} event - 이벤트 객체
 * @returns {string} MM/DD 또는 MM/DD HH:mm 형식
 */
export function formatEventTime(event) {
  if (!event.start) return ''
  const d = new Date(event.start)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const dateStr = `${month}/${day}`

  if (event.allDay) {
    return dateStr
  } else {
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${dateStr} ${hours}:${minutes}`
  }
}

/**
 * datetime-local 문자열을 로컬 타임존 Date 객체로 변환
 * @param {string} dateTimeString - YYYY-MM-DDTHH:mm 형식 문자열
 * @returns {Date|null} Date 객체
 */
export function parseLocalDateTime(dateTimeString) {
  if (!dateTimeString) return null

  const [datePart, timePart] = dateTimeString.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number)

  // Date 생성자에 개별 값을 전달하면 항상 로컬 타임존으로 해석됨
  return new Date(year, month - 1, day, hours, minutes)
}

export function useScheduleDateFormat() {
  return {
    formatDateTimeLocal,
    formatDateOnly,
    formatShortDate,
    formatEventTime,
    parseLocalDateTime
  }
}
