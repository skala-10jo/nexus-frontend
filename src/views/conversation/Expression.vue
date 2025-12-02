<template>
  <div class="h-full flex flex-col bg-gray-50/50">
    <!-- Header -->
    <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">Biz Expression</h1>
          <p class="text-sm text-gray-500 mt-1 font-medium">Learn business expressions with pronunciation practice</p>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 pt-4 pb-12">
      <div class="w-full max-w-[1920px] mx-auto">

    <!-- Progress Indicator -->
    <div v-if="currentView !== 'selection'" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
      <div class="flex items-center gap-4">
        <button
          @click="handleBackButton"
          class="flex-shrink-0 text-gray-600 hover:text-gray-800 transition"
        >
          <ChevronLeftIcon class="w-5 h-5" />
        </button>
        <div class="flex-shrink-0">
          <p class="text-xs text-gray-500">{{ selectedUnit }} > {{ selectedChapter }} > Session {{ currentSessionIndex + 1 }}</p>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-sm font-semibold" :class="currentView === 'practice' ? 'text-blue-600' : 'text-green-600'">
              {{ currentView === 'practice' ? 'Practice' : 'Quiz' }}
            </span>
            <span v-if="currentView === 'practice'" class="text-xs text-gray-500">
              {{ practiceCompletedCount }}/{{ currentSessionExpressions.length }}
            </span>
            <span v-else class="text-xs text-gray-500">
              {{ currentQuizIndex + 1 }}/{{ quizQuestions.length }}
            </span>
          </div>
        </div>
        <!-- Session Progress Bar -->
        <div v-if="currentView === 'practice'" class="flex-1 flex items-center gap-3">
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-blue-600 rounded-full transition-all duration-300"
              :style="{ width: `${(practiceCompletedCount / currentSessionExpressions.length) * 100}%` }"
            ></div>
          </div>
          <button
            v-if="allPracticeCompleted"
            @click="goToQuiz"
            class="flex-shrink-0 px-4 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition flex items-center gap-1"
          >
            <AcademicCapIcon class="w-4 h-4" />
            퀴즈
          </button>
        </div>
      </div>
    </div>

    <!-- View: Unit/Chapter Selection (Redesigned) -->
    <div v-if="currentView === 'selection'">
      <!-- All Units with Nested Chapters in 2x2 Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="unit in units"
        :key="unit.unit"
        class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <!-- Unit Header -->
        <div class="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h2 class="text-xl font-bold text-gray-900 mb-2">{{ unit.unit }}</h2>
              <div class="flex items-center gap-3">
                <div class="w-48 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="getProgressBarColor(unit.accuracyRate)"
                    :style="{ width: `${unit.accuracyRate || 0}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-600">
                  <template v-if="unit.quizAttemptedCount > 0">
                    {{ Math.round(unit.accuracyRate || 0) }}% ({{ unit.correctCount }}/{{ unit.correctCount + unit.incorrectCount }})
                  </template>
                  <template v-else>
                    미학습
                  </template>
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Chapters Grid -->
        <div class="p-8">
          <div v-if="unitChapters[unit.unit]?.length > 0">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <button
                v-for="chapter in unitChapters[unit.unit]"
                :key="chapter.chapter"
                @click="selectChapterDirect(unit.unit, chapter.chapter)"
                class="p-4 rounded-xl border-2 transition-all duration-200 text-center hover:border-gray-900 hover:shadow-md bg-white border-gray-200 group flex flex-col justify-between h-full"
              >
                <div class="flex flex-col items-center mb-3 flex-1 justify-center">
                  <h3 class="font-semibold text-gray-900 group-hover:text-gray-900 break-keep leading-snug">{{ chapter.chapter }}</h3>
                </div>
                <div class="flex items-center gap-2 w-full">
                  <div class="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-300"
                      :class="getProgressBarColor(chapter.accuracyRate)"
                      :style="{ width: `${chapter.accuracyRate || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs font-medium text-gray-500">
                    <template v-if="chapter.quizAttemptedCount > 0">
                      {{ Math.round(chapter.accuracyRate || 0) }}%
                    </template>
                    <template v-else>
                      -
                    </template>
                  </span>
                </div>
              </button>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500">
            챕터를 불러오는 중...
          </div>
        </div>
      </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="flex justify-center items-center py-12">
        <div class="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p class="text-red-600 font-medium">{{ error }}</p>
          <button @click="fetchUnits" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            다시 시도
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    </div>

    <!-- View: Session Selection -->
    <div v-else-if="currentView === 'sessionSelect'">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center gap-2 mb-6">
          <span class="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white font-bold text-sm">3</span>
          <h2 class="text-lg font-semibold text-gray-900">학습 세션 선택</h2>
        </div>

        <p class="text-gray-600 mb-6">
          이 챕터에는 총 <strong>{{ allExpressions.length }}개</strong>의 표현이 있습니다.
          학습 효율을 위해 <strong>{{ sessions.length }}개의 세션</strong>으로 나누어 학습합니다.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            v-for="(session, idx) in sessions"
            :key="idx"
            @click="startSession(idx)"
            class="p-5 rounded-xl border-2 transition-all duration-200 text-left"
            :class="session.completed
              ? 'bg-green-50 border-green-500'
              : 'bg-white border-gray-200 hover:border-gray-400 hover:shadow-sm'"
          >
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-2">
                <span
                  class="flex items-center justify-center w-10 h-10 rounded-full font-bold"
                  :class="session.completed ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'"
                >
                  <CheckIcon v-if="session.completed" class="w-6 h-6" />
                  <span v-else>{{ idx + 1 }}</span>
                </span>
                <div>
                  <h3 class="font-semibold text-gray-900">세션 {{ idx + 1 }}</h3>
                  <p class="text-sm text-gray-500">{{ session.expressions.length }}개 표현</p>
                </div>
              </div>
            </div>

            <div class="space-y-1">
              <p class="text-xs text-gray-500 truncate" v-for="(expr, exprIdx) in session.expressions.slice(0, 3)" :key="exprIdx">
                • {{ expr.expression }}
              </p>
              <p v-if="session.expressions.length > 3" class="text-xs text-gray-400">
                ... 외 {{ session.expressions.length - 3 }}개
              </p>
            </div>

            <div class="mt-4 pt-3 border-t border-gray-100">
              <span
                class="text-sm font-medium"
                :class="session.completed ? 'text-green-600' : 'text-gray-700'"
              >
                {{ session.completed ? '완료됨' : '학습하기 →' }}
              </span>
            </div>
          </button>
        </div>

        <!-- Chapter Complete Check -->
        <div v-if="allSessionsCompleted" class="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
          <div class="flex items-center gap-3">
            <CheckCircleIcon class="w-8 h-8 text-green-500" />
            <div>
              <h4 class="font-semibold text-green-800">챕터 학습 완료!</h4>
              <p class="text-sm text-green-600">모든 세션을 완료했습니다. 다른 챕터를 선택하거나 복습할 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View: Pronunciation Practice -->
    <div v-else-if="currentView === 'practice'">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <!-- Expression Summary with Navigation -->
        <div class="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
          <div class="flex items-center justify-between gap-4">
            <!-- Expression Content (Left) -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <h2 class="text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
                  {{ currentExpression.expression }}
                </h2>
                <button
                  @click="playTTS(currentExpression.expression)"
                  :disabled="ttsLoading"
                  class="flex-shrink-0 p-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all duration-200"
                  title="표현 발음 듣기"
                >
                  <SpeakerWaveIcon class="w-4 h-4" />
                </button>
                <span
                  v-if="practiceCompletedForCurrent"
                  class="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1"
                >
                  <CheckIcon class="w-3 h-3" />
                </span>
              </div>
              <p class="text-gray-600 text-sm font-medium">
                {{ formatMeaning(currentExpression.meaning) }}
              </p>
            </div>

            <!-- Navigation (Right) -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-sm text-gray-500">{{ currentExpressionIndex + 1 }} / {{ currentSessionExpressions.length }}</span>
              <button
                @click="prevExpression"
                :disabled="currentExpressionIndex === 0"
                class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeftIcon class="w-5 h-5" />
              </button>
              <button
                @click="nextExpression"
                :disabled="currentExpressionIndex === currentSessionExpressions.length - 1"
                class="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRightIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Example Sentences -->
        <div v-if="currentExpression.examples && currentExpression.examples.length > 0">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">예문 연습</h3>
          <div class="space-y-3">
            <div
              v-for="(example, idx) in currentExpression.examples"
              :key="idx"
              class="bg-gray-50 rounded-xl p-4 border border-gray-200"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0">
                  <p class="text-base font-medium text-gray-900 mb-1" v-html="highlightExpression(example.text)"></p>
                  <p class="text-gray-600 text-base">{{ example.translation }}</p>
                </div>
                <div class="flex gap-2 flex-shrink-0">
                  <button
                    @click="playTTS(example.text)"
                    :disabled="ttsLoading"
                    class="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    title="발음 듣기"
                  >
                    <SpeakerWaveIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="startPronunciationPractice('example', idx)"
                    :disabled="isRecording"
                    class="p-2 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    title="Biz 표현 학습"
                  >
                    <MicrophoneIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress hint (모든 연습 완료 전에만 표시) -->
        <div v-if="!allPracticeCompleted" class="mt-4 pt-4 border-t border-gray-100">
          <p class="text-center text-gray-400 text-xs">
            모든 표현의 발음 연습을 완료하면 퀴즈로 넘어갈 수 있습니다
          </p>
        </div>
      </div>
    </div>

    <!-- View: Quiz -->
    <div v-else-if="currentView === 'quiz'">
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">빈칸 채우기 퀴즈</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">{{ currentQuizIndex + 1 }} / {{ quizQuestions.length }}</span>
          </div>
        </div>

        <!-- Quiz Question -->
        <div v-if="currentQuizQuestion" class="mb-6">
          <div class="bg-gray-50 rounded-xl p-6 mb-4">
            <p class="text-sm text-gray-600 mb-2">다음 빈칸에 들어갈 표현을 입력하세요:</p>
            <p class="text-lg font-medium text-gray-900" v-html="currentQuizQuestion.questionHtml"></p>
            <p class="text-gray-600 mt-2">{{ currentQuizQuestion.translation }}</p>
          </div>

          <!-- Hint -->
          <div class="mb-4">
            <button
              @click="showHint = !showHint"
              class="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <LightBulbIcon class="w-4 h-4" />
              {{ showHint ? '힌트 숨기기' : '힌트 보기' }}
            </button>
            <p v-if="showHint" class="mt-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg">
              의미: {{ currentQuizQuestion.meaning }}
            </p>
          </div>

          <!-- Answer Input -->
          <div class="mb-4">
            <input
              v-model="userAnswer"
              @keyup.enter="checkAnswer"
              type="text"
              placeholder="정답을 입력하세요"
              class="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black text-lg"
              :class="{
                'border-green-500 bg-green-50': answerStatus === 'correct',
                'border-red-500 bg-red-50': answerStatus === 'wrong',
                'border-gray-200': answerStatus === null
              }"
              :disabled="answerStatus !== null"
            />
          </div>

          <!-- Answer Feedback -->
          <div v-if="answerStatus === 'correct'" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircleIcon class="w-5 h-5 text-green-600" />
            <span class="text-green-800 font-medium">정답입니다!</span>
          </div>
          <div v-else-if="answerStatus === 'wrong'" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-center gap-2 mb-1">
              <XCircleIcon class="w-5 h-5 text-red-600" />
              <span class="text-red-800 font-medium">오답입니다</span>
            </div>
            <p class="text-red-700 text-sm">정답: {{ currentQuizQuestion.answer }}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              v-if="answerStatus === null"
              @click="checkAnswer"
              :disabled="!userAnswer.trim()"
              class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              정답 확인
            </button>
            <button
              v-else-if="currentQuizIndex < quizQuestions.length - 1"
              @click="nextQuiz"
              class="flex-1 py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
            >
              다음 문제
            </button>
            <button
              v-else
              @click="completeSession"
              class="flex-1 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              <CheckIcon class="w-5 h-5" />
              세션 완료
            </button>
          </div>
        </div>

        <!-- Quiz Progress -->
        <div class="mt-6 pt-6 border-t border-gray-100">
          <div class="flex justify-between text-sm text-gray-600 mb-2">
            <span>퀴즈 진행률</span>
            <span>{{ quizCorrectCount }} / {{ quizQuestions.length }} 정답</span>
          </div>
          <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-black rounded-full transition-all duration-300"
              :style="{ width: `${(currentQuizIndex / quizQuestions.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Session Complete Modal -->
    <div
      v-if="showCompletionModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center">
        <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon class="w-12 h-12 text-green-500" />
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">세션 {{ currentSessionIndex + 1 }} 완료!</h3>
        <p class="text-gray-600 mb-4">
          {{ currentSessionExpressions.length }}개 표현 학습을 완료했습니다.
        </p>
        <div class="bg-gray-50 rounded-xl p-4 mb-6">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-gray-500">퀴즈 점수</p>
              <p class="text-2xl font-bold text-gray-900">{{ quizCorrectCount }} / {{ quizQuestions.length }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">정답률</p>
              <p class="text-2xl font-bold text-green-600">{{ Math.round((quizCorrectCount / quizQuestions.length) * 100) }}%</p>
            </div>
          </div>
        </div>

        <!-- Next Session or Back -->
        <div class="space-y-3">
          <button
            v-if="hasNextSession"
            @click="goToNextSession"
            class="w-full py-3 rounded-lg bg-black text-white hover:bg-gray-800 transition"
          >
            다음 세션으로 (세션 {{ currentSessionIndex + 2 }})
          </button>
          <button
            @click="goBackToSessionSelect"
            class="w-full py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            세션 선택으로 돌아가기
          </button>
        </div>
      </div>
    </div>

    <!-- Recording Modal -->
    <div
      v-if="showRecordingModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl">
        <!-- Header -->
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-base font-bold text-gray-900">Biz 표현 학습</h3>
          <button @click="closeRecordingModal" class="text-gray-400 hover:text-gray-600">
            <XMarkIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Reference Text -->
        <div class="bg-gray-50 rounded-lg p-3 mb-4">
          <p class="text-sm font-medium text-gray-900 text-center">{{ referenceText }}</p>
        </div>

        <!-- Recording Status (녹음 전/중일 때만 크게 표시) -->
        <div v-if="!pronunciationResult" class="flex flex-col items-center mb-4">
          <div
            class="w-14 h-14 rounded-full flex items-center justify-center mb-2 transition-all duration-300"
            :class="isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'"
          >
            <MicrophoneIcon
              class="w-7 h-7"
              :class="isRecording ? 'text-red-500' : 'text-gray-400'"
            />
          </div>
          <p class="text-xs text-gray-600">{{ recordingStatus }}</p>
        </div>

        <!-- Recording Controls (녹음 전/중일 때) -->
        <div v-if="!pronunciationResult" class="flex justify-center gap-3 mb-4">
          <button
            v-if="!isRecording"
            @click="startRecording"
            class="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-sm"
          >
            <MicrophoneIcon class="w-4 h-4" />
            녹음 시작
          </button>
          <button
            v-else
            @click="stopRecording"
            class="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2 text-sm"
          >
            <StopIcon class="w-4 h-4" />
            녹음 종료
          </button>
        </div>

        <!-- Playback Controls (녹음 다시듣기) - 결과가 있을 때만 -->
        <div v-if="recordedAudioUrl && !isRecording && pronunciationResult" class="mb-3 p-2 bg-blue-50 rounded-lg">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-blue-800">내 녹음</span>
            <button
              v-if="!isPlayingRecording"
              @click="playRecordedAudio"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-700 transition"
            >
              <PlayIcon class="w-3 h-3" />
              재생
            </button>
            <button
              v-else
              @click="stopPlayingRecordedAudio"
              class="px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-700 transition"
            >
              <StopIcon class="w-3 h-3" />
              중지
            </button>
          </div>
        </div>

        <!-- Pronunciation Result -->
        <div v-if="pronunciationResult">
          <!-- Overall Scores - 4개를 한 줄로 -->
          <div class="grid grid-cols-4 gap-2 mb-3">
            <div class="bg-gray-50 rounded-lg p-2 text-center">
              <p class="text-[10px] text-gray-500">종합</p>
              <p class="text-lg font-bold text-gray-900">{{ Math.round(pronunciationResult.pronunciation_score) }}</p>
            </div>
            <div class="bg-green-50 rounded-lg p-2 text-center">
              <p class="text-[10px] text-gray-500">정확도</p>
              <p class="text-lg font-bold text-green-600">{{ Math.round(pronunciationResult.accuracy_score) }}</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-2 text-center">
              <p class="text-[10px] text-gray-500">유창성</p>
              <p class="text-lg font-bold text-purple-600">{{ Math.round(pronunciationResult.fluency_score) }}</p>
            </div>
            <div class="bg-yellow-50 rounded-lg p-2 text-center">
              <p class="text-[10px] text-gray-500">완성도</p>
              <p class="text-lg font-bold text-yellow-600">{{ Math.round(pronunciationResult.completeness_score) }}</p>
            </div>
          </div>

          <!-- Word-level Results -->
          <div v-if="pronunciationResult.words && pronunciationResult.words.length > 0">
            <p class="text-xs font-medium text-gray-500 mb-2">단어별 정확도</p>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="(word, idx) in pronunciationResult.words"
                :key="idx"
                class="relative group"
              >
                <span
                  class="px-1.5 py-0.5 rounded text-xs cursor-pointer"
                  :class="getScoreColorClass(word.accuracy_score)"
                  @click="togglePhonemeView(idx)"
                >
                  {{ word.word }}
                  <span class="text-[10px] ml-0.5 opacity-75">{{ Math.round(word.accuracy_score) }}</span>
                </span>

                <!-- Phoneme Details Popup -->
                <div
                  v-if="selectedWordIndex === idx && word.phonemes && word.phonemes.length > 0"
                  class="absolute bottom-full left-0 mb-1 bg-gray-800 text-white text-[10px] rounded p-1.5 whitespace-nowrap z-10"
                >
                  <div class="flex gap-0.5">
                    <span
                      v-for="(phoneme, pIdx) in word.phonemes"
                      :key="pIdx"
                      class="px-1 py-0.5 rounded"
                      :class="getPhonemeColorClass(phoneme.accuracy_score)"
                    >
                      {{ phoneme.phoneme }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="mt-4 flex justify-end gap-2">
            <button
              @click="closeRecordingModal"
              class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              다시 연습
            </button>
            <button
              v-if="pronunciationResult.pronunciation_score >= 60"
              @click="markPracticeComplete"
              class="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
            >
              완료
            </button>
          </div>
        </div>

        <!-- Close Button (결과 없을 때) -->
        <div v-if="!pronunciationResult && !isRecording" class="flex justify-center">
          <button
            @click="closeRecordingModal"
            class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import api, { pythonAPI } from '@/services/api'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  StopIcon,
  CheckIcon,
  PlayIcon,
  AcademicCapIcon,
  LightBulbIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// Constants
const SESSION_COUNT = 3

// View State: 'selection' | 'sessionSelect' | 'practice' | 'quiz'
const currentView = ref('selection')

// Selection State
const units = ref([])
const selectedUnit = ref('')
const selectedChapter = ref('')
const unitChapters = ref({}) // Store chapters for each unit
const loading = ref(false)
const error = ref(null)
const ttsLoading = ref(false)

// Session State
const allExpressions = ref([]) // 전체 표현
const sessions = ref([]) // 세션별로 분할된 표현 배열
const currentSessionIndex = ref(0)
const currentExpressionIndex = ref(0)

// Practice State
const practiceCompletedSet = ref(new Set())

// Quiz State
const quizQuestions = ref([])
const currentQuizIndex = ref(0)
const userAnswer = ref('')
const answerStatus = ref(null)
const showHint = ref(false)
const quizCorrectCount = ref(0)
const showCompletionModal = ref(false)

// Recording State
const showRecordingModal = ref(false)
const isRecording = ref(false)
const recordingStatus = ref('녹음 대기 중')
const referenceText = ref('')
const practiceType = ref('expression')
const practiceExampleIndex = ref(0)
const pronunciationResult = ref(null)
const selectedWordIndex = ref(null)

// Playback State (임시 녹음 다시듣기)
const recordedAudioUrl = ref(null)
const recordedAudioChunks = ref([])
const isPlayingRecording = ref(false)
let recordedAudio = null
let mediaRecorder = null
let mediaStream = null

// WebSocket & Audio
let websocket = null
let audioContext = null
let audioProcessor = null

// Computed
const currentSessionExpressions = computed(() => {
  return sessions.value[currentSessionIndex.value]?.expressions || []
})

const currentExpression = computed(() => {
  return currentSessionExpressions.value[currentExpressionIndex.value] || {}
})

const practiceCompletedForCurrent = computed(() => {
  return practiceCompletedSet.value.has(currentExpression.value.id)
})

const practiceCompletedCount = computed(() => {
  return practiceCompletedSet.value.size
})

const allPracticeCompleted = computed(() => {
  return currentSessionExpressions.value.length > 0 &&
    practiceCompletedSet.value.size >= currentSessionExpressions.value.length
})

const currentQuizQuestion = computed(() => {
  return quizQuestions.value[currentQuizIndex.value] || null
})

const allSessionsCompleted = computed(() => {
  return sessions.value.length > 0 && sessions.value.every(s => s.completed)
})

const hasNextSession = computed(() => {
  return currentSessionIndex.value < sessions.value.length - 1
})

const backButtonText = computed(() => {
  if (currentView.value === 'sessionSelect') {
    return 'Unit/Chapter 선택으로 돌아가기'
  } else if (currentView.value === 'practice' || currentView.value === 'quiz') {
    return '세션 선택으로 돌아가기'
  }
  return '뒤로가기'
})

// Methods
const fetchUnits = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await api.get('/expressions/units')
    units.value = response.data.data || []
    
    // Fetch chapters for all units in background
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
    // Vue 반응성을 위해 전체 객체를 다시 할당
    unitChapters.value = {
      ...unitChapters.value,
      [unitName]: response.data.data || []
    }
  } catch (error) {
    console.error(`Failed to fetch chapters for ${unitName}:`, error)
    unitChapters.value = {
      ...unitChapters.value,
      [unitName]: []
    }
  }
}

