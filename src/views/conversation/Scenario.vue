<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <!-- 좌우 레이아웃 -->
    <div class="grid grid-cols-12 gap-6">
      <!-- Left: Upcoming (3 columns) -->
      <div class="col-span-12 lg:col-span-3">
        <div class="bg-white rounded-2xl shadow-md h-full">
          <!-- 헤더 -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                <svg class="w-6 h-6 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                다가오는 일정
              </h2>
              <span v-if="selectedSchedules.length > 0" class="text-sm text-gray-600">
                {{ selectedSchedules.length }}개 선택됨
              </span>
            </div>
          </div>

          <!-- 로딩 -->
          <div v-if="schedulesLoading" class="p-6 space-y-4">
            <div v-for="i in 3" :key="i" class="animate-pulse">
              <div class="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div class="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>

          <!-- 일정 목록 -->
          <div v-else-if="filteredSchedules.length > 0" class="overflow-y-auto max-h-[calc(100vh-200px)]">
            <!-- 날짜별 그룹 -->
            <div v-for="(group, date) in groupedSchedules" :key="date" class="border-b border-gray-100 last:border-b-0">
              <div class="px-6 py-3 bg-gray-50 sticky top-0">
                <p class="text-sm font-semibold text-gray-600">{{ formatGroupDate(date) }}</p>
              </div>
              <div class="p-4 space-y-2">
                <div
                  v-for="schedule in group"
                  :key="schedule.id"
                  @click="toggleScheduleSelection(schedule)"
                  :class="[
                    'p-4 rounded-lg cursor-pointer transition-all border-2',
                    isScheduleSelected(schedule.id)
                      ? 'bg-orange-50 border-orange-primary shadow-md'
                      : 'bg-white border-gray-200 hover:border-orange-200 hover:shadow-sm'
                  ]"
                >
                  <div class="flex items-start justify-between mb-2">
                    <p class="text-sm font-bold text-gray-900">{{ formatTime(schedule.startTime) }}</p>
                    <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {{ schedule.projectName || '프로젝트' }}
                    </span>
                  </div>
                  <p class="text-sm font-medium text-gray-800 mb-1">{{ schedule.title }}</p>
                  <p v-if="schedule.description" class="text-xs text-gray-500 line-clamp-2">{{ schedule.description }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="p-12 text-center">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p v-if="selectedProjects.length > 0" class="text-gray-500 text-sm mb-2">
              선택한 프로젝트에 다가오는 일정이 없습니다
            </p>
            <p v-else class="text-gray-500 text-sm mb-2">다가오는 일정이 없습니다</p>
            <router-link to="/schedule" class="text-orange-primary text-sm hover:underline">
              일정 추가하기
            </router-link>
          </div>
        </div>
      </div>

      <!-- Right: Project + Scenario (9 columns) -->
      <div class="col-span-12 lg:col-span-9 space-y-6">
        <!-- Project Section -->
        <div class="bg-white rounded-2xl shadow-md p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-lg font-bold text-gray-800">내 프로젝트</h2>
            <span v-if="selectedProjects.length > 0" class="text-sm text-gray-600">
              {{ selectedProjects.length }}개 선택됨
            </span>
          </div>

          <!-- 로딩 -->
          <div v-if="projectsLoading" class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <div v-for="i in 3" :key="i" class="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          <!-- 프로젝트 카드 -->
          <div v-else-if="projects.length > 0" class="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-5 gap-3">
            <div
              v-for="(project, index) in projects"
              :key="project.id"
              @click="toggleProjectSelection(project)"
              :class="[
                'p-3 rounded-xl cursor-pointer transition-all border-2',
                isProjectSelected(project.id)
                  ? 'border-orange-primary shadow-lg scale-105'
                  : 'border-gray-200 hover:border-orange-200 hover:shadow-md'
              ]"
            >
              <div class="flex items-start justify-between mb-2">
                <div :class="getProjectIconClass(index)" class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  {{ project.name.substring(0, 1) }}
                </div>
                <span class="text-xs text-gray-500">💬 {{ getProjectScenarioCount(project.id) }}개</span>
              </div>
              <h3 class="font-bold text-gray-800 text-sm mb-1 truncate">{{ project.name }}</h3>
              <p class="text-xs text-gray-500 line-clamp-1">{{ project.description || '설명 없음' }}</p>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="text-center py-4">
            <p class="text-gray-500 text-sm mb-2">프로젝트가 없습니다</p>
            <router-link to="/management/project" class="text-orange-primary text-sm hover:underline">
              프로젝트 생성하기
            </router-link>
          </div>
        </div>

        <!-- Scenario Section -->
        <div class="bg-white rounded-2xl shadow-md p-6 min-h-[400px]">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-gray-800">시나리오</h2>
            <button
              @click="showCreateDialog = true"
              class="px-4 py-2 bg-orange-primary text-white text-sm font-medium rounded-lg hover:bg-orange-medium transition-colors"
            >
              시나리오 생성
            </button>
          </div>

          <!-- 시나리오 목록 -->
          <div v-if="scenarios.length > 0">
            <!-- 로딩 상태 -->
            <div v-if="scenariosLoading" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="i in 3" :key="i" class="h-48 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <!-- 시나리오 목록 -->
            <div v-else-if="scenarios.length > 0" class="space-y-4">
              <div class="mb-2">
                <p class="text-sm text-gray-600">{{ scenarios.length }}개의 시나리오가 생성되었습니다</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="scenario in scenarios"
                  :key="scenario.id"
                  class="bg-white border-2 border-gray-200 rounded-xl p-5 hover:border-orange-primary hover:shadow-md transition-all"
                >
                  <!-- 헤더 -->
                  <div class="flex items-start justify-between mb-3">
                    <h4 class="font-bold text-gray-900 text-base flex-1 mr-2">{{ scenario.title }}</h4>
                    <div class="flex items-center gap-2">
                      <span class="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                        {{ scenario.language.toUpperCase() }}
                      </span>
                      <!-- 수정/삭제 버튼 -->
                      <button
                        @click="openEditDialog(scenario)"
                        class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="수정"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        @click="deleteScenario(scenario.id)"
                        class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="삭제"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- 설명 -->
                  <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ scenario.description }}</p>

                  <!-- 역할 -->
                  <div class="mb-3 space-y-1">
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-gray-500">내 역할:</span>
                      <span class="font-medium text-gray-700">{{ scenario.roles.user }}</span>
                    </div>
                    <div class="flex items-center gap-2 text-xs">
                      <span class="text-gray-500">상대 역할:</span>
                      <span class="font-medium text-gray-700">{{ scenario.roles.ai }}</span>
                    </div>
                  </div>

                  <!-- 태그들 -->
                  <div class="flex flex-wrap gap-2 mb-3">
                    <span class="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                      {{ scenario.difficulty === 'beginner' ? '초급' : scenario.difficulty === 'intermediate' ? '중급' : '고급' }}
                    </span>
                    <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                      {{ scenario.category }}
                    </span>
                  </div>

                  <!-- 필수 용어 -->
                  <div v-if="scenario.requiredTerminology && scenario.requiredTerminology.length > 0" class="mb-3">
                    <p class="text-xs text-gray-500 mb-1">핵심 용어:</p>
                    <div class="flex flex-wrap gap-1">
                      <span
                        v-for="term in scenario.requiredTerminology.slice(0, 3)"
                        :key="term"
                        class="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded"
                      >
                        {{ term }}
                      </span>
                      <span
                        v-if="scenario.requiredTerminology.length > 3"
                        class="text-xs px-2 py-0.5 text-gray-500"
                      >
                        +{{ scenario.requiredTerminology.length - 3 }}
                      </span>
                    </div>
                  </div>

                  <!-- 액션 버튼 -->
                  <button
                    @click="startPractice(scenario.id)"
                    class="w-full py-2 bg-orange-primary text-white text-sm font-medium rounded-lg hover:bg-orange-medium transition-colors"
                  >
                    연습 시작하기
                  </button>
                </div>
              </div>
            </div>

            <!-- 시나리오 없을 때 -->
            <div v-else class="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h4 class="text-lg font-semibold text-gray-700 mb-2">AI 회화 연습</h4>
              <p class="text-gray-500 text-sm mb-4">
                프로젝트와 일정을 기반으로 시나리오를 생성할 수 있습니다.
              </p>
              <p class="text-gray-400 text-xs">
                우측 상단의 "시나리오 생성" 버튼을 클릭하여 시작하세요.
              </p>
            </div>
          </div>

          <!-- 시나리오가 없을 때 -->
          <div v-else class="flex items-center justify-center h-64">
            <div class="text-center">
              <svg class="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p class="text-gray-500 text-lg mb-2">생성된 시나리오가 없습니다</p>
              <p class="text-gray-400 text-sm">우측 상단의 "시나리오 생성" 버튼을 클릭하여 시나리오를 생성하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Scenario Generation Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeCreateDialog">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <h3 class="text-xl font-bold text-gray-800 mb-4">시나리오 생성</h3>

        <!-- Tabs -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            @click="creationMode = 'auto'"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              creationMode === 'auto'
                ? 'border-orange-primary text-orange-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            프로젝트 기반 자동 생성
          </button>
          <button
            @click="creationMode = 'manual'"
            :class="[
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              creationMode === 'manual'
                ? 'border-orange-primary text-orange-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            ]"
          >
            직접 입력
          </button>
        </div>

        <!-- Auto Generation Form -->
        <div v-if="creationMode === 'auto'" class="space-y-4">
          <!-- Language selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">회화 언어</label>
            <select v-model="generateOptions.language" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option value="en">English</option>
              <option value="zh">中文</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
            </select>
          </div>

          <!-- Difficulty selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">난이도</label>
            <select v-model="generateOptions.difficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option value="beginner">초급</option>
              <option value="intermediate">중급</option>
              <option value="advanced">고급</option>
            </select>
          </div>

          <!-- Project Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택 (선택사항)</label>
            <select v-model="selectedProjectForGeneration" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option :value="null">선택 안 함</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Schedule Selection (Only shows when project is selected) -->
          <div v-if="selectedProjectForGeneration">
            <label class="block text-sm font-medium text-gray-700 mb-2">일정 선택 (선택사항)</label>
            <select v-model="selectedScheduleId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option :value="null">선택 안 함 (프로젝트 전체)</option>
              <option v-for="schedule in schedulesForSelectedProject" :key="schedule.id" :value="schedule.id">
                {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">일정을 선택하지 않으면 프로젝트 전체 시나리오가 생성됩니다</p>
          </div>

          <!-- Count selector -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">생성 개수</label>
            <input
              v-model.number="generateOptions.count"
              type="number"
              min="1"
              max="10"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Manual Creation Form -->
        <div v-else class="space-y-4">
          <!-- Common options -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">회화 언어</label>
              <select v-model="generateOptions.language" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select v-model="generateOptions.difficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>
          </div>

          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시나리오 제목 *</label>
            <input
              v-model="manualScenario.title"
              type="text"
              placeholder="예: 제품 데모 준비 회의 / Product Demo Preparation Meeting"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
          </div>

          <!-- Scenario Description (Merged) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시나리오 설명 *</label>
            <textarea
              v-model="manualScenario.scenarioText"
              rows="4"
              placeholder="예: You are preparing for an important product demonstration. Discuss with your team about the key features to highlight and the presentation flow."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">선택한 회화 언어로 작성하세요</p>
          </div>

          <!-- Project Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">프로젝트 선택 (선택사항)</label>
            <select v-model="selectedProjectForGeneration" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option :value="null">선택 안 함</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Schedule Selection (Only shows when project is selected) -->
          <div v-if="selectedProjectForGeneration">
            <label class="block text-sm font-medium text-gray-700 mb-2">일정 선택 (선택사항)</label>
            <select v-model="selectedScheduleId" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
              <option :value="null">선택 안 함 (프로젝트 전체)</option>
              <option v-for="schedule in schedulesForSelectedProject" :key="schedule.id" :value="schedule.id">
                {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">일정을 선택하지 않으면 프로젝트 전체 시나리오가 생성됩니다</p>
          </div>

          <!-- Roles -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">내 역할 *</label>
              <input
                v-model="manualScenario.userRole"
                type="text"
                placeholder="예: Product Manager"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상대 역할 *</label>
              <input
                v-model="manualScenario.aiRole"
                type="text"
                placeholder="예: Team Lead"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- Required Terminology -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">필수 용어 (쉼표로 구분)</label>
            <input
              v-model="manualScenario.requiredTerminology"
              type="text"
              placeholder="예: demonstration, feature, presentation, stakeholder"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
            <p class="text-xs text-gray-500 mt-1">쉼표(,)로 구분하여 입력하세요</p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            @click="closeCreateDialog"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            @click="handleGenerateScenarios"
            :disabled="creationMode === 'manual' && !isManualFormValid"
            :class="[
              'px-4 py-2 rounded-lg transition-colors font-medium',
              creationMode === 'manual' && !isManualFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-primary text-white hover:bg-orange-medium'
            ]"
          >
            {{ creationMode === 'auto' ? '생성하기' : '추가하기' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Scenario Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="showEditDialog = false">
      <div class="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <h3 class="text-xl font-bold text-gray-800 mb-4">시나리오 수정</h3>

        <div class="space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">제목 *</label>
            <input
              v-model="editingScenario.title"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
          </div>

          <!-- Scenario Text -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">시나리오 설명 *</label>
            <textarea
              v-model="editingScenario.scenarioText"
              rows="6"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            ></textarea>
          </div>

          <!-- Roles -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">내 역할 *</label>
              <input
                v-model="editingScenario.roles.user"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">상대 역할 *</label>
              <input
                v-model="editingScenario.roles.ai"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
              />
            </div>
          </div>

          <!-- Language & Difficulty -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">언어</label>
              <select v-model="editingScenario.language" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
                <option value="en">영어 (English)</option>
                <option value="ko">한국어 (Korean)</option>
                <option value="zh">중국어 (Chinese)</option>
                <option value="ja">일본어 (Japanese)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">난이도</label>
              <select v-model="editingScenario.difficulty" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent">
                <option value="beginner">초급 (Beginner)</option>
                <option value="intermediate">중급 (Intermediate)</option>
                <option value="advanced">고급 (Advanced)</option>
              </select>
            </div>
          </div>

          <!-- Required Terminology -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">핵심 용어 (선택사항)</label>
            <input
              v-model="editingScenario.requiredTerminologyText"
              type="text"
              placeholder="쉼표로 구분하여 입력 (예: project, deadline, budget)"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="showEditDialog = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            @click="saveEditedScenario"
            :disabled="!isEditFormValid"
            :class="[
              'px-4 py-2 rounded-lg transition-colors font-medium',
              !isEditFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-primary text-white hover:bg-orange-medium'
            ]"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { projectService } from '@/services/projectService'
import { scenarioService } from '@/services/scenarioService'

const router = useRouter()

const projects = ref([])
const upcomingSchedules = ref([])
const selectedSchedules = ref([]) // 다중 선택을 위한 배열
const selectedProjects = ref([]) // 다중 선택을 위한 배열
const projectsLoading = ref(false)
const schedulesLoading = ref(false)

// Scenario generation state
const showCreateDialog = ref(false)
const creationMode = ref('auto') // 'auto' or 'manual'
const generateOptions = ref({
  language: 'en',
  difficulty: 'intermediate',
  count: 5
})
const manualScenario = ref({
  title: '',
  scenarioText: '',
  category: '일반',
  userRole: '',
  aiRole: '',
  requiredTerminology: ''
})
const scenarios = ref([])
const scenariosLoading = ref(false)
const selectedScheduleId = ref(null)
const selectedProjectForGeneration = ref(null)

// Edit scenario state
const showEditDialog = ref(false)
const editingScenario = ref({
  id: '',
  title: '',
  scenarioText: '',
  roles: { user: '', ai: '' },
  language: 'en',
  difficulty: 'intermediate',
  requiredTerminologyText: ''
})

// 프로젝트 아이콘 색상
const iconClasses = [
  'bg-gradient-to-br from-pink-400 to-pink-500',
  'bg-gradient-to-br from-blue-500 to-blue-600',
  'bg-gradient-to-br from-purple-500 to-purple-600',
  'bg-gradient-to-br from-green-500 to-green-600',
  'bg-gradient-to-br from-orange-500 to-orange-600',
  'bg-gradient-to-br from-indigo-500 to-indigo-600'
]

function getProjectIconClass(index) {
  return iconClasses[index % iconClasses.length]
}

// 프로젝트별 시나리오 개수 계산
function getProjectScenarioCount(projectId) {
  // scenarios 배열에서 해당 프로젝트를 포함하는 시나리오 개수 반환
  return scenarios.value.filter(scenario => {
    // scenario.projectIds가 없으면 빈 배열로 처리
    const projectIds = scenario.projectIds || []
    return projectIds.includes(projectId)
  }).length
}

// 수동 생성 폼 유효성 검사
const isManualFormValid = computed(() => {
  return (
    manualScenario.value.title.trim() !== '' &&
    manualScenario.value.scenarioText.trim() !== '' &&
    manualScenario.value.userRole.trim() !== '' &&
    manualScenario.value.aiRole.trim() !== ''
  )
})

// 수정 폼 유효성 검사
const isEditFormValid = computed(() => {
  return (
    editingScenario.value.title.trim() !== '' &&
    editingScenario.value.scenarioText.trim() !== '' &&
    editingScenario.value.roles.user.trim() !== '' &&
    editingScenario.value.roles.ai.trim() !== ''
  )
})

// 시나리오 생성용: 선택된 프로젝트의 일정만 표시
const schedulesForSelectedProject = computed(() => {
  if (!selectedProjectForGeneration.value) {
    return []
  }

  // 선택된 프로젝트의 일정만 필터링
  return upcomingSchedules.value.filter(schedule =>
    schedule.projectId === selectedProjectForGeneration.value
  )
})

// 필터링된 일정 (선택된 프로젝트에 따라)
const filteredSchedules = computed(() => {
  // 프로젝트가 선택되지 않은 경우 모든 일정 표시
  if (selectedProjects.value.length === 0) {
    return upcomingSchedules.value
  }

  // 선택된 프로젝트의 ID 목록
  const selectedProjectIds = selectedProjects.value.map(p => p.id)

  // 선택된 프로젝트에 속한 일정만 필터링
  return upcomingSchedules.value.filter(schedule =>
    selectedProjectIds.includes(schedule.projectId)
  )
})

// 날짜별 그룹화
const groupedSchedules = computed(() => {
  const groups = {}
  filteredSchedules.value.forEach(schedule => {
    const date = schedule.startTime.split('T')[0]
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(schedule)
  })
  return groups
})

// 날짜 포맷팅
function formatGroupDate(dateString) {
  const date = new Date(dateString)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateOnly = date.toDateString()
  const todayOnly = today.toDateString()
  const tomorrowOnly = tomorrow.toDateString()

  if (dateOnly === todayOnly) return '오늘'
  if (dateOnly === tomorrowOnly) return '내일'

  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

function formatScheduleTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const today = new Date()
  const dateOnly = date.toDateString()
  const todayOnly = today.toDateString()

  if (dateOnly === todayOnly) {
    return `오늘 ${date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })}`
  }

  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
         date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

// 일정이 선택되었는지 확인
function isScheduleSelected(scheduleId) {
  return selectedSchedules.value.some(s => s.id === scheduleId)
}

// 일정 선택/해제 토글 (다중 선택)
async function toggleScheduleSelection(schedule) {
  const index = selectedSchedules.value.findIndex(s => s.id === schedule.id)
  if (index > -1) {
    // 이미 선택된 경우 제거
    selectedSchedules.value.splice(index, 1)
  } else {
    // 선택되지 않은 경우 추가
    selectedSchedules.value.push(schedule)
  }

  // 일정 선택/해제 시 시나리오 로드
  await loadScenariosForSchedules()
}

// 선택된 프로젝트/일정의 시나리오 로드
async function loadScenariosForSchedules() {
  // 프로젝트나 일정이 하나도 선택되지 않았으면 빈 배열
  if (selectedSchedules.value.length === 0 && selectedProjects.value.length === 0) {
    scenarios.value = []
    return
  }

  scenariosLoading.value = true
  try {
    const filters = {}

    // 일정 필터 (우선순위 높음) - 선택된 모든 일정
    if (selectedSchedules.value.length > 0) {
      filters.schedule_ids = selectedSchedules.value.map(s => s.id).join(',')
    }
    // 프로젝트 필터 (일정이 없을 때만) - 선택된 모든 프로젝트
    else if (selectedProjects.value.length > 0) {
      filters.project_ids = selectedProjects.value.map(p => p.id).join(',')
    }

    const response = await scenarioService.getAll(filters)
    scenarios.value = response.data.data?.scenarios || []
  } catch (error) {
    console.error('Failed to load scenarios:', error)
    scenarios.value = []
  } finally {
    scenariosLoading.value = false
  }
}

// 프로젝트가 선택되었는지 확인
function isProjectSelected(projectId) {
  return selectedProjects.value.some(p => p.id === projectId)
}

// 프로젝트 선택/해제 토글 (다중 선택)
async function toggleProjectSelection(project) {
  const index = selectedProjects.value.findIndex(p => p.id === project.id)
  if (index > -1) {
    // 이미 선택된 경우 제거
    selectedProjects.value.splice(index, 1)
  } else {
    // 선택되지 않은 경우 추가
    selectedProjects.value.push(project)
  }

  // 프로젝트 선택/해제 시 시나리오 로드 (일정이 선택되지 않았을 때만)
  if (selectedSchedules.value.length === 0) {
    await loadScenariosForSchedules()
  }
}

// 생성 다이얼로그 닫기 및 초기화
function closeCreateDialog() {
  showCreateDialog.value = false
  selectedProjectForGeneration.value = null
  selectedScheduleId.value = null
}

// 시나리오 생성 핸들러 (Phase 4: 문서 ID 포함)
async function handleGenerateScenarios() {
  scenariosLoading.value = true
  showCreateDialog.value = false

  try {
    if (creationMode.value === 'auto') {
      // 자동 생성 모드

      // 다이얼로그에서 선택한 프로젝트 사용 (없으면 사이드바에서 선택한 프로젝트들 사용)
      const projectsToUse = selectedProjectForGeneration.value
        ? [{ id: selectedProjectForGeneration.value }]
        : selectedProjects.value

      if (projectsToUse.length === 0) {
        alert('프로젝트를 선택해주세요.')
        scenariosLoading.value = false
        showCreateDialog.value = true
        return
      }

      // 선택된 프로젝트의 모든 문서 ID 수집
      let documentIds = []
      for (const project of projectsToUse) {
        try {
          const response = await projectService.getProjectDocuments(project.id)
          const documents = response.data.data || response.data || []
          documentIds.push(...documents.map(d => d.id))
        } catch (error) {
          console.warn(`Failed to fetch documents for project ${project.id}:`, error)
        }
      }

      // 다이얼로그에서 선택한 일정 사용
      const currentScheduleIds = selectedScheduleId.value ? [selectedScheduleId.value] : []

      const params = {
        projectIds: projectsToUse.map(p => p.id),
        scheduleIds: currentScheduleIds,
        documentIds: documentIds,
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        count: generateOptions.value.count
      }

      // 백엔드 API 호출
      await scenarioService.generateFromProjects(params)

      // 생성 후 DB에서 다시 로드
      await loadScenariosForSchedules()
    } else {
      // 수동 생성 모드
      console.log('Creating manual scenario:', manualScenario.value)

      // Generate brief description from scenarioText (first 2 sentences)
      const sentences = manualScenario.value.scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
      const description = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')

      const scenarioData = {
        title: manualScenario.value.title,
        description: description || manualScenario.value.scenarioText.substring(0, 100),
        scenarioText: manualScenario.value.scenarioText,
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: manualScenario.value.category,
        roles: {
          user: manualScenario.value.userRole,
          ai: manualScenario.value.aiRole
        },
        requiredTerminology: manualScenario.value.requiredTerminology
          ? manualScenario.value.requiredTerminology.split(',').map(t => t.trim()).filter(t => t)
          : [],
        autoGenerated: false
      }

      // 백엔드 API 호출 시도
      const response = await scenarioService.create(scenarioData)
      console.log('Successfully created manual scenario:', response)

      // 폼 초기화
      manualScenario.value = {
        title: '',
        scenarioText: '',
        category: '일반',
        userRole: '',
        aiRole: '',
        requiredTerminology: ''
      }

      // 생성 후 DB에서 다시 로드
      await loadScenariosForSchedules()
    }
  } catch (error) {
    console.error('❌ API Error Details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url
    })
    console.warn('Backend not available yet, using dummy data:', error.message)

    if (creationMode.value === 'manual') {
      // 수동 생성 모드 - 입력된 데이터로 시나리오 생성
      const sentences = manualScenario.value.scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
      const description = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')

      const newScenario = {
        id: Date.now().toString(),
        title: manualScenario.value.title,
        description: description || manualScenario.value.scenarioText.substring(0, 100),
        scenarioText: manualScenario.value.scenarioText,
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: manualScenario.value.category,
        roles: {
          user: manualScenario.value.userRole,
          ai: manualScenario.value.aiRole
        },
        requiredTerminology: manualScenario.value.requiredTerminology
          ? manualScenario.value.requiredTerminology.split(',').map(t => t.trim()).filter(t => t)
          : [],
        createdAt: new Date().toISOString(),
        autoGenerated: false
      }

      scenarios.value = [...scenarios.value, newScenario]

      // 폼 초기화
      manualScenario.value = {
        title: '',
        scenarioText: '',
        category: '일반',
        userRole: '',
        aiRole: '',
        requiredTerminology: ''
      }
    } else {
      // 자동 생성 모드 - 더미 데이터 사용
      const dummyScenarios = [
      {
        id: '1',
        title: '제품 데모 준비 회의',
        description: '신제품 발표를 위한 데모 시나리오를 준비하는 회의입니다.',
        scenarioText: 'You are preparing for an important product demonstration. Discuss with your team about the key features to highlight and the presentation flow.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: '협업',
        roles: {
          user: 'Product Manager',
          ai: 'Development Team Lead'
        },
        requiredTerminology: ['demonstration', 'feature', 'presentation', 'stakeholder'],
        createdAt: new Date().toISOString(),
        autoGenerated: true
      },
      {
        id: '2',
        title: '기술 지원 요청 처리',
        description: '고객의 기술 지원 요청을 처리하는 시나리오입니다.',
        scenarioText: 'A customer is experiencing technical issues with the product. Help them troubleshoot and resolve the problem.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: '기술 지원',
        roles: {
          user: 'Technical Support Engineer',
          ai: 'Customer'
        },
        requiredTerminology: ['troubleshooting', 'configuration', 'error log', 'resolution'],
        createdAt: new Date().toISOString(),
        autoGenerated: true
      },
      {
        id: '3',
        title: '프로젝트 진행 상황 보고',
        description: '프로젝트 진행 상황을 팀에 보고하는 시나리오입니다.',
        scenarioText: 'Present the current project status to your team, including completed tasks, upcoming milestones, and any potential risks.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: '협업',
        roles: {
          user: 'Project Coordinator',
          ai: 'Team Member'
        },
        requiredTerminology: ['milestone', 'deadline', 'progress', 'deliverable'],
        createdAt: new Date().toISOString(),
        autoGenerated: true
      },
      {
        id: '4',
        title: '고객 미팅 일정 조율',
        description: '중요한 고객과의 미팅 일정을 조율하는 시나리오입니다.',
        scenarioText: 'Coordinate with a client to schedule an important meeting, discussing availability and preferences.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: '협업',
        roles: {
          user: 'Account Manager',
          ai: 'Client Representative'
        },
        requiredTerminology: ['schedule', 'availability', 'meeting', 'coordination'],
        createdAt: new Date().toISOString(),
        autoGenerated: true
      },
      {
        id: '5',
        title: '제품 사양 설명',
        description: '신제품의 기술 사양을 고객에게 설명하는 시나리오입니다.',
        scenarioText: 'Explain the technical specifications and features of a new product to a potential customer.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: '제품 설명',
        roles: {
          user: 'Sales Engineer',
          ai: 'Potential Customer'
        },
        requiredTerminology: ['specification', 'feature', 'capability', 'requirement'],
        createdAt: new Date().toISOString(),
        autoGenerated: true
      }
      ]

      // 선택한 개수만큼만 반환
      scenarios.value = dummyScenarios.slice(0, generateOptions.value.count)
    }
  } finally {
    scenariosLoading.value = false
  }
}

// 시나리오 수정 다이얼로그 열기
function openEditDialog(scenario) {
  editingScenario.value = {
    id: scenario.id,
    title: scenario.title,
    scenarioText: scenario.scenarioText,
    roles: { ...scenario.roles },
    language: scenario.language,
    difficulty: scenario.difficulty,
    requiredTerminologyText: scenario.requiredTerminology ? scenario.requiredTerminology.join(', ') : ''
  }
  showEditDialog.value = true
}

// 시나리오 수정 저장
async function saveEditedScenario() {
  try {
    scenariosLoading.value = true
    showEditDialog.value = false

    // Generate brief description from scenarioText
    const sentences = editingScenario.value.scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
    const description = sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')

    const updateData = {
      title: editingScenario.value.title,
      description: description || editingScenario.value.scenarioText.substring(0, 100),
      scenarioText: editingScenario.value.scenarioText,
      language: editingScenario.value.language,
      difficulty: editingScenario.value.difficulty,
      roles: editingScenario.value.roles,
      requiredTerminology: editingScenario.value.requiredTerminologyText
        ? editingScenario.value.requiredTerminologyText.split(',').map(t => t.trim()).filter(t => t)
        : []
    }

    // API 호출 (업데이트 엔드포인트가 있다면)
    await scenarioService.update(editingScenario.value.id, updateData)
    console.log('✅ Scenario updated successfully')

    // 시나리오 목록 새로고침
    await loadScenariosForSchedules()
  } catch (error) {
    console.error('❌ Failed to update scenario:', error)
    alert('시나리오 수정에 실패했습니다.')
  } finally {
    scenariosLoading.value = false
  }
}

// 시나리오 연습 시작
function startPractice(scenarioId) {
  router.push(`/conversation/practice/${scenarioId}`)
}

// 시나리오 삭제
async function deleteScenario(scenarioId) {
  if (!confirm('이 시나리오를 삭제하시겠습니까?')) {
    return
  }

  try {
    scenariosLoading.value = true
    await scenarioService.delete(scenarioId)
    console.log('🗑️  Scenario deleted successfully')

    // 시나리오 목록 새로고침
    await loadScenariosForSchedules()
  } catch (error) {
    console.error('❌ Failed to delete scenario:', error)
    alert('시나리오 삭제에 실패했습니다.')
  } finally {
    scenariosLoading.value = false
  }
}

// 프로젝트 로드
async function loadProjects() {
  projectsLoading.value = true
  try {
    const response = await projectService.getAll()
    projects.value = response.data.data || response.data || []
  } catch (error) {
    console.error('Failed to load projects:', error)
    projects.value = []
  } finally {
    projectsLoading.value = false
  }
}

// 모든 프로젝트의 일정 로드
async function loadAllUpcomingSchedules() {
  if (projects.value.length === 0) return

  schedulesLoading.value = true
  try {
    const allSchedules = []
    const now = new Date()

    // 각 프로젝트의 일정 가져오기
    for (const project of projects.value) {
      try {
        const response = await projectService.getProjectSchedules(project.id)
        const schedules = response.data.data || response.data || []

        // 미래 일정만 필터링하고 프로젝트 정보 추가
        schedules.forEach(schedule => {
          if (new Date(schedule.startTime) >= now) {
            allSchedules.push({
              ...schedule,
              projectId: project.id,
              projectName: project.name
            })
          }
        })
      } catch (error) {
        console.error(`Failed to load schedules for project ${project.id}:`, error)
      }
    }

    // 시간순 정렬
    upcomingSchedules.value = allSchedules.sort((a, b) =>
      new Date(a.startTime) - new Date(b.startTime)
    )
  } catch (error) {
    console.error('Failed to load schedules:', error)
    upcomingSchedules.value = []
  } finally {
    schedulesLoading.value = false
  }
}

onMounted(async () => {
  await loadProjects()
  await loadAllUpcomingSchedules()
})
</script>

<style scoped>
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
