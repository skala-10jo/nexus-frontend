<template>
  <!-- Desktop Grid View for Business Templates -->
  <div class="grid grid-cols-2 lg:grid-cols-3 gap-6">
    <BusinessScenarioCard
      v-for="template in templates"
      :key="template.id"
      :scenario="template"
      @start="$emit('start', $event)"
      @copy="$emit('copy', $event)"
    />
  </div>
</template>

<script setup>
import BusinessScenarioCard from './BusinessScenarioCard.vue'

defineProps({
  templates: {
    type: Array,
    required: true
  }
})

defineEmits(['start', 'copy'])
</script>
