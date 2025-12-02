<script setup>
/**
 * 일정 이벤트 생성/수정 모달 컴포넌트
 * @description 일정 생성 및 수정을 위한 폼 모달
 */
import { ref, watch, nextTick } from 'vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import CategorySelector from '@/components/schedule/CategorySelector.vue'

const props = defineProps({
  /** 모달 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 수정 모드 여부 */
  isEditMode: {
    type: Boolean,
    default: false
  },
  /** 폼 데이터 (v-model) */
  modelValue: {
    type: Object,
    required: true
  },
  /** 프로젝트 목록 */
  projects: {
    type: Array,
    default: () => []
  },
  /** 저장 중 상태 */
  saving: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'save',
  'delete',
  'open-category-manager'
])

// Local form state (two-way binding)
const form = ref({ ...props.modelValue })

// Watch for external changes
watch(
  () => props.modelValue,
  async (newVal) => {
    form.value = { ...newVal }
    await nextTick()
    autoResize()
  },
  { deep: true }
)

// Emit changes back to parent
watch(
  form,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true }
)

// Textarea auto-resize
const descriptionTextarea = ref(null)

const autoResize = () => {
  const element = descriptionTextarea.value
  if (element) {
    element.style.height = 'auto'
    element.style.height = element.scrollHeight + 'px'
  }
}

// Watch for modal open to resize textarea
watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      await nextTick()
      autoResize()
    }
  }
)

const handleSubmit = () => {
  emit('save')
}

const handleDelete = () => {
  emit('delete')
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
    @click.self="handleClose"
  >
    <div class="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl shadow-blue-900/20 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/50 transform transition-all scale-100">
      <!-- Modal Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
        <h2 class="text-xl font-bold text-gray-900">
          {{ isEditMode ? '일정 수정' : '새 일정' }}
        </h2>
        <button
          class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors"
          @click="handleClose"
        >
          <XMarkIcon class="w-6 h-6" />
        </button>
      </div>

      <!-- Modal Form -->
      <form class="flex-1 overflow-y-auto" @submit.prevent="handleSubmit">
        <div class="p-8 space-y-6">
          <!-- Title -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">제목 *</label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-5 py-4 border border-gray-200/60 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all bg-gray-50/50 focus:bg-white text-lg font-medium placeholder:text-gray-400"
              placeholder="일정 제목을 입력하세요"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">설명</label>
            <textarea
              ref="descriptionTextarea"
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none bg-gray-50 focus:bg-white overflow-hidden"
              placeholder="일정 설명을 입력하세요"
              @input="autoResize"
            ></textarea>
          </div>

          <!-- All Day Toggle -->
          <div>
            <label class="flex items-center p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                v-model="form.allDay"
                type="checkbox"
                class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-3 text-sm font-medium text-gray-700">종일</span>
            </label>
          </div>

          <!-- Date/Time Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ form.allDay ? '시작 날짜 *' : '시작 시간 *' }}
              </label>
              <input
                v-model="form.startTime"
                :type="form.allDay ? 'date' : 'datetime-local'"
                required
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                {{ form.allDay ? '종료 날짜' : '종료 시간' }}
              </label>
              <input
                v-model="form.endTime"
                :type="form.allDay ? 'date' : 'datetime-local'"
                class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          <!-- Location -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">장소</label>
            <input
              v-model="form.location"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
              placeholder="장소를 입력하세요"
            />
          </div>

          <!-- Project Selector -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">프로젝트</label>
            <select
              v-model="form.projectId"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            >
              <option :value="null">프로젝트 없음</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
          </div>

          <!-- Category Selector -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">카테고리</label>
            <CategorySelector
              v-model="form.categoryIds"
              @open-manager="emit('open-category-manager')"
            />
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-8 py-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
          <button
            v-if="isEditMode"
            type="button"
            class="px-6 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-transparent rounded-xl hover:bg-red-100 transition-all"
            @click="handleDelete"
          >
            삭제
          </button>
          <button
            type="button"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            @click="handleClose"
          >
            취소
          </button>
          <button
            type="submit"
            :disabled="saving"
            class="px-8 py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
