import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Login 페이지 비즈니스 로직 composable
 * 로그인 상태 관리 및 로직 처리
 */
export function useLoginPage() {
  const router = useRouter()
  const authStore = useAuthStore()

  // ============================================
  // State
  // ============================================
  const form = ref({
    username: '',
    password: ''
  })

  const isLoading = ref(false)
  const errorMessage = ref('')
  const showRegisterForm = ref(false)

  // ============================================
  // Methods
  // ============================================
  async function handleLogin() {
    isLoading.value = true
    errorMessage.value = ''

    const result = await authStore.login(form.value)

    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.error
    }

    isLoading.value = false
  }

  function openRegister() {
    showRegisterForm.value = true
  }

  function closeRegister() {
    showRegisterForm.value = false
  }

  function handleRegisterSuccess() {
    showRegisterForm.value = false
    router.push('/')
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    form,
    isLoading,
    errorMessage,
    showRegisterForm,

    // Methods
    handleLogin,
    openRegister,
    closeRegister,
    handleRegisterSuccess
  }
}
