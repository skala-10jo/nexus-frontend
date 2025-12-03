<script setup>
/**
 * MailAuthModal Component
 * Outlook 인증 모달 (Device Code Flow)
 */
defineProps({
  /** 모달 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** Device Code 정보 */
  deviceCode: {
    type: Object,
    default: null
  },
  /** 인증 타임아웃 (초) */
  authTimeout: {
    type: Number,
    default: 900
  }
})

const emit = defineEmits([
  'close',
  'open-auth-page'
])
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
      <!-- Icon -->
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 mb-2">Outlook 연동</h2>
      <p class="text-gray-500 mb-8">코드를 입력하여 계정을 인증하세요</p>

      <!-- Device Code Display -->
      <div v-if="deviceCode" class="space-y-6">
        <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <p class="text-4xl font-mono font-bold text-blue-600 tracking-wider">{{ deviceCode.userCode }}</p>
        </div>
        <button
          @click="emit('open-auth-page')"
          class="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm shadow-blue-200"
        >
          인증 페이지 열기
        </button>
        <p class="text-sm text-gray-400">
          {{ Math.floor(authTimeout / 60) }}:{{ (authTimeout % 60).toString().padStart(2, '0') }} 후 만료
        </p>
      </div>

      <!-- Loading -->
      <div v-else class="py-8">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-500 mt-4">초기화...</p>
      </div>

      <!-- Cancel -->
      <button
        @click="emit('close')"
        class="mt-6 text-gray-500 hover:text-gray-700 font-medium text-sm"
      >
        취소
      </button>
    </div>
  </div>
</template>
