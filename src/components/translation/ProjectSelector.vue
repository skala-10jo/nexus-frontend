<template>
  <div class="project-selector">
    <label class="selector-label">
      <span class="label-text">프로젝트</span>
      <span v-if="contextInfo" class="context-badge">
        컨텍스트 활성화
      </span>
    </label>

    <div class="select-wrapper">
      <select
        :value="modelValue"
        @change="handleChange"
        class="project-select"
        :class="{ 'has-project': modelValue }"
      >
        <option :value="null">프로젝트 선택 (선택사항)</option>
        <option
          v-for="project in projects"
          :key="project.id"
          :value="project.id"
        >
          {{ project.name }}
        </option>
      </select>

      <svg
        class="select-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>

    <p v-if="contextInfo && modelValue" class="context-info">
      📚 {{ contextInfo.documentsCount }}개 문서 ·
      📝 {{ contextInfo.termsCount }}개 용어
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: null
  },
  projects: {
    type: Array,
    default: () => []
  },
  contextInfo: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

function handleChange(event) {
  const value = event.target.value === 'null' ? null : event.target.value
  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style scoped>
.project-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.label-text {
  flex-shrink: 0;
}

.context-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #065F46;
  background-color: #D1FAE5;
  border-radius: 9999px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.project-select {
  appearance: none;
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-size: 1rem;
  color: #111827;
  background-color: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-select:hover {
  border-color: #9CA3AF;
}

.project-select:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.project-select.has-project {
  border-color: #2563EB;
  background-color: #EFF6FF;
}

.select-icon {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #6B7280;
  pointer-events: none;
  transition: transform 0.2s ease;
}

.project-select:focus + .select-icon {
  transform: translateY(-50%) rotate(180deg);
}

.context-info {
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0;
  padding-left: 0.25rem;
}

/* Responsive */
@media (max-width: 640px) {
  .selector-label {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-select {
    font-size: 0.875rem;
  }
}
</style>
