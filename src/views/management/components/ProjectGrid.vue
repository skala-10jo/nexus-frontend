<template>
  <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    <div
      v-for="project in projects"
      :key="project.id"
      class="group bg-gray-50 rounded-2xl p-6 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer relative"
      @click="$emit('view', project)"
    >
      <!-- Status Badge -->
      <div class="flex justify-between items-start mb-4">
        <span
          :class="[
            'px-2.5 py-1 inline-flex text-[10px] font-bold rounded-full uppercase tracking-wide',
            project.status === 'ACTIVE'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          ]"
        >
          {{ getStatusText(project.status) }}
        </span>

        <!-- Menu Button -->
        <div class="relative" @click.stop>
          <button
            @click="$emit('toggle-dropdown', project.id)"
            class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <Transition name="dropdown">
            <div
              v-if="openDropdownId === project.id"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-20"
            >
              <button
                @click="$emit('edit', project)"
                class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                v-if="project.status === 'ACTIVE'"
                @click="$emit('archive', project)"
                class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                Archive
              </button>
              <button
                v-else-if="project.status === 'ARCHIVED'"
                @click="$emit('unarchive', project)"
                class="w-full px-4 py-2.5 text-left text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Restore
              </button>
              <div class="h-px bg-gray-100 my-1"></div>
              <button
                @click="$emit('delete', project)"
                class="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </Transition>
        </div>
      </div>

      <!-- Project Info -->
      <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
        {{ project.name }}
      </h3>
      <p class="text-gray-500 text-sm mb-6 line-clamp-2 min-h-[2.5rem] leading-relaxed">
        {{ project.description || 'No description provided.' }}
      </p>

      <!-- Footer Info -->
      <div class="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="font-medium">{{ project.documentCount || 0 }} files</span>
        </div>
        <span class="text-xs text-gray-400 font-medium">
          {{ formatDate(project.createdAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projects: {
    type: Array,
    required: true
  },
  openDropdownId: {
    type: [String, Number, null],
    default: null
  },
  getStatusText: {
    type: Function,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  }
})

defineEmits(['view', 'edit', 'archive', 'unarchive', 'delete', 'toggle-dropdown'])
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>
