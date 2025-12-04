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
      <!-- Background gradient -->
      <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>

      <!-- DarkVeil Aurora Effect -->
      <DarkVeil
        class="absolute inset-0 z-0"
        :hueShift="180"
        :speed="0.3"
        :noiseIntensity="0.02"
        :warpAmount="0.3"
      />

      <!-- TextParticles with Globe -->
      <TextParticles
        class="absolute inset-0 z-10"
        :particleCount="60"
        :minFontSize="11"
        :maxFontSize="16"
        :mouseRadius="120"
      />

      <!-- Content -->
      <div class="relative z-20 text-center px-6">
        <!-- Logo -->
        <h1 class="text-8xl md:text-9xl font-black text-white mb-6 tracking-tight">
          NEXUS
        </h1>

        <!-- Tagline -->
        <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
          AI 기반 번역 · 회화 · 협업 플랫폼
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/login"
            class="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            시작하기
          </router-link>
          <button
            @click="scrollToFeatures"
            class="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            기능 살펴보기
          </button>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import TextParticles from './TextParticles.vue'
import DarkVeil from './DarkVeil.vue'

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
.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
