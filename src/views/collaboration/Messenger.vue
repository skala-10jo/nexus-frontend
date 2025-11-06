<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">메신저</h1>

    <div class="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
      <!-- Contacts List -->
      <div class="col-span-4 bg-white rounded-lg shadow-md p-4 overflow-y-auto">
        <div class="mb-4">
          <input
            type="text"
            placeholder="Search contacts..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
          />
        </div>

        <h2 class="text-lg font-semibold text-gray-800 mb-3">Contacts</h2>
        <div class="text-center py-8">
          <p class="text-gray-500 text-sm">No contacts yet</p>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="col-span-8 bg-white rounded-lg shadow-md flex flex-col">
        <div class="flex-1 flex items-center justify-center p-6">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-gray-500">Select a contact to start chatting</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
