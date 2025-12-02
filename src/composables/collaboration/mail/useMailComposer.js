import { ref, reactive } from 'vue'
import { mailService } from '@/services/collaboration/mailService'

/**
 * 메일 작성 Composable
 */
export function useMailComposer(onSendSuccess) {
  // ============================================
  // State
  // ============================================
  const showComposeModal = ref(false)
  const sending = ref(false)

  const newEmail = reactive({
    to: '',
    cc: '',
    subject: '',
    body: ''
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 작성 모달 열기
   */
  const openComposeModal = () => {
    showComposeModal.value = true
    resetForm()
  }

  /**
   * 작성 모달 닫기
   */
  const closeComposeModal = () => {
    showComposeModal.value = false
    resetForm()
  }

  /**
   * 폼 초기화
   */
  const resetForm = () => {
    newEmail.to = ''
    newEmail.cc = ''
    newEmail.subject = ''
    newEmail.body = ''
  }

  /**
   * 유효성 검사
   */
  const validateForm = () => {
    if (!newEmail.to.trim()) {
      alert('수신자를 입력해주세요.')
      return false
    }
    if (!newEmail.subject.trim()) {
      alert('제목을 입력해주세요.')
      return false
    }
    if (!newEmail.body.trim()) {
      alert('내용을 입력해주세요.')
      return false
    }
    return true
  }

  /**
   * 메일 발송
   */
  const sendNewEmail = async () => {
    if (!validateForm()) return

    sending.value = true
    try {
      const toRecipients = newEmail.to
        .split(',')
        .map(email => email.trim())
        .filter(email => email)

      const ccRecipients = newEmail.cc
        ? newEmail.cc.split(',').map(email => email.trim()).filter(email => email)
        : []

      await mailService.sendEmail({
        toRecipients,
        ccRecipients,
        subject: newEmail.subject,
        body: newEmail.body,
        bodyType: 'Text'
      })

      alert('메일이 전송되었습니다.')
      closeComposeModal()

      if (onSendSuccess) onSendSuccess()
    } catch (error) {
      console.error('Failed to send email:', error)
      alert('메일 전송 실패: ' + (error.response?.data?.message || error.message))
    } finally {
      sending.value = false
    }
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    showComposeModal,
    sending,
    newEmail,

    // Actions
    openComposeModal,
    closeComposeModal,
    sendNewEmail
  }
}
