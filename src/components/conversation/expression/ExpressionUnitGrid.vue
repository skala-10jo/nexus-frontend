<template>
  <div class="w-full py-4 md:py-8 h-full flex flex-col justify-center items-center">
    <swiper :effect="'coverflow'" :grabCursor="true" :centeredSlides="true" :slidesPerView="'auto'" :coverflowEffect="{
      rotate: 50,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    }" :pagination="{ clickable: true }" :mousewheel="true" :modules="modules" :breakpoints="{
        320: {
          slidesPerView: 1,
          spaceBetween: 0,
          effect: 'slide'
        },
        768: {
          slidesPerView: 'auto',
          spaceBetween: 0,
          effect: 'coverflow'
        }
      }" class="mySwiper w-full h-full py-4 md:py-12">
      <swiper-slide v-for="unit in units" :key="unit.unit" class="rounded-3xl border-2 border-blue-200 overflow-hidden relative group transition-all duration-300
               w-full md:w-[85%] h-[60vh] mx-auto md:mx-0">
        <!-- Background Image -->
        <div class="absolute inset-0 z-0">
          <img :src="getUnitImage(unit.unit)"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            alt="Unit Background" />
          <div class="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80"></div>
        </div>

        <div class="relative z-10 h-full flex flex-col">
          <!-- Unit Header -->
          <div class="p-6 md:p-8 border-b border-white/10">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h2 class="text-xl md:text-2xl font-bold text-white mb-2 md:mb-3 drop-shadow-md">{{ unit.unit }}</h2>
                <div class="flex items-center gap-3">
                  <div class="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm shadow-inner">
                    <div
                      class="h-full rounded-full transition-all duration-300 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.6)]"
                      :style="{ width: `${unit.accuracyRate || 0}%` }"></div>
                  </div>
                  <span class="text-sm font-medium text-white/90 whitespace-nowrap drop-shadow-md">
                    <template v-if="unit.quizAttemptedCount > 0">
                      {{ Math.round(unit.accuracyRate || 0) }}%
                    </template>
                    <template v-else>
                      0%
                    </template>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Chapters Grid -->
          <div class="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div v-if="unitChapters[unit.unit]?.length > 0">
              <div class="space-y-3">
                <button v-for="chapter in unitChapters[unit.unit]" :key="chapter.chapter"
                  @click="$emit('select-chapter', unit.unit, chapter.chapter)"
                  class="w-full p-4 rounded-xl border border-white/20 transition-all duration-200 hover:bg-white/10 hover:border-white/40 bg-black/20 backdrop-blur-md group/chapter flex flex-col md:flex-row items-center justify-center md:justify-between gap-3 md:gap-0 text-center md:text-left">
                  <span
                    class="font-semibold text-white text-sm truncate w-full md:w-auto md:flex-1 md:mr-2 group-hover/chapter:text-blue-200">{{
                      chapter.chapter }}</span>
                  <div class="flex items-center gap-2 w-full md:w-16 flex-shrink-0 justify-center">
                    <div
                      class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden max-w-[100px] md:max-w-none mx-auto md:mx-0">
                      <div class="h-full rounded-full transition-all duration-300 bg-blue-400"
                        :style="{ width: `${chapter.accuracyRate || 0}%` }"></div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-8 text-white/60">
              챕터를 불러오는 중...
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue';
import { EffectCoverflow, Pagination, Mousewheel } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

const modules = [EffectCoverflow, Pagination, Mousewheel];

defineProps({
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

const getUnitImage = (unitName) => {
  if (unitName.includes('미팅')) return '/images/expression/meeting.png';
  if (unitName.includes('요청')) return '/images/expression/request.png';
  if (unitName.includes('피드백')) return '/images/expression/feedback.png';
  if (unitName.includes('이메일')) return '/images/expression/email.png';
  return '/images/expression/meeting.png'; // Fallback
}
</script>

<style scoped>
.swiper {
  width: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
}

.swiper-slide {
  background-position: center;
  background-size: cover;
  /* Mobile default */
}

@media (min-width: 768px) {
  .swiper-slide {
    width: 500px;
    height: 600px;
  }
}

.swiper-slide img {
  display: block;
  width: 100%;
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
