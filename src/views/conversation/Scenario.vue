<template>
  <div class="h-full flex flex-col relative">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-gray-900">실무 시나리오 회화연습</h1>
            <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              {{ activeTab === 'my' ? scenarios.length : filteredBusinessTemplates.length }}
            </span>
          </div>
          <p class="text-sm text-gray-500 font-medium mt-0.5">
            비즈니스 상황별 시나리오로 회화를 연습하세요
          </p>
        </div>
        <button
          v-if="activeTab === 'my'"
          @click="showCreateDialog = true"
          class="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          시나리오 생성
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden bg-gray-50/50">
      <!-- Left Sidebar (Conditional) -->
      <div class="hidden md:flex flex-col h-full w-1/5 min-w-[220px] max-w-[320px] flex-shrink-0 bg-white rounded-2xl border border-gray-100 overflow-hidden m-4 mr-0">
        <!-- Tab Navigation (Above Sidebar) -->
        <div class="flex-shrink-0 p-4 border-b border-gray-100">
          <div class="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              @click="activeTab = 'my'"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
              :class="activeTab === 'my'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
            >
              <div class="flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>내 시나리오</span>
              </div>
            </button>
            <button
              @click="activeTab = 'business'"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
              :class="activeTab === 'business'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
            >
              <div class="flex flex-col items-center justify-center gap-0.5">
                <span>상황별</span>
                <span>회화연습</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Sidebar Content -->
        <div class="flex-1 overflow-hidden">
          <!-- My Scenarios: Project Sidebar -->
          <ScenarioProjectSidebar
            v-if="activeTab === 'my'"
            :projects="projects"
            :selected-projects="selectedProjects"
            :selected-schedules="selectedSchedules"
            :upcoming-schedules="upcomingSchedules"
            :projects-loading="projectsLoading"
            :schedules-loading="schedulesLoading"
            :scenarios="allScenarios"
            @toggle-project="toggleProjectSelection"
            @toggle-schedule="toggleScheduleSelection"
            @show-all="showAllScenarios"
          />
          <!-- Business Templates: Category Sidebar -->
          <BusinessCategorySidebar
            v-else
            :selected-category="selectedCategory"
            :selected-difficulty="selectedDifficulty"
            :total-templates="businessTemplates.length"
            @select-category="selectCategory"
            @select-difficulty="selectDifficulty"
            @show-all="showAllTemplates"
          />
        </div>
      </div>

      <!-- Right Content -->
      <div class="flex-1 md:overflow-y-auto overflow-hidden p-4 md:p-8 w-full relative">
        <!-- Mobile Tab & Filter Selector -->
        <div class="mb-6 relative z-30 md:hidden">
          <button
            @click="mobileShowFilter = !mobileShowFilter"
            class="flex items-center gap-2 text-lg font-bold text-gray-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
          >
            <span>{{ mobileFilterLabel }}</span>
            <ChevronDownIcon class="w-5 h-5 text-gray-500 transition-transform duration-200"
              :class="{ 'rotate-180': mobileShowFilter }" />
          </button>

          <!-- Mobile Filter Dropdown -->
          <div
            v-if="mobileShowFilter"
            class="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown"
          >
            <!-- Tab Switch -->
            <div class="p-3 border-b border-gray-100">
              <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  @click="activeTab = 'my'; mobileShowFilter = false"
                  class="flex-1 py-2 rounded-md text-sm font-bold transition-all"
                  :class="activeTab === 'my' ? 'bg-white shadow-sm' : 'text-gray-500'"
                >
                  내 시나리오
                </button>
                <button
                  @click="activeTab = 'business'; mobileShowFilter = false"
                  class="flex-1 py-2 rounded-md text-sm font-bold transition-all"
                  :class="activeTab === 'business' ? 'bg-white shadow-sm' : 'text-gray-500'"
                >
                  템플릿
                </button>
              </div>
            </div>

            <!-- Filter Options -->
            <div class="p-2 max-h-60 overflow-y-auto">
              <template v-if="activeTab === 'my'">
                <button
                  @click="selectedProjects = []; mobileShowFilter = false; loadScenariosForFilters()"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedProjects.length === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
                >
                  전체 프로젝트
                </button>
                <button
                  v-for="project in projects"
                  :key="project.id"
                  @click="toggleProjectSelection(project); mobileShowFilter = false"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="selectedProjects.find(p => p.id === project.id)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'"
                >
                  {{ project.name }}
                </button>
              </template>
              <template v-else>
                <button
                  @click="showAllTemplates(); mobileShowFilter = false"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                  :class="!selectedCategory ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
                >
                  전체 템플릿
                </button>
                <button
                  v-for="category in BUSINESS_CATEGORIES"
                  :key="category.id"
                  @click="selectCategory(category.id); mobileShowFilter = false"
                  class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  :class="selectedCategory === category.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'"
                >
                  <component :is="getCategoryIcon(category.icon)" class="w-4 h-4" />
                  <span>{{ category.name }}</span>
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <!-- My Scenarios Tab Content -->
        <template v-else-if="activeTab === 'my'">
          <template v-if="scenarios.length > 0">
            <!-- Desktop Grid View -->
            <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              <ScenarioCard
                v-for="scenario in scenarios"
                :key="scenario.id"
                :scenario="scenario"
                :projects="projects"
                :schedules="upcomingSchedules"
                @edit="openEditDialog"
                @delete="deleteScenario"
                @start="startPractice"
              />
            </div>

            <!-- Mobile Swiper View -->
            <div class="md:hidden h-full flex flex-col justify-center pb-10">
              <div class="flex-1 flex flex-col justify-center">
                <swiper
                  :effect="'cards'"
                  :grabCursor="true"
                  :modules="modules"
                  class="w-full max-w-sm mx-auto"
                  :cardsEffect="{
                    perSlideOffset: 1,
                    perSlideRotate: 2,
                    rotate: true,
                    slideShadows: true,
                  }"
                >
                  <swiper-slide v-for="scenario in scenarios" :key="scenario.id" class="rounded-3xl">
                    <ScenarioCard
                      :scenario="scenario"
                      :projects="projects"
                      :schedules="upcomingSchedules"
                      @edit="openEditDialog"
                      @delete="deleteScenario"
                      @start="startPractice"
                      class="h-[55vh] shadow-xl"
                    />
                  </swiper-slide>
                </swiper>
              </div>
            </div>
          </template>

          <!-- Empty State -->
          <ScenarioEmptyState v-else @create="showCreateDialog = true" />
        </template>

        <!-- Business Templates Tab Content -->
        <template v-else-if="activeTab === 'business'">
          <template v-if="filteredBusinessTemplates.length > 0">
            <!-- Desktop Grid View -->
            <div class="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
              <BusinessScenarioCard
                v-for="template in filteredBusinessTemplates"
                :key="template.id"
                :scenario="template"
                @start="startBusinessPractice"
                @copy="copyToMyScenarios"
              />
            </div>

            <!-- Mobile Swiper View -->
            <div class="md:hidden h-full flex flex-col justify-center pb-10">
              <div class="flex-1 flex flex-col justify-center">
                <swiper
                  :effect="'cards'"
                  :grabCursor="true"
                  :modules="modules"
                  class="w-full max-w-sm mx-auto"
                  :cardsEffect="{
                    perSlideOffset: 1,
                    perSlideRotate: 2,
                    rotate: true,
                    slideShadows: true,
                  }"
                >
                  <swiper-slide v-for="template in filteredBusinessTemplates" :key="template.id" class="rounded-3xl">
                    <BusinessScenarioCard
                      :scenario="template"
                      @start="startBusinessPractice"
                      @copy="copyToMyScenarios"
                      class="h-[55vh] shadow-xl"
                    />
                  </swiper-slide>
                </swiper>
              </div>
            </div>
          </template>

          <!-- Empty State for Business Templates -->
          <div v-else class="flex flex-col items-center justify-center h-64 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">템플릿이 없습니다</h3>
            <p class="text-sm text-gray-500">선택한 필터에 맞는 템플릿이 없습니다.</p>
            <button
              @click="showAllTemplates"
              class="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              전체 템플릿 보기
            </button>
          </div>
        </template>
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

    <!-- Copy Confirmation Toast -->
    <Transition name="toast">
      <div
        v-if="showCopyToast"
        class="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-gray-900 text-white rounded-xl shadow-xl flex items-center gap-3 z-50"
      >
        <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <span class="font-medium">내 시나리오로 복사되었습니다!</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { projectService } from '@/services/projectService'
