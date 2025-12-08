<template>
  <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between mb-3 shrink-0">
      <h3 class="font-bold text-gray-900 text-sm">퀴즈 통계</h3>
      <select v-model="selectedDays" @change="onDaysChange"
        class="text-xs font-bold text-gray-500 bg-gray-50 rounded-lg px-2 py-1 border-none focus:ring-0 cursor-pointer">
        <option :value="7">Weekly</option>
        <option :value="14">2 Weeks</option>
        <option :value="30">Monthly</option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex-1 flex items-center justify-center">
      <div class="animate-pulse text-gray-400 text-sm">Loading...</div>
    </div>

    <!-- Empty State -->
    <div v-else-if="chartData.length === 0" class="flex-1 flex flex-col items-center justify-center text-gray-400">
      <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p class="text-xs">No quiz data yet</p>
      <p class="text-xs mt-1">Start practicing to see your progress!</p>
    </div>

    <!-- Chart -->
    <div v-else class="relative flex-1 w-full min-h-0">
      <!-- Y-Axis Labels (Left: Correct Count) -->
      <div class="absolute left-0 top-0 bottom-10 w-6 flex flex-col justify-between text-xs text-gray-400">
        <span>{{ maxCorrectCount }}</span>
        <span>{{ Math.round(maxCorrectCount / 2) }}</span>
        <span>0</span>
      </div>

      <!-- Y-Axis Labels (Right: Accuracy Rate) -->
      <div class="absolute right-0 top-0 bottom-10 w-8 flex flex-col justify-between text-xs text-blue-400 text-right">
        <span>100%</span>
        <span>50%</span>
        <span>0%</span>
      </div>

      <!-- Chart Area -->
      <div class="absolute left-8 right-10 top-0 bottom-0">
        <!-- Grid Lines -->
        <div class="absolute inset-x-0 top-0 bottom-10 flex flex-col justify-between">
          <div class="border-b border-gray-100 w-full h-0"></div>
          <div class="border-b border-gray-100 w-full h-0"></div>
          <div class="border-b border-gray-200 w-full h-0"></div>
        </div>

        <!-- SVG Chart -->
        <svg class="absolute inset-x-0 top-0 bottom-10 w-full overflow-visible" preserveAspectRatio="none"
          :viewBox="`0 0 ${chartWidth} ${chartHeight}`">

          <!-- Bar Chart (Correct Count) -->
          <g class="bars">
            <rect v-for="(item, index) in chartData" :key="`bar-${index}`" :x="getBarX(index)"
              :y="getBarY(item.correctCount)" :width="barWidth" :height="getBarHeight(item.correctCount)"
              fill="#10b981" rx="4" class="transition-all duration-300 cursor-pointer hover:opacity-80"
              @mouseenter="onHover(index, $event)" @mouseleave="onLeave" />

          </g>



          <!-- Line Chart (Accuracy Rate) -->
          <path v-if="linePath" :d="linePath" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" class="transition-all duration-300" />

          <!-- Line Points -->
          <g class="points">
            <circle v-for="(item, index) in chartData" :key="`point-${index}`" :cx="getPointX(index)"
              :cy="getLineY(item.accuracyRate)" :r="hoveredIndex === index ? 6 : 4" fill="#3b82f6" stroke="white"
              stroke-width="2" class="transition-all duration-300 cursor-pointer" @mouseenter="onHover(index, $event)"
              @mouseleave="onLeave" />

          </g>
        </svg>

        <!-- Tooltip -->
        <div v-if="hoveredIndex !== null"
          class="absolute z-50 bg-gray-900 text-white text-xs rounded-lg py-1 px-2 shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full transition-opacity duration-200"
          :style="{ left: tooltipPos.x + 'px', top: tooltipPos.y + 'px' }">
          <div class="font-bold mb-0.5">{{ chartData[hoveredIndex].label }}</div>
          <div class="flex items-center gap-2">
            <span class="text-emerald-400">Correct: {{ chartData[hoveredIndex].correctCount }}</span>
            <span class="text-blue-400">Acc: {{ chartData[hoveredIndex].accuracyRate }}%</span>
          </div>
          <div
            class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-2 h-2 bg-gray-900 rotate-45">
          </div>
        </div>

        <!-- X-Axis Labels -->
        <div class="absolute bottom-0 left-0 right-0 h-6 flex justify-between items-end px-1">
          <span v-for="(item, index) in chartData" :key="`label-${index}`"
            class="text-xs text-gray-400 text-center flex-1">
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div v-if="chartData.length > 0" class="flex items-center justify-center gap-6 mt-2 shrink-0">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-emerald-500"></div>
        <span class="text-xs text-gray-500">Correct ({{ totalStats.correctCount }})</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
        <span class="text-xs text-gray-500">Accuracy ({{ totalStats.accuracyRate }}%)</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useExpressionDailyStats } from '@/composables/dashboard/useExpressionDailyStats'

