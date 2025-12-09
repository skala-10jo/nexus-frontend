/**
 * Expression Quiz Composable
 *
 * 빈칸 채우기 퀴즈 로직
 * AI Fallback을 통해 특수문자/대명사 변형 처리
 */
import { ref, computed } from 'vue'
import api from '@/services/api'
import {
  tryLocalRegexMatch,
  findMatchBatch,
  createBlankHtml
} from '@/services/expressionMatchService'

export function useExpressionQuiz(currentSessionExpressions, formatMeaning) {
  // State
  const quizQuestions = ref([])
  const currentQuizIndex = ref(0)
  const userAnswer = ref('')
  const answerStatus = ref(null) // null | 'correct' | 'wrong'
  const showHint = ref(false)
  const quizCorrectCount = ref(0)
  const showCompletionModal = ref(false)
  const isGeneratingQuiz = ref(false) // 퀴즈 생성 로딩 상태

  // Computed
  const currentQuizQuestion = computed(() => {
    return quizQuestions.value[currentQuizIndex.value] || null
  })

  // Methods
  /**
   * 퀴즈 문제 생성
   * 배치 처리로 AI API 호출 최적화
   *
   * Phase 1: 로컬 정규식으로 빠르게 처리
   * Phase 2: 실패한 항목들만 배치 API로 한번에 처리
   */
  const generateQuizQuestions = async () => {
    isGeneratingQuiz.value = true

    try {
      // 각 expression에서 랜덤 예문 선택
      const quizItems = currentSessionExpressions.value.map(expr => {
        const exampleIndex = Math.floor(Math.random() * expr.examples.length)
        const example = expr.examples[exampleIndex]
        return {
          expr,
          exampleIndex,
          example,
          expression: expr.expression
        }
      })

      // Phase 1: 로컬 정규식 매칭 (빠름)
      const needsAiFallback = []
      const matchResults = new Map()

      for (const item of quizItems) {
        const localResult = tryLocalRegexMatch(item.expression, item.example.text)

        if (localResult && localResult.matched) {
          matchResults.set(item.expr.id, localResult)
        } else {
          needsAiFallback.push({
            expressionId: item.expr.id,
            expression: item.expression,
            sentence: item.example.text
          })
        }
      }

      // Phase 2: AI Fallback 배치 처리 (한번에)
      if (needsAiFallback.length > 0) {
        console.log(`[Quiz] AI batch fallback for ${needsAiFallback.length} items`)

        const batchItems = needsAiFallback.map(item => ({
          expression: item.expression,
          sentence: item.sentence
        }))

        const batchResponse = await findMatchBatch(batchItems, true)
        const results = batchResponse.results || []

        for (let i = 0; i < needsAiFallback.length; i++) {
          const { expressionId } = needsAiFallback[i]
          matchResults.set(expressionId, results[i] || { matched: false })
        }
      }

      // 퀴즈 문제 생성
      const questions = quizItems.map(item => {
        const matchResult = matchResults.get(item.expr.id)

        let questionHtml
        let answer

        if (matchResult && matchResult.matched) {
          questionHtml = createBlankHtml(item.example.text, matchResult)
          answer = matchResult.matched_text
        } else {
          // 매칭 실패 시 원본 expression 사용 (기존 동작)
          questionHtml = item.example.text.replace(
            new RegExp(item.expression, 'gi'),
            '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
          )
          answer = item.expression
        }

        return {
          expressionId: item.expr.id,
          exampleIndex: item.exampleIndex,
          expression: item.expression,
          meaning: formatMeaning(item.expr.meaning),
          originalText: item.example.text,
          questionHtml,
          translation: item.example.translation,
          answer,
          matchMethod: matchResult?.method || 'fallback'
        }
      })

      quizQuestions.value = questions
    } catch (error) {
      console.error('Failed to generate quiz questions:', error)
      // 에러 시 기존 방식으로 폴백
      quizQuestions.value = currentSessionExpressions.value.map(expr => {
        const exampleIndex = Math.floor(Math.random() * expr.examples.length)
        const example = expr.examples[exampleIndex]
        const expression = expr.expression

        const questionHtml = example.text.replace(
          new RegExp(expression, 'gi'),
          '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
        )

        return {
          expressionId: expr.id,
          exampleIndex,
          expression,
          meaning: formatMeaning(expr.meaning),
          originalText: example.text,
          questionHtml,
          translation: example.translation,
          answer: expression,
          matchMethod: 'error_fallback'
        }
      })
    } finally {
      isGeneratingQuiz.value = false
    }
  }

  const goToQuiz = async () => {
    await generateQuizQuestions()
    currentQuizIndex.value = 0
    quizCorrectCount.value = 0
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
  }

  const checkAnswer = async () => {
    if (!userAnswer.value.trim()) return

    const isCorrect = userAnswer.value.trim().toLowerCase() === currentQuizQuestion.value.answer.toLowerCase()
    answerStatus.value = isCorrect ? 'correct' : 'wrong'

    if (isCorrect) {
      quizCorrectCount.value++
    }

    // Save quiz result to backend
    try {
      await api.post('/expressions/quiz/result', {
        expressionId: currentQuizQuestion.value.expressionId,
        exampleIndex: currentQuizQuestion.value.exampleIndex,
        isCorrect
      })
    } catch (error) {
      console.error('Failed to save quiz result:', error)
    }
  }

  const nextQuiz = () => {
    currentQuizIndex.value++
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
  }

  const completeSession = async (expressionIds, onComplete) => {
    try {
      await api.post('/expressions/learned', { expressionIds })
      showCompletionModal.value = true
      if (onComplete) onComplete()
    } catch (error) {
      console.error('Failed to mark as learned:', error)
      alert('학습 완료 처리에 실패했습니다.')
    }
  }

  const resetQuiz = () => {
    quizQuestions.value = []
    currentQuizIndex.value = 0
    quizCorrectCount.value = 0
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
    showCompletionModal.value = false
  }

  return {
    // State
    quizQuestions,
    currentQuizIndex,
    userAnswer,
    answerStatus,
    showHint,
    quizCorrectCount,
    showCompletionModal,
    isGeneratingQuiz,

    // Computed
    currentQuizQuestion,

    // Methods
    goToQuiz,
    checkAnswer,
    nextQuiz,
    completeSession,
    resetQuiz
  }
}
