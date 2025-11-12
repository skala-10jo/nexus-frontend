<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div v-if="loading" class="space-y-4">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
        <h2 class="text-xl font-semibold text-gray-800">Slack 연동 중...</h2>
        <p class="text-gray-600">잠시만 기다려주세요</p>
      </div>

      <div v-else-if="error" class="space-y-4">
        <svg class="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">연동 실패</h2>
        <p class="text-red-600">{{ error }}</p>
        <button
          @click="goToMessenger"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          메신저로 돌아가기
        </button>
      </div>

      <div v-else class="space-y-4">
        <svg class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">연동 완료!</h2>
        <p class="text-gray-600">Slack 워크스페이스가 성공적으로 연동되었습니다</p>
        <button
          @click="goToMessenger"
          class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          메신저로 이동
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSlackStore } from '@/stores/slack';

const route = useRoute();
const router = useRouter();
const slackStore = useSlackStore();

const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const code = route.query.code;
  const state = route.query.state;
  const errorParam = route.query.error;

  // Check for OAuth error
  if (errorParam) {
    error.value = 'OAuth 인증이 취소되었거나 실패했습니다';
    loading.value = false;
    return;
  }

  // Check for required parameters
  if (!code || !state) {
    error.value = '잘못된 OAuth 응답입니다';
    loading.value = false;
    return;
  }

  try {
    // Handle OAuth callback
    await slackStore.handleOAuthCallback(code, state);

    // Wait a moment before redirecting
    setTimeout(() => {
      loading.value = false;
    }, 1000);
  } catch (err) {
    error.value = err.response?.data?.message || '연동 처리 중 오류가 발생했습니다';
    loading.value = false;
  }
});

const goToMessenger = () => {
  router.push('/collaboration/messenger');
};
</script>
