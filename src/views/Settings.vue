<template>
  <div class="p-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-6">Settings</h1>

    <div class="max-w-3xl">
      <!-- Profile Settings -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Profile Settings</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              :value="user?.username"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              :value="user?.email"
              disabled
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              :value="user?.fullName"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
            <input
              type="url"
              :value="user?.avatarUrl || ''"
              placeholder="https://example.com/avatar.jpg"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none"
            />
          </div>

          <button class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition">
            Save Changes
          </button>
        </div>
      </div>

      <!-- Language Settings -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">언어 설정</h2>

        <div class="space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <div>
                <p class="font-medium text-gray-800">기본 번역 언어</p>
                <p class="text-sm text-gray-600">Slack 메시지 번역 시 기본으로 사용할 언어입니다</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <select
                v-model="selectedLanguage"
                @change="handleLanguageChange"
                :disabled="isUpdatingLanguage"
                class="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
                  {{ lang.flag }} {{ lang.label }}
                </option>
              </select>
              <span v-if="languageUpdateSuccess" class="text-sm text-green-600 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                저장됨
              </span>
              <span v-if="isUpdatingLanguage" class="text-sm text-gray-500">저장 중...</span>
            </div>
            <p class="mt-2 text-xs text-gray-500">
              💡 Slack 메신저에서 일시적으로 다른 언어로 변경할 수 있습니다
            </p>
          </div>
        </div>
      </div>

      <!-- Preferences -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">Email Notifications</p>
              <p class="text-sm text-gray-600">Receive email notifications for updates</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" checked />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-800">Push Notifications</p>
              <p class="text-sm text-gray-600">Receive push notifications</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSlackAgent } from '@/composables/collaboration/messenger/useSlackAgent'
import { SUPPORTED_LANGUAGES } from '@/constants/languages'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Language settings
const {
  preferredLanguage,
  updatePreferredLanguage
} = useSlackAgent()

const selectedLanguage = ref(preferredLanguage.value)
const isUpdatingLanguage = ref(false)
const languageUpdateSuccess = ref(false)

// Handle language change (permanent, saved to DB)
const handleLanguageChange = async () => {
  isUpdatingLanguage.value = true
  languageUpdateSuccess.value = false

  try {
    await updatePreferredLanguage(selectedLanguage.value)
    languageUpdateSuccess.value = true

    // Hide success message after 2 seconds
    setTimeout(() => {
      languageUpdateSuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to update language:', error)
    // Revert on error
    selectedLanguage.value = preferredLanguage.value
    alert('언어 설정 저장에 실패했습니다.')
  } finally {
    isUpdatingLanguage.value = false
  }
}

// Initialize language from user data
onMounted(() => {
  if (user.value?.preferredLanguage) {
    selectedLanguage.value = user.value.preferredLanguage
  }
})
</script>