const selectUnit = async (unit) => {
  selectedUnit.value = unit
  selectedChapter.value = ''
  allExpressions.value = []
  sessions.value = []
  loading.value = true

  try {
    const response = await api.get('/expressions/chapters', {
      params: { unit }
    })
    chapters.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch chapters:', error)
    chapters.value = []
  } finally {
    loading.value = false
  }
}

const selectChapter = async (chapter) => {
  selectedChapter.value = chapter
  loading.value = true

  try {
    const response = await api.get('/expressions', {
      params: { unit: selectedUnit.value, chapter, limit: 100 }
    })
    allExpressions.value = response.data.data || []

    if (allExpressions.value.length > 0) {
      // 세션으로 분할
      splitIntoSessions()
      currentView.value = 'sessionSelect'
    }
  } catch (error) {
    console.error('Failed to fetch expressions:', error)
    allExpressions.value = []
  } finally {
    loading.value = false
  }
}

// New function for direct chapter selection
const selectChapterDirect = async (unit, chapter) => {
  selectedUnit.value = unit
  selectedChapter.value = chapter
  loading.value = true

  try {
    const response = await api.get('/expressions', {
      params: { unit, chapter, limit: 100 }
    })
    allExpressions.value = response.data.data || []

    // 세션으로 분할 (데이터가 없어도 빈 세션으로 분할됨)
    splitIntoSessions()
    currentView.value = 'sessionSelect'

  } catch (error) {
    console.error('Failed to fetch expressions:', error)
    allExpressions.value = []
  } finally {
    loading.value = false
  }
}


