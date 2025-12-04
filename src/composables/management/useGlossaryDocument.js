import { ref, computed } from 'vue'
import { useDocumentStore } from '@/stores/documents'

/**
 * 용어사전 문서 관리 Composable
 * @description 문서 업로드, 삭제, 다운로드, 상태 관리 로직
 */
export function useGlossaryDocument() {
  // Store
  const documentStore = useDocumentStore()

  // ============================================
  // State
  // ============================================
  const isDocumentSectionCollapsed = ref(false)
  const showUploadModal = ref(false)
  const isDragActive = ref(false)
  const fileInput = ref(null)
  const uploadingFiles = ref([])

  // Pagination State
  const pagination = ref({
    page: 0,
    size: 5, // Default 5 items per page
    totalElements: 0,
    totalPages: 0
  })

  // Selection State
  const selectedDocumentIds = ref([])

  // ============================================
  // Computed
  // ============================================
  const documents = computed(() => documentStore.documents)
  const documentLoading = computed(() => documentStore.loading)

  // Displayed pages for pagination UI
  const displayedPages = computed(() => {
    const current = pagination.value.page
    const total = pagination.value.totalPages
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 0; i < total; i++) {
      if (i === 0 || i === total - 1 || (i >= current - delta && i <= current + delta)) {
        range.push(i)
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }

    return rangeWithDots
  })

  // All selected check
  const isAllDocumentsSelected = computed(() =>
    documents.value.length > 0 && selectedDocumentIds.value.length === documents.value.length
  )

  // ============================================
  // Actions
  // ============================================

  /**
   * 문서 목록 조회
   */
  const loadDocuments = async () => {
    try {
      selectedDocumentIds.value = [] // Reset selection on load
      await documentStore.fetchDocuments({
        sort: 'uploadDate,desc',
        page: pagination.value.page,
        size: pagination.value.size
      })

      // Update pagination state from store
      pagination.value = {
        ...pagination.value,
        totalElements: documentStore.pagination.totalElements,
        totalPages: documentStore.pagination.totalPages
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  /**
   * 페이지 변경
   */
  const changePage = async (page) => {
    if (page >= 0 && page < pagination.value.totalPages) {
      pagination.value.page = page
      await loadDocuments()
    }
  }

  /**
   * 페이지 크기 변경
   */
  const changePageSize = async (size) => {
    pagination.value.size = size
    pagination.value.page = 0 // Reset to first page
    await loadDocuments()
  }

  /**
   * 섹션 토글
   */
  const toggleSection = () => {
    isDocumentSectionCollapsed.value = !isDocumentSectionCollapsed.value
  }

  /**
   * 문서 선택 토글
   */
  const toggleSelectDocument = (docId) => {
    const index = selectedDocumentIds.value.indexOf(docId)
    if (index > -1) selectedDocumentIds.value.splice(index, 1)
    else selectedDocumentIds.value.push(docId)
  }

  /**
   * 전체 문서 선택 토글
   */
  const toggleSelectAllDocuments = () => {
    if (isAllDocumentsSelected.value) selectedDocumentIds.value = []
    else selectedDocumentIds.value = documents.value.map(d => d.id)
  }

  /**
   * 문서 일괄 삭제
   */
  const handleBulkDeleteDocuments = async () => {
    if (selectedDocumentIds.value.length === 0) return
    if (!confirm(`선택한 ${selectedDocumentIds.value.length}개 문서를 삭제하시겠습니까?`)) return

    try {
      // Execute delete for each document (since store might not have bulk delete yet)
      // Ideally backend should support bulk delete, but for now loop is fine for small batches
      for (const id of selectedDocumentIds.value) {
        await documentStore.deleteDocument(id)
      }
      await loadDocuments()
    } catch (error) {
      console.error('Failed to delete documents:', error)
      alert('문서 삭제에 실패했습니다.')
    }
  }

  /**
   * 파일 입력 트리거
   */
  const triggerFileInput = () => {
    fileInput.value?.click()
  }

  /**
   * 드래그 앤 드롭 핸들러
   */
  const handleDrop = (e) => {
    isDragActive.value = false
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  /**
   * 파일 선택 핸들러
   */
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    uploadFiles(files)
    e.target.value = ''
  }

  /**
   * 파일 업로드
   */
  const uploadFiles = async (files) => {
    const validFiles = files.filter(file => {
      const isValidType = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/msword'
      ].includes(file.type)
      const isValidSize = file.size <= 50 * 1024 * 1024

      if (!isValidType) {
        alert(`${file.name}: 지원하지 않는 파일 형식입니다`)
        return false
      }
      if (!isValidSize) {
        alert(`${file.name}: 파일 크기가 50MB를 초과합니다`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    for (const file of validFiles) {
      const uploadId = Date.now() + Math.random()
      const uploadItem = {
        id: uploadId,
        filename: file.name,
        size: file.size,
        progress: 0,
        error: null,
        file: file
      }

      uploadingFiles.value.push(uploadItem)

      try {
        await documentStore.uploadDocument(file, (progress) => {
          const item = uploadingFiles.value.find(u => u.id === uploadId)
          if (item) item.progress = progress
        })

        setTimeout(() => {
          uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== uploadId)
          if (uploadingFiles.value.length === 0) {
            loadDocuments()
          }
        }, 1000)
      } catch (error) {
        const item = uploadingFiles.value.find(u => u.id === uploadId)
        if (item) {
          item.error = error.message
          item.progress = 0
        }
      }
    }
  }

  /**
   * 문서 다운로드
   */
  const downloadDocument = async (doc) => {
    try {
      await documentStore.downloadDocument(doc.id, doc.originalFilename)
    } catch (error) {
      console.error('Failed to download document:', error)
      alert('다운로드에 실패했습니다.')
    }
  }

  /**
   * 문서 삭제 확인
   */
  const confirmDeleteDocument = async (doc) => {
    if (confirm(`'${doc.originalFilename}' 파일을 삭제하시겠습니까?`)) {
      try {
        await documentStore.deleteDocument(doc.id)
        // Reload to update list and pagination
        await loadDocuments()
      } catch (error) {
        console.error('Failed to delete document:', error)
        alert('삭제에 실패했습니다.')
      }
    }
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * 파일 아이콘 반환
   */
  const getFileIcon = (fileType) => {
    if (!fileType) return '📄'
    const type = fileType.toLowerCase()
    if (type.includes('pdf')) return '📕'
    if (type.includes('word') || type.includes('doc')) return '📘'
    if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📗'
    if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️'
    return '📄'
  }

  /**
   * 문서 상태 클래스
   */
  const getDocStatusClass = (status) => {
    const classes = {
      UPLOADED: 'bg-blue-100 text-blue-700',
      PROCESSING: 'bg-yellow-100 text-yellow-700',
      PROCESSED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700'
    }
    return classes[status] || 'bg-gray-100 text-gray-600'
  }

  /**
   * 문서 상태 텍스트
   */
  const getDocStatusText = (status) => {
    const texts = {
      UPLOADED: '업로드',
      PROCESSING: '처리중',
      PROCESSED: '완료',
      FAILED: '오류'
    }
    return texts[status] || status
  }

  /**
   * 파일 크기 포맷
   */
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i]
  }

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'numeric',
      day: 'numeric'
    })
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    documents,
    documentLoading,
    isDocumentSectionCollapsed,
    showUploadModal,
    isDragActive,
    fileInput,
    uploadingFiles,
    pagination,
    displayedPages,
    selectedDocumentIds,
    isAllDocumentsSelected,

    // Actions
    loadDocuments,
    changePage,
    changePageSize,
    toggleSection,
    toggleSelectDocument,
    toggleSelectAllDocuments,
    handleBulkDeleteDocuments,
    triggerFileInput,
    handleDrop,
    handleFileSelect,
    uploadFiles,
    downloadDocument,
    confirmDeleteDocument,

    // Helpers
    getFileIcon,
    getDocStatusClass,
    getDocStatusText,
    formatFileSize,
    formatDate
  }
}
