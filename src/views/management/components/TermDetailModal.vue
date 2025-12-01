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
              <BookOpenIcon class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900">용어 상세정보</h3>
              <p class="text-xs text-slate-500">{{ term.koreanTerm }}</p>
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

      <!-- Content -->
      <div class="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
        <!-- Status & Verification Badges -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <span :class="getStatusBadgeClass(term.status)">
            {{ getStatusLabel(term.status) }}
          </span>
          <span v-if="term.isVerified" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-600 ring-1 ring-inset ring-secondary-500/20">
            <CheckCircleIcon class="w-4 h-4" />
            검증됨
          </span>
          <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-300/50">
            <XCircleIcon class="w-4 h-4" />
            미검증
          </span>
        </div>

        <!-- Term Languages - Card Style -->
        <div class="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-5 mb-6 border border-slate-200/50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <!-- Korean -->
            <div class="group">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-400 to-primary-500 flex items-center justify-center">
                  <span class="text-[10px] font-bold text-white">KO</span>
                </div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">한국어</p>
              </div>
              <p class="text-base font-semibold text-slate-900">{{ term.koreanTerm }}</p>
            </div>
            <!-- English -->
            <div class="group">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-secondary-400 to-secondary-500 flex items-center justify-center">
                  <span class="text-[10px] font-bold text-white">EN</span>
                </div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">영어</p>
              </div>
              <p class="text-base font-semibold text-slate-900">{{ term.englishTerm || '-' }}</p>
            </div>
            <!-- Vietnamese -->
            <div class="group">
              <div class="flex items-center gap-2 mb-2">
                <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-accent-400 to-accent-500 flex items-center justify-center">
                  <span class="text-[10px] font-bold text-white">VI</span>
                </div>
                <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">베트남어</p>
              </div>
              <p class="text-base font-semibold text-slate-900">{{ term.vietnameseTerm || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Details Grid -->
        <div class="space-y-5">
          <!-- Abbreviation & Domain -->
          <div class="grid grid-cols-2 gap-4" v-if="term.abbreviation || term.domain">
            <div v-if="term.abbreviation" class="group">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">약어</p>
              <span class="inline-flex items-center px-3 py-1.5 text-sm font-mono bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                {{ term.abbreviation }}
              </span>
            </div>
            <div v-if="term.domain" class="group">
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">도메인</p>
              <span class="inline-flex items-center px-3 py-1.5 text-sm bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 rounded-lg border border-primary-200/50">
                {{ term.domain }}
              </span>
            </div>
          </div>

          <!-- Definition -->
          <div v-if="term.definition" class="group">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">정의</p>
            <p class="text-sm text-slate-700 whitespace-pre-wrap bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 leading-relaxed">
              {{ term.definition }}
            </p>
          </div>

          <!-- Context -->
          <div v-if="term.context" class="group">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">문맥</p>
            <p class="text-sm text-slate-700 whitespace-pre-wrap bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50 leading-relaxed">
              {{ term.context }}
            </p>
          </div>

          <!-- Example Sentence -->
          <div v-if="term.exampleSentence" class="group">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">예문</p>
            <div class="relative">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary-400 to-secondary-500 rounded-full"></div>
              <p class="text-sm text-slate-700 whitespace-pre-wrap bg-gradient-to-br from-secondary-50 to-white rounded-xl p-4 pl-6 border border-secondary-200/50 italic leading-relaxed">
                "{{ term.exampleSentence }}"
              </p>
            </div>
          </div>

          <!-- Note -->
          <div v-if="term.note" class="group">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">참고사항</p>
            <div class="relative">
              <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-400 to-accent-500 rounded-full"></div>
              <p class="text-sm text-slate-700 whitespace-pre-wrap bg-gradient-to-br from-accent-50 to-white rounded-xl p-4 pl-6 border border-accent-200/50 leading-relaxed">
                {{ term.note }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-4 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-end gap-3">
        <button
          type="button"
          @click="$emit('close')"
          class="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-300 hover:shadow-md"
        >
          닫기
        </button>
        <button
          @click="$emit('edit')"
          class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl shadow-lg shadow-primary-500/30 transition-all duration-300 hover:shadow-glow-md hover:-translate-y-0.5"
        >
          <PencilSquareIcon class="w-4 h-4 mr-2" />
          수정
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  BookOpenIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  term: {
    type: Object,
    required: true
  }
});

defineEmits(['close', 'edit']);

const getStatusLabel = (status) => {
  const labels = {
    AUTO_EXTRACTED: 'AI 추출',
    USER_ADDED: '사용자 추가',
    USER_EDITED: '편집됨',
    USER_VERIFIED: '검증됨'
  };
  return labels[status] || status;
};

const getStatusBadgeClass = (status) => {
  const classes = {
    AUTO_EXTRACTED: 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-rose-50 to-rose-100 text-rose-600 ring-1 ring-inset ring-rose-500/20',
    USER_ADDED: 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-secondary-50 to-secondary-100 text-secondary-600 ring-1 ring-inset ring-secondary-500/20',
    USER_EDITED: 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-accent-50 to-accent-100 text-accent-600 ring-1 ring-inset ring-accent-500/20',
    USER_VERIFIED: 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 ring-1 ring-inset ring-primary-500/20'
  };
  return classes[status] || 'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20';
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
