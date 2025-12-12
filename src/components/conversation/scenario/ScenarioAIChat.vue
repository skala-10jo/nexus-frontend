<template>
  <div class="w-full md:w-96 flex flex-col bg-gray-50">
    <!-- Chat Header -->
    <div class="p-4 border-b border-gray-200 flex items-start justify-between">
      <div>
        <h4 class="font-bold text-gray-900">AI Assistant</h4>
        <p class="text-xs text-gray-500 mt-1">프롬프트로 시나리오를 수정하세요</p>
      </div>
      <button
        @click="$emit('reset')"
        class="p-2 hover:bg-gray-200 rounded-lg transition-colors group"
        title="대화 초기화"
      >
        <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div v-if="messages.length === 0" class="text-center text-gray-400 text-sm mt-8">
        시나리오에 대해 질문하거나<br>수정 요청을 해보세요
      </div>

      <div
        v-for="(msg, index) in messages"
        :key="index"
        class="flex"
        :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
      >
        <div
          :class="[
            'p-3 rounded-lg max-w-[80%]',
            msg.role === 'user'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-800 border border-gray-200'
          ]"
        >
          <p class="text-sm whitespace-pre-wrap">{{ msg.content }}</p>
        </div>
      </div>

      <!-- Loading Indicator -->
      <div v-if="isLoading" class="flex justify-start">
        <div class="bg-white text-gray-800 border border-gray-200 p-3 rounded-lg max-w-[80%]">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chat Input -->
    <div class="p-4 border-t border-gray-200">
      <div class="flex gap-2">
        <input
          :value="inputValue"
          @input="$emit('update:inputValue', $event.target.value)"
          @keyup.enter="$emit('send')"
          type="text"
          placeholder="예: 역할을 더 구체적으로 바꿔줘"
          class="flex-1 px-3 py-2 text-sm bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-gray-100 focus:border-gray-900"
        />
        <button
          @click="$emit('send')"
          :disabled="!inputValue.trim() || isLoading"
          class="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          전송
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  inputValue: {
    type: String,
    default: ''
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:inputValue', 'send', 'reset'])
</script>
