<template>
  <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden">
    <!-- 배경 효과: 별빛/파티클 느낌 -->
    <div class="absolute inset-0">
      <div class="absolute top-10 left-20 w-1 h-1 bg-blue-400/50 rounded-full animate-pulse"></div>
      <div class="absolute top-32 right-40 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
      <div class="absolute bottom-40 left-40 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse" style="animation-delay: 1s"></div>
      <div class="absolute top-48 left-1/3 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style="animation-delay: 0.3s"></div>
      <div class="absolute bottom-32 right-1/4 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse" style="animation-delay: 0.7s"></div>
    </div>
    <!-- 방사형 그라데이션 -->
    <div class="absolute inset-0 bg-gradient-radial from-indigo-900/50 via-transparent to-transparent" style="background: radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);"></div>

    <!-- 하단: 폴더 스타일 문서 더미 -->
    <div
      v-if="showDocStack"
      class="absolute -bottom-14 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500"
      :style="{ opacity: docStackOpacity }"
    >
      <div class="relative">
        <div class="relative w-40 h-28">
          <!-- 맨 뒤 폴더 -->
          <div class="absolute bottom-0 left-0 w-32 h-24 transform -rotate-6 -translate-x-2">
            <div class="w-full h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-lg shadow-lg border border-amber-600/30">
              <div class="absolute top-0 left-2 w-10 h-3 bg-amber-300 rounded-t-md -translate-y-2"></div>
            </div>
          </div>
          <!-- 중간 폴더 -->
          <div class="absolute bottom-1 left-4 w-32 h-24 transform rotate-2">
            <div class="w-full h-full bg-gradient-to-b from-amber-300 to-amber-400 rounded-lg shadow-lg border border-amber-500/30">
              <div class="absolute top-0 left-2 w-10 h-3 bg-amber-200 rounded-t-md -translate-y-2"></div>
              <div class="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-4 w-20 h-6 bg-white rounded shadow-sm border border-gray-200">
                <div class="p-1">
                  <div class="h-1 bg-gray-300 rounded w-full mb-0.5"></div>
                  <div class="h-1 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
          <!-- 맨 앞 폴더 -->
          <div class="absolute bottom-2 left-8 w-32 h-24 transform rotate-6">
            <div class="w-full h-full bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg shadow-xl border border-amber-400/30">
              <div class="absolute top-0 left-2 w-10 h-3 bg-amber-100 rounded-t-md -translate-y-2"></div>
              <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-24 h-8 bg-white rounded shadow-md border border-gray-200">
                <div class="p-1.5">
                  <div class="h-1 bg-blue-400 rounded w-full mb-1"></div>
                  <div class="h-1 bg-gray-300 rounded w-full mb-0.5"></div>
                  <div class="h-1 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="absolute -inset-6 bg-gradient-to-t from-amber-500/20 via-amber-400/10 to-transparent blur-xl"></div>
        <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium whitespace-nowrap">
          프로젝트 문서
        </div>
      </div>
    </div>

    <!-- 중앙: AI 분석 구체 -->
    <div
      class="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      :style="{ opacity: sphereOpacity, transform: `translate(-50%, -50%) scale(${sphereScale})` }"
    >
      <div class="relative">
        <div class="absolute -inset-16 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl animate-pulse"></div>
        <div class="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-cyan-400/30 blur-xl"></div>
        <div class="absolute -inset-6 rounded-full border border-blue-400/30 animate-spin-slow"></div>
        <div class="absolute -inset-10 rounded-full border border-dashed border-purple-400/20 animate-spin-reverse"></div>

        <div class="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center overflow-hidden">
          <div class="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
          <svg class="w-12 h-12 text-white/90 relative z-10" fill="currentColor" viewBox="0 0 24 24">
            <rect x="5" y="7" width="14" height="10" rx="2" fill="currentColor"/>
            <path d="M12 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="9" cy="11" r="1.5" fill="#1e1b4b"/>
            <circle cx="15" cy="11" r="1.5" fill="#1e1b4b"/>
            <circle cx="9" cy="11" r="0.5" fill="#22d3ee"/>
            <circle cx="15" cy="11" r="0.5" fill="#22d3ee"/>
            <rect x="8" y="14" width="8" height="1.5" rx="0.5" fill="#1e1b4b"/>
          </svg>
          <div class="absolute inset-0 overflow-hidden rounded-full">
            <div class="absolute w-full h-full animate-pulse bg-gradient-to-t from-cyan-400/20 via-transparent to-transparent"></div>
          </div>
        </div>
        <div class="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur-sm rounded-full border border-indigo-500/30 shadow-lg">
            <svg class="w-4 h-4 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-sm font-bold text-white">AI 분석 중...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 원형 배치된 문서들 -->
    <div
      v-for="(doc, index) in flyingDocuments"
      :key="'doc-' + index"
      class="absolute pointer-events-none"
      :style="doc.style"
    >
      <div
        class="bg-white rounded-xl shadow-lg p-3.5 w-[140px] border border-gray-200 doc-card-crisp"
        :class="`animate-float-${index % 3}`"
      >
        <div class="flex items-center justify-center mb-2.5">
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
            :style="{ backgroundColor: doc.iconBg }"
          >
            <span class="text-white text-sm font-extrabold tracking-tight">{{ doc.ext }}</span>
          </div>
        </div>
        <div class="text-center px-1">
          <span class="text-xs font-bold text-gray-900 leading-tight block line-clamp-2">{{ doc.name }}</span>
        </div>
        <div class="mt-2.5 space-y-1">
          <div class="h-1 bg-gray-200 rounded w-full"></div>
          <div class="h-1 bg-gray-100 rounded w-2/3 mx-auto"></div>
        </div>
      </div>
    </div>

    <!-- 추출된 키워드 -->
    <div
      v-for="(keyword, index) in extractedKeywords"
      :key="'keyword-' + index"
      class="absolute text-sm font-bold whitespace-nowrap pointer-events-none px-4 py-2 rounded-lg shadow-md"
      :style="keyword.style"
    >
      {{ keyword.text }}
    </div>

    <!-- 데이터 파티클 -->
    <div
      v-for="(particle, index) in dataParticles"
      :key="'particle-' + index"
      class="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
      :style="particle.style"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  showDocStack: { type: Boolean, default: true },
  docStackOpacity: { type: Number, default: 1 },
  sphereOpacity: { type: Number, default: 0 },
  sphereScale: { type: Number, default: 0.3 },
  flyingDocuments: { type: Array, default: () => [] },
  extractedKeywords: { type: Array, default: () => [] },
  dataParticles: { type: Array, default: () => [] }
})
</script>

<style scoped>
@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-spin-reverse {
  animation: spin-reverse 12s linear infinite;
}

@keyframes float-0 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(-3px) rotate(1deg); }
  50% { transform: translateY(-12px) rotate(-1deg); }
}

.animate-float-0 {
  animation: float-0 3s ease-in-out infinite;
}

.animate-float-1 {
  animation: float-1 3.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.animate-float-2 {
  animation: float-2 4s ease-in-out infinite;
  animation-delay: 1s;
}

.doc-card-crisp {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