const splitIntoSessions = () => {
  const total = allExpressions.value.length
  const sessionSize = Math.ceil(total / SESSION_COUNT)

  sessions.value = []
  for (let i = 0; i < SESSION_COUNT; i++) {
    const start = i * sessionSize
    const end = Math.min(start + sessionSize, total)
    if (start < total) {
      sessions.value.push({
        expressions: allExpressions.value.slice(start, end),
        completed: false
      })
    }
  }
}

const startSession = (sessionIndex) => {
  currentSessionIndex.value = sessionIndex
  currentExpressionIndex.value = 0
  practiceCompletedSet.value = new Set()
  currentView.value = 'practice'
}

const handleBackButton = () => {
  if (currentView.value === 'sessionSelect') {
    goBackToSelection()
  } else if (currentView.value === 'practice' || currentView.value === 'quiz') {
    goBackToSessionSelect()
  }
}

const goBackToSelection = () => {
  currentView.value = 'selection'
  sessions.value = []
  allExpressions.value = []
  practiceCompletedSet.value = new Set()
  quizQuestions.value = []
  currentQuizIndex.value = 0
  quizCorrectCount.value = 0
}

const goBackToSessionSelect = () => {
  currentView.value = 'sessionSelect'
  practiceCompletedSet.value = new Set()
  quizQuestions.value = []
  currentQuizIndex.value = 0
  quizCorrectCount.value = 0
  showCompletionModal.value = false
}

