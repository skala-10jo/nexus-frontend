<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Welcome Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-2">
          Welcome, {{ user?.fullName }}!
        </h2>
        <p class="text-gray-600">
          Get started with your language learning journey
        </p>
      </div>

      <!-- Stats Card -->
      <div class="bg-gradient-to-br from-orange-primary to-orange-light rounded-lg shadow-md p-6 text-white">
        <h3 class="text-lg font-semibold mb-2">Active Projects</h3>
        <p class="text-4xl font-bold">0</p>
      </div>

      <!-- Quick Actions Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div class="space-y-2">
          <router-link
            to="/management/document-upload"
            class="block px-4 py-2 bg-orange-primary text-white rounded hover:bg-orange-medium transition"
          >
            Upload Document
          </router-link>
          <router-link
            to="/translation/text"
            class="block px-4 py-2 bg-orange-primary text-white rounded hover:bg-orange-medium transition"
          >
            Translate Text
          </router-link>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
      <p class="text-gray-600">No recent activity yet. Start using the platform to see your history here.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>
