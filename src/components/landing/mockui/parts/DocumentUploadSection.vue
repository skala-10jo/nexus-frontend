<template>
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
        <!-- Flying File Icon -->
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

        <!-- Progress Bar with Glow -->
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

    <!-- Document Table (appears after upload) -->
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
</template>

<script setup>
import {
  DocumentTextIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  DocumentIcon
} from '@heroicons/vue/24/solid'

defineProps({
  uploadedDocs: { type: Array, required: true },
  animationPhase: { type: String, required: true },
  isDragActive: { type: Boolean, required: true },
  showExtractBtn: { type: Boolean, required: true },
  dropzoneClass: { type: String, required: true }
})

const dropzoneRef = defineModel('dropzoneRef')
const flyingFileRef = defineModel('flyingFileRef')
const progressBarRef = defineModel('progressBarRef')
const docRowRef = defineModel('docRowRef')
const extractBtnRef = defineModel('extractBtnRef')

defineExpose({
  dropzoneRef,
  flyingFileRef,
  progressBarRef,
  docRowRef,
  extractBtnRef
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
</style>
