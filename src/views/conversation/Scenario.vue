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
              <span>내 시나리오</span>
            </button>
            <button
              @click="activeTab = 'business'"
              class="flex-1 px-4 py-2.5 rounded-lg text-sm font-bold transition-all"
              :class="activeTab === 'business'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'"
            >
              <span>추천 시나리오</span>
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
        <MobileFilterDropdown
          :active-tab="activeTab"
          :mobile-show-filter="mobileShowFilter"
          :mobile-filter-label="mobileFilterLabel"
          :projects="projects"
          :selected-projects="selectedProjects"
          :selected-category="selectedCategory"
          :business-categories="BUSINESS_CATEGORIES"
          @toggle-filter="mobileShowFilter = !mobileShowFilter"
          @set-tab="(tab) => { activeTab = tab; mobileShowFilter = false }"
          @select-all-projects="selectedProjects = []; mobileShowFilter = false; loadScenariosForFilters()"
          @toggle-project="(project) => { toggleProjectSelection(project); mobileShowFilter = false }"
          @show-all-templates="showAllTemplates(); mobileShowFilter = false"
          @select-category="(categoryId) => { selectCategory(categoryId); mobileShowFilter = false }"
        />

        <!-- Loading State -->
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <!-- My Scenarios Tab Content -->
        <template v-else-if="activeTab === 'my'">
          <template v-if="scenarios.length > 0">
            <!-- Desktop Grid View -->
            <ScenarioGridView
              class="hidden md:grid"
              :scenarios="scenarios"
              :projects="projects"
              :schedules="upcomingSchedules"
              @edit="openEditDialog"
              @delete="deleteScenario"
              @start="startPractice"
            />

            <!-- Mobile Swiper View -->
            <ScenarioSwiperView
              class="md:hidden"
              :scenarios="scenarios"
              :projects="projects"
              :schedules="upcomingSchedules"
              @edit="openEditDialog"
              @delete="deleteScenario"
              @start="startPractice"
            />
          </template>

          <!-- Empty State -->
          <ScenarioEmptyState v-else @create="showCreateDialog = true" />
        </template>

        <!-- Business Templates Tab Content -->
        <template v-else-if="activeTab === 'business'">
          <template v-if="filteredBusinessTemplates.length > 0">
            <!-- Desktop Grid View -->
            <BusinessGridView
              class="hidden md:grid"
              :templates="filteredBusinessTemplates"
              @start="startBusinessPractice"
              @copy="copyToMyScenarios"
            />

            <!-- Mobile Swiper View -->
            <BusinessSwiperView
              class="md:hidden"
              :templates="filteredBusinessTemplates"
              @start="startBusinessPractice"
              @copy="copyToMyScenarios"
            />
          </template>

          <!-- Empty State for Business Templates -->
          <BusinessEmptyState v-else @show-all="showAllTemplates" />
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
import { onMounted } from 'vue'
import { useScenarioPage } from '@/composables/conversation/useScenarioPage'

// Components - Scenario
import ScenarioProjectSidebar from '@/components/conversation/scenario/ScenarioProjectSidebar.vue'
import ScenarioEmptyState from '@/components/conversation/scenario/ScenarioEmptyState.vue'
import ScenarioCreateDialog from '@/components/conversation/scenario/ScenarioCreateDialog.vue'
import ScenarioEditDialog from '@/components/conversation/scenario/ScenarioEditDialog.vue'
import ScenarioGridView from '@/components/conversation/scenario/ScenarioGridView.vue'
import ScenarioSwiperView from '@/components/conversation/scenario/ScenarioSwiperView.vue'

// Components - Business
import BusinessCategorySidebar from '@/components/conversation/business/BusinessCategorySidebar.vue'
import BusinessGridView from '@/components/conversation/business/BusinessGridView.vue'
import BusinessSwiperView from '@/components/conversation/business/BusinessSwiperView.vue'

// Inline Components (small, page-specific)
import MobileFilterDropdown from './components/MobileFilterDropdown.vue'
import BusinessEmptyState from './components/BusinessEmptyState.vue'

// Use composable for all business logic
const {
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

  // My Scenarios Methods: CRUD
  openEditDialog,
  handleCreateScenario,
  handleUpdateScenario,
  deleteScenario,
  startPractice,

  // Initialization
  initializePage,

  // Constants
  BUSINESS_CATEGORIES
} = useScenarioPage()

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  initializePage()
})
</script>

<style scoped>
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
