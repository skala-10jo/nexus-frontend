<template>
  <div class="col-span-8 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
    <!-- Channel Header -->
    <div v-if="selectedChannel" class="border-b border-gray-200 p-4 flex-shrink-0">
      <h3 class="text-lg font-semibold text-gray-800">
        # {{ selectedChannel.name }}
      </h3>
      <p v-if="integration" class="text-sm text-gray-500">
        {{ integration.workspaceName }}
      </p>
    </div>

    <!-- Message Area -->
    <div v-if="selectedChannel" class="flex-1 flex flex-col overflow-hidden">
      <!-- Message History -->
      <div
        ref="messageContainer"
        class="flex-1 overflow-y-auto p-6 bg-gray-50"
        style="min-height: 0;"
      >
        <div v-if="loading && messages.length === 0" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        <div v-else-if="messages.length === 0" class="text-center py-8 text-gray-500">
          메시지가 없습니다
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(message, index) in messages"
            :key="index"
            :class="[
              'flex',
              isMyMessage(message) ? 'justify-end' : 'justify-start'
            ]"
          >
            <!-- Other person's message (left) -->
            <div v-if="!isMyMessage(message)" class="flex items-start gap-3 max-w-[70%]">
              <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <span class="text-purple-600 font-semibold text-sm">
                  {{ message.username ? message.username.charAt(0).toUpperCase() : 'U' }}
                </span>
              </div>
              <div>
                <div class="flex items-baseline gap-2 mb-1">
                  <span class="font-semibold text-gray-900 text-sm">{{ message.username || 'Unknown' }}</span>
                  <span class="text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                </div>
                <div class="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                  <p class="text-gray-700 whitespace-pre-wrap">{{ message.text }}</p>
                </div>
              </div>
            </div>

            <!-- My message (right) -->
            <div v-else class="flex items-start gap-3 max-w-[70%] flex-row-reverse">
              <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <span class="text-green-600 font-semibold text-sm">
                  {{ currentUser ? currentUser.username.charAt(0).toUpperCase() : 'Me' }}
                </span>
              </div>
              <div>
                <div class="flex items-baseline gap-2 mb-1 justify-end">
                  <span class="text-xs text-gray-500">{{ formatTimestamp(message.timestamp) }}</span>
                  <span class="font-semibold text-gray-900 text-sm">나</span>
                </div>
                <div class="bg-purple-600 text-white rounded-lg rounded-tr-none p-3 shadow-sm">
                  <p class="whitespace-pre-wrap">{{ message.text }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="border-t border-gray-200 bg-white p-4 flex-shrink-0">
        <div class="flex gap-2">
          <textarea
            :value="messageText"
            @input="$emit('update:messageText', $event.target.value)"
            @keydown.ctrl.enter="$emit('send')"
            placeholder="메시지를 입력하세요... (Ctrl+Enter로 전송)"
            rows="3"
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
          ></textarea>
          <button
            @click="$emit('send')"
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
</template>

<script setup>
defineProps({
  selectedChannel: {
    type: Object,
    default: null
  },
  integration: {
    type: Object,
    default: null
  },
  messages: {
    type: Array,
    required: true
  },
  messageText: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  currentUser: {
    type: Object,
    default: null
  },
  isMyMessage: {
    type: Function,
    required: true
  },
  formatTimestamp: {
    type: Function,
    required: true
  }
})

defineEmits(['update:messageText', 'send'])
</script>
