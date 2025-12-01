<template>
  <div class="h-full flex flex-col bg-white relative">
    <!-- Header -->
    <div class="flex-shrink-0 px-8 py-6 border-b border-gray-100 bg-white z-10">
      <div class="flex items-center gap-4 mb-2">
        <div class="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200">
          <MicrophoneIcon class="w-6 h-6" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Voice Translation</h2>
          <p class="text-sm text-gray-500 font-medium mt-0.5">Real-time multi-speaker translation</p>
        </div>
      </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
      <!-- Left Panel: Controls -->
      <div class="w-96 border-r border-gray-100 bg-gray-50/50 flex flex-col overflow-y-auto p-6">
        
        <!-- Language Settings -->
        <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Language Settings</h3>
          
          <!-- Input Language -->
          <div class="mb-6">
            <label class="block text-sm font-bold text-gray-700 mb-2">Input Language</label>
            <div class="relative">
              <select
                v-model="inputLanguage"
                :disabled="isRecording"
                class="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 font-medium transition-colors hover:bg-white hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option v-for="lang in languageOptions" :key="lang.value" :value="lang.value">
                  {{ lang.label }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <ChevronDownIcon class="w-4 h-4" />
              </div>
            </div>
          </div>

          <!-- Output Languages -->
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Output Languages</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="lang in languageOptions"
                :key="lang.value"
                @click="toggleOutputLanguage(lang.value)"
                :disabled="lang.value === inputLanguage || isRecording"
                class="px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 border"
                :class="[
                  outputLanguages.includes(lang.value) 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  (lang.value === inputLanguage || isRecording) ? 'opacity-40 cursor-not-allowed' : ''
                ]"
              >
                {{ lang.label }}
              </button>
            </div>
            <p v-if="outputLanguages.length === 0" class="mt-2 text-xs text-amber-600 font-medium flex items-center gap-1">
              <ExclamationCircleIcon class="w-3 h-3" />
              Select at least one output language
            </p>
          </div>
        </div>

        <!-- Recording Control -->
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center flex-1 min-h-[300px]">
          
          <!-- Status Indicator -->
          <div class="mb-8 flex flex-col items-center gap-2">
            <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wide">
              <div 
                class="w-2 h-2 rounded-full transition-colors duration-300"
                :class="isConnected ? 'bg-green-500' : 'bg-gray-400'"
              ></div>
              {{ isConnected ? 'Connected' : 'Ready' }}
            </div>
            <div v-if="isRecording" class="text-2xl font-mono font-bold text-gray-900 tabular-nums">
              {{ elapsedTime }}
            </div>
          </div>

          <!-- Main Record Button -->
          <button
            @click="toggleRecording"
            :disabled="!canStartRecording && !isRecording"
            class="relative group transition-all duration-300"
          >
            <!-- Ripple Effect -->
            <div 
              v-if="isRecording"
              class="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-ping"
            ></div>
            
            <div 
              class="w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 transform group-hover:scale-105 group-active:scale-95"
              :class="isRecording 
                ? 'bg-white border-4 border-red-500 text-red-500' 
                : 'bg-black text-white hover:bg-gray-900'"
            >
              <StopIcon v-if="isRecording" class="w-10 h-10" />
              <MicrophoneIcon v-else class="w-10 h-10" />
            </div>
          </button>
          
          <p class="mt-6 text-sm font-medium text-gray-400">
            {{ isRecording ? 'Recording in progress...' : 'Click to start recording' }}
          </p>

          <!-- Visualizer Placeholder (Can be enhanced) -->
          <div v-if="isRecording" class="mt-8 w-full h-12 flex items-center justify-center gap-1">
             <div v-for="i in 5" :key="i" class="w-1 bg-red-400 rounded-full animate-pulse" :style="{ height: Math.random() * 100 + '%', animationDelay: i * 0.1 + 's' }"></div>
          </div>

          <!-- Error Message -->
          <div v-if="recorderError || wsError" class="mt-4 px-4 py-2 bg-red-50 text-red-600 text-xs rounded-lg text-center">
            {{ recorderError || wsError }}
          </div>
        </div>
      </div>

      <!-- Right Panel: Results -->
      <div class="flex-1 flex flex-col bg-white relative">
        <!-- Results Header -->
        <div class="h-14 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-50 bg-white">
          <div class="flex items-center gap-4">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Live Transcript</span>
            <div v-if="translations.length > 0" class="flex items-center gap-2">
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                {{ translations.length }} Segments
              </span>
              <span class="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                {{ uniqueSpeakerCount }} Speakers
              </span>
            </div>
          </div>
          
          <div class="flex gap-2">
            <button
              v-if="translations.length > 0"
              @click="clearTranslations"
              class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Clear All"
            >
              <TrashIcon class="w-5 h-5" />
            </button>
            <button
              v-if="translations.length > 0"
              @click="exportTranslations"
              class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Export"
            >
              <ArrowDownTrayIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Results List -->
        <div 
          ref="resultsContainer"
          class="flex-1 overflow-y-auto p-8 scroll-smooth"
        >
          <div v-if="translations.length > 0" class="max-w-3xl mx-auto">
            <TranslationResultCard
              v-for="translation in translations"
              :key="translation.id"
              v-bind="translation"
              :inputLanguage="inputLanguage"
            />
          </div>

          <!-- Empty State -->
          <div v-else class="h-full flex flex-col items-center justify-center text-gray-300">
            <div class="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <MicrophoneIcon class="w-10 h-10 text-gray-200" />
            </div>
            <p class="text-lg font-bold text-gray-400">No translations yet</p>
            <p class="text-sm text-gray-400 mt-1">Start recording to see live translations</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useVoiceRecorder } from '@/composables/useVoiceRecorder'
