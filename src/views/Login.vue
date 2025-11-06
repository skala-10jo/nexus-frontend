<template>
  <div class="min-h-screen bg-orange-gradient flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p class="text-gray-600">Sign in to continue to Language Platform</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            Username
          </label>
          <input
            v-model="form.username"
            type="text"
            id="username"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none transition"
            placeholder="Enter your username"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none transition"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-orange-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Don't have an account?
          <button
            @click="showRegisterForm = true"
            class="text-orange-primary font-semibold hover:underline"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>

    <!-- Register Modal -->
    <div
      v-if="showRegisterForm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showRegisterForm = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Create Account</h2>
          <button
            @click="showRegisterForm = false"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="registerError" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ registerError }}
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label for="reg-username" class="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              v-model="registerForm.username"
              type="text"
              id="reg-username"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              v-model="registerForm.email"
              type="email"
              id="reg-email"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label for="reg-fullname" class="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              v-model="registerForm.fullName"
              type="text"
              id="reg-fullname"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              id="reg-password"
              required
              minlength="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              placeholder="Min. 8 characters"
            />
            <p class="text-xs text-gray-500 mt-1">
              Must contain uppercase, lowercase, and number
            </p>
          </div>

          <button
            type="submit"
            :disabled="isRegistering"
            class="w-full bg-orange-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {{ isRegistering ? 'Creating Account...' : 'Create Account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  username: '',
  password: ''
});

const registerForm = ref({
  username: '',
  email: '',
  fullName: '',
  password: ''
});

const showRegisterForm = ref(false);
const isLoading = ref(false);
const isRegistering = ref(false);
const errorMessage = ref('');
const registerError = ref('');

const handleLogin = async () => {
  isLoading.value = true;
  errorMessage.value = '';

  const result = await authStore.login(form.value);

  if (result.success) {
    router.push('/');
  } else {
    errorMessage.value = result.error;
  }

  isLoading.value = false;
};

const handleRegister = async () => {
  isRegistering.value = true;
  registerError.value = '';

  const result = await authStore.register(registerForm.value);

  if (result.success) {
    showRegisterForm.value = false;
    router.push('/');
  } else {
    registerError.value = result.error;
  }

  isRegistering.value = false;
};
</script>
