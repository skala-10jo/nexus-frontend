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
          <div :class="[
            'w-14 h-14 rounded-full flex items-center justify-center',
            iconBgClass
          ]">
            <component :is="iconComponent" :class="['w-8 h-8', iconColorClass]" />
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
            {{ cancelText }}
          </button>
          <button
            @click="$emit('confirm')"
            :class="[
              'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-colors',
              confirmButtonClass
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import {
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'danger', // danger, warning, info
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  confirmText: {
    type: String,
    default: '확인'
  },
  cancelText: {
    type: String,
    default: '취소'
  }
});

defineEmits(['confirm', 'cancel']);

const iconComponent = computed(() => {
  const icons = {
    danger: ExclamationTriangleIcon,
    warning: ArchiveBoxIcon,
    info: InformationCircleIcon
  };
  return icons[props.type];
});

const iconBgClass = computed(() => {
  const classes = {
    danger: 'bg-red-100',
    warning: 'bg-yellow-100',
    info: 'bg-blue-100'
  };
  return classes[props.type];
});

const iconColorClass = computed(() => {
  const classes = {
    danger: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };
  return classes[props.type];
});

const confirmButtonClass = computed(() => {
  const classes = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  };
  return classes[props.type];
});
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
