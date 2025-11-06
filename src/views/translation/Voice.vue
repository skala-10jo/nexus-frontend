<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">음성 번역</h1>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-6 bg-orange-primary rounded-full flex items-center justify-center text-white">
          <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>

        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Voice Translation</h2>
        <p class="text-gray-600 mb-6">Click the button below to start recording</p>

        <button class="px-8 py-3 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
          Start Recording
        </button>
      </div>

      <div class="mt-8 border-t pt-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Translations</h3>
        <p class="text-gray-500 text-sm">No voice translations yet</p>
      </div>
    </div>
  </div>
</template>
