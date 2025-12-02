<script setup>
/**
 * MailToolbar Component
 * 폴더 탭, 프로젝트 필터, 검색
 */
defineProps({
  /** 현재 폴더 */
  currentFolder: {
    type: String,
    default: 'Inbox'
  },
  /** 현재 프로젝트 ID */
  currentProjectId: {
    type: [String, null],
    default: null
  },
  /** 검색어 */
  searchQuery: {
    type: String,
    default: ''
  },
  /** 프로젝트 목록 */
  projects: {
    type: Array,
    default: () => []
  },
  /** 읽지 않은 메일 수 */
  unreadCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'select-folder',
  'update:currentProjectId',
  'update:searchQuery',
  'search',
  'project-change'
])

const handleProjectChange = (event) => {
  const value = event.target.value === 'all' ? null : event.target.value
  emit('update:currentProjectId', value)
  emit('project-change')
}

const handleSearchInput = (event) => {
  emit('update:searchQuery', event.target.value)
}

const handleSearchEnter = () => {
  emit('search')
}
</script>

<template>
  <div class="px-8 py-4 bg-white/60 backdrop-blur-sm border-b border-gray-100 flex-none">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <!-- Left: Inbox/Sent Tabs -->
      <div class="flex p-1 bg-gray-100 rounded-xl">
        <button
          @click="emit('select-folder', 'Inbox')"
          :class="currentFolder === 'Inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          class="px-6 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
        >
          받은 메일함
          <span v-if="unreadCount > 0 && currentFolder === 'Inbox'" class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {{ unreadCount }}
          </span>
        </button>
        <button
          @click="emit('select-folder', 'SentItems')"
          :class="currentFolder === 'SentItems' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          class="px-6 py-2 rounded-lg transition-all text-sm font-medium"
        >
          보낸 메일함
        </button>
      </div>

      <!-- Right: Project Filter & Search -->
      <div class="flex gap-3 w-full md:w-auto">
        <select
          :value="currentProjectId ?? 'all'"
          @change="handleProjectChange"
          class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm text-gray-700 min-w-[160px]"
        >
          <option value="all">모든 프로젝트</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>

        <div class="relative flex-1 md:w-80">
          <input
            :value="searchQuery"
            @input="handleSearchInput"
            @keyup.enter="handleSearchEnter"
            type="text"
            placeholder="메일을 검색하세요"
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
          >
          <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>
