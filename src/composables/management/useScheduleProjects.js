import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { documentService } from '@/services/documentService'

/**
 * 일정 페이지 프로젝트 관리
 * @description 프로젝트 목록, 선택, CRUD 로직 관리
 */
export function useScheduleProjects() {
  const projectStore = useProjectStore()

  // State
  const projects = ref([])
  const selectedProjectId = ref(null)
  const allDocuments = ref([])
  const isProjectEditing = ref(false)
  const isProjectCreating = ref(false)
  const currentProjectId = ref(null)

  // Computed
  const selectedProject = computed(() => {
    return projects.value.find((p) => p.id === selectedProjectId.value) || {}
  })

  /**
   * 프로젝트 목록 조회
   */
  const loadProjects = async () => {
    try {
      await projectStore.fetchProjects()
      projects.value = projectStore.projects
    } catch (error) {
      console.error('Failed to load projects:', error)
    }
  }

  /**
   * 문서 목록 조회
   */
  const loadDocuments = async () => {
    try {
      const response = await documentService.getAll({ page: 0, size: 1000 })
      allDocuments.value =
        response.data.data?.content || response.data?.content || response.content || []
    } catch (error) {
      console.error('Failed to load documents:', error)
    }
  }

  /**
   * 프로젝트 선택
   * @param {string} projectId - 프로젝트 ID
   */
  const selectProject = (projectId) => {
    selectedProjectId.value = projectId
    isProjectCreating.value = false
    isProjectEditing.value = false
  }

  /**
   * 프로젝트 선택 해제
   */
  const deselectProject = () => {
    selectedProjectId.value = null
    isProjectCreating.value = false
    isProjectEditing.value = false
  }

  /**
   * 새 프로젝트 생성 모드 열기
   */
  const openCreateProject = () => {
    selectedProjectId.value = null
    isProjectEditing.value = false
    isProjectCreating.value = true
  }

  /**
   * 프로젝트 생성 취소
   */
  const cancelCreate = () => {
    isProjectCreating.value = false
  }

  /**
   * 새 프로젝트 저장
   * @param {Object} formData - 프로젝트 데이터
   */
  const saveNewProject = async (formData) => {
    try {
      const response = await projectStore.createProject(formData)
      const newProject = response.data?.data || response.data || response

      await loadProjects()

      // Select the new project
      if (newProject && newProject.id) {
        selectProject(newProject.id)
      } else {
        cancelCreate()
      }

      return { success: true }
    } catch (error) {
      console.error('Failed to create project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 프로젝트 수정 모드 열기
   * @param {Object} project - 프로젝트 객체
   */
  const openEditProjectModal = (project) => {
    isProjectEditing.value = true
    currentProjectId.value = project.id
  }

  /**
   * 프로젝트 수정 취소
   */
  const cancelEdit = () => {
    isProjectEditing.value = false
    currentProjectId.value = null
  }

  /**
   * 프로젝트 저장
   * @param {Object} formData - 프로젝트 데이터
   */
  const saveProject = async (formData) => {
    try {
      await projectStore.updateProject(currentProjectId.value, formData)
      cancelEdit()
      await loadProjects()
      return { success: true }
    } catch (error) {
      console.error('Failed to save project:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * 프로젝트 삭제
   * @param {Object} project - 프로젝트 객체
   */
  const deleteProject = async (project) => {
    try {
      await projectStore.deleteProject(project.id)
      selectedProjectId.value = null
      await loadProjects()
      return { success: true }
    } catch (error) {
      console.error('Failed to delete project:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    // State
    projects,
    selectedProjectId,
    selectedProject,
    allDocuments,
    isProjectEditing,
    isProjectCreating,
    currentProjectId,

    // Actions
    loadProjects,
    loadDocuments,
    selectProject,
    deselectProject,
    openCreateProject,
    cancelCreate,
    saveNewProject,
    openEditProjectModal,
    cancelEdit,
    saveProject,
    deleteProject
  }
}
