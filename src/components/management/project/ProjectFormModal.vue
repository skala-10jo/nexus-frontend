<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 class="text-xl font-bold text-gray-900">
          {{ isEditing ? 'Edit Project' : 'New Project' }}
        </h2>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-8 overflow-y-auto">
        <div class="space-y-6">
          <!-- Project Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
            <input
              :value="formData.name"
              @input="$emit('update:formData', { ...formData, name: $event.target.value })"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="Enter project name"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              :value="formData.description"
              @input="$emit('update:formData', { ...formData, description: $event.target.value })"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white"
              placeholder="What is this project about?"
            ></textarea>
          </div>

          <!-- Related Documents -->
          <div class="pt-4 border-t border-gray-100">
            <label class="block text-sm font-semibold text-gray-700 mb-4">Related Documents</label>

            <!-- Document Search -->
            <div class="relative mb-4">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                :value="documentSearchQuery"
                @input="$emit('update:documentSearchQuery', $event.target.value)"
                type="text"
                placeholder="Search documents to link..."
                class="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-sm"
              />
            </div>

            <!-- Document List -->
            <div v-if="filteredDocuments.length > 0" class="border border-gray-200 rounded-xl max-h-60 overflow-y-auto scrollbar-thin">
              <div
                v-for="doc in filteredDocuments"
                :key="doc.id"
                class="flex items-center gap-3 p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors cursor-pointer"
                @click="$emit('toggle-document', doc.id)"
              >
                <div class="relative flex items-center">
                  <input
                    type="checkbox"
                    :checked="formData.documentIds.includes(doc.id)"
                    class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    @click.stop
                    @change="$emit('toggle-document', doc.id)"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ doc.originalFilename }}</p>
                  <p class="text-xs text-gray-500">
                    {{ doc.fileType }} · {{ formatFileSize(doc.fileSize) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p class="text-gray-500 text-sm">
                {{ documentSearchQuery ? 'No documents found' : 'No documents available' }}
              </p>
            </div>

            <!-- Selected Count -->
            <div class="mt-3 flex justify-between items-center text-sm">
              <span class="text-gray-500">{{ formData.documentIds.length }} documents selected</span>
              <button
                v-if="formData.documentIds.length > 0"
                @click="$emit('clear-documents')"
                class="text-blue-600 hover:text-blue-700 font-medium text-xs"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
        <button
          @click="$emit('close')"
          class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
        >
          Cancel
        </button>
        <button
          @click="$emit('save')"
          class="px-6 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!formData.name"
        >
          {{ isEditing ? 'Save Changes' : 'Create Project' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    required: true
  },
  documentSearchQuery: {
    type: String,
    default: ''
  },
  filteredDocuments: {
    type: Array,
    default: () => []
  }
})

defineEmits([
  'close',
  'save',
  'update:formData',
  'update:documentSearchQuery',
  'toggle-document',
  'clear-documents'
])

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
/* Custom Scrollbar for document list */
.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}
.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}
.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
</style>
