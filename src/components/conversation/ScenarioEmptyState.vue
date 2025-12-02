<template>
  <div class="h-full flex flex-col items-center justify-center text-gray-400">
    <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
      <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h3 class="text-xl font-bold text-gray-900 mb-2">No Scenarios Found</h3>
    <p class="text-gray-500 max-w-sm text-center mb-8">
      Select a schedule or project from the left sidebar, or create a new scenario manually.
    </p>
    <button @click="$emit('create')" class="text-blue-600 font-bold hover:underline">
      Create New Scenario
    </button>
  </div>
</template>

<script setup>
defineEmits(['create'])
</script>
