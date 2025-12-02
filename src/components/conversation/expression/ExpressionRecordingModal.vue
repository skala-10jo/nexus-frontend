<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-white rounded-2xl p-5 max-w-md w-full shadow-xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-base font-bold text-gray-900">Biz 표현 학습</h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
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
          @click="$emit('start-recording')"
          class="px-5 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition flex items-center gap-2 text-sm"
        >
          <MicrophoneIcon class="w-4 h-4" />
          녹음 시작
        </button>
        <button
          v-else
          @click="$emit('stop-recording')"
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
            @click="$emit('play-recording')"
            class="px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-700 transition"
          >
            <PlayIcon class="w-3 h-3" />
            재생
          </button>
          <button
            v-else
            @click="$emit('stop-playing')"
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
                @click="$emit('toggle-phoneme', idx)"
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
            @click="$emit('close')"
            class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
          >
            다시 연습
          </button>
          <button
            v-if="pronunciationResult.pronunciation_score >= 60"
            @click="$emit('mark-complete')"
            class="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            완료
          </button>
        </div>
      </div>

      <!-- Close Button (결과 없을 때) -->
      <div v-if="!pronunciationResult && !isRecording" class="flex justify-center">
        <button
          @click="$emit('close')"
          class="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  MicrophoneIcon,
  StopIcon,
  PlayIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

defineProps({
  show: {
    type: Boolean,
    required: true
  },
  referenceText: {
    type: String,
    default: ''
  },
  isRecording: {
    type: Boolean,
    default: false
  },
  recordingStatus: {
    type: String,
    default: '녹음 대기 중'
  },
  pronunciationResult: {
    type: Object,
    default: null
  },
  selectedWordIndex: {
    type: Number,
    default: null
  },
  recordedAudioUrl: {
    type: String,
    default: null
  },
  isPlayingRecording: {
    type: Boolean,
    default: false
  },
  getScoreColorClass: {
    type: Function,
    required: true
  },
  getPhonemeColorClass: {
    type: Function,
    required: true
  }
})

defineEmits([
  'close',
  'start-recording',
  'stop-recording',
  'play-recording',
  'stop-playing',
  'toggle-phoneme',
  'mark-complete'
])
</script>
