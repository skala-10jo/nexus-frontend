<template>
  <div class="col-span-4 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
    <!-- Workspace Info -->
    <div v-if="integration" class="p-4 border-b border-gray-200 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800">{{ integration.workspaceName }}</h2>
          <p class="text-xs text-gray-500 mt-1">
            <span v-if="integration.isActive" class="text-green-600">● 연결됨</span>
            <span v-else class="text-gray-400">● 비활성</span>
          </p>
        </div>
        <button
          @click="$emit('disconnect')"
          :disabled="loading"
          class="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
          title="연동 해제"
        >
          연동 해제
        </button>
      </div>
    </div>

    <!-- Channel Actions -->
    <div class="px-4 pt-4 pb-2 flex gap-2 flex-shrink-0">
      <button
        @click="$emit('refresh')"
        :disabled="loading"
        class="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
      >
        새로고침
      </button>
    </div>

    <!-- Channels List -->
    <div class="flex-1 overflow-y-auto px-4 pb-4">
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
          @click="$emit('select', channel)"
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
</template>

<script setup>
defineProps({
  integration: {
    type: Object,
    default: null
  },
  channels: {
    type: Array,
    required: true
  },
  selectedChannel: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  isDM: {
    type: Function,
    required: true
  }
})

defineEmits(['select', 'refresh', 'disconnect'])
</script>
