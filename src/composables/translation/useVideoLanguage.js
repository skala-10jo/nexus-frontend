/**
 * 비디오 번역 언어 선택 Composable
 * 원본/번역 언어 상태 및 드롭다운 관리
 */
import { ref, onMounted, onUnmounted } from 'vue'

// 지원 언어 옵션
const LANGUAGE_OPTIONS = [
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
]

export function useVideoLanguage(initialSource = 'en', initialTarget = 'ko') {
  // 언어 상태
  const sourceLang = ref(initialSource)
  const targetLang = ref(initialTarget)

  // 드롭다운 상태
  const isSourceDropdownOpen = ref(false)
  const isTargetDropdownOpen = ref(false)
  const sourceDropdownRef = ref(null)
  const targetDropdownRef = ref(null)

  // 유틸리티 함수
  function getLanguageFlag(code) {
    return LANGUAGE_OPTIONS.find(l => l.code === code)?.flag || ''
  }

  function getLanguageName(code) {
    return LANGUAGE_OPTIONS.find(l => l.code === code)?.name || code
  }

  // 드롭다운 토글
  function toggleSourceDropdown() {
    isSourceDropdownOpen.value = !isSourceDropdownOpen.value
    isTargetDropdownOpen.value = false
  }

  function toggleTargetDropdown() {
    isTargetDropdownOpen.value = !isTargetDropdownOpen.value
    isSourceDropdownOpen.value = false
  }

  // 언어 선택
  function selectSourceLanguage(code) {
    if (code !== targetLang.value) {
      sourceLang.value = code
      isSourceDropdownOpen.value = false
    }
  }

  function selectTargetLanguage(code) {
    if (code !== sourceLang.value) {
      targetLang.value = code
      isTargetDropdownOpen.value = false
    }
  }

  // 언어 교환
  function swapLanguages() {
    const temp = sourceLang.value
    sourceLang.value = targetLang.value
    targetLang.value = temp
  }

  // 드롭다운 외부 클릭 처리
  function handleDropdownClickOutside(event) {
    if (sourceDropdownRef.value && !sourceDropdownRef.value.contains(event.target)) {
      isSourceDropdownOpen.value = false
    }
    if (targetDropdownRef.value && !targetDropdownRef.value.contains(event.target)) {
      isTargetDropdownOpen.value = false
    }
  }

  // 초기 언어 설정 (비디오 메타데이터에서)
  function setLanguages(source, target) {
    if (source) sourceLang.value = source
    if (target) targetLang.value = target
  }

  // 모든 드롭다운 닫기
  function closeAllDropdowns() {
    isSourceDropdownOpen.value = false
    isTargetDropdownOpen.value = false
  }

  // 라이프사이클 - 외부 클릭 이벤트 등록
  onMounted(() => {
    document.addEventListener('click', handleDropdownClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleDropdownClickOutside)
  })

  return {
    // 상수
    languageOptions: LANGUAGE_OPTIONS,

    // 상태
    sourceLang,
    targetLang,
    isSourceDropdownOpen,
    isTargetDropdownOpen,
    sourceDropdownRef,
    targetDropdownRef,

    // 유틸리티
    getLanguageFlag,
    getLanguageName,

    // 액션
    toggleSourceDropdown,
    toggleTargetDropdown,
    selectSourceLanguage,
    selectTargetLanguage,
    swapLanguages,
    setLanguages,
    closeAllDropdowns
  }
}
