<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">프로젝트</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            프로젝트를 효율적으로 관리하세요
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto space-y-8">
        <!-- Statistics Cards -->
        <ProjectStatistics :statistics="statistics" />

        <!-- Main Content Area -->
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <!-- Toolbar -->
          <ProjectToolbar
            v-model:searchQuery="searchQuery"
            v-model:statusFilter="statusFilter"
          />

          <!-- Content Area -->
          <div class="relative">
            <!-- Projects Grid -->
            <ProjectGrid
              v-if="!loading && filteredProjects.length > 0"
              :projects="filteredProjects"
              :openDropdownId="openDropdownId"
              @view="viewProjectDetail"
              @edit="editProject"
              @archive="archiveProject"
              @unarchive="unarchiveProject"
              @delete="confirmDeleteProject"
              @toggle-dropdown="toggleDropdown"
              :getStatusText="getStatusText"
              :formatDate="formatDate"
            />

            <!-- Loading State -->
            <div v-if="loading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm font-medium text-gray-500">Loading projects...</p>
              </div>
            </div>

            <!-- Empty State -->
            <ProjectEmptyState
              v-if="!loading && filteredProjects.length === 0"
              :hasFilters="!!searchQuery || statusFilter !== 'ALL'"
              @create="openCreateModal"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Project Detail Modal -->
    <ProjectDetailModal
      :show="showDetailModal"
      :project="selectedProject || {}"
      :allDocuments="allDocuments"
      @close="closeDetailModal"
      @edit="editFromDetail"
    />

    <!-- Create/Edit Modal -->
    <ProjectFormModal
      :show="showModal"
      :isEditing="isEditing"
      :formData="formData"
      :documentSearchQuery="documentSearchQuery"
      :filteredDocuments="filteredDocuments"
      @close="closeModal"
      @save="saveProject"
      @update:formData="formData = $event"
      @update:documentSearchQuery="documentSearchQuery = $event"
      @toggle-document="toggleDocumentSelection"
      @clear-documents="clearDocumentSelection"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog
      v-if="showConfirmDialog"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :type="confirmDialog.type"
      :confirmText="confirmDialog.confirmText"
      @confirm="confirmDialog.onConfirm"
      @cancel="closeConfirmDialog"
    />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useProjectPage } from '@/composables/management/useProjectPage'

// Components
import ProjectDetailModal from '@/components/ProjectDetailModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import ProjectFormModal from '@/components/management/project/ProjectFormModal.vue'

// Page-specific Components
import ProjectStatistics from './components/ProjectStatistics.vue'
import ProjectToolbar from './components/ProjectToolbar.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import ProjectEmptyState from './components/ProjectEmptyState.vue'

// Use composable for all business logic
const {
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

  // Computed
  statistics,
  filteredProjects,
  filteredDocuments,

  // Modal Management
  openCreateModal,
  editProject,
  editFromDetail,
  closeModal,

  // CRUD Operations
  saveProject,
  confirmDeleteProject,
  archiveProject,
  unarchiveProject,

  // Detail Modal
  viewProjectDetail,
  closeDetailModal,
  closeConfirmDialog,

  // Dropdown Management
  toggleDropdown,

  // Document Selection
  toggleDocumentSelection,
  clearDocumentSelection,

  // Utility Functions
  getStatusText,
  formatDate,

  // Lifecycle
  initializePage,
  cleanupPage
} = useProjectPage()

// ============================================
// Lifecycle
// ============================================
onMounted(() => {
  initializePage()
})

onUnmounted(() => {
  cleanupPage()
})
</script>
