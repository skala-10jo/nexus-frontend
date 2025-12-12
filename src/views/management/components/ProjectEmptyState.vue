<template>
  <div class="flex flex-col items-center justify-center py-24 text-center">
    <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-1">
      {{ hasFilters ? 'No projects found' : 'No projects yet' }}
    </h3>
    <p class="text-sm text-gray-500 mb-6">
      {{ hasFilters ? 'Try adjusting your search or filters.' : 'Create your first project to start organizing your documents.' }}
    </p>
    <button
      v-if="!hasFilters"
      @click="$emit('create')"
      class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
    >
      Create Project
    </button>
  </div>
</template>

<script setup>
defineProps({
  hasFilters: {
    type: Boolean,
    default: false
  }
})

defineEmits(['create'])
</script>
