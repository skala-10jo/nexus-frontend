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

  // ============================================
  // Computed
  // ============================================
  const documents = computed(() => documentStore.documents)
  const documentLoading = computed(() => documentStore.loading)

  // ============================================
  // Actions
  // ============================================

  /**
   * 문서 목록 조회
   */
  const loadDocuments = async () => {
    try {
      await documentStore.fetchDocuments({ sort: 'uploadDate,desc' })
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  /**
   * 섹션 토글
   */
  const toggleSection = () => {
    isDocumentSectionCollapsed.value = !isDocumentSectionCollapsed.value
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

    // Actions
    loadDocuments,
    toggleSection,
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
