<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="term" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3 class="modal-title">전문용어 상세 정보</h3>
            <button @click="close" class="close-button" title="닫기">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- 매칭된 텍스트 -->
            <div class="detail-section">
              <div class="matched-text-badge">
                {{ term.matchedText }}
              </div>
            </div>

            <!-- 다국어 용어 -->
            <div class="detail-section">
              <h4 class="section-title">다국어 표현</h4>
              <div class="language-grid">
                <div v-if="term.koreanTerm" class="language-item">
                  <span class="language-label">🇰🇷 한국어</span>
                  <span class="language-value">{{ term.koreanTerm }}</span>
                </div>
                <div v-if="term.englishTerm" class="language-item">
                  <span class="language-label">🇺🇸 English</span>
                  <span class="language-value">{{ term.englishTerm }}</span>
                </div>
                <div v-if="term.vietnameseTerm" class="language-item">
                  <span class="language-label">🇻🇳 Tiếng Việt</span>
                  <span class="language-value">{{ term.vietnameseTerm }}</span>
                </div>
              </div>
            </div>

            <!-- 정의 -->
            <div v-if="term.definition" class="detail-section">
              <h4 class="section-title">정의</h4>
              <p class="definition-text">{{ term.definition }}</p>
            </div>

            <!-- 분야 -->
            <div v-if="term.domain" class="detail-section">
              <h4 class="section-title">분야</h4>
              <span class="domain-badge">{{ term.domain }}</span>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="close" class="btn btn-primary">
              확인
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  term: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}

function handleOverlayClick() {
  close()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  width: 100%;
  max-width: 32rem;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #6B7280;
  background-color: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  color: #111827;
  background-color: #F3F4F6;
}

.close-button svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.matched-text-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  background-color: #FEF3C7;
  border: 2px solid #F59E0B;
  border-radius: 0.5rem;
  align-self: flex-start;
}

.language-grid {
  display: grid;
  gap: 0.75rem;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: #F9FAFB;
  border-radius: 0.5rem;
}

.language-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  white-space: nowrap;
}

.language-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.definition-text {
  font-size: 1rem;
  line-height: 1.75;
  color: #374151;
  margin: 0;
}

.domain-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1E40AF;
  background-color: #DBEAFE;
  border-radius: 0.5rem;
  align-self: flex-start;
}

.position-info {
  font-size: 0.875rem;
  font-family: 'Fira Code', monospace;
  color: #6B7280;
  margin: 0;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.btn {
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  color: #FFFFFF;
  background-color: #2563EB;
}

.btn-primary:hover {
  background-color: #1D4ED8;
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

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 640px) {
  .modal-container {
    max-height: 85vh;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
