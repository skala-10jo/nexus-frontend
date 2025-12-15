<template>
  <div
    v-if="showPopup && selectedTerm"
    ref="popupOverlayRef"
    class="absolute inset-0 z-30 flex items-center justify-center p-4"
    style="background: rgba(0,0,0,0); opacity: 0;"
    @click.self="$emit('close')"
  >
    <div
      ref="popupRef"
      class="glassmorphism-popup w-full max-w-sm p-5 rounded-2xl"
      style="transform: scale(0.9) translateY(20px); opacity: 0;"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900">{{ selectedTerm.korean }}</h3>
        <button
          @click="$emit('close')"
          class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>

      <div class="space-y-3">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-gray-400 w-16">영어</span>
          <span class="text-sm text-gray-900">{{ selectedTerm.english }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-gray-400 w-16">베트남어</span>
          <span class="text-sm text-gray-900">{{ selectedTerm.vietnamese }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-gray-400 w-16">정의</span>
          <span class="text-sm text-gray-700">{{ selectedTerm.definition }}</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-gray-400 w-16">상태</span>
          <div class="flex items-center gap-1">
            <CheckCircleIcon v-if="selectedTerm.isVerified" class="w-4 h-4 text-green-500" />
            <span
              class="text-xs font-bold"
              :class="selectedTerm.isVerified ? 'text-green-600' : 'text-yellow-600'"
            >
              {{ selectedTerm.isVerified ? '검증완료' : 'AI 자동추출' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, CheckCircleIcon } from '@heroicons/vue/24/solid'

defineProps({
  showPopup: { type: Boolean, required: true },
  selectedTerm: { type: Object, default: null }
})

defineEmits(['close'])

const popupOverlayRef = defineModel('popupOverlayRef')
const popupRef = defineModel('popupRef')

defineExpose({ popupOverlayRef, popupRef })
</script>

<style scoped>
.glassmorphism-popup {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}
</style>
