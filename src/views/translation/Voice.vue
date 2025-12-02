<template>
  <div class="voice-translation-page">
    <MultiLanguageTranslator />
  </div>
</template>

<script setup>
import MultiLanguageTranslator from '@/components/voice/MultiLanguageTranslator.vue'
</script>

<style scoped>
.voice-translation-page {
  height: 100vh;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
