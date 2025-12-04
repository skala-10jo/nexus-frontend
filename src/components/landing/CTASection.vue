<template>
  <section class="py-24 bg-gray-900 relative overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0); background-size: 40px 40px;"></div>
    </div>

    <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
      <h2 class="text-4xl lg:text-5xl font-bold text-white mb-6">
        지금 바로 시작하세요
      </h2>
      <p class="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
        AI 기반 번역과 회화 학습으로 글로벌 커뮤니케이션의 새로운 경험을 시작해보세요
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/login"
          class="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
        >
          무료로 시작하기
        </router-link>
        <button
          @click="scrollToTop"
          class="px-8 py-4 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
        >
          기능 다시 보기
        </button>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="py-8 bg-black text-center">
    <p class="text-gray-500 text-sm">
      © 2025 NEXUS. All rights reserved.
    </p>
  </footer>
</template>

<script setup>
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>
