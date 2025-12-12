<template>
  <div class="flex flex-col items-center justify-center h-64 text-center">
    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
    <h3 class="text-lg font-bold text-gray-900 mb-2">템플릿이 없습니다</h3>
    <p class="text-sm text-gray-500">선택한 필터에 맞는 템플릿이 없습니다.</p>
    <button
      @click="$emit('show-all')"
      class="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
    >
      전체 템플릿 보기
    </button>
  </div>
</template>

<script setup>
defineEmits(['show-all'])
</script>
