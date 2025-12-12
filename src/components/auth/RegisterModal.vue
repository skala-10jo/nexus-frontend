<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 flex items-center justify-center p-4 z-50"
        @click.self="$emit('close')"
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
        <div
          class="relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-md p-8 max-h-[90vh] overflow-y-auto"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);"
        >
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-white" style="font-family: 'Space Grotesk', sans-serif !important;">
              회원가입
            </h2>
            <button
              @click="$emit('close')"
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

          <!-- Register Form -->
          <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Username -->
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

            <!-- Email -->
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

            <!-- Full Name -->
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

            <!-- Password -->
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

            <!-- Password Confirm -->
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

            <!-- Submit Button -->
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
                @click="$emit('close')"
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
</template>

<script setup>
import { watch } from 'vue'
import { useRegisterForm } from '@/composables/auth/useRegisterForm'
import Galaxy from '@/components/common/effects/Galaxy.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

// Use composable for form logic
const {
  registerForm,
  isRegistering,
  registerError,
  validation,
  handleRegister,
  resetForm
} = useRegisterForm(emit)

// Reset form when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
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
