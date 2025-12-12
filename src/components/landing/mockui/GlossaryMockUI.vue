<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">문서 · 전문용어 사전</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-4 space-y-4 bg-gray-50/50 min-h-[400px]">
      <!-- Document Upload Section -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <DocumentTextIcon class="w-4 h-4 text-blue-500" />
          <h2 class="text-sm font-bold text-gray-900">문서 관리</h2>
          <span class="text-xs text-gray-400">({{ uploadedDocs.length }})</span>
        </div>

        <!-- Dropzone -->
        <div class="p-4">
          <div
            ref="dropzoneRef"
            class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300"
            :class="dropzoneClass"
          >
            <div
              ref="flyingFileRef"
              v-show="animationPhase === 'file-flying'"
              class="absolute"
              style="left: 50%; top: -40px; transform: translateX(-50%); opacity: 0;"
            >
              <DocumentIcon class="w-10 h-10 text-blue-500" />
            </div>

            <CloudArrowUpIcon
              class="w-10 h-10 mx-auto mb-2 transition-all duration-300"
              :class="isDragActive ? 'text-blue-500 scale-110' : 'text-gray-400'"
            />
            <p class="text-sm font-medium text-gray-700">
              {{ isDragActive ? '파일을 여기에 놓으세요' : '문서를 드래그하거나 클릭' }}
            </p>
            <span class="text-xs text-gray-400">PDF, DOCX, TXT (최대 50MB)</span>

            <div
              v-if="animationPhase === 'uploading'"
              class="mt-4 w-full bg-gray-200 rounded-full h-2 overflow-hidden"
            >
              <div
                ref="progressBarRef"
                class="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full progress-glow"
                style="width: 0%"
              ></div>
            </div>
          </div>
        </div>

        <!-- Document Table -->
        <div v-if="uploadedDocs.length > 0" class="border-t border-gray-100">
          <table class="w-full text-sm">
            <thead class="bg-gray-50/95">
              <tr class="text-left border-b border-gray-100">
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">파일명</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">크기</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">상태</th>
                <th class="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase">작업</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="doc in uploadedDocs"
                :key="doc.id"
                ref="docRowRef"
                class="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                style="opacity: 0; transform: translateX(-20px);"
              >
                <td class="px-4 py-2">
                  <div class="flex items-center gap-2">
                    <span>📄</span>
                    <span class="text-sm font-medium text-gray-900">{{ doc.filename }}</span>
                  </div>
                </td>
                <td class="px-3 py-2 text-sm text-gray-500">{{ doc.size }}</td>
                <td class="px-3 py-2">
                  <span class="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase bg-green-100 text-green-700">
                    처리완료
                  </span>
                </td>
                <td class="px-3 py-2">
                  <button
                    ref="extractBtnRef"
                    v-if="showExtractBtn"
                    class="flex items-center gap-1 px-2 py-1 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded text-[10px] font-bold"
                    style="opacity: 0; transform: scale(0.8);"
                  >
                    <SparklesIcon class="w-3 h-3" />
                    용어 추출
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Terms Section -->
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div class="px-4 py-2.5 flex items-center gap-2 border-b border-gray-100">
          <BookOpenIcon class="w-4 h-4 text-blue-500" />
          <h2 class="text-sm font-bold text-gray-900">전문용어 사전</h2>
          <span class="text-xs text-gray-400">({{ visibleTerms.length }})</span>
        </div>

        <!-- Scan Line Overlay -->
        <div
          v-if="animationPhase === 'scanning'"
          class="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        >
          <div ref="scanLineRef" class="scan-line" style="top: 0;"></div>
        </div>

        <!-- Terms Table -->
        <div class="relative">
          <!-- Floating Terms -->
          <div
            v-if="animationPhase === 'extracting'"
            class="absolute inset-0 z-10 p-4"
          >
            <div
              v-for="(term, index) in floatingTerms"
              :key="term.id"
              :ref="el => floatingTermRefs[index] = el"
              class="absolute text-sm font-medium text-blue-600"
              :style="getFloatingInitialStyle(index)"
            >
              {{ term.korean }}
            </div>
          </div>

          <table v-if="visibleTerms.length > 0" class="w-full text-sm">
            <thead class="bg-gray-50/95 sticky top-0">
              <tr class="text-left border-b border-gray-100">
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">한국어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">영어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">베트남어</th>
                <th class="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase">상태</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr
                v-for="(term, index) in visibleTerms"
                :key="term.id"
                :ref="el => termRowRefs[index] = el"
                class="hover:bg-blue-50/30 transition-colors cursor-pointer"
                :class="{ 'bg-blue-50/50 ring-2 ring-blue-300': selectedTerm?.id === term.id }"
                style="opacity: 0; transform: translateY(-10px);"
                @click="selectTerm(term)"
              >
                <td class="px-4 py-2">
                  <span class="text-sm font-bold text-gray-900 hover:text-blue-600">{{ term.korean }}</span>
                </td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ term.english }}</td>
                <td class="px-4 py-2 text-sm text-gray-600">{{ term.vietnamese }}</td>
                <td class="px-4 py-2">
                  <span
                    class="px-1.5 py-0.5 text-[10px] font-bold rounded uppercase"
                    :class="term.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                  >
                    {{ term.isVerified ? '검증' : 'AI추출' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-else class="py-8 text-center text-gray-400">
            <BookOpenIcon class="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">문서에서 용어를 추출하세요</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Glassmorphism Popup -->
    <div
      v-if="showPopup && selectedTerm"
      ref="popupOverlayRef"
      class="absolute inset-0 z-30 flex items-center justify-center p-4"
      style="background: rgba(0,0,0,0); opacity: 0;"
      @click.self="closePopup"
    >
      <div ref="popupRef" class="glassmorphism-popup w-full max-w-sm p-5 rounded-2xl" style="transform: scale(0.9) translateY(20px); opacity: 0;">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold text-gray-900">{{ selectedTerm.korean }}</h3>
          <button
            @click="closePopup"
            class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">영어</span>
            <span class="text-sm text-gray-900">{{ selectedTerm.english }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">베트남어</span>
            <span class="text-sm text-gray-900">{{ selectedTerm.vietnamese }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">정의</span>
            <span class="text-sm text-gray-700">{{ selectedTerm.definition }}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold text-gray-400 w-16">상태</span>
            <div class="flex items-center gap-1">
              <CheckCircleIcon v-if="selectedTerm.isVerified" class="w-4 h-4 text-green-500" />
              <span
                class="text-xs font-bold"
                :class="selectedTerm.isVerified ? 'text-green-600' : 'text-yellow-600'"
              >
                {{ selectedTerm.isVerified ? '검증완료' : 'AI 자동추출' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * GlossaryMockUI - 용어집 시연 UI 컴포넌트
 *
 * @description 문서 업로드 및 AI 용어 추출 시연
 */
import { ref } from 'vue'
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/solid'
import { useGlossaryAnimation } from '@/composables/landing/useGlossaryAnimation'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Refs
const containerRef = ref(null)
const dropzoneRef = ref(null)
const flyingFileRef = ref(null)
const progressBarRef = ref(null)
const docRowRef = ref(null)
const extractBtnRef = ref(null)
const scanLineRef = ref(null)
const popupOverlayRef = ref(null)
const popupRef = ref(null)

// Animation composable
const {
  animationPhase,
  uploadedDocs,
  visibleTerms,
  floatingTerms,
  selectedTerm,
  showPopup,
  showExtractBtn,
  isDragActive,
  floatingTermRefs,
  termRowRefs,
  dropzoneClass,
  getFloatingInitialStyle,
  selectTerm,
  closePopup
} = useGlossaryAnimation(props, {
  containerRef,
  dropzoneRef,
  flyingFileRef,
  progressBarRef,
  docRowRef,
  extractBtnRef,
  scanLineRef,
  popupOverlayRef,
  popupRef
})
</script>

<style scoped>
.progress-glow {
  box-shadow:
    0 0 10px rgba(59, 130, 246, 0.5),
    0 0 20px rgba(59, 130, 246, 0.3),
    0 0 30px rgba(59, 130, 246, 0.2);
  animation: pulse-glow 0.5s ease-in-out infinite alternate;
}

@keyframes pulse-glow {
  from {
    box-shadow:
      0 0 10px rgba(59, 130, 246, 0.5),
      0 0 20px rgba(59, 130, 246, 0.3);
  }
  to {
    box-shadow:
      0 0 15px rgba(59, 130, 246, 0.7),
      0 0 30px rgba(59, 130, 246, 0.5),
      0 0 40px rgba(59, 130, 246, 0.3);
  }
}

.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #3b82f6, #06b6d4, #3b82f6, transparent);
  box-shadow:
    0 0 10px #3b82f6,
    0 0 20px #3b82f6,
    0 0 30px #06b6d4;
}

.glassmorphism-popup {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
}
</style>
