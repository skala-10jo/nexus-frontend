<template>
  <div class="flex items-end gap-3">
    <!-- Source Language -->
    <div class="relative w-40" ref="sourceContainerRef">
      <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Source</label>
      <button
        @click="toggleSourceDropdown"
        class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-400 hover:shadow-sm group"
        :class="{ 'border-blue-500 ring-2 ring-blue-100': isSourceOpen }"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg leading-none">{{ getLangFlag(sourceLanguage) }}</span>
          <span class="text-sm font-medium text-gray-900">{{ getLangName(sourceLanguage) }}</span>
        </div>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600"
          :class="{ 'rotate-180': isSourceOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Source Dropdown -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isSourceOpen"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          <ul class="py-1">
            <li v-for="lang in languages" :key="`source-${lang.code}`">
              <button
                @click="selectSourceLang(lang.code)"
                class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                :class="sourceLanguage === lang.code ? 'bg-blue-50/50' : ''"
                :disabled="lang.code === targetLanguage"
              >
                <div class="flex items-center gap-2" :class="lang.code === targetLanguage ? 'opacity-50' : ''">
                  <span class="text-lg leading-none">{{ lang.flag }}</span>
                  <span class="font-medium" :class="sourceLanguage === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                </div>
                <svg v-if="sourceLanguage === lang.code" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </button>
            </li>
          </ul>
        </div>
      </transition>
    </div>

    <!-- Swap Button -->
    <button
      @click="swapLanguages"
      class="mb-[2px] w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:scale-105 transition-all duration-200 border border-transparent hover:border-blue-100"
      title="Swap Languages"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
    </button>

    <!-- Target Language -->
    <div class="relative w-40" ref="targetContainerRef">
      <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">Target</label>
      <button
        @click="toggleTargetDropdown"
        class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-400 hover:shadow-sm group"
        :class="{ 'border-blue-500 ring-2 ring-blue-100': isTargetOpen }"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg leading-none">{{ getLangFlag(targetLanguage) }}</span>
          <span class="text-sm font-medium text-gray-900">{{ getLangName(targetLanguage) }}</span>
        </div>
        <svg
          class="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600"
          :class="{ 'rotate-180': isTargetOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Target Dropdown -->
      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-if="isTargetOpen"
          class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
        >
          <ul class="py-1">
            <li v-for="lang in languages" :key="`target-${lang.code}`">
              <button
                @click="selectTargetLang(lang.code)"
                class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
                :class="targetLanguage === lang.code ? 'bg-blue-50/50' : ''"
                :disabled="lang.code === sourceLanguage"
              >
                <div class="flex items-center gap-2" :class="lang.code === sourceLanguage ? 'opacity-50' : ''">
                  <span class="text-lg leading-none">{{ lang.flag }}</span>
                  <span class="font-medium" :class="targetLanguage === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                </div>
                <svg v-if="targetLanguage === lang.code" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              </button>
            </li>
          </ul>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  sourceLanguage: {
    type: String,
    default: 'ko'
  },
  targetLanguage: {
    type: String,
    default: 'en'
  }
})

const emit = defineEmits(['update:sourceLanguage', 'update:targetLanguage', 'swap'])

const languages = [
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
]

const isSourceOpen = ref(false)
const isTargetOpen = ref(false)
const sourceContainerRef = ref(null)
const targetContainerRef = ref(null)

function getLangName(code) {
  return languages.find(l => l.code === code)?.name || code
}

function getLangFlag(code) {
  return languages.find(l => l.code === code)?.flag || ''
}

function toggleSourceDropdown() {
  isSourceOpen.value = !isSourceOpen.value
  isTargetOpen.value = false
}

function toggleTargetDropdown() {
  isTargetOpen.value = !isTargetOpen.value
  isSourceOpen.value = false
}

function selectSourceLang(code) {
  if (code !== props.targetLanguage) {
    emit('update:sourceLanguage', code)
    isSourceOpen.value = false
  }
}

function selectTargetLang(code) {
  if (code !== props.sourceLanguage) {
    emit('update:targetLanguage', code)
    isTargetOpen.value = false
  }
}

function swapLanguages() {
  const temp = props.sourceLanguage
  emit('update:sourceLanguage', props.targetLanguage)
  emit('update:targetLanguage', temp)
  emit('swap')
}

// Click outside
function handleClickOutside(event) {
  if (sourceContainerRef.value && !sourceContainerRef.value.contains(event.target)) {
    isSourceOpen.value = false
  }
  if (targetContainerRef.value && !targetContainerRef.value.contains(event.target)) {
    isTargetOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
