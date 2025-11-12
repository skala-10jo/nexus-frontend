<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">메신저</h1>
      <button
        v-if="!isConnected"
        @click="connectSlack"
        :disabled="loading"
        class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
        <span v-if="loading">연동 중...</span>
        <span v-else>Slack 연동</span>
      </button>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
      {{ error }}
    </div>

    <!-- No Integration -->
    <div v-if="!loading && !isConnected" class="bg-white rounded-lg shadow-md p-12 text-center">
      <svg class="w-20 h-20 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">Slack 워크스페이스를 연동하세요</h3>
      <p class="text-gray-500 mb-6">Slack에 메시지를 보내려면 먼저 워크스페이스를 연동해야 합니다.</p>
      <button
        @click="connectSlack"
        class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 inline-flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
        Slack 연동하기
      </button>
    </div>

    <!-- Main UI with Integration -->
    <div v-else class="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <!-- Channels List -->
      <div class="col-span-4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
        <!-- Workspace Info -->
        <div v-if="integration" class="mb-4 pb-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-800">{{ integration.workspaceName }}</h2>
              <p class="text-xs text-gray-500 mt-1">
                <span v-if="integration.isActive" class="text-green-600">● 연결됨</span>
                <span v-else class="text-gray-400">● 비활성</span>
              </p>
            </div>
            <button
              @click="disconnectSlack"
              :disabled="loading"
              class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
              title="연동 해제"
            >
              연동 해제
            </button>
          </div>
        </div>

        <!-- Channel Actions -->
        <div class="mb-4 flex gap-2">
          <button
            @click="refreshChannels"
            :disabled="loading"
            class="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            새로고침
          </button>
        </div>

        <!-- Channels List -->
        <div>
          <h2 class="text-lg font-semibold text-gray-800 mb-3">채널</h2>

          <div v-if="loading && channels.length === 0" class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>

          <div v-else-if="channels.length === 0" class="text-center py-8">
            <p class="text-gray-500 text-sm">채널이 없습니다</p>
          </div>

          <div v-else class="space-y-1">
            <button
              v-for="channel in channels"
              :key="channel.id"
              @click="selectChannel(channel)"
              :class="[
                'w-full text-left px-3 py-2 rounded-lg transition-colors',
                selectedChannel?.id === channel.id
                  ? 'bg-purple-100 text-purple-900'
                  : 'hover:bg-gray-100 text-gray-700'
              ]"
            >
              <div class="flex items-center gap-2">
                <!-- Icon for DM vs Channel -->
                <span v-if="isDM(channel)" class="text-gray-400">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                  </svg>
                </span>
                <span v-else-if="channel.isPrivate" class="text-gray-400">🔒</span>
                <span v-else class="text-gray-400">#</span>
                <span class="font-medium">{{ channel.name }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Message Area -->
      <div class="col-span-8 bg-white rounded-lg shadow-md flex flex-col">
        <!-- Channel Header -->
        <div v-if="selectedChannel" class="border-b border-gray-200 p-4">
          <h3 class="text-lg font-semibold text-gray-800">
            # {{ selectedChannel.name }}
          </h3>
          <p v-if="integration" class="text-sm text-gray-500">
            {{ integration.workspaceName }}
          </p>
        </div>

        <!-- Message Area -->
        <div v-if="selectedChannel" class="flex-1 flex flex-col">
          <!-- Message History -->
          <div class="flex-1 overflow-y-auto p-6 bg-gray-50">
            <div v-if="loading && messages.length === 0" class="text-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            </div>

            <div v-else-if="messages.length === 0" class="text-center py-8 text-gray-500">
              메시지가 없습니다
            </div>

            <div v-else class="space-y-4">
              <div v-for="(message, index) in messages" :key="index" class="bg-white rounded-lg p-4 shadow-sm">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span class="text-purple-600 font-semibold text-sm">
                      {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <div class="flex items-baseline gap-2 mb-1">
                      <span class="font-semibold text-gray-900">{{ message.username || 'Unknown' }}</span>
                      <span class="text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                    </div>
                    <p class="text-gray-700 whitespace-pre-wrap">{{ message.text }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="border-t border-gray-200 bg-white p-4">
            <div class="flex gap-2">
              <textarea
                v-model="messageText"
                @keydown.ctrl.enter="sendSlackMessage"
                placeholder="메시지를 입력하세요... (Ctrl+Enter로 전송)"
                rows="3"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
              ></textarea>
              <button
                @click="sendSlackMessage"
                :disabled="!messageText.trim() || loading"
                class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed self-end"
              >
                <span v-if="loading">전송 중...</span>
                <span v-else>전송</span>
              </button>
            </div>
          </div>
        </div>

        <!-- No Channel Selected -->
        <div v-else class="flex-1 flex items-center justify-center p-6">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-gray-500">채널을 선택해주세요</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSlackStore } from '@/stores/slack';
import { storeToRefs } from 'pinia';

const slackStore = useSlackStore();
const { integration, isConnected, channels, selectedChannel, messages, loading, error } = storeToRefs(slackStore);

const messageText = ref('');

onMounted(async () => {
  try {
    await slackStore.fetchIntegrationStatus();

    // If connected, load channels
    if (isConnected.value) {
      await slackStore.fetchChannels();
    }
  } catch (err) {
    console.error('Failed to fetch integration status:', err);
  }
});

const connectSlack = async () => {
  try {
    const authUrl = await slackStore.getAuthUrl();
    // Open Slack OAuth in new window
    window.location.href = authUrl;
  } catch (err) {
    console.error('Failed to connect Slack:', err);
  }
};

const disconnectSlack = async () => {
  if (!integration.value) return;

  if (confirm(`정말로 "${integration.value.workspaceName}" 연동을 해제하시겠습니까?`)) {
    try {
      await slackStore.disconnectIntegration();
    } catch (err) {
      console.error('Failed to disconnect integration:', err);
    }
  }
};

const refreshChannels = async () => {
  await slackStore.fetchChannels();
};

const selectChannel = (channel) => {
  slackStore.selectChannel(channel);
};

const sendSlackMessage = async () => {
  if (!messageText.value.trim() || !selectedChannel.value) {
    return;
  }

  try {
    await slackStore.sendMessage(
      selectedChannel.value.id,
      messageText.value
    );

    // Clear message
    messageText.value = '';

    // Show success
    alert('메시지가 전송되었습니다!');
  } catch (err) {
    console.error('Failed to send message:', err);
    alert('메시지 전송에 실패했습니다.');
  }
};

const isDM = (channel) => {
  // Use the isDM flag provided by backend
  return channel.isDM === true;
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(parseFloat(timestamp) * 1000);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
};
</script>
