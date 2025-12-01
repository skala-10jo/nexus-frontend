<template>
  <div
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden animate-scale-in">
      <!-- Header with gradient -->
      <div class="relative px-6 py-5 border-b border-slate-100">
        <div class="absolute inset-0 bg-gradient-to-r from-primary-50 via-secondary-50/50 to-accent-50/30"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <PencilSquareIcon v-if="mode === 'edit'" class="w-5 h-5 text-white" />
              <PlusIcon v-else class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">
                {{ mode === 'edit' ? '용어 수정' : '용어 추가' }}
              </h3>
              <p class="text-xs text-slate-500">필수 정보를 입력해주세요</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-xl transition-all duration-300"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
        <div class="space-y-6">
          <!-- Required Fields Section -->
          <div class="space-y-4">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-2 h-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-400"></div>
              <h4 class="text-sm font-bold text-slate-700">필수 정보</h4>
            </div>

            <!-- Korean Term -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                한국어 용어 <span class="text-rose-500">*</span>
              </label>
              <input
                :value="term.koreanTerm"
                @input="updateField('koreanTerm', $event.target.value)"
                type="text"
                required
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-300 text-sm hover:border-primary-300"
                placeholder="예: 인공지능"
              />
            </div>

            <!-- English Term -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">
                영어 용어 <span class="text-rose-500">*</span>
              </label>
              <input
                :value="term.englishTerm"
                @input="updateField('englishTerm', $event.target.value)"
                type="text"
                required
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none transition-all duration-300 text-sm hover:border-primary-300"
                placeholder="예: Artificial Intelligence"
              />
            </div>
          </div>

          <!-- Optional Fields Section -->
          <div class="space-y-4 pt-6 border-t border-slate-100">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-2 h-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-300"></div>
              <h4 class="text-sm font-medium text-slate-500">추가 정보 (선택)</h4>
            </div>

            <!-- Vietnamese Term -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">베트남어 용어</label>
              <input
                :value="term.vietnameseTerm"
                @input="updateField('vietnameseTerm', $event.target.value)"
                type="text"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 outline-none transition-all duration-300 text-sm hover:border-secondary-300"
                placeholder="예: Trí tuệ nhân tạo"
              />
            </div>

            <!-- Two Column Layout -->
            <div class="grid grid-cols-2 gap-4">
              <!-- Abbreviation -->
              <div class="group">
                <label class="block text-sm font-medium text-slate-700 mb-2">약어</label>
                <input
                  :value="term.abbreviation"
                  @input="updateField('abbreviation', $event.target.value)"
                  type="text"
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 outline-none transition-all duration-300 text-sm hover:border-secondary-300 font-mono"
                  placeholder="예: AI"
                />
              </div>

              <!-- Domain -->
              <div class="group">
                <label class="block text-sm font-medium text-slate-700 mb-2">도메인</label>
                <input
                  :value="term.domain"
                  @input="updateField('domain', $event.target.value)"
                  type="text"
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 outline-none transition-all duration-300 text-sm hover:border-secondary-300"
                  placeholder="예: IT, 의료, 법률"
                />
              </div>
            </div>

            <!-- Definition -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">정의</label>
              <textarea
                :value="term.definition"
                @input="updateField('definition', $event.target.value)"
                rows="3"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 outline-none transition-all duration-300 text-sm resize-none hover:border-secondary-300"
                placeholder="용어의 정의를 입력하세요"
              ></textarea>
            </div>

            <!-- Context -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">문맥</label>
              <textarea
                :value="term.context"
                @input="updateField('context', $event.target.value)"
                rows="2"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-secondary-500/30 focus:border-secondary-500 outline-none transition-all duration-300 text-sm resize-none hover:border-secondary-300"
                placeholder="용어가 사용되는 문맥을 입력하세요"
              ></textarea>
            </div>

            <!-- Example Sentence -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">예문</label>
              <textarea
                :value="term.exampleSentence"
                @input="updateField('exampleSentence', $event.target.value)"
                rows="2"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all duration-300 text-sm resize-none hover:border-accent-300 italic"
                placeholder="용어 사용 예문을 입력하세요"
              ></textarea>
            </div>

            <!-- Note -->
            <div class="group">
              <label class="block text-sm font-medium text-slate-700 mb-2">참고사항</label>
              <textarea
                :value="term.note"
                @input="updateField('note', $event.target.value)"
                rows="2"
                class="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 outline-none transition-all duration-300 text-sm resize-none hover:border-accent-300"
                placeholder="추가 설명 및 참고사항을 입력하세요"
              ></textarea>
            </div>
          </div>
        </div>
      </form>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-md"
        >
          취소
        </button>
        <button
          @click="handleSubmit"
          class="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-glow-md hover:-translate-y-0.5"
        >
          {{ mode === 'edit' ? '저장' : '추가' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, PlusIcon, PencilSquareIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  mode: {
    type: String,
    default: 'add',
    validator: (value) => ['add', 'edit'].includes(value)
  },
  term: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'save', 'update:term']);

const updateField = (field, value) => {
  emit('update:term', { ...props.term, [field]: value });
};

const handleSubmit = () => {
  emit('save');
};
</script>

<style scoped>
.animate-scale-in {
  animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
