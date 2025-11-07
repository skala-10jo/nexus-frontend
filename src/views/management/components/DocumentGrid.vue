<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <DocumentCard
      v-for="doc in documents"
      :key="doc.id"
      :document="doc"
      @view="$emit('view', doc)"
      @download="$emit('download', doc)"
      @delete="$emit('delete', doc)"
    />
  </div>
</template>

<script setup>
import DocumentCard from './DocumentCard.vue';

defineProps({
  documents: {
    type: Array,
    required: true
  }
});

defineEmits(['view', 'download', 'delete']);
</script>
