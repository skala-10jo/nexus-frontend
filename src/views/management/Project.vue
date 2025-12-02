<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">Projects</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            Manage your projects and documents efficiently
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Projects</p>
              <p class="text-3xl font-bold text-gray-900">{{ statistics.total }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-gray-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active</p>
              <p class="text-3xl font-bold text-gray-900">{{ statistics.active }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Archived</p>
              <p class="text-3xl font-bold text-gray-900">{{ statistics.archived }}</p>
            </div>
            <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

          <!-- Toolbar -->
          <div class="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <!-- Search -->
              <div class="relative flex-1 max-w-md">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search projects..."
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Status Filter -->
              <div class="relative">
                <select
                  v-model="statusFilter"
                  class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
                <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="relative">
            <!-- Projects Grid -->
            <div v-if="!loading && filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="project in filteredProjects"
                :key="project.id"
                class="group bg-gray-50 rounded-2xl p-6 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer relative"
                @click="viewProjectDetail(project)"
              >
                <!-- Status Badge -->
                <div class="flex justify-between items-start mb-4">
                  <span
                    :class="[
                      'px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full uppercase tracking-wide',
                      project.status === 'ACTIVE'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    ]"
                  >
                    {{ getStatusText(project.status) }}
                  </span>

                  <!-- Menu Button -->
                  <div class="relative" @click.stop>
                    <button
                      @click="toggleDropdown(project.id)"
                      class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                      </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <Transition name="dropdown">
                      <div
                        v-if="openDropdownId === project.id"
                        class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20"
                      >
                        <button
                          @click="editProject(project)"
                          class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <button
                          v-if="project.status === 'ACTIVE'"
                          @click="archiveProject(project)"
                          class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                          Archive
                        </button>
                        <button
                          v-else-if="project.status === 'ARCHIVED'"
                          @click="unarchiveProject(project)"
                          class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          Restore
                        </button>
                        <div class="h-px bg-gray-100 my-1"></div>
                        <button
                          @click="confirmDeleteProject(project)"
                          class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </Transition>
                  </div>
                </div>

                <!-- Project Info -->
                <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {{ project.name }}
                </h3>
                <p class="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {{ project.description || 'No description provided.' }}
                </p>

                <!-- Footer Info -->
                <div class="flex items-center justify-between pt-4 border-t border-gray-200/50">
                  <div class="flex items-center gap-2 text-sm text-gray-500">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="font-medium">{{ project.documentCount || 0 }} files</span>
                  </div>
                  <span class="text-xs text-gray-400 font-medium">
                    {{ formatDate(project.createdAt) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm font-medium text-gray-500">Loading projects...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && filteredProjects.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">
                {{ searchQuery || statusFilter !== 'ALL' ? 'No projects found' : 'No projects yet' }}
              </h3>
              <p class="text-sm text-gray-500 mb-6">
                {{ searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your search or filters.' : 'Create your first project to start organizing your documents.' }}
              </p>
              <button
                v-if="!searchQuery && statusFilter === 'ALL'"
                @click="openCreateModal"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                Create Project
              </button>
            </div>
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
    <div v-if="showModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 class="text-xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Project' : 'New Project' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8 overflow-y-auto">
          <!-- Project Info -->
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
                placeholder="Enter project name"
                required
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white"
                placeholder="What is this project about?"
              ></textarea>
            </div>

            <div class="pt-4 border-t border-gray-100">
              <label class="block text-sm font-semibold text-gray-700 mb-4">Related Documents</label>
              
              <!-- Document Search -->
              <div class="relative mb-4">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="documentSearchQuery"
                  type="text"
                  placeholder="Search documents to link..."
                  class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-sm"
                />
              </div>

              <!-- Document List -->
              <div v-if="filteredDocuments.length > 0" class="border border-gray-200 rounded-xl max-h-60 overflow-y-auto scrollbar-thin">
                <div
                  v-for="doc in filteredDocuments"
                  :key="doc.id"
                  class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                  @click="toggleDocumentSelection(doc.id)"
                >
                  <div class="relative flex items-center">
                    <input
                      type="checkbox"
                      :checked="formData.documentIds.includes(doc.id)"
                      class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      @click.stop
                      @change="toggleDocumentSelection(doc.id)"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ doc.originalFilename }}</p>
                    <p class="text-xs text-gray-500">
                      {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }}
                    </p>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p class="text-gray-500 text-sm">
                  {{ documentSearchQuery ? 'No documents found' : 'No documents available' }}
                </p>
              </div>

              <!-- Selected Count -->
              <div class="mt-3 flex justify-between items-center text-sm">
                <span class="text-gray-500">{{ formData.documentIds.length }} documents selected</span>
                <button 
                  v-if="formData.documentIds.length > 0"
                  @click="formData.documentIds = []"
                  class="text-blue-600 hover:text-blue-700 font-medium text-xs"
                >
                  Clear all
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            @click="closeModal"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            @click="saveProject"
            class="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!formData.name"
          >
            {{ isEditing ? 'Save Changes' : 'Create Project' }}
          </button>
        </div>
      </div>
    </div>

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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { projectService } from '@/services/projectService'
import { documentService } from '@/services/documentService'
import { useToast } from '@/composables/useToast'
import ProjectDetailModal from '@/components/ProjectDetailModal.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const toast = useToast()

// State
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

// Computed
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

// Lifecycle
onMounted(() => {
  loadProjects()
  loadDocuments()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Methods
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

function toggleDocumentSelection(docId) {
  const index = formData.value.documentIds.indexOf(docId)
  if (index === -1) {
    formData.value.documentIds.push(docId)
  } else {
    formData.value.documentIds.splice(index, 1)
  }
}

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
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Custom Scrollbar for document list */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
