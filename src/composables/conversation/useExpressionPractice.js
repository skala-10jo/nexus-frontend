/**
 * Expression Practice Composable
 *
 * TTS 재생 및 연습 완료 상태 관리
 */
import { ref, computed } from 'vue'
import { pythonAPI } from '@/services/api'

export function useExpressionPractice(currentSessionExpressions, currentExpression) {
  // State
  const practiceCompletedSet = ref(new Set())
  const ttsLoading = ref(false)

  // Computed
  const practiceCompletedForCurrent = computed(() => {
    return practiceCompletedSet.value.has(currentExpression.value?.id)
  })

  const practiceCompletedCount = computed(() => {
    return practiceCompletedSet.value.size
  })

  const allPracticeCompleted = computed(() => {
    return currentSessionExpressions.value.length > 0 &&
      practiceCompletedSet.value.size >= currentSessionExpressions.value.length
  })

  // Methods
  const playTTS = async (text) => {
    if (!text || ttsLoading.value) return

    ttsLoading.value = true
    try {
      const response = await pythonAPI.post(
        '/expression/speech/synthesize-text',
        { text, voice_name: 'en-US-JennyNeural' },
        { responseType: 'arraybuffer' }
      )

      const audioBlob = new Blob([response.data], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audio.play()
      audio.onended = () => URL.revokeObjectURL(audioUrl)
    } catch (error) {
      console.error('TTS failed:', error)
      alert('음성 합성에 실패했습니다.')
    } finally {
      ttsLoading.value = false
    }
  }

  const markPracticeComplete = (expressionId) => {
    practiceCompletedSet.value.add(expressionId)
  }

  const resetPractice = () => {
    practiceCompletedSet.value = new Set()
  }

  return {
    // State
    practiceCompletedSet,
    ttsLoading,

    // Computed
    practiceCompletedForCurrent,
    practiceCompletedCount,
    allPracticeCompleted,

    // Methods
    playTTS,
    markPracticeComplete,
    resetPractice
  }
}
