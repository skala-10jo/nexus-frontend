<template>
  <div class="min-h-screen bg-orange-gradient flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h1>
        <p class="text-gray-600">NEXUS에 로그인하세요</p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ errorMessage }}
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
            ID
          </label>
          <input
            v-model="form.username"
            type="text"
            id="username"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none transition"
            placeholder="ID를 입력하세요"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            비밀번호
          </label>
          <input
            v-model="form.password"
            type="password"
            id="password"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none transition"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-orange-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isLoading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <!-- Register Link -->
      <div class="mt-6 text-center">
        <p class="text-gray-600">
          계정이 없으신가요?
          <button
            @click="showRegisterForm = true"
            class="text-orange-primary font-semibold hover:underline"
          >
            회원가입
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
          <h2 class="text-2xl font-bold text-gray-800">회원가입</h2>
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
              ID
            </label>
            <input
              v-model="registerForm.username"
              type="text"
              id="reg-username"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none',
                validation.username.message && (validation.username.exists ? 'border-red-500' : 'border-green-500')
              ]"
              placeholder="ID를 입력하세요"
            />
            <p v-if="validation.username.message" :class="[
              'text-xs mt-1',
              validation.username.exists ? 'text-red-500' : 'text-green-500'
            ]">
              {{ validation.username.checking ? '확인 중...' : validation.username.message }}
            </p>
          </div>

          <div>
            <label for="reg-email" class="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              v-model="registerForm.email"
              type="email"
              id="reg-email"
              required
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none',
                validation.email.message && (validation.email.exists ? 'border-red-500' : 'border-green-500')
              ]"
              placeholder="example@email.com"
            />
            <p v-if="validation.email.message" :class="[
              'text-xs mt-1',
              validation.email.exists || validation.email.message.includes('올바른') ? 'text-red-500' : 'text-green-500'
            ]">
              {{ validation.email.checking ? '확인 중...' : validation.email.message }}
            </p>
          </div>

          <div>
            <label for="reg-fullname" class="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <input
              v-model="registerForm.fullName"
              type="text"
              id="reg-fullname"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label for="reg-password" class="block text-sm font-medium text-gray-700 mb-2">
              비밀번호
            </label>
            <input
              v-model="registerForm.password"
              type="password"
              id="reg-password"
              required
              minlength="8"
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none',
                validation.password.message && (validation.password.valid ? 'border-green-500' : 'border-red-500')
              ]"
              placeholder="최소 8자"
            />
            <p v-if="validation.password.message" :class="[
              'text-xs mt-1',
              validation.password.valid ? 'text-green-500' : 'text-red-500'
            ]">
              {{ validation.password.message }}
            </p>
            <p v-else class="text-xs text-gray-500 mt-1">
              대문자, 소문자, 숫자를 포함해야 합니다
            </p>
          </div>

          <div>
            <label for="reg-password-confirm" class="block text-sm font-medium text-gray-700 mb-2">
              비밀번호 확인
            </label>
            <input
              v-model="registerForm.passwordConfirm"
              type="password"
              id="reg-password-confirm"
              required
              minlength="8"
              :class="[
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none',
                validation.passwordConfirm.message && (validation.passwordConfirm.valid ? 'border-green-500' : 'border-red-500')
              ]"
              placeholder="비밀번호를 다시 입력하세요"
            />
            <p v-if="validation.passwordConfirm.message" :class="[
              'text-xs mt-1',
              validation.passwordConfirm.valid ? 'text-green-500' : 'text-red-500'
            ]">
              {{ validation.passwordConfirm.message }}
            </p>
          </div>

          <button
            type="submit"
            :disabled="isRegistering"
            class="w-full bg-orange-gradient text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {{ isRegistering ? '가입 중...' : '회원가입' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

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
  password: '',
  passwordConfirm: ''
});

const showRegisterForm = ref(false);
const isLoading = ref(false);
const isRegistering = ref(false);
const errorMessage = ref('');
const registerError = ref('');

