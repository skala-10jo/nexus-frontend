<template>
  <div class="space-y-6">
    <!-- Language Toggle -->
    <div class="space-y-3">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">언어</label>
      <div class="bg-gray-100 p-1 rounded-xl flex">
        <button
          v-for="lang in languageOptions"
          :key="lang.value"
          @click="updateLanguage(lang.value)"
          :class="[
            'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-1.5',
            modelValue.language === lang.value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          <span class="text-base">{{ lang.flag }}</span>
          <span class="hidden sm:inline">{{ lang.label }}</span>
        </button>
      </div>
    </div>

    <!-- Difficulty Toggle -->
    <div class="space-y-3">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">난이도</label>
      <div class="bg-gray-100 p-1 rounded-xl flex">
        <button
          v-for="diff in difficultyOptions"
          :key="diff.value"
          @click="updateDifficulty(diff.value)"
          :class="[
            'flex-1 py-2.5 rounded-lg text-sm font-bold transition-all',
            modelValue.difficulty === diff.value
              ? diff.activeClass + ' shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          ]"
        >
          {{ diff.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  languageOptions: {
    type: Array,
    required: true
  },
  difficultyOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])

function updateLanguage(value) {
  emit('update:modelValue', {
    ...props.modelValue,
    language: value
  })
}

function updateDifficulty(value) {
  emit('update:modelValue', {
    ...props.modelValue,
    difficulty: value
  })
}
</script>
