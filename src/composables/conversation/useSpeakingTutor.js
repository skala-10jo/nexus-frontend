import { ref, computed, onMounted, nextTick } from 'vue'
import { speakingTutorService } from '@/services/speakingTutorService'
import { useLearningVoice } from '@/composables/conversation/useLearningVoice'

/**
 * Speaking Tutor 핵심 로직 composable
 *
 * @description 스피킹 튜터의 상태 관리, 세션 관리, 분석, 피드백, 학습 모드 로직
 */
export function useSpeakingTutor() {
  // ============ View State ============
  const currentView = ref('list') // 'list' | 'analyzing' | 'results' | 'learning'
  const showUploadModal = ref(false)
  const showRecordModal = ref(false)
  const showMobileFeedback = ref(false)
  const uploadModalRef = ref(null)
  const recordModalRef = ref(null)

  // ============ Analysis State ============
  const currentSessionId = ref(null)
  const currentSession = ref(null)
  const analysisProgress = ref(0)
  const analysisMessage = ref('분석을 시작합니다...')
  const pollingInterval = ref(null)

  // ============ Results State ============
  const speakers = ref([])
  const utterances = ref([])
  const selectedSpeakers = ref([])
  const selectedUtterance = ref(null)
  const isLoadingFeedback = ref(false)

  // ============ Speaker Edit State ============
  const editingSpeakerId = ref(null)
  const editingSpeakerLabel = ref('')
  const isSavingSpeakerLabel = ref(false)

  // ============ History State ============
  const sessions = ref([])
  const sessionsLoading = ref(false)

  // ============ Learning Mode State ============
  const learningItems = ref([])
  const currentLearningIndex = ref(0)
  const learningScrollContainer = ref(null)

  // ============ Error State ============
  const errorMessage = ref(null)

  // ============ Learning Voice (Azure Speech) ============
  const learningVoice = useLearningVoice()

  // ============ Computed ============
  const filteredUtterances = computed(() => {
    if (selectedSpeakers.value.length === 0) {
      return utterances.value
    }
    return utterances.value.filter(u => selectedSpeakers.value.includes(u.speakerId))
  })

  const currentLearningItem = computed(() => {
    if (learningItems.value.length === 0) return null
    return learningItems.value[currentLearningIndex.value] || null
  })

  // ============ Lifecycle ============
  onMounted(async () => {
    await loadSessionHistory()
  })

  // ============ Session Management ============
  async function loadSessionHistory() {
    sessionsLoading.value = true
    try {
      const result = await speakingTutorService.getSessions(0, 50)
      sessions.value = result.sessions || []
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      sessionsLoading.value = false
    }
  }

  async function handleSelectSession(sessionId) {
    try {
      currentSessionId.value = sessionId
      const result = await speakingTutorService.getAnalysis(sessionId)

      if (result.status === 'COMPLETED') {
        loadResults(result)
      } else if (result.status === 'PROCESSING' || result.status === 'PENDING') {
        currentView.value = 'analyzing'
        analysisProgress.value = result.progress || 0
        analysisMessage.value = result.message || '처리 중...'
        startPolling()
      } else {
        errorMessage.value = '세션을 불러올 수 없습니다'
      }
    } catch (error) {
      console.error('Failed to load session:', error)
      errorMessage.value = '세션을 불러올 수 없습니다'
    }
  }

  async function handleDeleteSession(sessionId) {
    if (!confirm('이 분석 기록을 삭제하시겠습니까?')) return

    try {
      await speakingTutorService.deleteSession(sessionId)
      await loadSessionHistory()
    } catch (error) {
      console.error('Failed to delete session:', error)
      errorMessage.value = '삭제에 실패했습니다'
    }
  }

  // ============ Upload & Analysis ============
  function handleUpload({ file, language }) {
    uploadFile(file, language)
  }

  async function uploadFile(file, language) {
    try {
      showUploadModal.value = false
      currentView.value = 'analyzing'
      analysisProgress.value = 0
      analysisMessage.value = '파일 업로드 중...'

      const result = await speakingTutorService.uploadAudio(file, language)
      currentSessionId.value = result.sessionId
      analysisMessage.value = '파일이 업로드되었습니다. 분석을 시작합니다...'

      startPolling()
    } catch (error) {
      console.error('Upload failed:', error)
      errorMessage.value = error.response?.data?.detail || '업로드에 실패했습니다. 다시 시도해주세요.'
      currentView.value = 'list'
      if (uploadModalRef.value) {
        uploadModalRef.value.setError(errorMessage.value)
      }
    }
  }

  function startPolling() {
    pollingInterval.value = setInterval(async () => {
      try {
        const result = await speakingTutorService.getAnalysis(currentSessionId.value)

        if (result.status === 'COMPLETED') {
          clearInterval(pollingInterval.value)
          analysisProgress.value = 100
          loadResults(result)
        } else if (result.status === 'FAILED') {
          clearInterval(pollingInterval.value)
          errorMessage.value = result.message || '분석에 실패했습니다'
          currentView.value = 'list'
          await loadSessionHistory()
        } else {
          analysisProgress.value = result.progress || 0
          analysisMessage.value = result.message || '처리 중...'
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 2000)
  }

  function loadResults(result) {
    currentSession.value = result
    speakers.value = result.speakers || []
    utterances.value = result.utterances || []
    selectedSpeakers.value = speakers.value.map(s => s.id)
    currentView.value = 'results'
    loadSessionHistory()
  }

  function backToList() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }
    currentView.value = 'list'
    currentSession.value = null
    speakers.value = []
    utterances.value = []
    selectedUtterance.value = null
    loadSessionHistory()
  }

  // ============ Speaker Management ============
  function toggleSpeakerFilter(speakerId) {
    const idx = selectedSpeakers.value.indexOf(speakerId)
    if (idx >= 0) {
      selectedSpeakers.value.splice(idx, 1)
    } else {
      selectedSpeakers.value.push(speakerId)
    }
  }

  function showAllSpeakers() {
    selectedSpeakers.value = speakers.value.map(s => s.id)
  }

  function startEditSpeaker(speaker) {
    editingSpeakerId.value = speaker.id
    editingSpeakerLabel.value = speaker.label
  }

  function cancelEditSpeaker() {
    editingSpeakerId.value = null
    editingSpeakerLabel.value = ''
  }

  async function saveSpeakerLabel(speakerId) {
    if (!editingSpeakerLabel.value.trim()) {
      errorMessage.value = '화자 이름을 입력해주세요'
      return
    }

    isSavingSpeakerLabel.value = true
    try {
      await speakingTutorService.updateSpeakerLabel(
        currentSessionId.value,
        speakerId,
        editingSpeakerLabel.value.trim()
      )

      // Update local state
      const speakerIdx = speakers.value.findIndex(s => s.id === speakerId)
      if (speakerIdx >= 0) {
        speakers.value[speakerIdx].label = editingSpeakerLabel.value.trim()
      }

      // Update utterances speakerLabel
      utterances.value.forEach(u => {
        if (u.speakerId === speakerId) {
          u.speakerLabel = editingSpeakerLabel.value.trim()
        }
      })

      // Reset edit state
      editingSpeakerId.value = null
      editingSpeakerLabel.value = ''
    } catch (error) {
      console.error('Failed to update speaker label:', error)
      errorMessage.value = '화자 이름 변경에 실패했습니다'
    } finally {
      isSavingSpeakerLabel.value = false
    }
  }

  // ============ Utterance & Feedback ============
  function selectUtterance(utterance) {
    selectedUtterance.value = utterance
    showMobileFeedback.value = true
  }

  async function requestFeedback() {
    if (!selectedUtterance.value) return

    isLoadingFeedback.value = true
    try {
      const result = await speakingTutorService.generateFeedback(
        selectedUtterance.value.id,
        'business meeting'
      )

      // Update the utterance with feedback
      const idx = utterances.value.findIndex(u => u.id === selectedUtterance.value.id)
      if (idx >= 0) {
        utterances.value[idx] = {
          ...utterances.value[idx],
          hasFeedback: true,
          feedback: result.feedback
        }
        selectedUtterance.value = utterances.value[idx]
      }
    } catch (error) {
      console.error('Feedback generation failed:', error)
      errorMessage.value = '피드백 생성에 실패했습니다'
    } finally {
      isLoadingFeedback.value = false
    }
  }

  // ============ Learning Mode ============
  async function startLearningMode() {
    if (!currentSessionId.value) return

    try {
      const result = await speakingTutorService.getLearningData(
        currentSessionId.value,
        selectedSpeakers.value
      )

      learningItems.value = result.learningItems || []
      currentLearningIndex.value = 0
      learningVoice.resetState()

      if (learningItems.value.length === 0) {
        const utterancesWithFeedback = utterances.value.filter(u => u.hasFeedback)
        if (utterancesWithFeedback.length === 0) {
          errorMessage.value = '피드백을 먼저 생성해주세요. 발화를 선택하고 "피드백 받기" 버튼을 클릭하세요.'
          return
        }

        learningItems.value = utterancesWithFeedback
          .filter(u => u.feedback?.improvedSentence && u.feedback.improvedSentence !== u.text)
          .map(u => ({
            utteranceId: u.id,
            originalText: u.text,
            improvedText: u.feedback.improvedSentence,
            grammarCorrections: u.feedback.grammarCorrections || [],
            suggestions: u.feedback.suggestions || [],
            score: u.feedback.score || 0,
            scoreBreakdown: u.feedback.scoreBreakdown || {},
            speakerId: u.speakerId,
            practiceCount: 0
          }))
      }

      if (learningItems.value.length === 0) {
        errorMessage.value = '학습할 항목이 없습니다. 교정이 필요한 발화가 없습니다.'
        return
      }

      currentView.value = 'learning'
    } catch (error) {
      console.error('Failed to start learning mode:', error)
      errorMessage.value = '학습 모드를 시작할 수 없습니다.'
    }
  }

  function exitLearningMode() {
    currentView.value = 'results'
    learningVoice.resetState()
  }

  function goToLearningWithUtterance() {
    if (!selectedUtterance.value?.feedback) return

    const utterance = selectedUtterance.value
    learningItems.value = [{
      utteranceId: utterance.id,
      originalText: utterance.text,
      improvedText: utterance.feedback.improvedSentence || utterance.text,
      grammarCorrections: utterance.feedback.grammarCorrections || [],
      suggestions: utterance.feedback.suggestions || [],
      score: utterance.feedback.score || 0,
      scoreBreakdown: utterance.feedback.scoreBreakdown || {},
      speakerId: utterance.speakerId,
      practiceCount: 0
    }]
    currentLearningIndex.value = 0
    learningVoice.resetState()
    currentView.value = 'learning'
  }

  function prevLearningItem() {
    if (currentLearningIndex.value > 0) {
      currentLearningIndex.value--
      learningVoice.resetState()
    }
  }

  function nextLearningItem() {
    if (currentLearningIndex.value < learningItems.value.length - 1) {
      currentLearningIndex.value++
      learningVoice.resetState()
    }
  }

  // ============ Voice & Recording ============
  function speakText(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      const lang = currentSession.value?.language || 'en-US'
      utterance.lang = lang.split('-')[0] === 'ko' ? 'ko-KR' : 'en-US'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    } else {
      errorMessage.value = '이 브라우저는 음성 합성을 지원하지 않습니다.'
    }
  }

  async function toggleRecording() {
    if (learningVoice.isRecording.value) {
      try {
        const referenceText = currentLearningItem.value?.improvedText || ''
        const language = currentSession.value?.language || 'en-US'

        await learningVoice.stopRecordingAndAssess(referenceText, language)

        await nextTick()
        scrollLearningToBottom()
      } catch (error) {
        console.error('Recording stop error:', error)
        errorMessage.value = learningVoice.assessmentError.value || '발음 평가에 실패했습니다.'
      }
    } else {
      try {
        const language = currentSession.value?.language || 'en-US'
        await learningVoice.startRecording(language)
      } catch (error) {
        console.error('Recording start error:', error)
        errorMessage.value = '마이크에 접근할 수 없습니다. 권한을 확인해주세요.'
      }
    }
  }

  function scrollLearningToBottom() {
    if (learningScrollContainer.value) {
      learningScrollContainer.value.scrollTo({
        top: learningScrollContainer.value.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  // ============ Utility Functions ============
  function formatTime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  function getSpeakerColor(id) {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    return colors[(id - 1) % colors.length]
  }

  function getSpeakerBgColor(id) {
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
    return colors[(id - 1) % colors.length]
  }

  function getScoreColor(score) {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  function getScoreBgColor(score) {
    if (score >= 9) return 'bg-green-100 text-green-600'
    if (score >= 7) return 'bg-blue-100 text-blue-600'
    if (score >= 5) return 'bg-yellow-100 text-yellow-600'
    return 'bg-red-100 text-red-600'
  }

  function getScoreLabel(key) {
    const labels = {
      grammar: '문법',
      vocabulary: '어휘',
      fluency: '유창성',
      clarity: '명확성'
    }
    return labels[key] || key
  }

  function clearError() {
    errorMessage.value = null
  }

  function closeMobileFeedback() {
    showMobileFeedback.value = false
  }

  function openUploadModal() {
    showUploadModal.value = true
  }

  function closeUploadModal() {
    showUploadModal.value = false
  }

  function openRecordModal() {
    showRecordModal.value = true
  }

  function closeRecordModal() {
    showRecordModal.value = false
  }

  function handleRecordUpload({ file, language }) {
    // 녹음 모달에서 업로드 시 동일한 uploadFile 함수 사용
    closeRecordModal()
    uploadFile(file, language)
  }

  return {
    // View State
    currentView,
    showUploadModal,
    showRecordModal,
    showMobileFeedback,
    uploadModalRef,
    recordModalRef,

    // Analysis State
    currentSessionId,
    currentSession,
    analysisProgress,
    analysisMessage,

    // Results State
    speakers,
    utterances,
    selectedSpeakers,
    selectedUtterance,
    isLoadingFeedback,

    // Speaker Edit State
    editingSpeakerId,
    editingSpeakerLabel,
    isSavingSpeakerLabel,

    // History State
    sessions,
    sessionsLoading,

    // Learning Mode State
    learningItems,
    currentLearningIndex,
    learningScrollContainer,

    // Learning Voice
    learningVoice,

    // Error State
    errorMessage,

    // Computed
    filteredUtterances,
    currentLearningItem,

    // Session Management
    loadSessionHistory,
    handleSelectSession,
    handleDeleteSession,

    // Upload & Analysis
    handleUpload,
    backToList,

    // Speaker Management
    toggleSpeakerFilter,
    showAllSpeakers,
    startEditSpeaker,
    cancelEditSpeaker,
    saveSpeakerLabel,

    // Utterance & Feedback
    selectUtterance,
    requestFeedback,

    // Learning Mode
    startLearningMode,
    exitLearningMode,
    goToLearningWithUtterance,
    prevLearningItem,
    nextLearningItem,

    // Voice & Recording
    speakText,
    toggleRecording,

    // Utility Functions
    formatTime,
    getSpeakerColor,
    getSpeakerBgColor,
    getScoreColor,
    getScoreBgColor,
    getScoreLabel,

    // UI Actions
    clearError,
    closeMobileFeedback,
    openUploadModal,
    closeUploadModal,
    openRecordModal,
    closeRecordModal,
    handleRecordUpload
  }
}