import { useWebSocketTranslation } from '@/composables/useWebSocketTranslation'
import TranslationResultCard from '@/components/voice/TranslationResultCard.vue'
import { 
  MicrophoneIcon, 
  StopIcon, 
  TrashIcon, 
  ArrowDownTrayIcon, 
  ChevronDownIcon,
  ExclamationCircleIcon
} from '@heroicons/vue/24/solid'

// State
const inputLanguage = ref('ko')
const outputLanguages = ref(['en', 'vi'])
const translations = ref([])
const resultsContainer = ref(null)
const startTime = ref(null)
const elapsedTime = ref('00:00')

// Options
const languageOptions = [
  { value: 'ko', label: 'Korean' },
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh', label: 'Chinese' }
]

// Composables
const {
  isRecording,
  audioLevel,
  error: recorderError,
  startRecording,
  stopRecording
} = useVoiceRecorder()

const {
  isConnected,
  lastError: wsError,
  connect,
  disconnect,
  sendInit,
  sendAudioChunk
} = useWebSocketTranslation({
  onTranslationResult: (result) => {
    translations.value.push({
      id: Date.now() + Math.random(),
      speakerId: result.speakerId,
      speakerConfidence: result.speakerConfidence,
      isNewSpeaker: result.isNewSpeaker,
      originalText: result.originalText,
      translations: result.translations,
      sttConfidence: result.sttConfidence,
      timestamp: new Date(result.timestamp)
    })

    nextTick(() => {
      if (resultsContainer.value) {
        resultsContainer.value.scrollTop = resultsContainer.value.scrollHeight
      }
    })
  }
})

// Computed
const canStartRecording = computed(() => {
  return outputLanguages.value.length > 0
})

const uniqueSpeakerCount = computed(() => {
  const speakers = new Set(translations.value.map(t => t.speakerId))
  return speakers.size
})

// Methods
const toggleOutputLanguage = (value) => {
  if (value === inputLanguage.value) return
  
  const index = outputLanguages.value.indexOf(value)
  if (index === -1) {
    outputLanguages.value.push(value)
  } else {
    outputLanguages.value.splice(index, 1)
  }
}

const toggleRecording = () => {
  if (isRecording.value) {
    handleStopRecording()
  } else {
    handleStartRecording()
  }
}

const handleStartRecording = async () => {
  try {
    await connect()
    sendInit({
      inputLanguage: inputLanguage.value,
      outputLanguages: outputLanguages.value
    })

    startTime.value = Date.now()
    updateElapsedTime()

    await startRecording({
      onDataAvailable: async (audioBlob, audioEnergy, audioFormat) => {
        try {
          await sendAudioChunk({
            audioBlob,
            audioEnergy,
            audioFormat
          })
        } catch (err) {
          console.error('Audio send failed:', err)
        }
      },
      timeslice: 2000
    })

  } catch (err) {
    console.error('Start recording failed:', err)
    alert('Could not start recording. Please check microphone permissions.')
  }
}

const handleStopRecording = async () => {
  await stopRecording()
  disconnect()
  startTime.value = null
}

const clearTranslations = () => {
  if (confirm('Clear all translations?')) {
    translations.value = []
  }
}

const exportTranslations = () => {
  const data = {
    exportTime: new Date().toISOString(),
    inputLanguage: inputLanguage.value,
    outputLanguages: outputLanguages.value,
    translations: translations.value
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voice-translation-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const updateElapsedTime = () => {
  if (!startTime.value) {
    elapsedTime.value = '00:00'
    return
  }

  const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
  const minutes = Math.floor(elapsed / 60)
  const seconds = elapsed % 60

  elapsedTime.value = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  if (isRecording.value) {
    setTimeout(updateElapsedTime, 1000)
  }
}

const handleBeforeUnload = (e) => {
  if (isRecording.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (isRecording.value) {
    handleStopRecording()
  }
})
</script>
