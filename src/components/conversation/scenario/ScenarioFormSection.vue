<template>
  <div class="space-y-6">
    <!-- Title with AI Generate Button -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">제목</label>
        <button
          @click="$emit('generate')"
          :disabled="isGenerating"
          class="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': isGenerating }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ isGenerating ? '생성 중...' : 'AI 자동 생성' }}
        </button>
      </div>
      <input
        :value="formData.title"
        @input="updateField('title', $event.target.value)"
        type="text"
        placeholder="예: 제품 데모 미팅"
        class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all"
      >
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">설명 (요약)</label>
      <textarea
        :value="formData.description"
        @input="updateField('description', $event.target.value)"
        rows="2"
        placeholder="카드에 표시될 간단한 설명을 입력하세요..."
        class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all resize-none"
      ></textarea>
    </div>

    <!-- Scenario Text -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">시나리오 내용 (전체)</label>
      <textarea
        :value="formData.scenarioText"
        @input="updateField('scenarioText', $event.target.value)"
        rows="6"
        placeholder="연습할 전체 시나리오 내용을 입력하세요..."
        class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all resize-none"
      ></textarea>
    </div>

    <!-- Roles -->
    <div class="grid grid-cols-2 gap-6">
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">나의 역할</label>
        <input
          :value="formData.userRole"
          @input="updateField('userRole', $event.target.value)"
          type="text"
          placeholder="예: PM"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all"
        >
      </div>
      <div class="space-y-2">
        <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">상대방(AI) 역할</label>
        <input
          :value="formData.aiRole"
          @input="updateField('aiRole', $event.target.value)"
          type="text"
          placeholder="예: 개발자"
          class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all"
        >
      </div>
    </div>

    <!-- Keywords -->
    <div class="space-y-2">
      <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">키워드 (쉼표로 구분)</label>
      <input
        :value="formData.requiredTerminology"
        @input="updateField('requiredTerminology', $event.target.value)"
        type="text"
        placeholder="예: 애자일, 스프린트, 백로그"
        class="w-full px-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-gray-900 focus:ring-0 rounded-xl font-medium text-gray-900 transition-all"
      >
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: {
    type: Object,
    required: true
  },
  isGenerating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:formData', 'generate'])

function updateField(field, value) {
  emit('update:formData', {
    ...props.formData,
    [field]: value
  })
}
</script>
