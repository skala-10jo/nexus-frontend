import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { glossaryService } from '@/services/glossaryService'

/**
 * 용어집 스토어 (Setup 함수 패턴)
 *
 * CLAUDE.md 규칙 준수: defineStore(() => {...}) 형태 사용
 */
export const useGlossaryStore = defineStore('glossary', () => {
  // ==================== State ====================
  const terms = ref([])
  const currentTerm = ref(null)
  const extractionJob = ref(null)
  let pollingInterval = null
  const pagination = ref({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  })
  const statistics = ref({
    totalTerms: 0,
    verifiedTerms: 0,
    unverifiedTerms: 0,
    autoExtractedTerms: 0,
    userAddedTerms: 0,
    userEditedTerms: 0
  })
  const hasMore = ref(false)
  const loading = ref(false)
  const extracting = ref(false)
  const error = ref(null)

  // ==================== Getters ====================

  const verifiedTerms = computed(() => {
    return terms.value.filter(t => t.isVerified)
  })

  const unverifiedTerms = computed(() => {
    return terms.value.filter(t => !t.isVerified)
  })

  const termsByStatus = (status) => {
    return terms.value.filter(t => t.status === status)
  }

  const extractionProgress = computed(() => {
    return extractionJob.value?.progress || 0
  })

  const isExtractionComplete = computed(() => {
    return extractionJob.value?.status === 'COMPLETED'
  })

  const isExtractionFailed = computed(() => {
    return extractionJob.value?.status === 'FAILED'
  })

  // ==================== Actions ====================

  async function startExtraction(documentId) {
    extracting.value = true
    error.value = null

    try {
      const response = await glossaryService.startExtraction(documentId)
      extractionJob.value = response.data.data || response.data

      // Start polling for job status
      startPolling(extractionJob.value.id)

      return extractionJob.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      extracting.value = false
    }
  }

  async function getExtractionStatus(jobId) {
    try {
      const response = await glossaryService.getExtractionStatus(jobId)
      extractionJob.value = response.data.data || response.data
      return extractionJob.value
    } catch (err) {
      throw err
    }
  }

  function startPolling(jobId) {
    stopPolling()

    pollingInterval = setInterval(async () => {
      try {
        await getExtractionStatus(jobId)

        if (
          extractionJob.value.status === 'COMPLETED' ||
          extractionJob.value.status === 'FAILED'
        ) {
          stopPolling()
        }
      } catch (err) {
        console.error('Polling error:', err)
        stopPolling()
      }
    }, 5000) // Poll every 5 seconds
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  async function fetchAllTerms(filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.getAllTerms(params)
      const data = response.data.data || response.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTerms(projectId, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.getTermsByProject(projectId, params)
      const data = response.data.data || response.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchTermsByDocument(documentId, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.getTermsByDocument(documentId, params)
      const data = response.data.data || response.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchAllTerms(query, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.searchAllTerms(query, params)
      const data = response.data.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchTerms(projectId, query, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.searchTerms(projectId, query, params)
      const data = response.data.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchTermsByDocument(documentId, query, filters = {}) {
    loading.value = true
    error.value = null

    try {
      const params = {
        page: 0,
        size: pagination.value.size,
        sort: 'createdAt,desc',
        ...filters
      }

      const response = await glossaryService.searchTermsByDocument(documentId, query, params)
      const data = response.data.data

      terms.value = data.content || data
      pagination.value = {
        page: data.number || 0,
        size: data.size || params.size,
        totalElements: data.totalElements || data.length || 0,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadMore(projectId) {
    if (!hasMore.value || loading.value) return

    loading.value = true
    try {
      const params = {
        page: pagination.value.page + 1,
        size: pagination.value.size,
        sort: 'createdAt,desc'
      }

      const response = await glossaryService.getTermsByProject(projectId, params)
      const data = response.data.data

      terms.value.push(...(data.content || []))
      pagination.value = {
        page: data.number || params.page,
        size: data.size || params.size,
        totalElements: data.totalElements || terms.value.length,
        totalPages: data.totalPages || 1
      }
      hasMore.value = pagination.value.page < pagination.value.totalPages - 1
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function getTermDetail(termId) {
    try {
      const response = await glossaryService.getTermDetail(termId)
      currentTerm.value = response.data.data || response.data
      return currentTerm.value
    } catch (err) {
      throw err
    }
  }

  async function createTerm(termData) {
    try {
      const response = await glossaryService.createTerm(termData)
      const newTerm = response.data.data || response.data
      terms.value.unshift(newTerm)
      pagination.value.totalElements++
      return newTerm
    } catch (err) {
      throw err
    }
  }

  async function updateTerm(termId, termData) {
    try {
      const response = await glossaryService.updateTerm(termId, termData)
      const updatedTerm = response.data.data || response.data

      const index = terms.value.findIndex(t => t.id === termId)
      if (index !== -1) {
        terms.value[index] = updatedTerm
      }

      if (currentTerm.value?.id === termId) {
        currentTerm.value = updatedTerm
      }

      return updatedTerm
    } catch (err) {
      throw err
    }
  }

  async function deleteTerm(termId) {
    try {
      await glossaryService.deleteTerm(termId)
      terms.value = terms.value.filter(t => t.id !== termId)
      pagination.value.totalElements--

      if (currentTerm.value?.id === termId) {
        currentTerm.value = null
      }
    } catch (err) {
      throw err
    }
  }

  async function deleteTerms(termIds) {
    try {
      await glossaryService.deleteTerms(termIds)
      terms.value = terms.value.filter(t => !termIds.includes(t.id))
      pagination.value.totalElements -= termIds.length
    } catch (err) {
      throw err
    }
  }

  async function verifyTerm(termId) {
    try {
      const response = await glossaryService.verifyTerm(termId)
      const verifiedTerm = response.data.data || response.data

      const index = terms.value.findIndex(t => t.id === termId)
      if (index !== -1) {
        terms.value[index] = verifiedTerm
      }

      if (currentTerm.value?.id === termId) {
        currentTerm.value = verifiedTerm
      }

      return verifiedTerm
    } catch (err) {
      throw err
    }
  }

  async function unverifyTerm(termId) {
    try {
      const response = await glossaryService.unverifyTerm(termId)
      const unverifiedTerm = response.data.data || response.data

      const index = terms.value.findIndex(t => t.id === termId)
      if (index !== -1) {
        terms.value[index] = unverifiedTerm
      }

      if (currentTerm.value?.id === termId) {
        currentTerm.value = unverifiedTerm
      }

      return unverifiedTerm
    } catch (err) {
      throw err
    }
  }

  function setCurrentTerm(term) {
    currentTerm.value = term
  }

  function clearCurrentTerm() {
    currentTerm.value = null
  }

  function clearExtractionJob() {
    stopPolling()
    extractionJob.value = null
  }

  async function fetchStatistics(projectId = null) {
    try {
      const response = await glossaryService.getStatistics(projectId)
      statistics.value = response.data.data || response.data
    } catch (err) {
      console.error('Failed to fetch statistics:', err)
    }
  }

  function resetState() {
    stopPolling()
    terms.value = []
    currentTerm.value = null
    extractionJob.value = null
    pagination.value = {
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0
    }
    statistics.value = {
      totalTerms: 0,
      verifiedTerms: 0,
      unverifiedTerms: 0,
      autoExtractedTerms: 0,
      userAddedTerms: 0,
      userEditedTerms: 0
    }
    hasMore.value = false
    loading.value = false
    extracting.value = false
    error.value = null
  }

  // ==================== Return ====================
  return {
    // State
    terms,
    currentTerm,
    extractionJob,
    pagination,
    statistics,
    hasMore,
    loading,
    extracting,
    error,

    // Getters
    verifiedTerms,
    unverifiedTerms,
    termsByStatus,
    extractionProgress,
    isExtractionComplete,
    isExtractionFailed,

    // Actions
    startExtraction,
    getExtractionStatus,
    startPolling,
    stopPolling,
    fetchAllTerms,
    fetchTerms,
    fetchTermsByDocument,
    searchAllTerms,
    searchTerms,
    searchTermsByDocument,
    loadMore,
    getTermDetail,
    createTerm,
    updateTerm,
    deleteTerm,
    deleteTerms,
    verifyTerm,
    unverifyTerm,
    setCurrentTerm,
    clearCurrentTerm,
    clearExtractionJob,
    fetchStatistics,
    resetState
  }
})
