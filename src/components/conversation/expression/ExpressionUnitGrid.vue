<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div
      v-for="unit in units"
      :key="unit.unit"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <!-- Unit Header -->
      <div class="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h2 class="text-xl font-bold text-gray-900 mb-2">{{ unit.unit }}</h2>
            <div class="flex items-center gap-3">
              <div class="w-48 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="getProgressBarColor(unit.accuracyRate)"
                  :style="{ width: `${unit.accuracyRate || 0}%` }"
                ></div>
              </div>
              <span class="text-sm font-medium text-gray-600">
                <template v-if="unit.quizAttemptedCount > 0">
                  {{ Math.round(unit.accuracyRate || 0) }}% ({{ unit.correctCount }}/{{ unit.correctCount + unit.incorrectCount }})
                </template>
                <template v-else>
                  미학습
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Chapters Grid -->
      <div class="p-8">
        <div v-if="unitChapters[unit.unit]?.length > 0">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              v-for="chapter in unitChapters[unit.unit]"
              :key="chapter.chapter"
              @click="$emit('select-chapter', unit.unit, chapter.chapter)"
              class="p-4 rounded-xl border-2 transition-all duration-200 text-center hover:border-gray-900 hover:shadow-md bg-white border-gray-200 group flex flex-col justify-between h-full"
            >
              <div class="flex flex-col items-center mb-3 flex-1 justify-center">
                <h3 class="font-semibold text-gray-900 group-hover:text-gray-900 break-keep leading-snug">{{ chapter.chapter }}</h3>
              </div>
              <div class="flex items-center gap-2 w-full">
                <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="getProgressBarColor(chapter.accuracyRate)"
                    :style="{ width: `${chapter.accuracyRate || 0}%` }"
                  ></div>
                </div>
                <span class="text-xs font-medium text-gray-500">
                  <template v-if="chapter.quizAttemptedCount > 0">
                    {{ Math.round(chapter.accuracyRate || 0) }}%
                  </template>
                  <template v-else>
                    -
                  </template>
                </span>
              </div>
            </button>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-500">
          챕터를 불러오는 중...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  units: {
    type: Array,
    required: true
  },
  unitChapters: {
    type: Object,
    required: true
  },
  getProgressBarColor: {
    type: Function,
    required: true
  }
})

defineEmits(['select-chapter'])
</script>
