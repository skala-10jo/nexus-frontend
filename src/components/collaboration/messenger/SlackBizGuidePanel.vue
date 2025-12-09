<script setup>
/**
 * SlackBizGuidePanel Component
 * Biz Guide AI 초안 작성 사이드 패널
 */
import { ref } from 'vue'

const props = defineProps({
  /** 패널 표시 여부 */
  show: {
    type: Boolean,
    required: true
  },
  /** 현재 초안 */
  currentDraft: {
    type: String,
    default: null
  },
  /** RAG 참고 표현 */
  suggestions: {
    type: Array,
    default: () => []
  },
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'close',
  'generate',
  'use-draft'
])

const intentInput = ref('')

const handleGenerate = () => {
  if (!intentInput.value.trim()) return
  emit('generate', intentInput.value)
}

const handleUseDraft = () => {
  emit('use-draft', props.currentDraft)
  intentInput.value = ''
}

const handleKeyEnter = (e) => {
  if (e.ctrlKey || e.metaKey) {
    handleGenerate()
  }
}
</script>

<template>
  <transition name="slide-left">
    <div
      v-if="show"
      class="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl flex flex-col border-l border-gray-100 z-50 font-sans"
    >
      <!-- Header -->
      <div class="p-5 bg-white/90 backdrop-blur-md border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 flex items-center justify-center">
            <img
              src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png"
              alt="BizGuide"
              class="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h3 class="font-bold text-gray-900 text-lg leading-tight tracking-tight">Biz Guide</h3>
            <p class="text-xs text-gray-500 font-medium">비즈니스 표현으로 초안을 작성해드려요</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all p-2 rounded-xl active:scale-95"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/50 scroll-smooth">
        <!-- Input Section -->
        <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            작성하고 싶은 내용을 알려주세요
          </label>
          <textarea
            v-model="intentInput"
            @keydown.ctrl.enter="handleGenerate"
            @keydown.meta.enter="handleGenerate"
            placeholder="예: 회의 일정 조율 요청, 프로젝트 진행 상황 보고, 휴가 신청..."
            rows="3"
            class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 text-sm bg-gray-50/50 focus:bg-white transition-all resize-none placeholder-gray-400"
          ></textarea>
          <div class="flex justify-between items-center mt-3">
            <span class="text-xs text-gray-400">Ctrl+Enter로 생성</span>
            <button
              @click="handleGenerate"
              :disabled="!intentInput.trim() || loading"
              class="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 transform flex items-center gap-2"
            >
              <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{{ loading ? '생성 중...' : '초안 생성' }}</span>
            </button>
          </div>
        </div>

        <!-- Generated Draft -->
        <div v-if="currentDraft" class="space-y-4">
          <div class="bg-white rounded-2xl border border-purple-100 overflow-hidden shadow-sm">
            <div class="px-4 py-3 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span class="text-sm font-bold text-purple-700">생성된 초안</span>
              </div>
              <button
                @click="handleUseDraft"
                class="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition shadow-sm hover:shadow-md active:scale-95"
              >
                메시지에 사용
              </button>
            </div>
            <div class="p-4">
              <div class="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {{ currentDraft }}
              </div>
            </div>
          </div>

          <!-- Suggestions -->
          <div v-if="suggestions.length > 0" class="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div class="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span class="text-sm font-bold text-amber-700">참고된 비즈니스 표현</span>
            </div>
            <div class="p-4 space-y-3">
              <div
                v-for="(suggestion, idx) in suggestions.slice(0, 5)"
                :key="idx"
                class="bg-gray-50 rounded-xl p-3 border border-gray-100"
              >
                <p class="text-sm text-gray-700 leading-relaxed">
                  "{{ suggestion.text.slice(0, 150) }}{{ suggestion.text.length > 150 ? '...' : '' }}"
                </p>
                <div v-if="suggestion.chapter || suggestion.section" class="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <span v-if="suggestion.chapter" class="bg-gray-200 px-2 py-0.5 rounded">{{ suggestion.chapter }}</span>
                  <span v-if="suggestion.section">{{ suggestion.section }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!loading" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p class="text-gray-500 text-sm">작성하고 싶은 내용을 입력하면<br/>Biz Guide를 참고한 초안을 생성해드려요</p>
        </div>

        <!-- Loading State -->
        <div v-if="loading && !currentDraft" class="text-center py-12">
          <div class="w-20 h-20 mx-auto mb-4 bg-purple-50 rounded-full flex items-center justify-center">
            <svg class="w-10 h-10 text-purple-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
          </div>
          <p class="text-gray-500 text-sm">Biz Guide에서 적절한 표현을 찾고 있어요...</p>
        </div>
      </div>

      <!-- Tips -->
      <div class="p-4 bg-gray-50 border-t border-gray-100">
        <div class="flex items-start gap-2 text-xs text-gray-500">
          <svg class="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>RAG(Retrieval-Augmented Generation)를 통해 Biz Guide의 비즈니스 표현을 참고하여 초안을 작성합니다.</p>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
