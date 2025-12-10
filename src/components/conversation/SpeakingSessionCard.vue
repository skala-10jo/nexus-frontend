<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-4 md:p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-3 md:mb-4">
      <div class="flex items-center gap-2">
        <span class="w-7 h-7 md:w-8 md:h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 text-lg md:text-xl hover:scale-110 transition-transform">
          {{ languageFlag }}
        </span>
        <span
          class="h-7 md:h-8 px-2.5 rounded-lg text-[10px] md:text-xs font-bold flex items-center"
          :class="statusClass"
        >
          {{ statusLabel }}
        </span>
      </div>

      <div class="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="$emit('delete', session.id)"
          class="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
          title="삭제"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Title & Description -->
    <h3 class="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
      {{ session.originalFilename || '녹음 파일' }}
    </h3>
    <p class="text-xs md:text-sm text-gray-500 mb-3 md:mb-4 line-clamp-2 flex-1">
      {{ description }}
    </p>

    <!-- Stats -->
    <div class="bg-gray-50 rounded-2xl p-3 md:p-4 mb-3 md:mb-4 space-y-1.5 md:space-y-2">
      <div class="flex items-center gap-2 text-[10px] md:text-xs">
        <span class="w-14 md:w-16 text-gray-400 font-medium">화자</span>
        <span class="font-bold text-gray-800">{{ session.speakerCount || 0 }}명</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] md:text-xs">
        <span class="w-14 md:w-16 text-gray-400 font-medium">발화</span>
        <span class="font-bold text-gray-800">{{ session.utteranceCount || 0 }}개</span>
      </div>
      <div class="flex items-center gap-2 text-[10px] md:text-xs">
        <span class="w-14 md:w-16 text-gray-400 font-medium">분석일</span>
        <span class="font-bold text-gray-800">{{ formattedDate }}</span>
      </div>
    </div>

    <!-- Processing Indicator (for pending/processing) -->
    <div v-if="isProcessing" class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-xs text-blue-600 font-medium">분석 진행 중...</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1.5">
        <div
          class="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
          :style="{ width: `${session.progress || 0}%` }"
        ></div>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="$emit('select', session.id)"
      :disabled="isProcessing"
      class="w-full py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
      :class="isProcessing
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98]'"
    >
      <template v-if="session.status === 'COMPLETED'">
        <span>분석 결과 보기</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </template>
      <template v-else-if="isProcessing">
        <span>분석 중</span>
      </template>
      <template v-else>
        <span>다시 분석</span>
      </template>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  session: {
    type: Object,
    required: true
  }
})

defineEmits(['select', 'delete'])

// Computed
const isProcessing = computed(() => {
  return ['PROCESSING', 'PENDING'].includes(props.session.status)
})

const statusClass = computed(() => {
  const classes = {
    COMPLETED: 'bg-green-100 text-green-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    FAILED: 'bg-red-100 text-red-700'
  }
  return classes[props.session.status] || 'bg-gray-100 text-gray-700'
})

const statusLabel = computed(() => {
  const labels = {
    COMPLETED: '완료',
    PROCESSING: '처리 중',
    PENDING: '대기 중',
    FAILED: '실패'
  }
  return labels[props.session.status] || props.session.status
})

const languageFlag = computed(() => {
  const flags = {
    'en-US': '🇺🇸',
    'en-GB': '🇬🇧',
    'ko-KR': '🇰🇷',
    'ja-JP': '🇯🇵',
    'zh-CN': '🇨🇳',
    'vi-VN': '🇻🇳',
    'es-ES': '🇪🇸',
    'fr-FR': '🇫🇷',
    'de-DE': '🇩🇪',
    'pt-BR': '🇧🇷',
    'ru-RU': '🇷🇺',
    'th-TH': '🇹🇭',
    'id-ID': '🇮🇩'
  }
  return flags[props.session.language] || '🌐'
})

const formattedDate = computed(() => {
  if (!props.session.createdAt) return '-'
  const date = new Date(props.session.createdAt)
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const description = computed(() => {
  // If we have STT summary, use it
  if (props.session.summary) {
    return props.session.summary
  }

  // If we have utterances preview, generate a summary
  if (props.session.utterancesPreview && props.session.utterancesPreview.length > 0) {
    const preview = props.session.utterancesPreview
      .slice(0, 2)
      .map(u => u.text)
      .join(' ')
    return preview.length > 100 ? preview.substring(0, 100) + '...' : preview
  }

  // Fallback description based on status
  if (props.session.status === 'COMPLETED') {
    return `${props.session.speakerCount || 0}명의 화자가 ${props.session.utteranceCount || 0}개의 발화를 나눈 회의입니다.`
  } else if (props.session.status === 'PROCESSING') {
    return '음성 파일을 분석하고 있습니다...'
  } else if (props.session.status === 'PENDING') {
    return '분석 대기 중입니다.'
  } else {
    return '분석에 실패했습니다. 다시 시도해주세요.'
  }
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
