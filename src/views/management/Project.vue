<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- Header Section -->
    <div class="mb-8">
      <!-- Title and Create Button -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-800">프로젝트 관리</h1>
        <button
          @click="openCreateModal"
          class="px-6 py-2.5 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span class="font-medium">새 프로젝트</span>
        </button>
      </div>

      <!-- Search and Filter Bar -->
      <div class="flex flex-col sm:flex-row gap-4 mb-4">
        <!-- Search Input -->
        <div class="flex-1 relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="프로젝트 이름으로 검색..."
            class="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all"
          />
        </div>

        <!-- Filter Dropdown -->
        <select
          v-model="statusFilter"
          class="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all bg-white"
        >
          <option value="ALL">전체 상태</option>
          <option value="ACTIVE">활성</option>
          <option value="ARCHIVED">보관됨</option>
        </select>
      </div>

      <!-- Statistics -->
      <div class="flex flex-wrap gap-4 text-sm">
        <div class="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
          <span class="font-medium text-gray-600">전체</span>
          <span class="font-bold text-gray-900">{{ statistics.total }}</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
          <span class="font-medium text-green-700">활성</span>
          <span class="font-bold text-green-900">{{ statistics.active }}</span>
        </div>
        <div class="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
          <span class="font-medium text-gray-600">보관</span>
          <span class="font-bold text-gray-700">{{ statistics.archived }}</span>
        </div>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-if="!loading && filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group relative overflow-hidden"
      >
        <!-- Card Content (Clickable) -->
        <div @click="viewProjectDetail(project)" class="p-6">
          <!-- Header with Status and Dropdown -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1 pr-2">
              <h3 class="text-xl font-semibold text-gray-800 mb-2 group-hover:text-orange-primary transition-colors line-clamp-1">
                {{ project.name }}
              </h3>
              <span
                :class="[
                  'inline-block px-3 py-1 text-xs font-medium rounded-full',
                  getStatusClass(project.status)
                ]"
              >
                {{ getStatusText(project.status) }}
              </span>
            </div>

            <!-- Dropdown Menu -->
            <div class="relative" @click.stop>
              <button
                @click="toggleDropdown(project.id)"
                class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="메뉴"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>

              <!-- Dropdown Content -->
              <Transition name="dropdown">
                <div
                  v-if="openDropdownId === project.id"
                  class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10"
                >
                  <button
                    @click="editProject(project)"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    편집
                  </button>
                  <button
                    v-if="project.status === 'ACTIVE'"
                    @click="archiveProject(project)"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    보관하기
                  </button>
                  <button
                    v-else-if="project.status === 'ARCHIVED'"
                    @click="unarchiveProject(project)"
                    class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    복원하기
                  </button>
                  <hr class="my-1">
                  <button
                    @click="confirmDeleteProject(project)"
                    class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    삭제
                  </button>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
            {{ project.description || '설명 없음' }}
          </p>

          <!-- Metrics -->
          <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{{ project.documentCount || 0 }}개 문서</span>
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>{{ project.termCount || 0 }}개 용어</span>
            </div>
          </div>

          <!-- Date -->
          <div class="text-xs text-gray-400">
            {{ formatDate(project.createdAt) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 6" :key="i" class="bg-white rounded-xl shadow-md p-6 animate-pulse">
        <div class="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div class="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div class="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div class="flex gap-4">
          <div class="h-4 bg-gray-200 rounded w-20"></div>
          <div class="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredProjects.length === 0" class="bg-white rounded-xl shadow-md p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <p class="text-gray-500 text-lg mb-2">
        {{ searchQuery || statusFilter !== 'ALL' ? '검색 결과가 없습니다' : '아직 프로젝트가 없습니다' }}
      </p>
      <p class="text-gray-400 text-sm mb-4">
        {{ searchQuery || statusFilter !== 'ALL' ? '다른 검색어나 필터를 시도해보세요.' : '첫 프로젝트를 생성하여 시작하세요!' }}
      </p>
      <button
        v-if="!searchQuery && statusFilter === 'ALL'"
        @click="openCreateModal"
        class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition-colors"
      >
        프로젝트 생성
      </button>
    </div>

    <!-- Project Detail Modal -->
    <ProjectDetailModal
      :show="showDetailModal"
      :project="selectedProject || {}"
      @close="closeDetailModal"
      @edit="editFromDetail"
    />

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeModal">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEditing ? '프로젝트 수정' : '새 프로젝트 생성' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <!-- Project Info -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              프로젝트 정보
            </h3>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 이름 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all"
                placeholder="프로젝트 이름을 입력하세요"
                required
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 설명</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent transition-all resize-none"
                placeholder="프로젝트에 대한 설명을 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- Document Selection -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              관련 문서 선택
            </h3>

            <!-- Document Search -->
            <div class="relative mb-3">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                v-model="documentSearchQuery"
                type="text"
                placeholder="문서 이름으로 검색..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>

            <!-- Document List -->
            <div v-if="filteredDocuments.length > 0" class="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              <div
                v-for="doc in filteredDocuments"
                :key="doc.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 transition-colors"
              >
                <input
                  type="checkbox"
                  :value="doc.id"
                  v-model="formData.documentIds"
                  class="w-4 h-4 text-orange-primary border-gray-300 rounded focus:ring-orange-primary cursor-pointer"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ doc.originalFilename }}</p>
                  <p class="text-xs text-gray-500">
                    {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.uploadDate) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <svg class="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p class="text-gray-500 text-sm">
                {{ documentSearchQuery ? '검색 결과가 없습니다' : '업로드된 문서가 없습니다' }}
              </p>
            </div>

            <!-- Selected Documents Tags -->
            <div v-if="formData.documentIds.length > 0" class="mt-3">
              <p class="text-sm font-medium text-gray-700 mb-2">선택된 문서:</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="docId in formData.documentIds"
                  :key="docId"
                  class="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                >
                  {{ getDocumentName(docId) }}
                  <button
                    @click="removeDocument(docId)"
                    class="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </div>
            </div>

            <p class="text-sm text-gray-500 mt-2">
              선택된 문서: {{ formData.documentIds.length }}개
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <button
              @click="closeModal"
              class="px-6 py-2.5 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              @click="saveProject"
              class="px-6 py-2.5 text-sm font-medium bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="!formData.name"
            >
              {{ isEditing ? '수정' : '생성' }}
            </button>
          </div>
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
  confirmText: '확인',
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
    toast.error('프로젝트 목록을 불러오는데 실패했습니다.')
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

  // 프로젝트 상세 정보를 조회하여 연결된 문서 ID 가져오기
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
    // 실패 시 기본값 사용
    formData.value = {
      name: project.name,
      description: project.description || '',
      documentIds: []
    }
    toast.warning('프로젝트 문서 정보를 불러오지 못했습니다.')
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
    toast.warning('프로젝트 이름을 입력해주세요.')
    return
  }

  try {
    if (isEditing.value) {
      await projectService.update(currentProjectId.value, formData.value)
      toast.success('프로젝트가 수정되었습니다.')
    } else {
      await projectService.create(formData.value)
      toast.success('프로젝트가 생성되었습니다.')
    }
    closeModal()
    loadProjects()
  } catch (error) {
    console.error('Failed to save project:', error)
    toast.error('프로젝트 저장에 실패했습니다.')
  }
}

