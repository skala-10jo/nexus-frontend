<template>
  <div class="bg-white rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm">
    <div class="flex items-end justify-center gap-3 md:gap-8">
      <!-- Source Language -->
      <div class="flex-1 max-w-[140px] md:max-w-xs space-y-1.5 md:space-y-2">
        <label class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">원본</label>
        <div class="relative" ref="sourceDropdownRef">
          <button
            @click="toggleSourceDropdown"
            type="button"
            class="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base font-bold transition-all"
            :class="{ 'border-blue-500 ring-2 ring-blue-100': isSourceDropdownOpen }"
            :disabled="disabled"
          >
            <div class="flex items-center gap-2 md:gap-3">
              <span class="text-lg md:text-xl">{{ getLanguageFlag(sourceLang) }}</span>
              <span class="text-gray-900 truncate">{{ getLanguageName(sourceLang) }}</span>
            </div>
            <ChevronDownIcon
              class="w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-180': isSourceDropdownOpen }"
            />
          </button>

          <!-- Source Dropdown -->
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="isSourceDropdownOpen"
              class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              <ul class="py-1">
                <li v-for="lang in languageOptions" :key="`source-${lang.code}`">
                  <button
                    @click="selectSourceLanguage(lang.code)"
                    type="button"
                    class="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base hover:bg-gray-50 transition-colors flex items-center justify-between"
                    :class="sourceLang === lang.code ? 'bg-blue-50/50' : ''"
                    :disabled="lang.code === targetLang"
                  >
                    <div class="flex items-center gap-2 md:gap-3" :class="lang.code === targetLang ? 'opacity-40' : ''">
                      <span class="text-lg md:text-xl">{{ lang.flag }}</span>
                      <span class="font-bold" :class="sourceLang === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                    </div>
                    <svg v-if="sourceLang === lang.code" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Swap Button -->
      <button
        @click="swapLanguages"
        type="button"
        class="pb-2.5 md:pb-3 p-2 rounded-lg hover:bg-blue-50 hover:scale-110 transition-all group"
        title="언어 교환"
        :disabled="disabled"
      >
        <svg class="w-5 h-5 md:w-6 md:h-6 text-gray-300 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      </button>

      <!-- Target Language -->
      <div class="flex-1 max-w-[140px] md:max-w-xs space-y-1.5 md:space-y-2">
        <label class="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">번역</label>
        <div class="relative" ref="targetDropdownRef">
          <button
            @click="toggleTargetDropdown"
            type="button"
            class="w-full flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm md:text-base font-bold transition-all"
            :class="{ 'border-blue-500 ring-2 ring-blue-100': isTargetDropdownOpen }"
            :disabled="disabled"
          >
            <div class="flex items-center gap-2 md:gap-3">
              <span class="text-lg md:text-xl">{{ getLanguageFlag(targetLang) }}</span>
              <span class="text-gray-900 truncate">{{ getLanguageName(targetLang) }}</span>
            </div>
            <ChevronDownIcon
              class="w-4 h-4 md:w-5 md:h-5 text-gray-400 transition-transform duration-200 flex-shrink-0"
              :class="{ 'rotate-180': isTargetDropdownOpen }"
            />
          </button>

          <!-- Target Dropdown -->
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="isTargetDropdownOpen"
              class="absolute left-0 right-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
            >
              <ul class="py-1">
                <li v-for="lang in languageOptions" :key="`target-${lang.code}`">
                  <button
                    @click="selectTargetLanguage(lang.code)"
                    type="button"
                    class="w-full text-left px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base hover:bg-gray-50 transition-colors flex items-center justify-between"
                    :class="targetLang === lang.code ? 'bg-blue-50/50' : ''"
                    :disabled="lang.code === sourceLang"
                  >
                    <div class="flex items-center gap-2 md:gap-3" :class="lang.code === sourceLang ? 'opacity-40' : ''">
                      <span class="text-lg md:text-xl">{{ lang.flag }}</span>
                      <span class="font-bold" :class="targetLang === lang.code ? 'text-blue-600' : 'text-gray-700'">{{ lang.name }}</span>
                    </div>
                    <svg v-if="targetLang === lang.code" class="w-4 h-4 md:w-5 md:h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  sourceLang: {
    type: String,
    default: 'en'
  },
  targetLang: {
    type: String,
    default: 'ko'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:sourceLang', 'update:targetLang', 'swap'])

// 언어 옵션
const languageOptions = [
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
]

// 드롭다운 상태
const isSourceDropdownOpen = ref(false)
const isTargetDropdownOpen = ref(false)
const sourceDropdownRef = ref(null)
const targetDropdownRef = ref(null)

// 유틸리티 함수
function getLanguageFlag(code) {
  return languageOptions.find(l => l.code === code)?.flag || ''
}

function getLanguageName(code) {
  return languageOptions.find(l => l.code === code)?.name || code
}

// 드롭다운 토글
function toggleSourceDropdown() {
  isSourceDropdownOpen.value = !isSourceDropdownOpen.value
  isTargetDropdownOpen.value = false
}

function toggleTargetDropdown() {
  isTargetDropdownOpen.value = !isTargetDropdownOpen.value
  isSourceDropdownOpen.value = false
}

// 언어 선택
function selectSourceLanguage(code) {
  if (code !== props.targetLang) {
    emit('update:sourceLang', code)
    isSourceDropdownOpen.value = false
  }
}

function selectTargetLanguage(code) {
  if (code !== props.sourceLang) {
    emit('update:targetLang', code)
    isTargetDropdownOpen.value = false
  }
}

// 언어 교환
function swapLanguages() {
  emit('update:sourceLang', props.targetLang)
  emit('update:targetLang', props.sourceLang)
  emit('swap')
}

// 외부 클릭 처리
function handleDropdownClickOutside(event) {
  if (sourceDropdownRef.value && !sourceDropdownRef.value.contains(event.target)) {
    isSourceDropdownOpen.value = false
  }
  if (targetDropdownRef.value && !targetDropdownRef.value.contains(event.target)) {
    isTargetDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDropdownClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDropdownClickOutside)
})
</script>
