/**
 * Language Constants
 *
 * 앱 전체에서 사용되는 언어 관련 상수
 * Slack Agent, 프로필 설정 등에서 공통으로 사용
 */

/**
 * 지원 언어 목록 (간단한 2글자 코드)
 * Slack 메시지 번역, 사용자 선호 언어 등에 사용
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'zh', label: '中文', flag: '🇨🇳' }
]

/**
 * 언어 코드로 레이블 가져오기
 * @param {string} code - 언어 코드 (ko, en, ja 등)
 * @returns {string} 플래그와 레이블 조합 (예: "🇰🇷 한국어")
 */
export const getLanguageLabel = (code) => {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code)
  return lang ? `${lang.flag} ${lang.label}` : code
}

/**
 * 언어 코드로 언어 정보 객체 가져오기
 * @param {string} code - 언어 코드
 * @returns {object|undefined} 언어 정보 객체
 */
export const getLanguageByCode = (code) => {
  return SUPPORTED_LANGUAGES.find(l => l.code === code)
}
