/**
 * Formatters Utility
 *
 * 공통 포맷팅 헬퍼 함수들
 */

/**
 * meaning 문자열에서 중괄호 제거
 * @param {string} meaning - 의미 문자열
 * @returns {string} 포맷팅된 문자열
 */
export const formatMeaning = (meaning) => {
  if (!meaning) return ''
  return meaning.replace(/[{}]/g, '')
}

/**
 * 날짜를 한국어 포맷으로 변환
 * @param {string} dateString - ISO 날짜 문자열
 * @param {string} locale - 로케일 (기본: ko-KR)
 * @returns {string} 포맷팅된 날짜
 */
export const formatDate = (dateString, locale = 'ko-KR') => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 텍스트에서 특정 표현을 하이라이트
 * @param {string} text - 원본 텍스트
 * @param {string} expression - 하이라이트할 표현
 * @returns {string} 하이라이트 마크업이 포함된 HTML
 */
export const highlightExpression = (text, expression) => {
  if (!text || !expression) return text
  const regex = new RegExp(`(${expression})`, 'gi')
  return text.replace(
    regex,
    '<mark class="bg-yellow-200 text-gray-900 font-semibold px-1 rounded">$1</mark>'
  )
}

/**
 * 배열 셔플 (Fisher-Yates algorithm)
 * @param {Array} array - 원본 배열
 * @returns {Array} 셔플된 새 배열
 */
export const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
