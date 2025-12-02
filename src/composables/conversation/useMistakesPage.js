/**
 * Mistakes Page Composable
 *
 * 오답 목록 관리, 선택, 삭제 로직
 */
import { ref, computed } from 'vue'
import api, { pythonAPI } from '@/services/api'

export function useMistakesPage() {
  // State
  const loading = ref(true)
  const mistakes = ref([])
  const viewMode = ref('list') // 'list' | 'quiz'
  const ttsLoading = ref(false)
  const selectedMistakes = ref(new Set())
  const showClearConfirm = ref(false)
  const showDeleteSelectedConfirm = ref(false)

  // Computed
  const isAllSelected = computed(() => {
    return mistakes.value.length > 0 && selectedMistakes.value.size === mistakes.value.length
  })

  // Methods
  const fetchMistakes = async () => {
    loading.value = true
    try {
      const response = await api.get('/expressions/mistakes')
      mistakes.value = response.data.data || []
    } catch (error) {
      console.error('Failed to fetch mistakes:', error)
      mistakes.value = []
    } finally {
      loading.value = false
    }
  }

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
    } finally {
      ttsLoading.value = false
    }
  }

  // Selection Methods
  const toggleSelect = (id) => {
    const newSet = new Set(selectedMistakes.value)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    selectedMistakes.value = newSet
  }

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedMistakes.value = new Set()
    } else {
      selectedMistakes.value = new Set(mistakes.value.map(m => m.id))
    }
  }

  // Delete Methods
  const confirmClearAll = () => {
    showClearConfirm.value = true
  }

  const clearAll = async () => {
    try {
      await api.delete('/expressions/quiz/results')
      mistakes.value = []
      selectedMistakes.value = new Set()
      showClearConfirm.value = false
    } catch (error) {
      console.error('Failed to clear mistakes:', error)
      alert('Failed to clear mistakes')
    }
  }

  const confirmDeleteSelected = () => {
    showDeleteSelectedConfirm.value = true
  }

  const deleteSelected = async () => {
    try {
      const deletePromises = Array.from(selectedMistakes.value).map(id => {
        const mistake = mistakes.value.find(m => m.id === id)
        if (mistake) {
          return api.delete(`/expressions/quiz/result/${mistake.expressionId}/${mistake.exampleIndex}`)
        }
        return Promise.resolve()
      })

      await Promise.all(deletePromises)

      mistakes.value = mistakes.value.filter(m => !selectedMistakes.value.has(m.id))
      selectedMistakes.value = new Set()
      showDeleteSelectedConfirm.value = false
    } catch (error) {
      console.error('Failed to delete selected mistakes:', error)
      alert('Failed to delete selected mistakes')
    }
  }

  // Helpers
  const formatMeaning = (meaning) => {
    if (!meaning) return ''
    return meaning.replace(/[{}]/g, '')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const highlightExpression = (text, expression) => {
    if (!text || !expression) return text
    const regex = new RegExp(`(${expression})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-gray-900 font-semibold px-1 rounded">$1</mark>')
  }

  return {
    // State
    loading,
    mistakes,
    viewMode,
    ttsLoading,
    selectedMistakes,
    showClearConfirm,
    showDeleteSelectedConfirm,

    // Computed
    isAllSelected,

    // Methods
    fetchMistakes,
    playTTS,
    toggleSelect,
    toggleSelectAll,
    confirmClearAll,
    clearAll,
    confirmDeleteSelected,
    deleteSelected,

    // Helpers
    formatMeaning,
    formatDate,
    highlightExpression
  }
}
