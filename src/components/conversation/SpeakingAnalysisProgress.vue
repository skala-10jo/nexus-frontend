<script setup>
/**
 * Speaking Analysis Progress 컴포넌트
 *
 * 녹음 파일 분석 중 표시되는 프로그레스 UI
 */
defineProps({
  /** 분석 진행률 (0-100) */
  progress: {
    type: Number,
    default: 0
  },
  /** 분석 메시지 */
  message: {
    type: String,
    default: '분석을 시작합니다...'
  }
})

const emit = defineEmits([
  'back-to-list'
])
</script>

<template>
  <div class="flex-1 flex items-center justify-center bg-gray-50/50 p-8">
    <div class="max-w-md w-full">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
        <!-- Spinner -->
        <div class="w-20 h-20 mx-auto mb-6 relative">
          <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
          <div
            class="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin"
            style="border-right-color: transparent; border-bottom-color: transparent;"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-lg font-bold text-blue-600">{{ progress }}%</span>
          </div>
        </div>

        <!-- Title & Message -->
        <h3 class="text-xl font-bold text-gray-900 mb-2">녹음 파일 분석 중</h3>
        <p class="text-gray-500 mb-6">{{ message }}</p>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${progress}%` }"
          ></div>
        </div>

        <!-- Back Button -->
        <button
          @click="emit('back-to-list')"
          class="mt-6 text-sm text-gray-500 hover:text-gray-700"
        >
          백그라운드에서 진행 (목록으로 돌아가기)
        </button>
      </div>
    </div>
  </div>
</template>
