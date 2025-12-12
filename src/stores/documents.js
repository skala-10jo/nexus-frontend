import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { documentService } from '@/services/documentService'

/**
 * 문서 스토어 (Setup 함수 패턴)
 *
 * CLAUDE.md 규칙 준수: defineStore(() => {...}) 형태 사용
 */
export const useDocumentStore = defineStore('documents', () => {
  // ==================== State ====================
  const documents = ref([])
  const currentDocument = ref(null)
  const uploadingFiles = ref([])
  const pagination = ref({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  })
  const hasMore = ref(false)
  const loading = ref(false)
  const error = ref(null)

  // ==================== Getters ====================

  const totalSize = computed(() => {
    return documents.value.reduce((sum, doc) => sum + doc.fileSize, 0)
  })

  const recentUploadDate = computed(() => {
    if (documents.value.length === 0) return null
    const sorted = [...documents.value].sort((a, b) =>
      new Date(b.uploadDate) - new Date(a.uploadDate)
    )
    return sorted[0]?.uploadDate
  })

  // ==================== Actions ====================

  async function uploadDocument(file, onProgress) {
    try {
      const response = await documentService.uploadDocument(file, onProgress)
      return response.data
    } catch (err) {
      throw err
    }
  }

  async function fetchDocuments(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        ...filters
      }

      const response = await documentService.getDocuments(params)
      const data = response.data.data

      documents.value = data.content
      pagination.value = {
        page: data.number,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      }
      hasMore.value = data.number < data.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || loading.value) return

    loading.value = true
    try {
      const params = {
        page: pagination.value.page + 1,
        size: pagination.value.size
      }

      const response = await documentService.getDocuments(params)
      const data = response.data.data

      documents.value.push(...data.content)
      pagination.value = {
        page: data.number,
        size: data.size,
        totalElements: data.totalElements,
        totalPages: data.totalPages
      }
      hasMore.value = data.number < data.totalPages - 1
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function getDocumentDetail(documentId) {
    try {
      const response = await documentService.getDocument(documentId)
      currentDocument.value = response.data.data
      return currentDocument.value
    } catch (err) {
      throw err
    }
  }

  async function downloadDocument(documentId, filename) {
    try {
      await documentService.downloadDocument(documentId, filename)
    } catch (err) {
      throw err
    }
  }

  async function deleteDocument(documentId) {
    try {
      await documentService.deleteDocument(documentId)
      documents.value = documents.value.filter(doc => doc.id !== documentId)
      pagination.value.totalElements--
    } catch (err) {
      throw err
    }
  }

  // ==================== Return ====================
  return {
    // State
    documents,
    currentDocument,
    uploadingFiles,
    pagination,
    hasMore,
    loading,
    error,

    // Getters
    totalSize,
    recentUploadDate,

    // Actions
    uploadDocument,
    fetchDocuments,
    loadMore,
    getDocumentDetail,
    downloadDocument,
    deleteDocument
  }
})
