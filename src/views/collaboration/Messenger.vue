<template>
  <!-- Mobile: bottom nav (4rem) only, Desktop: nothing special -->
  <div class="flex flex-col relative h-[calc(100vh-4rem)]">
    <!-- Main Content Area (responsive to sidebar) -->
    <div
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      :class="{ 'md:mr-[420px]': showBizGuidePanel }"
    >
      <!-- Header -->
      <MessengerHeader
        :is-connected="isConnected"
        :loading="loading"
        :show-back-button="isMobileMessageView"
        :selected-channel="selectedChannel"
        @connect="connectSlack"
        @back="handleMobileBack"
      />

      <!-- Error Message -->
      <div v-if="error" class="mx-4 md:mx-8 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex-shrink-0 text-sm">
        {{ error }}
      </div>

      <!-- No Integration -->
      <MessengerEmptyState
        v-if="!loading && !isConnected"
        @connect="connectSlack"
      />

      <!-- Main UI with Integration -->
      <div v-else class="flex-1 px-4 md:px-8 pb-4 md:pb-8 overflow-hidden">
        <!-- Desktop: Grid Layout / Mobile: Single View -->
        <div class="h-full md:grid md:grid-cols-12 md:gap-6">
          <!-- Channels List (Desktop: always visible, Mobile: only when no channel selected) -->
          <MessengerChannelList
            v-show="!isMobileMessageView"
            class="h-full md:col-span-4"
            :integration="integration"
            :channels="channels"
            :selected-channel="selectedChannel"
            :loading="loading"
            :is-d-m="isDM"
            @select="handleChannelSelect"
            @refresh="refreshChannels"
            @disconnect="disconnectSlack"
          />

          <!-- Message Area (Desktop: always visible, Mobile: only when channel selected) -->
          <MessengerMessageArea
            v-show="!isMobile || mobileView === 'messages'"
            class="h-full md:col-span-8"
            :class="{ 'hidden md:block': !selectedChannel }"
            :selected-channel="selectedChannel"
            :integration="integration"
            :messages="messages"
            v-model:message-text="messageText"
            :loading="loading"
            :current-user="currentUser"
            :is-my-message="isMyMessage"
            :format-timestamp="formatTimestamp"
            @send="sendSlackMessage"
            @open-biz-guide="showBizGuidePanel = true"
          />
        </div>
      </div>
    </div>

    <!-- Floating Biz Guide Button (Desktop only) -->
    <!-- Mobile: Button is integrated into message input area -->
    <button
      v-if="!showBizGuidePanel && isConnected"
      @click="showBizGuidePanel = true"
      class="hidden md:flex fixed bottom-8 right-8 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all items-center justify-center z-40 active:scale-95"
      title="Biz Guide AI 초안"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </button>

    <!-- Biz Guide Side Panel (Chat Mode) - Full screen on mobile -->
    <SlackBizGuidePanel
      :show="showBizGuidePanel"
      :is-mobile="isMobile"
      @close="showBizGuidePanel = false"
      @use-draft="handleUseDraft"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Components
import MessengerHeader from '@/components/collaboration/messenger/MessengerHeader.vue'
import MessengerEmptyState from '@/components/collaboration/messenger/MessengerEmptyState.vue'
import MessengerChannelList from '@/components/collaboration/messenger/MessengerChannelList.vue'
import MessengerMessageArea from '@/components/collaboration/messenger/MessengerMessageArea.vue'
import SlackBizGuidePanel from '@/components/collaboration/messenger/SlackBizGuidePanel.vue'

// Composables
import { useMessengerPage } from '@/composables/collaboration/messenger/useMessengerPage'
import { useSlackAgent } from '@/composables/collaboration/messenger/useSlackAgent'

// Page Logic
const {
  // Store State
  integration,
  isConnected,
  channels,
  selectedChannel,
  messages,
  loading,
  error,

  // Local State
  messageText,
  currentUser,

  // Helpers
  isMyMessage,
  formatTimestamp,
  isDM,

  // Actions
  connectSlack,
  disconnectSlack,
  refreshChannels,
  selectChannel,
  sendSlackMessage
} = useMessengerPage()

// Biz Guide (Slack Agent) - Now using chat mode
const {
  clearDraft,
  startNewChat
} = useSlackAgent()

// Biz Guide Panel State
const showBizGuidePanel = ref(false)

// Mobile Responsive State
const windowWidth = ref(768) // Default to desktop, will be set in onMounted
const mobileView = ref('channels') // 'channels' | 'messages'

// Breakpoint: md = 768px
const isMobile = computed(() => windowWidth.value < 768)
const isMobileMessageView = computed(() => isMobile.value && mobileView.value === 'messages')

// Handle window resize
const handleResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
  }
}

onMounted(() => {
  // Set initial window width
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

// Mobile Navigation: Select channel and switch to message view
const handleChannelSelect = (channel) => {
  selectChannel(channel)
  if (isMobile.value) {
    mobileView.value = 'messages'
  }
}

// Mobile Navigation: Back to channel list
const handleMobileBack = () => {
  mobileView.value = 'channels'
}

// Use generated draft from chat
const handleUseDraft = (draft) => {
  messageText.value = draft
  showBizGuidePanel.value = false
}
</script>
