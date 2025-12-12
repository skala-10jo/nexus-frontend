<template>
  <div class="mb-6 relative z-30 md:hidden">
    <button
      @click="$emit('toggle-filter')"
      class="flex items-center gap-2 text-lg font-bold text-gray-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100"
    >
      <span>{{ mobileFilterLabel }}</span>
      <ChevronDownIcon
        class="w-5 h-5 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': mobileShowFilter }"
      />
    </button>

    <!-- Mobile Filter Dropdown -->
    <div
      v-if="mobileShowFilter"
      class="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-slideDown"
    >
      <!-- Tab Switch -->
      <div class="p-3 border-b border-gray-100">
        <div class="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            @click="$emit('set-tab', 'my')"
            class="flex-1 py-2 rounded-md text-sm font-bold transition-all"
            :class="activeTab === 'my' ? 'bg-white shadow-sm' : 'text-gray-500'"
          >
            내 시나리오
          </button>
          <button
            @click="$emit('set-tab', 'business')"
            class="flex-1 py-2 rounded-md text-sm font-bold transition-all"
            :class="activeTab === 'business' ? 'bg-white shadow-sm' : 'text-gray-500'"
          >
            템플릿
          </button>
        </div>
      </div>

      <!-- Filter Options -->
      <div class="p-2 max-h-60 overflow-y-auto">
        <!-- My Scenarios Filter -->
        <template v-if="activeTab === 'my'">
          <button
            @click="$emit('select-all-projects')"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="selectedProjects.length === 0 ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            전체 프로젝트
          </button>
          <button
            v-for="project in projects"
            :key="project.id"
            @click="$emit('toggle-project', project)"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="selectedProjects.find(p => p.id === project.id)
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            {{ project.name }}
          </button>
        </template>

        <!-- Business Templates Filter -->
        <template v-else>
          <button
            @click="$emit('show-all-templates')"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="!selectedCategory ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'"
          >
            전체 템플릿
          </button>
          <button
            v-for="category in businessCategories"
            :key="category.id"
            @click="$emit('select-category', category.id)"
            class="w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            :class="selectedCategory === category.id
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50'"
          >
            <component :is="getCategoryIcon(category.icon)" class="w-4 h-4" />
            <span>{{ category.name }}</span>
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ChevronDownIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon,
  Squares2X2Icon
} from '@heroicons/vue/24/outline'

defineProps({
  activeTab: {
    type: String,
    required: true
  },
  mobileShowFilter: {
    type: Boolean,
    default: false
  },
  mobileFilterLabel: {
    type: String,
    default: ''
  },
  projects: {
    type: Array,
    default: () => []
  },
  selectedProjects: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: null
  },
  businessCategories: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'toggle-filter',
  'set-tab',
  'select-all-projects',
  'toggle-project',
  'show-all-templates',
  'select-category'
])

const iconComponents = {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PresentationChartBarIcon,
  ScaleIcon,
  GlobeAltIcon
}

const getCategoryIcon = (iconName) => {
  return iconComponents[iconName] || Squares2X2Icon
}
</script>

<style scoped>
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slideDown {
  animation: slideDown 0.2s ease-out forwards;
}
</style>
