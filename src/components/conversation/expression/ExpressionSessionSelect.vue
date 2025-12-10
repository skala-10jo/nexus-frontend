<template>
  <div class="min-h-[520px] bg-gradient-to-br from-gray-50 to-white rounded-3xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 md:p-5 overflow-hidden relative flex flex-col">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4 md:mb-6 z-10 relative">
      <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-white shadow-sm border border-gray-100 text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
      </div>
      <div>
        <h2 class="text-xl font-bold text-gray-800 tracking-tight">학습 세션 선택</h2>
        <p class="text-sm text-gray-500 mt-0.5">갤러리를 회전하여 세션을 선택하세요</p>
      </div>
    </div>

    <!-- Desktop: Circular Gallery Container -->
    <div class="hidden md:flex flex-1 w-full relative" style="height: 360px; margin-left: -180px; width: calc(100% + 300px);">
      <CircularGallery
        :items="sessions"
        :bend="-100"
        :borderRadius="0.05"
        :scrollSpeed="2"
        :scrollEase="0.05"
        @select="handleSelect"
      >
        <template #default="{ item: session, index: idx, isActive }">
          <!-- Card Content -->
          <div class="w-[380px] h-[420px] bg-white rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-6 flex flex-col relative overflow-hidden transition-all duration-300 hover:border-blue-200"
               :class="{'ring-4 ring-blue-400 ring-offset-4 ring-offset-gray-50 shadow-[0_15px_50px_rgba(59,130,246,0.15)]': isActive, 'opacity-50 grayscale-[0.3] scale-90': !isActive}">

            <!-- Pneumatic Highlight -->
            <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

            <!-- Session Header -->
            <div class="flex justify-between items-start mb-6">
              <span class="flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-2xl shadow-inner transition-colors duration-300"
                :class="session.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'">
                <CheckIcon v-if="session.completed" class="w-7 h-7" />
                <span v-else>{{ idx + 1 }}</span>
              </span>
              <div class="text-right">
                <h3 class="font-bold text-gray-800 text-2xl">세션 {{ idx + 1 }}</h3>
                <p class="text-sm font-medium text-gray-400 mt-1">{{ session.expressions.length }}개 표현</p>
              </div>
            </div>

            <!-- Expressions Preview -->
            <div class="flex-1 space-y-3 mb-6 overflow-hidden">
              <div class="flex items-center gap-3 text-base text-gray-600" v-for="(expr, exprIdx) in session.expressions.slice(0, 4)" :key="exprIdx">
                <div class="w-2 h-2 rounded-full bg-blue-300 flex-shrink-0"></div>
                <p class="truncate font-medium">{{ expr.expression }}</p>
              </div>
              <p v-if="session.expressions.length > 4" class="text-sm text-gray-400 pl-5 pt-1">
                + {{ session.expressions.length - 4 }}개 더보기
              </p>
            </div>

            <!-- Action Button -->
            <button @click.stop="$emit('start-session', idx)"
                    class="w-full py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2 shadow-sm pointer-events-auto"
                    :class="session.completed
                      ? 'bg-green-50 text-green-600 border border-green-100 hover:bg-green-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'">
              {{ session.completed ? '다시 학습하기' : '학습 시작하기' }}
              <svg v-if="!session.completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
                <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
              </svg>
            </button>

          </div>
        </template>
      </CircularGallery>
    </div>

    <!-- Mobile: Vertical List -->
    <div class="md:hidden flex-1 w-full overflow-y-auto pb-4 space-y-6">
      <div v-for="(session, idx) in sessions" :key="idx"
           class="w-full bg-white rounded-3xl border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-6 flex flex-col relative overflow-hidden">
        
        <!-- Pneumatic Highlight -->
        <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80"></div>

        <!-- Session Header -->
        <div class="flex justify-between items-start mb-6">
          <span class="flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-xl shadow-inner transition-colors duration-300"
            :class="session.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'">
            <CheckIcon v-if="session.completed" class="w-6 h-6" />
            <span v-else>{{ idx + 1 }}</span>
          </span>
          <div class="text-right">
            <h3 class="font-bold text-gray-800 text-xl">세션 {{ idx + 1 }}</h3>
            <p class="text-xs font-medium text-gray-400 mt-1">{{ session.expressions.length }}개 표현</p>
          </div>
        </div>

        <!-- Expressions Preview -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3 text-sm text-gray-600" v-for="(expr, exprIdx) in session.expressions.slice(0, 3)" :key="exprIdx">
            <div class="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0"></div>
            <p class="truncate font-medium">{{ expr.expression }}</p>
          </div>
          <p v-if="session.expressions.length > 3" class="text-xs text-gray-400 pl-4 pt-1">
            + {{ session.expressions.length - 3 }}개 더보기
          </p>
        </div>

        <!-- Action Button -->
        <button @click="$emit('start-session', idx)"
                class="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm active:scale-95"
                :class="session.completed
                  ? 'bg-green-50 text-green-600 border border-green-100'
                  : 'bg-blue-600 text-white shadow-blue-200'">
          {{ session.completed ? '다시 학습하기' : '학습 시작하기' }}
          <svg v-if="!session.completed" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
            <path fill-rule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import CircularGallery from '@/components/common/effects/CircularGallery.vue'

const props = defineProps({
  sessions: {
    type: Array,
    required: true
  },
  totalExpressions: {
    type: Number,
    required: true
  },
  allSessionsCompleted: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['start-session'])

const handleSelect = (index) => {
  // Optional: Do something when item is centered
}
</script>
