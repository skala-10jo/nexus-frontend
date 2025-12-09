/**
 * Expression Page Composable
 *
 * Unit/Chapter 선택 및 세션 관리 로직
 * AI Agent를 통한 expression-sentence 매칭 지원
 */
import { ref, computed } from 'vue'
import api from '@/services/api'
import {
  tryLocalRegexMatch,
  findMatch,
  findMatchBatch,
  createHighlightHtml
} from '@/services/expressionMatchService'

const SESSION_SIZE = 5  // 세션당 기본 표현 개수

// Module-level match cache (싱글톤처럼 동작)
const globalMatchCache = new Map()

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

  // 매칭 사전 계산 상태
  const isPrecomputingMatches = ref(false)
  const precomputeProgress = ref(0)

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

  const startSession = async (sessionIndex) => {
    currentSessionIndex.value = sessionIndex
    currentExpressionIndex.value = 0
    currentView.value = 'practice'

    // 세션 예문들의 매칭 결과 사전 계산
    const sessionExpressions = sessions.value[sessionIndex]?.expressions || []
    if (sessionExpressions.length > 0) {
      await precomputeMatchesForSession(sessionExpressions)
    }
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

  /**
   * 세션의 모든 예문에 대해 매칭 결과를 사전 계산
   * 배치 처리로 AI API 호출 최적화
   *
   * Phase 1: 로컬 정규식으로 빠르게 처리 (동기)
   * Phase 2: 실패한 항목들만 배치 API로 한번에 처리 (비동기)
   */
  const precomputeMatchesForSession = async (expressions) => {
    isPrecomputingMatches.value = true
    precomputeProgress.value = 0

    const totalItems = expressions.reduce((sum, expr) => sum + expr.examples.length, 0)
    let processedItems = 0

    try {
      // Phase 1: 로컬 정규식 매칭 (빠름)
      const needsAiFallback = []

      for (const expr of expressions) {
        for (let i = 0; i < expr.examples.length; i++) {
          const example = expr.examples[i]
          const cacheKey = `${expr.id}:${i}`

          // 이미 캐시에 있으면 스킵
          if (globalMatchCache.has(cacheKey)) {
            processedItems++
            continue
          }

          // 로컬 정규식 매칭 시도
          const localResult = tryLocalRegexMatch(expr.expression, example.text)

          if (localResult && localResult.matched) {
            // 성공: 캐시에 저장
            globalMatchCache.set(cacheKey, localResult)
            processedItems++
          } else {
            // 실패: AI fallback 대상에 추가
            needsAiFallback.push({
              expression: expr.expression,
              sentence: example.text,
              cacheKey
            })
          }
        }
      }

      // Phase 1 완료 진행률 업데이트
      precomputeProgress.value = Math.round((processedItems / totalItems) * 100)

      // Phase 2: AI Fallback 배치 처리 (한번에)
      if (needsAiFallback.length > 0) {
        console.log(`[Precompute] AI batch fallback for ${needsAiFallback.length} items`)

        const batchItems = needsAiFallback.map(item => ({
          expression: item.expression,
          sentence: item.sentence
        }))

        const batchResponse = await findMatchBatch(batchItems, true)
        const results = batchResponse.results || []

        // 배치 결과를 캐시에 저장
        for (let i = 0; i < needsAiFallback.length; i++) {
          const { cacheKey } = needsAiFallback[i]
          const matchResult = results[i] || { matched: false }
          globalMatchCache.set(cacheKey, matchResult)

          processedItems++
          precomputeProgress.value = Math.round((processedItems / totalItems) * 100)
        }
      }

    } catch (error) {
      console.error('Precompute matches failed:', error)
    } finally {
      isPrecomputingMatches.value = false
    }
  }

  /**
   * 캐시에서 매칭 결과 조회
   */
  const getCachedMatch = (expressionId, exampleIndex) => {
    const cacheKey = `${expressionId}:${exampleIndex}`
    return globalMatchCache.get(cacheKey) || null
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
    // ~ 뒤의 내용은 가변적이므로 ~ 앞까지만 매칭
    pattern = pattern.replace(/\s*~\s*$/g, '')

    // 2. 끝에 있는 ... 제거 (예: "Thank you for..." → "Thank you for")
    pattern = pattern.replace(/\s*\.\.\.\s*$/g, '')

    // 3. (someone), (somebody) → 단어 매칭
    pattern = pattern.replace(/\(someone\)|\(somebody\)/gi, '(\\w+)')

    // 4. (something) → 비탐욕적 매칭
    pattern = pattern.replace(/\(something\)/gi, '(.+?)')

    // 5. one's → 소유격 대명사
    pattern = pattern.replace(/\bone's\b/gi, "(my|your|his|her|their|its|our|one's)")

    // 6. 중간에 있는 ~ → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/~/g, '(.+?)')

    // 7. 중간에 있는 ... → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/\.\.\./g, '(.+?)')

    return pattern
  }

  /**
   * 하이라이트 표시 (캐시 사용)
   * expressionId와 exampleIndex가 제공되면 캐시된 결과 사용
   * 없으면 기존 정규식 방식으로 fallback
   */
  const highlightExpression = (text, expression, expressionId = null, exampleIndex = null) => {
    if (!text || !expression) return text

    // 캐시된 매칭 결과가 있으면 사용
    if (expressionId !== null && exampleIndex !== null) {
      const cachedMatch = getCachedMatch(expressionId, exampleIndex)
      if (cachedMatch && cachedMatch.matched) {
        return createHighlightHtml(text, cachedMatch)
      }
    }

    // 캐시가 없으면 기존 정규식 방식으로 fallback
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
    isPrecomputingMatches,
    precomputeProgress,

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

    // Match Cache
    getCachedMatch,
    precomputeMatchesForSession,

    // Helpers
    formatMeaning,
    highlightExpression,
    getProgressBarColor
  }
}
