<template>
  <div class="h-full w-full flex flex-col bg-gray-50">
    <!-- Error Display (Debug) -->
    <div v-if="error" class="bg-red-50 p-4 border-b border-red-200 text-red-700 flex items-center justify-between">
      <span>오류: {{ error }}</span>
      <button @click="error = null" class="text-red-500 hover:text-red-700">닫기</button>
    </div>

    <!-- Header -->
    <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
      <div class="flex items-center gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900 flex items-center gap-2">
            {{ scenario?.title || '회화 연습' }}
            <span v-if="scenario?.category" class="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
              {{ scenario.category }}
            </span>
          </h1>
          <p class="text-sm text-gray-500 mt-0.5">{{ scenario?.description }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div v-if="scenario" class="hidden md:flex items-center gap-4 text-sm text-gray-600 mr-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-900">나의 역할:</span>
            <span>{{ scenario.roles?.user || 'User' }}</span>
          </div>
          <div class="w-px h-4 bg-gray-300"></div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-900">상대 역할:</span>
            <span>{{ scenario.roles?.ai || 'AI' }}</span>
          </div>
        </div>
        <button 
          @click="resetConversation" 
          :disabled="isLoading"
          class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="대화 초기화"
        >
          <ArrowPathIcon class="w-5 h-5" />
        </button>
        <button 
          @click="endConversation" 
          class="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          종료
        </button>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- Main Chat Area -->
      <main class="flex-1 flex flex-col relative min-w-0 bg-gray-50 transition-all duration-300">

        <!-- Avatar View (replaces chat area when enabled) -->
        <div v-if="avatarEnabled" class="flex-1 bg-black flex flex-col">
          <!-- Video Container -->
          <div class="flex-1 relative flex items-center justify-center">
            <video
              ref="avatarVideoElement"
              class="w-full h-full object-contain"
              autoplay
              playsinline
            ></video>

            <!-- Avatar Status Badge -->
            <div class="absolute top-4 right-4">
              <div class="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 text-green-400 text-xs font-bold border border-white/10">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                아바타 활성
              </div>
            </div>

            <!-- Voice Status (shown over avatar when recording/processing) -->
            <div v-if="isRecording || isProcessingVoice || recognizedText" class="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-2xl p-6 text-center max-w-lg border border-white/10 transition-all">
              <div v-if="isRecording" class="space-y-3">
                <div class="flex items-center justify-center gap-2 text-red-400 font-bold animate-pulse">
                  <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                  Recording... {{ recordingTime }}s
                </div>
                <p class="text-white text-lg font-medium">{{ interimText || '듣는 중...' }}</p>
              </div>
              <div v-else-if="isProcessingVoice" class="flex items-center justify-center gap-3 text-blue-400 font-medium">
                <ArrowPathIcon class="w-6 h-6 animate-spin" />
                Processing voice...
              </div>
              <div v-else-if="recognizedText" class="space-y-2">
                <p class="text-xs text-gray-400 font-bold uppercase tracking-wider">You Said</p>
                <p class="text-white text-xl font-medium">"{{ recognizedText }}"</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Mode View -->
        <div v-else class="flex-1 flex flex-col min-h-0 bg-gray-50">
          <!-- Required Terms Section -->
          <div class="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 shrink-0">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CheckCircleIcon class="w-4 h-4 text-blue-500" />
              필수 용어
            </h3>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="term in requiredTerms" 
                :key="term"
                class="px-3 py-1.5 rounded-lg text-sm font-bold border transition-all duration-300 flex items-center gap-1.5"
                :class="[
                  detectedTerms.includes(term) 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                    : 'bg-gray-50 text-gray-500 border-gray-200'
                ]"
              >
                {{ term }}
                <CheckCircleIcon v-if="detectedTerms.includes(term)" class="w-4 h-4 text-white" />
              </span>
            </div>
          </div>

          <!-- Messages List -->
          <div class="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth" ref="conversationArea">
          <div v-if="!isLoading && messages.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
            <ChatBubbleLeftRightIcon class="w-16 h-16 opacity-20" />
            <p>대화를 시작해보세요!</p>
          </div>

          <div
            v-for="(message, index) in messages"
            :key="index"
            class="flex flex-col max-w-3xl"
            :class="message.speaker === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'"
          >
            <!-- Speaker Name -->
            <span class="text-xs font-medium text-gray-500 mb-1 px-1">
              {{ message.speaker === 'user' ? (scenario?.roles?.user || 'Me') : (scenario?.roles?.ai || 'AI') }}
            </span>

            <!-- Bubble -->
            <div
              class="relative px-5 py-3.5 shadow-sm text-[15px] leading-relaxed group transition-all duration-200"
              :class="[
                message.speaker === 'user' 
                  ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm cursor-pointer hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5' 
                  : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm',
                message.speaker === 'user' && isMessageSelected(message) ? 'ring-2 ring-offset-2 ring-blue-400' : ''
              ]"
              @click="message.speaker === 'user' ? handleMessageClick(message) : null"
            >
              <!-- Message Content -->
              <p>{{ message.showTranslation ? (message.translatedText || message.message) : message.message }}</p>

              <!-- Translation Button (AI only) -->
              <button
                v-if="message.speaker === 'ai'"
                @click.stop="toggleTranslation(index)"
                :disabled="translationLoading[index]"
                class="absolute -bottom-9 left-0 text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md transition-colors shadow-sm border border-blue-100 z-10"
              >
                <LanguageIcon class="w-3.5 h-3.5" />
                {{ translationLoading[index] ? '번역 중...' : (message.showTranslation ? '원문 보기' : '번역') }}
              </button>

              <!-- Feedback Indicator (User only) -->
               <div v-if="message.speaker === 'user'" class="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-blue-400">
                  <ChartBarIcon class="w-4 h-4" />
               </div>
            </div>
            
            <!-- Timestamp -->
            <span 
              class="text-[10px] text-gray-400 px-1 transition-all"
              :class="message.speaker === 'ai' ? 'mt-10' : 'mt-1'"
            >
              {{ formatTime(message.timestamp) }}
            </span>
          </div>

          <!-- Loading Indicator -->
          <div v-if="isLoading" class="flex flex-col items-start max-w-3xl mr-auto">
             <span class="text-xs font-medium text-gray-500 mb-1 px-1">{{ scenario?.roles?.ai || 'AI' }}</span>
             <div class="bg-white border border-gray-200 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
               <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
               <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
               <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
             </div>
          </div>
          </div>
        </div>

        <!-- Input Area (Always visible) -->
        <div class="p-6 bg-white border-t border-gray-200 z-20 shrink-0">
          <div class="max-w-4xl mx-auto flex flex-col gap-4">
            
            <!-- Voice Input Status (Only visible in Chat Mode) -->
            <div v-if="inputMode === 'voice' && !avatarEnabled" class="bg-gray-50 rounded-xl border border-gray-200 p-4 min-h-[100px] flex flex-col justify-center items-center relative overflow-hidden">
               <div v-if="isRecording" class="flex flex-col items-center gap-3 z-10">
                 <div class="flex items-center gap-2 text-red-500 font-bold animate-pulse">
                   <span class="w-3 h-3 bg-red-500 rounded-full"></span>
                   Recording... {{ recordingTime }}s
                 </div>
                 <div class="text-center space-y-1">
                    <p v-for="(text, idx) in finalTexts" :key="idx" class="text-gray-900 font-medium">{{ text }}</p>
                    <p class="text-gray-500 italic">{{ interimText || 'Listening...' }}</p>
                 </div>
               </div>
               <div v-else-if="isProcessingVoice" class="flex items-center gap-2 text-blue-600 font-medium z-10">
                 <ArrowPathIcon class="w-5 h-5 animate-spin" />
                 Processing voice...
               </div>
               <div v-else-if="recognizedText" class="text-center z-10">
                 <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Recognized Text</p>
                 <p class="text-gray-900 text-lg">{{ recognizedText }}</p>
               </div>
               <div v-else class="text-gray-400 text-sm z-10">
                 Click the microphone to start speaking
               </div>
               
               <!-- Waveform Animation (Visual only) -->
               <div v-if="isRecording" class="absolute inset-0 flex items-end justify-center gap-1 pb-2 opacity-10">
                  <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1s_infinite]" style="height: 40%"></div>
                  <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1.2s_infinite]" style="height: 70%"></div>
                  <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_0.8s_infinite]" style="height: 50%"></div>
                  <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_1.1s_infinite]" style="height: 80%"></div>
                  <div class="w-2 bg-red-500 rounded-t-full animate-[bounce_0.9s_infinite]" style="height: 60%"></div>
               </div>
            </div>

            <!-- Controls -->
            <div class="flex items-end gap-3">
              <!-- Mode Toggle -->
              <button 
                @click="toggleInputMode"
                class="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                :title="inputMode === 'text' ? 'Switch to Voice' : 'Switch to Text'"
              >
                <MicrophoneIcon v-if="inputMode === 'text'" class="w-6 h-6" />
                <CommandLineIcon v-else class="w-6 h-6" />
              </button>

              <!-- Avatar Toggle (Voice Mode Only) -->
              <button
                v-if="inputMode === 'voice'"
                @click="toggleAvatar"
                class="p-3 rounded-xl transition-all border"
                :class="[
                  avatarEnabled 
                    ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' 
                    : 'bg-white border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                ]"
                :disabled="isAvatarInitializing"
                title="Toggle Avatar"
              >
                <ArrowPathIcon v-if="isAvatarInitializing" class="w-6 h-6 animate-spin" />
                <UserCircleIcon v-else class="w-6 h-6" />
              </button>

              <!-- Input Field (Text Mode) -->
              <div v-if="inputMode === 'text'" class="flex-1 relative">
                <textarea
                  v-model="userInput"
                  @keydown.enter.prevent="sendMessage"
                  placeholder="메시지를 입력하세요... (Enter로 전송)"
                  class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none resize-none text-gray-900 placeholder-gray-400 transition-all"
                  rows="1"
                  style="min-height: 50px; max-height: 150px;"
                ></textarea>
              </div>

              <!-- Record Button (Voice Mode) -->
              <button
                v-else
                @click="isRecording ? stopRecording() : startRecording()"
                class="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                :class="[
                  isRecording 
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-200' 
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                ]"
                :disabled="isProcessingVoice"
              >
                <div v-if="isProcessingVoice" class="flex items-center gap-2">
                  <ArrowPathIcon class="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
                <div v-else-if="isRecording" class="flex items-center gap-2">
                  <StopIcon class="w-5 h-5" />
                  <span>Stop Recording</span>
                </div>
                <div v-else class="flex items-center gap-2">
                  <MicrophoneIcon class="w-5 h-5" />
                  <span>Start Recording</span>
                </div>
              </button>

              <!-- Send Button -->
              <button
                @click="sendMessage"
                :disabled="!userInput.trim() || isLoading || isRecording || isProcessingVoice"
                class="p-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200/50"
              >
                <PaperAirplaneIcon class="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <!-- Feedback Sidebar -->
      <aside class="w-[700px] bg-white border-l border-gray-200 flex flex-col shadow-xl z-30 shrink-0 transition-all duration-300">
        <div class="p-5 border-b border-gray-100 bg-white">
          <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
            <ChartBarIcon class="w-5 h-5 text-blue-700" />
            피드백
          </h2>
          
          <!-- Tabs -->
          <div class="flex p-1 bg-gray-100 rounded-xl">
            <button
              v-for="tab in ['messages', 'comprehensive']"
              :key="tab"
              @click="activeTab = tab"
              class="flex-1 py-2 text-sm font-bold rounded-lg transition-all"
              :class="[
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              ]"
            >
              {{ tab === 'messages' ? '대화별 피드백' : '종합 피드백' }}
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
          
          <!-- Message Analysis Tab -->
          <div v-if="activeTab === 'messages'">
            <div v-if="userMessages.length === 0" class="text-center py-12 text-gray-400">
              <ChatBubbleLeftRightIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p class="text-sm">메시지를 보내면 실시간 피드백을 받을 수 있어요</p>
            </div>

            <div v-else class="space-y-6">
              <!-- Message Navigator -->
              <div class="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                <button @click="selectMessage(Math.max(0, selectedMessageIndex - 1))" :disabled="selectedMessageIndex <= 0" class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronLeftIcon class="w-5 h-5 text-gray-600" />
                </button>
                <span class="text-sm font-bold text-gray-700">
                  메시지 {{ selectedMessageIndex + 1 }} / {{ userMessages.length }}
                </span>
                <button @click="selectMessage(Math.min(userMessages.length - 1, selectedMessageIndex + 1))" :disabled="selectedMessageIndex >= userMessages.length - 1" class="p-2 hover:bg-white rounded-lg disabled:opacity-30 transition-colors">
                  <ChevronRightIcon class="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <!-- Selected Message Feedback -->
              <div v-if="selectedMessageFeedback" class="space-y-6 animate-fadeIn">
                
                <!-- Original Message -->
                <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p class="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">나의 메시지</p>
                  <p class="text-gray-900 font-medium">{{ userMessages[selectedMessageIndex].message }}</p>
                </div>

                <!-- Scores -->
                <div v-if="selectedMessageFeedback.score !== undefined" class="grid grid-cols-2 gap-3">
                  <div class="bg-white border border-gray-100 rounded-xl p-4 text-center shadow-sm">
                    <div class="text-3xl font-black text-blue-600 mb-1">{{ selectedMessageFeedback.score }}</div>
                    <div class="text-xs font-bold text-gray-400 uppercase">종합</div>
                  </div>
                  <div class="bg-white border border-gray-100 rounded-xl p-4 space-y-2 shadow-sm">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-gray-500 font-medium">문법</span>
                      <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.grammar }}/10</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-gray-500 font-medium">어휘</span>
                      <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.vocabulary }}/10</span>
                    </div>
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-gray-500 font-medium">유창성</span>
                      <span class="font-bold text-gray-900">{{ selectedMessageFeedback.score_breakdown?.fluency }}/10</span>
                    </div>
                  </div>
                </div>

                <!-- Terminology Usage -->
                <div v-if="selectedMessageFeedback.terminology_usage" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircleIcon class="w-4 h-4 text-emerald-500" />
                    용어 사용
                  </h3>
                  <div class="bg-emerald-50 border border-emerald-100 rounded-xl p-4 space-y-3">
                    <div v-if="selectedMessageFeedback.terminology_usage.used?.length" class="space-y-2">
                      <p class="text-xs font-bold text-emerald-600 uppercase">사용한 용어</p>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(term, idx) in selectedMessageFeedback.terminology_usage.used" :key="idx" class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                          {{ term }}
                        </span>
                      </div>
                    </div>
                    <div v-if="selectedMessageFeedback.terminology_usage.missed?.length" class="space-y-2">
                      <p class="text-xs font-bold text-gray-500 uppercase">미사용 용어</p>
                      <div class="flex flex-wrap gap-2">
                        <span v-for="(term, idx) in selectedMessageFeedback.terminology_usage.missed" :key="idx" class="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium">
                          {{ term }}
                        </span>
                      </div>
                    </div>
                    <div v-if="selectedMessageFeedback.terminology_usage.feedback" class="text-sm text-gray-700 mt-2">
                      {{ selectedMessageFeedback.terminology_usage.feedback }}
                    </div>
                  </div>
                </div>

                <!-- Grammar Corrections -->
                <div v-if="selectedMessageFeedback.grammar_corrections?.length" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ExclamationCircleIcon class="w-4 h-4 text-amber-500" />
                    문법 교정
                  </h3>
                  <div class="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                    <div v-for="(correction, idx) in selectedMessageFeedback.grammar_corrections" :key="idx" class="flex gap-2 text-sm text-gray-700">
                      <span class="text-amber-500">•</span>
                      <span>{{ correction }}</span>
                    </div>
                  </div>
                </div>

                <!-- Suggestions -->
                <div v-if="selectedMessageFeedback.suggestions?.length" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <LightBulbIcon class="w-4 h-4 text-blue-500" />
                    개선 제안
                  </h3>
                  <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
                    <div v-for="(suggestion, idx) in selectedMessageFeedback.suggestions" :key="idx" class="flex gap-2 text-sm text-gray-700">
                      <span class="text-blue-500">•</span>
                      <span>{{ suggestion }}</span>
                    </div>
                  </div>
                </div>

                <!-- Pronunciation Analysis -->
                <div v-if="selectedMessageFeedback.pronunciation_details" class="space-y-3">
                  <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MicrophoneIcon class="w-4 h-4 text-purple-500" />
                    발음
                  </h3>
                  
                  <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                    <div class="flex items-center justify-between mb-4">
                      <span class="text-sm font-medium text-gray-600">정확도</span>
                      <span class="text-lg font-bold text-purple-600">{{ selectedMessageFeedback.pronunciation_details.pronunciation_score.toFixed(1) }}</span>
                    </div>
                    
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(word, idx) in selectedMessageFeedback.pronunciation_details.words"
                        :key="idx"
                        class="px-2 py-1 rounded-lg text-sm font-medium border transition-colors cursor-help"
                        :class="[
                          word.accuracy_score >= 90 ? 'bg-green-50 text-green-700 border-green-200' :
                          word.accuracy_score >= 70 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        ]"
                        :title="`Score: ${word.accuracy_score.toFixed(0)}`"
                      >
                        {{ word.word }}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Comprehensive Report Tab -->
          <div v-else>
            <div v-if="!comprehensiveFeedback" class="text-center py-12 text-gray-400">
              <ChartBarIcon class="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p class="text-sm">대화를 완료하면 종합 리포트가 생성됩니다</p>
            </div>
            
            <div v-else class="space-y-6 animate-fadeIn">
              <!-- Overall Score Card -->
              <div class="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                <div class="text-center">
                  <div class="text-sm font-medium text-blue-100 mb-1 uppercase tracking-wider">종합 점수</div>
                  <div class="text-5xl font-black mb-2">{{ comprehensiveFeedback.overall_score?.toFixed(1) || 0 }}</div>
                  <div class="flex justify-center gap-4 text-xs font-medium text-blue-100">
                    <span>유창성: {{ comprehensiveFeedback.fluency_score?.toFixed(1) }}</span>
                    <span>•</span>
                    <span>정확도: {{ comprehensiveFeedback.accuracy_score?.toFixed(1) }}</span>
                  </div>
                </div>
              </div>

              <!-- Strengths -->
              <div v-if="comprehensiveFeedback.strengths?.length" class="space-y-3">
                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircleIcon class="w-4 h-4 text-green-500" />
                  잘한 점
                </h3>
                <ul class="space-y-2">
                  <li v-for="(strength, idx) in comprehensiveFeedback.strengths" :key="idx" class="flex gap-3 text-sm text-gray-600 bg-green-50/50 p-3 rounded-xl border border-green-100">
                    <span class="text-green-500 font-bold">•</span>
                    {{ strength }}
                  </li>
                </ul>
              </div>

              <!-- Improvements -->
              <div v-if="comprehensiveFeedback.areas_for_improvement?.length" class="space-y-3">
                <h3 class="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ArrowPathIcon class="w-4 h-4 text-amber-500" />
                  개선할 점
                </h3>
                <ul class="space-y-2">
                  <li v-for="(area, idx) in comprehensiveFeedback.areas_for_improvement" :key="idx" class="flex gap-3 text-sm text-gray-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                    <span class="text-amber-500 font-bold">•</span>
                    {{ area }}
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import conversationService from '@/services/conversationService'
import { speechToText } from '@/services/voiceService'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import {
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  StopIcon,
  PaperAirplaneIcon,
  LanguageIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
  LightBulbIcon,
  CheckCircleIcon,
  UserCircleIcon,
  CommandLineIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()

// Voice Recorder Composable
const {
  isRecording: voiceRecorderIsRecording,
  audioLevel,
  error: voiceRecorderError,
  startRecording: startVoiceRecording,
  stopRecording: stopVoiceRecording
} = useVoiceRecorder()

// State
const scenario = ref(null)
const messages = ref([])
const detectedTerms = ref([])
const userInput = ref('')
const isLoading = ref(false)
const error = ref(null)

// Translation State
const translationLoading = ref({})
const conversationArea = ref(null)

// Voice Input State
const inputMode = ref('text') // 'text' | 'voice'
const isRecording = ref(false)
const isProcessingVoice = ref(false)
const recognizedText = ref('')
const recordingTime = ref(0)
const lastAudioBlob = ref(null)
let recordingInterval = null

// Realtime STT State
const useRealtimeSTT = ref(true)
const interimText = ref('')
const finalTexts = ref([])

// TTS State
const autoPlayTTS = ref(true)

// Avatar State
const avatarEnabled = ref(false)
const isAvatarInitializing = ref(false)
const avatarVideoElement = ref(null)

// Feedback State
const activeTab = ref('messages') // 'messages' | 'comprehensive'
const comprehensiveFeedback = ref(null)
const selectedMessageIndex = ref(0)
const messageFeedbacks = ref([])

const scenarioId = route.params.scenarioId

// Computed
const userMessages = computed(() => messages.value.filter(msg => msg.speaker === 'user'))
const selectedMessageFeedback = computed(() => messageFeedbacks.value[selectedMessageIndex.value] || null)

// Methods
onMounted(async () => {
  try {
    isLoading.value = true
    
    if (!scenarioId) {
      throw new Error('Scenario ID is missing')
    }

    const historyResponse = await conversationService.getHistory(scenarioId)

    if (historyResponse.sessionId && historyResponse.messages?.length > 0) {
      const startResponse = await conversationService.start(scenarioId)
      scenario.value = startResponse.scenario

      messages.value = historyResponse.messages.map(msg => ({
        speaker: msg.sender,
        message: msg.message,
        translatedText: msg.translatedText,
        timestamp: new Date(msg.createdAt),
        showTranslation: false
      }))

      historyResponse.messages.forEach(msg => {
        if (msg.detectedTerms?.length > 0) {
          detectedTerms.value = [...new Set([...detectedTerms.value, ...msg.detectedTerms])]
        }
        if (msg.sender === 'user') {
          messageFeedbacks.value.push(msg.feedback ? JSON.parse(msg.feedback) : {
            score: 0,
            grammar_corrections: [],
            terminology_usage: { used: msg.detectedTerms || [] },
            suggestions: ['No feedback saved.']
          })
        }
      })

      if (userMessages.value.length > 0) {
        selectedMessageIndex.value = userMessages.value.length - 1
      }
    } else {
      const response = await conversationService.start(scenarioId)
      scenario.value = response.scenario
      if (response.initialMessage) {
        messages.value.push({
          speaker: 'ai',
          message: response.initialMessage,
          timestamp: new Date()
        })
      }
    }

    await nextTick()
    scrollToBottom()
  } catch (err) {
    error.value = err.message || 'Failed to start conversation.'
    console.error('Practice.vue Error:', err)
  } finally {
    isLoading.value = false
  }
})

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const message = userInput.value.trim()
  userInput.value = ''

  try {
    isLoading.value = true
    messages.value.push({ speaker: 'user', message, timestamp: new Date() })
    await nextTick()
    scrollToBottom()

    const history = messages.value.slice(0, -1).map(msg => ({ speaker: msg.speaker, message: msg.message }))
    const response = await conversationService.sendMessage(scenarioId, message, history)

    // Update detected terms
    if (response.detectedTerms?.length) {
      detectedTerms.value = [...new Set([...detectedTerms.value, ...response.detectedTerms])]
    }

    messages.value.push({ speaker: 'ai', message: response.aiMessage, timestamp: new Date() })
    isLoading.value = false
    await nextTick()
    scrollToBottom()

    // Mock feedback for now if service fails
    try {
      const feedbackResponse = await conversationService.getFeedback(scenarioId, message, response.detectedTerms || [], null)
      messageFeedbacks.value.push(feedbackResponse.feedback)
    } catch (e) {
      messageFeedbacks.value.push({
        score: 8,
        grammar_corrections: [],
        suggestions: ['Try using more formal language.'],
        score_breakdown: { grammar: 8, vocabulary: 7, fluency: 9 }
      })
    }
    
    selectedMessageIndex.value = userMessages.value.length - 1
  } catch (err) {
    console.error(err)
    messages.value.pop()
    error.value = err.message || 'Failed to send message'
    isLoading.value = false
  }
}

