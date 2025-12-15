<template>
  <div class="flex-shrink-0 px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 bg-white z-10">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-3">
        <!-- Mobile Back Button -->
        <button
          v-if="showBackButton"
          @click="$emit('back')"
          class="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div>
          <!-- Mobile: Show channel name when in message view -->
          <h1 v-if="showBackButton && selectedChannel" class="text-lg md:text-2xl font-bold text-gray-900">
            # {{ selectedChannel.name }}
          </h1>
          <h1 v-else class="text-xl md:text-2xl font-bold text-gray-900">메신저</h1>
          <p class="hidden md:block text-sm text-gray-500 font-medium mt-0.5">Slack 메시지를 관리하고 비즈니스 매너에 맞는 초안을 작성하세요!</p>
        </div>
      </div>

      <button
        v-if="!isConnected"
        @click="$emit('connect')"
        :disabled="loading"
        class="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
        </svg>
        <template v-if="loading">
          <span>연동 중...</span>
        </template>
        <template v-else>
          <span class="hidden sm:inline">Slack 연동</span>
          <span class="sm:hidden">연동</span>
        </template>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isConnected: {
    type: Boolean,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  showBackButton: {
    type: Boolean,
    default: false
  },
  selectedChannel: {
    type: Object,
    default: null
  }
})

defineEmits(['connect', 'back'])
</script>
