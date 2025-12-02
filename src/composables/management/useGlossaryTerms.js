import { ref, reactive, computed } from 'vue'
import { useGlossaryStore } from '@/stores/glossary'

/**
 * 용어사전 용어 관리 Composable
 * @description 용어 CRUD, 필터, 검색, 페이지네이션 로직
 */
export function useGlossaryTerms() {
  // Store
  const glossaryStore = useGlossaryStore()

  // ============================================
  // State
  // ============================================
  const selectedDocumentId = ref('')
  const searchQuery = ref('')
  const filterStatus = ref('')
  const filterVerified = ref('')
  const selectedTermIds = ref([])

  // ============================================
  // Computed
  // ============================================
  const allTerms = computed(() => glossaryStore.terms)
  const loading = computed(() => glossaryStore.loading)
  const pagination = computed(() => glossaryStore.pagination)
  const extractionJob = computed(() => glossaryStore.extractionJob)

  /**
   * 필터링된 용어 목록
   */
  const terms = computed(() => {
    let filtered = [...allTerms.value]

    if (filterStatus.value) {
      filtered = filtered.filter(t => t.status === filterStatus.value)
    }

    if (filterVerified.value) {
      const isVerified = filterVerified.value === 'true'
      filtered = filtered.filter(t => t.isVerified === isVerified)
    }

    return filtered
  })

  /**
   * 전체 선택 여부
   */
  const isAllSelected = computed(() =>
    terms.value.length > 0 && selectedTermIds.value.length === terms.value.length
  )

  /**
   * 표시할 페이지 목록
   */
  const displayedPages = computed(() => {
    const pages = []
    const currentPage = pagination.value.page
    const totalPages = pagination.value.totalPages

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      pages.push(0)
      let startPage = Math.max(1, currentPage - 1)
      let endPage = Math.min(totalPages - 2, currentPage + 1)

      if (currentPage <= 2) endPage = 3
      if (currentPage >= totalPages - 3) startPage = totalPages - 4

      if (startPage > 1) pages.push('...')
      for (let i = startPage; i <= endPage; i++) pages.push(i)
      if (endPage < totalPages - 2) pages.push('...')
      pages.push(totalPages - 1)
    }
    return pages
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 용어 목록 조회
   */
  const loadTerms = async () => {
    try {
      selectedTermIds.value = []
      if (selectedDocumentId.value) {
        await glossaryStore.fetchTermsByDocument(selectedDocumentId.value)
        await glossaryStore.fetchStatistics()
      } else {
        await glossaryStore.fetchAllTerms()
        await glossaryStore.fetchStatistics()
      }
    } catch (error) {
      console.error('Failed to load terms:', error)
    }
  }

  /**
   * 문서 변경 핸들러
   */
  const handleDocumentChange = async () => {
    await loadTerms()
  }

  /**
   * 검색 핸들러
   */
  const handleSearch = () => {
    if (searchQuery.value) {
      if (selectedDocumentId.value) {
        glossaryStore.searchTermsByDocument(selectedDocumentId.value, searchQuery.value)
      } else {
        glossaryStore.searchAllTerms(searchQuery.value)
      }
    } else {
      loadTerms()
    }
  }

  /**
   * 새로고침
   */
  const refreshTerms = () => {
    loadTerms()
  }

  /**
   * 페이지 이동
   */
  const goToPage = async (page) => {
    if (page < 0 || page >= pagination.value.totalPages) return
    try {
      selectedTermIds.value = []
      if (searchQuery.value) {
        if (selectedDocumentId.value) {
          await glossaryStore.searchTermsByDocument(selectedDocumentId.value, searchQuery.value, { page })
        } else {
          await glossaryStore.searchAllTerms(searchQuery.value, { page })
        }
      } else {
        if (selectedDocumentId.value) {
          await glossaryStore.fetchTermsByDocument(selectedDocumentId.value, { page })
        } else {
          await glossaryStore.fetchAllTerms({ page })
        }
      }
    } catch (error) {
      console.error('Failed to load page:', error)
    }
  }

  /**
   * 용어 추출 시작
   */
  const extractTermsFromDocument = async (doc) => {
    try {
      await glossaryStore.startExtraction(doc.id)
    } catch (error) {
      console.error('Failed to start extraction:', error)
      alert('용어 추출을 시작하지 못했습니다.')
    }
  }

  /**
   * 추출 완료 핸들러
   */
  const handleExtractionClose = () => {
    glossaryStore.clearExtractionJob()
    loadTerms()
  }

  /**
   * 용어 검증
   */
  const verifyTerm = async (term) => {
    try {
      await glossaryStore.verifyTerm(term.id)
      await glossaryStore.fetchStatistics()
    } catch (error) {
      console.error('Failed to verify term:', error)
    }
  }

  /**
   * 용어 검증 취소
   */
  const unverifyTerm = async (term) => {
    if (!confirm(`'${term.koreanTerm}' 용어의 검증을 취소하시겠습니까?`)) return
    try {
      await glossaryStore.unverifyTerm(term.id)
      await glossaryStore.fetchStatistics()
    } catch (error) {
      console.error('Failed to unverify term:', error)
    }
  }

  /**
   * 용어 삭제 확인
   */
  const confirmDeleteTerm = (term) => {
    if (confirm(`'${term.koreanTerm}' 용어를 삭제하시겠습니까?`)) {
      deleteTerm(term)
    }
  }

  /**
   * 용어 삭제
   */
  const deleteTerm = async (term) => {
    try {
      await glossaryStore.deleteTerm(term.id)
    } catch (error) {
      console.error('Failed to delete term:', error)
    }
  }

  /**
   * 용어 선택 토글
   */
  const toggleSelectTerm = (termId) => {
    const index = selectedTermIds.value.indexOf(termId)
    if (index > -1) selectedTermIds.value.splice(index, 1)
    else selectedTermIds.value.push(termId)
  }

  /**
   * 전체 선택 토글
   */
  const toggleSelectAll = () => {
    if (isAllSelected.value) selectedTermIds.value = []
    else selectedTermIds.value = terms.value.map(t => t.id)
  }

  /**
   * 일괄 삭제
   */
  const handleBulkDelete = async () => {
    if (selectedTermIds.value.length === 0) return
    if (!confirm(`선택한 ${selectedTermIds.value.length}개 용어를 삭제하시겠습니까?`)) return

    try {
      await glossaryStore.deleteTerms(selectedTermIds.value)
      selectedTermIds.value = []
      await loadTerms()
    } catch (error) {
      console.error('Failed to delete terms:', error)
      alert('용어 삭제에 실패했습니다.')
    }
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * 상태 라벨
   */
  const getStatusLabel = (status) => {
    const labels = {
      AUTO_EXTRACTED: 'AI',
      USER_ADDED: '추가',
      USER_EDITED: '수정',
      USER_VERIFIED: '검증'
    }
    return labels[status] || status
  }

  /**
   * 상태 배지 클래스
   */
  const getStatusBadgeClass = (status) => {
    const classes = {
      AUTO_EXTRACTED: 'bg-blue-100 text-blue-700',
      USER_ADDED: 'bg-green-100 text-green-700',
      USER_EDITED: 'bg-amber-100 text-amber-700',
      USER_VERIFIED: 'bg-purple-100 text-purple-700'
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    selectedDocumentId,
    searchQuery,
    filterStatus,
    filterVerified,
    selectedTermIds,

    // Computed
    terms,
    allTerms,
    loading,
    pagination,
    extractionJob,
    isAllSelected,
    displayedPages,

    // Actions
    loadTerms,
    handleDocumentChange,
    handleSearch,
    refreshTerms,
    goToPage,
    extractTermsFromDocument,
    handleExtractionClose,
    verifyTerm,
    unverifyTerm,
    confirmDeleteTerm,
    deleteTerm,
    toggleSelectTerm,
    toggleSelectAll,
    handleBulkDelete,

    // Helpers
    getStatusLabel,
    getStatusBadgeClass
  }
}