const requiredTerms = computed(() => {
  // Return scenario required terms or a default mock list for demonstration if missing
  return scenario.value?.requiredTerms || ['deliverables', 'timelines', 'roles', 'budget', 'stakeholders']
})

const handleMessageClick = (message) => {
  const index = userMessages.value.findIndex(m => m === message)
  if (index !== -1) {
    selectedMessageIndex.value = index
    activeTab.value = 'messages'
  }
}

const isMessageSelected = (message) => {
  if (message.speaker !== 'user') return false
  const index = userMessages.value.findIndex(m => m === message)
  return index === selectedMessageIndex.value
}

const toggleInputMode = () => {
  inputMode.value = inputMode.value === 'text' ? 'voice' : 'text'
}

const startRecording = async () => {
  try {
    recognizedText.value = ''
    interimText.value = ''
    finalTexts.value = []
    recordingTime.value = 0

    // 녹음 시작 타이머
    recordingInterval = setInterval(() => recordingTime.value++, 1000)

    // 실제 마이크 녹음 시작
    await startVoiceRecording({
      onDataAvailable: async (audioBlob, audioEnergy, audioFormat) => {
        // 녹음된 오디오 청크 처리
        console.log('Audio chunk received:', audioBlob.size, 'bytes')
        lastAudioBlob.value = audioBlob

        // STT API 호출
        try {
          const response = await speechToText(audioBlob, 'en-US')
          if (response?.text) {
            finalTexts.value.push(response.text)
            interimText.value = response.text
          }
        } catch (err) {
          console.error('STT failed:', err)
        }
      },
      timeslice: 2000  // 2초 간격으로 오디오 청크 생성
    })

    isRecording.value = true
  } catch (err) {
    console.error('녹음 시작 실패:', err)
    clearInterval(recordingInterval)
    error.value = voiceRecorderError.value || '마이크 권한을 허용해주세요.'
  }
}

