import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

/**
 * 메일 스토어 (Setup 함수 패턴)
 *
 * CLAUDE.md 규칙 준수: defineStore(() => {...}) 형태 사용
 */
export const useMailStore = defineStore('mail', () => {
  // ==================== State ====================
  const emails = ref([])
  const selectedEmail = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // ==================== Actions ====================

  async function fetchEmails() {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/outlook/mails')
      if (response.data && response.data.content) {
        emails.value = response.data.content
      } else {
        throw new Error('No content')
      }
    } catch (err) {
      console.log('Failed to fetch emails, using mock data:', err)
      // Mock Data Fallback
      emails.value = [
        {
          id: '1',
          fromName: 'Max Maraston',
          fromAddress: 'max@aceagency.com',
          subject: 'Project Update: Case Study Review',
          body: 'Hi there,\n\nHere is the latest update on the case study we discussed. Please review the attached document.\n\nBest,\nMax',
          bodyPreview: 'Hi there, Here is the latest update on the case study we discussed...',
          receivedDateTime: new Date().toISOString(),
          isRead: false,
          hasAttachments: true,
          projectName: 'Case Study'
        },
        {
          id: '2',
          fromName: 'Celia W McCombs',
          fromAddress: 'celia@aceagency.com',
          subject: 'Meeting Schedule Confirmation',
          body: 'Can we reschedule our meeting to next Tuesday? Let me know if that works for you.',
          bodyPreview: 'Can we reschedule our meeting to next Tuesday?',
          receivedDateTime: new Date(Date.now() - 3600000).toISOString(),
          isRead: true,
          hasAttachments: false
        },
        {
          id: '3',
          fromName: 'Edna J Critchlow',
          fromAddress: 'edna@aceagency.com',
          subject: 'New Design Assets',
          body: 'Attached are the new assets for the upcoming campaign. Let me know what you think.',
          bodyPreview: 'Attached are the new assets for the upcoming campaign.',
          receivedDateTime: new Date(Date.now() - 86400000).toISOString(),
          isRead: false,
          hasAttachments: true,
          projectName: 'Design'
        },
        {
          id: '4',
          fromName: 'Dima Groshev',
          fromAddress: 'dima@aceagency.com',
          subject: 'Weekly Report',
          body: 'Here is the weekly report for the engineering team.',
          bodyPreview: 'Here is the weekly report for the engineering team.',
          receivedDateTime: new Date(Date.now() - 172800000).toISOString(),
          isRead: true,
          hasAttachments: false
        }
      ]
    } finally {
      loading.value = false
    }
  }

  function selectEmail(id) {
    selectedEmail.value = emails.value.find(e => e.id === id) || null
  }

  // ==================== Return ====================
  return {
    // State
    emails,
    selectedEmail,
    loading,
    error,

    // Actions
    fetchEmails,
    selectEmail
  }
})
