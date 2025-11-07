<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[100] space-y-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-md',
            'border backdrop-blur-sm',
            getToastClass(toast.type)
          ]"
        >
          <component :is="getToastIcon(toast.type)" class="w-5 h-5 flex-shrink-0" />
          <p class="text-sm font-medium flex-1">{{ toast.message }}</p>
          <button
            @click="remove(toast.id)"
            class="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { XMarkIcon } from '@heroicons/vue/20/solid';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/vue/24/outline';
import { useToast } from '@/composables/useToast';

const { toasts, remove } = useToast();

const getToastIcon = (type) => {
  const icons = {
    success: CheckCircleIcon,
    error: XCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return icons[type] || InformationCircleIcon;
};

const getToastClass = (type) => {
  const classes = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  return classes[type] || classes.info;
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>
