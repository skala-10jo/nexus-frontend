<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <!-- Template Badge -->
    <div class="absolute top-4 right-4">
      <span class="px-2 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
        Template
      </span>
    </div>

    <!-- Card Header -->
    <div class="flex items-start gap-3 mb-4">
      <!-- Category Icon -->
      <span class="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50 text-xl">
        {{ categoryIcon }}
      </span>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="w-6 h-6 bg-gray-50 rounded flex items-center justify-center text-sm">
            {{ languageFlag }}
          </span>
          <span
            class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
            :class="difficultyClass"
          >
            {{ difficultyLabel }}
          </span>
        </div>
        <span class="text-xs text-gray-400 font-medium">{{ categoryName }}</span>
      </div>
    </div>

    <!-- Title & Description -->
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
      {{ scenario.title }}
    </h3>
    <p class="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">
      {{ scenario.description }}
    </p>

    <!-- Estimated Duration & Tags -->
    <div class="mb-4 space-y-2">
      <!-- Duration -->
      <div class="flex items-center gap-2 text-xs text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>예상 시간: {{ scenario.estimatedDuration }}</span>
      </div>
      <!-- Tags -->
      <div class="flex flex-wrap gap-1">
        <span
          v-for="tag in displayTags"
          :key="tag"
          class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium"
        >
          #{{ tag }}
        </span>
        <span
          v-if="scenario.tags?.length > 2"
          class="px-2 py-0.5 text-gray-400 text-[10px] font-medium"
        >
          +{{ scenario.tags.length - 2 }}
        </span>
      </div>
    </div>

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

    <!-- Action Buttons -->
    <div class="flex gap-2">
      <button
        @click="$emit('start', scenario)"
        class="flex-1 py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
      >
        <span>바로 연습</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
      <button
        @click="$emit('copy', scenario)"
        class="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-1"
        title="내 시나리오로 복사"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getCategoryById } from '@/data/businessScenarioTemplates'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

defineEmits(['start', 'copy'])

const category = computed(() => getCategoryById(props.scenario.category))
const categoryIcon = computed(() => category.value?.icon || '📋')
const categoryName = computed(() => category.value?.name || '기타')

const displayTags = computed(() => {
  return (props.scenario.tags || []).slice(0, 2)
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
