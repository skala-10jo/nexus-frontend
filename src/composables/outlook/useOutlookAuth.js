import { ref, onBeforeUnmount } from 'vue'
import { mailService } from '@/services/collaboration/mailService'

/**
 * Outlook 인증 관리 Composable
 * @description Mail, Calendar 등 Outlook 서비스 공통 인증 처리
 */
export function useOutlookAuth() {
  // ============================================
  // State
  // ============================================
  const authStatus = ref({ isConnected: false, outlookEmail: null })
  const showAuthModal = ref(false)
  const deviceCode = ref(null)
  const authTimeout = ref(900) // 15 minutes

  let authCheckInterval = null
  let authTimeoutInterval = null

  // ============================================
  // Actions
  // ============================================

  /**
   * 인증 상태 확인
   */
  const checkAuthStatus = async () => {
    try {
      const response = await mailService.getAuthStatus()
      if (response.data?.data) {
        authStatus.value = response.data.data
      } else if (response.data) {
        authStatus.value = response.data
      }
    } catch (error) {
      console.error('Failed to check auth status:', error)
      authStatus.value = { isConnected: false, outlookEmail: null }
    }
  }

  /**
   * 인증 완료 여부 확인
   */
  const checkAuthComplete = async () => {
    try {
      const response = await mailService.getAuthStatus()
      return response.data?.data?.isConnected ?? false
    } catch (error) {
      return false
    }
  }

  /**
   * 인증 모달 닫기
   */
  const closeAuthModal = () => {
    showAuthModal.value = false
    if (authCheckInterval) {
      clearInterval(authCheckInterval)
      authCheckInterval = null
    }
    if (authTimeoutInterval) {
      clearInterval(authTimeoutInterval)
      authTimeoutInterval = null
    }
  }

  /**
   * Outlook 연결 시작
   */
  const connectOutlook = async (onSuccess) => {
    showAuthModal.value = true
    deviceCode.value = null
    authTimeout.value = 900

    try {
      const response = await mailService.initiateAuth()
      deviceCode.value = response.data.data

      // Poll for auth completion
      authCheckInterval = setInterval(async () => {
        const status = await checkAuthComplete()
        if (status) {
          closeAuthModal()
          await checkAuthStatus()
          if (onSuccess) onSuccess()
        }
      }, 5000)

      // Countdown timer
      authTimeoutInterval = setInterval(() => {
        authTimeout.value--
        if (authTimeout.value <= 0) {
          closeAuthModal()
          alert('Verification timed out. Please try again.')
        }
      }, 1000)
    } catch (error) {
      console.error('Failed to initiate Outlook connection:', error)
      closeAuthModal()
    }
  }

  /**
   * 인증 페이지 열기
   */
  const openAuthPage = () => {
    if (!deviceCode.value?.verificationUri) {
      alert('Failed to load verification info. Please try again.')
      return
    }

    const width = 600
    const height = 700
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2

    const authWindow = window.open(
      deviceCode.value.verificationUri,
      'OutlookAuth',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
    )

    if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
      alert('Popup blocked. Please allow popups for this site.')
    }
  }

  /**
   * Outlook 연결 해제
   */
  const disconnectOutlook = async () => {
    if (!confirm('Are you sure you want to disconnect Outlook?')) return

    try {
      await mailService.disconnect()
      authStatus.value = { isConnected: false, outlookEmail: null }
      alert('Disconnected successfully.')
      return true
    } catch (error) {
      console.error('Failed to disconnect:', error)
      alert('Failed to disconnect.')
      return false
    }
  }

  // ============================================
  // Lifecycle
  // ============================================
  onBeforeUnmount(() => {
    if (authCheckInterval) clearInterval(authCheckInterval)
    if (authTimeoutInterval) clearInterval(authTimeoutInterval)
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    authStatus,
    showAuthModal,
    deviceCode,
    authTimeout,

    // Actions
    checkAuthStatus,
    connectOutlook,
    disconnectOutlook,
    openAuthPage,
    closeAuthModal
  }
}
