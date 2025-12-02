<template>
  <div class="flex flex-col" style="height: calc(100vh - 4rem);">
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
</template>

<script setup>
// Components
import MessengerHeader from '@/components/collaboration/messenger/MessengerHeader.vue'
import MessengerEmptyState from '@/components/collaboration/messenger/MessengerEmptyState.vue'
import MessengerChannelList from '@/components/collaboration/messenger/MessengerChannelList.vue'
import MessengerMessageArea from '@/components/collaboration/messenger/MessengerMessageArea.vue'

// Composables
import { useMessengerPage } from '@/composables/collaboration/messenger/useMessengerPage'

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
</script>
