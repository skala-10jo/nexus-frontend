<template>
  <nav
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          :class="scrolled ? 'bg-black text-white' : 'bg-white/20 text-white backdrop-blur-sm'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span
          class="text-xl font-bold transition-colors"
          :class="scrolled ? 'text-gray-900' : 'text-white'"
        >
          NEXUS
        </span>
      </div>

      <!-- Auth Buttons -->
      <div class="flex items-center gap-3">
        <router-link
          to="/login"
          class="px-4 py-2 text-sm font-medium transition-colors"
          :class="scrolled ? 'text-gray-700 hover:text-gray-900' : 'text-white/80 hover:text-white'"
        >
          로그인
        </router-link>
        <router-link
          to="/login"
          class="px-4 py-2 text-sm font-medium rounded-lg transition-all"
          :class="scrolled ? 'text-white bg-black hover:bg-gray-800' : 'text-black bg-white hover:bg-gray-100'"
        >
          시작하기
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const scrolled = ref(false)

const handleScroll = () => {
  scrolled.value = window.scrollY > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
