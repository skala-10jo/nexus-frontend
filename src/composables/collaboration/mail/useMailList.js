import { ref, reactive, computed } from 'vue'
import { mailService } from '@/services/collaboration/mailService'

/**
 * 메일 목록 관리 Composable
 */
export function useMailList() {
  // ============================================
  // State
  // ============================================
  const emails = ref([])
  const projects = ref([])
  const loading = ref(false)
  const syncing = ref(false)
  const embedding = ref(false)
  const searchQuery = ref('')
  const currentFolder = ref('Inbox')
  const currentProjectId = ref(null)
  const unreadCount = ref(0)

  const pagination = reactive({
    page: 0,
    size: 20,
    totalPages: 0,
    totalElements: 0
  })

  // ============================================
  // Computed
  // ============================================

  /**
   * 프로젝트별 그룹화된 이메일
   */
  const groupedEmails = computed(() => {
    const groups = {}
    emails.value.forEach(email => {
      const projectId = email.projectId || 'unassigned'
      if (!groups[projectId]) {
        groups[projectId] = {
          projectId: email.projectId,
          projectName: email.projectName || 'Unassigned',
          emails: []
        }
      }
      groups[projectId].emails.push(email)
    })

    const groupArray = Object.values(groups)
    return groupArray.sort((a, b) => {
      if (a.projectId === null) return 1
      if (b.projectId === null) return -1
      return a.projectName.localeCompare(b.projectName)
    })
  })

  /**
   * 그룹화 모드 여부
   */
  const isGroupedMode = computed(() => {
    return currentProjectId.value === null && !searchQuery.value
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 메일 목록 조회
   */
  const loadEmails = async () => {
    loading.value = true
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: 'receivedDateTime',
        sortOrder: 'desc'
      }

      if (currentFolder.value) {
        params.folder = currentFolder.value
      }

      if (currentProjectId.value) {
        params.projectId = currentProjectId.value
      }

      const response = await mailService.getEmails(params)
      const data = response.data.data

      emails.value = data.content
      pagination.totalPages = data.totalPages
      pagination.totalElements = data.totalElements

      await loadUnreadCount()
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 읽지 않은 메일 수 조회
   */
  const loadUnreadCount = async () => {
    try {
      const response = await mailService.getUnreadCount()
      unreadCount.value = response.data.data
    } catch (error) {
      console.error('Failed to load unread count:', error)
    }
  }

  /**
   * 메일 검색
   */
  const searchMails = async () => {
    if (!searchQuery.value.trim()) {
      await loadEmails()
      return
    }

    loading.value = true
    try {
      const response = await mailService.searchEmails({
        query: searchQuery.value,
        page: pagination.page,
        size: pagination.size
      })
      const data = response.data.data

      emails.value = data.content
      pagination.totalPages = data.totalPages
      pagination.totalElements = data.totalElements
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 메일 동기화
   */
  const syncMails = async () => {
    syncing.value = true
    try {
      await mailService.syncMails()
      await loadEmails()
      alert('메일 동기화가 완료되었습니다.')
      await generateAllEmbeddings()
    } catch (error) {
      console.error('Sync failed:', error)
      alert('메일 동기화에 실패했습니다.')
    } finally {
      syncing.value = false
    }
  }

  /**
   * 폴더 선택
   */
  const selectFolder = (folder) => {
    currentFolder.value = folder
    pagination.page = 0
    loadEmails()
  }

  /**
   * 프로젝트 필터 변경
   */
  const onProjectChange = () => {
    pagination.page = 0
    loadEmails()
  }

  /**
   * 이전 페이지
   */
  const prevPage = () => {
    if (pagination.page > 0) {
      pagination.page--
      loadEmails()
    }
  }

  /**
   * 다음 페이지
   */
  const nextPage = () => {
    if (pagination.page < pagination.totalPages - 1) {
      pagination.page++
      loadEmails()
    }
  }

  /**
   * 프로젝트 목록 조회
   */
  const loadProjects = async () => {
    try {
      const response = await mailService.getProjects()
      projects.value = response.data.data.content || response.data.data
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  /**
   * 전체 임베딩 생성
   */
  const generateAllEmbeddings = async () => {
    const userStr = localStorage.getItem('user')
    const userId = userStr ? JSON.parse(userStr).id : null

    if (!userId) {
      console.error('User ID not found')
      return
    }

    embedding.value = true
    try {
      const data = await mailService.generateEmbeddings(userId)
      console.log('Embeddings generated:', data)
    } catch (error) {
      console.error('Failed to generate embeddings:', error)
    } finally {
      embedding.value = false
    }
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    emails,
    projects,
    loading,
    syncing,
    embedding,
    searchQuery,
    currentFolder,
    currentProjectId,
    unreadCount,
    pagination,

    // Computed
    groupedEmails,
    isGroupedMode,

    // Actions
    loadEmails,
    loadUnreadCount,
    searchMails,
    syncMails,
    selectFolder,
    onProjectChange,
    prevPage,
    nextPage,
    loadProjects,
    generateAllEmbeddings
  }
}
