import { ref, computed, watch } from 'vue'
import { scenarioService } from '@/services/scenarioService'

/**
 * ScenarioCreateDialog 비즈니스 로직 composable
 * 시나리오 생성 다이얼로그의 상태 관리 및 로직 처리
 */
export function useScenarioCreateDialog(props, emit) {
  // ============================================
  // Constants
  // ============================================
  const languageOptions = [
    { value: 'en', label: 'English', flag: '🇺🇸' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' },
    { value: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
    { value: 'ko', label: '한국어', flag: '🇰🇷' }
  ]

  const difficultyOptions = [
    { value: 'beginner', label: '초급', activeClass: 'bg-green-100 text-green-700' },
    { value: 'intermediate', label: '중급', activeClass: 'bg-yellow-100 text-yellow-700' },
    { value: 'advanced', label: '고급', activeClass: 'bg-red-100 text-red-700' }
  ]

  // ============================================
  // State - Form
  // ============================================
  const generateOptions = ref({
    language: 'en',
    difficulty: 'intermediate'
  })

  const formData = ref({
    title: '',
    description: '',
    scenarioText: '',
    category: 'General',
    userRole: '',
    aiRole: '',
    requiredTerminology: '',
    steps: []
  })

  // User request for AI generation (not saved to scenario)
  const userRequest = ref('')

  // ============================================
  // State - Selection
  // ============================================
  const selectedProjectId = ref(null)
  const selectedScheduleId = ref(null)

  // ============================================
  // State - Dropdown
  // ============================================
  const showProjectDropdown = ref(false)
  const showScheduleDropdown = ref(false)

  // ============================================
  // State - UI
  // ============================================
  const mobileTab = ref('form')
  const isGenerating = ref(false)

  // ============================================
  // State - Chat
  // ============================================
  const chatMessages = ref([])
  const chatInput = ref('')
  const isChatLoading = ref(false)

  // ============================================
  // Computed
  // ============================================
  const filteredSchedules = computed(() => {
    if (!selectedProjectId.value) return []
    return props.upcomingSchedules.filter(s => s.projectId === selectedProjectId.value)
  })

  const isFormValid = computed(() => {
    return (
      formData.value.title.trim() !== '' &&
      formData.value.scenarioText.trim() !== '' &&
      formData.value.userRole.trim() !== '' &&
      formData.value.aiRole.trim() !== ''
    )
  })

  // ============================================
  // Watchers
  // ============================================
  watch(() => props.show, (newVal) => {
    if (newVal) {
      // 팝업 열릴 때 초기값 설정
      if (props.initialProjectId) {
        selectedProjectId.value = props.initialProjectId
      }
      if (props.initialScheduleId) {
        selectedScheduleId.value = props.initialScheduleId
      }
    } else {
      resetForm()
    }
  })

  // ============================================
  // Methods - Utility
  // ============================================
  function formatScheduleTime(dateTimeString) {
    if (!dateTimeString) return ''
    const date = new Date(dateTimeString)
    const today = new Date()
    const dateOnly = date.toDateString()
    const todayOnly = today.toDateString()

    if (dateOnly === todayOnly) {
      return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    }

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  function generateDescriptionFromText(scenarioText, existingDescription = '') {
    const description = existingDescription.trim()
    if (description) return description

    const sentences = scenarioText.split(/[.!?]\s+/).filter(s => s.trim())
    return sentences.slice(0, 2).join('. ') + (sentences.length > 2 ? '.' : '')
  }

  // ============================================
  // Methods - Form Management
  // ============================================
  function resetForm() {
    formData.value = {
      title: '',
      description: '',
      scenarioText: '',
      category: 'General',
      userRole: '',
      aiRole: '',
      requiredTerminology: '',
      steps: []
    }
    userRequest.value = ''
    selectedProjectId.value = null
    selectedScheduleId.value = null
    resetChat()
  }

  function resetChat() {
    chatMessages.value = []
    chatInput.value = ''
    isChatLoading.value = false
  }

  function handleClose() {
    emit('close')
  }

  function handleCreate() {
    const description = generateDescriptionFromText(
      formData.value.scenarioText,
      formData.value.description
    )

    const scenarioData = {
      title: formData.value.title,
      description: description || formData.value.scenarioText.substring(0, 100),
      scenarioText: formData.value.scenarioText,
      language: generateOptions.value.language,
      difficulty: generateOptions.value.difficulty,
      category: formData.value.category,
      roles: {
        user: formData.value.userRole,
        ai: formData.value.aiRole
      },
      requiredTerminology: formData.value.requiredTerminology
        ? formData.value.requiredTerminology.split(',').map(t => t.trim()).filter(t => t)
        : [],
      steps: formData.value.steps || [],
      autoGenerated: false,
      projectId: selectedProjectId.value,
      scheduleId: selectedScheduleId.value
    }

    emit('created', scenarioData)
  }

  // ============================================
  // Methods - Selection
  // ============================================
  function selectProject(projectId) {
    selectedProjectId.value = projectId
    showProjectDropdown.value = false
    // 프로젝트 변경 시 일정 초기화
    if (projectId !== selectedProjectId.value) {
      selectedScheduleId.value = null
    }
  }

  function selectSchedule(scheduleId) {
    selectedScheduleId.value = scheduleId
    showScheduleDropdown.value = false
  }

  function toggleProjectDropdown() {
    showProjectDropdown.value = !showProjectDropdown.value
    showScheduleDropdown.value = false
  }

  function toggleScheduleDropdown() {
    showScheduleDropdown.value = !showScheduleDropdown.value
    showProjectDropdown.value = false
  }

  // ============================================
  // Methods - AI Generation
  // ============================================
  async function generateAllFields() {
    if (isGenerating.value) return

    isGenerating.value = true
    try {
      const projectIds = selectedProjectId.value ? [selectedProjectId.value] : []
      const scheduleIds = selectedScheduleId.value ? [selectedScheduleId.value] : []

      const requestData = {
        projectIds,
        scheduleIds,
        documentIds: [],
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty,
        count: 1,
        saveToDb: false,
        userRequest: userRequest.value || undefined
      }

      const response = await scenarioService.generateFromProjects(requestData)

      if (response.data.data && response.data.data.length > 0) {
        const generated = response.data.data[0]
        formData.value.title = generated.title
        formData.value.description = generated.description
        formData.value.scenarioText = generated.scenarioText
        formData.value.userRole = generated.roles.user
        formData.value.aiRole = generated.roles.ai
        formData.value.requiredTerminology = generated.requiredTerminology.join(', ')
        formData.value.category = generated.category || 'General'
        formData.value.steps = generated.steps || []
      }
    } catch (error) {
      console.error('Failed to generate scenario:', error)
      alert('시나리오 생성에 실패했습니다. 다시 시도해주세요.')
    } finally {
      isGenerating.value = false
    }
  }

  // ============================================
  // Methods - Chat
  // ============================================
  async function sendChatMessage() {
    if (!chatInput.value.trim() || isChatLoading.value) return

    chatMessages.value.push({
      role: 'user',
      content: chatInput.value
    })

    const userMessage = chatInput.value
    chatInput.value = ''
    isChatLoading.value = true

    try {
      const currentScenario = {
        title: formData.value.title,
        description: formData.value.description,
        scenarioText: formData.value.scenarioText,
        userRole: formData.value.userRole,
        aiRole: formData.value.aiRole,
        category: formData.value.category,
        requiredTerminology: formData.value.requiredTerminology
      }

      const response = await scenarioService.modifyWithChat({
        currentScenario,
        userMessage,
        language: generateOptions.value.language,
        difficulty: generateOptions.value.difficulty
      })

      const modifiedFields = response.data.data.modifiedScenario
      if (modifiedFields.title) formData.value.title = modifiedFields.title
      if (modifiedFields.description) formData.value.description = modifiedFields.description
      if (modifiedFields.scenarioText) formData.value.scenarioText = modifiedFields.scenarioText
      if (modifiedFields.userRole) formData.value.userRole = modifiedFields.userRole
      if (modifiedFields.aiRole) formData.value.aiRole = modifiedFields.aiRole
      if (modifiedFields.category) formData.value.category = modifiedFields.category
      if (modifiedFields.requiredTerminology) formData.value.requiredTerminology = modifiedFields.requiredTerminology

      chatMessages.value.push({
        role: 'assistant',
        content: response.data.data.message
      })
    } catch (error) {
      console.error('Failed to send chat message:', error)
      chatMessages.value.push({
        role: 'assistant',
        content: '죄송합니다. 메시지 처리 중 오류가 발생했습니다. 다시 시도해주세요.'
      })
    } finally {
      isChatLoading.value = false
    }
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Constants
    languageOptions,
    difficultyOptions,

    // State - Form
    generateOptions,
    formData,
    userRequest,

    // State - Selection
    selectedProjectId,
    selectedScheduleId,

    // State - Dropdown
    showProjectDropdown,
    showScheduleDropdown,

    // State - UI
    mobileTab,
    isGenerating,

    // State - Chat
    chatMessages,
    chatInput,
    isChatLoading,

    // Computed
    filteredSchedules,
    isFormValid,

    // Methods - Utility
    formatScheduleTime,

    // Methods - Form Management
    resetForm,
    resetChat,
    handleClose,
    handleCreate,

    // Methods - Selection
    selectProject,
    selectSchedule,
    toggleProjectDropdown,
    toggleScheduleDropdown,

    // Methods - AI
    generateAllFields,
    sendChatMessage
  }
}