// Composable
const {
  chartData,
  maxCorrectCount,
  totalStats,
  isLoading,
  fetchDailyStats
} = useExpressionDailyStats()

// Local State
const selectedDays = ref(7)
const hoveredIndex = ref(null)
const tooltipPos = ref({ x: 0, y: 0 })

// Chart dimensions (SVG viewBox)
const chartWidth = 300
const chartHeight = 150
const barWidth = computed(() => {
  const count = chartData.value.length || 1
  const totalBarSpace = chartWidth * 0.6
  return Math.min(totalBarSpace / count, 30)
})

// Calculate bar X position
const getBarX = (index) => {
  const count = chartData.value.length || 1
  const spacing = chartWidth / count
  return spacing * index + (spacing - barWidth.value) / 2
}

// Calculate bar Y position (top of bar)
const getBarY = (value) => {
  const max = maxCorrectCount.value || 10
  const height = (value / max) * chartHeight
  return chartHeight - height
}

// Calculate bar height
const getBarHeight = (value) => {
  const max = maxCorrectCount.value || 10
  return (value / max) * chartHeight
}

// Calculate point X position (center of bar)
const getPointX = (index) => {
  return getBarX(index) + barWidth.value / 2
}

// Calculate line Y position (accuracy rate 0-100%)
const getLineY = (rate) => {
  return chartHeight - (rate / 100) * chartHeight
}

// Generate line path
const linePath = computed(() => {
  if (chartData.value.length === 0) return ''

  const points = chartData.value.map((item, index) => {
    const x = getPointX(index)
    const y = getLineY(item.accuracyRate)
    // Debug: 라인 좌표 확인
    console.log(`[LineChart] ${item.label}: accuracyRate=${item.accuracyRate}%, Y=${y} (viewBox 0-${chartHeight})`)
    return `${x},${y}`
  })

  return `M${points.join(' L')}`
})



// Event handlers
const onDaysChange = () => {
  fetchDailyStats(selectedDays.value)
}

const onHover = (index, event) => {
  hoveredIndex.value = index
  // Calculate position relative to the chart container
  // We can use the event target or calculated positions
  // Let's use the calculated positions for stability
  const x = getPointX(index)
  // Convert SVG coordinates to percentage or pixels relative to container
  // Since SVG is 100% width/height, we need to map viewBox to pixels
  // But wait, the tooltip is inside the container div which has relative positioning
  // The SVG viewBox is 0 0 300 150.
  // We need to map 300 -> 100% width, 150 -> 100% height (minus bottom padding)

  // Actually, simpler to just use the event target's bounding rect relative to container
  // But event target might be small.
  // Let's try mapping:
  const container = event.target.closest('.relative')
  if (container) {
    const rect = container.getBoundingClientRect()
    // x in viewBox is getPointX(index)
    // y in viewBox is roughly chartHeight / 2 (center)
    // We want tooltip above the bar/point.
    // Let's put it above the higher of the two (bar top or point)
    const barY = getBarY(chartData.value[index].correctCount)
    const pointY = getLineY(chartData.value[index].accuracyRate)
    const targetY = Math.min(barY, pointY)

    // Map to percentage
    const xPct = (getPointX(index) / chartWidth) * 100
    const yPct = (targetY / chartHeight) * 100

    // The container height includes the bottom padding (bottom-10 = 40px)
    // SVG height is calc(100% - 40px).
    // This is getting complicated.
    // Let's just use a simple approximation or the mouse event?
    // Mouse event is easiest but might flicker.
    // Let's use the computed X and a fixed Y or dynamic Y based on data.

    // Re-evaluating: The tooltip is inside the div with `absolute left-8 right-10 top-0 bottom-0`.
    // Its width is dynamic.
    // `left` style should be pixels or %.
    // Let's use %.
    tooltipPos.value = {
      x: (getPointX(index) / chartWidth) * container.offsetWidth,
      y: (targetY / chartHeight) * (container.offsetHeight - 40) - 10 // -40 for bottom-10, -10 for spacing
    }
  }
}

const onLeave = () => {
  hoveredIndex.value = null
}

// Lifecycle
onMounted(() => {
  fetchDailyStats(selectedDays.value)
})
</script>
