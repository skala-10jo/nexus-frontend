<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">용어집 추출</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Upload area -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6 transition-all duration-500"
        :class="{ 'border-blue-500 bg-blue-50': isUploading }"
      >
        <div v-if="!isUploading" class="text-gray-400">
          <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p class="text-sm">문서를 업로드하세요</p>
        </div>
        <div v-else class="text-blue-500">
          <svg class="w-12 h-12 mx-auto mb-2 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-sm font-medium">분석 중...</p>
        </div>
      </div>

      <!-- Extracted terms -->
      <div class="space-y-3">
        <div
          v-for="(term, index) in visibleTerms"
          :key="index"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-slide-in"
          :style="{ animationDelay: `${index * 0.15}s` }"
        >
          <div>
            <span class="font-medium text-gray-900">{{ term.ko }}</span>
            <span class="text-gray-400 mx-2">→</span>
            <span class="text-blue-600">{{ term.en }}</span>
          </div>
          <span class="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">{{ term.category }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const terms = [
  { ko: '인공지능', en: 'Artificial Intelligence', category: 'IT' },
  { ko: '머신러닝', en: 'Machine Learning', category: 'IT' },
  { ko: '자연어처리', en: 'NLP', category: 'IT' },
  { ko: '딥러닝', en: 'Deep Learning', category: 'IT' }
]

const isUploading = ref(false)
const visibleTerms = ref([])
let animationInterval = null

const startAnimation = () => {
  isUploading.value = true
  visibleTerms.value = []

  setTimeout(() => {
    isUploading.value = false
    let termIndex = 0
    animationInterval = setInterval(() => {
      if (termIndex < terms.length) {
        visibleTerms.value.push(terms[termIndex])
        termIndex++
      } else {
        clearInterval(animationInterval)
        // Restart after delay
        setTimeout(startAnimation, 3000)
      }
    }, 400)
  }, 1500)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationInterval) {
    clearInterval(animationInterval)
  }
})
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