const prevExpression = () => {
  if (currentExpressionIndex.value > 0) {
    currentExpressionIndex.value--
    pronunciationResult.value = null
  }
}

const nextExpression = () => {
  if (currentExpressionIndex.value < currentSessionExpressions.value.length - 1) {
    currentExpressionIndex.value++
    pronunciationResult.value = null
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

    const audioBlob = new Blob([response.data], { type: 'audio/mp3' })
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

const startPronunciationPractice = (type, exampleIndex = 0) => {
  practiceType.value = type
  practiceExampleIndex.value = exampleIndex

  if (type === 'expression') {
    referenceText.value = currentExpression.value.expression
  } else {
    referenceText.value = currentExpression.value.examples[exampleIndex].text
  }

  pronunciationResult.value = null
  selectedWordIndex.value = null
  showRecordingModal.value = true
  recordingStatus.value = '녹음 대기 중'
}

const startRecording = async () => {
  try {
    // 이전 녹음 데이터 초기화
    clearRecordedAudio()

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    // MediaRecorder로 오디오 저장 (다시듣기용)
    mediaStream = stream
    recordedAudioChunks.value = []
    mediaRecorder = new MediaRecorder(stream)

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedAudioChunks.value.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      // 녹음 종료 시 Blob URL 생성
      const audioBlob = new Blob(recordedAudioChunks.value, { type: 'audio/webm' })
      recordedAudioUrl.value = URL.createObjectURL(audioBlob)
    }

    mediaRecorder.start()

    const wsUrl = `ws://localhost:8000/api/ai/expression/speech/assess-realtime`
    websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      const initData = {
        expression_id: currentExpression.value.id,
        type: practiceType.value,
        example_index: practiceExampleIndex.value
      }
      websocket.send(JSON.stringify(initData))
    }

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.status === 'ready') {
        recordingStatus.value = '녹음 중... 말씀해주세요'
        startAudioCapture(stream)
      } else if (data.status === 'processing') {
        recordingStatus.value = '처리 중...'
      } else if (data.result) {
        pronunciationResult.value = data.result
        recordingStatus.value = '평가 완료!'
        isRecording.value = false
      } else if (data.error) {
        recordingStatus.value = `오류: ${data.error}`
        isRecording.value = false
      }
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      recordingStatus.value = '연결 오류'
      isRecording.value = false
    }

    websocket.onclose = () => {
      stopAudioCapture()
    }

    isRecording.value = true
    recordingStatus.value = '연결 중...'

  } catch (error) {
    console.error('Failed to start recording:', error)
    recordingStatus.value = '마이크 접근 실패'
  }
}