import { scenarioService } from '@/services/scenarioService'
import {
  ChevronDownIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

// Swiper
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'

// Components
import ScenarioProjectSidebar from '@/components/conversation/ScenarioProjectSidebar.vue'
import BusinessCategorySidebar from '@/components/conversation/BusinessCategorySidebar.vue'
import ScenarioCard from '@/components/conversation/ScenarioCard.vue'
import BusinessScenarioCard from '@/components/conversation/BusinessScenarioCard.vue'
import ScenarioEmptyState from '@/components/conversation/ScenarioEmptyState.vue'
import ScenarioCreateDialog from '@/components/conversation/ScenarioCreateDialog.vue'
import ScenarioEditDialog from '@/components/conversation/ScenarioEditDialog.vue'

// Business Templates Data
import { BUSINESS_CATEGORIES, BUSINESS_SCENARIO_TEMPLATES } from '@/data/businessScenarioTemplates'

const router = useRouter()
const route = useRoute()
const modules = [EffectCards]

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

// ============================================
// UI State
// ============================================
const mobileShowFilter = ref(false)
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingScenario = ref({})
const showCopyToast = ref(false)

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

/**
 * 카테고리 아이콘 컴포넌트 매핑
 */
const iconComponents = {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon
}

/**
 * 카테고리 아이콘 컴포넌트 반환
 */
const getCategoryIcon = (iconName) => {
  return iconComponents[iconName] || Squares2X2Icon
}

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
  // Create a temporary scenario from template and start practice
  try {
    const scenarioData = {
      title: template.title,
      description: template.description,
      language: template.language,
      difficulty: template.difficulty,
      roles: template.roles,
      systemPrompt: template.systemPrompt,
      requiredTerms: template.requiredTerms || [],
      projectIds: [],
      scheduleIds: [],
      isTemplate: true
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

    // Show toast notification
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

    for (const project of projects.value) {
      try {
        const response = await projectService.getProjectSchedules(project.id)
        const schedules = response.data.data || response.data || []

        schedules.forEach(schedule => {
          allSchedules.push({
            ...schedule,
            projectId: project.id,
            projectName: project.name
          })
        })
      } catch (error) {
        console.error(`Failed to load schedules for project ${project.id}:`, error)
      }
    }

    upcomingSchedules.value = allSchedules.sort((a, b) =>
      new Date(b.startTime) - new Date(a.startTime)
    )
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
// Lifecycle
// ============================================
onMounted(async () => {
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
})
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out forwards;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
