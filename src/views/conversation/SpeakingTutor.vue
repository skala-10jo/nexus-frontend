<template>
  <div class="h-full flex flex-col relative">
    <!-- Header (List/Home View) -->
    <div
      v-if="currentView === 'list'"
      class="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-between px-8 border-b border-gray-100"
    >
      <div class="flex flex-col">
        <div class="flex items-center gap-4">
          <h2 class="text-2xl font-bold text-gray-800 font-nanum-round-eb">AI 스피킹 튜터</h2>
          <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ sessions.length }}</span>
        </div>
        <p class="text-sm text-gray-500 mt-1">실제 대화를 분석하고, AI와 함께 더 나은 표현을 배워보세요</p>
      </div>

      <div class="flex items-center gap-4">
        <button
          @click="showUploadModal = true"
          class="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          오디오 업로드
        </button>
      </div>
    </div>

    <!-- Header (Results View) -->
    <div
      v-else-if="currentView === 'results'"
      class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-4 border-b border-gray-100"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button
            @click="backToList"
            class="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div>
            <h2 class="text-xl font-bold text-gray-900">{{ currentSession?.originalFilename || '분석 결과' }}</h2>
            <p class="text-sm text-gray-500">화자 {{ speakers.length }}명 · 발화 {{ utterances.length }}개</p>
          </div>
        </div>
        <button
          @click="startLearningMode"
          class="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition flex items-center gap-2"
        >
          <AcademicCapIcon class="w-4 h-4" />
          학습 모드
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden" :class="{ 'pt-20': currentView === 'list' }">
      <!-- List View -->
      <div v-if="currentView === 'list'" class="flex-1 overflow-y-auto bg-white p-8">
        <!-- Loading State -->
        <div v-if="sessionsLoading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="i in 6" :key="i" class="h-64 bg-gray-50 rounded-3xl animate-pulse"></div>
        </div>

        <!-- Session Grid -->
        <div v-else-if="sessions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SpeakingSessionCard
            v-for="session in sessions"
            :key="session.id"
            :session="session"
            @select="handleSelectSession"
            @delete="handleDeleteSession"
          />
        </div>

        <!-- Empty State -->
        <SpeakingEmptyState v-else @upload="showUploadModal = true" />
      </div>

      <!-- Analysis in Progress -->
      <div v-else-if="currentView === 'analyzing'" class="flex-1 flex items-center justify-center bg-gray-50/50 p-8">
        <div class="max-w-md w-full">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div class="w-20 h-20 mx-auto mb-6 relative">
              <div class="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div
                class="absolute inset-0 border-4 border-blue-600 rounded-full animate-spin"
                style="border-right-color: transparent; border-bottom-color: transparent;"
              ></div>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-lg font-bold text-blue-600">{{ analysisProgress }}%</span>
              </div>
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">녹음 파일 분석 중</h3>
            <p class="text-gray-500 mb-6">{{ analysisMessage }}</p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${analysisProgress}%` }"
              ></div>
            </div>
            <button
              @click="backToList"
              class="mt-6 text-sm text-gray-500 hover:text-gray-700"
            >
              백그라운드에서 진행 (목록으로 돌아가기)
            </button>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <div v-else-if="currentView === 'results'" class="flex-1 flex gap-6 p-6 overflow-hidden">
        <!-- Left Panel: Transcript Timeline -->
        <!-- Left Panel: Transcript Timeline -->
        <div class="w-[55%] min-w-0 flex flex-col h-full">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-lg h-full overflow-hidden flex flex-col">
            <!-- Header & Speaker Filter -->
            <div class="p-6 border-b border-gray-100 bg-white z-10">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserIcon class="w-5 h-5 text-gray-500" />
                  대화 참여자
                </h4>
                <button
                  @click="showAllSpeakers"
                  class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  전체 보기
                </button>
              </div>
              
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="speaker in speakers"
                  :key="speaker.id"
                  class="group"
                >
                  <!-- Edit Mode -->
                  <div
                    v-if="editingSpeakerId === speaker.id"
                    class="flex items-center gap-1 bg-white border-2 border-indigo-500 rounded-full px-2 py-1 shadow-sm"
                  >
                    <span
                      class="inline-block w-2.5 h-2.5 rounded-full"
                      :class="getSpeakerColor(speaker.id)"
                    ></span>
                    <input
                      v-model="editingSpeakerLabel"
                      type="text"
                      class="w-24 text-sm font-medium border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                      placeholder="이름 입력"
                      @keyup.enter="saveSpeakerLabel(speaker.id)"
                      @keyup.esc="cancelEditSpeaker"
                      autofocus
                    />
                    <button
                      @click="saveSpeakerLabel(speaker.id)"
                      :disabled="isSavingSpeakerLabel"
                      class="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition"
                      title="저장"
                    >
                      <CheckIcon class="w-4 h-4" />
                    </button>
                    <button
                      @click="cancelEditSpeaker"
                      class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
                      title="취소"
                    >
                      <XMarkIcon class="w-4 h-4" />
                    </button>
                  </div>
                  
                  <!-- Normal Mode -->
                  <div 
                    v-else 
                    class="flex items-center rounded-full border transition-all duration-200 group/chip"
                    :class="selectedSpeakers.includes(speaker.id)
                      ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-indigo-200'"
                  >
                    <button
                      @click="toggleSpeakerFilter(speaker.id)"
                      class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-l-full"
                    >
                      <span
                        class="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shadow-sm"
                        :class="getSpeakerBgColor(speaker.id)"
                      >
                        <UserIcon class="w-3.5 h-3.5" />
                      </span>
                      <span 
                        class="text-sm font-bold transition-colors"
                        :class="selectedSpeakers.includes(speaker.id) ? 'text-indigo-900' : 'text-gray-600 group-hover/chip:text-gray-900'"
                      >
                        {{ speaker.label }}
                      </span>
                      <span 
                        class="text-xs px-1.5 py-0.5 rounded-full font-medium"
                        :class="selectedSpeakers.includes(speaker.id) ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-500'"
                      >
                        {{ speaker.utteranceCount }}
                      </span>
                    </button>
                    
                    <!-- Separator -->
                    <div class="w-px h-3 bg-gray-200 group-hover/chip:bg-indigo-200 transition-colors"></div>

                    <button
                      @click.stop="startEditSpeaker(speaker)"
                      class="pl-2 pr-3 py-1.5 rounded-r-full text-gray-400 hover:text-indigo-600 transition-colors"
                      title="이름 변경"
                    >
                      <PencilIcon class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Transcript List (Chat Style) -->
            <div class="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4">
              <div v-if="filteredUtterances.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
                <ChatBubbleLeftRightIcon class="w-12 h-12 mb-2 opacity-20" />
                <p class="text-sm">표시할 대화 내용이 없습니다</p>
              </div>

              <div
                v-for="utterance in filteredUtterances"
                :key="utterance.id"
                @click="selectUtterance(utterance)"
                class="group flex gap-3 transition-all duration-200 cursor-pointer"
              >
                <!-- Avatar -->
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-1 transition-transform group-hover:scale-105"
                  :class="getSpeakerBgColor(utterance.speakerId)"
                >
                  <UserIcon class="w-5 h-5" />
                </div>

                <!-- Bubble -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-baseline gap-2 mb-1">
                    <span class="text-sm font-bold text-gray-900">{{ utterance.speakerLabel }}</span>
                    <span class="text-xs text-gray-400 font-medium">{{ formatTime(utterance.startTimeMs) }}</span>
                  </div>
                  
                  <div 
                    class="relative p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed transition-all duration-200 border"
                    :class="selectedUtterance?.id === utterance.id
                      ? 'bg-indigo-50 border-indigo-200 text-gray-900 shadow-md'
                      : 'bg-white border-gray-100 text-gray-700 shadow-sm hover:shadow-md hover:border-gray-200'"
                  >
                    {{ utterance.text }}
                    
                    <!-- Feedback Indicator Badge -->
                    <div v-if="utterance.hasFeedback" class="absolute -top-2 -right-2">
                      <span 
                        class="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold shadow-sm border"
                        :class="utterance.feedback?.score >= 7 ? 'bg-green-100 text-green-700 border-green-200' : 
                                utterance.feedback?.score >= 5 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                'bg-red-100 text-red-700 border-red-200'"
                      >
                        <SparklesIcon class="w-3 h-3" />
                        {{ utterance.feedback?.score || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Feedback -->
        <div class="w-[45%] flex-shrink-0 overflow-hidden flex flex-col h-full">
          <div class="bg-white rounded-2xl border border-gray-100 shadow-lg h-full overflow-hidden flex flex-col relative">
            <!-- Background Decoration -->
            <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 pointer-events-none"></div>

            <template v-if="selectedUtterance">
              <!-- Header -->
              <div class="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm z-10">
                <div class="flex items-center gap-2">
                  <div class="p-2 bg-indigo-50 rounded-lg">
                    <SparklesIcon class="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 class="text-lg font-bold text-gray-900">AI 코칭 피드백</h4>
                    <p class="text-xs text-gray-500">선택한 발화에 대한 상세 분석입니다</p>
                  </div>
                </div>
                
                <button
                  v-if="!selectedUtterance.hasFeedback"
                  @click="requestFeedback"
                  :disabled="isLoadingFeedback"
                  class="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black hover:shadow-lg hover:shadow-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
                >
                  <SparklesIcon class="w-4 h-4" :class="{ 'animate-spin': isLoadingFeedback }" />
                  {{ isLoadingFeedback ? '분석 중...' : '피드백 받기' }}
                </button>
              </div>

              <!-- Content -->
              <div class="flex-1 overflow-y-auto p-6 space-y-6 z-10 scrollbar-hide">
                <template v-if="selectedUtterance.feedback">
                  <!-- Score Section -->
                  <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div class="flex items-center justify-between mb-6">
                      <div>
                        <h5 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">종합 점수</h5>
                        <div class="flex items-baseline gap-2">
                          <span class="text-4xl font-black text-gray-900">{{ selectedUtterance.feedback.score }}</span>
                          <span class="text-lg text-gray-400 font-medium">/ 10</span>
                        </div>
                      </div>
                      <div class="w-16 h-16 rounded-full flex items-center justify-center p-1"
                           :class="getScoreBgColor(selectedUtterance.feedback.score)">
                        <!-- Excellent (9-10) -->
                        <svg v-if="selectedUtterance.feedback.score >= 9" viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm">
                          <circle cx="50" cy="50" r="45" fill="#FCD34D" />
                          <circle cx="32" cy="40" r="5" fill="#374151" />
                          <circle cx="68" cy="40" r="5" fill="#374151" />
                          <path d="M30 60 Q50 80 70 60" fill="none" stroke="#374151" stroke-width="5" stroke-linecap="round" />
                          <circle cx="25" cy="55" r="5" fill="#F87171" opacity="0.6" />
                          <circle cx="75" cy="55" r="5" fill="#F87171" opacity="0.6" />
                          <path d="M45 25 L50 15 L55 25 Z" fill="#F59E0B" /> <!-- Crown/Star hint -->
                        </svg>
                        <!-- Good (7-8) -->
                        <svg v-else-if="selectedUtterance.feedback.score >= 7" viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm">
                          <circle cx="50" cy="50" r="45" fill="#FDE047" />
                          <circle cx="35" cy="40" r="5" fill="#374151" />
                          <circle cx="65" cy="40" r="5" fill="#374151" />
                          <path d="M35 65 Q50 75 65 65" fill="none" stroke="#374151" stroke-width="5" stroke-linecap="round" />
                        </svg>
                        <!-- Average (5-6) -->
                        <svg v-else-if="selectedUtterance.feedback.score >= 5" viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm">
                          <circle cx="50" cy="50" r="45" fill="#FDBA74" />
                          <circle cx="35" cy="40" r="5" fill="#374151" />
                          <circle cx="65" cy="40" r="5" fill="#374151" />
                          <line x1="35" y1="65" x2="65" y2="65" stroke="#374151" stroke-width="5" stroke-linecap="round" />
                          <path d="M60 30 Q70 25 80 30" fill="none" stroke="#374151" stroke-width="3" stroke-linecap="round" />
                        </svg>
                        <!-- Poor (0-4) -->
                        <svg v-else viewBox="0 0 100 100" class="w-full h-full drop-shadow-sm">
                          <circle cx="50" cy="50" r="45" fill="#93C5FD" />
                          <circle cx="35" cy="45" r="5" fill="#374151" />
                          <circle cx="65" cy="45" r="5" fill="#374151" />
                          <path d="M35 70 Q50 60 65 70" fill="none" stroke="#374151" stroke-width="5" stroke-linecap="round" />
                          <path d="M75 40 Q80 50 75 60" fill="#60A5FA" opacity="0.6" /> <!-- Sweat drop -->
                        </svg>
                      </div>
                    </div>
                    
                    <!-- Score Breakdown Grid -->
                    <div class="grid grid-cols-2 gap-3">
                      <div
                        v-for="(value, key) in selectedUtterance.feedback.scoreBreakdown"
                        :key="key"
                        class="bg-gray-50 rounded-xl p-3 flex items-center justify-between group hover:bg-gray-100 transition-colors"
                      >
                        <span class="text-xs font-medium text-gray-500 group-hover:text-gray-700">{{ getScoreLabel(key) }}</span>
                        <span class="text-sm font-bold text-gray-900">{{ value }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Grammar Corrections -->
                  <div class="space-y-3">
                    <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <ExclamationTriangleIcon v-if="selectedUtterance.feedback.grammarCorrections?.length" class="w-4 h-4 text-amber-500" />
                      <CheckBadgeIcon v-else class="w-4 h-4 text-amber-500" />
                      문법 교정
                    </h5>
                    <!-- 교정 사항이 있는 경우 -->
                    <div v-if="selectedUtterance.feedback.grammarCorrections?.length" class="bg-amber-50/50 rounded-2xl border border-amber-100 overflow-hidden">
                      <div
                        v-for="(correction, idx) in selectedUtterance.feedback.grammarCorrections"
                        :key="idx"
                        class="p-4 border-b border-amber-100 last:border-0 flex gap-3"
                      >
                        <span class="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                        <p class="text-sm text-gray-700 leading-relaxed">{{ correction }}</p>
                      </div>
                    </div>
                    <!-- 교정 사항이 없는 경우 -->
                    <div v-else class="bg-amber-50/50 rounded-2xl border border-amber-100 p-4 flex items-center gap-3">
                      <span class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">👏</span>
                      <p class="text-sm text-gray-900">훌륭해요! 올바른 문법을 사용하고 있습니다.</p>
                    </div>
                  </div>

                  <!-- Suggestions -->
                  <div v-if="selectedUtterance.feedback.suggestions?.length" class="space-y-3">
                    <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <LightBulbIcon class="w-4 h-4 text-blue-500" />
                      더 나은 표현 제안
                    </h5>
                    <div class="bg-blue-50/50 rounded-2xl border border-blue-100 overflow-hidden">
                      <div
                        v-for="(suggestion, idx) in selectedUtterance.feedback.suggestions"
                        :key="idx"
                        class="p-4 border-b border-blue-100 last:border-0 flex gap-3"
                      >
                        <span class="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{{ idx + 1 }}</span>
                        <p class="text-sm text-gray-700 leading-relaxed">{{ suggestion }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Improved Sentence -->
                  <div v-if="selectedUtterance.feedback.improvedSentence" class="space-y-3">
                    <h5 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <CheckBadgeIcon class="w-4 h-4 text-emerald-500" />
                      추천 문장
                    </h5>
                    <div class="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 relative overflow-hidden group">
                      <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckBadgeIcon class="w-16 h-16 text-emerald-600" />
                      </div>
                      <p class="text-base text-emerald-900 font-medium relative z-10 leading-relaxed">
                        "{{ selectedUtterance.feedback.improvedSentence }}"
                      </p>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="pt-4 pb-2">
                    <button
                      @click="goToLearningWithUtterance"
                      class="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center justify-center gap-2 group"
                    >
                      <AcademicCapIcon class="w-5 h-5 group-hover:scale-110 transition-transform" />
                      이 문장으로 학습하기
                    </button>
                  </div>
                </template>

                <!-- Loading State -->
                <template v-else-if="isLoadingFeedback">
                  <div class="flex flex-col items-center justify-center py-20 text-center">
                    <div class="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
                    <h4 class="text-lg font-bold text-gray-900 mb-2">AI가 분석 중입니다</h4>
                    <p class="text-sm text-gray-500">문법, 표현, 뉘앙스를 꼼꼼히 체크하고 있어요</p>
                  </div>
                </template>

                <!-- Empty Feedback State -->
                <template v-else>
                  <div class="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div class="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <SparklesIcon class="w-10 h-10 text-indigo-400" />
                    </div>
                    <h4 class="text-lg font-bold text-gray-900 mb-2">피드백을 받아보세요</h4>
                    <p class="text-sm text-gray-500 mb-8 max-w-xs mx-auto">
                      AI가 문법 오류를 교정하고 더 자연스러운 표현을 제안해드립니다.
                    </p>
                    <button
                      @click="requestFeedback"
                      class="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors shadow-lg shadow-gray-300"
                    >
                      피드백 생성하기
                    </button>
                  </div>
                </template>
              </div>
            </template>

            <!-- No Utterance Selected State -->
            <template v-else>
              <div class="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                <div class="w-24 h-24 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                  <ChatBubbleLeftRightIcon class="w-12 h-12 text-gray-300" />
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-2">대화를 선택해주세요</h4>
                <p class="text-sm text-gray-500 max-w-xs mx-auto">
                  왼쪽 타임라인에서 분석하고 싶은 발화를 클릭하면 상세한 AI 피드백을 확인할 수 있습니다.
                </p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Learning Mode - Full Height Flex Layout -->
      <div v-else-if="currentView === 'learning'" class="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-slate-50 to-gray-100">
        <div class="flex-1 flex flex-col min-h-0 p-4">
          <div class="flex-1 flex flex-col min-h-0 bg-white rounded-2xl border border-gray-200/60 shadow-lg overflow-hidden">

            <!-- Learning Mode Header (Fixed) -->
            <div class="flex-shrink-0 px-6 py-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                  <AcademicCapIcon class="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">학습 모드</h3>
                  <p class="text-xs text-gray-500">교정된 문장을 따라 연습해보세요</p>
                </div>
              </div>
              <button
                @click="exitLearningMode"
                class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <ArrowLeftIcon class="w-4 h-4" />
                나가기
              </button>
            </div>

            <!-- Progress Header (Fixed) -->
            <div class="flex-shrink-0 px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-3">
                  <span class="text-sm font-bold text-gray-900">
                    {{ currentLearningIndex + 1 }} / {{ learningItems.length }}
                  </span>
                  <span class="text-xs text-gray-500">학습 진행률</span>
                </div>
                <!-- Score Badge -->
                <div v-if="currentLearningItem?.score" class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                       :class="getScoreBgColor(currentLearningItem.score)">
                    {{ currentLearningItem.score }}
                  </div>
                  <span class="text-xs font-medium text-gray-600">점</span>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                  class="bg-gray-900 h-2 rounded-full transition-all duration-500 ease-out"
                  :style="{ width: `${((currentLearningIndex + 1) / learningItems.length) * 100}%` }"
                ></div>
              </div>
            </div>

            <!-- Scrollable Content Area -->
            <div v-if="currentLearningItem" ref="learningScrollContainer" class="flex-1 overflow-y-auto min-h-0 p-5 space-y-4">
              <!-- Original vs Improved Comparison -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <!-- Original Text -->
                <div class="bg-white rounded-xl border border-red-200 overflow-hidden">
                  <div class="px-3 py-2 bg-red-50 border-b border-red-200 flex items-center gap-2">
                    <ExclamationCircleIcon class="w-4 h-4 text-red-500" />
                    <span class="text-sm font-bold text-red-700">원래 문장</span>
                  </div>
                  <div class="p-3">
                    <p class="text-sm text-gray-700 leading-relaxed">{{ currentLearningItem.originalText }}</p>
                  </div>
                </div>

                <!-- Improved Text -->
                <div class="bg-white rounded-xl border border-emerald-200 overflow-hidden">
                  <div class="px-3 py-2 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <CheckBadgeIcon class="w-4 h-4 text-emerald-500" />
                      <span class="text-sm font-bold text-emerald-700">교정된 문장</span>
                    </div>
                    <button
                      @click="speakText(currentLearningItem.improvedText)"
                      class="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded transition"
                      title="듣기"
                    >
                      <SpeakerWaveIcon class="w-4 h-4" />
                    </button>
                  </div>
                  <div class="p-3">
                    <p class="text-sm text-gray-700 font-medium leading-relaxed">{{ currentLearningItem.improvedText }}</p>
                  </div>
                </div>
              </div>

              <!-- Grammar Corrections -->
              <div v-if="currentLearningItem.grammarCorrections?.length" class="bg-white rounded-xl border border-amber-200 overflow-hidden">
                <div class="px-3 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                  <ExclamationTriangleIcon class="w-4 h-4 text-amber-600" />
                  <span class="text-sm font-bold text-amber-700">문법 교정</span>
                  <span class="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {{ currentLearningItem.grammarCorrections.length }}
                  </span>
                </div>
                <div class="p-3 space-y-2">
                  <div
                    v-for="(correction, idx) in currentLearningItem.grammarCorrections"
                    :key="idx"
                    class="flex gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span class="w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <p class="text-sm text-gray-700 leading-relaxed">{{ correction }}</p>
                  </div>
                </div>
              </div>

              <!-- Expression Suggestions -->
              <div v-if="currentLearningItem.suggestions?.length" class="bg-white rounded-xl border border-blue-200 overflow-hidden">
                <div class="px-3 py-2 bg-blue-50 border-b border-blue-200 flex items-center gap-2">
                  <LightBulbIcon class="w-4 h-4 text-blue-600" />
                  <span class="text-sm font-bold text-blue-700">더 나은 표현 제안</span>
                  <span class="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                    {{ currentLearningItem.suggestions.length }}
                  </span>
                </div>
                <div class="p-3 space-y-2">
                  <div
                    v-for="(suggestion, idx) in currentLearningItem.suggestions"
                    :key="idx"
                    class="flex gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span class="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      <LightBulbIcon class="w-3 h-3" />
                    </span>
                    <p class="text-sm text-gray-700 leading-relaxed">{{ suggestion }}</p>
                  </div>
                </div>
              </div>

              <!-- Empty state when no corrections or suggestions -->
              <div v-if="!currentLearningItem.grammarCorrections?.length && !currentLearningItem.suggestions?.length"
                   class="bg-white rounded-xl border border-green-200 p-4 text-center">
                <div class="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckBadgeIcon class="w-5 h-5 text-green-600" />
                </div>
                <p class="text-sm text-green-700 font-medium">문법적으로 훌륭한 문장입니다!</p>
              </div>

              <!-- Practice Section (Azure Speech 발음 평가) -->
              <div class="bg-white rounded-xl border border-violet-200 overflow-hidden">
                <div class="px-3 py-2 bg-violet-50 border-b border-violet-200 flex items-center gap-2">
                  <MicrophoneIcon class="w-4 h-4 text-violet-600" />
                  <span class="text-sm font-bold text-violet-700">따라하기 연습</span>
                  <span class="text-xs text-violet-500 ml-auto">Azure Speech</span>
                </div>
                <div class="p-4">
                  <!-- Recording Controls -->
                  <div class="flex flex-col items-center gap-3">
                    <button
                      @click="toggleRecording"
                      :disabled="isConnecting || isAssessing"
                      class="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="isRecording
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white animate-pulse shadow-red-200'
                        : isConnecting
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-yellow-200'
                          : isAssessing
                            ? 'bg-gradient-to-br from-blue-400 to-cyan-500 text-white animate-pulse shadow-blue-200'
                            : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:from-violet-600 hover:to-indigo-700 shadow-violet-200'"
                    >
                      <MicrophoneIcon v-if="!isConnecting && !isAssessing" class="w-8 h-8" />
                      <svg v-else class="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </button>
                    <div class="text-center">
                      <p class="text-xs font-medium flex items-center justify-center gap-1" :class="isRecording ? 'text-red-600' : isConnecting ? 'text-yellow-600' : isAssessing ? 'text-blue-600' : 'text-violet-700'">
                        <span v-if="isConnecting" class="w-3 h-3 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></span>
                        <span v-else-if="isRecording" class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        <span v-else-if="isAssessing" class="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        {{ isConnecting ? '연결 중...' : isRecording ? `녹음 중 (${recordingTime}초)` : isAssessing ? '발음 평가 중...' : '버튼을 클릭하여 녹음 시작' }}
                      </p>
                      <!-- Interim Text (실시간 인식 중) -->
                      <p v-if="interimText && isRecording" class="text-xs text-gray-400 mt-1 italic">{{ interimText }}</p>
                    </div>
                  </div>

                  <!-- Recognized Text -->
                  <div v-if="recognizedText && !isRecording" class="mt-4 p-3 bg-white rounded-lg border border-violet-100">
                    <p class="text-xs text-gray-500 mb-1 text-center">인식된 문장</p>
                    <p class="text-sm text-gray-900 font-medium text-center leading-relaxed">{{ recognizedText }}</p>
                  </div>

                  <!-- Assessment Error -->
                  <div v-if="assessmentError" class="mt-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <p class="text-xs text-red-600 text-center">{{ assessmentError }}</p>
                  </div>

                  <!-- Pronunciation Assessment Results -->
                  <div v-if="assessmentResult && !isRecording" class="mt-4 space-y-4">
                    <!-- Overall Score -->
                    <div class="bg-white rounded-xl border border-violet-100 p-4">
                      <div class="flex items-center justify-between mb-3">
                        <span class="text-sm font-bold text-gray-700">발음 평가 결과</span>
                        <span
                          class="px-3 py-1 rounded-full text-lg font-bold"
                          :class="getScoreBgClass(assessmentResult.pronunciation_score)"
                        >
                          {{ Math.round(assessmentResult.pronunciation_score) }}점
                        </span>
                      </div>

                      <!-- Score Breakdown -->
                      <div class="grid grid-cols-3 gap-2 mb-4">
                        <div class="text-center p-2 bg-gray-50 rounded-lg">
                          <p class="text-xs text-gray-500 mb-1">정확도</p>
                          <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.accuracy_score)">
                            {{ Math.round(assessmentResult.accuracy_score) }}
                          </p>
                        </div>
                        <div class="text-center p-2 bg-gray-50 rounded-lg">
                          <p class="text-xs text-gray-500 mb-1">유창성</p>
                          <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.fluency_score)">
                            {{ Math.round(assessmentResult.fluency_score) }}
                          </p>
                        </div>
                        <div class="text-center p-2 bg-gray-50 rounded-lg">
                          <p class="text-xs text-gray-500 mb-1">운율</p>
                          <p class="text-sm font-bold" :class="getScoreBgClass(assessmentResult.prosody_score)">
                            {{ Math.round(assessmentResult.prosody_score) }}
                          </p>
                        </div>
                      </div>

                      <!-- Feedback Message -->
                      <div v-if="formattedFeedback" class="p-3 bg-violet-50 rounded-lg border border-violet-100">
                        <p class="text-sm text-violet-800 font-medium mb-2">{{ formattedFeedback.overallFeedback }}</p>
                        <ul v-if="formattedFeedback.detailedFeedback.length > 0" class="space-y-1">
                          <li v-for="(feedback, idx) in formattedFeedback.detailedFeedback" :key="idx" class="text-xs text-violet-600">
                            {{ feedback }}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <!-- Word-by-Word Analysis -->
                    <div v-if="assessmentResult.words && assessmentResult.words.length > 0" class="bg-white rounded-xl border border-violet-100 p-4">
                      <p class="text-sm font-bold text-gray-700 mb-3">단어별 평가</p>
                      <div class="flex flex-wrap gap-2">
                        <div
                          v-for="(word, idx) in assessmentResult.words"
                          :key="idx"
                          class="group relative"
                        >
                          <span
                            class="inline-block px-2 py-1 rounded-md text-sm font-medium cursor-help transition-all"
                            :class="getWordScoreClass(word.accuracy_score)"
                          >
                            {{ word.word }}
                            <span class="text-xs opacity-70 ml-1">({{ Math.round(word.accuracy_score) }})</span>
                          </span>

                          <!-- Phoneme Tooltip -->
                          <div v-if="word.phonemes && word.phonemes.length > 0"
                               class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div class="bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg whitespace-nowrap">
                              <p class="font-bold mb-1">음소별 평가</p>
                              <div class="flex flex-wrap gap-1">
                                <span
                                  v-for="(phoneme, pIdx) in word.phonemes"
                                  :key="pIdx"
                                  class="px-1.5 py-0.5 rounded"
                                  :class="phoneme.accuracy_score >= 80 ? 'bg-green-600' : phoneme.accuracy_score >= 60 ? 'bg-yellow-600' : 'bg-red-600'"
                                >
                                  {{ phoneme.phoneme }} ({{ Math.round(phoneme.accuracy_score) }})
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p class="text-xs text-gray-400 mt-2">* 단어 위에 마우스를 올리면 음소별 점수를 볼 수 있어요</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Completion Card (Inside Scroll Area) -->
              <div v-if="currentLearningIndex >= learningItems.length - 1 && learningItems.length > 0"
                   class="bg-white rounded-xl border border-emerald-200 p-6 text-center">
                <div class="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckBadgeIcon class="w-7 h-7 text-emerald-600" />
                </div>
                <h4 class="text-lg font-bold text-gray-900 mb-1">모든 학습을 완료했습니다!</h4>
                <p class="text-sm text-gray-600 mb-4">총 {{ learningItems.length }}개의 문장을 학습했어요.</p>
                <div class="flex items-center justify-center gap-2">
                  <button
                    @click="currentLearningIndex = 0"
                    class="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-all duration-200"
                  >
                    처음부터 다시
                  </button>
                  <button
                    @click="exitLearningMode"
                    class="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200"
                  >
                    돌아가기
                  </button>
                </div>
              </div>
            </div>

            <!-- Navigation (Fixed at Bottom) -->
            <div class="flex-shrink-0 px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
              <button
                @click="prevLearningItem"
                :disabled="currentLearningIndex === 0"
                class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                <ChevronLeftIcon class="w-4 h-4" />
                이전
              </button>

              <!-- Page indicator dots -->
              <div class="flex items-center gap-1">
                <template v-for="(_, idx) in learningItems.slice(0, Math.min(learningItems.length, 7))" :key="idx">
                  <div
                    class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                    :class="idx === currentLearningIndex
                      ? 'bg-gray-900 w-3'
                      : idx < currentLearningIndex
                        ? 'bg-gray-500'
                        : 'bg-gray-300'"
                  ></div>
                </template>
                <span v-if="learningItems.length > 7" class="text-xs text-gray-400 ml-1">
                  +{{ learningItems.length - 7 }}
                </span>
              </div>

              <button
                @click="nextLearningItem"
                :disabled="currentLearningIndex >= learningItems.length - 1"
                class="px-4 py-2 bg-gray-900 hover:bg-black text-white text-sm font-medium rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1.5 shadow-sm"
              >
                다음
                <ChevronRightIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <AudioUploadModal
      ref="uploadModalRef"
      :show="showUploadModal"
      @close="showUploadModal = false"
      @upload="handleUpload"
    />

    <!-- Error Toast -->
    <div
      v-if="errorMessage"
      class="fixed bottom-6 right-6 bg-red-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50"
    >
      <ExclamationCircleIcon class="w-5 h-5" />
      <span>{{ errorMessage }}</span>
      <button @click="errorMessage = null" class="ml-2 hover:opacity-75">
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  MicrophoneIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SpeakerWaveIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  PencilIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import { speakingTutorService } from '@/services/speakingTutorService'

// Composables
import { useLearningVoice } from '@/composables/conversation/useLearningVoice'

// Components
import AudioUploadModal from '@/components/conversation/AudioUploadModal.vue'
import SpeakingSessionCard from '@/components/conversation/SpeakingSessionCard.vue'
import SpeakingEmptyState from '@/components/conversation/SpeakingEmptyState.vue'

// State
const currentView = ref('list') // 'list' | 'analyzing' | 'results' | 'learning'
const showUploadModal = ref(false)
const uploadModalRef = ref(null)

// Analysis State
const currentSessionId = ref(null)
const currentSession = ref(null)
const analysisProgress = ref(0)
const analysisMessage = ref('분석을 시작합니다...')
const pollingInterval = ref(null)

// Results State
const speakers = ref([])
const utterances = ref([])
const selectedSpeakers = ref([])
const selectedUtterance = ref(null)
const isLoadingFeedback = ref(false)

// Speaker Edit State
const editingSpeakerId = ref(null)
const editingSpeakerLabel = ref('')
const isSavingSpeakerLabel = ref(false)

// History State
const sessions = ref([])
const sessionsLoading = ref(false)

// Learning Mode State
const learningItems = ref([])
const currentLearningIndex = ref(0)
const learningScrollContainer = ref(null)

// Learning Voice (Azure Speech 기반 발음 평가)
const {
  isRecording,
  isConnecting,
  recordingTime,
  interimText,
  recognizedText,
  isAssessing,
  assessmentResult,
  assessmentError,
  formattedFeedback,
  startRecording,
  stopRecordingAndAssess,
  resetState: resetVoiceState,
  getScoreBgClass,
  getWordScoreClass
} = useLearningVoice()

// Error State
const errorMessage = ref(null)

// Computed
const filteredUtterances = computed(() => {
  if (selectedSpeakers.value.length === 0) {
    return utterances.value
  }
  return utterances.value.filter(u => selectedSpeakers.value.includes(u.speakerId))
})

const currentLearningItem = computed(() => {
  if (learningItems.value.length === 0) return null
  return learningItems.value[currentLearningIndex.value] || null
})

// Lifecycle
onMounted(async () => {
  await loadSessionHistory()
})

// Methods
async function loadSessionHistory() {
  sessionsLoading.value = true
  try {
    const result = await speakingTutorService.getSessions(0, 50)
    sessions.value = result.sessions || []
  } catch (error) {
    console.error('Failed to load sessions:', error)
  } finally {
    sessionsLoading.value = false
  }
}

function handleUpload({ file, language }) {
  uploadFile(file, language)
}

async function uploadFile(file, language) {
  try {
    showUploadModal.value = false
    currentView.value = 'analyzing'
    analysisProgress.value = 0
    analysisMessage.value = '파일 업로드 중...'

    const result = await speakingTutorService.uploadAudio(file, language)
    currentSessionId.value = result.sessionId
    analysisMessage.value = '파일이 업로드되었습니다. 분석을 시작합니다...'

    // Start polling for progress
    startPolling()
  } catch (error) {
    console.error('Upload failed:', error)
    errorMessage.value = error.response?.data?.detail || '업로드에 실패했습니다. 다시 시도해주세요.'
    currentView.value = 'list'
    if (uploadModalRef.value) {
      uploadModalRef.value.setError(errorMessage.value)
    }
  }
}

function startPolling() {
  pollingInterval.value = setInterval(async () => {
    try {
      const result = await speakingTutorService.getAnalysis(currentSessionId.value)

      if (result.status === 'COMPLETED') {
        clearInterval(pollingInterval.value)
        analysisProgress.value = 100
        loadResults(result)
      } else if (result.status === 'FAILED') {
        clearInterval(pollingInterval.value)
        errorMessage.value = result.message || '분석에 실패했습니다'
        currentView.value = 'list'
        await loadSessionHistory()
      } else {
        analysisProgress.value = result.progress || 0
        analysisMessage.value = result.message || '처리 중...'
      }
    } catch (error) {
      console.error('Polling error:', error)
    }
  }, 2000)
}

function loadResults(result) {
  currentSession.value = result
  speakers.value = result.speakers || []
  utterances.value = result.utterances || []
  selectedSpeakers.value = speakers.value.map(s => s.id)
  currentView.value = 'results'
  loadSessionHistory()
}

async function handleSelectSession(sessionId) {
  try {
    currentSessionId.value = sessionId
    const result = await speakingTutorService.getAnalysis(sessionId)

    if (result.status === 'COMPLETED') {
      loadResults(result)
    } else if (result.status === 'PROCESSING' || result.status === 'PENDING') {
      currentView.value = 'analyzing'
      analysisProgress.value = result.progress || 0
      analysisMessage.value = result.message || '처리 중...'
      startPolling()
    } else {
      errorMessage.value = '세션을 불러올 수 없습니다'
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    errorMessage.value = '세션을 불러올 수 없습니다'
  }
}

async function handleDeleteSession(sessionId) {
  if (!confirm('이 분석 기록을 삭제하시겠습니까?')) return

  try {
    await speakingTutorService.deleteSession(sessionId)
    await loadSessionHistory()
  } catch (error) {
    console.error('Failed to delete session:', error)
    errorMessage.value = '삭제에 실패했습니다'
  }
}

function backToList() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  currentView.value = 'list'
  currentSession.value = null
  speakers.value = []
  utterances.value = []
  selectedUtterance.value = null
  loadSessionHistory()
}

function toggleSpeakerFilter(speakerId) {
  const idx = selectedSpeakers.value.indexOf(speakerId)
  if (idx >= 0) {
    selectedSpeakers.value.splice(idx, 1)
  } else {
    selectedSpeakers.value.push(speakerId)
  }
}

function showAllSpeakers() {
  selectedSpeakers.value = speakers.value.map(s => s.id)
}

// Speaker Edit Functions
function startEditSpeaker(speaker) {
  editingSpeakerId.value = speaker.id
  editingSpeakerLabel.value = speaker.label
}

function cancelEditSpeaker() {
  editingSpeakerId.value = null
  editingSpeakerLabel.value = ''
}

async function saveSpeakerLabel(speakerId) {
  if (!editingSpeakerLabel.value.trim()) {
    errorMessage.value = '화자 이름을 입력해주세요'
    return
  }

  isSavingSpeakerLabel.value = true
  try {
    await speakingTutorService.updateSpeakerLabel(
      currentSessionId.value,
      speakerId,
      editingSpeakerLabel.value.trim()
    )

    // Update local state
    const speakerIdx = speakers.value.findIndex(s => s.id === speakerId)
    if (speakerIdx >= 0) {
      speakers.value[speakerIdx].label = editingSpeakerLabel.value.trim()
    }

    // Update utterances speakerLabel
    utterances.value.forEach(u => {
      if (u.speakerId === speakerId) {
        u.speakerLabel = editingSpeakerLabel.value.trim()
      }
    })

    // Reset edit state
    editingSpeakerId.value = null
    editingSpeakerLabel.value = ''
  } catch (error) {
    console.error('Failed to update speaker label:', error)
    errorMessage.value = '화자 이름 변경에 실패했습니다'
  } finally {
    isSavingSpeakerLabel.value = false
  }
}

function selectUtterance(utterance) {
  selectedUtterance.value = utterance
}

async function requestFeedback() {
  if (!selectedUtterance.value) return

  isLoadingFeedback.value = true
  try {
    const result = await speakingTutorService.generateFeedback(
      selectedUtterance.value.id,
      'business meeting'
    )

    // Update the utterance with feedback
    const idx = utterances.value.findIndex(u => u.id === selectedUtterance.value.id)
    if (idx >= 0) {
      utterances.value[idx] = {
        ...utterances.value[idx],
        hasFeedback: true,
        feedback: result.feedback
      }
      selectedUtterance.value = utterances.value[idx]
    }
  } catch (error) {
    console.error('Feedback generation failed:', error)
    errorMessage.value = '피드백 생성에 실패했습니다'
  } finally {
    isLoadingFeedback.value = false
  }
}

async function startLearningMode() {
  if (!currentSessionId.value) return

  try {
    // Get learning data from API - use selected speakers filter
    const result = await speakingTutorService.getLearningData(
      currentSessionId.value,
      selectedSpeakers.value
    )

    learningItems.value = result.learningItems || []
    currentLearningIndex.value = 0
    resetVoiceState()

    if (learningItems.value.length === 0) {
      // If no learning items, check if we need feedback first
      const utterancesWithFeedback = utterances.value.filter(u => u.hasFeedback)
      if (utterancesWithFeedback.length === 0) {
        errorMessage.value = '피드백을 먼저 생성해주세요. 발화를 선택하고 "피드백 받기" 버튼을 클릭하세요.'
        return
      }

      // Build learning items from feedback
      learningItems.value = utterancesWithFeedback
        .filter(u => u.feedback?.improvedSentence && u.feedback.improvedSentence !== u.text)
        .map(u => ({
          utteranceId: u.id,
          originalText: u.text,
          improvedText: u.feedback.improvedSentence,
          grammarCorrections: u.feedback.grammarCorrections || [],
          suggestions: u.feedback.suggestions || [],
          score: u.feedback.score || 0,
          scoreBreakdown: u.feedback.scoreBreakdown || {},
          speakerId: u.speakerId,
          practiceCount: 0
        }))
    }

    if (learningItems.value.length === 0) {
      errorMessage.value = '학습할 항목이 없습니다. 교정이 필요한 발화가 없습니다.'
      return
    }

    currentView.value = 'learning'
  } catch (error) {
    console.error('Failed to start learning mode:', error)
    errorMessage.value = '학습 모드를 시작할 수 없습니다.'
  }
}

function exitLearningMode() {
  currentView.value = 'results'
  resetVoiceState()
}

function goToLearningWithUtterance() {
  if (!selectedUtterance.value?.feedback) return

  // Create learning item for this specific utterance
  const utterance = selectedUtterance.value
  learningItems.value = [{
    utteranceId: utterance.id,
    originalText: utterance.text,
    improvedText: utterance.feedback.improvedSentence || utterance.text,
    grammarCorrections: utterance.feedback.grammarCorrections || [],
    suggestions: utterance.feedback.suggestions || [],
    score: utterance.feedback.score || 0,
    scoreBreakdown: utterance.feedback.scoreBreakdown || {},
    speakerId: utterance.speakerId,
    practiceCount: 0
  }]
  currentLearningIndex.value = 0
  resetVoiceState()
  currentView.value = 'learning'
}

function prevLearningItem() {
  if (currentLearningIndex.value > 0) {
    currentLearningIndex.value--
    resetVoiceState()
  }
}

function nextLearningItem() {
  if (currentLearningIndex.value < learningItems.value.length - 1) {
    currentLearningIndex.value++
    resetVoiceState()
  }
}

function getScoreBgColor(score) {
  if (score >= 9) return 'bg-green-100 text-green-600'
  if (score >= 7) return 'bg-blue-100 text-blue-600'
  if (score >= 5) return 'bg-yellow-100 text-yellow-600'
  return 'bg-red-100 text-red-600'
}



function speakText(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    const lang = currentSession.value?.language || 'en-US'
    utterance.lang = lang.split('-')[0] === 'ko' ? 'ko-KR' : 'en-US'
    utterance.rate = 0.9
    speechSynthesis.speak(utterance)
  } else {
    errorMessage.value = '이 브라우저는 음성 합성을 지원하지 않습니다.'
  }
}

/**
 * 녹음 토글 (Azure Speech 기반 발음 평가)
 *
 * 녹음 시작 시: useRealtimeSTT로 실시간 음성 인식 시작
 * 녹음 종료 시: Azure Speech로 발음 평가 수행
 */
async function toggleRecording() {
  if (isRecording.value) {
    // 녹음 중지 및 발음 평가 수행
    try {
      const referenceText = currentLearningItem.value?.improvedText || ''
      const language = currentSession.value?.language || 'en-US'

      await stopRecordingAndAssess(referenceText, language)

      // 발음 평가 완료 후 스크롤을 맨 아래로
      await nextTick()
      scrollLearningToBottom()
    } catch (error) {
      console.error('Recording stop error:', error)
      errorMessage.value = assessmentError.value || '발음 평가에 실패했습니다.'
    }
  } else {
    // 녹음 시작
    try {
      const language = currentSession.value?.language || 'en-US'
      await startRecording(language)
    } catch (error) {
      console.error('Recording start error:', error)
      errorMessage.value = '마이크에 접근할 수 없습니다. 권한을 확인해주세요.'
    }
  }
}

/**
 * 학습 모드 스크롤을 맨 아래로 이동
 */
function scrollLearningToBottom() {
  if (learningScrollContainer.value) {
    learningScrollContainer.value.scrollTo({
      top: learningScrollContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Utility Functions
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

function getSpeakerColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function getSpeakerBgColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function getScoreColor(score) {
  if (score >= 8) return 'text-green-600'
  if (score >= 6) return 'text-yellow-600'
  return 'text-red-600'
}

function getScoreLabel(key) {
  const labels = {
    grammar: '문법',
    vocabulary: '어휘',
    fluency: '유창성',
    clarity: '명확성'
  }
  return labels[key] || key
}
</script>

<style scoped>
.font-nanum-round-eb {
  font-family: 'NanumSquareRound', sans-serif;
  font-weight: 800;
}
</style>
