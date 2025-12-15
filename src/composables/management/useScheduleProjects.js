import { ref, computed } from 'vue'
import { useProjectStore } from '@/stores/projects'
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'
import { documentService } from '@/services/documentService'

/**
 * 일정 페이지 프로젝트 관리
 * @description 프로젝트 목록, 선택, CRUD 로직 관리
 */
// 프로젝트 카테고리용 색상 팔레트
const PROJECT_CATEGORY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#8B5CF6', // violet
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
]

/**
 * 사용되지 않은 색상 중 하나를 반환
 * @param {Array} existingColors - 이미 사용 중인 색상 배열
 */
function getAvailableColor(existingColors) {
  const availableColors = PROJECT_CATEGORY_COLORS.filter(
    (color) => !existingColors.includes(color)
  )
  if (availableColors.length > 0) {
    return availableColors[Math.floor(Math.random() * availableColors.length)]
  }
  // 모든 색상이 사용 중이면 랜덤 선택
  return PROJECT_CATEGORY_COLORS[Math.floor(Math.random() * PROJECT_CATEGORY_COLORS.length)]
}

export function useScheduleProjects() {
  const projectStore = useProjectStore()
  const categoryStore = useScheduleCategoryStore()

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

      // 프로젝트 생성 시 해당 이름으로 카테고리 자동 생성
      if (newProject && newProject.name) {
        await createProjectCategory(newProject.name)
      }

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
   * 프로젝트명으로 카테고리 자동 생성
   * @param {string} projectName - 프로젝트 이름
   */
  const createProjectCategory = async (projectName) => {
    try {
      // 이미 같은 이름의 카테고리가 있는지 확인
      const existingCategory = categoryStore.categories.find(
        (cat) => cat.name === projectName
      )
      if (existingCategory) {
        console.log(`Category "${projectName}" already exists, skipping creation`)
        return
      }

      // 사용 중인 색상 목록 가져오기
      const usedColors = categoryStore.categories.map((cat) => cat.color)
      const color = getAvailableColor(usedColors)

      // 카테고리 생성
      await categoryStore.createCategory({
        name: projectName,
        color: color,
        description: `프로젝트: ${projectName}`
      })

      console.log(`Category "${projectName}" created successfully`)
    } catch (error) {
      // 카테고리 생성 실패해도 프로젝트 생성은 성공으로 처리
      console.error('Failed to create project category:', error)
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
   * 카테고리 기반으로 프로젝트 자동 생성/삭제 (Outlook 동기화 후 호출)
   * - 카테고리 중 프로젝트에 없는 것들을 자동으로 프로젝트로 생성
   * - 카테고리에 없는 Outlook 동기화 프로젝트는 삭제
   * @returns {Promise<Object>} 동기화 결과
   */
  const syncProjectsFromCategories = async () => {
    try {
      // 최신 카테고리 목록 가져오기
      await categoryStore.fetchCategories()

      // 최신 프로젝트 목록 가져오기
      await loadProjects()

      const categories = categoryStore.categories
      const categoryNames = categories.map((cat) => cat.name)
      const projectNames = projects.value.map((p) => p.name)

      let createdCount = 0
      let deletedCount = 0

      // 1. 프로젝트에 없는 카테고리 → 프로젝트 생성
      const categoriesToCreate = categories.filter(
        (cat) => !projectNames.includes(cat.name)
      )

      for (const category of categoriesToCreate) {
        try {
          await projectStore.createProject({
            name: category.name,
            description: category.description || `Outlook에서 동기화된 프로젝트: ${category.name}`,
            status: 'ACTIVE',
            documentIds: []
          })
          createdCount++
          console.log(`Project "${category.name}" created from category`)
        } catch (err) {
          console.error(`Failed to create project for category "${category.name}":`, err)
        }
      }

      // 2. 카테고리에 없는 Outlook 동기화 프로젝트 → 삭제
      // (사용자가 직접 만든 프로젝트는 삭제하지 않음)
      const projectsToDelete = projects.value.filter((project) => {
        // 카테고리에 해당 이름이 없고
        const notInCategories = !categoryNames.includes(project.name)
        // Outlook에서 동기화된 프로젝트인 경우만 삭제
        const isFromOutlook = project.description?.includes('Outlook')
        return notInCategories && isFromOutlook
      })

      for (const project of projectsToDelete) {
        try {
          await projectStore.deleteProject(project.id)
          deletedCount++
          console.log(`Project "${project.name}" deleted (removed from Outlook)`)
        } catch (err) {
          console.error(`Failed to delete project "${project.name}":`, err)
        }
      }

      // 프로젝트 목록 새로고침
      await loadProjects()

      return { success: true, created: createdCount, deleted: deletedCount }
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
