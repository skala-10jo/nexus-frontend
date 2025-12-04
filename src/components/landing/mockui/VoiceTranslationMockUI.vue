<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">음성 번역</span>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Waveform visualization -->
      <div class="flex items-center justify-center gap-1 h-20 mb-6">
        <div
          v-for="i in 20"
          :key="i"
          class="w-1 bg-blue-500 rounded-full transition-all duration-150"
          :style="{ height: isRecording ? `${waveHeights[i - 1]}px` : '4px' }"
        ></div>
      </div>

      <!-- Recording button -->
      <div class="flex justify-center mb-6">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
          :class="isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-200'"
        >
          <svg class="w-8 h-8" :class="isRecording ? 'text-white' : 'text-gray-500'" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
          </svg>
        </div>
      </div>

      <!-- Transcription result -->
      <div class="space-y-3">
        <div v-if="originalText" class="p-4 bg-gray-50 rounded-xl animate-fade-in">
          <p class="text-xs text-gray-400 mb-1">원문 (한국어)</p>
          <p class="text-gray-800">{{ displayedOriginal }}</p>
        </div>
        <div v-if="translatedText" class="p-4 bg-blue-50 rounded-xl animate-fade-in">
          <p class="text-xs text-blue-400 mb-1">번역 (English)</p>
          <p class="text-blue-800">{{ displayedTranslation }}</p>
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

const isRecording = ref(false)
const waveHeights = ref(Array(20).fill(4))
const originalText = ref('')
const translatedText = ref('')
const displayedOriginal = ref('')
const displayedTranslation = ref('')

let waveInterval = null
let animationTimeout = null

const fullOriginal = '안녕하세요, 다음 주 회의 일정을 확인하고 싶습니다.'
const fullTranslation = 'Hello, I would like to check the meeting schedule for next week.'

const startAnimation = () => {
  originalText.value = ''
  translatedText.value = ''
  displayedOriginal.value = ''
  displayedTranslation.value = ''
  isRecording.value = true

  // Animate wave
  waveInterval = setInterval(() => {
    waveHeights.value = Array(20).fill(0).map(() => Math.random() * 50 + 10)
  }, 100)

  // Stop recording and show transcription
  animationTimeout = setTimeout(() => {
    isRecording.value = false
    clearInterval(waveInterval)
    waveHeights.value = Array(20).fill(4)

    originalText.value = fullOriginal
    // Typing effect for original
    let charIndex = 0
    const typeOriginal = setInterval(() => {
      if (charIndex < fullOriginal.length) {
        displayedOriginal.value = fullOriginal.slice(0, charIndex + 1)
        charIndex++
      } else {
        clearInterval(typeOriginal)
        // Start translation typing
        translatedText.value = fullTranslation
        let transIndex = 0
        const typeTranslation = setInterval(() => {
          if (transIndex < fullTranslation.length) {
            displayedTranslation.value = fullTranslation.slice(0, transIndex + 1)
            transIndex++
          } else {
            clearInterval(typeTranslation)
            // Restart animation
            animationTimeout = setTimeout(startAnimation, 4000)
          }
        }, 30)
      }
    }, 50)
  }, 3000)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (waveInterval) clearInterval(waveInterval)
  if (animationTimeout) clearTimeout(animationTimeout)
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
