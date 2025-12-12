/**
 * Expression Page Composable
 *
 * Unit/Chapter 선택 및 세션 관리 로직
 */
import { ref, computed } from 'vue'
import api from '@/services/api'

const SESSION_SIZE = 5  // 세션당 기본 표현 개수

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
    if (total === 0) {
      sessions.value = []
      return
    }

    const remainder = total % SESSION_SIZE
    // 나머지가 1 또는 2개면 마지막 세션에 합침 (5+1=6 또는 5+2=7)
    const shouldMergeRemainder = remainder > 0 && remainder <= 2
    const sessionCount = shouldMergeRemainder
      ? Math.floor(total / SESSION_SIZE)
      : Math.ceil(total / SESSION_SIZE)

    // 세션이 0개가 되는 경우 (total이 1 또는 2) 처리
    const finalSessionCount = sessionCount === 0 ? 1 : sessionCount

    sessions.value = []
    for (let i = 0; i < finalSessionCount; i++) {
      const start = i * SESSION_SIZE
      const isLastSession = i === finalSessionCount - 1
      const end = isLastSession ? total : start + SESSION_SIZE

      sessions.value.push({
        expressions: allExpressions.value.slice(start, end),
        completed: false
      })
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

  /**
   * 유연한 정규식 패턴 생성
   * (someone) → 단어 매칭, one's → 소유격 대명사 등 처리
   */
  const buildFlexiblePattern = (expression) => {
    let pattern = expression

    // 1. 끝에 있는 ~ 제거 (예: "I am writing to~" → "I am writing to")
    pattern = pattern.replace(/\s*~\s*$/g, '')

    // 2. 끝에 있는 ... 또는 ··· 또는 … 제거 (예: "Thank you for..." → "Thank you for")
    pattern = pattern.replace(/\s*(?:\.\.\.|\·\·\·|…)\s*$/g, '')

    // 3. (someone), (somebody) → 단어 매칭
    pattern = pattern.replace(/\(someone\)|\(somebody\)/gi, '(\\w+)')

    // 4. (something) → 비탐욕적 매칭
    pattern = pattern.replace(/\(something\)/gi, '(.+?)')

    // 5. one's → 소유격 대명사
    pattern = pattern.replace(/\bone's\b/gi, "(my|your|his|her|their|its|our|one's)")

    // 6. 중간에 있는 ~ → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/~/g, '(.+?)')

    // 7. 중간에 있는 ... 또는 ··· 또는 … → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/\.\.\.|\·\·\·|…/g, '(.+?)')

    return pattern
  }

  /**
   * 하이라이트 표시 (정규식 매칭)
   */
  const highlightExpression = (text, expression) => {
    if (!text || !expression) return text

    try {
      // 유연한 패턴으로 매칭 시도
      const pattern = buildFlexiblePattern(expression)
      const regex = new RegExp(`(${pattern})`, 'gi')
      const match = regex.exec(text)

      if (match) {
        // 매칭된 부분만 하이라이트
        const matchedText = match[0]
        const startIndex = match.index
        const endIndex = startIndex + matchedText.length

        const before = text.substring(0, startIndex)
        const after = text.substring(endIndex)

        return `${before}<mark class="bg-yellow-300 text-gray-900 font-bold px-1 rounded">${matchedText}</mark>${after}`
      }

      // 패턴 매칭 실패 시 원본 expression으로 시도 (기존 동작)
      const fallbackRegex = new RegExp(`(${expression})`, 'gi')
      return text.replace(fallbackRegex, '<mark class="bg-yellow-300 text-gray-900 font-bold px-1 rounded">$1</mark>')

    } catch (error) {
      console.warn('Highlight regex error:', error)
      // 에러 시 원본 텍스트 반환
      return text
    }
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
