<template>
  <div class="relative w-full h-full flex flex-col justify-center items-center overflow-hidden py-6 sm:py-10">

    <!-- Circular Gallery -->
    <CircularGallery ref="galleryRef" :items="units" :item-width="cardWidth" :gap="isMobile ? 12 : 20" :bend="isMobile ? 1 : 2" :scroll-speed="2"
      :scroll-ease="0.05" @select="handleGallerySelect">
      <template #default="{ item: unit, index: idx, isActive }">
        <!-- Card - Responsive sizing -->
        <div
          class="bg-white rounded-2xl sm:rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 sm:p-6 md:p-8 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-blue-200"
          :style="{ width: cardWidth + 'px', height: cardHeight + 'px' }"
          :class="isActive
            ? 'ring-2 sm:ring-4 ring-blue-400 ring-offset-2 sm:ring-offset-4 ring-offset-gray-50 shadow-[0_15px_50px_rgba(59,130,246,0.15)]'
            : 'opacity-50 grayscale-[0.3] scale-90'"
          @click="scrollToIndex(idx)">

          <!-- Pneumatic Highlight -->
          <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

          <!-- Unit Header -->
          <div class="flex justify-between items-start mb-3 sm:mb-6">
            <span
              class="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-base sm:text-xl shadow-inner transition-colors duration-300"
              :class="getUnitIconStyle(unit.unit)">
              {{ getUnitIcon(unit.unit) }}
            </span>
            <div class="text-right flex-1 ml-2 sm:ml-4">
              <h3 class="font-bold text-gray-800 text-sm sm:text-lg md:text-xl leading-tight line-clamp-2">{{ unit.unit }}</h3>
              <div class="flex items-center justify-end gap-1 sm:gap-2 mt-1 sm:mt-2">
                <div class="w-16 sm:w-24 h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-500 bg-blue-400"
                    :style="{ width: `${unit.accuracyRate || 0}%` }"></div>
                </div>
                <span class="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                  {{ Math.round(unit.accuracyRate || 0) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Chapters List -->
          <div class="flex-1 overflow-y-auto custom-scrollbar">
            <div v-if="unitChapters[unit.unit]?.length > 0" class="space-y-2 sm:space-y-4">
              <button
                v-for="chapter in unitChapters[unit.unit]"
                :key="chapter.chapter"
                @click.stop="$emit('select-chapter', unit.unit, chapter.chapter)"
                class="w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border border-gray-100 transition-all duration-200 hover:bg-blue-50 hover:border-blue-200 bg-gray-50/50 group/chapter flex items-center justify-between gap-2 sm:gap-3 text-left">
                <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-300 flex-shrink-0"></div>
                  <span class="font-medium text-gray-700 text-xs sm:text-sm truncate group-hover/chapter:text-blue-600">
                    {{ chapter.chapter }}
                  </span>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <div class="w-8 sm:w-12 h-1 sm:h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300 bg-blue-400"
                      :style="{ width: `${chapter.accuracyRate || 0}%` }"></div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
                    class="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 group-hover/chapter:text-blue-500 transition-colors">
                    <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            <div v-else class="text-center py-4 sm:py-8 text-gray-400 text-sm">
              Loading...
            </div>
          </div>

        </div>
      </template>
    </CircularGallery>

    <!-- Pagination Dots -->
    <div class="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
      <button v-for="(_, index) in units" :key="index" @click="scrollToIndex(index)"
        class="h-2 rounded-full transition-all duration-300"
        :class="index === activeIndex ? 'bg-blue-500 w-8' : 'bg-gray-400/50 w-2 hover:bg-gray-400'"></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CircularGallery from '@/components/common/effects/CircularGallery.vue'

const props = defineProps({
  units: {
    type: Array,
    required: true
  },
  unitChapters: {
    type: Object,
    required: true
  },
  getProgressBarColor: {
    type: Function,
    required: true
  }
})

defineEmits(['select-chapter'])

const galleryRef = ref(null)
const activeIndex = ref(0)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)

// Responsive card dimensions
const isMobile = computed(() => windowWidth.value < 640)
const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)

const cardWidth = computed(() => {
  if (isMobile.value) return Math.min(windowWidth.value - 48, 280) // Mobile: max 280px with 24px padding each side
  if (isTablet.value) return 340 // Tablet
  return 420 // Desktop
})

const cardHeight = computed(() => {
  if (isMobile.value) return Math.min(windowWidth.value * 1.1, 380) // Mobile: proportional height
  if (isTablet.value) return 440 // Tablet
  return 520 // Desktop
})

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleGallerySelect = (index) => {
  activeIndex.value = index
}

const scrollToIndex = (index) => {
  if (galleryRef.value) {
    galleryRef.value.scrollTo(index)
  }
}

// Unit icon based on unit name
const getUnitIcon = (unitName) => {
  if (unitName.includes('미팅')) return '🤝'
  if (unitName.includes('요청')) return '📋'
  if (unitName.includes('피드백')) return '💬'
  if (unitName.includes('이메일')) return '📧'
  return '📚'
}

// Unit icon background style
const getUnitIconStyle = (unitName) => {
  if (unitName.includes('미팅')) return 'bg-blue-100 text-blue-600'
  if (unitName.includes('요청')) return 'bg-amber-100 text-amber-600'
  if (unitName.includes('피드백')) return 'bg-green-100 text-green-600'
  if (unitName.includes('이메일')) return 'bg-purple-100 text-purple-600'
  return 'bg-gray-100 text-gray-600'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}
</style>
