import { defineStore } from 'pinia'
import { scheduleCategoryAPI } from '@/services/api'

export const useScheduleCategoryStore = defineStore('scheduleCategory', {
  state: () => ({
    categories: [],
    selectedCategoryIds: [], // For filtering
    loading: false,
    error: null
  }),

  getters: {
    // Get categories sorted by display order
    sortedCategories: (state) => {
      return [...state.categories].sort((a, b) => a.displayOrder - b.displayOrder)
    },

    // Get default categories
    defaultCategories: (state) => {
      return state.categories.filter(cat => cat.isDefault)
    },

    // Get custom categories
    customCategories: (state) => {
      return state.categories.filter(cat => !cat.isDefault)
    },

    // Check if any filters are active
    hasActiveFilters: (state) => {
      return state.selectedCategoryIds.length > 0
    },

    // Get category by ID
    getCategoryById: (state) => (id) => {
      return state.categories.find(cat => cat.id === id)
    }
  },

  actions: {
    // Fetch all categories for current user
    async fetchCategories() {
      this.loading = true
      this.error = null
      try {
        const response = await scheduleCategoryAPI.getCategories()
        this.categories = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch categories'
        console.error('Error fetching categories:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Create a new category
    async createCategory(categoryData) {
      this.loading = true
      this.error = null
      try {
        const response = await scheduleCategoryAPI.createCategory(categoryData)
        this.categories.push(response.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to create category'
        console.error('Error creating category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update an existing category
    async updateCategory(categoryId, categoryData) {
      this.loading = true
      this.error = null
      try {
        const response = await scheduleCategoryAPI.updateCategory(categoryId, categoryData)
        const index = this.categories.findIndex(cat => cat.id === categoryId)
        if (index !== -1) {
          this.categories[index] = response.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update category'
        console.error('Error updating category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Delete a category
    async deleteCategory(categoryId) {
      this.loading = true
      this.error = null
      try {
        await scheduleCategoryAPI.deleteCategory(categoryId)
        this.categories = this.categories.filter(cat => cat.id !== categoryId)

        // Remove from selected filters if present
        this.selectedCategoryIds = this.selectedCategoryIds.filter(id => id !== categoryId)
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete category'
        console.error('Error deleting category:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Reorder categories
    async reorderCategories(orders) {
      this.loading = true
      this.error = null
      try {
        await scheduleCategoryAPI.reorderCategories(orders)
        // Update local state with new order
        orders.forEach(orderItem => {
          const category = this.categories.find(cat => cat.id === orderItem.categoryId)
          if (category) {
            category.displayOrder = orderItem.order
          }
        })
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to reorder categories'
        console.error('Error reordering categories:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Toggle category in filter
    toggleCategoryFilter(categoryId) {
      const index = this.selectedCategoryIds.indexOf(categoryId)
      if (index === -1) {
        this.selectedCategoryIds.push(categoryId)
      } else {
        this.selectedCategoryIds.splice(index, 1)
      }
    },

    // Clear all filters
    clearFilters() {
      this.selectedCategoryIds = []
    },

    // Set specific filters
    setFilters(categoryIds) {
      this.selectedCategoryIds = categoryIds
    },

    // Check if schedule matches current filters
    matchesFilters(schedule) {
      // If no filters active, show all
      if (this.selectedCategoryIds.length === 0) {
        return true
      }

      // Check if schedule has any of the selected categories
      if (!schedule.categories || schedule.categories.length === 0) {
        return false
      }

      return schedule.categories.some(cat =>
        this.selectedCategoryIds.includes(cat.id)
      )
    }
  }
})
