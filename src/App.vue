<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <div v-if="isAuthenticated" class="flex h-screen overflow-hidden">
      <Sidebar v-if="!isMailPage" />
      <main class="flex-1 m-4 ml-0 bg-white rounded-[2.5rem] shadow-sm overflow-hidden">
        <router-view />
      </main>
    </div>
    <div v-else>
      <router-view />
    </div>
    <ToastContainer />
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const authStore = useAuthStore();
const route = useRoute();
const isAuthenticated = computed(() => authStore.isAuthenticated);
const isMailPage = computed(() => route.name === 'Mail');

onMounted(async () => {
  await authStore.initAuth();
});
</script>
