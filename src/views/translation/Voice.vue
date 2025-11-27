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
  min-height: 100vh;
  background: #F7F6F3;
  padding: 20px;
}
</style>
