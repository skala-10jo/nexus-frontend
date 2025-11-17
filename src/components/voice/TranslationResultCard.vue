<template>
  <div
    class="translation-card"
    :class="[`speaker-${speakerId}`, { 'new-speaker': isNewSpeaker }]"
    :style="{ borderLeftColor: speakerColor }"
  >
    <!-- 화자 정보 -->
    <div class="speaker-header">
      <div class="speaker-info">
        <div class="speaker-icon" :style="{ backgroundColor: speakerColor }">
          {{ speakerEmoji }}
        </div>
        <span class="speaker-label">화자 {{ speakerId }}</span>

        <!-- 신뢰도 표시 -->
        <span
          v-if="speakerConfidence"
          class="confidence-badge"
          :class="getConfidenceClass(speakerConfidence)"
        >
          {{ Math.round(speakerConfidence * 100) }}%
        </span>

        <!-- 새 화자 표시 -->
        <span v-if="isNewSpeaker" class="new-badge">
          새 화자
        </span>
      </div>

      <!-- 타임스탬프 -->
      <div class="timestamp">
        {{ formattedTime }}
      </div>
    </div>

    <!-- 원문 -->
    <div class="original-text">
      <span class="language-tag">{{ getLanguageName(inputLanguage) }}</span>
      <p class="text-content">{{ originalText }}</p>
    </div>

    <!-- 번역 결과 -->
    <div class="translations">
      <div
        v-for="(translation, lang) in translations"
        :key="lang"
        class="translation-item"
      >
        <span class="language-tag">{{ getLanguageName(lang) }}</span>
        <p class="text-content">{{ translation }}</p>
      </div>
    </div>

    <!-- STT 신뢰도 (낮을 때만 표시) -->
    <div v-if="sttConfidence < 0.7" class="warning-badge">
      ⚠️ 음성 인식 신뢰도 낮음 ({{ Math.round(sttConfidence * 100) }}%)
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  speakerId: {
    type: Number,
    required: true
  },
  speakerConfidence: {
    type: Number,
    default: 0.9
  },
  isNewSpeaker: {
    type: Boolean,
    default: false
  },
  originalText: {
    type: String,
    required: true
  },
  translations: {
    type: Object,
    required: true
  },
  inputLanguage: {
    type: String,
    default: 'ko'
  },
  timestamp: {
    type: [Number, Date],
    required: true
  },
  sttConfidence: {
    type: Number,
    default: 0.9
  }
})

// 화자별 색상 (최대 5명)
const SPEAKER_COLORS = [
  { primary: '#3B82F6', emoji: '👤' },    // 파란색
  { primary: '#10B981', emoji: '👥' },    // 초록색
  { primary: '#F59E0B', emoji: '🧑' },    // 주황색
  { primary: '#8B5CF6', emoji: '👨' },    // 보라색
  { primary: '#EF4444', emoji: '👩' },    // 빨간색
]

const speakerColor = computed(() => {
  const index = (props.speakerId - 1) % SPEAKER_COLORS.length
  return SPEAKER_COLORS[index].primary
})

const speakerEmoji = computed(() => {
  const index = (props.speakerId - 1) % SPEAKER_COLORS.length
  return SPEAKER_COLORS[index].emoji
})

const formattedTime = computed(() => {
  const date = props.timestamp instanceof Date
    ? props.timestamp
    : new Date(props.timestamp)

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${hours}:${minutes}:${seconds}`
})

const getLanguageName = (code) => {
  const names = {
    'ko': '한국어',
    'en': '영어',
    'vi': '베트남어'
  }
  return names[code] || code
}

const getConfidenceClass = (confidence) => {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.6) return 'medium'
  return 'low'
}
</script>

<style scoped>
.translation-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  border-left: 4px solid;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.translation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.translation-card.new-speaker {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.speaker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.speaker-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.speaker-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.speaker-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.95rem;
}

.confidence-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.confidence-badge.high {
  background: #D1FAE5;
  color: #059669;
}

.confidence-badge.medium {
  background: #FEF3C7;
  color: #D97706;
}

.confidence-badge.low {
  background: #FEE2E2;
  color: #DC2626;
}

.new-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background: #DBEAFE;
  color: #2563EB;
}

.timestamp {
  font-size: 0.85rem;
  color: #9CA3AF;
  font-family: 'Courier New', monospace;
}

.original-text,
.translation-item {
  margin-bottom: 0.75rem;
}

.language-tag {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  background: #F3F4F6;
  color: #6B7280;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  text-transform: uppercase;
}

.text-content {
  margin: 0.5rem 0 0 0;
  color: #1F2937;
  font-size: 1rem;
  line-height: 1.6;
}

.original-text .text-content {
  font-weight: 500;
  font-size: 1.05rem;
}

.translations {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.warning-badge {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: #FEF3C7;
  border-left: 3px solid #F59E0B;
  border-radius: 6px;
  font-size: 0.85rem;
  color: #92400E;
}

/* 반응형 디자인 */
@media (max-width: 640px) {
  .translation-card {
    padding: 1rem;
  }

  .speaker-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .text-content {
    font-size: 0.95rem;
  }
}
</style>
