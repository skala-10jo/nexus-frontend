<template>
  <div class="audio-visualizer">
    <!-- 파형 시각화 -->
    <div class="waveform">
      <div
        v-for="i in barCount"
        :key="i"
        class="bar"
        :style="{
          height: getBarHeight(i) + '%',
          backgroundColor: getBarColor(i)
        }"
      ></div>
    </div>

    <!-- 음성 레벨 표시 -->
    <div class="level-indicator">
      <div class="level-bar">
        <div
          class="level-fill"
          :style="{ width: (audioLevel * 100) + '%' }"
        ></div>
      </div>
      <span class="level-text">{{ Math.round(audioLevel * 100) }}%</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  audioLevel: {
    type: Number,
    required: true,
    validator: (value) => value >= 0 && value <= 1
  },
  barCount: {
    type: Number,
    default: 20
  }
})

// 각 바의 높이 히스토리 (애니메이션용)
const barHeights = ref(Array(props.barCount).fill(0))
const animationFrameId = ref(null)

// 음성 레벨 변화 감지
watch(() => props.audioLevel, (newLevel) => {
  updateBars(newLevel)
})

/**
 * 바 높이 업데이트 (파형 효과)
 */
const updateBars = (level) => {
  // 중앙에서 바깥쪽으로 퍼지는 효과
  const center = Math.floor(props.barCount / 2)

  for (let i = 0; i < props.barCount; i++) {
    const distance = Math.abs(i - center)
    const delay = distance * 0.05  // 거리에 따른 딜레이

    // 랜덤 변동 추가 (더 자연스러운 파형)
    const randomFactor = 0.8 + Math.random() * 0.4  // 0.8 ~ 1.2

    // 거리에 따라 높이 감소
    const heightFactor = 1 - (distance / center) * 0.3

    setTimeout(() => {
      barHeights.value[i] = level * randomFactor * heightFactor
    }, delay * 1000)
  }
}

/**
 * 각 바의 높이 계산
 */
const getBarHeight = (index) => {
  const i = index - 1
  if (i < 0 || i >= barHeights.value.length) return 0

  const height = barHeights.value[i]

  // 최소 높이 5%, 최대 높이 100%
  return Math.max(5, Math.min(100, height * 100))
}

/**
 * 바 색상 (음성 레벨에 따라 변화)
 */
const getBarColor = (index) => {
  const i = index - 1
  if (i < 0 || i >= barHeights.value.length) return '#E5E7EB'

  const height = barHeights.value[i]

  if (height > 0.7) return '#10B981'  // 녹색 (높음)
  if (height > 0.4) return '#3B82F6'  // 파란색 (중간)
  if (height > 0.1) return '#F59E0B'  // 주황색 (낮음)
  return '#E5E7EB'  // 회색 (매우 낮음)
}

// 컴포넌트 언마운트 시 정리
onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<style scoped>
.audio-visualizer {
  width: 100%;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.waveform {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 100px;
  gap: 2px;
  margin-bottom: 1rem;
}

.bar {
  flex: 1;
  min-width: 3px;
  border-radius: 4px 4px 0 0;
  transition: height 0.15s ease-out, background-color 0.3s ease;
  box-shadow: 0 -2px 8px rgba(255, 255, 255, 0.2);
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #10B981 0%, #3B82F6 50%, #8B5CF6 100%);
  transition: width 0.1s ease-out;
  border-radius: 4px;
}

.level-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  min-width: 45px;
  text-align: right;
  font-family: 'Courier New', monospace;
}

/* 펄스 효과 (높은 음성 레벨 시) */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.6);
  }
}

.audio-visualizer:has(.bar[style*="height: 100%"]) {
  animation: pulse 1s ease-in-out infinite;
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .audio-visualizer {
    padding: 1rem;
  }

  .waveform {
    height: 60px;
  }

  .level-text {
    font-size: 0.8rem;
  }
}
</style>
