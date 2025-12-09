<template>
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- Header -->
        <div class="modal-header">
          <h2 class="modal-title">
            <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            새 언어로 번역
          </h2>
          <button @click="closeModal" class="btn-close">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- 목표 언어 선택 -->
          <div class="form-group">
            <label class="form-label">목표 언어</label>
            <select v-model="targetLanguage" class="form-select">
              <option value="">언어를 선택하세요</option>
              <option
                v-for="lang in availableTargetLanguages"
                :key="lang.code"
                :value="lang.code"
              >
                {{ lang.name }} ({{ lang.code.toUpperCase() }})
              </option>
            </select>
          </div>

          <!-- 프로젝트 컨텍스트 선택 (Text.vue 방식과 동일) -->
          <div class="form-group">
            <label class="form-label">
              프로젝트 컨텍스트 (선택사항)
              <span class="label-optional">선택하면 전문용어가 반영됩니다</span>
            </label>
            <ProjectSelector
              v-model="selectedProjectId"
              :projects="projects"
              :context-info="contextInfo"
              @change="onProjectChange"
            />
          </div>

          <!-- 프로젝트 선택 시 컨텍스트 정보 표시 -->
          <div v-if="selectedProjectId && contextInfo" class="selection-summary">
            프로젝트의 {{ contextInfo.documentsCount }}개 문서에서 {{ contextInfo.termsCount }}개 용어가 번역에 반영됩니다.
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button @click="closeModal" class="btn btn-secondary">취소</button>
          <button
            @click="startTranslation"
            :disabled="!targetLanguage || isTranslating"
            class="btn btn-primary"
          >
            <svg v-if="!isTranslating" class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
            <svg v-else class="btn-icon animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{{ isTranslating ? '번역 중...' : '번역 시작' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProjectSelector from './ProjectSelector.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  availableLanguages: {
    type: Array,
    default: () => []
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'translate'])

// State (Text.vue 방식과 동일)
const targetLanguage = ref('')
const selectedProjectId = ref(null)
const contextInfo = ref(null)
const isTranslating = ref(false)

// 모든 지원 언어
const allLanguages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'zh', name: '中文' }
]

// 선택 가능한 목표 언어 (이미 번역된 언어 제외)
const availableTargetLanguages = computed(() => {
  return allLanguages.filter(
    lang => !props.availableLanguages.includes(lang.code) && lang.code !== props.sourceLanguage
  )
})

// Text.vue와 동일한 방식: projectId로 프로젝트 정보만 표시
function onProjectChange(projectId) {
  if (projectId) {
    const project = props.projects.find(p => p.id === projectId)
    if (project) {
      contextInfo.value = {
        documentsCount: project.documentCount || 0,
        termsCount: project.termCount || 0
      }
    }
  } else {
    contextInfo.value = null
  }
}

function closeModal() {
  // 상태 초기화
  targetLanguage.value = ''
  selectedProjectId.value = null
  contextInfo.value = null
  isTranslating.value = false

  emit('close')
}

async function startTranslation() {
  if (!targetLanguage.value) return

  isTranslating.value = true

  try {
    // projectId 전달 (Text.vue 방식)
    await emit('translate', {
      targetLanguage: targetLanguage.value,
      projectId: selectedProjectId.value
    })

    // 성공 시 모달 닫기
    closeModal()
  } catch (error) {
    console.error('Translation error:', error)
  } finally {
    isTranslating.value = false
  }
}
</script>

<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background-color: #FFFFFF;
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
}

/* Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.title-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: #2563EB;
}

.btn-close {
  padding: 0.5rem;
  color: #6B7280;
  background: none;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background-color: #F3F4F6;
  color: #111827;
}

.btn-close svg {
  width: 1.5rem;
  height: 1.5rem;
}

/* Body */
.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-optional {
  font-size: 0.75rem;
  font-weight: 400;
  color: #6B7280;
}

.form-select {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  color: #111827;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:hover {
  border-color: #9CA3AF;
}

.form-select:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.75rem;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.document-item:hover {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.document-item.selected {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.document-checkbox {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.document-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.document-terms {
  font-size: 0.75rem;
  color: #6B7280;
}

.selection-summary {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #065F46;
  background-color: #D1FAE5;
  border-radius: 0.5rem;
  text-align: center;
}

/* Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  color: #374151;
  background-color: #F3F4F6;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #E5E7EB;
}

.btn-primary {
  color: #FFFFFF;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.35);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: scale(0.9) translateY(-20px);
}

.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .documents-grid {
    grid-template-columns: 1fr;
  }
}
</style>
