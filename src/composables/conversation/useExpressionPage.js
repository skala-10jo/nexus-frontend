/**
 * Expression Page Composable
 *
 * Unit/Chapter 선택 및 세션 관리 로직
 */
import { ref, computed } from 'vue'
import api from '@/services/api'

const SESSION_COUNT = 3

export function useExpressionPage() {
  // View State
  const currentView = ref('selection') // 'selection' | 'sessionSelect' | 'practice' | 'quiz'

  // Selection State
  const units = ref([])
  const selectedUnit = ref('')
  const selectedChapter = ref('')
  const unitChapters = ref({})
  const loading = ref(false)
  const error = ref(null)

  // Session State
  const allExpressions = ref([])
  const sessions = ref([])
  const currentSessionIndex = ref(0)
  const currentExpressionIndex = ref(0)

  // Computed
  const currentSessionExpressions = computed(() => {
    return sessions.value[currentSessionIndex.value]?.expressions || []
  })

  const currentExpression = computed(() => {
    return currentSessionExpressions.value[currentExpressionIndex.value] || {}
  })

  const allSessionsCompleted = computed(() => {
    return sessions.value.length > 0 && sessions.value.every(s => s.completed)
  })

  const hasNextSession = computed(() => {
    return currentSessionIndex.value < sessions.value.length - 1
  })

  // Methods
  const fetchUnits = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await api.get('/expressions/units')
      units.value = response.data.data || []

      const chapterPromises = units.value.map(unit => fetchChaptersForUnit(unit.unit))
      await Promise.all(chapterPromises)
    } catch (err) {
      console.error('Failed to fetch units:', err)
      error.value = 'Unit 정보를 불러오는데 실패했습니다.'
      units.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchChaptersForUnit = async (unitName) => {
    try {
      const response = await api.get('/expressions/chapters', {
        params: { unit: unitName }
      })
      unitChapters.value = {
        ...unitChapters.value,
        [unitName]: response.data.data || []
      }
    } catch (err) {
      console.error(`Failed to fetch chapters for ${unitName}:`, err)
      unitChapters.value = {
        ...unitChapters.value,
        [unitName]: []
      }
    }
  }

  const selectChapterDirect = async (unit, chapter) => {
    selectedUnit.value = unit
    selectedChapter.value = chapter
    loading.value = true

    try {
      const response = await api.get('/expressions', {
        params: { unit, chapter, limit: 100 }
      })
      allExpressions.value = response.data.data || []
      splitIntoSessions()
      currentView.value = 'sessionSelect'
    } catch (err) {
      console.error('Failed to fetch expressions:', err)
      allExpressions.value = []
    } finally {
      loading.value = false
    }
  }

  const splitIntoSessions = () => {
    const total = allExpressions.value.length
    const sessionSize = Math.ceil(total / SESSION_COUNT)

    sessions.value = []
    for (let i = 0; i < SESSION_COUNT; i++) {
      const start = i * sessionSize
      const end = Math.min(start + sessionSize, total)
      if (start < total) {
        sessions.value.push({
          expressions: allExpressions.value.slice(start, end),
          completed: false
        })
      }
    }
  }

  const startSession = (sessionIndex) => {
    currentSessionIndex.value = sessionIndex
    currentExpressionIndex.value = 0
    currentView.value = 'practice'
  }

  const goBackToSelection = () => {
    currentView.value = 'selection'
    sessions.value = []
    allExpressions.value = []
  }

  const goBackToSessionSelect = () => {
    currentView.value = 'sessionSelect'
  }

  const handleBackButton = () => {
    if (currentView.value === 'sessionSelect') {
      goBackToSelection()
    } else if (currentView.value === 'practice' || currentView.value === 'quiz') {
      goBackToSessionSelect()
    }
  }

  const markSessionCompleted = () => {
    sessions.value[currentSessionIndex.value].completed = true
  }

  const goToNextSession = () => {
    if (hasNextSession.value) {
      startSession(currentSessionIndex.value + 1)
    }
  }

  // Navigation
  const prevExpression = () => {
    if (currentExpressionIndex.value > 0) {
      currentExpressionIndex.value--
    }
  }

  const nextExpression = () => {
    if (currentExpressionIndex.value < currentSessionExpressions.value.length - 1) {
      currentExpressionIndex.value++
    }
  }

  // Helpers
  const formatMeaning = (meaning) => {
    if (!meaning) return ''
    return meaning.replace(/[{}]/g, '')
  }

  const highlightExpression = (text, expression) => {
    if (!text || !expression) return text
    const regex = new RegExp(`(${expression})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-300 text-gray-900 font-bold px-1 rounded">$1</mark>')
  }

  const getProgressBarColor = (rate) => {
    if (!rate || rate === 0) return 'bg-gray-400'
    if (rate >= 80) return 'bg-green-500'
    if (rate >= 60) return 'bg-yellow-500'
    if (rate >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return {
    // State
    currentView,
    units,
    selectedUnit,
    selectedChapter,
    unitChapters,
    loading,
    error,
    allExpressions,
    sessions,
    currentSessionIndex,
    currentExpressionIndex,

    // Computed
    currentSessionExpressions,
    currentExpression,
    allSessionsCompleted,
    hasNextSession,

    // Methods
    fetchUnits,
    selectChapterDirect,
    startSession,
    handleBackButton,
    goBackToSelection,
    goBackToSessionSelect,
    markSessionCompleted,
    goToNextSession,
    prevExpression,
    nextExpression,

    // Helpers
    formatMeaning,
    highlightExpression,
    getProgressBarColor
  }
}
