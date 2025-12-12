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
  const isGeneratingQuiz = ref(false)

  // Computed
  const currentQuizQuestion = computed(() => {
    return quizQuestions.value[currentQuizIndex.value] || null
  })

  /**
   * 유연한 정규식 패턴 생성
   */
  const buildFlexiblePattern = (expression) => {
    let pattern = expression

    // 1. 끝에 있는 ~ 제거
    pattern = pattern.replace(/\s*~\s*$/g, '')

    // 2. 끝에 있는 ... 또는 ··· 또는 … 제거
    pattern = pattern.replace(/\s*(?:\.\.\.|\·\·\·|…)\s*$/g, '')

    // 3. (someone), (somebody) → 단어 매칭
    pattern = pattern.replace(/\(someone\)|\(somebody\)/gi, '(\\w+)')

    // 4. (something) → 비탐욕적 매칭
    pattern = pattern.replace(/\(something\)/gi, '(.+?)')

    // 5. one's → 소유격 대명사
    pattern = pattern.replace(/\bone's\b/gi, "(my|your|his|her|their|its|our|one's)")

    // 6. 중간에 있는 ~ → 가변 텍스트
    pattern = pattern.replace(/~/g, '(.+?)')

    // 7. 중간에 있는 ... 또는 ··· 또는 … → 가변 텍스트
    pattern = pattern.replace(/\.\.\.|\·\·\·|…/g, '(.+?)')

    return pattern
  }

  /**
   * 빈칸 HTML 생성
   */
  const createBlankHtml = (text, startIndex, endIndex) => {
    const before = text.substring(0, startIndex)
    const after = text.substring(endIndex)
    return `${before}<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>${after}`
  }

  /**
   * 퀴즈 문제 생성 (단순 정규식 매칭)
   */
  const generateQuizQuestions = () => {
    isGeneratingQuiz.value = true

    try {
      const questions = currentSessionExpressions.value.map(expr => {
        const exampleIndex = Math.floor(Math.random() * expr.examples.length)
        const example = expr.examples[exampleIndex]
        const expression = expr.expression

        let questionHtml
        let answer

        try {
          // 유연한 패턴으로 매칭 시도
          const pattern = buildFlexiblePattern(expression)
          const regex = new RegExp(`(${pattern})`, 'gi')
          const match = regex.exec(example.text)

          if (match) {
            const matchedText = match[0]
            const startIndex = match.index
            const endIndex = startIndex + matchedText.length

            questionHtml = createBlankHtml(example.text, startIndex, endIndex)
            answer = matchedText
          } else {
            // 패턴 매칭 실패 시 원본 expression 사용
            questionHtml = example.text.replace(
              new RegExp(expression, 'gi'),
              '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
            )
            answer = expression
          }
        } catch (error) {
          console.warn('Regex error for expression:', expression, error)
          questionHtml = example.text.replace(
            new RegExp(expression, 'gi'),
            '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
          )
          answer = expression
        }

        return {
          expressionId: expr.id,
          exampleIndex,
          expression,
          meaning: formatMeaning(expr.meaning),
          originalText: example.text,
          questionHtml,
          translation: example.translation,
          answer
        }
      })

      quizQuestions.value = questions
    } catch (error) {
      console.error('Failed to generate quiz questions:', error)
      quizQuestions.value = []
    } finally {
      isGeneratingQuiz.value = false
    }
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
