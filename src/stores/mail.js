import { defineStore } from 'pinia'
import api from '@/services/api'

export const useMailStore = defineStore('mail', {
    state: () => ({
        emails: [],
        selectedEmail: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchEmails() {
            this.loading = true
            this.error = null
            try {
                const response = await api.get('/outlook/mails')
                if (response.data && response.data.content) {
                    this.emails = response.data.content
                } else {
                    throw new Error('No content')
                }
            } catch (error) {
                console.log('Failed to fetch emails, using mock data:', error)
                // Mock Data Fallback
                this.emails = [
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
                this.loading = false
            }
        },

        selectEmail(id) {
            this.selectedEmail = this.emails.find(e => e.id === id) || null
        }
    }
})
