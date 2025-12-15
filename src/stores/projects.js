import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectService } from '@/services/projectService'

/**
 * 프로젝트 스토어 (Setup 함수 패턴)
 *
 * CLAUDE.md 규칙 준수: defineStore(() => {...}) 형태 사용
 */
export const useProjectStore = defineStore('projects', () => {
  // ==================== State ====================
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==================== Getters ====================

  const activeProjects = computed(() => {
    return projects.value.filter(p => p.status === 'ACTIVE')
  })

  const getProjectById = (id) => {
    return projects.value.find(p => p.id === id)
  }

  // ==================== Actions ====================

  async function fetchProjects() {
    loading.value = true
    error.value = null

    try {
      const response = await projectService.getUserProjects()
      projects.value = response.data.data || response.data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getProjectDetail(projectId) {
    try {
      const response = await projectService.getProject(projectId)
      currentProject.value = response.data.data || response.data
      return currentProject.value
    } catch (err) {
      throw err
    }
  }

  async function createProject(projectData) {
    try {
      const response = await projectService.createProject(projectData)
      const newProject = response.data.data || response.data
      projects.value.unshift(newProject)
      return newProject
    } catch (err) {
      throw err
    }
  }

  async function updateProject(projectId, projectData) {
    try {
      const response = await projectService.updateProject(projectId, projectData)
      const updatedProject = response.data.data || response.data

      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }

      if (currentProject.value?.id === projectId) {
        currentProject.value = updatedProject
      }

      return updatedProject
    } catch (err) {
      throw err
    }
  }

  async function deleteProject(projectId) {
    try {
      await projectService.deleteProject(projectId)
      projects.value = projects.value.filter(p => p.id !== projectId)

      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
    } catch (err) {
      throw err
    }
  }

  function setCurrentProject(project) {
    currentProject.value = project
  }

  function clearCurrentProject() {
    currentProject.value = null
  }

  // ==================== Return ====================
  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Getters
    activeProjects,
    getProjectById,

    // Actions
    fetchProjects,
    getProjectDetail,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    clearCurrentProject
  }
})
