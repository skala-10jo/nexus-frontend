<template>
  <Transition name="modal">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="$emit('cancel')"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        role="dialog"
        aria-modal="true"
      >
        <!-- Icon -->
        <div class="pt-8 pb-4 flex justify-center">
          <div class="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <ExclamationTriangleIcon class="w-8 h-8 text-red-600" />
          </div>
        </div>

        <!-- Content -->
        <div class="px-6 pb-6 text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
          <p class="text-sm text-gray-600">{{ message }}</p>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3 px-6 pb-6">
          <button
            @click="$emit('cancel')"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            @click="$emit('confirm')"
            class="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

defineEmits(['confirm', 'cancel']);
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
