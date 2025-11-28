<template>
  <div
    class="bg-white rounded-2xl p-5 mb-4 border-l-4 shadow-sm hover:shadow-md transition-all duration-200 group"
    :class="[`speaker-${speakerId}`, { 'animate-slide-in': isNewSpeaker }]"
    :style="{ borderLeftColor: speakerColor }"
  >
    <!-- 화자 정보 -->
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center gap-3">
        <!-- 화자 아이콘 -->
        <div 
          class="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm"
          :style="{ backgroundColor: speakerColor }"
        >
          <UserIcon class="w-5 h-5" />
        </div>
        
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-900 text-sm">Speaker {{ speakerId }}</span>
            <span v-if="isNewSpeaker" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wide">
              New
            </span>
          </div>
          
          <!-- 신뢰도 -->
          <div class="flex items-center gap-1.5 mt-0.5">
            <div class="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-500"
                :class="getConfidenceColorClass(speakerConfidence)"
                :style="{ width: `${speakerConfidence * 100}%` }"
              ></div>
            </div>
            <span class="text-[10px] font-medium text-gray-400">{{ Math.round(speakerConfidence * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- 타임스탬프 -->
      <div class="text-xs font-medium text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded-lg">
        {{ formattedTime }}
      </div>
    </div>

    <!-- 원문 -->
    <div class="mb-4 pl-13">
      <div class="flex items-center gap-2 mb-1.5">
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
          {{ getLanguageName(inputLanguage) }}
        </span>
      </div>
      <p class="text-gray-900 text-lg font-medium leading-relaxed">{{ originalText }}</p>
    </div>

    <!-- 번역 결과 -->
    <div class="space-y-3 pt-3 border-t border-gray-100">
      <div
        v-for="(translation, lang) in translations"
        :key="lang"
        class="group/trans"
      >
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">
            {{ getLanguageName(lang) }}
          </span>
        </div>
        <p class="text-gray-600 leading-relaxed group-hover/trans:text-gray-900 transition-colors">{{ translation }}</p>
      </div>
    </div>

    <!-- STT 신뢰도 경고 -->
    <div v-if="sttConfidence < 0.7" class="mt-4 flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
      <ExclamationTriangleIcon class="w-5 h-5 text-amber-500 flex-shrink-0" />
      <div>
        <p class="text-xs font-bold text-amber-700 mb-0.5">Low Confidence</p>
        <p class="text-xs text-amber-600">
          Speech recognition confidence is low ({{ Math.round(sttConfidence * 100) }}%). The translation might be inaccurate.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { UserIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid'

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

// 화자별 색상 (Aceagency Palette)
const SPEAKER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
]

const speakerColor = computed(() => {
  const index = (props.speakerId - 1) % SPEAKER_COLORS.length
  return SPEAKER_COLORS[index]
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
    'ko': 'Korean',
    'en': 'English',
    'vi': 'Vietnamese',
    'ja': 'Japanese',
    'zh': 'Chinese'
  }
  return names[code] || code.toUpperCase()
}

const getConfidenceColorClass = (confidence) => {
  if (confidence >= 0.8) return 'bg-green-500'
  if (confidence >= 0.6) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