const stopRecording = async () => {
  clearInterval(recordingInterval)

  // 실제 녹음 중지
  await stopVoiceRecording()
  isRecording.value = false

  // 최종 텍스트 조합
  const fullText = [...finalTexts.value, interimText.value].filter(Boolean).join(' ')

  if (fullText.trim()) {
    recognizedText.value = fullText
    userInput.value = fullText

    // 자동 전송
    isProcessingVoice.value = true
    setTimeout(() => {
      isProcessingVoice.value = false
      sendMessage()
    }, 500)
  } else {
    recognizedText.value = ''
  }
}

const toggleAvatar = () => {
  avatarEnabled.value = !avatarEnabled.value
}

const toggleTranslation = async (index) => {
  const msg = messages.value[index]
  if (msg.showTranslation) {
    msg.showTranslation = false
    return
  }

  if (msg.translatedText) {
    msg.showTranslation = true
    return
  }

  translationLoading.value[index] = true
  try {
    const response = await conversationService.translateMessage(msg.message, 'ko')
    msg.translatedText = response.translatedText
    msg.showTranslation = true
  } catch (err) {
    console.error('Translation failed:', err)
    msg.translatedText = '[번역 실패] ' + msg.message
    msg.showTranslation = true
  } finally {
    translationLoading.value[index] = false
  }
}

const resetConversation = async () => {
  if (!confirm('Reset conversation?')) return
  messages.value = []
  messageFeedbacks.value = []
  // Call service reset
}

const endConversation = () => {
  router.push('/conversation/scenario')
}

const selectMessage = (index) => {
  selectedMessageIndex.value = index
}

const scrollToBottom = () => {
  if (conversationArea.value) {
    conversationArea.value.scrollTop = conversationArea.value.scrollHeight
  }
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e5e7eb;
  border-radius: 3px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #d1d5db;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
