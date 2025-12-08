<template>
  <div class="relative w-full h-full flex flex-col justify-center items-center overflow-hidden py-10">

    <!-- Circular Gallery -->
    <CircularGallery ref="galleryRef" :items="units" :item-width="400" :gap="20" :bend="2" :scroll-speed="2"
      :scroll-ease="0.05" @select="handleGallerySelect">
      <template #default="{ item: unit, isActive }">
        <!-- Card Wrapper (for ring effect) -->
        <div
          class="w-[400px] h-[500px] rounded-3xl transition-all duration-500"
          :class="isActive ? 'scale-100 opacity-100 ring-4 ring-blue-400/50' : 'scale-95 opacity-70'"
          @click="scrollToIndex(units.indexOf(unit))">
          <!-- Card (with overflow-hidden) -->
          <div class="w-full h-full rounded-3xl overflow-hidden relative group shadow-2xl">
            <!-- Background Image -->
            <div class="absolute inset-0 z-0">
              <img :src="getUnitImage(unit.unit)"
                class="w-full h-full object-cover"
                alt="Unit Background" />
              <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/60"></div>
            </div>

            <div class="relative z-10 h-full flex flex-col">
              <!-- Unit Header -->
              <div class="p-6 border-b border-white/10">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <h2 class="text-2xl font-bold text-white mb-2 drop-shadow-md">{{ unit.unit }}</h2>
                    <div class="flex items-center gap-3">
                      <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                        <div
                          class="h-full rounded-full transition-all duration-500 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]"
                          :style="{ width: `${unit.accuracyRate || 0}%` }"></div>
                      </div>
                      <span class="text-sm font-medium text-white/90 whitespace-nowrap drop-shadow-md">
                        {{ Math.round(unit.accuracyRate || 0) }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Chapters Grid -->
              <div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
                <div v-if="unitChapters[unit.unit]?.length > 0">
                  <div class="space-y-3">
                    <button v-for="chapter in unitChapters[unit.unit]" :key="chapter.chapter"
                      @click.stop="$emit('select-chapter', unit.unit, chapter.chapter)"
                      class="w-full p-4 rounded-xl border border-white/10 transition-all duration-200 hover:bg-white/10 hover:border-white/30 bg-black/40 backdrop-blur-md group/chapter flex items-center justify-between gap-3 text-left">
                      <span class="font-semibold text-white text-sm truncate flex-1 group-hover/chapter:text-blue-200">{{
                        chapter.chapter }}</span>
                      <div class="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden shrink-0">
                        <div class="h-full rounded-full transition-all duration-300 bg-blue-400"
                          :style="{ width: `${chapter.accuracyRate || 0}%` }"></div>
                      </div>
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-white/60">
                  Loading...
                </div>
              </div>
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
import { ref, computed, nextTick } from 'vue'
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

const handleGallerySelect = (index) => {
  activeIndex.value = index
}

const scrollToIndex = (index) => {
  if (galleryRef.value) {
    galleryRef.value.scrollTo(index)
  }
}

const getUnitImage = (unitName) => {
  if (unitName.includes('미팅')) return '/images/expression/meeting.png';
  if (unitName.includes('요청')) return '/images/expression/request.png';
  if (unitName.includes('피드백')) return '/images/expression/feedback.png';
  if (unitName.includes('이메일')) return '/images/expression/email.png';
  return '/images/expression/meeting.png'; // Fallback
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
