<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <!-- Card Header - Category, Flag, Difficulty in one row -->
    <div class="flex items-center gap-2 mb-4">
      <!-- Category Badge - same height as flag -->
      <div class="flex items-center gap-1.5 h-8 px-3 bg-gray-100 rounded-xl">
        <component :is="categoryIconComponent" class="w-4 h-4 text-gray-600" />
        <span class="text-xs font-bold text-gray-700">{{ categoryName }}</span>
      </div>
      <!-- Language Flag - same as ScenarioCard -->
      <span class="w-8 h-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 text-xl hover:scale-110 transition-transform">
        {{ languageFlag }}
      </span>
      <!-- Difficulty Badge - same as ScenarioCard -->
      <span
        class="h-8 px-2.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center"
        :class="difficultyClass"
      >
        {{ difficultyLabel }}
      </span>
    </div>

    <!-- Title & Description -->
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
      {{ scenario.title }}
    </h3>
    <p class="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
      {{ scenario.description }}
    </p>

    <!-- Roles -->
    <div class="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
      <div class="flex items-center gap-2 text-xs">
        <span class="w-16 text-gray-400 font-medium">You</span>
        <span class="font-bold text-gray-800">{{ scenario.roles.user }}</span>
      </div>
      <div class="flex items-center gap-2 text-xs">
        <span class="w-16 text-gray-400 font-medium">AI</span>
        <span class="font-bold text-gray-800">{{ scenario.roles.ai }}</span>
      </div>
    </div>

    <!-- Action Button -->
    <button
      @click="$emit('start', scenario)"
      class="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
    >
      <span>바로 연습</span>
      <ArrowRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryById } from '@/data/businessScenarioTemplates'
import {
  ArrowRightIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

defineEmits(['start'])

const category = computed(() => getCategoryById(props.scenario.category))
const categoryName = computed(() => category.value?.name || '기타')

/**
 * 아이콘 컴포넌트 매핑
 */
const iconComponents = {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon
}

const categoryIconComponent = computed(() => {
  const iconName = category.value?.icon
  return iconComponents[iconName] || Squares2X2Icon
})

const languageFlag = computed(() => {
  const flags = {
    'EN': '🇺🇸',
    'VI': '🇻🇳',
    'KO': '🇰🇷',
    'JA': '🇯🇵',
    'ZH': '🇨🇳',
    'ES': '🇪🇸',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'PT': '🇧🇷',
    'RU': '🇷🇺',
    'TH': '🇹🇭',
    'ID': '🇮🇩'
  }
  const lang = props.scenario.language?.toUpperCase()
  return flags[lang] || '🌐'
})

const difficultyClass = computed(() => {
  const classes = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  }
  return classes[props.scenario.difficulty] || 'bg-gray-100 text-gray-700'
})

const difficultyLabel = computed(() => {
  const labels = {
    beginner: '초급',
    intermediate: '중급',
    advanced: '고급'
  }
  return labels[props.scenario.difficulty] || props.scenario.difficulty
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
