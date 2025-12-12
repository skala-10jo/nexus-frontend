<script setup>
/**
 * Speaking Transcript Panel 컴포넌트
 *
 * 대화 타임라인 및 화자 필터 패널
 */
import {
  UserIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

defineProps({
  /** 화자 목록 */
  speakers: {
    type: Array,
    default: () => []
  },
  /** 필터링된 발화 목록 */
  filteredUtterances: {
    type: Array,
    default: () => []
  },
  /** 선택된 화자 ID 목록 */
  selectedSpeakers: {
    type: Array,
    default: () => []
  },
  /** 선택된 발화 */
  selectedUtterance: {
    type: Object,
    default: null
  },
  /** 편집 중인 화자 ID */
  editingSpeakerId: {
    type: [Number, String],
    default: null
  },
  /** 편집 중인 화자 라벨 */
  editingSpeakerLabel: {
    type: String,
    default: ''
  },
  /** 화자 라벨 저장 중 */
  isSavingSpeakerLabel: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'toggle-speaker-filter',
  'show-all-speakers',
  'start-edit-speaker',
  'save-speaker-label',
  'cancel-edit-speaker',
  'select-utterance',
  'update:editingSpeakerLabel'
])

// Utility Functions
function getSpeakerColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function getSpeakerBgColor(id) {
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
  return colors[(id - 1) % colors.length]
}

function formatTime(ms) {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="w-full md:w-[55%] min-w-0 flex flex-col h-full z-0">
    <div class="bg-white md:rounded-2xl border-x-0 md:border border-gray-100 shadow-none md:shadow-lg h-full overflow-hidden flex flex-col">
      <!-- Header & Speaker Filter -->
      <div class="p-4 md:p-6 border-b border-gray-100 bg-white z-10">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UserIcon class="w-5 h-5 text-gray-500" />
            대화 참여자
          </h4>
          <button
            @click="emit('show-all-speakers')"
            class="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            전체 보기
          </button>
        </div>

        <!-- Speaker Chips -->
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
                :value="editingSpeakerLabel"
                @input="emit('update:editingSpeakerLabel', $event.target.value)"
                type="text"
                class="w-24 text-sm font-medium border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
                placeholder="이름 입력"
                @keyup.enter="emit('save-speaker-label', speaker.id)"
                @keyup.esc="emit('cancel-edit-speaker')"
                autofocus
              />
              <button
                @click="emit('save-speaker-label', speaker.id)"
                :disabled="isSavingSpeakerLabel"
                class="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full transition"
                title="저장"
              >
                <CheckIcon class="w-4 h-4" />
              </button>
              <button
                @click="emit('cancel-edit-speaker')"
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
                @click="emit('toggle-speaker-filter', speaker.id)"
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
                @click.stop="emit('start-edit-speaker', speaker)"
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
      <div class="flex-1 overflow-y-auto bg-gray-50/50 p-4 space-y-4 pb-24 md:pb-4">
        <!-- Empty State -->
        <div v-if="filteredUtterances.length === 0" class="h-full flex flex-col items-center justify-center text-gray-400">
          <ChatBubbleLeftRightIcon class="w-12 h-12 mb-2 opacity-20" />
          <p class="text-sm">표시할 대화 내용이 없습니다</p>
        </div>

        <!-- Utterance Bubbles -->
        <div
          v-for="utterance in filteredUtterances"
          :key="utterance.id"
          @click="emit('select-utterance', utterance)"
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
</template>
