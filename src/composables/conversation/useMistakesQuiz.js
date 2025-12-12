/**
 * Mistakes Quiz Composable
 *
 * 오답 복습 퀴즈 로직
 *
 * 리팩토링: Service/Utils 레이어 분리
 * - API 호출: mistakesService
 * - 셔플: formatters.shuffleArray
 */
import { ref, computed } from 'vue'
import { mistakesService } from '@/services/conversation/mistakesService'
import { shuffleArray } from '@/utils/formatters'

export function useMistakesQuiz(mistakes, selectedMistakes) {
  // State
  const quizMistakes = ref([])
  const currentQuizIndex = ref(0)
  const userAnswer = ref('')
  const answerStatus = ref(null) // null | 'correct' | 'wrong'
  const showHint = ref(false)
  const quizCorrectCount = ref(0)
  const showQuizComplete = ref(false)

  // Computed
  const currentMistake = computed(() => quizMistakes.value[currentQuizIndex.value])

  const currentQuestionHtml = computed(() => {
    if (!currentMistake.value) return ''
    return currentMistake.value.exampleText.replace(
      new RegExp(currentMistake.value.expression, 'gi'),
      '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
    )
  })

  // Methods
  const startQuizMode = () => {
    const selected = mistakes.value.filter((m) => selectedMistakes.value.has(m.id))
    quizMistakes.value = shuffleArray(selected)
    currentQuizIndex.value = 0
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
    quizCorrectCount.value = 0
  }

  const checkQuizAnswer = async () => {
    if (!userAnswer.value.trim()) return

    const isCorrect =
      userAnswer.value.trim().toLowerCase() === currentMistake.value.expression.toLowerCase()
    answerStatus.value = isCorrect ? 'correct' : 'wrong'

    if (isCorrect) {
      quizCorrectCount.value++
    }

    // Update local mistakes list immediately
    const mistakeId = currentMistake.value.id
    const mistakeIndex = mistakes.value.findIndex((m) => m.id === mistakeId)
    if (mistakeIndex !== -1) {
      if (isCorrect) {
        mistakes.value[mistakeIndex].correctCount++
      } else {
        mistakes.value[mistakeIndex].incorrectCount++
      }
    }

    // Save quiz result via service
    try {
      await mistakesService.saveQuizResult({
        expressionId: currentMistake.value.expressionId,
        exampleIndex: currentMistake.value.exampleIndex,
        isCorrect
      })
    } catch (error) {
      console.error('Failed to save quiz result:', error)
    }
  }

  const nextQuizQuestion = () => {
    currentQuizIndex.value++
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
  }

  const finishQuiz = () => {
    showQuizComplete.value = true
  }

  const closeQuizComplete = () => {
    showQuizComplete.value = false
  }

  const resetQuiz = () => {
    quizMistakes.value = []
    currentQuizIndex.value = 0
    userAnswer.value = ''
    answerStatus.value = null
    showHint.value = false
    quizCorrectCount.value = 0
    showQuizComplete.value = false
  }

  return {
    // State
    quizMistakes,
    currentQuizIndex,
    userAnswer,
    answerStatus,
    showHint,
    quizCorrectCount,
    showQuizComplete,

    // Computed
    currentMistake,
    currentQuestionHtml,

    // Methods
    startQuizMode,
    checkQuizAnswer,
    nextQuizQuestion,
    finishQuiz,
    closeQuizComplete,
    resetQuiz
  }
}
