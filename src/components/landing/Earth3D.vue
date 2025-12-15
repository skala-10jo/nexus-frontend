<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-black">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center text-white z-20">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      <div class="text-center px-6 w-full max-w-4xl mx-auto">
        <!-- Logo with SplitText Animation -->
        <div class="w-full flex justify-center mb-4 pointer-events-auto">
          <SplitText
            text="NexUS"
            class="text-8xl md:text-9xl font-thin text-white tracking-widest"
            :delay="80"
            :duration="2.8"
            ease="power3.out"
            split-type="chars"
            :from="{ opacity: 0, y: 50, rotateX: -90 }"
            :to="{ opacity: 1, y: 0, rotateX: 0 }"
            :auto-play="true"
            text-align="center"
            style="font-family: 'Orbitron', sans-serif !important; text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);"
          />
        </div>

        <!-- Tagline with TextType Animation -->
        <div class="w-full flex justify-center mb-24 pointer-events-auto">
          <TextType
            :text="['Collaborate Beyond Languages']"
            :typingSpeed="50"
            :pauseDuration="3000"
            :showCursor="true"
            cursorCharacter="|"
            :loop="false"
            :initialDelay="800"
            class="text-xl md:text-3xl text-gray-200 font-light tracking-wide"
            style="font-family: 'Inter', sans-serif !important; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);"
          />
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center pointer-events-auto mt-12">
          <router-link
            to="/login"
            class="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            시작하기
          </router-link>
          <button
            @click="$emit('scrollToFeatures')"
            class="px-10 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 shadow-lg backdrop-blur-sm"
          >
            기능 살펴보기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Earth3D - 3D 지구본 히어로 섹션
 *
 * @description Three.js 기반 3D 지구본과 인터랙티브 UI
 */
import { ref } from 'vue'
import SplitText from '@/components/common/effects/SplitText.vue'
import TextType from '@/components/common/effects/TextType.vue'
import { useEarth3D } from '@/composables/landing/useEarth3D'

const containerRef = ref(null)
defineEmits(['scrollToFeatures'])

const { isLoading } = useEarth3D(containerRef)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500&display=swap');
</style>
