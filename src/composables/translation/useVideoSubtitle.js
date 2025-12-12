/**
 * 비디오 자막 관리 Composable
 * 자막 추출, 번역, 다국어 관리
 */
import { ref, computed } from 'vue'
import {
  extractSubtitles,
  translateSubtitles,
  getMultilingualSubtitles,
  downloadSubtitles
} from '@/services/videoService'

export function useVideoSubtitle() {
  // 다국어 자막 상태
  const subtitleData = ref({
    originalLanguage: 'ko',
    availableLanguages: [],
    subtitles: []
  })

  // 현재 표시 언어
  const currentLanguage = ref('ko')

  // 레거시 호환용 (단일 자막 배열)
  const subtitles = ref([])

  // 현재 재생 중인 자막
  const currentSubtitle = ref(null)

  // 처리 상태
  const isExtracting = ref(false)
  const isTranslated = ref(false)

  // 선택한 언어의 자막만 표시 (computed)
  const displaySubtitles = computed(() => {
    if (!subtitleData.value.subtitles.length) return []

    return subtitleData.value.subtitles.map((segment) => ({
      ...segment,
      displayText:
        currentLanguage.value === subtitleData.value.originalLanguage
          ? segment.originalText
          : segment.translations[currentLanguage.value] || segment.originalText
    }))
  })

  // 자막 데이터 존재 여부
  const hasSubtitles = computed(() => subtitles.value.length > 0)

  // 다국어 지원 여부
  const hasMultipleLanguages = computed(() => subtitleData.value.availableLanguages.length > 1)

  // 기존 자막 로드
  async function loadExistingSubtitles(videoId) {
    try {
      const result = await getMultilingualSubtitles(videoId)

      subtitleData.value = {
        originalLanguage: result.originalLanguage,
        availableLanguages: result.availableLanguages,
        subtitles: result.subtitles
      }

      currentLanguage.value = result.originalLanguage
      subtitles.value = result.subtitles
      isTranslated.value = result.availableLanguages.length > 1

      return result
    } catch (error) {
      console.error('Failed to load subtitles:', error)
      throw error
    }
  }

  // 자막 추출 (STT + 번역)
  async function handleExtractSubtitles({
    videoDocumentId,
    sourceLang,
    targetLang,
    projectId
  }) {
    isExtracting.value = true

    try {
      // Step 1: STT 처리 (원본 언어)
      await extractSubtitles({
        videoDocumentId,
        sourceLanguage: sourceLang
      })

      // Step 2: 자동 번역 (목표 언어가 있고 원본과 다르면)
      if (targetLang && targetLang !== sourceLang) {
        await translateSubtitles({
          videoDocumentId,
          projectId,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang
        })
      }

      // Step 3: 다국어 자막 조회
      const result = await getMultilingualSubtitles(videoDocumentId)

      // Step 4: 상태 업데이트
      subtitleData.value = {
        originalLanguage: result.originalLanguage,
        availableLanguages: result.availableLanguages,
        subtitles: result.subtitles
      }

      currentLanguage.value = result.originalLanguage
      subtitles.value = result.subtitles
      isTranslated.value = result.availableLanguages.length > 1

      return result
    } finally {
      isExtracting.value = false
    }
  }

  // 추가 번역 수행
  async function handleAddTranslation({
    videoDocumentId,
    targetLanguage,
    projectId
  }) {
    isExtracting.value = true

    try {
      await translateSubtitles({
        videoDocumentId,
        projectId,
        sourceLanguage: subtitleData.value.originalLanguage,
        targetLanguage
      })

      const updatedData = await getMultilingualSubtitles(videoDocumentId)

      subtitleData.value = {
        originalLanguage: updatedData.originalLanguage,
        availableLanguages: updatedData.availableLanguages,
        subtitles: updatedData.subtitles
      }

      subtitles.value = updatedData.subtitles
      isTranslated.value = updatedData.availableLanguages.length > 1
      currentLanguage.value = targetLanguage

      return updatedData
    } finally {
      isExtracting.value = false
    }
  }

  // 언어 변경
  function handleLanguageChange(lang) {
    currentLanguage.value = lang
  }

  // 자막 다운로드
  async function handleDownloadSubtitle({ videoDocumentId, language, filename }) {
    try {
      const blob = await downloadSubtitles({
        videoDocumentId,
        language
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename.replace(/\.[^/.]+$/, '')}_${language}.srt`
      a.click()
      URL.revokeObjectURL(url)

      return true
    } catch (error) {
      console.error('Download error:', error)
      throw error
    }
  }

  // 현재 시간에 맞는 자막 찾기
  function findCurrentSubtitle(currentTime) {
    const current = displaySubtitles.value.find(
      (sub) => currentTime >= sub.startTime && currentTime <= sub.endTime
    )
    currentSubtitle.value = current || null
    return currentSubtitle.value
  }

  // 상태 초기화
  function reset() {
    subtitleData.value = {
      originalLanguage: 'ko',
      availableLanguages: [],
      subtitles: []
    }
    currentLanguage.value = 'ko'
    subtitles.value = []
    currentSubtitle.value = null
    isTranslated.value = false
    isExtracting.value = false
  }

  return {
    // 상태
    subtitleData,
    currentLanguage,
    subtitles,
    currentSubtitle,
    isExtracting,
    isTranslated,

    // Computed
    displaySubtitles,
    hasSubtitles,
    hasMultipleLanguages,

    // 액션
    loadExistingSubtitles,
    handleExtractSubtitles,
    handleAddTranslation,
    handleLanguageChange,
    handleDownloadSubtitle,
    findCurrentSubtitle,
    reset
  }
}
