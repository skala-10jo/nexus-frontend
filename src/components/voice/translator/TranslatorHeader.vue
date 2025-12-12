<template>
  <div class="translator-header">
    <div>
      <h2 class="title">실시간 음성 번역</h2>
      <p class="subtitle">Azure Speech Service 기반 AI 음성 인식 및 번역</p>
    </div>

    <!-- 통계 -->
    <div class="stats">
      <div class="stat-item">
        <span class="stat-label">인식된 문장</span>
        <span class="stat-value">{{ recognizedCount }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">경과 시간</span>
        <span class="stat-value">{{ formattedElapsedTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  recognizedCount: {
    type: Number,
    required: true
  },
  formattedElapsedTime: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
/* 헤더 */
.translator-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.title {
  font-size: 24px;
  font-weight: 600;
  color: #37352F;
  margin: 0 0 4px 0;
}

.subtitle {
  font-size: 14px;
  color: #6B6B6B;
  margin: 0;
}

/* 통계 */
.stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stat-label {
  font-size: 12px;
  color: #6B6B6B;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #37352F;
}
</style>
