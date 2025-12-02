<script setup>
/**
 * MailListItem Component
 * 개별 메일 아이템 카드
 */
defineProps({
  /** 메일 데이터 */
  email: {
    type: Object,
    required: true
  },
  /** 현재 폴더 */
  currentFolder: {
    type: String,
    default: 'Inbox'
  },
  /** 프로젝트 표시 여부 */
  showProject: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

/**
 * 날짜 포맷
 */
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

/**
 * 발신자/수신자 표시
 */
const getDisplayName = (email, currentFolder) => {
  if (currentFolder === 'SentItems') {
    return email.toRecipients?.split(';')[0].trim() || '(No Recipient)'
  }
  return email.fromName || email.fromAddress
}
</script>

<template>
  <div
    @click="emit('click', email.id)"
    class="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
    :class="{ 'bg-blue-50/30': !email.isRead }"
  >
    <!-- Unread Indicator -->
    <div v-if="!email.isRead" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

    <div class="flex justify-between items-start gap-4">
      <div class="flex-1 min-w-0">
        <!-- Subject -->
        <div class="flex items-center gap-2 mb-1.5">
          <h4 class="text-base font-semibold text-gray-900 truncate" :class="{ 'font-bold': !email.isRead }">
            {{ email.subject || '(No Subject)' }}
          </h4>
          <!-- Attachment Icon -->
          <span v-if="email.hasAttachments" class="text-gray-400 flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </span>
        </div>

        <!-- Sender/Recipient & Date -->
        <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span class="font-medium text-gray-900">
            {{ getDisplayName(email, currentFolder) }}
          </span>
          <span class="text-gray-300">•</span>
          <span class="text-gray-500">{{ formatDate(email.receivedDateTime) }}</span>
          <!-- Project Badge (optional) -->
          <span v-if="showProject && email.projectName" class="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
            {{ email.projectName }}
          </span>
        </div>

        <!-- Preview -->
        <p class="text-sm text-gray-500 line-clamp-2">
          {{ email.bodyPreview }}
        </p>
      </div>
    </div>
  </div>
</template>
