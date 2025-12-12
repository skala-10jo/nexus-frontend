<template>
  <!-- Mobile Swiper View for My Scenarios -->
  <div class="h-full flex flex-col justify-center pb-10">
    <div class="flex-1 flex flex-col justify-center">
      <swiper
        :effect="'cards'"
        :grabCursor="true"
        :modules="modules"
        class="w-full max-w-sm mx-auto"
        :cardsEffect="{
          perSlideOffset: 1,
          perSlideRotate: 2,
          rotate: true,
          slideShadows: true,
        }"
      >
        <swiper-slide v-for="scenario in scenarios" :key="scenario.id" class="rounded-3xl">
          <ScenarioCard
            :scenario="scenario"
            :projects="projects"
            :schedules="schedules"
            @edit="$emit('edit', $event)"
            @delete="$emit('delete', $event)"
            @start="$emit('start', $event)"
            class="h-[55vh] shadow-xl"
          />
        </swiper-slide>
      </swiper>
    </div>
  </div>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'
import ScenarioCard from './ScenarioCard.vue'

const modules = [EffectCards]

defineProps({
  scenarios: {
    type: Array,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  },
  schedules: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'start'])
</script>
