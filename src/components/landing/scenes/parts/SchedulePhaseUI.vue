<template>
  <div class="absolute inset-0 bg-gray-50/50">
    <div class="flex h-full">
      <!-- Left Sidebar: Project List -->
      <div class="w-60 bg-white border-r border-gray-100 p-4 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <span class="text-sm font-bold text-gray-900">프로젝트</span>
          <button class="p-1.5 bg-gray-900 text-white rounded-lg">
            <PlusIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Project List -->
        <div class="space-y-2 flex-1 overflow-y-auto">
          <!-- Project 1 -->
          <div class="p-3 rounded-xl bg-white/50 hover:bg-white">
            <div class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-400">
                <FolderIcon class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-gray-900 truncate block">베트남 출장 준비</span>
                <p class="text-[10px] text-gray-400 truncate">2월 베트남 파트너 미팅</p>
              </div>
            </div>
          </div>

          <!-- Project 2 (Selected) -->
          <div class="space-y-2">
            <div class="p-3 rounded-xl bg-white shadow-sm ring-1 ring-black/5 relative overflow-hidden">
              <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-l-xl"></div>
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                  <FolderIcon class="w-4 h-4" />
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-xs font-bold text-gray-900 truncate block">AI 협업 플랫폼 개발</span>
                  <p class="text-[10px] text-gray-400 truncate">Nexus 플랫폼 기반 다국어 SaaS</p>
                </div>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">5</span>
              </div>
            </div>

            <!-- Event Sub-list -->
            <div class="ml-4 pl-2 border-l border-gray-200 space-y-1">
              <div
                v-for="(event, index) in scheduleEvents"
                :key="event.id"
                :ref="el => eventItemRefs[index] = el"
                class="text-[10px] py-1 px-1.5 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1 transition-colors group/event"
                :class="highlightedEventIndex === index ? 'bg-blue-50 ring-1 ring-blue-200' : ''"
              >
                <div
                  class="w-1 h-1 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: event.color }"
                ></div>
                <span class="font-medium text-gray-400 w-6 flex-shrink-0 tabular-nums text-[9px]">{{ event.date }}</span>
                <span class="truncate text-gray-700 font-medium flex-1">{{ event.title }}</span>
                <!-- Practice Button -->
                <button
                  :ref="el => { if (index === highlightedEventIndex) $emit('practiceButtonRef', el) }"
                  class="px-1.5 py-0.5 rounded-full text-[9px] font-semibold transition-all flex-shrink-0"
                  :class="highlightedEventIndex === index && buttonHighlighted
                    ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md scale-105'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
                >
                  회화 연습
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content: Calendar -->
      <div class="flex-1 p-5 overflow-hidden">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
          <!-- Calendar Header -->
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <button class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeftIcon class="w-5 h-5 text-gray-400" />
              </button>
              <span class="text-base font-bold text-gray-900">2025년 1월</span>
              <button class="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRightIcon class="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div class="flex gap-1.5">
              <button class="px-3 py-1.5 text-xs font-bold bg-gray-900 text-white rounded-lg">월</button>
              <button class="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg">주</button>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="flex-1 px-3 py-2 overflow-hidden flex flex-col">
            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-0 mb-2">
              <div
                v-for="day in weekDays"
                :key="day"
                class="text-center text-[11px] font-bold text-gray-400 uppercase py-1"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Rows with Events -->
            <div class="relative flex-1 flex flex-col">
              <div
                v-for="(week, weekIndex) in calendarWeeks"
                :key="weekIndex"
                class="relative flex-1"
              >
                <!-- Day Cells -->
                <div class="grid grid-cols-7 gap-0 absolute inset-0">
                  <div
                    v-for="(day, dayIndex) in week"
                    :key="dayIndex"
                    class="border-t border-gray-100 p-1"
                    :class="day.isToday ? 'bg-blue-50/50' : ''"
                  >
                    <span
                      class="text-[11px] font-medium inline-block w-5 h-5 leading-5 text-center rounded-full"
                      :class="[
                        day.isToday ? 'bg-blue-500 text-white' : 'text-gray-600',
                        day.isOtherMonth ? 'text-gray-300' : ''
                      ]"
                    >
                      {{ day.date }}
                    </span>
                  </div>
                </div>

                <!-- Calendar Events -->
                <div class="absolute inset-x-0 top-8 pointer-events-none">
                  <div
                    v-for="event in getEventsForWeek(weekIndex)"
                    :key="event.id"
                    class="absolute h-6 rounded text-[10px] font-bold px-2 flex items-center whitespace-nowrap"
                    :class="event.colorClass"
                    :style="getEventStyle(event, weekIndex)"
                  >
                    {{ event.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'
import { FolderIcon } from '@heroicons/vue/24/outline'
import { weekDays } from '../../data/scheduleData'

defineProps({
  scheduleEvents: { type: Array, required: true },
  calendarWeeks: { type: Array, required: true },
  highlightedEventIndex: { type: Number, default: null },
  buttonHighlighted: { type: Boolean, default: false },
  getEventsForWeek: { type: Function, required: true },
  getEventStyle: { type: Function, required: true },
  eventItemRefs: { type: Array, default: () => [] }
})

defineEmits(['practiceButtonRef'])
</script>
