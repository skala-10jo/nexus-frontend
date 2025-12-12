import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { scheduleCategoryAPI } from '@/services/api'

/**
 * 일정 카테고리 스토어 (Setup 함수 패턴)
 *
 * CLAUDE.md 규칙 준수: defineStore(() => {...}) 형태 사용
 */
export const useScheduleCategoryStore = defineStore('scheduleCategory', () => {
  // ==================== State ====================
  const categories = ref([])
  const selectedCategoryIds = ref([]) // For filtering
  const loading = ref(false)
  const error = ref(null)

  // ==================== Getters ====================

  // Get categories sorted by display order
  const sortedCategories = computed(() => {
    return [...categories.value].sort((a, b) => a.displayOrder - b.displayOrder)
  })

  // Get default categories
  const defaultCategories = computed(() => {
    return categories.value.filter(cat => cat.isDefault)
  })

  // Get custom categories
  const customCategories = computed(() => {
    return categories.value.filter(cat => !cat.isDefault)
  })

  // Check if any filters are active
  const hasActiveFilters = computed(() => {
    return selectedCategoryIds.value.length > 0
  })

  // Get category by ID (함수 반환하는 getter)
  const getCategoryById = (id) => {
    return categories.value.find(cat => cat.id === id)
  }

  // ==================== Actions ====================

  // Fetch all categories for current user
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await scheduleCategoryAPI.getCategories()
      categories.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch categories'
      console.error('Error fetching categories:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create a new category
  async function createCategory(categoryData) {
    loading.value = true
    error.value = null
    try {
      const response = await scheduleCategoryAPI.createCategory(categoryData)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create category'
      console.error('Error creating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update an existing category
  async function updateCategory(categoryId, categoryData) {
    loading.value = true
    error.value = null
    try {
      const response = await scheduleCategoryAPI.updateCategory(categoryId, categoryData)
      const index = categories.value.findIndex(cat => cat.id === categoryId)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update category'
      console.error('Error updating category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete a category
  async function deleteCategory(categoryId) {
    loading.value = true
    error.value = null
    try {
      await scheduleCategoryAPI.deleteCategory(categoryId)
      categories.value = categories.value.filter(cat => cat.id !== categoryId)

      // Remove from selected filters if present
      selectedCategoryIds.value = selectedCategoryIds.value.filter(id => id !== categoryId)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete category'
      console.error('Error deleting category:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Reorder categories
  async function reorderCategories(orders) {
    loading.value = true
    error.value = null
    try {
      await scheduleCategoryAPI.reorderCategories(orders)
      // Update local state with new order
      orders.forEach(orderItem => {
        const category = categories.value.find(cat => cat.id === orderItem.categoryId)
        if (category) {
          category.displayOrder = orderItem.order
        }
      })
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reorder categories'
      console.error('Error reordering categories:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Toggle category in filter
  function toggleCategoryFilter(categoryId) {
    const index = selectedCategoryIds.value.indexOf(categoryId)
    if (index === -1) {
      selectedCategoryIds.value.push(categoryId)
    } else {
      selectedCategoryIds.value.splice(index, 1)
    }
  }

  // Clear all filters
  function clearFilters() {
    selectedCategoryIds.value = []
  }

  // Set specific filters
  function setFilters(categoryIds) {
    selectedCategoryIds.value = categoryIds
  }

  // Check if schedule matches current filters
  function matchesFilters(schedule) {
    // If no filters active, show all
    if (selectedCategoryIds.value.length === 0) {
      return true
    }

    // Check if schedule has any of the selected categories
    if (!schedule.categories || schedule.categories.length === 0) {
      return false
    }

    return schedule.categories.some(cat =>
      selectedCategoryIds.value.includes(cat.id)
    )
  }

  // ==================== Return ====================
  return {
    // State
    categories,
    selectedCategoryIds,
    loading,
    error,

    // Getters
    sortedCategories,
    defaultCategories,
    customCategories,
    hasActiveFilters,
    getCategoryById,

    // Actions
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    toggleCategoryFilter,
    clearFilters,
    setFilters,
    matchesFilters
  }
})
