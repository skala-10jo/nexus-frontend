<template>
  <div class="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
    <div class="flex items-center gap-4 flex-1 min-w-0">
      <!-- Search -->
      <div class="relative flex-1 max-w-md">
        <input
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          type="text"
          placeholder="Search projects..."
          class="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Status Filter -->
      <div class="relative">
        <select
          :value="statusFilter"
          @change="$emit('update:statusFilter', $event.target.value)"
          class="appearance-none pl-4 pr-9 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 focus:ring-2 focus:ring-blue-500 outline-none hover:border-gray-300 transition-all"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <svg class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: {
    type: String,
    default: ''
  },
  statusFilter: {
    type: String,
    default: 'ALL'
  }
})

defineEmits(['update:searchQuery', 'update:statusFilter'])
</script>
