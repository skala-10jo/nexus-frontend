<script setup>
/**
 * Step Guide Modal 컴포넌트
 *
 * 시나리오 시작 전 전체 스텝 가이드를 한 눈에 보여주는 모달입니다.
 * 사용자가 회화 연습을 시작하기 전에 전체 흐름을 파악할 수 있습니다.
 *
 * @props steps - 스텝 배열 [{ id, title, description, terminology? }]
 * @props scenarioTitle - 시나리오 제목
 * @emits close - 모달 닫기
 */
import { computed } from 'vue'
import {
  XMarkIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  RocketLaunchIcon
} from '@heroicons/vue/24/outline'
import { SparklesIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  /** 스텝 목록 */
  steps: {
    type: Array,
    default: () => []
  },
  /** 시나리오 제목 */
  scenarioTitle: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

/**
 * 총 스텝 수
 */
const totalSteps = computed(() => props.steps.length)

/**
 * 모달 닫기
 */
const handleClose = () => {
  emit('close')
}

/**
 * 시작하기 버튼 클릭
 */
const handleStart = () => {
  emit('close')
}
</script>

<template>
  <Transition name="modal">
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click.self="handleClose"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="step-guide-title"
      >
        <!-- Header -->
        <div class="relative px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 shrink-0">
          <!-- Close button -->
          <button
            @click="handleClose"
            class="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/80 transition-colors"
            aria-label="닫기"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>

          <!-- Title area -->
          <div class="flex items-center gap-3 pr-8">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <ChatBubbleLeftRightIcon class="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="step-guide-title" class="text-lg font-bold text-gray-900">
                회화 진행 가이드
              </h2>
              <p class="text-sm text-gray-600 mt-0.5">
                {{ scenarioTitle || '시나리오' }} · {{ totalSteps }}단계
              </p>
            </div>
          </div>
        </div>

        <!-- Content - Scrollable -->
        <div class="flex-1 overflow-y-auto px-6 py-4">
          <!-- Intro message -->
          <div class="mb-5 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div class="flex items-start gap-2">
              <LightBulbIcon class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p class="text-sm text-amber-800 leading-relaxed">
                아래 단계별 가이드를 참고하여 자연스러운 대화를 진행해보세요.
                각 단계가 완료되면 자동으로 다음 단계로 넘어갑니다.
              </p>
            </div>
          </div>

          <!-- Steps list -->
          <div class="space-y-4">
            <div
              v-for="(step, index) in steps"
              :key="step.id || index"
              class="relative"
            >
              <!-- Connecting line -->
              <div
                v-if="index < steps.length - 1"
                class="absolute left-[19px] top-[48px] w-0.5 h-[calc(100%-24px)] bg-gradient-to-b from-blue-200 to-gray-100"
              ></div>

              <!-- Step card -->
              <div class="flex gap-4">
                <!-- Step number circle -->
                <div
                  class="relative shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all"
                  :class="[
                    index === 0
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-200'
                      : 'bg-white text-gray-600 border-2 border-gray-200'
                  ]"
                >
                  {{ index + 1 }}
                  <!-- Sparkle for first step -->
                  <SparklesIcon
                    v-if="index === 0"
                    class="absolute -top-1 -right-1 w-4 h-4 text-amber-400"
                  />
                </div>

                <!-- Step content -->
                <div class="flex-1 pb-2">
                  <h3 class="font-semibold text-gray-900 text-base mb-1.5">
                    {{ step.title }}
                  </h3>
                  <p
                    v-if="step.description"
                    class="text-sm text-gray-600 leading-relaxed"
                  >
                    {{ step.description }}
                  </p>

                  <!-- Terminology tags (if available) -->
                  <div
                    v-if="step.terminology && step.terminology.length > 0"
                    class="mt-2.5 flex flex-wrap gap-1.5"
                  >
                    <span
                      v-for="(term, termIndex) in step.terminology.slice(0, 3)"
                      :key="termIndex"
                      class="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md border border-blue-100"
                    >
                      {{ term }}
                    </span>
                    <span
                      v-if="step.terminology.length > 3"
                      class="inline-flex items-center px-2 py-0.5 text-xs text-gray-500"
                    >
                      +{{ step.terminology.length - 3 }}개
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          <button
            @click="handleStart"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-colors active:scale-[0.98]"
          >
            <RocketLaunchIcon class="w-5 h-5" />
            회화 시작하기
          </button>
          <!-- 재열람 안내 -->
          <p class="mt-3 text-center text-xs text-gray-500">
            상단 진행 바를 클릭하면 언제든 이 가이드를 다시 볼 수 있어요
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active > div,
.modal-leave-active > div {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-enter-from > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-leave-to > div {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}
</style>
