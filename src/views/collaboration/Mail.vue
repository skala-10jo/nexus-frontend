<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">메일</h1>

    <div class="grid grid-cols-12 gap-6">
      <!-- Mail Folders -->
      <div class="col-span-3 bg-white rounded-lg shadow-md p-4">
        <button class="w-full px-4 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition mb-4">
          Compose
        </button>

        <nav class="space-y-1">
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Inbox</a>
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Sent</a>
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Drafts</a>
          <a href="#" class="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Trash</a>
        </nav>
      </div>

      <!-- Mail List -->
      <div class="col-span-9 bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Inbox</h2>
        <div class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500">Your inbox is empty</p>
        </div>
      </div>
    </div>
  </div>
</template>
