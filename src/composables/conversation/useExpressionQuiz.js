/**
 * Expression Quiz Composable
 *
 * 빈칸 채우기 퀴즈 로직
 */
import { ref, computed } from 'vue'
import api from '@/services/api'

export function useExpressionQuiz(currentSessionExpressions, formatMeaning) {
  // State
  const quizQuestions = ref([])
  const currentQuizIndex = ref(0)
  const userAnswer = ref('')
  const answerStatus = ref(null) // null | 'correct' | 'wrong'
  const showHint = ref(false)
  const quizCorrectCount = ref(0)
  const showCompletionModal = ref(false)

  // Computed
  const currentQuizQuestion = computed(() => {
    return quizQuestions.value[currentQuizIndex.value] || null
  })

  // Methods
  const generateQuizQuestions = () => {
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
        answer: expression
      }
    })
  }

  const goToQuiz = () => {
    generateQuizQuestions()
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
