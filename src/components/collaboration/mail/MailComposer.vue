<script setup>
/**
 * MailComposer Component
 * 메일 작성 모달
 */
defineProps({
  /** 모달 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 발송 중 여부 */
  sending: {
    type: Boolean,
    default: false
  },
  /** 새 메일 데이터 */
  newEmail: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'close',
  'send',
  'update:to',
  'update:cc',
  'update:subject',
  'update:body'
])
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <h2 class="text-xl font-bold text-gray-900">새 메일</h2>
        <button @click="emit('close')" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form -->
      <div class="p-8 space-y-5 overflow-y-auto flex-1">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">수신자</label>
          <input
            :value="newEmail.to"
            @input="emit('update:to', $event.target.value)"
            type="text"
            placeholder="recipient@example.com"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
          >
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">참조</label>
          <input
            :value="newEmail.cc"
            @input="emit('update:cc', $event.target.value)"
            type="text"
            placeholder="cc@example.com"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
          >
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">제목</label>
          <input
            :value="newEmail.subject"
            @input="emit('update:subject', $event.target.value)"
            type="text"
            placeholder="제목을 입력하세요"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium"
          >
        </div>

        <div class="flex-1">
          <label class="block text-sm font-semibold text-gray-700 mb-2">본문</label>
          <textarea
            :value="newEmail.body"
            @input="emit('update:body', $event.target.value)"
            rows="12"
            placeholder="내용을 입력하세요..."
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-y"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
        <button
          @click="emit('close')"
          class="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium shadow-sm"
        >
          취소
        </button>
        <button
          @click="emit('send')"
          :disabled="sending"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
        >
          <svg v-if="sending" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ sending ? '전송 중...' : '전송' }}
        </button>
      </div>
    </div>
  </div>
</template>
