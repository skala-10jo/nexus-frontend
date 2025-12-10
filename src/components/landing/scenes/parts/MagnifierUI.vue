<template>
  <Transition name="magnifier">
    <div
      v-if="show"
      class="absolute pointer-events-none z-50"
      :style="positionStyle"
    >
      <div class="relative">
        <!-- Lens -->
        <div
          class="relative rounded-full border-[8px] border-amber-600 shadow-2xl overflow-hidden transition-all duration-300"
          :class="isPressed ? 'w-32 h-32' : 'w-36 h-36'"
          :style="{ backgroundColor: isActive ? 'white' : 'transparent' }"
        >
          <!-- Transparent glass effect (before reaching button) -->
          <div
            v-if="!isActive"
            class="absolute inset-0 bg-white/10 backdrop-blur-[1px]"
          ></div>

          <!-- Magnified button inside (only when lens is active) -->
          <Transition name="fade">
            <div
              v-if="isActive"
              class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"
            >
              <button
                class="px-4 py-2 rounded-full font-bold transition-all duration-150"
                :class="isPressed
                  ? 'bg-blue-600 text-white scale-90 shadow-inner text-sm'
                  : 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 text-base'"
              >
                {{ buttonText }}
              </button>
            </div>
          </Transition>

          <!-- Glass shine (always visible) -->
          <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
          <div class="absolute top-3 left-4 w-8 h-3 bg-white/50 rounded-full blur-sm"></div>
        </div>
        <!-- Handle -->
        <div class="absolute -bottom-14 left-1/2 -translate-x-1/2 rotate-[40deg] origin-top">
          <div class="w-6 h-20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-full shadow-xl"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  position: { type: Object, default: () => ({ x: 0, y: 0 }) },
  isActive: { type: Boolean, default: false },
  isPressed: { type: Boolean, default: false },
  buttonText: { type: String, default: '회화 연습' }
})

const positionStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  transform: 'translate(-50%, -50%)'
}))
</script>

<style scoped>
.magnifier-enter-active {
  animation: magnifierIn 0.5s ease-out;
}

.magnifier-leave-active {
  animation: magnifierOut 0.3s ease-in;
}

@keyframes magnifierIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3) rotate(-20deg);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes magnifierOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}

.fade-enter-active {
  transition: opacity 0.4s ease-out;
}
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
