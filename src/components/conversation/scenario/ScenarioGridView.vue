<template>
  <!-- Desktop Grid View for My Scenarios -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
    <ScenarioCard
      v-for="scenario in scenarios"
      :key="scenario.id"
      :scenario="scenario"
      :projects="projects"
      :schedules="schedules"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
      @start="$emit('start', $event)"
    />
  </div>
</template>

<script setup>
import ScenarioCard from './ScenarioCard.vue'

defineProps({
  scenarios: {
    type: Array,
    required: true
  },
  projects: {
    type: Array,
    default: () => []
  },
  schedules: {
    type: Array,
    default: () => []
  }
})

defineEmits(['edit', 'delete', 'start'])
</script>
