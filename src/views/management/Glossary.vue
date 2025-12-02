<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <GlossaryHeader
      :selected-count="selectedTermIds.length"
      @add-term="openAddModal"
      @bulk-delete="handleBulkDelete"
    />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col min-h-0 p-4 pb-12 gap-3 overflow-hidden">
      <!-- Document Section -->
      <GlossaryDocumentSection
        :documents="documents"
        :loading="documentLoading"
        :collapsed="isDocumentSectionCollapsed"
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
      />

      <!-- Terms Section -->
      <div class="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
        <!-- Toolbar -->
        <GlossaryTermsToolbar
          :documents="documents"
          :selected-document-id="selectedDocumentId"
          :search-query="searchQuery"
          :filter-status="filterStatus"
          :filter-verified="filterVerified"
          :loading="loading"
          @update:selected-document-id="selectedDocumentId = $event"
          @update:search-query="searchQuery = $event"
          @update:filter-status="filterStatus = $event"
          @update:filter-verified="filterVerified = $event"
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
          :current-page="pagination.page"
          :total-pages="pagination.totalPages"
          :total-elements="pagination.totalElements"
          :page-size="pagination.size"
          :displayed-pages="displayedPages"
          @go-to-page="goToPage"
        />
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
import { onMounted } from 'vue'

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

// Composables
import { useGlossaryDocument } from '@/composables/management/useGlossaryDocument'
import { useGlossaryTerms } from '@/composables/management/useGlossaryTerms'
import { useGlossaryForm } from '@/composables/management/useGlossaryForm'

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
  loadDocuments,
  toggleSection,
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
  pagination,
  extractionJob,
  isAllSelected,
  displayedPages,
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
