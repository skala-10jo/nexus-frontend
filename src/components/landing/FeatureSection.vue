<template>
  <section id="features" class="pb-40 bg-gray-50">
    <!-- 실시간 회의 AI 피드백 (첫 번째) -->
    <div class="max-w-7xl mx-auto px-6">
      <FeatureItem
        v-if="meetingFeature"
        :feature="meetingFeature"
        :reverse="false"
      />
    </div>

    <!-- 번역 통합 섹션 (실시간 회의와 메일 사이) -->
    <TranslationFeatureSection />

    <!-- 메일 도우미 (마지막) -->
    <div class="max-w-7xl mx-auto px-6 mt-32">
      <FeatureItem
        v-if="mailFeature"
        :feature="mailFeature"
        :reverse="false"
      />
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { features } from './features'
import FeatureItem from './FeatureItem.vue'
import TranslationFeatureSection from './TranslationFeatureSection.vue'

const meetingFeature = computed(() => features.find(f => f.id === 'realtime-meeting'))
const mailFeature = computed(() => features.find(f => f.id === 'mail'))
</script>
