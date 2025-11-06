<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">영상 번역</h1>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Upload Video</h3>
        <p class="text-gray-500 mb-4">Upload a video file to translate subtitles</p>
        <button class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
          Select Video
        </button>
      </div>

      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Supported Formats</h3>
        <div class="flex gap-3 flex-wrap">
          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">MP4</span>
          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">AVI</span>
          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">MOV</span>
          <span class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">MKV</span>
        </div>
      </div>
    </div>
  </div>
</template>
