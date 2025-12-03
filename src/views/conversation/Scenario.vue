<template>
  <div class="h-full flex flex-col relative">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between px-8 border-b border-gray-100">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-800 font-nanum-round-eb">시나리오 회화 연습</h2>
        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ scenarios.length }}</span>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="showCreateDialog = true"
          class="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          시나리오 생성
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex pt-20 overflow-hidden">
      <!-- Left Sidebar (Filters) -->
      <ScenarioProjectSidebar
        :projects="projects"
        :selected-projects="selectedProjects"
        :selected-schedules="selectedSchedules"
        :upcoming-schedules="upcomingSchedules"
        :projects-loading="projectsLoading"
        :schedules-loading="schedulesLoading"
        :scenarios="allScenarios"
        @toggle-project="toggleProjectSelection"
        @toggle-schedule="toggleScheduleSelection"
      />

      <!-- Right Content (Scenarios Grid) -->
      <div class="flex-1 overflow-y-auto bg-white p-8">
        <!-- Loading State -->
        <div v-if="scenariosLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <!-- Scenario Grid -->
        <div v-else-if="scenarios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ScenarioCard
            v-for="scenario in scenarios"
            :key="scenario.id"
            :scenario="scenario"
            @edit="openEditDialog"
            @delete="deleteScenario"
            @start="startPractice"
          />
        </div>

        <!-- Empty State -->
        <ScenarioEmptyState v-else @create="showCreateDialog = true" />
      </div>
    </div>

    <!-- Create Dialog -->
    <ScenarioCreateDialog
      :show="showCreateDialog"
      :projects="projects"
      :upcoming-schedules="upcomingSchedules"
      @close="showCreateDialog = false"
      @created="handleCreateScenario"
    />

    <!-- Edit Dialog -->
    <ScenarioEditDialog
      :show="showEditDialog"
      :scenario="editingScenario"
      :projects="projects"
      :upcoming-schedules="upcomingSchedules"
      @close="showEditDialog = false"
      @save="handleUpdateScenario"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectService } from '@/services/projectService'
import { scenarioService } from '@/services/scenarioService'

// Components
import ScenarioProjectSidebar from '@/components/conversation/ScenarioProjectSidebar.vue'
import ScenarioCard from '@/components/conversation/ScenarioCard.vue'
import ScenarioEmptyState from '@/components/conversation/ScenarioEmptyState.vue'
import ScenarioCreateDialog from '@/components/conversation/ScenarioCreateDialog.vue'
import ScenarioEditDialog from '@/components/conversation/ScenarioEditDialog.vue'

const router = useRouter()

// State
const projects = ref([])
const upcomingSchedules = ref([])
const selectedSchedules = ref([])
const selectedProjects = ref([])
const projectsLoading = ref(false)
const schedulesLoading = ref(false)

const scenarios = ref([])
const allScenarios = ref([])
const scenariosLoading = ref(false)

// Dialog State
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingScenario = ref({})

// Methods: Selection
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

// Methods: Data Loading
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
    const response = await projectService.getAll()
    projects.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    projects.value = []
  } finally {
    projectsLoading.value = false
  }
}

async function loadAllUpcomingSchedules() {
  if (projects.value.length === 0) return

  schedulesLoading.value = true
  try {
    const allSchedules = []
    const now = new Date()

    for (const project of projects.value) {
      try {
        const response = await projectService.getProjectSchedules(project.id)
        const schedules = response.data.data || response.data || []

        schedules.forEach(schedule => {
          if (new Date(schedule.startTime) >= now) {
            allSchedules.push({
              ...schedule,
              projectId: project.id,
              projectName: project.name
            })
          }
        })
      } catch (error) {
        console.error(`Failed to load schedules for project ${project.id}:`, error)
      }
    }

    upcomingSchedules.value = allSchedules.sort((a, b) =>
      new Date(a.startTime) - new Date(b.startTime)
    )
  } catch (error) {
    console.error('Failed to load schedules:', error)
    upcomingSchedules.value = []
  } finally {
    schedulesLoading.value = false
  }
}

// Methods: CRUD Operations
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

// Lifecycle
onMounted(async () => {
  await loadProjects()
  await loadAllUpcomingSchedules()
  await loadAllScenarios()
  await loadScenariosForFilters()
})
</script>
