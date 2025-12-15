<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">문서 · 전문용어 사전</h1>
          <p class="text-sm text-gray-500 font-medium mt-0.5">
            업무 문서를 업로드하고 AI로 전문 용어를 자동 추출하세요!
          </p>
        </div>
        <GlossaryHeader
      :selected-count="selectedTermIds.length"
          @add-term="openAddModal"
        />
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-0 p-4 pb-12 gap-8 overflow-hidden">
      <!-- Document Section -->
      <GlossaryDocumentSection
        :documents="documents"
        :loading="documentLoading"
        :collapsed="isDocumentSectionCollapsed"
        :current-page="docPagination.page"
        :total-pages="docPagination.totalPages"
        :page-size="docPagination.size"
        :displayed-pages="docDisplayedPages"
        :selected-ids="selectedDocumentIds"
        :is-all-selected="isAllDocumentsSelected"
        :get-file-icon="getFileIcon"
        :get-doc-status-class="getDocStatusClass"
        :get-doc-status-text="getDocStatusText"
        :format-file-size="formatFileSize"
        :format-date="formatDate"
        @toggle="toggleSection"
        @upload="showUploadModal = true"
        @extract="extractTermsFromDocument"
        @download="downloadDocument"
        @delete="confirmDeleteDocument"
        @change-page="changePage"
        @change-size="changePageSize"
        @toggle-select="toggleSelectDocument"
        @toggle-select-all="toggleSelectAllDocuments"
        @bulk-delete="handleBulkDeleteDocuments"
        @extract-selected="handleExtractSelectedDocuments"
      />

      <!-- Terms Section -->
      <div 
        class="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden transition-all duration-300 ease-in-out" 
        :class="isTermsSectionCollapsed ? 'flex-shrink-0' : 'flex-1 min-h-0'"
      >
        <!-- Section Header -->
        <div 
          class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
          :class="{ 'border-b border-gray-100': !isTermsSectionCollapsed }"
          @click="isTermsSectionCollapsed = !isTermsSectionCollapsed"
        >
          <div class="flex items-center gap-2">
            <BookOpenIcon class="w-4 h-4 text-blue-500" />
            <h2 class="text-sm font-bold text-gray-900">전문용어 사전</h2>
            <span class="text-xs text-gray-400 font-medium">({{ termPagination.totalElements }})</span>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Bulk Delete Button -->
            <Transition name="fade">
              <button
                v-if="selectedTermIds.length > 0 && !isTermsSectionCollapsed"
                @click.stop="handleBulkDelete"
                class="flex items-center gap-1.5 px-3 py-1 hover:bg-red-50 rounded-lg text-xs font-bold transition-colors"
              >
                <span class="text-gray-900">{{ selectedTermIds.length }}개 선택</span>
                <TrashIcon class="w-4 h-4 text-red-600" />
                <span class="text-red-600">삭제</span>
              </button>
            </Transition>

            <ChevronDownIcon 
              class="w-4 h-4 text-gray-400 transition-transform duration-300"
              :class="{ 'rotate-180': isTermsSectionCollapsed }"
            />
          </div>
        </div>

        <!-- Collapsible Content -->
        <Transition name="collapse">
          <div v-show="!isTermsSectionCollapsed" class="flex-1 flex flex-col min-h-0 overflow-hidden">
            <!-- Toolbar -->
            <GlossaryTermsToolbar
              :documents="documents"
              :selected-document-id="selectedDocumentId"
              :search-query="searchQuery"
              :filter-status="filterStatus"
              :filter-verified="filterVerified"
              :loading="loading"
              :selected-languages="selectedLanguages"
              @update:selected-document-id="selectedDocumentId = $event"
              @update:search-query="searchQuery = $event"
              @update:filter-status="filterStatus = $event"
              @update:filter-verified="filterVerified = $event"
              @update:selected-languages="selectedLanguages = $event"
              @document-change="handleDocumentChange"
              @search="handleSearch"
              @refresh="refreshTerms"
            />

            <!-- Table -->
            <GlossaryTermsTable
              :terms="terms"
              :selected-ids="selectedTermIds"
              :is-all-selected="isAllSelected"
              :loading="loading"
              :get-status-label="getStatusLabel"
              :get-status-badge-class="getStatusBadgeClass"
              :visible-languages="selectedLanguages"
              @click-term="openTermDetail"
              @toggle-select="toggleSelectTerm"
              @toggle-select-all="toggleSelectAll"
              @verify="verifyTerm"
              @unverify="unverifyTerm"
              @edit="editTerm"
              @delete="confirmDeleteTerm"
              @add-term="openAddModal"
            />

            <!-- Pagination -->
            <GlossaryPagination
              :current-page="termPagination.page"
              :total-pages="termPagination.totalPages"
              :total-elements="termPagination.totalElements"
              :page-size="termPagination.size"
              :displayed-pages="termDisplayedPages"
              @go-to-page="goToPage"
            />
          </div>
        </Transition>
      </div>
    </div>

    <!-- Modals -->
    <GlossaryUploadModal
      :show="showUploadModal"
      :uploading-files="uploadingFiles"
      :is-drag-active="isDragActive"
      @close="showUploadModal = false"
      @drag-active="isDragActive = true"
      @drag-inactive="isDragActive = false"
      @drop="handleDrop"
      @file-select="handleFileSelect"
    />

    <ExtractionProgressModal
      v-if="extractionJob"
      :job="extractionJob"
      @close="handleExtractionClose"
    />

    <GlossaryFormModal
      :show="showAddTermModal || showEditDialog"
      :is-edit-mode="showEditDialog"
      :form="activeForm"
      @close="closeModal"
      @save="onSave"
      @update:form="activeForm = $event"
    />

    <GlossaryDetailModal
      :show="showTermDetail"
      :term="selectedTerm"
      :get-status-label="getStatusLabel"
      :get-status-badge-class="getStatusBadgeClass"
      @close="closeTermDetail"
      @edit="editTermFromDetail"
    />
  </div>
