<template>
  <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
    <div class="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
      <BookOpenIcon class="w-4 h-4 text-blue-500" />
      <h2 class="text-sm font-bold text-gray-900">전문용어 사전</h2>
      <span class="text-xs text-gray-400">({{ visibleTerms.length }})</span>
    </div>

    <!-- Scan Line Overlay -->
    <div
      v-if="animationPhase === 'scanning'"
      class="absolute inset-0 z-20 pointer-events-none overflow-hidden"
    >
      <div ref="scanLineRef" class="scan-line" style="top: 0;"></div>
    </div>

    <!-- Terms Table -->
    <div class="relative">
      <!-- Floating Terms (before settling) -->
      <div
        v-if="animationPhase === 'extracting'"
        class="absolute inset-0 z-10 p-4"
      >
        <div
          v-for="(term, index) in floatingTerms"
          :key="term.id"
          :ref="el => setFloatingTermRef(el, index)"
          class="absolute text-sm font-medium text-blue-600"
          :style="getFloatingInitialStyle(index)"
        >
          {{ term.korean }}
        </div>
      </div>

      <table v-if="visibleTerms.length > 0" class="w-full text-sm">
        <thead class="bg-gray-50/95 sticky top-0">
          <tr class="text-left border-b border-gray-100">
            <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">한국어</th>
            <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">영어</th>
            <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">베트남어</th>
            <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">상태</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="(term, index) in visibleTerms"
            :key="term.id"
            :ref="el => setTermRowRef(el, index)"
            class="hover:bg-blue-50/30 transition-colors cursor-pointer"
            :class="{ 'bg-blue-50/50 ring-2 ring-blue-300': selectedTerm?.id === term.id }"
            style="opacity: 0; transform: translateY(-10px);"
            @click="$emit('selectTerm', term)"
          >
            <td class="px-4 py-2">
              <span class="text-sm font-bold text-gray-900 hover:text-blue-600">{{ term.korean }}</span>
            </td>
            <td class="px-4 py-2 text-sm text-gray-600">{{ term.english }}</td>
            <td class="px-4 py-2 text-sm text-gray-600">{{ term.vietnamese }}</td>
            <td class="px-4 py-2">
              <span
                class="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase"
                :class="term.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >
                {{ term.isVerified ? '검증' : 'AI추출' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-else class="py-8 text-center text-gray-400">
        <BookOpenIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p class="text-sm">문서에서 용어를 추출하세요</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BookOpenIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  visibleTerms: { type: Array, required: true },
  floatingTerms: { type: Array, required: true },
  selectedTerm: { type: Object, default: null },
  animationPhase: { type: String, required: true },
  getFloatingInitialStyle: { type: Function, required: true },
  floatingTermRefs: { type: Array, required: true },
  termRowRefs: { type: Array, required: true }
})

const emit = defineEmits(['selectTerm', 'update:floatingTermRefs', 'update:termRowRefs'])

const scanLineRef = defineModel('scanLineRef')

const setFloatingTermRef = (el, index) => {
  if (el) {
    const refs = [...props.floatingTermRefs]
    refs[index] = el
    emit('update:floatingTermRefs', refs)
  }
}

const setTermRowRef = (el, index) => {
  if (el) {
    const refs = [...props.termRowRefs]
    refs[index] = el
    emit('update:termRowRefs', refs)
  }
}

defineExpose({ scanLineRef })
</script>

<style scoped>
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent);
  box-shadow:
    0 0 10px #3b82f6,
    0 0 20px #3b82f6,
    0 0 30px #06b6d4;
}
</style>
