<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">문서 관리</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            파일을 관리하고 정리하세요
          </p>
        </div>
        <button
          @click="toggleUploadSection"
          class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {{ isUploadCollapsed ? '파일 업로드' : '닫기' }}
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto space-y-8">

        <!-- Upload Zone (Collapsible) -->
        <div
          v-show="!isUploadCollapsed"
          class="bg-white rounded-2xl border border-dashed border-blue-200 p-8 transition-all duration-300"
        >
          <DocumentUploadZone
            :is-collapsed="false"
            @upload-start="handleUploadStart"
            @upload-complete="handleUploadComplete"
            @upload-error="handleUploadError"
          />
        </div>

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">전체 파일</p>
              <p class="text-3xl font-bold text-gray-900">{{ totalDocuments }}</p>
            </div>
            <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-600 group-hover:bg-gray-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">전체 용량</p>
              <p class="text-3xl font-bold text-gray-900">{{ formatFileSize(totalSize) }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>

          <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between group hover:shadow-md transition-all">
            <div>
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">최근 업로드</p>
              <p class="text-3xl font-bold text-gray-900">{{ formatDate(recentUploadDate) }}</p>
            </div>
            <div class="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-100 transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                  placeholder="문서 검색..."
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- File Type Filter -->
              <div class="relative">
                <select
                  v-model="filterFileType"
                  class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
                >
                  <option value="">전체 유형</option>
                  <option value="PDF">PDF</option>
                  <option value="DOCX">Word</option>
                  <option value="XLSX">Excel</option>
                  <option value="IMAGE">이미지</option>
                </select>
                <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- Sort -->
              <div class="relative">
                <select
                  v-model="sortOption"
                  class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
                >
                  <option value="uploadDate:desc">최신순</option>
                  <option value="uploadDate:asc">오래된순</option>
                  <option value="originalFilename:asc">이름순</option>
                  <option value="fileSize:desc">크기순</option>
                </select>
                <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <!-- View Toggle -->
              <div class="flex bg-gray-50 rounded-lg p-1">
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'p-2 rounded-lg transition-all',
                    viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  @click="viewMode = 'list'"
                  :class="[
                    'p-2 rounded-lg transition-all',
                    viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  ]"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Content Area -->
          <div class="relative">
            <!-- Loading Overlay -->
            <div v-if="loading && documents.length === 0" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm font-medium text-gray-500">문서 불러오는 중...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && documents.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">문서가 없습니다</h3>
              <p class="text-sm text-gray-500 mb-6">첫 번째 문서를 업로드하여 시작하세요.</p>
              <button
                @click="scrollToUpload"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                문서 업로드
              </button>
            </div>

            <!-- Documents Grid -->
            <div v-else-if="viewMode === 'grid'" class="p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="group bg-gray-50 rounded-2xl p-4 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer relative flex flex-col"
                  @click="openDocumentDetail(doc)"
                >
                  <!-- Icon / Preview -->
                  <div class="aspect-[4/3] bg-white rounded-xl mb-4 flex items-center justify-center relative overflow-hidden border border-gray-100 group-hover:border-blue-100 transition-colors">
                    <div class="text-4xl">
                      {{ getFileIcon(doc.fileType) }}
                    </div>
                    <!-- Hover Actions -->
                    <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        @click.stop="downloadDocument(doc)"
                        class="p-2 bg-white rounded-full shadow-sm hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Download"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                      <button
                        @click.stop="confirmDelete(doc)"
                        class="p-2 bg-white rounded-full shadow-sm hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Info -->
                  <div class="flex-1">
                    <h3 class="text-sm font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {{ doc.originalFilename }}
                    </h3>
                    <div class="flex justify-between items-center text-xs text-gray-500">
                      <span>{{ formatFileSize(doc.fileSize) }}</span>
                      <span>{{ formatDate(doc.uploadDate) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Documents List/Table -->
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-12">유형</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">파일명</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">크기</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">날짜</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="doc in documents"
                    :key="doc.id"
                    class="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                    @click="openDocumentDetail(doc)"
                  >
                    <td class="px-6 py-4 text-2xl">{{ getFileIcon(doc.fileType) }}</td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {{ doc.originalFilename }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-600">{{ formatFileSize(doc.fileSize) }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-500">{{ formatDate(doc.uploadDate) }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          @click.stop="downloadDocument(doc)"
                          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          @click.stop="confirmDelete(doc)"
                          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

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
        :message="`'${documentToDelete.originalFilename}' 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`"
        type="danger"
        confirmText="삭제"
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

import DocumentUploadZone from './components/DocumentUploadZone.vue';
import DocumentDetailModal from './components/DocumentDetailModal.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

const documentStore = useDocumentStore();
const toast = useToast();

// State
const isUploadCollapsed = ref(true);
const searchQuery = ref('');
const filterFileType = ref('');
const filterStatus = ref('');
const sortOption = ref('uploadDate:desc');
const viewMode = ref('list'); // Default to list view
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
  toast.success('문서가 업로드되었습니다');

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
    toast.error('문서를 불러오는데 실패했습니다');
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
  isUploadCollapsed.value = false;
};

const getFileIcon = (fileType) => {
  if (!fileType) return '📄';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('doc')) return '📘';
  if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📗';
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️';
  if (type.includes('zip') || type.includes('rar')) return '📦';
  return '📄';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
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

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
