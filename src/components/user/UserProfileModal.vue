<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        @click="handleClose"
      >
        <div
          class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-900">프로필 설정</h3>
            <button
              @click="handleClose"
              class="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 space-y-6">
            <!-- Avatar Section -->
            <div class="flex flex-col items-center">
              <div
                class="relative group cursor-pointer"
                @click="triggerFileInput"
              >
                <img
                  :src="avatarPreviewUrl"
                  class="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  alt="Avatar"
                />
                <div
                  class="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <CameraIcon class="w-8 h-8 text-white" />
                </div>
                <!-- Upload Progress -->
                <div
                  v-if="uploading"
                  class="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center"
                >
                  <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-2">클릭하여 이미지 변경</p>
              <p class="text-xs text-gray-400">PNG, JPG, GIF, WEBP (최대 5MB)</p>
              <input
                ref="fileInput"
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/gif,image/webp"
                class="hidden"
                @change="handleFileSelect"
              />
            </div>

            <!-- Form Fields -->
            <div class="space-y-4">
              <!-- Full Name -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  이름
                </label>
                <input
                  v-model="form.fullName"
                  type="text"
                  placeholder="이름을 입력하세요"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 transition-all"
                />
              </div>

              <!-- Role -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  역할
                </label>
                <input
                  v-model="form.role"
                  type="text"
                  placeholder="예: Product Designer, Developer"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 transition-all"
                />
              </div>

              <!-- Email (Read-only) -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  이메일
                </label>
                <div
                  class="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500 flex items-center justify-between"
                >
                  <span>{{ user?.email }}</span>
                  <LockClosedIcon class="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <!-- Username (Read-only) -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  아이디
                </label>
                <div
                  class="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-500 flex items-center justify-between"
                >
                  <span>{{ user?.username }}</span>
                  <LockClosedIcon class="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <!-- Preferred Language -->
              <div class="space-y-2">
                <label class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  기본 번역 언어
                </label>
                <select
                  v-model="form.preferredLanguage"
                  class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 font-medium text-gray-800 transition-all cursor-pointer"
                >
                  <option v-for="lang in SUPPORTED_LANGUAGES" :key="lang.code" :value="lang.code">
                    {{ lang.flag }} {{ lang.label }}
                  </option>
                </select>
                <p class="text-xs text-gray-400">Slack 메시지 번역 시 기본으로 사용할 언어입니다</p>
              </div>
            </div>

            <!-- Error Message -->
            <div
              v-if="error"
              class="p-3 bg-red-50 text-red-600 rounded-xl text-sm"
            >
              {{ error }}
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-gray-100 flex gap-3">
            <button
              @click="handleClose"
              class="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              @click="saveProfile"
              :disabled="saving || !hasChanges"
              class="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ saving ? '저장 중...' : '저장하기' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { XMarkIcon, CameraIcon, LockClosedIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { userAPI } from '@/services/api'
import { SUPPORTED_LANGUAGES } from '@/composables/collaboration/messenger/useSlackAgent'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'updated'])

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// Form state
const form = ref({
  fullName: '',
  role: '',
  preferredLanguage: 'ko'
})

// Avatar state
const fileInput = ref(null)
const selectedFile = ref(null)
const avatarPreview = ref(null)
const uploading = ref(false)

// UI state
const saving = ref(false)
const error = ref(null)

// Computed
const avatarPreviewUrl = computed(() => {
  if (avatarPreview.value) {
    return avatarPreview.value
  }
  if (user.value?.avatarUrl) {
    // Check if it's a relative path (stored file) or external URL
    if (user.value.avatarUrl.startsWith('http')) {
      return user.value.avatarUrl
    }
    // Construct URL for stored files
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    return `${apiUrl}/files/serve/${user.value.avatarUrl}`
  }
  // Default avatar using ui-avatars.com
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.fullName || 'User')}&background=0D8ABC&color=fff&size=200`
})

const hasChanges = computed(() => {
  if (!user.value) return false
  return (
    form.value.fullName !== (user.value.fullName || '') ||
    form.value.role !== (user.value.role || '') ||
    form.value.preferredLanguage !== (user.value.preferredLanguage || 'ko') ||
    selectedFile.value !== null
  )
})

// Watch for show prop to initialize form
watch(() => props.show, (newVal) => {
  if (newVal && user.value) {
    form.value.fullName = user.value.fullName || ''
    form.value.role = user.value.role || ''
    form.value.preferredLanguage = user.value.preferredLanguage || 'ko'
    selectedFile.value = null
    avatarPreview.value = null
    error.value = null
  }
})

// Methods
function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return

  // Validate file type
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error.value = '지원하지 않는 파일 형식입니다. PNG, JPG, GIF, WEBP만 가능합니다.'
    return
  }

  // Validate file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = '파일 크기가 5MB를 초과합니다.'
    return
  }

  selectedFile.value = file
  error.value = null

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Reset file input
  event.target.value = ''
}

async function saveProfile() {
  if (!user.value || saving.value) return

  saving.value = true
  error.value = null

  try {
    // Upload avatar first if selected
    if (selectedFile.value) {
      uploading.value = true
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      const avatarResponse = await userAPI.uploadAvatar(user.value.id, formData)
      const updatedUser = avatarResponse.data.data?.user
      if (updatedUser) {
        authStore.setUser(updatedUser)
      }
      uploading.value = false
    }

    // Update profile info
    const updateData = {
      fullName: form.value.fullName,
      role: form.value.role,
      preferredLanguage: form.value.preferredLanguage
    }

    const response = await userAPI.updateUser(user.value.id, updateData)
    const finalUser = response.data.data?.user

    if (finalUser) {
      authStore.setUser(finalUser)
    }

    emit('updated', finalUser)
    emit('close')
  } catch (err) {
    console.error('Failed to update profile:', err)
    error.value = err.response?.data?.message || '프로필 저장에 실패했습니다.'
    uploading.value = false
  } finally {
    saving.value = false
  }
}

function handleClose() {
  if (!saving.value) {
    emit('close')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>
