import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'
import { documentService } from '@/services/documentService'

/**
 * 일정 페이지 프로젝트 관리
 * @description 프로젝트 목록, 선택, CRUD 로직 관리
 *
 * 참고: Project와 ScheduleCategory 간의 양방향 동기화는 백엔드에서 자동으로 처리됩니다.
 * - 프로젝트 생성 시 → 동일 이름의 카테고리 자동 생성
 * - 카테고리 생성 시 → 동일 이름의 프로젝트 자동 생성
 * - 이름 변경/삭제 시 → 양쪽 자동 동기화
 */

export function useScheduleProjects() {
  const projectStore = useProjectStore()
  const categoryStore = useScheduleCategoryStore()

  // State - projects는 스토어에서 직접 가져옴 (반응성 유지)
  const selectedProjectId = ref(null)
  const allDocuments = ref([])
  const isProjectEditing = ref(false)
  const isProjectCreating = ref(false)
  const currentProjectId = ref(null)

  // Computed - 스토어의 projects를 직접 참조하여 반응성 유지
  const projects = computed(() => projectStore.projects || [])

  const selectedProject = computed(() => {
    return projects.value.find((p) => p.id === selectedProjectId.value) || {}
  })

  /**
   * 프로젝트 목록 조회
   */
  const loadProjects = async () => {
    try {
      await projectStore.fetchProjects()
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
   * @description 백엔드에서 Project-Category 양방향 동기화가 자동으로 처리됨
   */
  const saveNewProject = async (formData) => {
    try {
      const response = await projectStore.createProject(formData)
      const newProject = response.data?.data || response.data || response

      await loadProjects()

      // 백엔드에서 동기화가 처리되므로 카테고리 목록도 새로고침
      await categoryStore.fetchCategories()

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

  /**
   * 카테고리와 프로젝트 목록 새로고침 (Outlook 동기화 후 호출)
   *
   * 참고: 백엔드에서 Project-Category 양방향 동기화가 자동으로 처리됩니다.
   * - Outlook 동기화 시 카테고리가 생성되면 백엔드에서 프로젝트도 자동 생성
   * - 이 함수는 단순히 프론트엔드 상태를 새로고침하는 역할만 수행
   *
   * @returns {Promise<Object>} 동기화 결과
   */
  const syncProjectsFromCategories = async () => {
    try {
      // 동기화 전 프로젝트 수 기록
      const beforeCount = projects.value.length

      // 최신 카테고리 및 프로젝트 목록 새로고침
      await categoryStore.fetchCategories()
      await loadProjects()

      // 동기화 후 프로젝트 수 비교
      const afterCount = projects.value.length
      const diff = afterCount - beforeCount

      return {
        success: true,
        created: diff > 0 ? diff : 0,
        deleted: diff < 0 ? Math.abs(diff) : 0
      }
    } catch (error) {
      console.error('Failed to sync projects from categories:', error)
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
    deleteProject,
    syncProjectsFromCategories
  }
}
