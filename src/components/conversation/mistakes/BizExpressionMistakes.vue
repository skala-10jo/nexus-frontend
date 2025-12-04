<template>
    <div class="h-full flex flex-col">
        <div class="flex-1 overflow-y-auto p-8">
            <div class="max-w-7xl mx-auto">
                <!-- Loading -->
                <div v-if="loading" class="flex justify-center items-center py-12">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>

                <!-- Empty State -->
                <div v-else-if="mistakes.length === 0"
                    class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircleIcon class="w-12 h-12 text-green-500" />
                        </div>
                        <h2 class="text-xl font-bold text-gray-900 mb-2">Great job!</h2>
                        <p class="text-gray-500">No mistakes recorded yet.</p>
                        <p class="text-sm text-gray-400 mt-2">Mistakes from quiz sessions will appear here for review.
                        </p>
                        <router-link to="/conversation/expression"
                            class="inline-block mt-6 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
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
                                <h2 class="text-lg font-semibold text-gray-900">오답 개수</h2>
                            </div>
                            <div class="flex items-center gap-4">
                                <!-- Action Buttons -->
                                <div class="flex items-center gap-2" v-if="viewMode === 'list'">
                                    <button v-if="selectedMistakes.size > 0" @click="confirmDeleteSelected"
                                        class="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium">
                                        선택 항목 삭제하기 ({{ selectedMistakes.size }})
                                    </button>

                                    <button @click="handleStartQuizMode" :disabled="selectedMistakes.size === 0"
                                        class="px-3 py-1.5 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                        퀴즈 풀기
                                        <span v-if="selectedMistakes.size > 0"
                                            class="px-1.5 py-0.5 bg-white/20 text-white text-xs rounded-full">
                                            {{ selectedMistakes.size }}
                                        </span>
                                    </button>
                                </div>
                                <div class="w-px h-8 bg-gray-100 mx-2"></div>
                                <div class="text-3xl font-bold text-red-500">{{ mistakes.length }}</div>
                            </div>
                        </div>
                    </div>

                    <!-- List View (Table) -->
                    <MistakesTable v-if="viewMode === 'list'" :mistakes="mistakes" :selected-mistakes="selectedMistakes"
                        :is-all-selected="isAllSelected" :tts-loading="ttsLoading" :format-meaning="formatMeaning"
                        :format-date="formatDate" :highlight-expression="highlightExpression"
                        @toggle-select="toggleSelect" @toggle-select-all="toggleSelectAll" @play-tts="playTTS" />

                    <!-- Quiz Mode -->
                    <MistakesQuizCard v-else-if="viewMode === 'quiz'" :mistake="currentMistake"
                        :question-html="currentQuestionHtml" :current-index="currentQuizIndex"
                        :total-count="quizMistakes.length" :correct-count="quizCorrectCount"
                        v-model:user-answer="userAnswer" :answer-status="answerStatus" :show-hint="showHint"
                        :is-last-question="currentQuizIndex >= quizMistakes.length - 1" :format-meaning="formatMeaning"
                        @check-answer="checkQuizAnswer" @next-question="nextQuizQuestion" @finish-quiz="finishQuiz"
                        @toggle-hint="showHint = !showHint" />
                </div>
            </div>
        </div>

        <!-- Clear All Confirmation Modal -->
        <MistakesConfirmModal :show="showClearConfirm" title="Clear All Mistakes?"
            message="This will remove all your mistake records. This action cannot be undone." confirm-text="Clear All"
            @cancel="showClearConfirm = false" @confirm="clearAll" />

        <!-- Delete Selected Confirmation Modal -->
        <MistakesConfirmModal :show="showDeleteSelectedConfirm" title="Delete Selected Mistakes?"
            :message="`This will remove ${selectedMistakes.size} selected mistake(s). This action cannot be undone.`"
            confirm-text="Delete" @cancel="showDeleteSelectedConfirm = false" @confirm="deleteSelected" />

        <!-- Quiz Complete Modal -->
        <MistakesQuizCompleteModal :show="showQuizComplete" :correct-count="quizCorrectCount"
            :total-count="quizMistakes.length" @close="handleCloseQuizComplete" />
    </div>
</template>

<script setup>
import { onMounted, defineExpose } from 'vue'
import { CheckCircleIcon } from '@heroicons/vue/24/outline'

// Components
import MistakesTable from '@/components/conversation/mistakes/MistakesTable.vue'
import MistakesQuizCard from '@/components/conversation/mistakes/MistakesQuizCard.vue'
import MistakesConfirmModal from '@/components/conversation/mistakes/MistakesConfirmModal.vue'
import MistakesQuizCompleteModal from '@/components/conversation/mistakes/MistakesQuizCompleteModal.vue'

// Composables
import { useMistakesPage } from '@/composables/conversation/useMistakesPage'
import { useMistakesQuiz } from '@/composables/conversation/useMistakesQuiz'

// Page Logic
const {
    loading,
    mistakes,
    viewMode,
    ttsLoading,
    selectedMistakes,
    showClearConfirm,
    showDeleteSelectedConfirm,
    isAllSelected,
    fetchMistakes,
    playTTS,
    toggleSelect,
    toggleSelectAll,
    confirmClearAll,
    clearAll,
    confirmDeleteSelected,
    deleteSelected,
    formatMeaning,
    formatDate,
    highlightExpression
} = useMistakesPage()

// Quiz Logic
const {
    quizMistakes,
    currentQuizIndex,
    userAnswer,
    answerStatus,
    showHint,
    quizCorrectCount,
    showQuizComplete,
    currentMistake,
    currentQuestionHtml,
    startQuizMode,
    checkQuizAnswer,
    nextQuizQuestion,
    finishQuiz,
    closeQuizComplete
} = useMistakesQuiz(mistakes, selectedMistakes)

// Event Handlers
const handleStartQuizMode = () => {
    startQuizMode()
    viewMode.value = 'quiz'
}

const handleCloseQuizComplete = () => {
    closeQuizComplete()
    viewMode.value = 'list'
    fetchMistakes()
}

// Expose methods/state needed by parent if any (e.g. for header buttons)
// In this case, the parent might need to know if we are in quiz mode or have items to clear
// But for now, let's keep the logic self-contained as much as possible.
// The "Clear All" and "Exit Quiz" buttons were in the header in the original file.
// We should probably move them inside this component or expose them.
// Looking at the original file, they were in the header.
// To keep the header clean in the parent, I'll expose necessary state/methods or move the buttons here.
// The design in the original file had them in the header.
// Let's see... the user wants tabs.
// If I move the buttons inside this component, they will be part of the tab content.
// That seems appropriate since they are specific to this tab.
// I will keep them inside this component's template (I already included the logic, but need to check if I included the buttons in the template).
// Wait, I didn't include the header buttons in the template above.
// I should add a header section within this component or just place them at the top of the content.
// Actually, the original file had a sticky header.
// I will add a top bar within this component for those actions.

defineExpose({
    viewMode,
    mistakes,
    confirmClearAll
})

// Lifecycle
onMounted(() => {
    fetchMistakes()
})
</script>
