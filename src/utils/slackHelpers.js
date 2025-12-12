/**
 * Slack Helpers
 *
 * Slack 메시지 처리를 위한 유틸리티 함수
 */

/**
 * Slack 메시지의 HTML 엔티티를 디코딩
 * Slack API는 메시지를 HTML 엔티티로 인코딩하여 반환
 *
 * @param {string} text - 디코딩할 텍스트
 * @returns {string} 디코딩된 텍스트
 *
 * @example
 * decodeHtmlEntities('Hello &amp; World') // 'Hello & World'
 * decodeHtmlEntities('&lt;div&gt;') // '<div>'
 */
export const decodeHtmlEntities = (text) => {
  if (!text) return ''
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

/**
 * Slack 메시지에서 멘션 추출
 * @param {string} text - Slack 메시지 텍스트
 * @returns {string[]} 멘션된 사용자 ID 배열
 */
export const extractMentions = (text) => {
  if (!text) return []
  const mentionRegex = /<@([A-Z0-9]+)>/g
  const matches = []
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    matches.push(match[1])
  }
  return matches
}

/**
 * Slack 타임스탬프를 Date 객체로 변환
 * Slack의 타임스탬프는 Unix 초 단위 + 마이크로초
 *
 * @param {string} ts - Slack 타임스탬프 (예: "1234567890.123456")
 * @returns {Date} Date 객체
 */
export const slackTimestampToDate = (ts) => {
  if (!ts) return null
  const seconds = parseFloat(ts)
  return new Date(seconds * 1000)
}