// Validation states
const validation = ref({
  username: { checking: false, exists: false, message: '' },
  email: { checking: false, exists: false, message: '' },
  password: { valid: false, message: '' },
  passwordConfirm: { valid: false, message: '' }
});

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// Debounce timer
let usernameTimer = null;
let emailTimer = null;

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
  // Validate before submit
  if (validation.value.username.exists) {
    registerError.value = '이미 사용 중인 ID입니다';
    return;
  }

  if (validation.value.email.exists) {
    registerError.value = '이미 사용 중인 이메일입니다';
    return;
  }

  if (!validation.value.password.valid) {
    registerError.value = '비밀번호 규칙을 확인하세요';
    return;
  }

  if (!validation.value.passwordConfirm.valid) {
    registerError.value = '비밀번호가 일치하지 않습니다';
    return;
  }

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

// Check username availability
const checkUsername = async (username) => {
  if (!username || username.length < 3) {
    validation.value.username.message = 'ID는 3자 이상이어야 합니다';
    return;
  }

  validation.value.username.checking = true;

  try {
    const response = await axios.get(`http://localhost:3000/api/auth/check-username?username=${username}`);
    validation.value.username.exists = response.data.data.exists;

    if (validation.value.username.exists) {
      validation.value.username.message = '이미 사용 중인 ID입니다';
    } else {
      validation.value.username.message = '사용 가능한 ID입니다';
    }
  } catch (error) {
    validation.value.username.message = '확인 중 오류가 발생했습니다';
  } finally {
    validation.value.username.checking = false;
  }
};

// Check email availability
const checkEmail = async (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    validation.value.email.message = '올바른 이메일 형식이 아닙니다';
    return;
  }

  validation.value.email.checking = true;

  try {
    const response = await axios.get(`http://localhost:3000/api/auth/check-email?email=${email}`);
    validation.value.email.exists = response.data.data.exists;

    if (validation.value.email.exists) {
      validation.value.email.message = '이미 사용 중인 이메일입니다';
    } else {
      validation.value.email.message = '사용 가능한 이메일입니다';
    }
  } catch (error) {
    validation.value.email.message = '확인 중 오류가 발생했습니다';
  } finally {
    validation.value.email.checking = false;
  }
};

// Validate password
const validatePassword = (password) => {
  if (!password) {
    validation.value.password.valid = false;
    validation.value.password.message = '';
    return;
  }

  if (password.length < 8) {
    validation.value.password.valid = false;
    validation.value.password.message = '최소 8자 이상이어야 합니다';
    return;
  }

  if (!passwordRegex.test(password)) {
    validation.value.password.valid = false;
    validation.value.password.message = '대문자, 소문자, 숫자를 포함해야 합니다';
    return;
  }

  validation.value.password.valid = true;
  validation.value.password.message = '안전한 비밀번호입니다';
};

// Watch for input changes
watch(() => registerForm.value.username, (newValue) => {
  clearTimeout(usernameTimer);
  validation.value.username.message = '';

  if (newValue) {
    usernameTimer = setTimeout(() => {
      checkUsername(newValue);
    }, 500);
  }
});

watch(() => registerForm.value.email, (newValue) => {
  clearTimeout(emailTimer);
  validation.value.email.message = '';

  if (newValue) {
    emailTimer = setTimeout(() => {
      checkEmail(newValue);
    }, 500);
  }
});

watch(() => registerForm.value.password, (newValue) => {
  validatePassword(newValue);
  // Re-validate password confirm when password changes
  if (registerForm.value.passwordConfirm) {
    validatePasswordConfirm(registerForm.value.passwordConfirm);
  }
});

watch(() => registerForm.value.passwordConfirm, (newValue) => {
  validatePasswordConfirm(newValue);
});

// Validate password confirmation
const validatePasswordConfirm = (passwordConfirm) => {
  if (!passwordConfirm) {
    validation.value.passwordConfirm.valid = false;
    validation.value.passwordConfirm.message = '';
    return;
  }

  if (passwordConfirm !== registerForm.value.password) {
    validation.value.passwordConfirm.valid = false;
    validation.value.passwordConfirm.message = '비밀번호가 일치하지 않습니다';
    return;
  }

  validation.value.passwordConfirm.valid = true;
  validation.value.passwordConfirm.message = '비밀번호가 일치합니다';
};
</script>
