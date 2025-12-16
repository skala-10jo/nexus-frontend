/**
 * Document Management Composable
 *
 * 문서 관리 페이지의 상태 및 비즈니스 로직 관리
 *
 * @module useDocumentManagement
 */
import { ref, computed, watch } from 'vue'
import { useDocumentStore } from '@/stores/documents'
import { useToast } from '@/composables/useToast'

/**
 * 문서 관리 로직
 *
 * @returns {Object} 문서 관리 상태 및 메서드
 */
export function useDocumentManagement() {
  const documentStore = useDocumentStore()
  const toast = useToast()

  // ============================================
  // State
  // ============================================

  /** 업로드 섹션 접힘 상태 */
  const isUploadCollapsed = ref(true)

  /** 검색 쿼리 */
  const searchQuery = ref('')

  /** 파일 유형 필터 */
  const filterFileType = ref('')

  /** 상태 필터 */
  const filterStatus = ref('')

  /** 정렬 옵션 */
  const sortOption = ref('uploadDate:desc')

  /** 뷰 모드 (grid | list) */
  const viewMode = ref('list')

  /** 선택된 문서 (상세보기용) */
  const selectedDocument = ref(null)

  /** 삭제 대상 문서 */
  const documentToDelete = ref(null)

  /** 더보기 트리거 ref */
  const loadMoreTrigger = ref(null)

  // ============================================
  // Computed
  // ============================================

  /** 문서 목록 */
  const documents = computed(() => documentStore.documents)

  /** 로딩 상태 */
  const loading = computed(() => documentStore.loading)

  /** 더 불러올 데이터 있는지 */
  const hasMore = computed(() => documentStore.hasMore)

  /** 전체 문서 수 */
  const totalDocuments = computed(() => documentStore.pagination.totalElements)

  /** 전체 용량 */
  const totalSize = computed(() => documentStore.totalSize)

  /** 최근 업로드 날짜 */
  const recentUploadDate = computed(() => documentStore.recentUploadDate)

  // ============================================
  // Methods - UI Control
  // ============================================

  /**
   * 업로드 섹션 토글
   */
  function toggleUploadSection() {
    isUploadCollapsed.value = !isUploadCollapsed.value
  }

  /**
   * 업로드 섹션으로 스크롤
   */
  function scrollToUpload() {
    isUploadCollapsed.value = false
  }

  // ============================================
  // Methods - Upload Handlers
  // ============================================

  /**
   * 업로드 시작 핸들러
   */
  function handleUploadStart() {
    isUploadCollapsed.value = false
  }

  /**
   * 업로드 완료 핸들러
   */
  function handleUploadComplete() {
    refreshDocuments()
    toast.success('문서가 업로드되었습니다')

    // 문서가 충분히 있으면 업로드 섹션 접기
    setTimeout(() => {
      if (documents.value.length > 5) {
        isUploadCollapsed.value = true
      }
    }, 3000)
  }

  /**
   * 업로드 에러 핸들러
   *
   * @param {Error} error - 에러 객체
   */
  function handleUploadError(error) {
    toast.error(`업로드 실패: ${error.message}`)
  }

  // ============================================
  // Methods - Document CRUD
  // ============================================

  /**
   * 문서 목록 새로고침
   */
  async function refreshDocuments() {
    try {
      await documentStore.fetchDocuments({
        search: searchQuery.value,
        fileType: filterFileType.value,
        status: filterStatus.value,
        sort: sortOption.value
      })
    } catch (error) {
      toast.error('문서를 불러오는데 실패했습니다')
    }
  }

  /**
   * 문서 상세 정보 열기
   *
   * @param {Object} document - 문서 객체
   */
  async function openDocumentDetail(document) {
    try {
      const detail = await documentStore.getDocumentDetail(document.id)
      selectedDocument.value = detail
    } catch (error) {
      toast.error('문서 상세 정보를 불러오는데 실패했습니다')
    }
  }

  /**
   * 문서 다운로드
   *
   * @param {Object} document - 문서 객체
   */
  async function downloadDocument(document) {
    try {
      await documentStore.downloadDocument(document.id, document.originalFilename)
      toast.success('다운로드가 시작되었습니다')
    } catch (error) {
      toast.error('다운로드에 실패했습니다')
    }
  }

  /**
   * 삭제 확인
   *
   * @param {Object} document - 문서 객체
   */
  function confirmDelete(document) {
    documentToDelete.value = document
  }

  /**
   * 문서 삭제 실행
   */
  async function handleDelete() {
    try {
      await documentStore.deleteDocument(documentToDelete.value.id)
      toast.success('문서가 삭제되었습니다')
      documentToDelete.value = null
      selectedDocument.value = null
    } catch (error) {
      toast.error('삭제에 실패했습니다')
    }
  }

  /**
   * 더 불러오기
   */
  function loadMore() {
    if (hasMore.value && !loading.value) {
      documentStore.loadMore()
    }
  }

  // ============================================
  // Methods - Utilities
  // ============================================

  /**
   * 파일 유형에 따른 아이콘 반환
   *
   * @param {string} fileType - 파일 유형
   * @returns {string} 이모지 아이콘
   */
  function getFileIcon(fileType) {
    if (!fileType) return '📄'
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return '📕'
    if (type.includes('word') || type.includes('doc')) return '📘'
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📗'
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📄'
  }

  /**
   * 파일 크기 포맷팅
   *
   * @param {number} bytes - 바이트 수
   * @returns {string} 포맷된 크기 문자열
   */
  function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * 날짜 포맷팅
   *
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷된 날짜 문자열
   */
  function formatDate(dateString) {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // ============================================
  // Watchers
  // ============================================

  /**
   * 필터/검색/정렬 변경 시 문서 새로고침
   */
  function setupFilterWatchers() {
    watch(
      [searchQuery, filterFileType, filterStatus, sortOption],
      () => {
        refreshDocuments()
      },
      { debounce: 300 }
    )
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    isUploadCollapsed,
    searchQuery,
    filterFileType,
    filterStatus,
    sortOption,
    viewMode,
    selectedDocument,
    documentToDelete,
    loadMoreTrigger,

    // Computed
    documents,
    loading,
    hasMore,
    totalDocuments,
    totalSize,
    recentUploadDate,

    // UI Control
    toggleUploadSection,
    scrollToUpload,

    // Upload Handlers
    handleUploadStart,
    handleUploadComplete,
    handleUploadError,

    // Document CRUD
    refreshDocuments,
    openDocumentDetail,
    downloadDocument,
    confirmDelete,
    handleDelete,
    loadMore,

    // Utilities
    getFileIcon,
    formatFileSize,
    formatDate,

    // Watchers
    setupFilterWatchers
  }
}
