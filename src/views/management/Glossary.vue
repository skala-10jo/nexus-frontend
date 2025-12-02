<template>
  <div class="h-screen flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <div class="flex-shrink-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-3 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-gray-900">전문용어사전</h1>
          <p class="text-xs text-gray-500 mt-0.5 font-medium">
            프로젝트 용어를 관리하고 자동으로 추출하세요
          </p>
        </div>
        <div class="flex gap-2 items-center">
          <div v-if="selectedTermIds.length > 0" class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span class="text-xs font-bold text-gray-600">{{ selectedTermIds.length }} 선택</span>
            <button
              @click="handleBulkDelete"
              class="text-red-600 hover:text-red-700 font-medium text-xs flex items-center gap-1"
            >
              <TrashIcon class="w-3.5 h-3.5" />
              삭제
            </button>
          </div>

          <button
            @click="showAddTermModal = true"
            class="flex items-center gap-1.5 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all shadow-md"
          >
            <PlusIcon class="w-4 h-4" />
            용어 추가
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content - Flex Container -->
    <div class="flex-1 flex flex-col min-h-0 p-4 pb-12 gap-3 overflow-hidden">
      <!-- Document Management Section (Compact) -->
      <div class="flex-shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <!-- Section Header -->
        <div
          class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors"
          :class="{ 'border-b border-gray-100': !isDocumentSectionCollapsed }"
          @click="isDocumentSectionCollapsed = !isDocumentSectionCollapsed"
        >
          <div class="flex items-center gap-2">
            <DocumentTextIcon class="w-4 h-4 text-blue-500" />
            <h2 class="text-sm font-bold text-gray-900">문서 관리</h2>
            <span class="text-xs text-gray-400 font-medium">({{ documents.length }})</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click.stop="showUploadModal = true"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-all"
            >
              <CloudArrowUpIcon class="w-3.5 h-3.5" />
              업로드
            </button>
            <ChevronDownIcon
              class="w-4 h-4 text-gray-400 transition-transform duration-200"
              :class="{ 'rotate-180': !isDocumentSectionCollapsed }"
            />
          </div>
        </div>

        <!-- Document List (Collapsible) -->
        <Transition name="collapse">
          <div v-show="!isDocumentSectionCollapsed">
            <!-- Loading State -->
            <div v-if="documentLoading && documents.length === 0" class="flex items-center justify-center py-6">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xs font-medium text-gray-500">불러오는 중...</p>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="documents.length === 0" class="flex items-center justify-center py-6 gap-3">
              <FolderOpenIcon class="w-5 h-5 text-gray-300" />
              <span class="text-sm text-gray-500">업로드된 문서가 없습니다</span>
              <button
                @click="showUploadModal = true"
                class="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
              >
                업로드
              </button>
            </div>

            <!-- Document Table (Compact) -->
            <div v-else class="max-h-[160px] overflow-y-auto custom-scrollbar">
              <table class="w-full text-sm">
                <thead class="sticky top-0 bg-gray-50/95 backdrop-blur-sm">
                  <tr class="text-left border-b border-gray-100">
                    <th class="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 35%">파일명</th>
                    <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">크기</th>
                    <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">날짜</th>
                    <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 15%">상태</th>
                    <th class="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase" style="width: 20%">작업</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <tr
                    v-for="doc in documents"
                    :key="doc.id"
                    class="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td class="px-4 py-1.5">
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="text-base flex-shrink-0">{{ getFileIcon(doc.fileType) }}</span>
                        <span class="text-xs font-medium text-gray-900 truncate">
                          {{ doc.originalFilename }}
                        </span>
                      </div>
                    </td>
                    <td class="px-3 py-1.5">
                      <span class="text-xs text-gray-500">{{ formatFileSize(doc.fileSize) }}</span>
                    </td>
                    <td class="px-3 py-1.5">
                      <span class="text-xs text-gray-500">{{ formatDate(doc.uploadDate) }}</span>
                    </td>
                    <td class="px-3 py-1.5">
                      <span
                        class="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase"
                        :class="getDocStatusClass(doc.status)"
                      >
                        {{ getDocStatusText(doc.status) }}
                      </span>
                    </td>
                    <td class="px-3 py-1.5">
                      <div class="flex items-center gap-0.5">
                        <button
                          v-if="doc.status === 'PROCESSED'"
                          @click="extractTermsFromDocument(doc)"
                          class="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="용어 추출"
                        >
                          <SparklesIcon class="w-3.5 h-3.5" />
                        </button>
                        <button
                          @click="downloadDocument(doc)"
                          class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="다운로드"
                        >
                          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                        </button>
                        <button
                          @click="confirmDeleteDocument(doc)"
                          class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="삭제"
                        >
                          <TrashIcon class="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Terms Section (Fills Remaining Space) -->
      <div class="flex-1 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col min-h-0 overflow-hidden">
        <!-- Toolbar -->
        <div class="flex-shrink-0 px-4 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center justify-between bg-white">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <!-- Document Filter -->
            <div class="relative w-56 flex-shrink-0">
              <select
                v-model="selectedDocumentId"
                @change="handleDocumentChange"
                class="w-full appearance-none pl-3 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:bg-gray-100"
              >
                <option value="">전체 문서</option>
                <option v-for="doc in documents" :key="doc.id" :value="doc.id">
                  {{ doc.originalFilename }}
                </option>
              </select>
              <ChevronDownIcon class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
            </div>

            <!-- Search -->
            <div class="relative flex-1 max-w-sm">
              <input
                v-model="searchQuery"
                @input="handleSearch"
                type="text"
                placeholder="용어 검색..."
                class="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <MagnifyingGlassIcon class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Filters -->
            <div class="relative">
              <select
                v-model="filterStatus"
                class="appearance-none pl-3 pr-7 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
              >
                <option value="">전체 상태</option>
                <option value="AUTO_EXTRACTED">AI 추출</option>
                <option value="USER_ADDED">사용자 추가</option>
                <option value="USER_EDITED">사용자 수정</option>
              </select>
              <ChevronDownIcon class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            <div class="relative">
              <select
                v-model="filterVerified"
                class="appearance-none pl-3 pr-7 py-1.5 bg-white border border-gray-200 rounded-md text-[10px] font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
              >
                <option value="">전체 검증</option>
                <option value="true">검증됨</option>
                <option value="false">미검증</option>
              </select>
              <ChevronDownIcon class="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
            </div>

            <button
              @click="refreshTerms"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
              title="새로고침"
            >
              <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
            </button>
          </div>
        </div>

        <!-- Table (Scrollable) -->
        <div class="flex-1 overflow-y-auto custom-scrollbar relative">
          <!-- Loading Overlay -->
          <div v-if="loading && terms.length === 0" class="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
            <div class="flex flex-col items-center gap-2">
              <div class="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs font-medium text-gray-500">불러오는 중...</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="!loading && terms.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
            <BookOpenIcon class="w-12 h-12 text-gray-200 mb-3" />
            <h3 class="text-sm font-bold text-gray-900 mb-1">용어가 없습니다</h3>
            <p class="text-xs text-gray-500 mb-4">새 용어를 추가하거나 문서에서 추출하세요</p>
            <button
              @click="showAddTermModal = true"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
            >
              용어 추가
            </button>
          </div>

          <!-- Data Table -->
          <table v-else class="w-full">
            <thead class="sticky top-0 z-10 bg-gray-50 shadow-sm">
              <tr class="border-b border-gray-100">
                <th class="px-4 py-2.5 text-left w-10">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-36">한국어</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-40">영어</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-40">베트남어</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">약어</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">상태</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-20">검증</th>
                <th class="px-4 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase w-24">작업</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="term in terms"
                :key="term.id"
                class="group hover:bg-blue-50/30 transition-colors"
                :class="{ 'bg-blue-50/50': selectedTermIds.includes(term.id) }"
              >
                <td class="px-4 py-2">
                  <input
                    type="checkbox"
                    :checked="selectedTermIds.includes(term.id)"
                    @change="toggleSelectTerm(term.id)"
                    class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                <td class="px-4 py-2">
                  <button @click="openTermDetail(term)" class="text-xs font-bold text-gray-900 hover:text-blue-600 text-left">
                    {{ term.koreanTerm }}
                  </button>
                </td>
                <td class="px-4 py-2">
                  <span class="text-xs text-gray-600">{{ term.englishTerm || '-' }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="text-xs text-gray-600">{{ term.vietnameseTerm || '-' }}</span>
                </td>
                <td class="px-4 py-2">
                  <span class="text-xs text-gray-500">{{ term.abbreviation || '-' }}</span>
                </td>
                <td class="px-4 py-2">
                  <span
                    class="px-1.5 py-0.5 text-[9px] font-bold rounded uppercase"
                    :class="getStatusBadgeClass(term.status)"
                  >
                    {{ getStatusLabel(term.status) }}
                  </span>
                </td>
                <td class="px-4 py-2">
                  <div v-if="term.isVerified" class="flex items-center gap-1 text-green-600">
                    <CheckCircleIcon class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold">검증</span>
                  </div>
                  <div v-else class="flex items-center gap-1 text-gray-400">
                    <div class="w-3.5 h-3.5 rounded-full border-2 border-gray-300"></div>
                    <span class="text-[10px] font-bold">미검증</span>
                  </div>
                </td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-0.5">
                    <button
                      v-if="!term.isVerified"
                      @click="verifyTerm(term)"
                      class="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="검증"
                    >
                      <CheckIcon class="w-3.5 h-3.5" />
                    </button>
                    <button
                      v-else
                      @click="unverifyTerm(term)"
                      class="p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                      title="검증 취소"
                    >
                      <XMarkIcon class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="editTerm(term)"
                      class="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="수정"
                    >
                      <PencilIcon class="w-3.5 h-3.5" />
                    </button>
                    <button
                      @click="confirmDeleteTerm(term)"
                      class="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="삭제"
                    >
                      <TrashIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.totalPages > 1" class="flex-shrink-0 px-4 py-2 border-t border-gray-100 bg-white flex items-center justify-between">
          <p class="text-[10px] text-gray-500">
            전체 <span class="font-bold text-gray-700">{{ pagination.totalElements }}</span>개 중
            <span class="font-bold text-gray-700">{{ Math.min((pagination.page + 1) * pagination.size, pagination.totalElements) }}</span>개
          </p>
          <div class="flex items-center gap-1">
            <button
              @click="goToPage(pagination.page - 1)"
              :disabled="pagination.page === 0"
              class="p-1 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
            >
              <ChevronLeftIcon class="w-4 h-4" />
            </button>
            <template v-for="page in displayedPages" :key="page">
              <button
                v-if="page !== '...'"
                @click="goToPage(page)"
                class="w-6 h-6 rounded text-[10px] font-bold transition-all"
                :class="pagination.page === page ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'"
              >
                {{ page + 1 }}
              </button>
              <span v-else class="text-gray-400 text-[10px]">...</span>
            </template>
            <button
              @click="goToPage(pagination.page + 1)"
              :disabled="pagination.page >= pagination.totalPages - 1"
              class="p-1 rounded text-gray-500 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-30 transition-all"
            >
              <ChevronRightIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Upload Modal -->
      <div
        v-if="showUploadModal"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click.self="showUploadModal = false"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 class="text-base font-bold text-gray-900">문서 업로드</h3>
            <button @click="showUploadModal = false" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5">
            <!-- Dropzone -->
            <div
              class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
              :class="isDragActive
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'"
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragActive = true"
              @dragleave="isDragActive = false"
              @click="triggerFileInput"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                @change="handleFileSelect"
                hidden
              />

              <CloudArrowUpIcon
                class="w-10 h-10 mx-auto mb-2 transition-colors"
                :class="isDragActive ? 'text-blue-500' : 'text-gray-400'"
              />

              <h4 class="text-sm font-bold text-gray-900 mb-1">
                {{ isDragActive ? '파일을 여기에 놓으세요' : '파일을 드래그하거나 클릭' }}
              </h4>
              <p class="text-xs text-gray-500 mb-2">여러 파일 동시 업로드 가능</p>
              <span class="inline-flex px-2 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600">
                PDF, DOCX, TXT (최대 50MB)
              </span>
            </div>

            <!-- Upload Progress -->
            <div v-if="uploadingFiles.length > 0" class="mt-3 space-y-2">
              <div
                v-for="file in uploadingFiles"
                :key="file.id"
                class="bg-gray-50 rounded-lg p-2.5 border border-gray-200"
                :class="{ 'border-red-300 bg-red-50': file.error }"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-xs font-medium text-gray-900 truncate flex-1">{{ file.filename }}</span>
                  <span v-if="!file.error" class="text-xs font-bold text-gray-600 ml-2">{{ file.progress }}%</span>
                  <CheckCircleIcon v-if="file.progress === 100 && !file.error" class="w-4 h-4 text-green-500 ml-1" />
                </div>
                <div v-if="!file.error" class="w-full bg-gray-200 rounded-full h-1">
                  <div
                    class="h-full bg-blue-500 rounded-full transition-all duration-300"
                    :style="{ width: `${file.progress}%` }"
                  ></div>
                </div>
                <p v-if="file.error" class="text-xs text-red-600 mt-1">{{ file.error }}</p>
              </div>
            </div>
          </div>

          <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button
              @click="showUploadModal = false"
              class="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>

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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <h3 class="text-lg font-bold text-gray-900">
              {{ showEditDialog ? '용어 수정' : '새 용어 추가' }}
            </h3>
            <button @click="closeModal" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 overflow-y-auto custom-scrollbar">
            <form @submit.prevent="handleSave" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase">한국어 용어 <span class="text-red-500">*</span></label>
                  <input
                    v-model="activeForm.koreanTerm"
                    type="text"
                    required
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="예: 인공지능"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase">영어 용어 <span class="text-red-500">*</span></label>
                  <input
                    v-model="activeForm.englishTerm"
                    type="text"
                    required
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="예: Artificial Intelligence"
                  />
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase">베트남어</label>
                  <input
                    v-model="activeForm.vietnameseTerm"
                    type="text"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase">약어</label>
                  <input
                    v-model="activeForm.abbreviation"
                    type="text"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div class="space-y-1.5">
                  <label class="text-[10px] font-bold text-gray-500 uppercase">도메인</label>
                  <input
                    v-model="activeForm.domain"
                    type="text"
                    class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">정의</label>
                <textarea
                  v-model="activeForm.definition"
                  rows="2"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="용어의 정의..."
                ></textarea>
              </div>

              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">문맥 / 용례</label>
                <textarea
                  v-model="activeForm.context"
                  rows="2"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                ></textarea>
              </div>
            </form>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
            <button
              @click="closeModal"
              class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
            >
              취소
            </button>
            <button
              @click="handleSave"
              class="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all"
            >
              {{ showEditDialog ? '저장' : '생성' }}
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
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <div>
              <h3 class="text-xl font-bold text-gray-900">{{ selectedTerm?.koreanTerm }}</h3>
              <p class="text-sm text-gray-500 font-medium mt-0.5">{{ selectedTerm?.englishTerm }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                :class="getStatusBadgeClass(selectedTerm?.status)"
              >
                {{ getStatusLabel(selectedTerm?.status) }}
              </span>
              <button @click="closeTermDetail" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="p-6 space-y-4">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">베트남어</p>
                <p class="text-base font-medium text-gray-900">{{ selectedTerm?.vietnameseTerm || '-' }}</p>
              </div>
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">약어</p>
                <p class="text-base font-medium text-gray-900">{{ selectedTerm?.abbreviation || '-' }}</p>
              </div>
            </div>

            <div v-if="selectedTerm?.definition">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">정의</p>
              <p class="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                {{ selectedTerm.definition }}
              </p>
            </div>

            <div v-if="selectedTerm?.context">
              <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">문맥</p>
              <p class="text-sm text-gray-600 italic">"{{ selectedTerm.context }}"</p>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-bold text-gray-400 uppercase">검증:</span>
                <span v-if="selectedTerm?.isVerified" class="text-green-600 font-bold text-xs flex items-center gap-1">
                  <CheckCircleIcon class="w-3.5 h-3.5" /> 검증됨
                </span>
                <span v-else class="text-gray-400 font-bold text-xs">미검증</span>
              </div>

              <button
                @click="editTermFromDetail"
                class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all"
              >
                수정
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
import { useDocumentStore } from '@/stores/documents';
import ExtractionProgressModal from './components/ExtractionProgressModal.vue';
import {
  TrashIcon,
  SparklesIcon,
  PlusIcon,
  BookOpenIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/solid';

// Stores
const glossaryStore = useGlossaryStore();
const documentStore = useDocumentStore();

// State
const selectedDocumentId = ref('');
const searchQuery = ref('');
const filterStatus = ref('');
const filterVerified = ref('');
const showAddTermModal = ref(false);
const selectedTermIds = ref([]);

// Document section state
const isDocumentSectionCollapsed = ref(false);
const showUploadModal = ref(false);
const isDragActive = ref(false);
const fileInput = ref(null);
const uploadingFiles = ref([]);

// Edit dialog state
const showEditDialog = ref(false);
const editingTermId = ref(null);
const activeForm = ref(getEmptyForm());

// Term detail modal state
const showTermDetail = ref(false);
const selectedTerm = ref(null);

// Computed
const documents = computed(() => documentStore.documents);
const documentLoading = computed(() => documentStore.loading);
const allTerms = computed(() => glossaryStore.terms);
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

// Document Methods
const loadDocuments = async () => {
  try {
    await documentStore.fetchDocuments({ sort: 'uploadDate,desc' });
  } catch (error) {
    console.error('Failed to load documents:', error);
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleDrop = (e) => {
  isDragActive.value = false;
  const files = Array.from(e.dataTransfer.files);
  uploadFiles(files);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  uploadFiles(files);
  e.target.value = '';
};

const uploadFiles = async (files) => {
  const validFiles = files.filter(file => {
    const isValidType = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/msword'].includes(file.type);
    const isValidSize = file.size <= 50 * 1024 * 1024;
    if (!isValidType) {
      alert(`${file.name}: 지원하지 않는 파일 형식입니다`);
      return false;
    }
    if (!isValidSize) {
      alert(`${file.name}: 파일 크기가 50MB를 초과합니다`);
      return false;
    }
    return true;
  });

  if (validFiles.length === 0) return;

  for (const file of validFiles) {
    const uploadId = Date.now() + Math.random();
    const uploadItem = {
      id: uploadId,
      filename: file.name,
      size: file.size,
      progress: 0,
      error: null,
      file: file
    };

    uploadingFiles.value.push(uploadItem);

    try {
      await documentStore.uploadDocument(file, (progress) => {
        const item = uploadingFiles.value.find(u => u.id === uploadId);
        if (item) item.progress = progress;
      });

      setTimeout(() => {
        uploadingFiles.value = uploadingFiles.value.filter(u => u.id !== uploadId);
        if (uploadingFiles.value.length === 0) {
          loadDocuments();
        }
      }, 1000);
    } catch (error) {
      const item = uploadingFiles.value.find(u => u.id === uploadId);
      if (item) {
        item.error = error.message;
        item.progress = 0;
      }
    }
  }
};

const extractTermsFromDocument = async (doc) => {
  try {
    await glossaryStore.startExtraction(doc.id);
  } catch (error) {
    console.error('Failed to start extraction:', error);
    alert('용어 추출을 시작하지 못했습니다.');
  }
};

const downloadDocument = async (doc) => {
  try {
    await documentStore.downloadDocument(doc.id, doc.originalFilename);
  } catch (error) {
    console.error('Failed to download document:', error);
    alert('다운로드에 실패했습니다.');
  }
};

const confirmDeleteDocument = async (doc) => {
  if (confirm(`'${doc.originalFilename}' 파일을 삭제하시겠습니까?`)) {
    try {
      await documentStore.deleteDocument(doc.id);
    } catch (error) {
      console.error('Failed to delete document:', error);
      alert('삭제에 실패했습니다.');
    }
  }
};

const getFileIcon = (fileType) => {
  if (!fileType) return '📄';
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📕';
  if (type.includes('word') || type.includes('doc')) return '📘';
  if (type.includes('excel') || type.includes('sheet') || type.includes('xls')) return '📗';
  if (type.includes('image') || type.includes('png') || type.includes('jpg')) return '🖼️';
  return '📄';
};

const getDocStatusClass = (status) => {
  const classes = {
    UPLOADED: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    PROCESSED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-600';
};

const getDocStatusText = (status) => {
  const texts = {
    UPLOADED: '업로드',
    PROCESSING: '처리중',
    PROCESSED: '완료',
    FAILED: '오류'
  };
  return texts[status] || status;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 10) / 10 + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric'
  });
};

// Term Methods
const handleDocumentChange = async () => {
  await loadTerms();
};

const loadTerms = async () => {
  try {
    selectedTermIds.value = [];
    if (selectedDocumentId.value) {
      await glossaryStore.fetchTermsByDocument(selectedDocumentId.value);
      await glossaryStore.fetchStatistics();
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
    if (selectedDocumentId.value) {
      glossaryStore.searchTermsByDocument(selectedDocumentId.value, searchQuery.value);
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
      if (selectedDocumentId.value) {
        await glossaryStore.searchTermsByDocument(selectedDocumentId.value, searchQuery.value, { page });
      } else {
        await glossaryStore.searchAllTerms(searchQuery.value, { page });
      }
    } else {
      if (selectedDocumentId.value) {
        await glossaryStore.fetchTermsByDocument(selectedDocumentId.value, { page });
      } else {
        await glossaryStore.fetchAllTerms({ page });
      }
    }
  } catch (error) {
    console.error('Failed to load page:', error);
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
    alert('한국어와 영어 용어는 필수입니다.');
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
    alert('용어 저장에 실패했습니다.');
  }
};

const verifyTerm = async (term) => {
  try {
    await glossaryStore.verifyTerm(term.id);
    await glossaryStore.fetchStatistics();
  } catch (error) {
    console.error('Failed to verify term:', error);
  }
};

const unverifyTerm = async (term) => {
  if (!confirm(`'${term.koreanTerm}' 용어의 검증을 취소하시겠습니까?`)) return;
  try {
    await glossaryStore.unverifyTerm(term.id);
    await glossaryStore.fetchStatistics();
  } catch (error) {
    console.error('Failed to unverify term:', error);
  }
};

const confirmDeleteTerm = (term) => {
  if (confirm(`'${term.koreanTerm}' 용어를 삭제하시겠습니까?`)) {
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
  if (!confirm(`선택한 ${selectedTermIds.value.length}개 용어를 삭제하시겠습니까?`)) return;

  try {
    await glossaryStore.deleteTerms(selectedTermIds.value);
    selectedTermIds.value = [];
    await loadTerms();
  } catch (error) {
    console.error('Failed to delete terms:', error);
    alert('용어 삭제에 실패했습니다.');
  }
};

const getStatusLabel = (status) => {
  const labels = {
    AUTO_EXTRACTED: 'AI',
    USER_ADDED: '추가',
    USER_EDITED: '수정',
    USER_VERIFIED: '검증'
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
    await loadDocuments();
    await loadTerms();
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.collapse-enter-active,
.collapse-leave-active {
  transition: all 0.15s ease;
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 300px;
}
</style>
