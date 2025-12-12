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
      <div class="flex flex-col items-center mb-10">
        <!-- Project Name with SplitText Animation -->
        <div class="w-full flex justify-center mb-4">
          <SplitText
            text="NexUS"
            class="text-8xl md:text-9xl font-thin text-white tracking-widest"
            :delay="80"
            :duration="0.8"
            ease="power3.out"
            split-type="chars"
            :from="{ opacity: 0, y: 50, rotateX: -90 }"
            :to="{ opacity: 1, y: 0, rotateX: 0 }"
            :auto-play="true"
            text-align="center"
            style="font-family: 'Orbitron', sans-serif !important; text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);"
          />
        </div>

        <!-- Slogan with TextType -->
        <div class="w-full flex justify-center">
          <TextType
            :text="['Collaborate Beyond Languages']"
            :typingSpeed="50"
            :pauseDuration="3000"
            :showCursor="true"
            cursorCharacter="|"
            :loop="false"
            :initialDelay="800"
            class="text-xl md:text-3xl text-gray-200 font-light tracking-wide"
            style="font-family: 'Inter', sans-serif !important; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);"
          />
        </div>
      </div>

      <!-- Login Card -->
      <div class="w-full max-w-md">
        <div
          class="backdrop-blur-2xl bg-white/15 border border-white/25 rounded-3xl shadow-2xl p-8"
          style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);"
        >
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
                @click="openRegister"
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
    <RegisterModal
      :show="showRegisterForm"
      @close="closeRegister"
      @success="handleRegisterSuccess"
    />
  </div>
</template>

<script setup>
import { useLoginPage } from '@/composables/auth/useLoginPage'

// Components
import Galaxy from '@/components/common/effects/Galaxy.vue'
import SplitText from '@/components/common/effects/SplitText.vue'
import TextType from '@/components/common/effects/TextType.vue'
import RegisterModal from '@/components/auth/RegisterModal.vue'

// Use composable for all business logic
const {
  form,
  isLoading,
  errorMessage,
  showRegisterForm,
  handleLogin,
  openRegister,
  closeRegister,
  handleRegisterSuccess
} = useLoginPage()
</script>
