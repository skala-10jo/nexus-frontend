<template>
  <div class="absolute inset-0 bg-gray-50 p-4 overflow-hidden">
    <!-- Header -->
    <div class="relative text-center mb-3">
      <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-200">
        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span class="text-blue-700 font-bold text-xs">AI 시나리오 생성 완료</span>
      </div>
    </div>

    <!-- Scenario Cards - 6개 (2행 3열) -->
    <div class="relative grid grid-cols-3 gap-2.5">
      <div
        v-for="(scenario, index) in scenarios"
        :key="index"
        class="bg-white rounded-xl p-3 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
        :class="selectedScenario === index
          ? 'border-blue-400 ring-2 ring-blue-200'
          : 'border-gray-100 hover:border-gray-200'"
        :style="getCardStyle(index)"
        @click="$emit('selectScenario', index)"
      >
        <!-- Flag & Difficulty -->
        <div class="flex items-center gap-1.5 mb-1.5">
          <span class="text-base">{{ scenario.flag }}</span>
          <span
            class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
            :class="scenario.difficultyClass"
          >
            {{ scenario.difficultyLabel }}
          </span>
        </div>

        <!-- Title & Description -->
        <h4 class="text-gray-900 font-bold text-[11px] mb-0.5 leading-tight">{{ scenario.title }}</h4>
        <p class="text-gray-500 text-[9px] mb-2 leading-tight">{{ scenario.description }}</p>

        <!-- Roles Box -->
        <div class="bg-gray-50 rounded-lg p-1.5 mb-2">
          <div class="flex items-center justify-between text-[8px]">
            <div class="text-center flex-1">
              <span class="text-gray-400 block">You</span>
              <span class="text-gray-700 font-semibold">{{ scenario.userRole }}</span>
            </div>
            <div class="text-gray-300 px-1">vs</div>
            <div class="text-center flex-1">
              <span class="text-gray-400 block">AI</span>
              <span class="text-gray-700 font-semibold">{{ scenario.aiRole }}</span>
            </div>
          </div>
        </div>

        <!-- Start Button -->
        <button
          class="w-full py-1.5 bg-gray-900 text-white font-bold text-[9px] rounded-lg hover:bg-gray-800 transition-colors"
        >
          연습 시작
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  scenarios: { type: Array, required: true },
  cardVisibility: { type: Array, required: true },
  selectedScenario: { type: Number, default: null }
})

defineEmits(['selectScenario'])

const getCardStyle = (index) => ({
  opacity: props.cardVisibility[index] ? 1 : 0,
  transform: props.cardVisibility[index] ? 'translateY(0)' : 'translateY(30px)'
})
</script>
