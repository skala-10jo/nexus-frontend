<template>
  <section id="features" class="pt-60 pb-48 bg-gray-50">
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

      <!-- Glossary Feature Item -->
      <FeatureItem :feature="glossaryFeature" :reverse="false" />
    </div>
  </section>
</template>

<script setup>
import FeatureItem from './FeatureItem.vue'

const glossaryFeature = {
  id: 'glossary',
  title: '문서 · 전문용어 사전',
  subtitle: 'AI 기반 전문 용어 추출',
  description: '문서를 업로드하면 AI가 자동으로 전문 용어를 추출하고 다국어로 제공합니다.',
  video: '/videos/glossary-demo.mp4',
  route: '/management/glossary',
  icon: 'BookOpenIcon'
}
</script>
