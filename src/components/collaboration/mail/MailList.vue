<script setup>
import MailListItem from './MailListItem.vue'

/**
 * MailList Component
 * 메일 목록 (그룹/플랫 모드)
 */
defineProps({
  /** 메일 목록 */
  emails: {
    type: Array,
    default: () => []
  },
  /** 프로젝트별 그룹화된 메일 */
  groupedEmails: {
    type: Array,
    default: () => []
  },
  /** 그룹 모드 여부 */
  isGroupedMode: {
    type: Boolean,
    default: true
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  },
  /** Outlook 연결 여부 */
  isConnected: {
    type: Boolean,
    default: false
  },
  /** 현재 폴더 */
  currentFolder: {
    type: String,
    default: 'Inbox'
  },
  /** 페이지네이션 */
  pagination: {
    type: Object,
    default: () => ({ page: 0, totalPages: 0 })
  }
})

const emit = defineEmits([
  'open-email',
  'prev-page',
  'next-page'
])
</script>

<template>
  <div class="flex-1 overflow-y-auto p-8">
    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="emails.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <p>{{ isConnected ? 'No emails found' : 'Connect Outlook to view emails' }}</p>
    </div>

    <!-- Grouped by Project -->
    <div v-else-if="isGroupedMode" class="space-y-8">
      <div v-for="group in groupedEmails" :key="group.projectId || 'unassigned'">
        <!-- Group Header -->
        <div class="flex items-center gap-3 mb-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="group.projectId ? 'bg-blue-500' : 'bg-gray-300'"></span>
            {{ group.projectName }}
            <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{{ group.emails.length }}</span>
          </h3>
        </div>

        <!-- Email Cards -->
        <div class="space-y-3">
          <MailListItem
            v-for="email in group.emails"
            :key="email.id"
            :email="email"
            :current-folder="currentFolder"
            @click="emit('open-email', $event)"
          />
        </div>
      </div>
    </div>

    <!-- Flat List -->
    <div v-else class="space-y-3">
      <MailListItem
        v-for="email in emails"
        :key="email.id"
        :email="email"
        :current-folder="currentFolder"
        :show-project="true"
        @click="emit('open-email', $event)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="flex justify-center gap-2 mt-8 pb-8">
      <button
        @click="emit('prev-page')"
        :disabled="pagination.page === 0"
        class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-600"
      >
        Previous
      </button>
      <span class="px-4 py-2 text-gray-700 font-medium text-sm flex items-center">
        {{ pagination.page + 1 }} / {{ pagination.totalPages }}
      </span>
      <button
        @click="emit('next-page')"
        :disabled="pagination.page >= pagination.totalPages - 1"
        class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-600"
      >
        Next
      </button>
    </div>
  </div>
</template>