const startAudioCapture = async (stream) => {
  audioContext = new AudioContext({ sampleRate: 16000 })
  const source = audioContext.createMediaStreamSource(stream)

  audioProcessor = audioContext.createScriptProcessor(4096, 1, 1)

  audioProcessor.onaudioprocess = (event) => {
    if (!isRecording.value || !websocket || websocket.readyState !== WebSocket.OPEN) return

    const inputBuffer = event.inputBuffer.getChannelData(0)

    const int16Buffer = new Int16Array(inputBuffer.length)
    for (let i = 0; i < inputBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, inputBuffer[i]))
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }

    websocket.send(int16Buffer.buffer)
  }

  source.connect(audioProcessor)
  audioProcessor.connect(audioContext.destination)
}

const stopAudioCapture = () => {
  if (audioProcessor) {
    audioProcessor.disconnect()
    audioProcessor = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
}

const stopRecording = () => {
  // MediaRecorder 중지 (다시듣기용 오디오 저장)
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }

  // 마이크 스트림 종료
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
  }

  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send('END')
  }
  recordingStatus.value = '결과 처리 중...'
}

const markPracticeComplete = () => {
  practiceCompletedSet.value.add(currentExpression.value.id)
  closeRecordingModal()
}

// 녹음 다시듣기
const playRecordedAudio = () => {
  if (!recordedAudioUrl.value) return

  if (recordedAudio) {
    recordedAudio.pause()
    recordedAudio = null
  }

  recordedAudio = new Audio(recordedAudioUrl.value)
  isPlayingRecording.value = true

  recordedAudio.onended = () => {
    isPlayingRecording.value = false
  }

  recordedAudio.onerror = () => {
    isPlayingRecording.value = false
  }

  recordedAudio.play()
}

