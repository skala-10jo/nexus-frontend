<template>
  <section ref="sectionRef" class="py-48 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        <!-- Left: Text Content -->
        <div
          class="flex-1 transition-all duration-1000"
          :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
        >
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
            <LanguageIcon class="w-4 h-4" />
            <span>{{ sectionContent.badge }}</span>
          </div>

          <!-- Title -->
          <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {{ sectionContent.title }}
          </h3>

          <!-- Description -->
          <p class="text-lg text-gray-600 mb-6 leading-relaxed">
            {{ sectionContent.description }}
          </p>

          <!-- Feature List -->
          <div class="space-y-3 mb-8">
            <div v-for="(feature, index) in featureList" :key="index" class="flex items-start gap-3">
              <div :class="['w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', feature.iconBgColor]">
                <DocumentTextIcon v-if="feature.icon === 'document'" :class="['w-3.5 h-3.5', feature.iconColor]" />
                <MicrophoneIcon v-else-if="feature.icon === 'microphone'" :class="['w-3.5 h-3.5', feature.iconColor]" />
                <FilmIcon v-else-if="feature.icon === 'film'" :class="['w-3.5 h-3.5', feature.iconColor]" />
              </div>
              <div>
                <span class="font-medium text-gray-900">{{ feature.title }}</span>
                <span class="text-gray-600">{{ feature.description }}</span>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <router-link
            :to="sectionContent.ctaLink"
            class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 group"
          >
            <span>{{ sectionContent.ctaText }}</span>
            <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </router-link>
        </div>

        <!-- Right: Card Swap Animation -->
        <div class="flex-1 w-full">
          <div
            class="relative transition-all duration-1000 delay-300"
            :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
          >
            <!-- Card Stack Container -->
            <div
              ref="cardContainerRef"
              class="relative h-[420px] w-full max-w-[560px] mx-auto cursor-pointer"
              @mouseenter="handleMouseEnter"
              @mouseleave="handleMouseLeave"
              @click="manualSwap"
            >
              <!-- Text Translation Card -->
              <div ref="card0" class="absolute top-[40px] left-[20px] w-[460px] card-item">
                <TextTranslationMockUI
                  ref="textMockUI"
                  :isVisible="currentCardIndex === 0 && isVisible"
                  @animation-complete="onCardAnimationComplete(0)"
                />
              </div>

              <!-- Voice Translation Card -->
              <div ref="card1" class="absolute top-[40px] left-[20px] w-[460px] card-item">
                <VoiceTranslationMockUI
                  ref="voiceMockUI"
                  :isVisible="currentCardIndex === 1 && isVisible"
                  @animation-complete="onCardAnimationComplete(1)"
                />
              </div>

              <!-- Video Translation Card -->
              <div ref="card2" class="absolute top-[40px] left-[20px] w-[460px] card-item">
                <VideoTranslationMockUI
                  ref="videoMockUI"
                  :isVisible="currentCardIndex === 2 && isVisible"
                  @animation-complete="onCardAnimationComplete(2)"
                />
              </div>
            </div>

            <!-- Card Indicators -->
            <div class="flex justify-center gap-2 mt-4">
              <button
                v-for="(_, index) in 3"
                :key="index"
                class="w-2 h-2 rounded-full transition-all duration-300"
                :class="currentCardIndex === index ? 'bg-gray-900 w-6' : 'bg-gray-300 hover:bg-gray-400'"
                @click.stop="goToCard(index)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
/**
 * TranslationFeatureSection - 번역 기능 섹션
 *
 * @description 텍스트, 음성, 영상 번역 기능을 카드 스왑으로 보여주는 섹션
 */
import { ref } from 'vue'
import { LanguageIcon, DocumentTextIcon, MicrophoneIcon, FilmIcon } from '@heroicons/vue/24/outline'
import TextTranslationMockUI from './mockui/TextTranslationMockUI.vue'
import VoiceTranslationMockUI from './mockui/VoiceTranslationMockUI.vue'
import VideoTranslationMockUI from './mockui/VideoTranslationMockUI.vue'
import { featureList, sectionContent } from './data/translationFeatureData'
import { useCardSwapAnimation } from '@/composables/landing/useCardSwapAnimation'

// Refs
const sectionRef = ref(null)
const cardContainerRef = ref(null)
const card0 = ref(null)
const card1 = ref(null)
const card2 = ref(null)
const textMockUI = ref(null)
const voiceMockUI = ref(null)
const videoMockUI = ref(null)

// Composable
const {
  isVisible,
  currentCardIndex,
  onCardAnimationComplete,
  goToCard,
  manualSwap,
  handleMouseEnter,
  handleMouseLeave
} = useCardSwapAnimation(
  sectionRef,
  { card0, card1, card2 },
  { textMockUI, voiceMockUI, videoMockUI }
)
</script>

<style scoped>
.card-item {
  transform-origin: center center;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}
</style>
