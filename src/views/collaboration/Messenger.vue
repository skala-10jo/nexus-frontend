<template>
  <div class="flex flex-col relative" style="height: calc(100vh - 4rem);">
    <!-- Main Content Area (responsive to sidebar) -->
    <div
      class="flex-1 flex flex-col overflow-hidden transition-all duration-300"
      :style="{ marginRight: showBizGuidePanel ? '420px' : '0' }"
    >
      <!-- Header -->
      <MessengerHeader
        :is-connected="isConnected"
        :loading="loading"
        @connect="connectSlack"
      />

      <!-- Error Message -->
      <div v-if="error" class="mx-8 mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex-shrink-0">
        {{ error }}
      </div>

      <!-- No Integration -->
      <MessengerEmptyState
        v-if="!loading && !isConnected"
        @connect="connectSlack"
      />

      <!-- Main UI with Integration -->
      <div v-else class="flex-1 px-8 pb-8 overflow-hidden">
        <div class="grid grid-cols-12 gap-6 h-full">
          <!-- Channels List -->
          <MessengerChannelList
            :integration="integration"
            :channels="channels"
            :selected-channel="selectedChannel"
            :loading="loading"
            :is-d-m="isDM"
            @select="selectChannel"
            @refresh="refreshChannels"
            @disconnect="disconnectSlack"
          />

          <!-- Message Area -->
          <MessengerMessageArea
            :selected-channel="selectedChannel"
            :integration="integration"
            :messages="messages"
            v-model:message-text="messageText"
            :loading="loading"
            :current-user="currentUser"
            :is-my-message="isMyMessage"
            :format-timestamp="formatTimestamp"
            @send="sendSlackMessage"
          />
        </div>
      </div>
    </div>

    <!-- Floating Biz Guide Button -->
    <button
      v-if="!showBizGuidePanel && isConnected"
      @click="showBizGuidePanel = true"
      class="fixed bottom-8 right-8 w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all flex items-center justify-center z-40 active:scale-95"
      title="Biz Guide AI 초안"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    </button>

    <!-- Biz Guide Side Panel -->
    <SlackBizGuidePanel
      :show="showBizGuidePanel"
      :current-draft="currentDraft"
      :suggestions="draftSuggestions"
      :loading="isDrafting"
      @close="showBizGuidePanel = false"
      @generate="handleCreateDraft"
      @use-draft="handleUseDraft"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

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

// Biz Guide (Slack Agent)
const {
  isDrafting,
  currentDraft,
  draftSuggestions,
  createBizDraft,
  clearDraft
} = useSlackAgent()

// Biz Guide Panel State
const showBizGuidePanel = ref(false)

// Handle draft creation
const handleCreateDraft = async (intent) => {
  if (!intent.trim()) return
  try {
    await createBizDraft(intent)
  } catch (error) {
    console.error('Draft creation failed:', error)
  }
}

// Use generated draft
const handleUseDraft = (draft) => {
  messageText.value = draft
  clearDraft()
  showBizGuidePanel.value = false
}
</script>
