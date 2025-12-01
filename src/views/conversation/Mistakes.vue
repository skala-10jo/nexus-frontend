<template>
  <div class="h-full overflow-y-auto p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">오답노트</h1>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-gray-800">Review Your Mistakes</h2>
        <button class="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition text-sm">
          Clear All
        </button>
      </div>

      <div class="text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-gray-500">Great! No mistakes recorded yet.</p>
        <p class="text-sm text-gray-400 mt-2">Mistakes from practice sessions will appear here</p>
      </div>
    </div>
  </div>
</template>