</template>

<script setup>
/**
 * 용어사전 페이지
 * @description 레이아웃 조립 및 컴포넌트 연결만 담당
 */
import { onMounted, ref } from 'vue'

// Components
import GlossaryHeader from '@/components/management/glossary/GlossaryHeader.vue'
import GlossaryDocumentSection from '@/components/management/glossary/GlossaryDocumentSection.vue'
import GlossaryTermsToolbar from '@/components/management/glossary/GlossaryTermsToolbar.vue'
import GlossaryTermsTable from '@/components/management/glossary/GlossaryTermsTable.vue'
import GlossaryPagination from '@/components/management/glossary/GlossaryPagination.vue'
import GlossaryUploadModal from '@/components/management/glossary/GlossaryUploadModal.vue'
import GlossaryFormModal from '@/components/management/glossary/GlossaryFormModal.vue'
import GlossaryDetailModal from '@/components/management/glossary/GlossaryDetailModal.vue'
import ExtractionProgressModal from './components/ExtractionProgressModal.vue'

// Icons
import { BookOpenIcon, ChevronDownIcon, TrashIcon } from '@heroicons/vue/24/solid'

// Composables
import { useGlossaryDocument } from '@/composables/management/useGlossaryDocument'
import { useGlossaryTerms } from '@/composables/management/useGlossaryTerms'
import { useGlossaryForm } from '@/composables/management/useGlossaryForm'

// ============================================
// State
// ============================================
const isTermsSectionCollapsed = ref(false)
const selectedLanguages = ref(['korean', 'english', 'vietnamese']) // Default visible languages

// ============================================
// Document Composable
// ============================================
const {
  documents,
  documentLoading,
  isDocumentSectionCollapsed,
  showUploadModal,
  isDragActive,
  uploadingFiles,
  pagination: docPagination,
  displayedPages: docDisplayedPages,
  selectedDocumentIds,
  isAllDocumentsSelected,
  loadDocuments,
  changePage,
  changePageSize,
  toggleSection,
  toggleSelectDocument,
  toggleSelectAllDocuments,
  handleBulkDeleteDocuments,
  handleDrop,
  handleFileSelect,
  downloadDocument,
  confirmDeleteDocument,
  getFileIcon,
  getDocStatusClass,
  getDocStatusText,
  formatFileSize,
  formatDate
} = useGlossaryDocument()

// ============================================
// Terms Composable
// ============================================
const {
  selectedDocumentId,
  searchQuery,
  filterStatus,
  filterVerified,
  selectedTermIds,
  terms,
  loading,
  pagination: termPagination,
  extractionJob,
  isAllSelected,
  displayedPages: termDisplayedPages,
  loadTerms,
  handleDocumentChange,
  handleSearch,
  refreshTerms,
  goToPage,
  extractTermsFromDocument,
  handleExtractionClose,
  verifyTerm,
  unverifyTerm,
  confirmDeleteTerm,
  toggleSelectTerm,
  toggleSelectAll,
  handleBulkDelete,
  getStatusLabel,
  getStatusBadgeClass
} = useGlossaryTerms()

// ============================================
// Form Composable
// ============================================
const {
  showAddTermModal,
  showEditDialog,
  showTermDetail,
  selectedTerm,
  activeForm,
  openAddModal,
  editTerm,
  closeModal,
  openTermDetail,
  closeTermDetail,
  editTermFromDetail,
  handleSave
} = useGlossaryForm()

// ============================================
// Event Handlers
// ============================================
const onSave = async () => {
  const success = await handleSave(loadTerms)
  if (success) {
    await loadTerms()
  }
}

/**
 * 선택된 문서에서 용어 추출
 */
const handleExtractSelectedDocuments = async () => {
  if (selectedDocumentIds.value.length === 0) return
  
  for (const docId of selectedDocumentIds.value) {
    const doc = documents.value.find(d => d.id === docId)
    if (doc && doc.status === 'PROCESSED') {
      await extractTermsFromDocument(doc)
    }
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  try {
    await loadDocuments()
    await loadTerms()
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
})
</script>

<style scoped>
/* Collapse Animation (matching Documents section) */
.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.3s ease-in-out;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 1000px;
  opacity: 1;
}

/* Fade Animation for Buttons */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