function confirmDeleteProject(project) {
  closeDropdown()
  confirmDialog.value = {
    title: '프로젝트 삭제',
    message: `"${project.name}" 프로젝트를 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`,
    type: 'danger',
    confirmText: '삭제',
    onConfirm: () => deleteProject(project)
  }
  showConfirmDialog.value = true
}

async function deleteProject(project) {
  try {
    await projectService.delete(project.id)
    toast.success('프로젝트가 삭제되었습니다.')
    loadProjects()
  } catch (error) {
    console.error('Failed to delete project:', error)
    toast.error('프로젝트 삭제에 실패했습니다.')
  } finally {
    closeConfirmDialog()
  }
}

function archiveProject(project) {
  closeDropdown()
  confirmDialog.value = {
    title: '프로젝트 보관',
    message: `"${project.name}" 프로젝트를 보관하시겠습니까?\n\n📦 보관된 프로젝트는 목록에서 숨겨집니다.`,
    type: 'warning',
    confirmText: '보관',
    onConfirm: () => updateProjectStatus(project, 'ARCHIVED', '프로젝트가 보관되었습니다.')
  }
  showConfirmDialog.value = true
}

function unarchiveProject(project) {
  closeDropdown()
  updateProjectStatus(project, 'ACTIVE', '프로젝트가 복원되었습니다.')
}

async function updateProjectStatus(project, status, successMessage) {
  try {
    await projectService.update(project.id, {
      name: project.name,
      description: project.description,
      status: status,
      documentIds: []
    })
    toast.success(successMessage)
    loadProjects()
  } catch (error) {
    console.error('Failed to update project status:', error)
    toast.error('프로젝트 상태 변경에 실패했습니다.')
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

function getDocumentName(docId) {
  const doc = allDocuments.value.find(d => d.id === docId)
  return doc ? doc.originalFilename : 'Unknown'
}

function removeDocument(docId) {
  formData.value.documentIds = formData.value.documentIds.filter(id => id !== docId)
}

function getStatusClass(status) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800'
    case 'ARCHIVED':
      return 'bg-gray-100 text-gray-800'
    case 'DELETED':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusText(status) {
  switch (status) {
    case 'ACTIVE':
      return '활성'
    case 'ARCHIVED':
      return '보관됨'
    case 'DELETED':
      return '삭제됨'
    default:
      return status
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
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
  transform: translateY(-10px);
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
</style>
