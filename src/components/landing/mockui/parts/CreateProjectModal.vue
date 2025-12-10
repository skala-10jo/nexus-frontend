<template>
  <Transition name="modal">
    <div
      v-if="show"
      ref="overlayRef"
      class="absolute inset-0 z-30 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0.3);"
    >
      <div
        ref="modalRef"
        class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        style="transform: scale(0.9); opacity: 0;"
      >
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-sm font-bold text-gray-900">새 프로젝트</h3>
          <button class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 space-y-4">
          <!-- Project Name -->
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">프로젝트 이름</label>
            <div class="relative">
              <input
                ref="nameInputRef"
                type="text"
                :value="typedName"
                readonly
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50"
                placeholder="프로젝트 이름 입력"
              />
              <span
                v-if="showCursor && isTypingName"
                class="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 animate-pulse"
              ></span>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">설명</label>
            <div class="relative">
              <div
                ref="descInputRef"
                class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-gray-50 h-[72px] overflow-y-auto whitespace-pre-wrap break-words"
              >
                <span v-if="typedDescription">{{ typedDescription }}</span>
                <span v-else class="text-gray-400">프로젝트 설명</span>
              </div>
              <span
                v-if="showCursor && isTypingDesc"
                class="absolute right-3 bottom-3 w-0.5 h-4 bg-blue-500 animate-pulse"
              ></span>
            </div>
          </div>

          <!-- Related Documents -->
          <div>
            <label class="block text-xs font-bold text-gray-600 mb-1.5">관련 문서 연결</label>
            <div class="border border-gray-200 rounded-xl max-h-24 overflow-y-auto">
              <div
                v-for="(doc, index) in documents"
                :key="doc.id"
                :ref="el => docCheckRefs[index] = el"
                class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
              >
                <div class="relative w-4 h-4">
                  <input
                    type="checkbox"
                    :checked="selectedDocs.includes(doc.id)"
                    readonly
                    class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <CheckIcon
                    v-if="selectedDocs.includes(doc.id)"
                    class="absolute inset-0 w-4 h-4 text-blue-600 pointer-events-none check-icon"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-gray-900 truncate">{{ doc.name }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
          <button class="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            취소
          </button>
          <button
            ref="submitBtnRef"
            class="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
            style="transform: scale(1);"
          >
            프로젝트 생성
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { XMarkIcon, CheckIcon } from '@heroicons/vue/24/solid'

defineProps({
  show: { type: Boolean, default: false },
  typedName: { type: String, default: '' },
  typedDescription: { type: String, default: '' },
  documents: { type: Array, default: () => [] },
  selectedDocs: { type: Array, default: () => [] },
  showCursor: { type: Boolean, default: true },
  isTypingName: { type: Boolean, default: false },
  isTypingDesc: { type: Boolean, default: false }
})

const overlayRef = ref(null)
const modalRef = ref(null)
const nameInputRef = ref(null)
const descInputRef = ref(null)
const submitBtnRef = ref(null)
const docCheckRefs = ref([])

defineExpose({
  overlayRef,
  modalRef,
  nameInputRef,
  descInputRef,
  submitBtnRef,
  docCheckRefs
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.check-icon {
  animation: checkPop 0.3s ease-out;
}

@keyframes checkPop {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
