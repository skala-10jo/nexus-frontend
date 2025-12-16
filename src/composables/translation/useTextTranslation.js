/**
 * Text Translation Composable
 *
 * 텍스트 번역 페이지의 상태 및 비즈니스 로직 관리
 *
 * @module useTextTranslation
 */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { translateText } from '@/services/translationService'
import { getUserProjects } from '@/services/projectService'

/**
 * 텍스트 번역 로직
 *
 * @returns {Object} 번역 상태 및 메서드
 */
export function useTextTranslation() {
  const router = useRouter()

  // ============================================
  // State
  // ============================================

  /** 원문 텍스트 */
  const sourceText = ref('')

  /** 번역된 텍스트 */
  const translatedText = ref('')

  /** 원본 언어 */
  const sourceLang = ref('ko')

  /** 대상 언어 */
  const targetLang = ref('en')

  /** 선택된 프로젝트 ID */
  const selectedProjectId = ref(null)

  /** 프로젝트 목록 */
  const projects = ref([])

  /** 컨텍스트 정보 */
  const contextInfo = ref(null)

  /** 감지된 용어 목록 */
  const detectedTerms = ref([])

  /** 번역 결과 메타데이터 */
  const translationResult = ref(null)

  /** 번역 중 상태 */
  const isTranslating = ref(false)

  /** 컨텍스트 패널 확장 상태 */
  const contextExpanded = ref(false)

  /** 선택된 용어 (상세 모달용) */
  const selectedTerm = ref(null)

  /** 토스트 알림 상태 */
  const toast = ref({
    show: false,
    message: '',
    type: 'success'
  })

  // ============================================
  // Computed
  // ============================================

  /** 입력 플레이스홀더 */
  const inputPlaceholder = computed(() => {
    if (selectedProjectId.value) {
      return 'Translating with project context. Enter text...'
    }
    return 'Enter text to translate...'
  })

  // ============================================
  // Methods - Toast
  // ============================================

  /**
   * 토스트 메시지 표시
   *
   * @param {string} message - 메시지 내용
   * @param {string} type - 타입 ('success' | 'error')
   */
  function showToast(message, type = 'success') {
    toast.value = {
      show: true,
      message,
      type
    }

    setTimeout(() => {
      toast.value.show = false
    }, 3000)
  }

  // ============================================
  // Methods - Projects
  // ============================================

  /**
   * 프로젝트 목록 로드
   */
  async function loadProjects() {
    try {
      const response = await getUserProjects()
      projects.value = response.data.data || []
    } catch (error) {
      console.error('Failed to load projects:', error)
      showToast('Failed to load projects.', 'error')
    }
  }

  /**
   * 프로젝트 변경 핸들러
   *
   * @param {string|null} projectId - 프로젝트 ID
   */
  function onProjectChange(projectId) {
    if (projectId) {
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        contextInfo.value = {
          documentsCount: project.documentCount || 0,
          termsCount: project.termCount || 0
        }
      }
    } else {
      contextInfo.value = null
    }
  }

  // ============================================
  // Methods - Translation
  // ============================================

  /**
   * 번역 실행
   */
  async function handleTranslate() {
    if (!sourceText.value.trim()) {
      showToast('Please enter text to translate.', 'error')
      return
    }

    if (sourceLang.value === targetLang.value) {
      showToast('Source and target languages are the same.', 'error')
      return
    }

    isTranslating.value = true
    translatedText.value = ''
    detectedTerms.value = []
    translationResult.value = null

    try {
      // Get user ID from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const userId = user.id

      if (!userId) {
        showToast('Login required.', 'error')
        router.push('/login')
        return
      }

      const result = await translateText({
        text: sourceText.value,
        sourceLang: sourceLang.value,
        targetLang: targetLang.value,
        userId,
        projectId: selectedProjectId.value
      })

      translatedText.value = result.translatedText
      detectedTerms.value = result.detectedTerms || []
      translationResult.value = {
        contextUsed: result.contextUsed,
        contextSummary: result.contextSummary,
        termsCount: result.termsCount || 0
      }

      showToast('Translation completed!', 'success')
    } catch (error) {
      console.error('Translation error:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred during translation.'
      showToast(errorMessage, 'error')
    } finally {
      isTranslating.value = false
    }
  }

  /**
   * 입력 초기화
   */
  function handleClear() {
    sourceText.value = ''
    translatedText.value = ''
    detectedTerms.value = []
    translationResult.value = null
  }

  /**
   * 언어 교환 핸들러
   */
  function onLanguageSwap() {
    if (translatedText.value && sourceText.value) {
      const temp = sourceText.value
      sourceText.value = translatedText.value
      translatedText.value = temp
      detectedTerms.value = []
    }
  }

  // ============================================
  // Methods - Clipboard & Export
  // ============================================

  /**
   * 클립보드에서 붙여넣기
   */
  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText()
      sourceText.value += text
    } catch (error) {
      console.error('Failed to read clipboard:', error)
      showToast('Could not read clipboard.', 'error')
    }
  }

  /**
   * 번역 결과 복사
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(translatedText.value)
      showToast('Copied to clipboard!', 'success')
    } catch (error) {
      console.error('Failed to copy:', error)
      showToast('Failed to copy.', 'error')
    }
  }

  /**
   * 번역 결과 내보내기
   */
  function handleExport() {
    const blob = new Blob([translatedText.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `translation-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Translation exported!', 'success')
  }

  // ============================================
  // Methods - Term
  // ============================================

  /**
   * 용어 클릭 핸들러
   *
   * @param {Object} term - 용어 객체
   */
  function handleTermClick(term) {
    selectedTerm.value = term
  }

  /**
   * 용어 상세 모달 닫기
   */
  function closeTermModal() {
    selectedTerm.value = null
  }

  // ============================================
  // Lifecycle
  // ============================================

  /**
   * 초기화 함수 (onMounted에서 호출)
   */
  function initialize() {
    loadProjects()
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    sourceText,
    translatedText,
    sourceLang,
    targetLang,
    selectedProjectId,
    projects,
    contextInfo,
    detectedTerms,
    translationResult,
    isTranslating,
    contextExpanded,
    selectedTerm,
    toast,

    // Computed
    inputPlaceholder,

    // Methods - Toast
    showToast,

    // Methods - Projects
    loadProjects,
    onProjectChange,

    // Methods - Translation
    handleTranslate,
    handleClear,
    onLanguageSwap,

    // Methods - Clipboard & Export
    handlePaste,
    handleCopy,
    handleExport,

    // Methods - Term
    handleTermClick,
    closeTermModal,

    // Lifecycle
    initialize
  }
}