// 다시듣기 중지
const stopPlayingRecordedAudio = () => {
  if (recordedAudio) {
    recordedAudio.pause()
    recordedAudio.currentTime = 0
    isPlayingRecording.value = false
  }
}

// 녹음 데이터 정리
const clearRecordedAudio = () => {
  stopPlayingRecordedAudio()

  if (recordedAudioUrl.value) {
    URL.revokeObjectURL(recordedAudioUrl.value)
    recordedAudioUrl.value = null
  }

  recordedAudioChunks.value = []
  recordedAudio = null
}

const closeRecordingModal = () => {
  if (websocket) {
    websocket.close()
    websocket = null
  }
  stopAudioCapture()

  // MediaRecorder 정리
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop()
  }
  mediaRecorder = null

  // 마이크 스트림 정리
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop())
    mediaStream = null
  }

  // 녹음 데이터 정리 (모달 닫을 때 삭제)
  clearRecordedAudio()

  showRecordingModal.value = false
  isRecording.value = false
}

// Quiz Methods
const goToQuiz = () => {
  generateQuizQuestions()
  currentQuizIndex.value = 0
  quizCorrectCount.value = 0
  userAnswer.value = ''
  answerStatus.value = null
  showHint.value = false
  currentView.value = 'quiz'
}

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
      exampleIndex: exampleIndex,  // 퀴즈 결과 저장용
      expression: expression,
      meaning: formatMeaning(expr.meaning),
      originalText: example.text,
      questionHtml: questionHtml,
      translation: example.translation,
      answer: expression
    }
  })
}

