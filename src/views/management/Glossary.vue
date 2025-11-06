<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">전문용어사전</h1>

    <div class="mb-6">
      <div class="flex gap-4">
        <input
          type="text"
          placeholder="Search terms..."
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
        />
        <button class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
          + Add Term
        </button>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Glossary</h2>
      <div class="text-center py-12">
        <p class="text-gray-500">No terms in your glossary yet</p>
      </div>
    </div>
  </div>
</template>
