<script setup>
import { computed } from 'vue'

/**
 * MailDetail Component
 * 메일 상세 보기 모달
 */
const props = defineProps({
  /** 메일 데이터 */
  email: {
    type: Object,
    default: null
  },
  /** 선택된 프로젝트 ID */
  selectedProjectId: {
    type: [String, null],
    default: null
  },
  /** 프로젝트 목록 */
  projects: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close',
  'toggle-read',
  'assign-project',
  'delete',
  'update:selectedProjectId'
])

/**
 * HTML 콘텐츠 여부 판단
 */
const isHtmlContent = computed(() => {
  if (!props.email || !props.email.body) return false
  if (props.email.bodyType && (props.email.bodyType.toUpperCase() === 'HTML' || props.email.bodyType.toLowerCase() === 'html')) {
    return true
  }
  const htmlTagPattern = /<(html|body|div|p|span|br|table|tr|td|a|img|h1|h2|h3|h4|h5|h6|ul|ol|li)/i
  return htmlTagPattern.test(props.email.body)
})

/**
 * 날짜 포맷 (전체)
 */
const formatDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleProjectChange = (event) => {
  const value = event.target.value === 'null' ? null : event.target.value
  emit('update:selectedProjectId', value)
  emit('assign-project')
}
</script>

<template>
  <div
    v-if="email"
    class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-2 md:p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-4 md:px-8 py-4 md:py-6 border-b border-gray-100 bg-white">
        <div class="flex justify-between items-start gap-3 mb-4 md:mb-6">
          <h2 class="text-lg md:text-2xl font-bold text-gray-900 leading-tight line-clamp-2">{{ email.subject || '(No Subject)' }}</h2>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 p-1.5 md:p-2 hover:bg-gray-50 rounded-xl transition-colors flex-shrink-0">
            <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Sender Info -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4">
          <div class="flex items-center gap-2 md:gap-3">
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm md:text-lg flex-shrink-0">
              {{ (email.fromName || email.fromAddress)?.[0]?.toUpperCase() }}
            </div>
            <div class="min-w-0">
              <div class="font-semibold text-gray-900 text-sm md:text-base truncate">{{ email.fromName }}</div>
              <div class="text-xs md:text-sm text-gray-500 truncate">{{ email.fromAddress }}</div>
            </div>
          </div>

          <div class="text-xs md:text-sm text-gray-500 ml-10 md:ml-0">
            {{ formatDateFull(email.receivedDateTime) }}
          </div>
        </div>

        <!-- Recipients -->
        <div class="mt-3 md:mt-4 flex flex-col md:flex-row md:flex-wrap gap-1 md:gap-2 text-xs md:text-sm text-gray-600 bg-gray-50 p-2 md:p-3 rounded-xl">
          <div class="flex gap-2 truncate">
            <span class="font-medium text-gray-500 flex-shrink-0">To:</span>
            <span class="truncate">{{ email.toRecipients }}</span>
          </div>
          <div v-if="email.ccRecipients" class="flex gap-2 md:border-l md:border-gray-300 md:pl-2 md:ml-2 truncate">
            <span class="font-medium text-gray-500 flex-shrink-0">CC:</span>
            <span class="truncate">{{ email.ccRecipients }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-wrap gap-2 mt-4 md:mt-6">
          <button
            @click="emit('toggle-read')"
            class="px-3 md:px-4 py-1.5 md:py-2 bg-white border border-gray-200 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-50 transition text-xs md:text-sm font-medium shadow-sm"
          >
            {{ email.isRead ? 'Unread' : 'Read' }}
          </button>

          <div class="relative flex-1 min-w-[120px] md:min-w-[200px] md:flex-none">
            <select
              :value="selectedProjectId"
              @change="handleProjectChange"
              class="w-full px-3 md:px-4 py-1.5 md:py-2 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs md:text-sm appearance-none bg-white pr-7 md:pr-8"
              :class="email.projectId ? 'border-blue-200 bg-blue-50 text-blue-700' : 'text-gray-700'"
            >
              <option value="null">{{ email.projectId ? 'Unassign' : 'Assign Project' }}</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg class="h-3 w-3 md:h-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <button
            @click="emit('delete')"
            class="px-3 md:px-4 py-1.5 md:py-2 bg-red-50 text-red-600 border border-transparent rounded-lg md:rounded-xl hover:bg-red-100 transition text-xs md:text-sm font-medium ml-auto"
          >
            Delete
          </button>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
        <div
          v-if="isHtmlContent"
          v-html="email.body"
          class="prose max-w-none email-body text-gray-800"
        ></div>
        <div
          v-else
          class="whitespace-pre-wrap text-gray-800 font-sans"
        >{{ email.body }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.email-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.email-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.email-body :deep(table td),
.email-body :deep(table th) {
  border: 1px solid #e5e7eb;
  padding: 8px;
}

.email-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.email-body :deep(a:hover) {
  color: #1d4ed8;
}

.email-body :deep(p) {
  margin-bottom: 1em;
}

.email-body :deep(ul),
.email-body :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}
</style>
