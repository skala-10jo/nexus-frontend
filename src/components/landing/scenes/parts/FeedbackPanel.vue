<template>
  <div
    class="w-[200px] bg-gray-50 border-l border-gray-200 flex flex-col overflow-hidden transition-all duration-700 ease-out"
    :style="{
      marginRight: showFeedback ? '0' : '-200px',
      opacity: showFeedback ? 1 : 0
    }"
  >
    <div class="p-3 border-b border-gray-100 bg-white/50">
      <h3 class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
        <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        실시간 피드백
      </h3>
    </div>

    <div class="flex-1 p-3 space-y-3 overflow-y-auto">
      <!-- Score Card -->
      <Transition name="scale">
        <div v-if="showScore" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600 mb-0.5">{{ displayScore }}</div>
            <div class="text-[9px] text-gray-500 font-medium">종합 점수</div>
          </div>
        </div>
      </Transition>

      <!-- Score Breakdown -->
      <Transition name="slide-up">
        <div v-if="showBreakdown" class="bg-white rounded-xl p-3 shadow-sm border border-gray-100 space-y-2">
          <div v-for="(item, idx) in scoreItems" :key="idx" class="flex justify-between items-center">
            <span class="text-[10px] text-gray-600">{{ item.label }}</span>
            <div class="flex items-center gap-1.5">
              <div class="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-1000"
                  :class="item.colorClass"
                  :style="{ width: item.width }"
                ></div>
              </div>
              <span class="text-[10px] text-gray-700 font-bold w-5">{{ item.score }}</span>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Feedback Timeline -->
      <TransitionGroup name="timeline" tag="div" class="space-y-2">
        <div
          v-for="(feedback, idx) in visibleFeedbacks"
          :key="'feedback-' + idx"
          class="rounded-xl p-2.5 shadow-sm border"
          :class="feedback.type === 'good' ? 'bg-green-50 border-green-100' : 'bg-blue-50 border-blue-100'"
        >
          <div class="flex items-start gap-2">
            <span class="text-sm">{{ feedback.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-[9px] font-bold mb-0.5" :class="feedback.type === 'good' ? 'text-green-700' : 'text-blue-700'">
                {{ feedback.title }}
              </p>
              <p class="text-[9px] leading-relaxed" :class="feedback.type === 'good' ? 'text-green-600' : 'text-blue-600'">
                {{ feedback.content }}
              </p>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
defineProps({
  showFeedback: Boolean,
  showScore: Boolean,
  displayScore: Number,
  showBreakdown: Boolean,
  scoreItems: Array,
  visibleFeedbacks: Array
})
</script>

<style scoped>
/* Scale transition */
.scale-enter-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-leave-active {
  transition: all 0.2s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* Slide up transition */
.slide-up-enter-active {
  transition: all 0.4s ease-out;
}
.slide-up-leave-active {
  transition: all 0.2s ease;
}
.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.slide-up-leave-to {
  opacity: 0;
}

/* Timeline transition */
.timeline-enter-active {
  transition: all 0.5s ease-out;
}
.timeline-leave-active {
  transition: all 0.2s ease;
}
.timeline-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.timeline-leave-to {
  opacity: 0;
}
</style>
