<script setup>
/**
 * Business Category Sidebar Component
 * @description 비즈니스 시나리오 템플릿 카테고리 필터 사이드바
 */
import { computed } from 'vue'
import { BUSINESS_CATEGORIES, getScenarioCountByCategory } from '@/data/businessScenarioTemplates'
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

defineProps({
  /** 선택된 카테고리 ID */
  selectedCategory: {
    type: String,
    default: null
  },
  /** 선택된 난이도 */
  selectedDifficulty: {
    type: String,
    default: null
  },
  /** 전체 템플릿 수 */
  totalTemplates: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  /** 카테고리 선택 */
  'select-category',
  /** 난이도 선택 */
  'select-difficulty',
  /** 전체 보기 */
  'show-all'
])

const categoryCounts = computed(() => getScenarioCountByCategory())

const difficulties = [
  { id: 'beginner', label: '초급', color: 'green' },
  { id: 'intermediate', label: '중급', color: 'yellow' },
  { id: 'advanced', label: '고급', color: 'red' }
]

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

/**
 * 카테고리 아이콘 컴포넌트 반환
 */
const getCategoryIcon = (iconName) => {
  return iconComponents[iconName] || Squares2X2Icon
}

/**
 * 난이도 색상 클래스 반환
 */
const getDifficultyClass = (difficultyId, isSelected) => {
  const colorMap = {
    beginner: isSelected ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-green-50 hover:text-green-600',
    intermediate: isSelected ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-yellow-50 hover:text-yellow-600',
    advanced: isSelected ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-50 text-gray-600 border-gray-100 hover:bg-red-50 hover:text-red-600'
  }
  return colorMap[difficultyId] || ''
}
</script>

<template>
  <div
    class="w-1/4 min-w-[280px] max-w-[400px] flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden h-full">
    <!-- Header -->
    <div class="p-5 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900">비즈니스 카테고리</h2>
      <span class="text-xs text-gray-500 font-medium">
        {{ totalTemplates }}개 템플릿
      </span>
    </div>

    <!-- Show All Button -->
    <div class="px-3 pb-2">
      <button
        @click="emit('show-all')"
        class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
        :class="!selectedCategory
          ? 'bg-blue-50 text-blue-800 font-bold'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
          :class="!selectedCategory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:text-gray-600'">
          <Squares2X2Icon class="w-5 h-5" />
        </div>
        <span class="text-base font-medium">전체 템플릿</span>
        <span class="text-xs font-semibold px-1.5 py-0.5 rounded-full ml-auto"
          :class="!selectedCategory ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
          {{ totalTemplates }}
        </span>
      </button>
    </div>

    <div class="mx-3 border-t border-gray-100 mb-2"></div>

    <!-- Category List -->
    <div class="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
      <button
        v-for="category in BUSINESS_CATEGORIES"
        :key="category.id"
        @click="emit('select-category', category.id)"
        class="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 flex items-center gap-3 group"
        :class="selectedCategory === category.id
          ? 'bg-blue-50 text-blue-800'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'"
      >
        <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
          :class="selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'">
          <component :is="getCategoryIcon(category.icon)" class="w-5 h-5" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <span class="text-base font-medium"
              :class="selectedCategory === category.id ? 'text-gray-900 font-bold' : 'text-gray-700'">
              {{ category.name }}
            </span>
            <span class="text-xs font-semibold px-1.5 py-0.5 rounded-full transition-colors"
              :class="selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'">
              {{ categoryCounts[category.id] }}
            </span>
          </div>
          <p class="text-xs text-gray-400 truncate mt-0.5">
            {{ category.description }}
          </p>
        </div>
      </button>
    </div>

    <div class="mx-3 border-t border-gray-100 mb-2"></div>

    <!-- Difficulty Filter -->
    <div class="p-4 bg-gray-50/50">
      <h3 class="text-sm font-bold text-gray-700 mb-3">난이도</h3>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="diff in difficulties"
          :key="diff.id"
          @click="emit('select-difficulty', selectedDifficulty === diff.id ? null : diff.id)"
          class="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
          :class="getDifficultyClass(diff.id, selectedDifficulty === diff.id)"
        >
          {{ diff.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9ca3af;
}
</style>
