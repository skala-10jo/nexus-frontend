/**
 * Mistakes Page Composable
 *
 * 오답 목록 관리, 선택, 삭제 로직
 *
 * 리팩토링: Service/Utils/Composable 레이어 분리
 * - API 호출: mistakesService
 * - 포맷팅: formatters
 * - TTS: useTTS composable
 */
import { ref, computed } from 'vue'
import { mistakesService } from '@/services/conversation/mistakesService'
import { formatMeaning, formatDate, highlightExpression } from '@/utils/formatters'
import { useTTS } from '@/composables/common/useTTS'

export function useMistakesPage() {
  // TTS Composable
  const { ttsLoading, playTTS } = useTTS()

  // State
  const loading = ref(true)
  const mistakes = ref([])
  const viewMode = ref('list') // 'list' | 'quiz'
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
      const response = await mistakesService.getMistakes()
      mistakes.value = response.data.data || []
    } catch (error) {
      console.error('Failed to fetch mistakes:', error)
      mistakes.value = []
    } finally {
      loading.value = false
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
      selectedMistakes.value = new Set(mistakes.value.map((m) => m.id))
    }
  }

  // Delete Methods
  const confirmClearAll = () => {
    showClearConfirm.value = true
  }

  const clearAll = async () => {
    try {
      await mistakesService.deleteAllMistakes()
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
      const deletePromises = Array.from(selectedMistakes.value).map((id) => {
        const mistake = mistakes.value.find((m) => m.id === id)
        if (mistake) {
          return mistakesService.deleteMistake(mistake.expressionId, mistake.exampleIndex)
        }
        return Promise.resolve()
      })

      await Promise.all(deletePromises)

      mistakes.value = mistakes.value.filter((m) => !selectedMistakes.value.has(m.id))
      selectedMistakes.value = new Set()
      showDeleteSelectedConfirm.value = false
    } catch (error) {
      console.error('Failed to delete selected mistakes:', error)
      alert('Failed to delete selected mistakes')
    }
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

    // Helpers (from utils)
    formatMeaning,
    formatDate,
    highlightExpression
  }
}
