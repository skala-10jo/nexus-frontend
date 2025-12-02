<template>
  <div
    class="group bg-white border border-gray-100 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 flex flex-col h-full relative overflow-hidden"
  >
    <!-- Card Header -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex gap-2">
        <span class="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wide">
          {{ scenario.language }}
        </span>
        <span
          class="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide"
          :class="difficultyClass"
        >
          {{ scenario.difficulty }}
        </span>
      </div>

      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          @click.stop="$emit('edit', scenario)"
          class="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-blue-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          @click.stop="$emit('delete', scenario.id)"
          class="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Title & Description -->
    <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
      {{ scenario.title }}
    </h3>
    <p class="text-sm text-gray-500 mb-6 line-clamp-3 flex-1">
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
      @click="$emit('start', scenario.id)"
      class="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2"
    >
      <span>Start Practice</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scenario: {
    type: Object,
    required: true
  }
})

defineEmits(['edit', 'delete', 'start'])

const difficultyClass = computed(() => {
  const classes = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  }
  return classes[props.scenario.difficulty] || 'bg-gray-100 text-gray-700'
})
</script>

<style scoped>
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
}
.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
