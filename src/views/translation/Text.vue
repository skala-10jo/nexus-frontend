<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">텍스트 번역</h1>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Source Text</label>
          <textarea
            class="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none resize-none"
            placeholder="Enter text to translate..."
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Translation</label>
          <div class="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 overflow-y-auto">
            <p class="text-gray-400">Translation will appear here...</p>
          </div>
        </div>
      </div>

      <div class="mt-6 flex items-center justify-between">
        <div class="flex gap-4">
          <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary outline-none">
            <option>English</option>
            <option>Korean</option>
            <option>Japanese</option>
            <option>Chinese</option>
          </select>
          <span class="flex items-center text-gray-400">→</span>
          <select class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary outline-none">
            <option>Korean</option>
            <option>English</option>
            <option>Japanese</option>
            <option>Chinese</option>
          </select>
        </div>

        <button class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
          Translate
        </button>
      </div>
    </div>
  </div>
</template>
