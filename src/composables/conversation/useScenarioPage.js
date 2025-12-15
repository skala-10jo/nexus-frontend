/**
 * useScenarioPage Composable
 *
 * Scenario.vue 페이지의 비즈니스 로직을 분리한 composable
 * - My Scenarios: 프로젝트/일정 기반 시나리오 관리
 * - Business Templates: 추천 시나리오 템플릿
 */
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projectService } from '@/services/projectService'
import { scenarioService } from '@/services/scenarioService'
import { scheduleCategoryAPI } from '@/services/api'
import { BUSINESS_CATEGORIES, BUSINESS_SCENARIO_TEMPLATES } from '@/data/businessScenarioTemplates'

export function useScenarioPage() {
  const router = useRouter()
  const route = useRoute()

  // ============================================
  // Tab State
  // ============================================
  const activeTab = ref('my') // 'my' | 'business'

  // ============================================
  // My Scenarios State
  // ============================================
  const projects = ref([])
  const upcomingSchedules = ref([])
  const selectedSchedules = ref([])
  const selectedProjects = ref([])
  const projectsLoading = ref(false)
  const schedulesLoading = ref(false)

  const scenarios = ref([])
  const allScenarios = ref([])
  const scenariosLoading = ref(false)

  // ============================================
  // Business Templates State
  // ============================================
  const businessTemplates = ref(BUSINESS_SCENARIO_TEMPLATES)
  const selectedCategory = ref(null)
  const selectedDifficulty = ref(null)

  // ============================================
  // UI State
  // ============================================
  const mobileShowFilter = ref(false)
  const showCreateDialog = ref(false)
  const showEditDialog = ref(false)
  const editingScenario = ref({})
  const showCopyToast = ref(false)

  // ============================================
  // Computed
  // ============================================
  const filteredBusinessTemplates = computed(() => {
    let filtered = [...businessTemplates.value]

    if (selectedCategory.value) {
      filtered = filtered.filter(t => t.category === selectedCategory.value)
    }

    if (selectedDifficulty.value) {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty.value)
    }

    return filtered
  })

  const isLoading = computed(() => {
    return activeTab.value === 'my' ? scenariosLoading.value : false
  })

  const mobileFilterLabel = computed(() => {
    if (activeTab.value === 'my') {
      if (selectedProjects.value.length === 0) return '전체 프로젝트'
      if (selectedProjects.value.length === 1) return selectedProjects.value[0].name
      return `${selectedProjects.value.length}개 프로젝트`
    } else {
      if (!selectedCategory.value) return '전체 템플릿'
      const cat = BUSINESS_CATEGORIES.find(c => c.id === selectedCategory.value)
      return cat ? cat.name : '전체 템플릿'
    }
  })

  // ============================================
  // Business Templates Methods
  // ============================================
  function selectCategory(categoryId) {
    selectedCategory.value = selectedCategory.value === categoryId ? null : categoryId
  }

  function selectDifficulty(difficulty) {
    selectedDifficulty.value = difficulty
  }

  function showAllTemplates() {
    selectedCategory.value = null
    selectedDifficulty.value = null
  }

  async function startBusinessPractice(template) {
    try {
      const scenarioData = {
        title: template.title,
        description: template.description,
        scenarioText: template.systemPrompt,
        category: template.category,
        roles: template.roles,
        requiredTerminology: template.requiredTerms || [],
        language: template.language?.toLowerCase() || 'en',
        difficulty: template.difficulty,
        projectId: null,
        scheduleId: null
      }

      const response = await scenarioService.create(scenarioData)
      const createdScenario = response.data.data || response.data

      router.push(`/conversation/practice/${createdScenario.id}`)
    } catch (error) {
      console.error('Failed to start business practice:', error)
      alert('시나리오 시작에 실패했습니다.')
    }
  }

  async function copyToMyScenarios(template) {
    try {
      const scenarioData = {
        title: `[복사] ${template.title}`,
        description: template.description,
        language: template.language,
        difficulty: template.difficulty,
        roles: template.roles,
        systemPrompt: template.systemPrompt,
        requiredTerms: template.requiredTerms || [],
        projectIds: [],
        scheduleIds: []
      }

      await scenarioService.create(scenarioData)
      await loadScenariosForFilters()
      await loadAllScenarios()

      showCopyToast.value = true
      setTimeout(() => {
        showCopyToast.value = false
      }, 3000)
    } catch (error) {
      console.error('Failed to copy template:', error)
      alert('시나리오 복사에 실패했습니다.')
    }
  }

  // ============================================
  // My Scenarios Methods: Selection
  // ============================================
  async function toggleScheduleSelection(schedule) {
    const index = selectedSchedules.value.findIndex(s => s.id === schedule.id)
    if (index > -1) {
      selectedSchedules.value.splice(index, 1)
    } else {
      selectedSchedules.value.push(schedule)
    }
    await loadScenariosForFilters()
  }

  async function toggleProjectSelection(project) {
    const index = selectedProjects.value.findIndex(p => p.id === project.id)
    if (index > -1) {
      selectedProjects.value.splice(index, 1)
    } else {
      selectedProjects.value.push(project)
    }

    if (selectedSchedules.value.length === 0) {
      await loadScenariosForFilters()
    }
  }

  async function showAllScenarios() {
    selectedProjects.value = []
    selectedSchedules.value = []
    await loadScenariosForFilters()
  }

  // ============================================
  // My Scenarios Methods: Data Loading
  // ============================================
  async function loadScenariosForFilters() {
    scenariosLoading.value = true
    try {
      const filters = {}

      if (selectedSchedules.value.length > 0) {
        filters.schedule_ids = selectedSchedules.value.map(s => s.id).join(',')
      } else if (selectedProjects.value.length > 0) {
        filters.project_ids = selectedProjects.value.map(p => p.id).join(',')
      }

      const response = await scenarioService.getAll(filters)
      scenarios.value = response.data.data?.scenarios || []
    } catch (error) {
      console.error('Failed to load scenarios:', error)
      scenarios.value = []
    } finally {
      scenariosLoading.value = false
    }
  }

  async function loadAllScenarios() {
    try {
      const response = await scenarioService.getAll({})
      allScenarios.value = response.data.data?.scenarios || []
    } catch (error) {
      console.error('Failed to load all scenarios:', error)
      allScenarios.value = []
    }
  }

  async function loadProjects() {
    projectsLoading.value = true
    try {
      // ScheduleCategory를 "프로젝트"로 사용
      // 일정 관리 페이지에서 카테고리로 프로젝트를 할당하기 때문
      const response = await scheduleCategoryAPI.getCategories()
      // 카테고리를 프로젝트 형태로 변환 (id, name 필드 유지)
      projects.value = (response.data || []).map(category => ({
        id: category.id,
        name: category.name,
        color: category.color,
        description: category.description || ''
      }))
    } catch (error) {
      console.error('Failed to load projects (categories):', error)
      projects.value = []
    } finally {
      projectsLoading.value = false
    }
  }

  async function loadAllUpcomingSchedules() {
    schedulesLoading.value = true
    try {
      // 모든 일정 가져오기 (프로젝트 미할당 포함)
      const response = await projectService.getAllSchedules()
      const schedules = response.data.data || response.data || []

      // 일정 데이터 정규화
      // - categories 배열에서 첫 번째 카테고리를 projectId/projectName으로 매핑
      // - 일정 관리 페이지에서 카테고리로 프로젝트를 할당하기 때문
      upcomingSchedules.value = schedules.map(schedule => {
        const firstCategory = schedule.categories?.[0] || null
        return {
          ...schedule,
          projectId: firstCategory?.id || schedule.project?.id || null,
          projectName: firstCategory?.name || schedule.project?.name || null,
          // 모든 카테고리 ID 보존 (복수 카테고리 지원)
          categoryIds: schedule.categories?.map(c => c.id) || []
        }
      }).sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    } catch (error) {
      console.error('Failed to load schedules:', error)
      upcomingSchedules.value = []
    } finally {
      schedulesLoading.value = false
    }
  }

  // ============================================
  // My Scenarios Methods: CRUD Operations
  // ============================================
  function openEditDialog(scenario) {
    editingScenario.value = scenario
    showEditDialog.value = true
  }

  async function handleCreateScenario(scenarioData) {
    scenariosLoading.value = true
    showCreateDialog.value = false

    try {
      await scenarioService.create(scenarioData)
      await loadScenariosForFilters()
      await loadAllScenarios()
    } catch (error) {
      console.error('Failed to create scenario:', error)
      alert('시나리오 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      scenariosLoading.value = false
    }
  }

  async function handleUpdateScenario(updateData) {
    scenariosLoading.value = true
    showEditDialog.value = false

    try {
      await scenarioService.update(updateData.id, updateData)
      await loadScenariosForFilters()
      await loadAllScenarios()
    } catch (error) {
      console.error('Failed to update scenario:', error)
      alert('시나리오 수정에 실패했습니다.')
    } finally {
      scenariosLoading.value = false
    }
  }

  async function deleteScenario(scenarioId) {
    if (!confirm('정말 이 시나리오를 삭제하시겠습니까?')) {
      return
    }

    try {
      scenariosLoading.value = true
      await scenarioService.delete(scenarioId)
      await loadScenariosForFilters()
      await loadAllScenarios()
    } catch (error) {
      console.error('Failed to delete scenario:', error)
      alert('시나리오 삭제에 실패했습니다.')
    } finally {
      scenariosLoading.value = false
    }
  }

  function startPractice(scenarioId) {
    router.push(`/conversation/practice/${scenarioId}`)
  }

  // ============================================
  // Initialization
  // ============================================
  async function initializePage() {
    await loadProjects()
    await loadAllUpcomingSchedules()
    await loadAllScenarios()

    // 쿼리 파라미터로 scheduleId가 전달된 경우 해당 일정 자동 선택
    const scheduleId = route.query.scheduleId
    if (scheduleId) {
      const targetSchedule = upcomingSchedules.value.find(s => String(s.id) === String(scheduleId))
      if (targetSchedule) {
        selectedSchedules.value = [targetSchedule]
      }
    }

    await loadScenariosForFilters()
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Tab State
    activeTab,

    // My Scenarios State
    projects,
    upcomingSchedules,
    selectedSchedules,
    selectedProjects,
    projectsLoading,
    schedulesLoading,
    scenarios,
    allScenarios,
    scenariosLoading,

    // Business Templates State
    businessTemplates,
    selectedCategory,
    selectedDifficulty,

    // UI State
    mobileShowFilter,
    showCreateDialog,
    showEditDialog,
    editingScenario,
    showCopyToast,

    // Computed
    filteredBusinessTemplates,
    isLoading,
    mobileFilterLabel,

    // Business Templates Methods
    selectCategory,
    selectDifficulty,
    showAllTemplates,
    startBusinessPractice,
    copyToMyScenarios,

    // My Scenarios Methods: Selection
    toggleScheduleSelection,
    toggleProjectSelection,
    showAllScenarios,

    // My Scenarios Methods: Data Loading
    loadScenariosForFilters,
    loadAllScenarios,
    loadProjects,
    loadAllUpcomingSchedules,

    // My Scenarios Methods: CRUD
    openEditDialog,
    handleCreateScenario,
    handleUpdateScenario,
    deleteScenario,
    startPractice,

    // Initialization
    initializePage,

    // Constants (re-export)
    BUSINESS_CATEGORIES
  }
}
