<script setup>
/**
 * Schedule 모바일 탭 컴포넌트
 * @description 모바일 환경에서 Projects/Schedule 탭 전환 UI
 */
defineProps({
  /** 현재 활성화된 탭 */
  activeTab: {
    type: String,
    required: true,
    validator: (value) => ['projects', 'schedule'].includes(value)
  }
})

const emit = defineEmits([
  /** 탭 전환 이벤트 */
  'switch-tab'
])
</script>

<template>
  <div class="md:hidden flex border-b border-gray-200 bg-white">
    <button
      @click="emit('switch-tab', 'projects')"
      class="flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors"
      :class="activeTab === 'projects'
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'"
    >
      Projects
    </button>
    <button
      @click="emit('switch-tab', 'schedule')"
      class="flex-1 py-3 text-sm font-bold text-center border-b-2 transition-colors"
      :class="activeTab === 'schedule'
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-500 hover:text-gray-700'"
    >
      Schedule
    </button>
  </div>
</template>
