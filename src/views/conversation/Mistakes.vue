<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Mistakes Review</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">Review and practice your mistakes</p>
        </div>
        <div v-if="mistakes.length > 0" class="flex items-center gap-2">
          <button
            v-if="selectedMistakes.size > 0"
            @click="confirmDeleteSelected"
            class="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
          >
            Delete Selected ({{ selectedMistakes.size }})
          </button>
          <button
            @click="confirmClearAll"
            class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8">
      <div class="max-w-7xl mx-auto">
        <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="mistakes.length === 0" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
          <div class="text-center">
            <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon class="w-12 h-12 text-green-500" />
            </div>
            <h2 class="text-xl font-bold text-gray-900 mb-2">Great job!</h2>
            <p class="text-gray-500">No mistakes recorded yet.</p>
            <p class="text-sm text-gray-400 mt-2">Mistakes from quiz sessions will appear here for review.</p>
            <router-link
              to="/conversation/expression"
              class="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Go to Expression Learning
            </router-link>
          </div>
        </div>

        <!-- Mistakes List -->
        <div v-else class="space-y-4">
          <!-- Summary -->
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-gray-900">Total Mistakes</h2>
                <p class="text-sm text-gray-500">{{ mistakes.length }} expressions need review</p>
              </div>
              <div class="text-3xl font-bold text-red-500">{{ mistakes.length }}</div>
            </div>
          </div>

          <!-- Quiz Mode Toggle -->
          <div class="flex gap-4 mb-6">
            <button
              @click="viewMode = 'list'"
              class="flex-1 py-3 rounded-lg font-medium transition"
              :class="viewMode === 'list'
                ? 'bg-black text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'"
            >
              List View
            </button>
            <button
              @click="startQuizMode"
              :disabled="selectedMistakes.size === 0"
              class="flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              :class="viewMode === 'quiz'
                ? 'bg-black text-white'
                : selectedMistakes.size === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'"
            >
              Practice Quiz
              <span v-if="selectedMistakes.size > 0" class="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {{ selectedMistakes.size }}
              </span>
            </button>
          </div>

          <!-- List View (Table) -->
          <div v-if="viewMode === 'list'" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div class="max-h-[60vh] overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th class="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        :checked="isAllSelected"
                        @change="toggleSelectAll"
                        class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                      />
                    </th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Expression</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Example</th>
                    <th class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                    <th class="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                    <th class="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Attempt</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr
                    v-for="mistake in mistakes"
                    :key="mistake.id"
                    class="transition"
                    :class="selectedMistakes.has(mistake.id) ? 'bg-blue-50' : 'hover:bg-gray-50'"
                  >
                    <!-- Checkbox -->
                    <td class="px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        :checked="selectedMistakes.has(mistake.id)"
                        @change="toggleSelect(mistake.id)"
                        class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                      />
                    </td>
                    <!-- Expression -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span class="font-semibold text-gray-900">{{ mistake.expression }}</span>
                        <button
                          @click="playTTS(mistake.expression)"
                          :disabled="ttsLoading"
                          class="p-1 rounded-full hover:bg-gray-200 transition"
                        >
                          <SpeakerWaveIcon class="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">{{ formatMeaning(mistake.meaning) }}</p>
                    </td>
                    <!-- Example -->
                    <td class="px-6 py-4 max-w-xs">
                      <p class="text-sm text-gray-900 line-clamp-2" v-html="highlightExpression(mistake.exampleText, mistake.expression)"></p>
                      <p class="text-xs text-gray-500 mt-1 line-clamp-1">{{ mistake.exampleTranslation }}</p>
                    </td>
                    <!-- Location -->
                    <td class="px-6 py-4">
                      <span class="text-sm text-gray-600">{{ mistake.unit }}</span>
                      <p class="text-xs text-gray-400">{{ mistake.chapter }}</p>
                    </td>
                    <!-- Result -->
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <span class="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                          {{ mistake.incorrectCount }}
                        </span>
                        <span class="text-gray-400">/</span>
                        <span class="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                          {{ mistake.correctCount }}
                        </span>
                      </div>
                    </td>
                    <!-- Last Attempt -->
                    <td class="px-6 py-4 text-right">
                      <span class="text-sm text-gray-500">{{ formatDate(mistake.lastAttemptedAt) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Quiz Mode -->
          <div v-else-if="viewMode === 'quiz'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Practice Quiz</h2>
              <span class="text-sm text-gray-500">{{ currentQuizIndex + 1 }} / {{ quizMistakes.length }}</span>
            </div>

            <div v-if="currentMistake">
              <!-- Question -->
              <div class="bg-gray-50 rounded-xl p-6 mb-4">
                <p class="text-sm text-gray-600 mb-2">Fill in the blank:</p>
                <p class="text-lg font-medium text-gray-900" v-html="currentQuestionHtml"></p>
                <p class="text-gray-600 mt-2">{{ currentMistake.exampleTranslation }}</p>
              </div>

              <!-- Hint -->
              <div class="mb-4">
                <button
                  @click="showHint = !showHint"
                  class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <LightBulbIcon class="w-4 h-4" />
                  {{ showHint ? 'Hide hint' : 'Show hint' }}
                </button>
                <p v-if="showHint" class="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
                  Meaning: {{ formatMeaning(currentMistake.meaning) }}
                </p>
              </div>

              <!-- Answer Input -->
              <div class="mb-4">
                <input
                  v-model="userAnswer"
                  @keyup.enter="checkQuizAnswer"
                  type="text"
                  placeholder="Type your answer"
                  class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black text-lg"
                  :class="{
                    'border-green-500 bg-green-50': answerStatus === 'correct',
                    'border-red-500 bg-red-50': answerStatus === 'wrong',
                    'border-gray-200': answerStatus === null
                  }"
                  :disabled="answerStatus !== null"
                />
              </div>

              <!-- Feedback -->
              <div v-if="answerStatus === 'correct'" class="mb-4 p-4 bg-green-100 rounded-xl">
                <p class="text-green-700 font-semibold flex items-center gap-2">
                  <CheckCircleIcon class="w-5 h-5" />
                  Correct!
                </p>
              </div>
              <div v-else-if="answerStatus === 'wrong'" class="mb-4 p-4 bg-red-100 rounded-xl">
                <p class="text-red-700 font-semibold flex items-center gap-2">
                  <XCircleIcon class="w-5 h-5" />
                  Wrong. Answer: {{ currentMistake.expression }}
                </p>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button
                  v-if="answerStatus === null"
                  @click="checkQuizAnswer"
                  :disabled="!userAnswer.trim()"
                  class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50"
                >
                  Check Answer
                </button>
                <button
                  v-else-if="currentQuizIndex < quizMistakes.length - 1"
                  @click="nextQuizQuestion"
                  class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
                >
                  Next Question
                </button>
                <button
                  v-else
                  @click="finishQuiz"
                  class="flex-1 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Finish Quiz
                </button>
              </div>
            </div>

            <!-- Quiz Progress -->
            <div class="mt-6 pt-6 border-t border-gray-100">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{{ quizCorrectCount }} / {{ quizMistakes.length }} correct</span>
              </div>
              <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-black rounded-full transition-all duration-300"
                  :style="{ width: `${(currentQuizIndex / quizMistakes.length) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear All Confirmation Modal -->
    <div
      v-if="showClearConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Clear All Mistakes?</h3>
        <p class="text-gray-600 mb-6">
          This will remove all your mistake records. This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <button
            @click="showClearConfirm = false"
            class="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            @click="clearAll"
            class="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Selected Confirmation Modal -->
    <div
      v-if="showDeleteSelectedConfirm"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">Delete Selected Mistakes?</h3>
        <p class="text-gray-600 mb-6">
          This will remove {{ selectedMistakes.size }} selected mistake(s). This action cannot be undone.
        </p>
        <div class="flex gap-3">
          <button
            @click="showDeleteSelectedConfirm = false"
            class="flex-1 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            @click="deleteSelected"
            class="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Quiz Complete Modal -->
    <div
      v-if="showQuizComplete"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon class="w-12 h-12 text-green-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
        <p class="text-gray-600 mb-4">
          You reviewed {{ quizMistakes.length }} expressions.
        </p>
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">Score</p>
              <p class="text-2xl font-bold text-gray-900">{{ quizCorrectCount }} / {{ quizMistakes.length }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Accuracy</p>
              <p class="text-2xl font-bold text-green-600">{{ Math.round((quizCorrectCount / quizMistakes.length) * 100) }}%</p>
            </div>
          </div>
        </div>
        <button
          @click="closeQuizComplete"
          class="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api, { pythonAPI } from '@/services/api'
import {
  CheckCircleIcon,
  XCircleIcon,
  SpeakerWaveIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

// State
const loading = ref(true)
const mistakes = ref([])
const viewMode = ref('list')  // 'list' | 'quiz'
const ttsLoading = ref(false)
const showClearConfirm = ref(false)
const showDeleteSelectedConfirm = ref(false)
const selectedMistakes = ref(new Set())

// Quiz State
const quizMistakes = ref([])
const currentQuizIndex = ref(0)
const userAnswer = ref('')
const answerStatus = ref(null)
const showHint = ref(false)
const quizCorrectCount = ref(0)
const showQuizComplete = ref(false)

// Computed
const currentMistake = computed(() => quizMistakes.value[currentQuizIndex.value])

const isAllSelected = computed(() => {
  return mistakes.value.length > 0 && selectedMistakes.value.size === mistakes.value.length
})

const currentQuestionHtml = computed(() => {
  if (!currentMistake.value) return ''
  return currentMistake.value.exampleText.replace(
    new RegExp(currentMistake.value.expression, 'gi'),
    '<span class="px-2 py-1 bg-gray-200 rounded mx-1">________</span>'
  )
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

const playTTS = async (text) => {
  if (!text || ttsLoading.value) return

  ttsLoading.value = true
  try {
    const response = await pythonAPI.post(
      '/expression/speech/synthesize-text',
      { text, voice_name: 'en-US-JennyNeural' },
      { responseType: 'arraybuffer' }
    )

    const audioBlob = new Blob([response.data], { type: 'audio/mp3' })
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
    // Delete each selected mistake
    const deletePromises = Array.from(selectedMistakes.value).map(id => {
      const mistake = mistakes.value.find(m => m.id === id)
      if (mistake) {
        return api.delete(`/expressions/quiz/result/${mistake.expressionId}/${mistake.exampleIndex}`)
      }
      return Promise.resolve()
    })

    await Promise.all(deletePromises)

    // Remove from local list
    mistakes.value = mistakes.value.filter(m => !selectedMistakes.value.has(m.id))
    selectedMistakes.value = new Set()
    showDeleteSelectedConfirm.value = false
  } catch (error) {
    console.error('Failed to delete selected mistakes:', error)
    alert('Failed to delete selected mistakes')
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

// Shuffle array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Quiz Methods
const startQuizMode = () => {
  // Filter selected mistakes and shuffle them
  const selected = mistakes.value.filter(m => selectedMistakes.value.has(m.id))
  quizMistakes.value = shuffleArray(selected)
  currentQuizIndex.value = 0
  userAnswer.value = ''
  answerStatus.value = null
  showHint.value = false
  quizCorrectCount.value = 0
  viewMode.value = 'quiz'
}

const checkQuizAnswer = async () => {
  if (!userAnswer.value.trim()) return

  const isCorrect = userAnswer.value.trim().toLowerCase() === currentMistake.value.expression.toLowerCase()
  answerStatus.value = isCorrect ? 'correct' : 'wrong'

  if (isCorrect) {
    quizCorrectCount.value++
  }

  // Update local mistakes list immediately
  const mistakeId = currentMistake.value.id
  const mistakeIndex = mistakes.value.findIndex(m => m.id === mistakeId)
  if (mistakeIndex !== -1) {
    if (isCorrect) {
      mistakes.value[mistakeIndex].correctCount++
    } else {
      mistakes.value[mistakeIndex].incorrectCount++
    }
  }

  // Save quiz result
  try {
    await api.post('/expressions/quiz/result', {
      expressionId: currentMistake.value.expressionId,
      exampleIndex: currentMistake.value.exampleIndex,
      isCorrect: isCorrect
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
  viewMode.value = 'list'
  fetchMistakes()  // Refresh mistakes list
}

// Lifecycle
onMounted(() => {
  fetchMistakes()
})
</script>
