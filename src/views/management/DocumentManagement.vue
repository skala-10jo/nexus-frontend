<template>
  <div class="h-full overflow-y-auto">
    <div class="p-8">
      <!-- Header -->
      <DocumentHeader
        :total-count="totalDocuments"
        :total-size="totalSize"
        :recent-upload="recentUploadDate"
      />

      <!-- Upload Zone -->
      <DocumentUploadZone
        :is-collapsed="isUploadCollapsed"
        @toggle="toggleUploadSection"
        @upload-start="handleUploadStart"
        @upload-complete="handleUploadComplete"
        @upload-error="handleUploadError"
      />

      <!-- Toolbar -->
      <DocumentToolbar
        v-model:search="searchQuery"
        v-model:file-type="filterFileType"
        v-model:status="filterStatus"
        v-model:sort="sortOption"
        v-model:view="viewMode"
        :total-count="totalDocuments"
        @refresh="refreshDocuments"
      />

      <!-- Documents Section -->
      <div class="mt-6">
        <!-- Empty State -->
        <EmptyState
          v-if="documents.length === 0 && !loading"
          @action="scrollToUpload"
        />

        <!-- Loading State -->
        <div v-else-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <DocumentCardSkeleton v-for="i in 8" :key="i" />
        </div>

        <!-- Grid View -->
        <DocumentGrid
          v-else-if="viewMode === 'grid'"
          :documents="documents"
          @view="openDocumentDetail"
          @download="downloadDocument"
          @delete="confirmDelete"
        />

        <!-- List View -->
        <DocumentList
          v-else
          :documents="documents"
          @view="openDocumentDetail"
          @download="downloadDocument"
          @delete="confirmDelete"
        />

        <!-- Load More Trigger -->
        <div
          v-if="hasMore && !loading"
          ref="loadMoreTrigger"
          class="flex justify-center py-8"
        >
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    </div>

    <!-- Document Detail Modal -->
    <Teleport to="body">
      <DocumentDetailModal
        v-if="selectedDocument"
        :document="selectedDocument"
        @close="selectedDocument = null"
        @download="downloadDocument"
        @delete="confirmDelete"
      />
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <ConfirmDialog
        v-if="documentToDelete"
        title="문서 삭제"
        :message="`'${documentToDelete.originalFilename}'를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`"
        @confirm="handleDelete"
        @cancel="documentToDelete = null"
      />
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDocumentStore } from '@/stores/documents';
import { useIntersectionObserver } from '@/composables/useIntersectionObserver';
import { useToast } from '@/composables/useToast';

import DocumentHeader from './components/DocumentHeader.vue';
import DocumentUploadZone from './components/DocumentUploadZone.vue';
import DocumentToolbar from './components/DocumentToolbar.vue';
import DocumentGrid from './components/DocumentGrid.vue';
import DocumentList from './components/DocumentList.vue';
import DocumentDetailModal from './components/DocumentDetailModal.vue';
import EmptyState from './components/EmptyState.vue';
import DocumentCardSkeleton from './components/DocumentCardSkeleton.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const documentStore = useDocumentStore();
const toast = useToast();

// State
const isUploadCollapsed = ref(true);
const searchQuery = ref('');
const filterFileType = ref('');
const filterStatus = ref('');
const sortOption = ref('uploadDate:desc');
const viewMode = ref('list');
const selectedDocument = ref(null);
const documentToDelete = ref(null);
const loadMoreTrigger = ref(null);

// Computed
const documents = computed(() => documentStore.documents);
const loading = computed(() => documentStore.loading);
const hasMore = computed(() => documentStore.hasMore);
const totalDocuments = computed(() => documentStore.pagination.totalElements);
const totalSize = computed(() => documentStore.totalSize);
const recentUploadDate = computed(() => documentStore.recentUploadDate);

// Methods
const toggleUploadSection = () => {
  isUploadCollapsed.value = !isUploadCollapsed.value;
};

const handleUploadStart = () => {
  isUploadCollapsed.value = false;
};

const handleUploadComplete = () => {
  refreshDocuments();
  toast.success('문서가 성공적으로 업로드되었습니다');

  setTimeout(() => {
    if (documents.value.length > 5) {
      isUploadCollapsed.value = true;
    }
  }, 3000);
};

const handleUploadError = (error) => {
  toast.error(`업로드 실패: ${error.message}`);
};

const refreshDocuments = async () => {
  try {
    await documentStore.fetchDocuments({
      search: searchQuery.value,
      fileType: filterFileType.value,
      status: filterStatus.value,
      sort: sortOption.value,
    });
  } catch (error) {
    toast.error('문서 목록을 불러오는데 실패했습니다');
  }
};

const openDocumentDetail = async (document) => {
  try {
    const detail = await documentStore.getDocumentDetail(document.id);
    selectedDocument.value = detail;
  } catch (error) {
    toast.error('문서 상세 정보를 불러오는데 실패했습니다');
  }
};

const downloadDocument = async (document) => {
  try {
    await documentStore.downloadDocument(document.id, document.originalFilename);
    toast.success('다운로드가 시작되었습니다');
  } catch (error) {
    toast.error('다운로드에 실패했습니다');
  }
};

const confirmDelete = (document) => {
  documentToDelete.value = document;
};

const handleDelete = async () => {
  try {
    await documentStore.deleteDocument(documentToDelete.value.id);
    toast.success('문서가 삭제되었습니다');
    documentToDelete.value = null;
    selectedDocument.value = null;
  } catch (error) {
    toast.error('삭제에 실패했습니다');
  }
};

const scrollToUpload = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  isUploadCollapsed.value = false;
};

// Infinite scroll
useIntersectionObserver(loadMoreTrigger, ([{ isIntersecting }]) => {
  if (isIntersecting && hasMore.value && !loading.value) {
    documentStore.loadMore();
  }
});

// Watch filters
watch(
  [searchQuery, filterFileType, filterStatus, sortOption],
  () => {
    refreshDocuments();
  },
  { debounce: 300 }
);

// Initial load
onMounted(() => {
  refreshDocuments();
});
</script>
