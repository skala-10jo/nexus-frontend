<template>
  <section class="py-40 bg-gray-50">
    <div class="max-w-7xl mx-auto px-6">
      <!-- Feature Items (excluding glossary) -->
      <div class="space-y-48">
        <FeatureItem
          v-for="(feature, index) in otherFeatures"
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

// glossary 제외한 나머지 features
const otherFeatures = features.filter(f => f.id !== 'glossary')
</script>
