<template>
  <div v-if="terms.length > 0" class="detected-terms-bar">
    <div class="terms-header">
      <h4 class="terms-title">
        <svg class="title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
        탐지된 전문용어
        <span class="terms-count">{{ terms.length }}</span>
      </h4>
    </div>

    <div class="terms-list">
      <button
        v-for="(term, index) in terms"
        :key="`term-${index}`"
        @click="handleTermClick(term)"
        class="term-pill"
      >
        <span class="term-text">{{ term.matchedText }}</span>
        <span v-if="term.englishTerm" class="term-sub">{{ term.englishTerm }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  terms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['term-click'])

function handleTermClick(term) {
  emit('term-click', term)
}
</script>

<style scoped>
.detected-terms-bar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #F9FAFB;
  border: 2px solid #E5E7EB;
  border-radius: 0.75rem;
}

.terms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.terms-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.title-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: #F59E0B;
}

.terms-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #FFFFFF;
  background-color: #F59E0B;
  border-radius: 9999px;
}

.terms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.term-pill {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  padding: 0.5rem 0.875rem;
  background-color: #FFFFFF;
  border: 2px solid #FEF3C7;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.term-pill:hover {
  border-color: #F59E0B;
  background-color: #FFFBEB;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2);
}

.term-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
}

.term-sub {
  font-size: 0.75rem;
  color: #6B7280;
}

/* Responsive */
@media (max-width: 640px) {
  .detected-terms-bar {
    padding: 0.75rem;
  }

  .terms-list {
    gap: 0.375rem;
  }

  .term-pill {
    font-size: 0.8125rem;
    padding: 0.375rem 0.75rem;
  }
}
</style>
