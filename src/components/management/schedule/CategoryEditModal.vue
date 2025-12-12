<template>
  <div class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-[60]" @click.self="close">
    <div class="bg-white rounded-lg shadow-2xl max-w-md w-full">
      <!-- Header -->
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
        <h3 class="text-lg font-bold text-gray-900">
          {{ isNew ? '새 카테고리 추가' : '카테고리 수정' }}
        </h3>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="p-6 space-y-4">
        <!-- Category Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">카테고리 이름 *</label>
          <input
            v-model="formData.name"
            type="text"
            required
            maxlength="50"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="예: 프로젝트, 미팅"
          />
        </div>

        <!-- Color Picker -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">색상 *</label>
          <div class="flex space-x-2">
            <button
              v-for="color in colorOptions"
              :key="color"
              type="button"
              @click="formData.color = color"
              class="w-10 h-10 rounded-full border-2 transition transform hover:scale-110"
              :class="formData.color === color ? 'border-gray-800 scale-110' : 'border-gray-300'"
              :style="{ backgroundColor: color }"
            ></button>
          </div>
          <!-- Custom Color Input -->
          <div class="mt-2 flex items-center">
            <label class="text-sm text-gray-600 mr-2">직접 입력:</label>
            <input
              v-model="formData.color"
              type="color"
              class="w-12 h-8 rounded border border-gray-300"
            />
            <span class="ml-2 text-sm text-gray-600">{{ formData.color }}</span>
          </div>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">설명 (선택)</label>
          <textarea
            v-model="formData.description"
            rows="3"
            maxlength="500"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="카테고리에 대한 설명을 입력하세요"
          ></textarea>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="close"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
          >
            취소
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-bold shadow-lg shadow-gray-900/20"
          >
            {{ isNew ? '추가' : '수정' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  isNew: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['save', 'close'])

const colorOptions = [
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#64748B', // Slate
  '#111827'  // Gray-900
]

const formData = ref({
  name: '',
  color: '#3B82F6',
  icon: '',
  description: ''
})

onMounted(() => {
  formData.value = { ...props.category }
})

const save = () => {
  if (!formData.value.name.trim()) {
    alert('카테고리 이름을 입력해주세요.')
    return
  }

  emit('save', formData.value)
}

const close = () => {
  emit('close')
}
</script>
