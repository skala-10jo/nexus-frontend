<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-[520px]">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">{{ phase === 'meeting' ? 'Live Meeting' : 'AI Analysis Report' }}</span>
        <div v-if="phase === 'meeting'" class="ml-auto flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span class="text-xs text-red-500 font-medium">REC</span>
        </div>
      </div>
    </div>

    <!-- Meeting Phase -->
    <div v-if="phase === 'meeting'" class="p-6">
      <!-- Participants -->
      <div class="flex justify-center gap-6 mb-6">
        <div
          v-for="(participant, idx) in participants"
          :key="participant.name"
          class="flex flex-col items-center"
        >
          <div
            class="relative w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300"
            :class="[participant.color, currentSpeaker === idx ? 'ring-4 ring-offset-2 scale-110' : 'opacity-60']"
            :style="{ ringColor: participant.ringColor }"
          >
            {{ participant.name[0] }}
            <!-- Speaking indicator -->
            <div
              v-if="currentSpeaker === idx"
              class="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-gray-900 text-white text-[10px] rounded-full whitespace-nowrap"
            >
              Speaking...
            </div>
          </div>
          <span class="text-xs text-gray-500 mt-2">{{ participant.name }}</span>
        </div>
      </div>

      <!-- Waveform - flowing left to right -->
      <div class="relative h-16 mb-6 overflow-hidden bg-gray-50 rounded-xl">
        <div class="absolute inset-0 flex items-center">
          <div
            class="flex items-center gap-0.5 wave-flow"
            :style="{ animationPlayState: isRecording ? 'running' : 'paused' }"
          >
            <div
              v-for="i in 60"
              :key="i"
              class="w-1.5 rounded-full transition-all duration-75"
              :class="getSpeakerWaveColor()"
              :style="{ height: `${waveHeights[i - 1]}px` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Live transcription with speaker tags -->
      <div class="space-y-3 min-h-[140px]">
        <div
          v-for="(line, idx) in visibleTranscriptions"
          :key="idx"
          class="flex gap-3 animate-slide-up"
        >
          <span
            class="shrink-0 px-2 py-0.5 rounded text-xs font-medium text-white"
            :class="participants[line.speaker].tagColor"
          >
            {{ participants[line.speaker].name }}
          </span>
          <p class="text-sm text-gray-700">{{ line.text }}</p>
        </div>
      </div>
    </div>

    <!-- Report Phase -->
    <div v-else class="p-6">
      <!-- Report Header Animation -->
      <div class="text-center mb-6" :class="reportVisible ? 'animate-fade-in' : 'opacity-0'">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Analysis Complete
        </div>
        <h3 class="text-lg font-bold text-gray-900">Project Kickoff Meeting</h3>
        <p class="text-xs text-gray-500">Jan 15, 2024 | 3 Participants | 15 min</p>
      </div>

      <!-- Feedback Cards -->
      <div class="space-y-3">
        <div
          v-for="(card, idx) in feedbackCards"
          :key="idx"
          class="p-3 rounded-xl border transition-all duration-500"
          :class="[
            card.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
            card.borderColor, card.bgColor
          ]"
          :style="{ transitionDelay: `${idx * 150}ms` }"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              :class="card.avatarColor"
            >
              {{ card.name[0] }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium text-gray-900">{{ card.name }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full" :class="card.scoreColor">
                  {{ card.score }}
                </span>
              </div>
              <p class="text-xs text-gray-600">{{ card.feedback }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Section -->
      <div
        class="mt-4 p-3 bg-gray-50 rounded-xl transition-all duration-500"
        :class="summaryVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
      >
        <p class="text-xs font-medium text-gray-700 mb-2">📋 Meeting Summary</p>
        <p class="text-xs text-gray-600 leading-relaxed">{{ displayedSummary }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// State
const phase = ref('meeting') // 'meeting' or 'report'
const isRecording = ref(false)
const currentSpeaker = ref(0)
const waveHeights = ref(Array(60).fill(4))
const visibleTranscriptions = ref([])
const reportVisible = ref(false)
const summaryVisible = ref(false)
const displayedSummary = ref('')

// Participants
const participants = [
  { name: 'David', color: 'bg-blue-500', tagColor: 'bg-blue-500', ringColor: '#3b82f6' },
  { name: 'Sarah', color: 'bg-purple-500', tagColor: 'bg-purple-500', ringColor: '#a855f7' },
  { name: 'Mike', color: 'bg-amber-500', tagColor: 'bg-amber-500', ringColor: '#f59e0b' }
]

// Transcription data
const transcriptions = [
  { speaker: 0, text: "Let's review the project schedule for next week." },
  { speaker: 1, text: "Sure, the design mockups will be ready by Monday." },
  { speaker: 2, text: "Development can start from Wednesday then." },
  { speaker: 0, text: "Perfect. I'll schedule a checkpoint meeting on Friday." }
]

// Feedback cards
const feedbackCards = ref([
  {
    name: 'David',
    score: 92,
    feedback: 'Clear decision-making and excellent scheduling coordination',
    avatarColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50/50',
    scoreColor: 'bg-blue-100 text-blue-700',
    visible: false
  },
  {
    name: 'Sarah',
    score: 88,
    feedback: 'Accurate status updates and clear communication',
    avatarColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50/50',
    scoreColor: 'bg-purple-100 text-purple-700',
    visible: false
  },
  {
    name: 'Mike',
    score: 85,
    feedback: 'Active participation with constructive input',
    avatarColor: 'bg-amber-500',
    borderColor: 'border-amber-200',
    bgColor: 'bg-amber-50/50',
    scoreColor: 'bg-amber-100 text-amber-700',
    visible: false
  }
])

const fullSummary = 'Project kickoff meeting confirmed next week schedule: Design mockups by Monday, development starts Wednesday, checkpoint meeting on Friday.'

// Wave color based on current speaker
const getSpeakerWaveColor = () => {
  const colors = ['bg-blue-400', 'bg-purple-400', 'bg-amber-400']
  return colors[currentSpeaker.value]
}

// Animation intervals/timeouts
let waveInterval = null
let transcriptionTimeout = null
let speakerInterval = null
let phaseTimeout = null

const startMeetingPhase = () => {
  phase.value = 'meeting'
  isRecording.value = true
  currentSpeaker.value = 0
  visibleTranscriptions.value = []

  // Wave animation
  waveInterval = setInterval(() => {
    waveHeights.value = Array(60).fill(0).map(() => Math.random() * 40 + 8)
  }, 100)

  // Cycle through speakers
  let speakerIdx = 0
  speakerInterval = setInterval(() => {
    currentSpeaker.value = speakerIdx % 3
    speakerIdx++
  }, 2000)

  // Add transcriptions one by one
  let transIdx = 0
  const addTranscription = () => {
    if (transIdx < transcriptions.length) {
      currentSpeaker.value = transcriptions[transIdx].speaker
      visibleTranscriptions.value.push(transcriptions[transIdx])
      if (visibleTranscriptions.value.length > 3) {
        visibleTranscriptions.value.shift()
      }
      transIdx++
      transcriptionTimeout = setTimeout(addTranscription, 2000)
    } else {
      // End meeting phase
      clearInterval(waveInterval)
      clearInterval(speakerInterval)
      isRecording.value = false

      // Transition to report phase
      phaseTimeout = setTimeout(startReportPhase, 1000)
    }
  }

  transcriptionTimeout = setTimeout(addTranscription, 1500)
}

const startReportPhase = () => {
  phase.value = 'report'
  reportVisible.value = false
  summaryVisible.value = false
  displayedSummary.value = ''
  feedbackCards.value.forEach(card => card.visible = false)

  // Show report header
  setTimeout(() => {
    reportVisible.value = true
  }, 300)

  // Show feedback cards one by one
  feedbackCards.value.forEach((card, idx) => {
    setTimeout(() => {
      card.visible = true
    }, 600 + idx * 300)
  })

  // Show summary with typing effect
  setTimeout(() => {
    summaryVisible.value = true
    let charIdx = 0
    const typeSummary = setInterval(() => {
      if (charIdx < fullSummary.length) {
        displayedSummary.value = fullSummary.slice(0, charIdx + 1)
        charIdx++
      } else {
        clearInterval(typeSummary)
        // Restart cycle
        phaseTimeout = setTimeout(startMeetingPhase, 4000)
      }
    }, 30)
  }, 1800)
}

const startAnimation = () => {
  startMeetingPhase()
}

const stopAnimation = () => {
  if (waveInterval) clearInterval(waveInterval)
  if (transcriptionTimeout) clearTimeout(transcriptionTimeout)
  if (speakerInterval) clearInterval(speakerInterval)
  if (phaseTimeout) clearTimeout(phaseTimeout)
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    startAnimation()
  } else {
    stopAnimation()
  }
})

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.wave-flow {
  animation: flowLeft 3s linear infinite;
}

@keyframes flowLeft {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
