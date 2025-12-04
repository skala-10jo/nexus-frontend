<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
    <!-- Video Phase -->
    <div v-if="!videoEnded" class="absolute inset-0 z-10">
      <video
        ref="videoRef"
        class="w-full h-full object-cover"
        autoplay
        muted
        playsinline
        @ended="onVideoEnd"
      >
        <source src="/videos/kling_20251203_VIDEO____________3651_0.mp4" type="video/mp4" />
      </video>

      <!-- Skip Button -->
      <button
        @click="skipVideo"
        class="absolute bottom-8 right-8 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-300 flex items-center gap-2"
      >
        <span>Skip</span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Post-Video: Fixed Image + Logo -->
    <div
      v-else
      class="absolute inset-0 z-10 flex flex-col items-center justify-center"
      :class="{ 'animate-fade-in': videoEnded }"
    >
      <!-- Earth Background (Includes UI Overlay) -->
      <Earth3D class="absolute inset-0 z-0" @scrollToFeatures="scrollToFeatures" />


    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import Earth3D from './Earth3D.vue'

const videoRef = ref(null)
const videoEnded = ref(false)

const onVideoEnd = () => {
  videoEnded.value = true
}

const skipVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  videoEnded.value = true
}

const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500&display=swap');

.animate-fade-in {
  animation: fadeIn 1.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
