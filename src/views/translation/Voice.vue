<template>
  <div class="voice-translation-page">
    <AzureRealtimeTranslator />
  </div>
</template>

<script setup>
import AzureRealtimeTranslator from '@/components/voice/AzureRealtimeTranslator.vue'
</script>

<style scoped>
.voice-translation-page {
  min-height: 100vh;
  background: #F7F6F3;
  padding: 20px;
}
</style>
