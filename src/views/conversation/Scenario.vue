<template>
  <div class="h-full flex flex-col relative">
    <!-- Header -->
    <div class="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between px-8 border-b border-gray-100">
      <div class="flex items-center gap-4">
        <h2 class="text-2xl font-bold text-gray-800 font-nanum-round-eb">시나리오 회화 연습</h2>
        <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ scenarios.length }}</span>
      </div>
      
      <div class="flex items-center gap-4">
        <button 
          @click="showCreateDialog = true"
          class="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          Create Scenario
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex pt-20 overflow-hidden">
      <!-- Left Sidebar (Filters) -->
      <div class="w-80 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-hidden">
        <div class="p-6 flex-1 overflow-y-auto space-y-8">
          
          <!-- Upcoming Schedules -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase">Upcoming Schedules</h3>
              <span v-if="selectedSchedules.length > 0" class="text-xs text-blue-600 font-bold">{{ selectedSchedules.length }} selected</span>
            </div>
            
            <div v-if="schedulesLoading" class="space-y-3">
              <div v-for="i in 3" :key="i" class="h-16 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <div v-else-if="filteredSchedules.length > 0" class="space-y-6">
              <div v-for="(group, date) in groupedSchedules" :key="date">
                <div class="text-xs font-semibold text-gray-500 mb-3 ml-1">{{ formatGroupDate(date) }}</div>
                <div class="space-y-2">
                  <div
                    v-for="schedule in group"
                    :key="schedule.id"
                    @click="toggleScheduleSelection(schedule)"
                    class="group p-4 rounded-2xl cursor-pointer transition-all duration-200 border relative overflow-hidden"
                    :class="isScheduleSelected(schedule.id) ? 'bg-white border-blue-500 shadow-md' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm'"
                  >
                    <div class="flex justify-between items-start mb-1">
                      <span class="text-sm font-bold text-gray-900">{{ formatTime(schedule.startTime) }}</span>
                      <span class="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-medium truncate max-w-[80px]">
                        {{ schedule.projectName || 'No Project' }}
                      </span>
                    </div>
                    <h4 class="text-sm font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{{ schedule.title }}</h4>
                    <div v-if="isScheduleSelected(schedule.id)" class="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-r-[12px] border-t-blue-500 border-r-blue-500 rounded-bl-md"></div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-gray-400">
              <p class="text-sm">No upcoming schedules</p>
            </div>
          </div>

          <!-- Projects -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xs font-bold text-gray-400 tracking-wider uppercase">Projects</h3>
              <span v-if="selectedProjects.length > 0" class="text-xs text-blue-600 font-bold">{{ selectedProjects.length }} selected</span>
            </div>

            <div v-if="projectsLoading" class="space-y-2">
              <div v-for="i in 3" :key="i" class="h-10 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>

            <div v-else-if="projects.length > 0" class="space-y-2">
              <div
                v-for="(project, index) in projects"
                :key="project.id"
                @click="toggleProjectSelection(project)"
                class="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all duration-200 hover:bg-white hover:shadow-sm"
                :class="isProjectSelected(project.id) ? 'bg-white shadow-sm ring-1 ring-blue-500' : ''"
              >
                <div :class="getProjectIconClass(index)" class="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {{ project.name.substring(0, 1) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold text-gray-800 truncate">{{ project.name }}</div>
                  <div class="text-xs text-gray-500">{{ getProjectScenarioCount(project.id) }} scenarios</div>
                </div>
                <div v-if="isProjectSelected(project.id)" class="w-2 h-2 bg-blue-500 rounded-full"></div>
              </div>
            </div>
             <div v-else class="text-center py-8 text-gray-400">
              <p class="text-sm">No projects found</p>
            </div>
          </div>

        </div>
      </div>

      <!-- Right Content (Scenarios Grid) -->
      <div class="flex-1 overflow-y-auto bg-white p-8">
        <div v-if="scenariosLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <div v-else-if="scenarios.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="scenario in scenarios"
            :key="scenario.id"
            class="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
          >
            <!-- Card Header -->
            <div class="flex justify-between items-start mb-4">
              <div class="flex gap-2">
                <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                  {{ scenario.language }}
                </span>
                <span 
                  class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
                  :class="{
                    'bg-green-100 text-green-700': scenario.difficulty === 'beginner',
                    'bg-yellow-100 text-yellow-700': scenario.difficulty === 'intermediate',
                    'bg-red-100 text-red-700': scenario.difficulty === 'advanced'
                  }"
                >
                  {{ scenario.difficulty }}
                </span>
              </div>
              
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click.stop="openEditDialog(scenario)" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button @click.stop="deleteScenario(scenario.id)" class="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <!-- Title & Desc -->
            <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{{ scenario.title }}</h3>
            <p class="text-sm text-gray-500 mb-6 line-clamp-3 flex-1">{{ scenario.description }}</p>

            <!-- Roles -->
            <div class="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div class="flex items-center gap-2 text-xs">
                <span class="w-16 text-gray-400 font-medium">You</span>
                <span class="font-bold text-gray-800">{{ scenario.roles.user }}</span>
              </div>
              <div class="flex items-center gap-2 text-xs">
                <span class="w-16 text-gray-400 font-medium">AI</span>
                <span class="font-bold text-gray-800">{{ scenario.roles.ai }}</span>
              </div>
            </div>

            <!-- Action -->
            <button 
              @click="startPractice(scenario.id)"
              class="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
            >
              <span>Start Practice</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="h-full flex flex-col items-center justify-center text-gray-400">
          <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
            <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">No Scenarios Found</h3>
          <p class="text-gray-500 max-w-sm text-center mb-8">Select a schedule or project from the left sidebar, or create a new scenario manually.</p>
          <button @click="showCreateDialog = true" class="text-blue-600 font-bold hover:underline">Create New Scenario</button>
        </div>
      </div>
    </div>

    <!-- Create Dialog -->
    <div v-if="showCreateDialog" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="closeCreateDialog">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <!-- Header -->
        <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 class="text-2xl font-bold text-gray-900">Create Scenario</h3>
          <button @click="closeCreateDialog" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-y-auto p-8">
          <!-- Tabs -->
          <div class="flex p-1 bg-gray-100 rounded-xl mb-8">
            <button
              @click="creationMode = 'auto'"
              class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
              :class="creationMode === 'auto' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              Auto Generate
            </button>
            <button
              @click="creationMode = 'manual'"
              class="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
              :class="creationMode === 'manual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            >
              Manual Input
            </button>
          </div>

          <!-- Auto Form -->
          <div v-if="creationMode === 'auto'" class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Language</label>
                <select v-model="generateOptions.language" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
                <select v-model="generateOptions.difficulty" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Project (Optional)</label>
              <select v-model="selectedProjectForGeneration" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                <option :value="null">None</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">{{ project.name }}</option>
              </select>
            </div>

            <div v-if="selectedProjectForGeneration" class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Schedule (Optional)</label>
              <select v-model="selectedScheduleId" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                <option :value="null">None (Use entire project)</option>
                <option v-for="schedule in schedulesForSelectedProject" :key="schedule.id" :value="schedule.id">
                  {{ schedule.title }} - {{ formatScheduleTime(schedule.startTime) }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Count</label>
              <input v-model.number="generateOptions.count" type="number" min="1" max="10" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
            </div>
          </div>

          <!-- Manual Form -->
          <div v-else class="space-y-6">
            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Language</label>
                <select v-model="generateOptions.language" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                </select>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
                <select v-model="generateOptions.difficulty" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
              <input v-model="manualScenario.title" type="text" placeholder="e.g. Product Demo Meeting" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
            </div>

            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
              <textarea v-model="manualScenario.scenarioText" rows="4" placeholder="Describe the scenario context..." class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Role</label>
                <input v-model="manualScenario.userRole" type="text" placeholder="e.g. PM" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Role</label>
                <input v-model="manualScenario.aiRole" type="text" placeholder="e.g. Developer" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Keywords (Comma separated)</label>
              <input v-model="manualScenario.requiredTerminology" type="text" placeholder="e.g. agile, sprint, backlog" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <button @click="closeCreateDialog" class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button 
            @click="handleGenerateScenarios"
            :disabled="creationMode === 'manual' && !isManualFormValid"
            class="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ creationMode === 'auto' ? 'Generate' : 'Create' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <div v-if="showEditDialog" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click="showEditDialog = false">
      <div class="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" @click.stop>
        <div class="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
          <h3 class="text-2xl font-bold text-gray-900">Edit Scenario</h3>
          <button @click="showEditDialog = false" class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto p-8 space-y-6">
          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
            <input v-model="editingScenario.title" type="text" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea v-model="editingScenario.scenarioText" rows="6" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Role</label>
              <input v-model="editingScenario.roles.user" type="text" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Role</label>
              <input v-model="editingScenario.roles.ai" type="text" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Language</label>
              <select v-model="editingScenario.language" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
                <option value="ko">한국어</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Difficulty</label>
              <select v-model="editingScenario.difficulty" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">Keywords</label>
            <input v-model="editingScenario.requiredTerminologyText" type="text" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800">
          </div>
        </div>

        <div class="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <button @click="showEditDialog = false" class="px-6 py-3 text-gray-500 font-bold hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button 
            @click="saveEditedScenario"
            :disabled="!isEditFormValid"
            class="px-8 py-3 bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 hover:bg-gray-800 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
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
  category: 'General',
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
  'bg-gradient-to-br from-violet-500 to-violet-600',
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

  if (dateOnly === todayOnly) return 'Today'
  if (dateOnly === tomorrowOnly) return 'Tomorrow'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
}

function formatTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatScheduleTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const today = new Date()
  const dateOnly = date.toDateString()
  const todayOnly = today.toDateString()

  if (dateOnly === todayOnly) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
         date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
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
        alert('Please select a project.')
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
        category: 'General',
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
        category: 'General',
        userRole: '',
        aiRole: '',
        requiredTerminology: ''
      }
    } else {
      // 자동 생성 모드 - 더미 데이터 사용
      const dummyScenarios = [
      {
        id: '1',
        title: 'Product Demo Preparation',
        description: 'Meeting to prepare demo scenarios for new product launch.',
        scenarioText: 'You are preparing for an important product demonstration. Discuss with your team about the key features to highlight and the presentation flow.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: 'Collaboration',
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
        title: 'Tech Support Request',
        description: 'Scenario handling customer technical support request.',
        scenarioText: 'A customer is experiencing technical issues with the product. Help them troubleshoot and resolve the problem.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: 'Support',
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
        title: 'Project Status Report',
        description: 'Reporting project status to the team.',
        scenarioText: 'Present the current project status to your team, including completed tasks, upcoming milestones, and any potential risks.',
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        category: 'Collaboration',
        roles: {
          user: 'Project Coordinator',
          ai: 'Team Member'
        },
        requiredTerminology: ['milestone', 'deadline', 'progress', 'deliverable'],
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
    alert('Failed to update scenario.')
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
  if (!confirm('Are you sure you want to delete this scenario?')) {
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
    alert('Failed to delete scenario.')
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
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
