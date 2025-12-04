<template>
  <div class="flex flex-col items-center justify-center py-20 px-8 text-center">
    <div class="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
      <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </div>

    <h3 class="text-2xl font-bold text-gray-900 mb-3">아직 분석된 회의가 없습니다</h3>
    <p class="text-gray-500 max-w-md mb-8 leading-relaxed">
      회의 녹음 파일을 업로드하면 AI가 자동으로 화자를 분리하고<br>
      각 발화에 대한 맞춤 피드백을 제공합니다.
    </p>

    <button
      @click="$emit('upload')"
      class="group flex items-center gap-3 px-8 py-4 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-200"
    >
      <svg class="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      오디오 파일 업로드
    </button>

    <!-- Features -->
    <div class="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl">
      <div class="text-center p-4">
        <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h4 class="font-bold text-gray-900 mb-1">화자 분리</h4>
        <p class="text-sm text-gray-500">회의 참여자를 자동으로 구분</p>
      </div>

      <div class="text-center p-4">
        <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 class="font-bold text-gray-900 mb-1">문법 교정</h4>
        <p class="text-sm text-gray-500">영어 표현 개선점 피드백</p>
      </div>

      <div class="text-center p-4">
        <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
          <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h4 class="font-bold text-gray-900 mb-1">학습 모드</h4>
        <p class="text-sm text-gray-500">교정 문장으로 연습</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['upload'])
</script>
