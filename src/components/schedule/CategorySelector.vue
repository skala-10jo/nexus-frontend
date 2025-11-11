<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      카테고리 (다중 선택 가능)
    </label>

    <!-- Selected Categories Display -->
    <div v-if="localSelectedIds.length > 0" class="mb-3 flex flex-wrap gap-2">
      <span
        v-for="categoryId in localSelectedIds"
        :key="categoryId"
        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
        :style="{
          backgroundColor: getCategoryColor(categoryId) + '20',
          color: getCategoryColor(categoryId),
          border: `1px solid ${getCategoryColor(categoryId)}`
        }"
      >
        {{ getCategoryName(categoryId) }}
        <button
          type="button"
          @click="removeCategory(categoryId)"
          class="ml-2 hover:text-red-600 focus:outline-none"
        >
          ×
        </button>
      </span>
    </div>

    <!-- Category Selection Grid -->
    <div class="grid grid-cols-2 gap-2 mb-3">
      <button
        v-for="category in sortedCategories"
        :key="category.id"
        type="button"
        @click="toggleCategory(category.id)"
        class="flex items-center px-3 py-2 rounded-lg border-2 transition transform hover:scale-105"
        :class="
          isSelected(category.id)
            ? 'border-gray-800 bg-gray-50 shadow-md'
            : 'border-gray-300 hover:border-gray-400'
        "
      >
        <!-- Category Color Indicator -->
        <div
          class="w-4 h-4 rounded-full mr-2 flex-shrink-0"
          :style="{ backgroundColor: category.color }"
        ></div>

        <!-- Category Name -->
        <span class="text-sm font-medium truncate flex-1">{{ category.name }}</span>

        <!-- Checkmark for selected -->
        <svg
          v-if="isSelected(category.id)"
          class="w-5 h-5 text-gray-800 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Category Management Button -->
    <button
      type="button"
      @click="openCategoryManager"
      class="text-sm text-orange-primary hover:text-orange-dark flex items-center transition"
    >
      <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      카테고리 관리
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue', 'openManager'])

const categoryStore = useScheduleCategoryStore()
const localSelectedIds = ref([...props.modelValue])

const sortedCategories = computed(() => categoryStore.sortedCategories)

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    localSelectedIds.value = [...newValue]
  }
)

// Watch for local changes and emit
watch(
  localSelectedIds,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
  { deep: true }
)

const toggleCategory = (categoryId) => {
  const index = localSelectedIds.value.indexOf(categoryId)
  if (index === -1) {
    localSelectedIds.value.push(categoryId)
  } else {
    localSelectedIds.value.splice(index, 1)
  }
}

const removeCategory = (categoryId) => {
  const index = localSelectedIds.value.indexOf(categoryId)
  if (index !== -1) {
    localSelectedIds.value.splice(index, 1)
  }
}

const isSelected = (categoryId) => {
  return localSelectedIds.value.includes(categoryId)
}

const getCategoryName = (categoryId) => {
  const category = categoryStore.getCategoryById(categoryId)
  return category?.name || 'Unknown'
}

const getCategoryColor = (categoryId) => {
  const category = categoryStore.getCategoryById(categoryId)
  return category?.color || '#6B7280'
}

const openCategoryManager = () => {
  emit('openManager')
}

// Load categories on mount
onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories()
  }
})
</script>
