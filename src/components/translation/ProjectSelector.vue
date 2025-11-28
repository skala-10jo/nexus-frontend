<template>
  <div class="project-selector relative" ref="containerRef">
    <label class="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
      Project
      <span v-if="contextInfo" class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">
        Context Active
      </span>
    </label>

    <!-- Trigger Button -->
    <button
      @click="toggleDropdown"
      class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl transition-all duration-200 hover:border-blue-400 hover:shadow-sm group"
      :class="{ 'border-blue-500 ring-2 ring-blue-100': isOpen }"
    >
      <span class="text-sm font-medium truncate" :class="selectedProject ? 'text-gray-900' : 'text-gray-400'">
        {{ selectedProject ? selectedProject.name : 'Select Project (Optional)' }}
      </span>
      <svg
        class="w-4 h-4 text-gray-400 transition-transform duration-200 group-hover:text-gray-600"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-64 overflow-y-auto"
      >
        <ul class="py-1">
          <!-- Default Option -->
          <li>
            <button
              @click="selectProject(null)"
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
              :class="!modelValue ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-500'"
            >
              <span>No Project</span>
              <svg v-if="!modelValue" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </button>
          </li>
          
          <!-- Projects -->
          <li v-for="project in projects" :key="project.id">
            <button
              @click="selectProject(project)"
              class="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between group"
              :class="modelValue === project.id ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-gray-700'"
            >
              <span class="truncate">{{ project.name }}</span>
              <svg v-if="modelValue === project.id" class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </button>
          </li>
        </ul>
      </div>
    </transition>

    <!-- Context Info -->
    <p v-if="contextInfo && modelValue" class="mt-2 text-xs text-gray-500 flex items-center gap-2 px-1">
      <span class="flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        {{ contextInfo.documentsCount }} Docs
      </span>
      <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
      <span class="flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        {{ contextInfo.termsCount }} Terms
      </span>
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  projects: {
    type: Array,
    default: () => []
  },
  contextInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const isOpen = ref(false)
const containerRef = ref(null)

const selectedProject = computed(() => {
  return props.projects.find(p => p.id === props.modelValue)
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
}

function selectProject(project) {
  const value = project ? project.id : null
  emit('update:modelValue', value)
  emit('change', value)
  isOpen.value = false
}

// Click outside to close
function handleClickOutside(event) {
  if (containerRef.value && !containerRef.value.contains(event.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
