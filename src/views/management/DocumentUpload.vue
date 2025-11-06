<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">문서 업로드</h1>

    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <div class="mb-4">
          <svg class="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Upload Documents</h3>
        <p class="text-gray-500 mb-4">Drag and drop files here, or click to browse</p>
        <button class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
          Select Files
        </button>
      </div>

      <div class="mt-6">
        <h4 class="text-lg font-semibold text-gray-800 mb-3">Uploaded Documents</h4>
        <p class="text-gray-500 text-sm">No documents uploaded yet</p>
      </div>
    </div>
  </div>
</template>
