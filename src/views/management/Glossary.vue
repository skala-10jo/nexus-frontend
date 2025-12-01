<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-4 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">전문용어사전</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">
            프로젝트 용어를 관리하고 자동으로 추출하세요
          </p>
        </div>
        <div class="flex gap-3 items-center">
          <div v-if="selectedTermIds.length > 0" class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <span class="text-sm font-bold text-gray-600">
              {{ selectedTermIds.length }} 선택됨
            </span>
            <button
              @click="handleBulkDelete"
              class="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-1"
            >
              <TrashIcon class="w-4 h-4" />
              삭제
            </button>
          </div>
          
          <button
            @click="showDocumentSelectModal = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <SparklesIcon class="w-5 h-5 text-blue-500" />
            용어 추출
          </button>
          
          <button
            @click="showAddTermModal = true"
            class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            <PlusIcon class="w-5 h-5" />
            용어 추가
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col min-h-0 px-6 pt-4 pb-12 overflow-hidden">
      <div class="w-full max-w-[98%] mx-auto flex flex-col h-full space-y-6">
        


        <!-- Main Content Area -->
        <div class="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <!-- Toolbar -->
          <div class="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <!-- Project Filter -->
              <div class="relative w-64 flex-shrink-0">
                <select
                  v-model="selectedProjectId"
                  @change="handleProjectChange"
                  class="w-full appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-gray-100"
                >
                  <option value="">전체 프로젝트</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
                <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <!-- Search -->
              <div class="relative flex-1 max-w-md">
                <input
                  v-model="searchQuery"
                  @input="handleSearch"
                  type="text"
                  placeholder="용어 검색..."
                  class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div class="flex items-center gap-3">
              <!-- Filters -->
              <div class="relative">
                <select
                  v-model="filterStatus"
                  class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
                >
                  <option value="">전체 상태</option>
                  <option value="AUTO_EXTRACTED">AI 추출</option>
                  <option value="USER_ADDED">사용자 추가</option>
                  <option value="USER_EDITED">사용자 수정</option>
                </select>
                <ChevronDownIcon class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              <div class="relative">
                <select
                  v-model="filterVerified"
                  class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
                >
                  <option value="">전체 검증</option>
                  <option value="true">검증됨</option>
                  <option value="false">미검증</option>
                </select>
                <ChevronDownIcon class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
              </div>

              <button
                @click="refreshTerms"
                class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                title="Refresh"
              >
                <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': loading }" />
              </button>
            </div>
          </div>

          <!-- Table -->
          <div class="relative flex-1 overflow-y-auto custom-scrollbar">
            <!-- Loading Overlay -->
            <div v-if="loading && terms.length === 0" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm font-medium text-gray-500">용어 불러오는 중...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="!loading && terms.length === 0" class="flex flex-col items-center justify-center py-24 text-center">
              <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <BookOpenIcon class="w-10 h-10 text-gray-300" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 mb-1">용어가 없습니다</h3>
              <p class="text-sm text-gray-500 mb-6">새 용어를 추가하거나 문서에서 추출하여 시작하세요.</p>
              <button
                @click="showAddTermModal = true"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                첫 번째 용어 추가
              </button>
            </div>

            <!-- Data Table -->
            <div v-else class="h-full">
              <table class="w-full">
                <thead class="sticky top-0 z-10 bg-gray-50 shadow-sm">
                  <tr class="border-b border-gray-100 bg-gray-50/50">
                    <th class="px-6 py-4 text-left w-12">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">한국어</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">영어</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">베트남어</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">약어</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">상태</th>
                    <th class="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">검증 여부</th>
                    <th class="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="term in terms"
                    :key="term.id"
                    class="group hover:bg-blue-50/30 transition-colors"
                    :class="{ 'bg-blue-50/50': selectedTermIds.includes(term.id) }"
                  >
                    <td class="px-6 py-4">
                      <input
                        type="checkbox"
                        :checked="selectedTermIds.includes(term.id)"
                        @change="toggleSelectTerm(term.id)"
                        class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td class="px-6 py-4">
                      <button @click="openTermDetail(term)" class="text-sm font-bold text-gray-900 hover:text-blue-600 text-left">
                        {{ term.koreanTerm }}
                      </button>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-600">{{ term.englishTerm || '-' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-600">{{ term.vietnameseTerm || '-' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-sm font-medium text-gray-500">{{ term.abbreviation || '-' }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span
                        class="px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full uppercase tracking-wide"
                        :class="getStatusBadgeClass(term.status)"
                      >
                        {{ getStatusLabel(term.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div v-if="term.isVerified" class="flex items-center gap-1.5 text-green-600">
                        <CheckCircleIcon class="w-4 h-4" />
                        <span class="text-xs font-bold">검증됨</span>
                      </div>
                      <div v-else class="flex items-center gap-1.5 text-gray-400">
                        <div class="w-4 h-4 rounded-full border-2 border-gray-300"></div>
                        <span class="text-xs font-bold">미검증</span>
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          v-if="!term.isVerified"
                          @click="verifyTerm(term)"
                          class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Verify"
                        >
                          <CheckIcon class="w-4 h-4" />
                        </button>
                        <button
                          v-else
                          @click="unverifyTerm(term)"
                          class="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Unverify"
                        >
                          <XMarkIcon class="w-4 h-4" />
                        </button>
                        <button
                          @click="editTerm(term)"
                          class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <PencilIcon class="w-4 h-4" />
                        </button>
                        <button
                          @click="confirmDeleteTerm(term)"
                          class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- Pagination -->
          <div v-if="pagination.totalPages > 1" class="px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0 flex items-center justify-between z-10">
            <p class="text-xs font-medium text-gray-500">
              전체 <span class="font-bold text-gray-900">{{ pagination.totalElements }}</span>개 중 <span class="font-bold text-gray-900">{{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }}</span>개 표시
            </p>
            <div class="flex items-center gap-2">
              <button
                @click="goToPage(pagination.page - 1)"
                :disabled="pagination.page === 0"
                class="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronLeftIcon class="w-4 h-4" />
              </button>
              <div class="flex items-center gap-1">
                <template v-for="page in displayedPages" :key="page">
                  <button
                    v-if="page !== '...'"
                    @click="goToPage(page)"
                    class="w-8 h-8 rounded-lg text-xs font-bold transition-all"
                    :class="pagination.page === page ? 'bg-black text-white shadow-md' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'"
                  >
                    {{ page + 1 }}
                  </button>
                  <span v-else class="text-gray-400 text-xs">...</span>
                </template>
              </div>
              <button
                @click="goToPage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages - 1"
                class="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              >
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <DocumentSelectModal
        v-if="showDocumentSelectModal"
        @close="showDocumentSelectModal = false"
        @select="handleDocumentSelect"
      />

      <ExtractionProgressModal
        v-if="extractionJob"
        :job="extractionJob"
        @close="handleExtractionClose"
      />

      <!-- Add/Edit Term Modal -->
      <div
        v-if="showAddTermModal || showEditDialog"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 class="text-xl font-bold text-gray-900">
              {{ showEditDialog ? '용어 수정' : '새 용어 추가' }}
            </h3>
            <button @click="closeModal" class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <div class="p-8 overflow-y-auto custom-scrollbar">
            <form @submit.prevent="handleSave" class="space-y-6">
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">한국어 용어 <span class="text-red-500">*</span></label>
                  <input
                    v-model="activeForm.koreanTerm"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. 인공지능"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">영어 용어 <span class="text-red-500">*</span></label>
                  <input
                    v-model="activeForm.englishTerm"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="e.g. Artificial Intelligence"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-6">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">베트남어</label>
                  <input
                    v-model="activeForm.vietnameseTerm"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">약어</label>
                  <input
                    v-model="activeForm.abbreviation"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">도메인</label>
                  <input
                    v-model="activeForm.domain"
                    type="text"
                    class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">정의</label>
                <textarea
                  v-model="activeForm.definition"
                  rows="3"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Enter definition..."
                ></textarea>
              </div>

              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">문맥 / 용례</label>
                <textarea
                  v-model="activeForm.context"
                  rows="2"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
            </form>
          </div>

          <div class="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button
              @click="closeModal"
              class="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button
              @click="handleSave"
              class="px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
            >
              {{ showEditDialog ? '변경사항 저장' : '용어 생성' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Term Detail Modal -->
      <div
        v-if="showTermDetail"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="closeTermDetail"
      >
        <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
          <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">{{ selectedTerm?.koreanTerm }}</h3>
              <p class="text-sm text-gray-500 font-medium mt-1">{{ selectedTerm?.englishTerm }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                :class="getStatusBadgeClass(selectedTerm?.status)"
              >
                {{ getStatusLabel(selectedTerm?.status) }}
              </span>
              <button @click="closeTermDetail" class="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <div class="p-8 space-y-6">
            <div class="grid grid-cols-2 gap-8">
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">베트남어</p>
                <p class="text-lg font-medium text-gray-900">{{ selectedTerm?.vietnameseTerm || '-' }}</p>
              </div>
              <div>
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">약어</p>
                <p class="text-lg font-medium text-gray-900">{{ selectedTerm?.abbreviation || '-' }}</p>
              </div>
            </div>

            <div v-if="selectedTerm?.definition">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">정의</p>
              <p class="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {{ selectedTerm.definition }}
              </p>
            </div>

            <div v-if="selectedTerm?.context">
              <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">문맥</p>
              <p class="text-gray-600 italic">"{{ selectedTerm.context }}"</p>
            </div>

            <div class="flex items-center justify-between pt-6 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">검증 여부:</span>
                <span v-if="selectedTerm?.isVerified" class="text-green-600 font-bold text-sm flex items-center gap-1">
                  <CheckCircleIcon class="w-4 h-4" /> 검증됨
                </span>
                <span v-else class="text-gray-400 font-bold text-sm">미검증</span>
              </div>
              
              <button
                @click="editTermFromDetail"
                class="px-6 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
              >
                용어 수정
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useGlossaryStore } from '@/stores/glossary';
import { useProjectStore } from '@/stores/projects';
import DocumentSelectModal from './components/DocumentSelectModal.vue';
import ExtractionProgressModal from './components/ExtractionProgressModal.vue';
import {
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  BookOpenIcon,
  CheckBadgeIcon,
  ExclamationCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/solid';

// Stores
const glossaryStore = useGlossaryStore();
const projectStore = useProjectStore();

// State
const selectedProjectId = ref('');
const searchQuery = ref('');
const filterStatus = ref('');
const filterVerified = ref('');
const showDocumentSelectModal = ref(false);
const showAddTermModal = ref(false);
const selectedTermIds = ref([]);

// Edit dialog state
const showEditDialog = ref(false);
const editingTermId = ref(null);
const activeForm = ref(getEmptyForm());

// Term detail modal state
const showTermDetail = ref(false);
const selectedTerm = ref(null);

// Computed
const projects = computed(() => projectStore.projects);
const allTerms = computed(() => glossaryStore.terms);
const statistics = computed(() => glossaryStore.statistics);
const loading = computed(() => glossaryStore.loading);
const pagination = computed(() => glossaryStore.pagination);
const extractionJob = computed(() => glossaryStore.extractionJob);

// Apply client-side filters
const terms = computed(() => {
  let filtered = [...allTerms.value];

  if (filterStatus.value) {
    filtered = filtered.filter(t => t.status === filterStatus.value);
  }

  if (filterVerified.value) {
    const isVerified = filterVerified.value === 'true';
    filtered = filtered.filter(t => t.isVerified === isVerified);
  }

  return filtered;
});

const verifiedTermsCount = computed(() => statistics.value.verifiedTerms);
const unverifiedTermsCount = computed(() => statistics.value.unverifiedTerms);
const autoExtractedCount = computed(() => statistics.value.autoExtractedTerms);
const isAllSelected = computed(() =>
  terms.value.length > 0 && selectedTermIds.value.length === terms.value.length
);

// Pagination
const displayedPages = computed(() => {
  const pages = [];
  const currentPage = pagination.value.page;
  const totalPages = pagination.value.totalPages;

  if (totalPages <= 7) {
    for (let i = 0; i < totalPages; i++) pages.push(i);
  } else {
    pages.push(0);
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages - 2, currentPage + 1);

    if (currentPage <= 2) endPage = 3;
    if (currentPage >= totalPages - 3) startPage = totalPages - 4;

    if (startPage > 1) pages.push('...');
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    if (endPage < totalPages - 2) pages.push('...');
    pages.push(totalPages - 1);
  }
  return pages;
});

function getEmptyForm() {
  return {
    koreanTerm: '',
    englishTerm: '',
    vietnameseTerm: '',
    abbreviation: '',
    definition: '',
    context: '',
    exampleSentence: '',
    note: '',
    domain: ''
  };
}

// Methods
const handleProjectChange = async () => {
  await loadTerms();
};

const loadTerms = async () => {
  try {
    selectedTermIds.value = [];
    if (selectedProjectId.value) {
      await glossaryStore.fetchTerms(selectedProjectId.value);
      await glossaryStore.fetchStatistics(selectedProjectId.value);
    } else {
      await glossaryStore.fetchAllTerms();
      await glossaryStore.fetchStatistics();
    }
  } catch (error) {
    console.error('Failed to load terms:', error);
  }
};

const handleSearch = () => {
  if (searchQuery.value) {
    if (selectedProjectId.value) {
      glossaryStore.searchTermsByProject(selectedProjectId.value, searchQuery.value);
    } else {
      glossaryStore.searchAllTerms(searchQuery.value);
    }
  } else {
    loadTerms();
  }
};

const refreshTerms = () => {
  loadTerms();
};

const goToPage = async (page) => {
  if (page < 0 || page >= pagination.value.totalPages) return;
  try {
    selectedTermIds.value = [];
    if (searchQuery.value) {
      if (selectedProjectId.value) {
        await glossaryStore.searchTerms(selectedProjectId.value, searchQuery.value, { page });
      } else {
        await glossaryStore.searchAllTerms(searchQuery.value, { page });
      }
    } else {
      if (selectedProjectId.value) {
        await glossaryStore.fetchTerms(selectedProjectId.value, { page });
      } else {
        await glossaryStore.fetchAllTerms({ page });
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    console.error('Failed to load page:', error);
  }
};

const handleDocumentSelect = async (documentId) => {
  try {
    showDocumentSelectModal.value = false;
    await glossaryStore.startExtraction(documentId);
  } catch (error) {
    console.error('Failed to start extraction:', error);
    alert('Failed to start term extraction.');
  }
};

const handleExtractionClose = () => {
  glossaryStore.clearExtractionJob();
  loadTerms();
};

const openTermDetail = (term) => {
  selectedTerm.value = term;
  showTermDetail.value = true;
};

const closeTermDetail = () => {
  showTermDetail.value = false;
  selectedTerm.value = null;
};

const closeModal = () => {
  showAddTermModal.value = false;
  showEditDialog.value = false;
  editingTermId.value = null;
  activeForm.value = getEmptyForm();
};

const editTerm = (term) => {
  editingTermId.value = term.id;
  activeForm.value = { ...term };
  showEditDialog.value = true;
};

const editTermFromDetail = () => {
  if (selectedTerm.value) {
    closeTermDetail();
    editTerm(selectedTerm.value);
  }
};

const handleSave = async () => {
  if (!activeForm.value.koreanTerm.trim() || !activeForm.value.englishTerm.trim()) {
    alert('Korean and English terms are required.');
    return;
  }

  try {
    if (showEditDialog.value) {
      await glossaryStore.updateTerm(editingTermId.value, activeForm.value);
    } else {
      await glossaryStore.createTerm(activeForm.value);
    }
    closeModal();
    await loadTerms();
  } catch (error) {
    console.error('Failed to save term:', error);
    alert('Failed to save term.');
  }
};

const verifyTerm = async (term) => {
  try {
    await glossaryStore.verifyTerm(term.id);
    await glossaryStore.fetchStatistics(selectedProjectId.value);
  } catch (error) {
    console.error('Failed to verify term:', error);
  }
};

const unverifyTerm = async (term) => {
  if (!confirm(`Unverify term '${term.koreanTerm}'?`)) return;
  try {
    await glossaryStore.unverifyTerm(term.id);
    await glossaryStore.fetchStatistics(selectedProjectId.value);
  } catch (error) {
    console.error('Failed to unverify term:', error);
  }
};

const confirmDeleteTerm = (term) => {
  if (confirm(`Delete term '${term.koreanTerm}'?`)) {
    deleteTerm(term);
  }
};

const deleteTerm = async (term) => {
  try {
    await glossaryStore.deleteTerm(term.id);
  } catch (error) {
    console.error('Failed to delete term:', error);
  }
};

const toggleSelectTerm = (termId) => {
  const index = selectedTermIds.value.indexOf(termId);
  if (index > -1) selectedTermIds.value.splice(index, 1);
  else selectedTermIds.value.push(termId);
};

const toggleSelectAll = () => {
  if (isAllSelected.value) selectedTermIds.value = [];
  else selectedTermIds.value = terms.value.map(t => t.id);
};

const handleBulkDelete = async () => {
  if (selectedTermIds.value.length === 0) return;
  if (!confirm(`Delete ${selectedTermIds.value.length} selected terms?`)) return;

  try {
    await glossaryStore.deleteTerms(selectedTermIds.value);
    selectedTermIds.value = [];
    await loadTerms();
  } catch (error) {
    console.error('Failed to delete terms:', error);
    alert('Failed to delete terms.');
  }
};

const getStatusLabel = (status) => {
  const labels = {
    AUTO_EXTRACTED: 'AI Extracted',
    USER_ADDED: 'User Added',
    USER_EDITED: 'User Edited',
    USER_VERIFIED: 'Verified'
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    AUTO_EXTRACTED: 'bg-blue-100 text-blue-700',
    USER_ADDED: 'bg-green-100 text-green-700',
    USER_EDITED: 'bg-amber-100 text-amber-700',
    USER_VERIFIED: 'bg-purple-100 text-purple-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-600';
};

onMounted(async () => {
  try {
    await projectStore.fetchProjects();
    await loadTerms();
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
