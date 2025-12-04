<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">텍스트 번역</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Language selector -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">한국어</span>
          <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">English</span>
        </div>
      </div>

      <!-- Input area -->
      <div class="grid grid-cols-2 gap-4">
        <div class="border border-gray-200 rounded-xl p-4 min-h-[120px]">
          <p class="text-gray-800">{{ displayedInput }}</p>
          <span v-if="isTypingInput" class="inline-block w-0.5 h-4 bg-gray-800 animate-blink"></span>
        </div>
        <div class="border border-blue-200 bg-blue-50 rounded-xl p-4 min-h-[120px]">
          <p v-if="isTranslating" class="text-blue-400 animate-pulse">번역 중...</p>
          <p v-else class="text-blue-800">{{ displayedOutput }}</p>
        </div>
      </div>

      <!-- Glossary highlight -->
      <div v-if="showGlossary" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl animate-fade-in">
        <div class="flex items-center gap-2 text-sm">
          <svg class="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-yellow-800">
            <strong>전문 용어:</strong> 클라우드 컴퓨팅 → Cloud Computing
          </span>
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

const fullInput = '클라우드 컴퓨팅 기술을 활용한 데이터 분석 시스템을 구축하고 있습니다.'
const fullOutput = 'We are building a data analysis system using cloud computing technology.'

const displayedInput = ref('')
const displayedOutput = ref('')
const isTypingInput = ref(false)
const isTranslating = ref(false)
const showGlossary = ref(false)

let animationTimeout = null

const startAnimation = () => {
  displayedInput.value = ''
  displayedOutput.value = ''
  isTypingInput.value = true
  isTranslating.value = false
  showGlossary.value = false

  // Type input
  let inputIndex = 0
  const typeInput = setInterval(() => {
    if (inputIndex < fullInput.length) {
      displayedInput.value = fullInput.slice(0, inputIndex + 1)
      inputIndex++
    } else {
      clearInterval(typeInput)
      isTypingInput.value = false
      isTranslating.value = true

      // Show translation after delay
      animationTimeout = setTimeout(() => {
        isTranslating.value = false
        showGlossary.value = true

        // Type output
        let outputIndex = 0
        const typeOutput = setInterval(() => {
          if (outputIndex < fullOutput.length) {
            displayedOutput.value = fullOutput.slice(0, outputIndex + 1)
            outputIndex++
          } else {
            clearInterval(typeOutput)
            // Restart animation
            animationTimeout = setTimeout(startAnimation, 4000)
          }
        }, 30)
      }, 1500)
    }
  }, 50)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationTimeout) clearTimeout(animationTimeout)
})
</script>

<style scoped>
.animate-blink {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
