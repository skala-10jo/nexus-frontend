<template>
  <!-- Mobile Swiper View for Business Templates -->
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
        <swiper-slide v-for="template in templates" :key="template.id" class="rounded-3xl">
          <BusinessScenarioCard
            :scenario="template"
            @start="$emit('start', $event)"
            @copy="$emit('copy', $event)"
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
import BusinessScenarioCard from './BusinessScenarioCard.vue'

const modules = [EffectCards]

defineProps({
  templates: {
    type: Array,
    required: true
  }
})

defineEmits(['start', 'copy'])
</script>
