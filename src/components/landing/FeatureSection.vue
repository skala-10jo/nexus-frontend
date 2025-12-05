<template>
  <section id="features" class="py-40 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Section Title -->
      <div class="text-center mb-44">
        <span class="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          Features
        </span>
        <h2 class="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">주요 기능</h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          AI 기반의 강력한 번역, 회화, 협업 기능으로 글로벌 비즈니스를 지원합니다
        </p>
      </div>

      <!-- Feature Items -->
      <div class="space-y-48">
        <FeatureItem
          v-for="(feature, index) in features"
          :key="feature.id"
          :feature="feature"
          :reverse="index % 2 === 1"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { features } from './features'
import FeatureItem from './FeatureItem.vue'
</script>
