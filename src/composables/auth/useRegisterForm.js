import { ref, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

/**
 * 회원가입 폼 비즈니스 로직 composable
 * 폼 상태, 유효성 검사, API 호출 처리
 */
export function useRegisterForm(emit) {
  const authStore = useAuthStore()

  // ============================================
  // Constants
  // ============================================
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // ============================================
  // State - Form
  // ============================================
  const registerForm = ref({
    username: '',
    email: '',
    fullName: '',
    password: '',
    passwordConfirm: ''
  })

  const isRegistering = ref(false)
  const registerError = ref('')

  // ============================================
  // State - Validation
  // ============================================
  const validation = ref({
    username: { checking: false, exists: false, message: '' },
    email: { checking: false, exists: false, message: '' },
    password: { valid: false, message: '' },
    passwordConfirm: { valid: false, message: '' }
  })

  // ============================================
  // Debounce Timers
  // ============================================
  let usernameTimer = null
  let emailTimer = null

  // ============================================
  // Methods - Validation
  // ============================================
  async function checkUsername(username) {
    if (!username || username.length < 3) {
      validation.value.username.message = 'ID는 3자 이상이어야 합니다'
      validation.value.username.exists = false
      return
    }

    validation.value.username.checking = true

    try {
      const response = await authAPI.checkUsername(username)
      validation.value.username.exists = response.data.data.exists

      if (validation.value.username.exists) {
        validation.value.username.message = '이미 사용 중인 ID입니다'
      } else {
        validation.value.username.message = '사용 가능한 ID입니다'
      }
    } catch (error) {
      validation.value.username.message = '확인 중 오류가 발생했습니다'
    } finally {
      validation.value.username.checking = false
    }
  }

  async function checkEmail(email) {
    if (!email || !EMAIL_REGEX.test(email)) {
      validation.value.email.message = '올바른 이메일 형식이 아닙니다'
      validation.value.email.exists = false
      return
    }

    validation.value.email.checking = true

    try {
      const response = await authAPI.checkEmail(email)
      validation.value.email.exists = response.data.data.exists

      if (validation.value.email.exists) {
        validation.value.email.message = '이미 사용 중인 이메일입니다'
      } else {
        validation.value.email.message = '사용 가능한 이메일입니다'
      }
    } catch (error) {
      validation.value.email.message = '확인 중 오류가 발생했습니다'
    } finally {
      validation.value.email.checking = false
    }
  }

  function validatePassword(password) {
    if (!password) {
      validation.value.password.valid = false
      validation.value.password.message = ''
      return
    }

    if (password.length < 8) {
      validation.value.password.valid = false
      validation.value.password.message = '최소 8자 이상이어야 합니다'
      return
    }

    if (!PASSWORD_REGEX.test(password)) {
      validation.value.password.valid = false
      validation.value.password.message = '대문자, 소문자, 숫자를 포함해야 합니다'
      return
    }

    validation.value.password.valid = true
    validation.value.password.message = '안전한 비밀번호입니다'
  }

  function validatePasswordConfirm(passwordConfirm) {
    if (!passwordConfirm) {
      validation.value.passwordConfirm.valid = false
      validation.value.passwordConfirm.message = ''
      return
    }

    if (passwordConfirm !== registerForm.value.password) {
      validation.value.passwordConfirm.valid = false
      validation.value.passwordConfirm.message = '비밀번호가 일치하지 않습니다'
      return
    }

    validation.value.passwordConfirm.valid = true
    validation.value.passwordConfirm.message = '비밀번호가 일치합니다'
  }

  // ============================================
  // Methods - Form
  // ============================================
  async function handleRegister() {
    // Validate before submit
    if (validation.value.username.exists) {
      registerError.value = '이미 사용 중인 ID입니다'
      return
    }

    if (validation.value.email.exists) {
      registerError.value = '이미 사용 중인 이메일입니다'
      return
    }

    if (!validation.value.password.valid) {
      registerError.value = '비밀번호 규칙을 확인하세요'
      return
    }

    if (!validation.value.passwordConfirm.valid) {
      registerError.value = '비밀번호가 일치하지 않습니다'
      return
    }

    isRegistering.value = true
    registerError.value = ''

    const result = await authStore.register(registerForm.value)

    if (result.success) {
      emit('success')
    } else {
      registerError.value = result.error
    }

    isRegistering.value = false
  }

  function resetForm() {
    registerForm.value = {
      username: '',
      email: '',
      fullName: '',
      password: '',
      passwordConfirm: ''
    }
    registerError.value = ''
    validation.value = {
      username: { checking: false, exists: false, message: '' },
      email: { checking: false, exists: false, message: '' },
      password: { valid: false, message: '' },
      passwordConfirm: { valid: false, message: '' }
    }
  }

  // ============================================
  // Watchers
  // ============================================
  watch(() => registerForm.value.username, (newValue) => {
    clearTimeout(usernameTimer)
    validation.value.username.message = ''

    if (newValue) {
      usernameTimer = setTimeout(() => {
        checkUsername(newValue)
      }, 500)
    }
  })

  watch(() => registerForm.value.email, (newValue) => {
    clearTimeout(emailTimer)
    validation.value.email.message = ''

    if (newValue) {
      emailTimer = setTimeout(() => {
        checkEmail(newValue)
      }, 500)
    }
  })

  watch(() => registerForm.value.password, (newValue) => {
    validatePassword(newValue)
    // Re-validate password confirm when password changes
    if (registerForm.value.passwordConfirm) {
      validatePasswordConfirm(registerForm.value.passwordConfirm)
    }
  })

  watch(() => registerForm.value.passwordConfirm, (newValue) => {
    validatePasswordConfirm(newValue)
  })

  // ============================================
  // Cleanup
  // ============================================
  onUnmounted(() => {
    clearTimeout(usernameTimer)
    clearTimeout(emailTimer)
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    registerForm,
    isRegistering,
    registerError,
    validation,

    // Methods
    handleRegister,
    resetForm
  }
}
