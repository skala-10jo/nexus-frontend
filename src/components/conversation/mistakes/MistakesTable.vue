<template>
  <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div class="max-h-[60vh] overflow-y-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
          <tr>
            <th class="px-4 py-4 text-center">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="$emit('toggle-select-all')"
                class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
            </th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expression</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Example</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
            <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
            <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Attempt</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="mistake in mistakes"
            :key="mistake.id"
            class="transition"
            :class="selectedMistakes.has(mistake.id) ? 'bg-blue-50' : 'hover:bg-gray-50'"
          >
            <!-- Checkbox -->
            <td class="px-4 py-4 text-center">
              <input
                type="checkbox"
                :checked="selectedMistakes.has(mistake.id)"
                @change="$emit('toggle-select', mistake.id)"
                class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
              />
            </td>
            <!-- Expression -->
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-gray-900">{{ mistake.expression }}</span>
                <button
                  @click="$emit('play-tts', mistake.expression)"
                  :disabled="ttsLoading"
                  class="p-1 rounded-full hover:bg-gray-200 transition"
                >
                  <SpeakerWaveIcon class="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ formatMeaning(mistake.meaning) }}</p>
            </td>
            <!-- Example -->
            <td class="px-6 py-4 max-w-xs">
              <p class="text-sm text-gray-900 line-clamp-2" v-html="highlightExpression(mistake.exampleText, mistake.expression)"></p>
              <p class="text-xs text-gray-500 mt-1 line-clamp-1">{{ mistake.exampleTranslation }}</p>
            </td>
            <!-- Location -->
            <td class="px-6 py-4">
              <span class="text-sm text-gray-600">{{ mistake.unit }}</span>
              <p class="text-xs text-gray-400">{{ mistake.chapter }}</p>
            </td>
            <!-- Result -->
            <td class="px-6 py-4 text-center">
              <div class="flex items-center justify-center gap-2">
                <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  {{ mistake.incorrectCount }}
                </span>
                <span class="text-gray-400">/</span>
                <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  {{ mistake.correctCount }}
                </span>
              </div>
            </td>
            <!-- Last Attempt -->
            <td class="px-6 py-4 text-right">
              <span class="text-sm text-gray-500">{{ formatDate(mistake.lastAttemptedAt) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { SpeakerWaveIcon } from '@heroicons/vue/24/outline'

defineProps({
  mistakes: {
    type: Array,
    required: true
  },
  selectedMistakes: {
    type: Set,
    required: true
  },
  isAllSelected: {
    type: Boolean,
    default: false
  },
  ttsLoading: {
    type: Boolean,
    default: false
  },
  formatMeaning: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  highlightExpression: {
    type: Function,
    required: true
  }
})

defineEmits(['toggle-select', 'toggle-select-all', 'play-tts'])
</script>
