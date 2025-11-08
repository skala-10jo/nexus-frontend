<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">프로젝트 관리</h1>
      <button
        @click="openCreateModal"
        class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        새 프로젝트
      </button>
    </div>

    <!-- Projects Grid -->
    <div v-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="project in projects"
        :key="project.id"
        class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
        @click="viewProject(project)"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-xl font-semibold text-gray-800">{{ project.name }}</h3>
          <span
            class="px-3 py-1 text-xs rounded-full"
            :class="getStatusClass(project.status)"
          >
            {{ getStatusText(project.status) }}
          </span>
        </div>

        <p class="text-gray-600 text-sm mb-4 line-clamp-2">
          {{ project.description || '설명 없음' }}
        </p>

        <div class="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ project.documentCount }}개 문서</span>
          </div>
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{{ project.termCount }}개 용어</span>
          </div>
        </div>

        <div class="text-xs text-gray-400">
          {{ formatDate(project.createdAt) }}
        </div>

        <div class="mt-4 flex gap-2">
          <button
            @click.stop="editProject(project)"
            class="flex-1 px-4 py-2 text-sm border border-orange-primary text-orange-primary rounded-lg hover:bg-orange-50 transition"
          >
            편집
          </button>
          <button
            @click.stop="deleteProject(project)"
            class="px-4 py-2 text-sm border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition"
          >
            삭제
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white rounded-lg shadow-md p-12 text-center">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
      <p class="text-gray-500 text-lg mb-2">아직 프로젝트가 없습니다</p>
      <p class="text-gray-400 text-sm mb-4">첫 프로젝트를 생성하여 시작하세요!</p>
      <button
        @click="openCreateModal"
        class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition"
      >
        프로젝트 생성
      </button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">
            {{ isEditing ? '프로젝트 수정' : '새 프로젝트 생성' }}
          </h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6">
          <!-- Project Info -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">프로젝트 정보</h3>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 이름 *</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                placeholder="프로젝트 이름을 입력하세요"
                required
              />
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 설명</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
                placeholder="프로젝트에 대한 설명을 입력하세요"
              ></textarea>
            </div>
          </div>

          <!-- Document Selection -->
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">관련 문서 선택</h3>

            <div v-if="allDocuments.length > 0" class="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
              <div
                v-for="doc in allDocuments"
                :key="doc.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0"
              >
                <input
                  type="checkbox"
                  :value="doc.id"
                  v-model="formData.documentIds"
                  class="w-4 h-4 text-orange-primary border-gray-300 rounded focus:ring-orange-primary"
                />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-800">{{ doc.originalFilename }}</p>
                  <p class="text-xs text-gray-500">
                    {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }} · {{ formatDate(doc.uploadDate) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-500">
              <p>업로드된 문서가 없습니다</p>
            </div>

            <p class="text-sm text-gray-500 mt-2">
              선택된 문서: {{ formData.documentIds.length }}개
            </p>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 justify-end pt-4 border-t">
            <button
              @click="closeModal"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              취소
            </button>
            <button
              @click="saveProject"
              class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition"
              :disabled="!formData.name"
            >
              {{ isEditing ? '수정' : '생성' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { projectService } from '@/services/projectService'
import { documentService } from '@/services/documentService'

const projects = ref([])
const allDocuments = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const formData = ref({
  name: '',
  description: '',
  documentIds: []
})
const currentProjectId = ref(null)

onMounted(() => {
  loadProjects()
  loadDocuments()
})

async function loadProjects() {
  try {
    const response = await projectService.getAll()
    projects.value = response.data.data || response.data || response
  } catch (error) {
    console.error('Failed to load projects:', error)
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
  showModal.value = true
}

function editProject(project) {
  isEditing.value = true
  formData.value = {
    name: project.name,
    description: project.description || '',
    documentIds: [] // Will be loaded from project details if needed
  }
  currentProjectId.value = project.id
  showModal.value = true
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
}

async function saveProject() {
  try {
    if (isEditing.value) {
      await projectService.update(currentProjectId.value, formData.value)
    } else {
      await projectService.create(formData.value)
    }
    closeModal()
    loadProjects()
  } catch (error) {
    console.error('Failed to save project:', error)
    alert('프로젝트 저장에 실패했습니다.')
  }
}

async function deleteProject(project) {
  if (confirm(`정말로 "${project.name}" 프로젝트를 삭제하시겠습니까?`)) {
    try {
      await projectService.delete(project.id)
      loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('프로젝트 삭제에 실패했습니다.')
    }
  }
}

function viewProject(project) {
  // TODO: Navigate to project detail page
  console.log('View project:', project)
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
