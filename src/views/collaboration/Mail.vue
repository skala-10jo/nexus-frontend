<template>
  <div class="flex h-full overflow-hidden relative">
    <!-- Main Content Area -->
    <div
      class="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 pb-20 md:pb-0"
      :class="{ 'md:mr-[400px]': showChatPanel }"
    >
      <!-- Header -->
      <MailHeader
        :auth-status="authStatus"
        :syncing="syncing"
        :embedding="embedding"
        :show-profile-menu="showProfileMenu"
        @connect="handleConnect"
        @disconnect="handleDisconnect"
        @sync="handleSync"
        @compose="openComposeModal"
        @toggle-profile-menu="showProfileMenu = !showProfileMenu"
      />

      <!-- Toolbar -->
      <MailToolbar
        v-model:search-query="searchQuery"
        v-model:current-project-id="currentProjectId"
        :current-folder="currentFolder"
        :projects="projects"
        :unread-count="unreadCount"
        @select-folder="selectFolder"
        @search="searchMails"
        @project-change="onProjectChange"
      />

      <!-- Mail List -->
      <MailList
        :emails="emails"
        :grouped-emails="groupedEmails"
        :is-grouped-mode="isGroupedMode"
        :loading="loading"
        :is-connected="authStatus.isConnected"
        :current-folder="currentFolder"
        :pagination="pagination"
        @open-email="openEmail"
        @prev-page="prevPage"
        @next-page="nextPage"
      />
    </div>

    <!-- Email Detail Modal -->
    <MailDetail
      :email="selectedEmail"
      :selected-project-id="selectedProjectId"
      :projects="projects"
      @close="closeEmail"
      @toggle-read="toggleReadStatus"
      @assign-project="handleAssignProject"
      @delete="deleteEmail"
      @update:selected-project-id="selectedProjectId = $event"
    />

    <!-- Compose Modal -->
    <MailComposer
      :show="showComposeModal"
      :sending="sending"
      :new-email="newEmail"
      @close="closeComposeModal"
      @send="sendNewEmail"
      @update:to="newEmail.to = $event"
      @update:cc="newEmail.cc = $event"
      @update:subject="newEmail.subject = $event"
      @update:body="newEmail.body = $event"
    />

    <!-- Outlook Auth Modal -->
    <OutlookAuthModal
      :show="showAuthModal"
      :device-code="deviceCode"
      :auth-timeout="authTimeout"
      @close="closeAuthModal"
      @open-auth-page="openAuthPage"
    />

    <!-- Floating Chat Button -->
    <button
      v-if="!showChatPanel"
      @click="showChatPanel = true"
      class="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center z-40 active:scale-95"
      title="AI Mail Agent"
    >
      <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>

    <!-- Chat Panel -->
    <MailChatPanel
      :show="showChatPanel"
      :messages="chatMessages"
      :input-value="chatInput"
      :loading="chatLoading"
      @close="showChatPanel = false"
      @send="sendChatMessage"
      @update:input-value="chatInput = $event"
      @open-email="openEmailFromChat"
    />
  </div>
</template>

<script setup>
/**
 * Mail View
 * 메일 관리 페이지 - 컴포넌트 조립 및 이벤트 연결만 담당
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'

// Components
import MailHeader from '@/components/collaboration/mail/MailHeader.vue'
import MailToolbar from '@/components/collaboration/mail/MailToolbar.vue'
import MailList from '@/components/collaboration/mail/MailList.vue'
import MailDetail from '@/components/collaboration/mail/MailDetail.vue'
import MailComposer from '@/components/collaboration/mail/MailComposer.vue'
import OutlookAuthModal from '@/components/outlook/OutlookAuthModal.vue'
import MailChatPanel from '@/components/collaboration/mail/MailChatPanel.vue'

// Composables
import { useOutlookAuth } from '@/composables/outlook/useOutlookAuth'
import { useMailList } from '@/composables/collaboration/mail/useMailList'
import { useMailDetail } from '@/composables/collaboration/mail/useMailDetail'
import { useMailComposer } from '@/composables/collaboration/mail/useMailComposer'
import { useMailChat } from '@/composables/collaboration/mail/useMailChat'

// ============================================
// Composables Setup
// ============================================

// Mail List
const {
  emails,
  projects,
  loading,
  syncing,
  embedding,
  searchQuery,
  currentFolder,
  currentProjectId,
  unreadCount,
  pagination,
  groupedEmails,
  isGroupedMode,
  loadEmails,
  searchMails,
  syncMails,
  selectFolder,
  onProjectChange,
  prevPage,
  nextPage,
  loadProjects,
  generateAllEmbeddings
} = useMailList()

// Mail Detail
const {
  selectedEmail,
  selectedProjectId,
  openEmail,
  closeEmail,
  toggleReadStatus,
  assignProject,
  deleteEmail
} = useMailDetail(loadEmails)

// Outlook Auth
const {
  authStatus,
  showAuthModal,
  deviceCode,
  authTimeout,
  checkAuthStatus,
  connectOutlook,
  disconnectOutlook,
  openAuthPage,
  closeAuthModal
} = useOutlookAuth()

// Mail Composer
const {
  showComposeModal,
  sending,
  newEmail,
  openComposeModal,
  closeComposeModal,
  sendNewEmail: composerSendEmail
} = useMailComposer(async () => {
  currentFolder.value = 'SentItems'
  await syncMails()
  await loadEmails()
})

// Mail Chat
const {
  showChatPanel,
  chatMessages,
  chatInput,
  chatLoading,
  sendChatMessage,
  openEmailFromChat
} = useMailChat(openEmail)

// ============================================
// Local State
// ============================================
const showProfileMenu = ref(false)

// ============================================
// Event Handlers
// ============================================

const handleConnect = async () => {
  await connectOutlook(async () => {
    await loadEmails()
    await generateAllEmbeddings()
  })
}

const handleDisconnect = async () => {
  showProfileMenu.value = false
  const success = await disconnectOutlook()
  if (success) {
    emails.value = []
  }
}

const handleSync = async () => {
  await syncMails()
}

const handleAssignProject = () => {
  assignProject(projects.value)
}

const sendNewEmail = async () => {
  await composerSendEmail()
}

// ============================================
// Click Outside Handler
// ============================================
const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

// ============================================
// Lifecycle
// ============================================
onMounted(async () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
  }

  await checkAuthStatus()
  await loadProjects()

  if (authStatus.value.isConnected) {
    await loadEmails()
  }
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>
