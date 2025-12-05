<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <!-- Galaxy Background -->
    <div class="absolute inset-0">
      <Galaxy
        :mouse-repulsion="true"
        :mouse-interaction="true"
        :density="1.2"
        :glow-intensity="0.4"
        :saturation="0.6"
        :hue-shift="200"
        :twinkle-intensity="0.4"
        :rotation-speed="0.03"
        :transparent="false"
      />
    </div>

    <!-- Content Overlay -->
    <div class="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
      <!-- Branding Section -->
      <div class="text-center mb-10">
        <!-- Project Name -->
        <h1 class="text-7xl md:text-8xl font-bold tracking-tight mb-4"
            style="font-family: 'Space Grotesk', sans-serif !important; text-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);">
          <span class="text-white">Nex</span><span class="text-sky-300">US</span>
        </h1>

        <!-- Slogan with TextType -->
        <div style="font-family: 'Inter', sans-serif !important;">
          <TextType
            :text="['Collaborate Beyond Language']"
            :typingSpeed="50"
            :pauseDuration="3000"
            :showCursor="true"
            cursorCharacter="|"
            :loop="false"
            :initialDelay="600"
            class="text-xl md:text-2xl text-white font-medium tracking-wide"
            style="font-family: 'Inter', sans-serif !important; text-shadow: 0 2px 15px rgba(0, 0, 0, 0.5);"
          />
        </div>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-md">
        <div class="backdrop-blur-2xl bg-white/15 border border-white/25 rounded-3xl shadow-2xl p-8"
             style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white rounded-xl">
            {{ errorMessage }}
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin" class="space-y-5">
            <div>
              <label for="username" class="block text-sm font-medium text-white/80 mb-2">
                ID
              </label>
              <input
                v-model="form.username"
                type="text"
                id="username"
                required
                class="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm"
                placeholder="ID를 입력하세요"
              />
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-white/80 mb-2">
                비밀번호
              </label>
              <input
                v-model="form.password"
                type="password"
                id="password"
                required
                class="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm"
                placeholder="비밀번호를 입력하세요"
              />
            </div>

            <button
              type="submit"
              :disabled="isLoading"
              class="w-full mt-2 bg-white text-gray-800 py-3.5 rounded-xl font-bold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {{ isLoading ? '로그인 중...' : '로그인' }}
            </button>
          </form>

          <!-- Divider -->
          <div class="flex items-center my-6">
            <div class="flex-1 border-t border-white/20"></div>
            <span class="px-4 text-white/50 text-sm">또는</span>
            <div class="flex-1 border-t border-white/20"></div>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <p class="text-white/70">
              계정이 없으신가요?
              <button
                @click="showRegisterForm = true"
                class="text-white font-semibold hover:underline ml-1 transition"
              >
                회원가입
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showRegisterForm"
          class="fixed inset-0 flex items-center justify-center p-4 z-50"
          @click.self="showRegisterForm = false"
        >
          <!-- Modal Background with Galaxy -->
          <div class="absolute inset-0">
            <Galaxy
              :mouse-repulsion="false"
              :mouse-interaction="true"
              :density="1.0"
              :glow-intensity="0.3"
              :saturation="0.5"
              :hue-shift="200"
              :twinkle-intensity="0.3"
              :rotation-speed="0.02"
              :transparent="false"
            />
          </div>
          <div class="absolute inset-0 bg-black/40"></div>

          <!-- Modal Content -->
          <div class="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto"
               style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-2xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif !important;">회원가입</h2>
              <button
                @click="showRegisterForm = false"
                class="p-2 hover:bg-white/10 rounded-full transition text-white/70 hover:text-white"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Error Message -->
            <div v-if="registerError" class="mb-4 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 text-white rounded-xl">
              {{ registerError }}
            </div>

            <form @submit.prevent="handleRegister" class="space-y-4">
              <div>
                <label for="reg-username" class="block text-sm font-medium text-white/80 mb-2">
                  ID
                </label>
                <input
                  v-model="registerForm.username"
                  type="text"
                  id="reg-username"
                  required
                  :class="[
                    'w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm',
                    validation.username.message && (validation.username.exists ? 'border-red-400/50' : 'border-green-400/50'),
                    !validation.username.message && 'border-white/20'
                  ]"
                  placeholder="ID를 입력하세요"
                />
                <p v-if="validation.username.message" :class="[
                  'text-xs mt-1',
                  validation.username.exists ? 'text-red-400' : 'text-green-400'
                ]">
                  {{ validation.username.checking ? '확인 중...' : validation.username.message }}
                </p>
              </div>

              <div>
                <label for="reg-email" class="block text-sm font-medium text-white/80 mb-2">
                  이메일
                </label>
                <input
                  v-model="registerForm.email"
                  type="email"
                  id="reg-email"
                  required
                  :class="[
                    'w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm',
                    validation.email.message && (validation.email.exists || validation.email.message.includes('올바른') ? 'border-red-400/50' : 'border-green-400/50'),
                    !validation.email.message && 'border-white/20'
                  ]"
                  placeholder="example@email.com"
                />
                <p v-if="validation.email.message" :class="[
                  'text-xs mt-1',
                  validation.email.exists || validation.email.message.includes('올바른') ? 'text-red-400' : 'text-green-400'
                ]">
                  {{ validation.email.checking ? '확인 중...' : validation.email.message }}
                </p>
              </div>

              <div>
                <label for="reg-fullname" class="block text-sm font-medium text-white/80 mb-2">
                  이름
                </label>
                <input
                  v-model="registerForm.fullName"
                  type="text"
                  id="reg-fullname"
                  required
                  class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm"
                  placeholder="홍길동"
                />
              </div>

              <div>
                <label for="reg-password" class="block text-sm font-medium text-white/80 mb-2">
                  비밀번호
                </label>
                <input
                  v-model="registerForm.password"
                  type="password"
                  id="reg-password"
                  required
                  minlength="8"
                  :class="[
                    'w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm',
                    validation.password.message && (validation.password.valid ? 'border-green-400/50' : 'border-red-400/50'),
                    !validation.password.message && 'border-white/20'
                  ]"
                  placeholder="최소 8자"
                />
                <p v-if="validation.password.message" :class="[
                  'text-xs mt-1',
                  validation.password.valid ? 'text-green-400' : 'text-red-400'
                ]">
                  {{ validation.password.message }}
                </p>
                <p v-else class="text-xs text-white/50 mt-1">
                  대문자, 소문자, 숫자를 포함해야 합니다
                </p>
              </div>

              <div>
                <label for="reg-password-confirm" class="block text-sm font-medium text-white/80 mb-2">
                  비밀번호 확인
                </label>
                <input
                  v-model="registerForm.passwordConfirm"
                  type="password"
                  id="reg-password-confirm"
                  required
                  minlength="8"
                  :class="[
                    'w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-white/30 focus:border-transparent outline-none transition backdrop-blur-sm',
                    validation.passwordConfirm.message && (validation.passwordConfirm.valid ? 'border-green-400/50' : 'border-red-400/50'),
                    !validation.passwordConfirm.message && 'border-white/20'
                  ]"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <p v-if="validation.passwordConfirm.message" :class="[
                  'text-xs mt-1',
                  validation.passwordConfirm.valid ? 'text-green-400' : 'text-red-400'
                ]">
                  {{ validation.passwordConfirm.message }}
                </p>
              </div>

              <button
                type="submit"
                :disabled="isRegistering"
                class="w-full mt-2 bg-white text-gray-800 py-3 rounded-xl font-bold hover:bg-white/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {{ isRegistering ? '가입 중...' : '회원가입' }}
              </button>
            </form>

            <!-- Back to Login -->
            <div class="mt-6 text-center">
              <p class="text-white/70">
                이미 계정이 있으신가요?
                <button
                  @click="showRegisterForm = false"
                  class="text-white font-semibold hover:underline ml-1 transition"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import Galaxy from '@/components/common/effects/Galaxy.vue';
import TextType from '@/components/common/effects/TextType.vue';

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

<style scoped>
/* Modal Transition */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95) translateY(20px);
}

/* Custom scrollbar for modal */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
