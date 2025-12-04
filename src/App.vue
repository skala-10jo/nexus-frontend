<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <div v-if="isAuthenticated" class="flex h-screen overflow-hidden">
      <Sidebar />
      <main class="flex-1 bg-white shadow-sm overflow-hidden
        m-0 rounded-none
        md:m-4 md:ml-0 md:rounded-[2.5rem]">
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
import Sidebar from '@/components/Sidebar.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);

onMounted(async () => {
  await authStore.initAuth();
});
</script>
