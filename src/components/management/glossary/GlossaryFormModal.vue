<script setup>
/**
 * 용어사전 용어 추가/수정 모달 컴포넌트
 * @description 용어 폼 입력 및 저장
 */
import { XMarkIcon } from '@heroicons/vue/24/solid'

defineProps({
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
  /** 폼 데이터 */
  form: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  /** 모달 닫기 */
  'close',
  /** 저장 */
  'save',
  /** 폼 필드 업데이트 */
  'update:form'
])

const updateField = (field, value) => {
  emit('update:form', { ...emit.form, [field]: value })
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[85vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h3 class="text-lg font-bold text-gray-900">
            {{ isEditMode ? '용어 수정' : '새 용어 추가' }}
          </h3>
          <button
            @click="emit('close')"
            class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-6 overflow-y-auto custom-scrollbar">
          <form @submit.prevent="emit('save')" class="space-y-6">
            <!-- Row 1: Korean, English -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">한국어 용어 <span class="text-red-500">*</span></label>
                <input
                  :value="form.koreanTerm"
                  @input="$emit('update:form', { ...form, koreanTerm: $event.target.value })"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="예: 인공지능"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">영어 용어 <span class="text-red-500">*</span></label>
                <input
                  :value="form.englishTerm"
                  @input="$emit('update:form', { ...form, englishTerm: $event.target.value })"
                  type="text"
                  required
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="예: Artificial Intelligence"
                />
              </div>
            </div>

            <!-- Row 2: Vietnamese, Japanese, Chinese -->
            <div class="grid grid-cols-3 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">베트남어</label>
                <input
                  :value="form.vietnameseTerm"
                  @input="$emit('update:form', { ...form, vietnameseTerm: $event.target.value })"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">일본어</label>
                <input
                  :value="form.japaneseTerm"
                  @input="$emit('update:form', { ...form, japaneseTerm: $event.target.value })"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">중국어</label>
                <input
                  :value="form.chineseTerm"
                  @input="$emit('update:form', { ...form, chineseTerm: $event.target.value })"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <!-- Row 3: Abbreviation, Domain -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">약어</label>
                <input
                  :value="form.abbreviation"
                  @input="$emit('update:form', { ...form, abbreviation: $event.target.value })"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div class="space-y-1.5">
                <label class="text-[10px] font-bold text-gray-500 uppercase">도메인</label>
                <input
                  :value="form.domain"
                  @input="$emit('update:form', { ...form, domain: $event.target.value })"
                  type="text"
                  class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <!-- Definition -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-500 uppercase">정의</label>
              <textarea
                :value="form.definition"
                @input="$emit('update:form', { ...form, definition: $event.target.value })"
                rows="3"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                placeholder="용어의 정의..."
              ></textarea>
            </div>

            <!-- Context -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-500 uppercase">문맥</label>
              <textarea
                :value="form.context"
                @input="$emit('update:form', { ...form, context: $event.target.value })"
                rows="2"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Example Sentence -->
            <div class="space-y-1.5">
              <label class="text-[10px] font-bold text-gray-500 uppercase">예문</label>
              <textarea
                :value="form.exampleSentence"
                @input="$emit('update:form', { ...form, exampleSentence: $event.target.value })"
                rows="2"
                class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
              ></textarea>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
          <button
            @click="emit('close')"
            class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all"
          >
            취소
          </button>
          <button
            @click="emit('save')"
            class="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition-all"
          >
            {{ isEditMode ? '저장' : '생성' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
