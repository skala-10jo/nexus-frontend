<template>
  <div class="h-full overflow-y-auto p-8">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Biz 표현 학습</h1>

    <!-- Unit Selection -->
    <div class="mb-6 bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Unit 선택</h2>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="unit in units"
          :key="unit.unit"
          @click="selectUnit(unit.unit)"
          class="px-4 py-2 rounded-lg border transition-all duration-200"
          :class="selectedUnit === unit.unit
            ? 'bg-violet-500 text-white border-violet-500'
            : 'bg-white text-gray-700 border-gray-300 hover:border-violet-500'"
        >
          {{ unit.unit }}
          <span class="ml-2 text-sm opacity-75">({{ unit.learnedCount }}/{{ unit.totalCount }})</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
    </div>

    <!-- Expression Practice Area -->
    <div v-else-if="expressions.length > 0" class="space-y-6">
      <!-- Current Expression Card -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start mb-4">
          <div>
            <span class="text-sm text-gray-500">{{ currentExpressionIndex + 1 }} / {{ expressions.length }}</span>
            <span v-if="currentExpression.isLearned" class="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              학습 완료
            </span>
          </div>
          <div class="flex gap-2">
            <button
              @click="prevExpression"
              :disabled="currentExpressionIndex === 0"
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon class="w-5 h-5" />
            </button>
            <button
              @click="nextExpression"
              :disabled="currentExpressionIndex === expressions.length - 1"
              class="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Expression Summary (간략하게) -->
        <div class="bg-gray-50 border-l-4 border-violet-500 rounded-r-lg p-4 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-lg font-semibold text-gray-800">{{ currentExpression.expression }}</span>
              <span class="mx-2 text-gray-400">|</span>
              <span class="text-gray-600">{{ formatMeaning(currentExpression.meaning) }}</span>
            </div>
            <div class="flex gap-2">
              <button
                @click="playTTS(currentExpression.expression)"
                :disabled="ttsLoading"
                class="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                title="표현 발음 듣기"
              >
                <SpeakerWaveIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Example Sentences (메인) -->
        <div v-if="currentExpression.examples && currentExpression.examples.length > 0">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">예문 연습</h3>
          <div class="space-y-4">
            <div
              v-for="(example, idx) in currentExpression.examples"
              :key="idx"
              class="bg-gradient-to-r from-violet-50 to-violet-100 rounded-xl p-5 border border-violet-200"
            >
              <div class="mb-4">
                <p class="text-xl font-medium text-gray-800 mb-2" v-html="highlightExpression(example.text)"></p>
                <p class="text-gray-600">{{ example.translation }}</p>
              </div>
              <div class="flex gap-3">
                <button
                  @click="playTTS(example.text)"
                  :disabled="ttsLoading"
                  class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  <SpeakerWaveIcon class="w-5 h-5" />
                  발음 듣기
                </button>
                <button
                  @click="startPronunciationPractice('example', idx)"
                  :disabled="isRecording"
                  class="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition disabled:opacity-50"
                >
                  <MicrophoneIcon class="w-5 h-5" />
                  발음 연습
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mark as Learned Button -->
        <div class="mt-6 pt-6 border-t">
          <button
            @click="markAsLearned"
            :disabled="currentExpression.isLearned"
            class="w-full py-3 rounded-lg transition"
            :class="currentExpression.isLearned
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'"
          >
            {{ currentExpression.isLearned ? '이미 학습 완료됨' : '학습 완료로 표시' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="selectedUnit" class="bg-white rounded-lg shadow-md p-12 text-center">
      <p class="text-gray-500">선택한 Unit에 표현이 없습니다.</p>
    </div>

    <!-- Recording Modal -->
    <div
      v-if="showRecordingModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-xl p-6 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="text-center mb-6">
          <h3 class="text-xl font-bold text-gray-800 mb-2">발음 연습</h3>
          <p class="text-gray-600 text-sm">아래 문장을 따라 읽어보세요</p>
        </div>

        <!-- Reference Text -->
        <div class="bg-violet-50 rounded-lg p-4 mb-6">
          <p class="text-lg font-medium text-gray-800 text-center">{{ referenceText }}</p>
        </div>

        <!-- Recording Status -->
        <div class="flex flex-col items-center mb-6">
          <div
            class="w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-all duration-300"
            :class="isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'"
          >
            <MicrophoneIcon
              class="w-10 h-10"
              :class="isRecording ? 'text-red-500' : 'text-gray-400'"
            />
          </div>
          <p class="text-sm text-gray-600">
            {{ recordingStatus }}
          </p>
        </div>

        <!-- Recording Controls -->
        <div class="flex justify-center gap-4 mb-6">
          <button
            v-if="!isRecording"
            @click="startRecording"
            class="px-6 py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition flex items-center gap-2"
          >
            <MicrophoneIcon class="w-5 h-5" />
            녹음 시작
          </button>
          <button
            v-else
            @click="stopRecording"
            class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
          >
            <StopIcon class="w-5 h-5" />
            녹음 종료
          </button>
        </div>

        <!-- Pronunciation Result -->
        <div v-if="pronunciationResult" class="border-t pt-6">
          <h4 class="font-semibold text-gray-800 mb-4">평가 결과</h4>

          <!-- Overall Scores -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-blue-50 rounded-lg p-3 text-center">
              <p class="text-sm text-gray-600">종합 점수</p>
              <p class="text-2xl font-bold text-blue-600">{{ Math.round(pronunciationResult.pronunciation_score) }}</p>
            </div>
            <div class="bg-green-50 rounded-lg p-3 text-center">
              <p class="text-sm text-gray-600">정확도</p>
              <p class="text-2xl font-bold text-green-600">{{ Math.round(pronunciationResult.accuracy_score) }}</p>
            </div>
            <div class="bg-purple-50 rounded-lg p-3 text-center">
              <p class="text-sm text-gray-600">유창성</p>
              <p class="text-2xl font-bold text-purple-600">{{ Math.round(pronunciationResult.fluency_score) }}</p>
            </div>
            <div class="bg-yellow-50 rounded-lg p-3 text-center">
              <p class="text-sm text-gray-600">완성도</p>
              <p class="text-2xl font-bold text-yellow-600">{{ Math.round(pronunciationResult.completeness_score) }}</p>
            </div>
          </div>

          <!-- Prosody Score (if available) -->
          <div v-if="pronunciationResult.prosody_score" class="bg-pink-50 rounded-lg p-3 text-center mb-4">
            <p class="text-sm text-gray-600">억양/리듬</p>
            <p class="text-2xl font-bold text-pink-600">{{ Math.round(pronunciationResult.prosody_score) }}</p>
          </div>

          <!-- Word-level Results -->
          <div v-if="pronunciationResult.words && pronunciationResult.words.length > 0" class="mt-4">
            <h5 class="text-sm font-medium text-gray-700 mb-2">단어별 정확도</h5>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(word, idx) in pronunciationResult.words"
                :key="idx"
                class="relative group"
              >
                <span
                  class="px-2 py-1 rounded text-sm cursor-pointer"
                  :class="getScoreColorClass(word.accuracy_score)"
                  @click="togglePhonemeView(idx)"
                >
                  {{ word.word }}
                  <span class="text-xs ml-1 opacity-75">{{ Math.round(word.accuracy_score) }}</span>
                </span>

                <!-- Phoneme Details Popup -->
                <div
                  v-if="selectedWordIndex === idx && word.phonemes && word.phonemes.length > 0"
                  class="absolute bottom-full left-0 mb-2 bg-gray-800 text-white text-xs rounded-lg p-2 whitespace-nowrap z-10"
                >
                  <div class="flex gap-1">
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
            <p class="text-xs text-gray-500 mt-2">* 단어를 클릭하면 음소별 점수를 볼 수 있습니다</p>
          </div>

          <!-- Recognized Text -->
          <div v-if="pronunciationResult.recognized_text" class="mt-4 bg-gray-50 rounded-lg p-3">
            <p class="text-sm text-gray-600 mb-1">인식된 텍스트:</p>
            <p class="text-gray-800">{{ pronunciationResult.recognized_text }}</p>
          </div>
        </div>

        <!-- Close Button -->
        <div class="mt-6 flex justify-end">
          <button
            @click="closeRecordingModal"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            닫기
          </button>
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
  StopIcon
} from '@heroicons/vue/24/outline'

// State
const units = ref([])
const selectedUnit = ref('')
const expressions = ref([])
const currentExpressionIndex = ref(0)
const loading = ref(false)
const ttsLoading = ref(false)

// Recording State
const showRecordingModal = ref(false)
const isRecording = ref(false)
const recordingStatus = ref('녹음 대기 중')
const referenceText = ref('')
const practiceType = ref('expression')
const practiceExampleIndex = ref(0)
const pronunciationResult = ref(null)
const selectedWordIndex = ref(null)

// WebSocket & Audio
let websocket = null
let mediaRecorder = null
let audioContext = null
let audioProcessor = null

// Computed
const currentExpression = computed(() => {
  return expressions.value[currentExpressionIndex.value] || {}
})

// Methods
const fetchUnits = async () => {
  try {
    const response = await api.get('/expressions/units')
    units.value = response.data.data || []
    if (units.value.length > 0) {
      selectUnit(units.value[0].unit)
    }
  } catch (error) {
    console.error('Failed to fetch units:', error)
  }
}

const selectUnit = async (unit) => {
  selectedUnit.value = unit
  loading.value = true
  currentExpressionIndex.value = 0

  try {
    const response = await api.get('/expressions', {
      params: { unit, limit: 10 }
    })
    expressions.value = response.data.data || []
  } catch (error) {
    console.error('Failed to fetch expressions:', error)
    expressions.value = []
  } finally {
    loading.value = false
  }
}

const prevExpression = () => {
  if (currentExpressionIndex.value > 0) {
    currentExpressionIndex.value--
    pronunciationResult.value = null
  }
}

const nextExpression = () => {
  if (currentExpressionIndex.value < expressions.value.length - 1) {
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
    // Get microphone access
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    })

    // Setup WebSocket
    const wsUrl = `ws://localhost:8000/api/ai/expression/speech/assess-realtime`
    websocket = new WebSocket(wsUrl)

    websocket.onopen = () => {
      // Send initial data
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

  // Use ScriptProcessor for audio processing
  audioProcessor = audioContext.createScriptProcessor(4096, 1, 1)

  audioProcessor.onaudioprocess = (event) => {
    if (!isRecording.value || !websocket || websocket.readyState !== WebSocket.OPEN) return

    const inputBuffer = event.inputBuffer.getChannelData(0)

    // Convert Float32 to Int16
    const int16Buffer = new Int16Array(inputBuffer.length)
    for (let i = 0; i < inputBuffer.length; i++) {
      const s = Math.max(-1, Math.min(1, inputBuffer[i]))
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }

    // Send audio chunk
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
  if (websocket && websocket.readyState === WebSocket.OPEN) {
    websocket.send('END')
  }
  recordingStatus.value = '결과 처리 중...'
}

const closeRecordingModal = () => {
  if (websocket) {
    websocket.close()
    websocket = null
  }
  stopAudioCapture()
  showRecordingModal.value = false
  isRecording.value = false
}

const markAsLearned = async () => {
  if (currentExpression.value.isLearned) return

  try {
    await api.post('/expressions/learned', {
      expressionIds: [currentExpression.value.id]
    })

    // Update local state
    expressions.value[currentExpressionIndex.value].isLearned = true

    // Refresh units to update count
    fetchUnits()
  } catch (error) {
    console.error('Failed to mark as learned:', error)
    alert('학습 완료 처리에 실패했습니다.')
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

// Lifecycle
onMounted(() => {
  fetchUnits()
})

onUnmounted(() => {
  closeRecordingModal()
})
</script>
