<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">전문용어사전</h1>
            <p class="mt-2 text-sm text-gray-600">
              프로젝트별 전문용어를 관리하고 AI로 자동 추출하세요
            </p>
          </div>
          <div class="flex gap-3 items-center">
            <div v-if="selectedTermIds.length > 0" class="flex items-center gap-3">
              <span class="text-sm text-gray-600">
                {{ selectedTermIds.length }}개 선택됨
              </span>
              <button
                @click="handleBulkDelete"
                class="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                선택 삭제
              </button>
            </div>
            <button
              @click="showDocumentSelectModal = true"
              class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              용어 추출
            </button>
            <button
              @click="showAddTermModal = true"
              class="inline-flex items-center px-4 py-2 bg-orange-primary text-white rounded-lg text-sm font-medium hover:bg-orange-medium transition"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              용어 추가
            </button>
          </div>
        </div>
      </div>

      <!-- Project Filter (Optional) -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <label class="text-sm font-medium text-gray-700">프로젝트 필터:</label>
            <select
              v-model="selectedProjectId"
              @change="handleProjectChange"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
            >
              <option value="">전체 용어</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }} ({{ project.sourceLanguage }} → {{ project.targetLanguage }})
              </option>
            </select>
          </div>
          <div class="text-sm text-gray-600">
            <span class="font-medium">{{ pagination.totalElements }}</span> 개 용어
          </div>
        </div>
      </div>
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">전체 용어</p>
                <p class="text-2xl font-bold text-gray-900 mt-1">{{ pagination.totalElements }}</p>
              </div>
              <div class="p-3 bg-orange-50 rounded-lg">
                <svg class="w-6 h-6 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">검증된 용어</p>
                <p class="text-2xl font-bold text-green-600 mt-1">{{ verifiedTermsCount }}</p>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">검증 필요</p>
                <p class="text-2xl font-bold text-yellow-600 mt-1">{{ unverifiedTermsCount }}</p>
              </div>
              <div class="p-3 bg-yellow-50 rounded-lg">
                <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600">AI 추출</p>
                <p class="text-2xl font-bold text-blue-600 mt-1">{{ autoExtractedCount }}</p>
              </div>
              <div class="p-3 bg-blue-50 rounded-lg">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4 flex-1">
              <div class="relative flex-1 max-w-md">
                <input
                  v-model="searchQuery"
                  @input="handleSearch"
                  type="text"
                  placeholder="용어 검색..."
                  class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
                />
                <svg class="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                v-model="filterStatus"
                @change="handleFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              >
                <option value="">모든 상태</option>
                <option value="AUTO_EXTRACTED">AI 추출</option>
                <option value="USER_ADDED">사용자 추가</option>
                <option value="USER_EDITED">사용자 편집</option>
                <option value="USER_VERIFIED">검증됨</option>
              </select>

              <select
                v-model="filterVerified"
                @change="handleFilter"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              >
                <option value="">검증 상태</option>
                <option value="true">검증됨</option>
                <option value="false">미검증</option>
              </select>
            </div>

            <button
              @click="refreshTerms"
              class="ml-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            >
              <svg class="w-5 h-5" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Terms Table -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <!-- Loading State -->
          <div v-if="loading && terms.length === 0" class="p-8">
            <div class="animate-pulse space-y-4">
              <div v-for="i in 5" :key="i" class="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="terms.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">용어가 없습니다</h3>
            <p class="mt-1 text-sm text-gray-500">
              용어를 추가하거나 문서에서 AI로 자동 추출하세요
            </p>
            <div class="mt-6">
              <button
                @click="showAddTermModal = true"
                class="inline-flex items-center px-4 py-2 bg-orange-primary text-white rounded-lg text-sm font-medium hover:bg-orange-medium transition"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                첫 용어 추가하기
              </button>
            </div>
          </div>

          <!-- Terms List -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      :checked="isAllSelected"
                      @change="toggleSelectAll"
                      class="w-4 h-4 text-orange-primary bg-gray-100 border-gray-300 rounded focus:ring-orange-primary focus:ring-2"
                    />
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    한국어
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    영어
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    약어
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    정의
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    검증
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="term in terms"
                  :key="term.id"
                  class="hover:bg-gray-50 transition"
                  :class="{ 'bg-orange-50': selectedTermIds.includes(term.id) }"
                >
                  <td class="px-6 py-4 whitespace-nowrap" @click.stop>
                    <input
                      type="checkbox"
                      :checked="selectedTermIds.includes(term.id)"
                      @change="toggleSelectTerm(term.id)"
                      class="w-4 h-4 text-orange-primary bg-gray-100 border-gray-300 rounded focus:ring-orange-primary focus:ring-2"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap cursor-pointer" @click="openTermDetail(term)">
                    <div class="text-sm font-medium text-gray-900">{{ term.koreanTerm }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">{{ term.englishTerm || '-' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ term.abbreviation || '-' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray-900 max-w-md truncate">
                      {{ term.definition || '-' }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                      :class="getStatusBadgeClass(term.status)"
                    >
                      {{ getStatusLabel(term.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span
                      v-if="term.isVerified"
                      class="inline-flex items-center text-green-600"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                    </span>
                    <span v-else class="text-gray-400">
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end space-x-2" @click.stop>
                      <button
                        v-if="!term.isVerified"
                        @click="verifyTerm(term)"
                        class="text-green-600 hover:text-green-900"
                        title="검증"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        v-else
                        @click="unverifyTerm(term)"
                        class="text-orange-600 hover:text-orange-900"
                        title="검증 해제"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                      <button
                        @click="editTerm(term)"
                        class="text-blue-600 hover:text-blue-900"
                        title="편집"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="confirmDeleteTerm(term)"
                        class="text-red-600 hover:text-red-900"
                        title="삭제"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Load More -->
          <div v-if="hasMore && !loading" class="px-6 py-4 border-t border-gray-200">
            <button
              @click="loadMore"
              class="w-full px-4 py-2 text-sm font-medium text-orange-primary hover:bg-orange-50 rounded-lg transition"
            >
              더 보기
            </button>
          </div>
        </div>
    </div>

    <!-- Modals -->
    <Teleport to="body">
      <!-- Document Select Modal -->
      <DocumentSelectModal
        v-if="showDocumentSelectModal"
        @close="showDocumentSelectModal = false"
        @select="handleDocumentSelect"
      />

      <!-- Extraction Progress Modal -->
      <ExtractionProgressModal
        v-if="extractionJob"
        :job="extractionJob"
        @close="handleExtractionClose"
      />

      <!-- Add Term Modal (placeholder) -->
      <div v-if="showAddTermModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <h3 class="text-lg font-semibold mb-4">용어 추가</h3>
          <p class="text-gray-600">용어 추가 기능이 곧 구현됩니다.</p>
          <button @click="showAddTermModal = false" class="mt-4 px-4 py-2 bg-gray-200 rounded-lg">닫기</button>
        </div>
      </div>

      <!-- Edit Term Modal -->
      <div
        v-if="showEditDialog"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="closeEditDialog"
      >
        <div class="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-semibold text-gray-900">용어 수정</h3>
            <button
              @click="closeEditDialog"
              class="text-gray-400 hover:text-gray-600"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveEdit" class="space-y-4">
            <!-- Korean Term (Required) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                한국어 용어 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.koreanTerm"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
                placeholder="예: 인공지능"
              />
            </div>

            <!-- English Term (Required) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                영어 용어 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.englishTerm"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
                placeholder="예: Artificial Intelligence"
              />
            </div>

            <!-- Abbreviation (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                약어
              </label>
              <input
                v-model="editForm.abbreviation"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
                placeholder="예: AI"
              />
            </div>

            <!-- Domain (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                도메인
              </label>
              <input
                v-model="editForm.domain"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
                placeholder="예: IT, 의료, 법률"
              />
            </div>

            <!-- Definition (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                정의
              </label>
              <textarea
                v-model="editForm.definition"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none resize-none"
                placeholder="용어의 정의를 입력하세요"
              ></textarea>
            </div>

            <!-- Context (Optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                문맥
              </label>
              <textarea
                v-model="editForm.context"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none resize-none"
                placeholder="용어가 사용되는 문맥을 입력하세요"
              ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeEditDialog"
                class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
              >
                취소
              </button>
              <button
                type="submit"
                class="px-6 py-2 bg-orange-primary text-white rounded-lg text-sm font-medium hover:bg-orange-medium transition"
              >
                저장
              </button>
            </div>
          </form>
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
const editForm = ref({
  koreanTerm: '',
  englishTerm: '',
  abbreviation: '',
  definition: '',
  context: '',
  domain: ''
});

// Computed
const projects = computed(() => projectStore.projects);
const terms = computed(() => glossaryStore.terms);
const loading = computed(() => glossaryStore.loading);
const hasMore = computed(() => glossaryStore.hasMore);
const pagination = computed(() => glossaryStore.pagination);
const extractionJob = computed(() => glossaryStore.extractionJob);

const verifiedTermsCount = computed(() =>
  terms.value.filter(t => t.isVerified).length
);
const unverifiedTermsCount = computed(() =>
  terms.value.filter(t => !t.isVerified).length
);
const autoExtractedCount = computed(() =>
  terms.value.filter(t => t.status === 'AUTO_EXTRACTED').length
);
const isAllSelected = computed(() =>
  terms.value.length > 0 && selectedTermIds.value.length === terms.value.length
);

// Methods
const handleProjectChange = async () => {
  await loadTerms();
};

const loadTerms = async () => {
  try {
    selectedTermIds.value = []; // Clear selection when loading
    if (selectedProjectId.value) {
      // Load terms filtered by project
      await glossaryStore.fetchTerms(selectedProjectId.value);
    } else {
      // Load all user terms
      await glossaryStore.fetchAllTerms();
    }
  } catch (error) {
    console.error('Failed to load terms:', error);
    console.error('Error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers
    });
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

const handleFilter = () => {
  loadTerms();
};

const refreshTerms = () => {
  loadTerms();
};

const loadMore = async () => {
  try {
    await glossaryStore.loadMore(selectedProjectId.value);
  } catch (error) {
    console.error('Failed to load more:', error);
  }
};

const handleDocumentSelect = async (documentId) => {
  try {
    showDocumentSelectModal.value = false;
    await glossaryStore.startExtraction(documentId);
    // Modal will show automatically when extractionJob is set
  } catch (error) {
    console.error('Failed to start extraction:', error);
    alert('용어 추출을 시작하지 못했습니다.');
  }
};

const handleExtractionClose = () => {
  glossaryStore.clearExtractionJob();
  // Refresh terms list
  loadTerms();
};

const openTermDetail = (term) => {
  console.log('Open term detail:', term);
};

const editTerm = (term) => {
  editingTermId.value = term.id;
  editForm.value = {
    koreanTerm: term.koreanTerm || '',
    englishTerm: term.englishTerm || '',
    abbreviation: term.abbreviation || '',
    definition: term.definition || '',
    context: term.context || '',
    domain: term.domain || ''
  };
  showEditDialog.value = true;
};

const closeEditDialog = () => {
  showEditDialog.value = false;
  editingTermId.value = null;
  editForm.value = {
    koreanTerm: '',
    englishTerm: '',
    abbreviation: '',
    definition: '',
    context: '',
    domain: ''
  };
};

const saveEdit = async () => {
  // Validate required fields
  if (!editForm.value.koreanTerm.trim()) {
    alert('한국어 용어는 필수입니다.');
    return;
  }
  if (!editForm.value.englishTerm.trim()) {
    alert('영어 용어는 필수입니다.');
    return;
  }

  try {
    await glossaryStore.updateTerm(editingTermId.value, editForm.value);
    closeEditDialog();
  } catch (error) {
    console.error('Failed to update term:', error);
    alert('용어 수정에 실패했습니다.');
  }
};

const verifyTerm = async (term) => {
  try {
    await glossaryStore.verifyTerm(term.id);
  } catch (error) {
    console.error('Failed to verify term:', error);
  }
};

const unverifyTerm = async (term) => {
  if (!confirm(`'${term.koreanTerm}' 용어의 검증을 해제하시겠습니까?`)) {
    return;
  }

  try {
    await glossaryStore.unverifyTerm(term.id);
  } catch (error) {
    console.error('Failed to unverify term:', error);
    alert('검증 해제에 실패했습니다.');
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

// Selection handlers
const toggleSelectTerm = (termId) => {
  const index = selectedTermIds.value.indexOf(termId);
  if (index > -1) {
    selectedTermIds.value.splice(index, 1);
  } else {
    selectedTermIds.value.push(termId);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedTermIds.value = [];
  } else {
    selectedTermIds.value = terms.value.map(t => t.id);
  }
};

// Bulk delete handler
const handleBulkDelete = async () => {
  if (selectedTermIds.value.length === 0) return;

  if (!confirm(`선택된 ${selectedTermIds.value.length}개의 용어를 삭제하시겠습니까?`)) {
    return;
  }

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
    AUTO_EXTRACTED: 'AI 추출',
    USER_ADDED: '사용자 추가',
    USER_EDITED: '사용자 편집',
    USER_VERIFIED: '검증됨'
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    AUTO_EXTRACTED: 'bg-blue-100 text-blue-800',
    USER_ADDED: 'bg-green-100 text-green-800',
    USER_EDITED: 'bg-yellow-100 text-yellow-800',
    USER_VERIFIED: 'bg-purple-100 text-purple-800'
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};

// Lifecycle
onMounted(async () => {
  try {
    await projectStore.fetchProjects();
    await loadTerms(); // Load all terms by default
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
});
</script>
