<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    @click.self="close"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 class="text-xl font-bold text-gray-900">프로젝트 관리</h2>
        <button @click="close" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Category List -->
      <div class="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
        <div v-for="category in sortedCategories" :key="category.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-2 hover:bg-gray-100 transition">
          <!-- Category Info -->
          <div class="flex items-center flex-1">
            <div class="w-6 h-6 rounded-full mr-3" :style="{ backgroundColor: category.color }"></div>
            <div class="flex-1">
              <div class="font-medium">{{ category.name }}</div>
              <div v-if="category.description" class="text-sm text-gray-500">
                {{ category.description }}
              </div>
              <div v-if="category.isDefault" class="text-xs text-gray-400 mt-1">
                기본 프로젝트
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2">
            <button
              @click="editCategory(category)"
              class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
              title="수정"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              v-if="!category.isDefault"
              @click="confirmDelete(category)"
              class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
              title="삭제"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Add New Category Button -->
        <button
          @click="createNewCategory"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition flex items-center justify-center font-medium"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          새 프로젝트 추가
        </button>
      </div>

      <!-- Footer -->
      <div class="border-t px-6 py-4 flex justify-end bg-gray-50">
        <button
          @click="close"
          class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm"
        >
          닫기
        </button>
      </div>
    </div>

    <!-- Edit Modal -->
    <CategoryEditModal
      v-if="editingCategory"
      :category="editingCategory"
      :is-new="isNewCategory"
      @save="handleSave"
      @close="editingCategory = null"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useScheduleCategoryStore } from '@/stores/scheduleCategory'
import CategoryEditModal from './CategoryEditModal.vue'

const emit = defineEmits(['close'])

const categoryStore = useScheduleCategoryStore()
const editingCategory = ref(null)
const isNewCategory = ref(false)

const sortedCategories = computed(() => categoryStore.sortedCategories)

const createNewCategory = () => {
  isNewCategory.value = true
  editingCategory.value = {
    name: '',
    color: '#3B82F6',
    icon: '',
    description: ''
  }
}

const editCategory = (category) => {
  isNewCategory.value = false
  editingCategory.value = { ...category }
}

const handleSave = async (categoryData) => {
  try {
    if (isNewCategory.value) {
      await categoryStore.createCategory(categoryData)
    } else {
      await categoryStore.updateCategory(editingCategory.value.id, categoryData)
    }
    editingCategory.value = null
  } catch (error) {
    alert('프로젝트 저장에 실패했습니다: ' + error.message)
  }
}

const confirmDelete = async (category) => {
  if (
    confirm(
      `"${category.name}" 프로젝트를 삭제하시겠습니까?\n이 프로젝트가 지정된 일정에서 해당 프로젝트가 제거됩니다.`
    )
  ) {
    try {
      await categoryStore.deleteCategory(category.id)
    } catch (error) {
      alert('프로젝트 삭제에 실패했습니다: ' + error.message)
    }
  }
}

const close = () => {
  emit('close')
}
</script>
