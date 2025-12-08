<template>
  <div class="min-h-screen bg-white">
    <LandingNavbar />
    <HeroSection />
    <FeatureSection />
    <ConversationSceneSection />
    <CTASection />
  </div>
</template>

<script setup>
import LandingNavbar from '@/components/landing/LandingNavbar.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import FeatureSection from '@/components/landing/FeatureSection.vue'
import ConversationSceneSection from '@/components/landing/ConversationSceneSection.vue'
import CTASection from '@/components/landing/CTASection.vue'
</script>
