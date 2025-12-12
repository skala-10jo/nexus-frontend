/**
 * useProjectPage Composable
 *
 * Project.vue 페이지의 비즈니스 로직을 분리한 composable
 * - 프로젝트 CRUD 관리
 * - 문서 연결 관리
 * - 필터링 및 검색
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { projectService } from '@/services/projectService'
import { documentService } from '@/services/documentService'
import { useToast } from '@/composables/useToast'

export function useProjectPage() {
  const toast = useToast()

  // ============================================
  // State
  // ============================================
  const projects = ref([])
  const allDocuments = ref([])
  const loading = ref(false)
  const searchQuery = ref('')
  const statusFilter = ref('ALL')
  const documentSearchQuery = ref('')

  // Modal States
  const showModal = ref(false)
  const showDetailModal = ref(false)
  const showConfirmDialog = ref(false)
  const isEditing = ref(false)
  const selectedProject = ref(null)
  const openDropdownId = ref(null)

  // Form Data
  const formData = ref({
    name: '',
    description: '',
    documentIds: []
  })

  const confirmDialog = ref({
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'Confirm',
    onConfirm: () => {}
  })

  const currentProjectId = ref(null)

  // ============================================
  // Computed
  // ============================================
  const statistics = computed(() => ({
    total: projects.value.length,
    active: projects.value.filter(p => p.status === 'ACTIVE').length,
    archived: projects.value.filter(p => p.status === 'ARCHIVED').length
  }))

  const filteredProjects = computed(() => {
    return projects.value.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      const matchesStatus = statusFilter.value === 'ALL' || project.status === statusFilter.value
      return matchesSearch && matchesStatus
    })
  })

  const filteredDocuments = computed(() => {
    if (!documentSearchQuery.value) return allDocuments.value
    return allDocuments.value.filter(doc =>
      doc.originalFilename.toLowerCase().includes(documentSearchQuery.value.toLowerCase())
    )
  })

  // ============================================
  // Data Loading
  // ============================================
  async function loadProjects() {
    loading.value = true
    try {
      const response = await projectService.getAll()
      projects.value = response.data.data || response.data || response
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast.error('Failed to load projects.')
    } finally {
      loading.value = false
    }
  }

  async function loadDocuments() {
    try {
      const response = await documentService.getAll({ page: 0, size: 1000 })
      allDocuments.value = response.data.data?.content || response.data?.content || response.content || []
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  // ============================================
  // Modal Management
  // ============================================
  function openCreateModal() {
    isEditing.value = false
    formData.value = {
      name: '',
      description: '',
      documentIds: []
    }
    currentProjectId.value = null
    documentSearchQuery.value = ''
    showModal.value = true
  }

  async function editProject(project) {
    closeDropdown()
    isEditing.value = true
    currentProjectId.value = project.id
    documentSearchQuery.value = ''

    try {
      const response = await projectService.getProject(project.id)
      const projectDetail = response.data.data || response.data

      formData.value = {
        name: projectDetail.name,
        description: projectDetail.description || '',
        documentIds: projectDetail.documentIds || []
      }
    } catch (error) {
      console.error('Failed to load project details:', error)
      formData.value = {
        name: project.name,
        description: project.description || '',
        documentIds: []
      }
      toast.warning('Failed to load project details.')
    }

    showModal.value = true
  }

  function editFromDetail(project) {
    showDetailModal.value = false
    editProject(project)
  }

  function closeModal() {
    showModal.value = false
    formData.value = {
      name: '',
      description: '',
      documentIds: []
    }
    currentProjectId.value = null
    isEditing.value = false
    documentSearchQuery.value = ''
  }

  // ============================================
  // CRUD Operations
  // ============================================
  async function saveProject() {
    if (!formData.value.name.trim()) {
      toast.warning('Please enter a project name.')
      return
    }

    try {
      if (isEditing.value) {
        await projectService.update(currentProjectId.value, formData.value)
        toast.success('Project updated successfully.')
      } else {
        await projectService.create(formData.value)
        toast.success('Project created successfully.')
      }
      closeModal()
      loadProjects()
    } catch (error) {
      console.error('Failed to save project:', error)
      toast.error('Failed to save project.')
    }
  }

  function confirmDeleteProject(project) {
    closeDropdown()
    confirmDialog.value = {
      title: 'Delete Project',
      message: `Are you sure you want to delete "${project.name}"?\n\n⚠️ This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      onConfirm: () => deleteProject(project)
    }
    showConfirmDialog.value = true
  }

  async function deleteProject(project) {
    try {
      await projectService.delete(project.id)
      toast.success('Project deleted successfully.')
      loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      toast.error('Failed to delete project.')
    } finally {
      closeConfirmDialog()
    }
  }

  function archiveProject(project) {
    closeDropdown()
    confirmDialog.value = {
      title: 'Archive Project',
      message: `Are you sure you want to archive "${project.name}"?`,
      type: 'warning',
      confirmText: 'Archive',
      onConfirm: () => updateProjectStatus(project, 'ARCHIVED', 'Project archived successfully.')
    }
    showConfirmDialog.value = true
  }

  function unarchiveProject(project) {
    closeDropdown()
    updateProjectStatus(project, 'ACTIVE', 'Project restored successfully.')
  }

  async function updateProjectStatus(project, status, successMessage) {
    try {
      await projectService.update(project.id, {
        name: project.name,
        description: project.description,
        status: status
      })
      toast.success(successMessage)
      loadProjects()
    } catch (error) {
      console.error('Failed to update project status:', error)
      toast.error('Failed to update project status.')
    } finally {
      closeConfirmDialog()
    }
  }

  // ============================================
  // Detail Modal
  // ============================================
  function viewProjectDetail(project) {
    selectedProject.value = project
    showDetailModal.value = true
  }

  function closeDetailModal() {
    showDetailModal.value = false
    selectedProject.value = null
  }

  function closeConfirmDialog() {
    showConfirmDialog.value = false
  }

  // ============================================
  // Dropdown Management
  // ============================================
  function toggleDropdown(projectId) {
    openDropdownId.value = openDropdownId.value === projectId ? null : projectId
  }

  function closeDropdown() {
    openDropdownId.value = null
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.relative')) {
      closeDropdown()
    }
  }

  // ============================================
  // Document Selection
  // ============================================
  function toggleDocumentSelection(docId) {
    const index = formData.value.documentIds.indexOf(docId)
    if (index === -1) {
      formData.value.documentIds.push(docId)
    } else {
      formData.value.documentIds.splice(index, 1)
    }
  }

  function clearDocumentSelection() {
    formData.value.documentIds = []
  }

  // ============================================
  // Utility Functions
  // ============================================
  function getStatusText(status) {
    switch (status) {
      case 'ACTIVE':
        return 'Active'
      case 'ARCHIVED':
        return 'Archived'
      case 'DELETED':
        return 'Deleted'
      default:
        return status
    }
  }

  function formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // ============================================
  // Lifecycle
  // ============================================
  function initializePage() {
    loadProjects()
    loadDocuments()
    document.addEventListener('click', handleClickOutside)
  }

  function cleanupPage() {
    document.removeEventListener('click', handleClickOutside)
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    projects,
    allDocuments,
    loading,
    searchQuery,
    statusFilter,
    documentSearchQuery,

    // Modal States
    showModal,
    showDetailModal,
    showConfirmDialog,
    isEditing,
    selectedProject,
    openDropdownId,

    // Form Data
    formData,
    confirmDialog,
    currentProjectId,

    // Computed
    statistics,
    filteredProjects,
    filteredDocuments,

    // Data Loading
    loadProjects,
    loadDocuments,

    // Modal Management
    openCreateModal,
    editProject,
    editFromDetail,
    closeModal,

    // CRUD Operations
    saveProject,
    confirmDeleteProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    updateProjectStatus,

    // Detail Modal
    viewProjectDetail,
    closeDetailModal,
    closeConfirmDialog,

    // Dropdown Management
    toggleDropdown,
    closeDropdown,

    // Document Selection
    toggleDocumentSelection,
    clearDocumentSelection,

    // Utility Functions
    getStatusText,
    formatDate,
    formatFileSize,

    // Lifecycle
    initializePage,
    cleanupPage
  }
}
