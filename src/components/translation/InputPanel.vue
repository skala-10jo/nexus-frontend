<template>
  <div class="input-panel">
    <div class="panel-header">
      <h3 class="panel-title">원문</h3>
      <div class="char-counter" :class="{ warning: isNearLimit, danger: isOverLimit }">
        <span class="count">{{ textLength }}</span>
        <span class="separator">/</span>
        <span class="max">{{ maxLength }}</span>
      </div>
    </div>

    <div class="textarea-wrapper">
      <textarea
        ref="textareaRef"
        :value="modelValue"
        @input="handleInput"
        @paste="handlePaste"
        :placeholder="placeholder"
        :maxlength="maxLength"
        class="text-input"
        spellcheck="true"
      ></textarea>

      <button
        v-if="modelValue"
        @click="clearText"
        class="clear-button"
        title="텍스트 지우기"
      >
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

    <div class="action-bar">
      <button
        @click="translate"
        :disabled="!canTranslate || isTranslating"
        class="btn btn-primary btn-large"
      >
        <svg
          v-if="!isTranslating"
          class="btn-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <svg v-else class="btn-icon animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ isTranslating ? '번역 중...' : '번역하기' }}</span>
        <kbd v-if="!isTranslating" class="keyboard-hint">Ctrl+Enter</kbd>
      </button>

      <button
        @click="pasteFromClipboard"
        class="btn btn-ghost"
        title="클립보드에서 붙여넣기"
      >
        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <span>붙여넣기</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '번역할 텍스트를 입력하세요...'
  },
  maxLength: {
    type: Number,
    default: 5000
  },
  isTranslating: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'translate', 'clear', 'paste'])

const textareaRef = ref(null)

const textLength = computed(() => props.modelValue.length)
const isNearLimit = computed(() => textLength.value > props.maxLength * 0.9)
const isOverLimit = computed(() => textLength.value >= props.maxLength)
const canTranslate = computed(() => textLength.value > 0 && !props.isTranslating)

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}

function handlePaste(event) {
  emit('paste', event)
}

function clearText() {
  emit('update:modelValue', '')
  emit('clear')
  textareaRef.value?.focus()
}

function translate() {
  if (canTranslate.value) {
    emit('translate')
  }
}

async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText()
    emit('update:modelValue', props.modelValue + text)
    emit('paste', { clipboardData: { getData: () => text } })
  } catch (error) {
    console.error('Failed to read clipboard:', error)
  }
}

function handleKeydown(event) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    event.preventDefault()
    translate()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.input-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  width: 100%;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.char-counter {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #6B7280;
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;
}

.char-counter.warning {
  color: #F59E0B;
}

.char-counter.danger {
  color: #EF4444;
  font-weight: 600;
}

.count {
  font-weight: 500;
}

.separator {
  opacity: 0.5;
}

.textarea-wrapper {
  position: relative;
  flex: 1;
  min-height: 480px;
  display: flex;
}

.text-input {
  width: 100%;
  height: 100%;
  padding: 1.25rem;
  font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.8;
  color: #111827;
  background-color: #FAFBFC;
  border: 2px solid #E5E7EB;
  border-radius: 0.875rem;
  resize: none;
  transition: all 0.2s ease;
}

.text-input::placeholder {
  color: #9CA3AF;
  font-size: 1rem;
}

.text-input:hover {
  border-color: #9CA3AF;
  background-color: #FFFFFF;
}

.text-input:focus {
  outline: none;
  border-color: #2563EB;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
}

.clear-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  background-color: #F3F4F6;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
}

.clear-button:hover {
  opacity: 1;
  color: #EF4444;
  background-color: #FEE2E2;
}

.clear-button svg {
  width: 1rem;
  height: 1rem;
}

.action-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding-top: 0.5rem;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;
  white-space: nowrap;
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.btn-large {
  padding: 0.75rem 1.75rem;
  font-size: 0.9375rem;
  min-width: 120px;
}

.btn-ghost {
  color: #6B7280;
  background-color: #FFFFFF;
  border: 1.5px solid #D1D5DB;
  min-width: 110px;
}

.btn-ghost:hover:not(:disabled) {
  color: #2563EB;
  border-color: #2563EB;
  background-color: #EFF6FF;
  transform: translateY(-1px);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.keyboard-hint {
  padding: 0.125rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #93C5FD;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 0.25rem;
  margin-left: 0.5rem;
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

/* Responsive */
@media (max-width: 640px) {
  .action-bar {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .keyboard-hint {
    display: none;
  }
}
</style>
