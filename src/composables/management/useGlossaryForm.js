import { ref, reactive } from 'vue'
import { useGlossaryStore } from '@/stores/glossary'

/**
 * 용어사전 폼 관리 Composable
 * @description 용어 추가/수정/상세 모달 상태 및 폼 로직
 */
export function useGlossaryForm() {
  // Store
  const glossaryStore = useGlossaryStore()

  // ============================================
  // State
  // ============================================
  const showAddTermModal = ref(false)
  const showEditDialog = ref(false)
  const editingTermId = ref(null)

  // Term Detail Modal
  const showTermDetail = ref(false)
  const selectedTerm = ref(null)

  // Form data
  const activeForm = ref(getEmptyForm())

  // ============================================
  // Helpers
  // ============================================

  /**
   * 빈 폼 데이터 생성
   */
  function getEmptyForm() {
    return {
      koreanTerm: '',
      englishTerm: '',
      vietnameseTerm: '',
      abbreviation: '',
      definition: '',
      context: '',
      exampleSentence: '',
      note: '',
      domain: ''
    }
  }

  // ============================================
  // Modal Actions
  // ============================================

  /**
   * 용어 추가 모달 열기
   */
  const openAddModal = () => {
    activeForm.value = getEmptyForm()
    showAddTermModal.value = true
  }

  /**
   * 용어 수정 모달 열기
   */
  const editTerm = (term) => {
    editingTermId.value = term.id
    activeForm.value = { ...term }
    showEditDialog.value = true
  }

  /**
   * 모달 닫기
   */
  const closeModal = () => {
    showAddTermModal.value = false
    showEditDialog.value = false
    editingTermId.value = null
    activeForm.value = getEmptyForm()
  }

  /**
   * 용어 상세 모달 열기
   */
  const openTermDetail = (term) => {
    selectedTerm.value = term
    showTermDetail.value = true
  }

  /**
   * 용어 상세 모달 닫기
   */
  const closeTermDetail = () => {
    showTermDetail.value = false
    selectedTerm.value = null
  }

  /**
   * 상세에서 수정 모드로 전환
   */
  const editTermFromDetail = () => {
    if (selectedTerm.value) {
      closeTermDetail()
      editTerm(selectedTerm.value)
    }
  }

  // ============================================
  // Form Actions
  // ============================================

  /**
   * 폼 저장 (생성/수정)
   * @param {Function} onSuccess - 저장 성공 콜백
   */
  const handleSave = async (onSuccess) => {
    if (!activeForm.value.koreanTerm.trim() || !activeForm.value.englishTerm.trim()) {
      alert('한국어와 영어 용어는 필수입니다.')
      return false
    }

    try {
      if (showEditDialog.value) {
        await glossaryStore.updateTerm(editingTermId.value, activeForm.value)
      } else {
        await glossaryStore.createTerm(activeForm.value)
      }
      closeModal()
      if (onSuccess) onSuccess()
      return true
    } catch (error) {
      console.error('Failed to save term:', error)
      alert('용어 저장에 실패했습니다.')
      return false
    }
  }

  /**
   * 폼 필드 업데이트
   */
  const updateFormField = (field, value) => {
    activeForm.value[field] = value
  }

  /**
   * 폼 유효성 검사
   */
  const isFormValid = () => {
    return activeForm.value.koreanTerm.trim() && activeForm.value.englishTerm.trim()
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    showAddTermModal,
    showEditDialog,
    editingTermId,
    showTermDetail,
    selectedTerm,
    activeForm,

    // Helpers
    getEmptyForm,

    // Modal Actions
    openAddModal,
    editTerm,
    closeModal,
    openTermDetail,
    closeTermDetail,
    editTermFromDetail,

    // Form Actions
    handleSave,
    updateFormField,
    isFormValid
  }
}