const checkAnswer = async () => {
  if (!userAnswer.value.trim()) return

  const isCorrect = userAnswer.value.trim().toLowerCase() === currentQuizQuestion.value.answer.toLowerCase()
  answerStatus.value = isCorrect ? 'correct' : 'wrong'

  if (isCorrect) {
    quizCorrectCount.value++
  }

  // 퀴즈 결과를 백엔드에 저장
  try {
    await api.post('/expressions/quiz/result', {
      expressionId: currentQuizQuestion.value.expressionId,
      exampleIndex: currentQuizQuestion.value.exampleIndex,
      isCorrect: isCorrect
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

const completeSession = async () => {
  try {
    // 현재 세션의 표현들을 학습 완료 처리
    const expressionIds = currentSessionExpressions.value.map(e => e.id)
    await api.post('/expressions/learned', { expressionIds })

    // 세션 완료 표시
    sessions.value[currentSessionIndex.value].completed = true

    // 데이터 새로고침
    fetchUnits()

    showCompletionModal.value = true
  } catch (error) {
    console.error('Failed to mark as learned:', error)
    alert('학습 완료 처리에 실패했습니다.')
  }
}

const goToNextSession = () => {
  showCompletionModal.value = false
  if (hasNextSession.value) {
    startSession(currentSessionIndex.value + 1)
  }
}

const togglePhonemeView = (idx) => {
  selectedWordIndex.value = selectedWordIndex.value === idx ? null : idx
}

const formatMeaning = (meaning) => {
  if (!meaning) return ''
  return meaning.replace(/[{}]/g, '')
}

const highlightExpression = (text) => {
  if (!text || !currentExpression.value.expression) return text

  const expression = currentExpression.value.expression
  const regex = new RegExp(`(${expression})`, 'gi')

  return text.replace(regex, '<mark class="bg-yellow-300 text-gray-900 font-bold px-1 rounded">$1</mark>')
}

const getScoreColorClass = (score) => {
  if (score >= 80) return 'bg-green-100 text-green-800'
  if (score >= 60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

const getPhonemeColorClass = (score) => {
  if (score >= 80) return 'bg-green-600'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getProgressBarColor = (rate) => {
  if (!rate || rate === 0) return 'bg-gray-400'
  if (rate >= 80) return 'bg-green-500'
  if (rate >= 60) return 'bg-yellow-500'
  if (rate >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

// Lifecycle
onMounted(() => {
  fetchUnits()
})

onUnmounted(() => {
  closeRecordingModal()
})
</script>

