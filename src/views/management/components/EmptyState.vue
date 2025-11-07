<template>
  <div class="flex flex-col items-center justify-center py-16 px-4">
    <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <FolderOpenIcon class="w-12 h-12 text-gray-400" />
    </div>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">아직 업로드된 문서가 없습니다</h3>
    <p class="text-sm text-gray-600 mb-6 text-center max-w-md">
      위의 업로드 영역에서 PDF, DOCX, TXT 파일을 업로드하여 문서 관리를 시작하세요
    </p>
    <button
      @click="$emit('action')"
      class="inline-flex items-center gap-2 px-6 py-3 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition-colors font-medium"
    >
      <CloudArrowUpIcon class="w-5 h-5" />
      <span>첫 문서 업로드하기</span>
    </button>
  </div>
</template>

<script setup>
import { FolderOpenIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline';

defineEmits(['action']);
</script>
