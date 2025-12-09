<template>
  <section id="features" class="pb-40 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Feature Items (헤더 없이 바로 시작) -->
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
