import { ref } from 'vue'
import { mailService } from '@/services/collaboration/mailService'

/**
 * 메일 상세 보기 Composable
 */
export function useMailDetail(onEmailUpdate) {
  // ============================================
  // State
  // ============================================
  const selectedEmail = ref(null)
  const selectedProjectId = ref(null)

  // ============================================
  // Helpers
  // ============================================

  /**
   * HTML 콘텐츠 여부 판단
   */
  const isHtmlContent = (email) => {
    if (!email || !email.body) return false
    if (email.bodyType && (email.bodyType.toUpperCase() === 'HTML' || email.bodyType.toLowerCase() === 'html')) {
      return true
    }
    const htmlTagPattern = /<(html|body|div|p|span|br|table|tr|td|a|img|h1|h2|h3|h4|h5|h6|ul|ol|li)/i
    return htmlTagPattern.test(email.body)
  }

  /**
   * 날짜 포맷 (상대적)
   */
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  /**
   * 날짜 포맷 (전체)
   */
  const formatDateFull = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================
  // Actions
  // ============================================

  /**
   * 메일 열기
   */
  const openEmail = async (emailId) => {
    try {
      const response = await mailService.getEmail(emailId)
      selectedEmail.value = response.data.data
      selectedProjectId.value = selectedEmail.value.projectId

      // 읽음 처리
      if (!selectedEmail.value.isRead) {
        await mailService.updateReadStatus(emailId, true)
        if (onEmailUpdate) onEmailUpdate()
      }
    } catch (error) {
      console.error('Failed to open email:', error)
    }
  }

  /**
   * 메일 닫기
   */
  const closeEmail = () => {
    selectedEmail.value = null
    selectedProjectId.value = null
  }

  /**
   * 읽음 상태 토글
   */
  const toggleReadStatus = async () => {
    try {
      await mailService.updateReadStatus(selectedEmail.value.id, !selectedEmail.value.isRead)
      selectedEmail.value.isRead = !selectedEmail.value.isRead
      if (onEmailUpdate) onEmailUpdate()
    } catch (error) {
      console.error('Failed to toggle read status:', error)
      alert('Failed to update status.')
    }
  }

  /**
   * 프로젝트 할당
   */
  const assignProject = async (projects) => {
    try {
      await mailService.assignProject(selectedEmail.value.id, selectedProjectId.value)

      const project = projects.find(p => p.id === selectedProjectId.value)
      selectedEmail.value.projectId = selectedProjectId.value
      selectedEmail.value.projectName = project ? project.name : null

      if (onEmailUpdate) onEmailUpdate()
    } catch (error) {
      console.error('Failed to assign project:', error)
      alert('Failed to assign project.')
    }
  }

  /**
   * 메일 삭제
   */
  const deleteEmail = async () => {
    if (!confirm('Are you sure you want to delete this email?')) return

    try {
      await mailService.deleteEmail(selectedEmail.value.id)
      closeEmail()
      if (onEmailUpdate) onEmailUpdate()
    } catch (error) {
      console.error('Failed to delete email:', error)
      alert('Failed to delete email.')
    }
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    selectedEmail,
    selectedProjectId,

    // Helpers
    isHtmlContent,
    formatDate,
    formatDateFull,

    // Actions
    openEmail,
    closeEmail,
    toggleReadStatus,
    assignProject,
    deleteEmail
  }
}
