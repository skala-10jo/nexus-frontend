<template>
  <Transition name="modal">
    <div
      v-if="job"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      @click.self="handleClose"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="modal-title" class="text-xl font-semibold text-gray-900">용어 추출 진행 중</h2>
          <button
            v-if="isComplete || isFailed"
            @click="handleClose"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <XMarkIcon class="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <!-- Content -->
        <div class="px-6 py-6">
          <!-- Status Icon -->
          <div class="flex items-center justify-center mb-6">
            <div v-if="isPending || isProcessing" class="relative">
              <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-primary"></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <DocumentTextIcon class="w-8 h-8 text-orange-primary" />
              </div>
            </div>
            <div v-else-if="isComplete" class="flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <CheckCircleIcon class="w-10 h-10 text-green-600" />
            </div>
            <div v-else-if="isFailed" class="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <XCircleIcon class="w-10 h-10 text-red-600" />
            </div>
          </div>

          <!-- Status Message -->
          <div class="text-center mb-6">
            <p class="text-lg font-semibold text-gray-900 mb-2">
              {{ statusMessage }}
            </p>
            <p v-if="job.errorMessage" class="text-sm text-red-600 mb-2">
              {{ job.errorMessage }}
            </p>
            <p class="text-sm text-gray-600">
              {{ statusDescription }}
            </p>
          </div>

          <!-- Progress Bar -->
          <div v-if="!isFailed" class="mb-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">진행률</span>
              <span class="text-sm font-semibold text-orange-primary">{{ job.progress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-orange-primary to-orange-medium h-full rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${job.progress}%` }"
              ></div>
            </div>
          </div>

          <!-- Statistics -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-500 mb-1">추출된 용어</p>
              <p class="text-2xl font-bold text-gray-900">{{ job.termsExtracted || 0 }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-500 mb-1">상태</p>
              <div class="flex items-center gap-1 mt-1">
                <span :class="['inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', getStatusClass(job.status)]">
                  <component :is="getStatusIcon(job.status)" class="w-3.5 h-3.5" />
                  {{ getStatusText(job.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div v-if="isComplete || isFailed" class="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            v-if="isFailed"
            @click="handleRetry"
            class="px-4 py-2 text-sm font-medium text-orange-primary hover:bg-orange-50 rounded-lg transition-colors"
          >
            재시도
          </button>
          <button
            @click="handleClose"
            class="px-4 py-2 text-sm font-medium text-white bg-orange-primary hover:bg-orange-medium rounded-lg transition-colors"
          >
            {{ isComplete ? '확인' : '닫기' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import {
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline';

import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/vue/20/solid';

import { useGlossaryStore } from '@/stores/glossary';

const props = defineProps({
  job: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['close', 'retry']);

const glossaryStore = useGlossaryStore();

// Computed
const isPending = computed(() => props.job.status === 'PENDING');
const isProcessing = computed(() => props.job.status === 'PROCESSING');
const isComplete = computed(() => props.job.status === 'COMPLETED');
const isFailed = computed(() => props.job.status === 'FAILED');

const statusMessage = computed(() => {
  if (isPending.value) return '대기 중...';
  if (isProcessing.value) return '용어 추출 중...';
  if (isComplete.value) return '추출 완료!';
  if (isFailed.value) return '추출 실패';
  return '처리 중...';
});

const statusDescription = computed(() => {
  if (isPending.value) return '문서를 분석할 준비를 하고 있습니다.';
  if (isProcessing.value) return 'AI가 문서에서 전문용어를 추출하고 있습니다.';
  if (isComplete.value) return `총 ${props.job.termsExtracted}개의 용어가 추출되었습니다.`;
  if (isFailed.value) return '오류가 발생했습니다. 다시 시도해주세요.';
  return '';
});

// Methods
const handleClose = () => {
  if (isComplete.value || isFailed.value) {
    glossaryStore.clearExtractionJob();
    emit('close');
  }
};

const handleRetry = () => {
  emit('retry');
};

const getStatusIcon = (status) => {
  const icons = {
    PENDING: ClockIcon,
    PROCESSING: ArrowPathIcon,
    COMPLETED: CheckCircleIcon,
    FAILED: XCircleIcon
  };
  return icons[status] || ArrowPathIcon;
};

const getStatusClass = (status) => {
  const classes = {
    PENDING: 'bg-blue-100 text-blue-700',
    PROCESSING: 'bg-yellow-100 text-yellow-700',
    COMPLETED: 'bg-green-100 text-green-700',
    FAILED: 'bg-red-100 text-red-700'
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
};

const getStatusText = (status) => {
  const texts = {
    PENDING: '대기 중',
    PROCESSING: '처리 중',
    COMPLETED: '완료',
    FAILED: '실패'
  };
  return texts[status] || status;
};

// Polling
let pollingInterval = null;

const startPolling = () => {
  if (!props.job?.id) return;

  pollingInterval = setInterval(async () => {
    try {
      await glossaryStore.getExtractionStatus(props.job.id);

      if (isComplete.value || isFailed.value) {
        stopPolling();
      }
    } catch (error) {
      console.error('Polling error:', error);
      stopPolling();
    }
  }, 3000); // Poll every 3 seconds
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Lifecycle
onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  stopPolling();
});
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.2s ease;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
