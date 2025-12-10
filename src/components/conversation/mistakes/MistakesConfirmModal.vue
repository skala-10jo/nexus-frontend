<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-xl md:rounded-2xl p-5 md:p-6 max-w-md w-full shadow-xl mx-4">
      <h3 class="text-base md:text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
      <p class="text-sm md:text-base text-gray-600 mb-5 md:mb-6">{{ message }}</p>
      <div class="flex gap-2 md:gap-3">
        <button
          @click="$emit('cancel')"
          class="flex-1 py-2.5 md:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm md:text-base font-medium"
        >
          Cancel
        </button>
        <button
          @click="$emit('confirm')"
          class="flex-1 py-2.5 md:py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-sm md:text-base font-medium"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Confirm'
  }
})

defineEmits(['cancel', 'confirm'])
</script>
