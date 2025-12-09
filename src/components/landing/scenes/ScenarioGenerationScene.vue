<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 w-[775px]">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">{{ headerTitle }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="relative h-[500px] overflow-hidden">
      <!-- Phase 1: Full Project Schedule View (like ProjectScheduleScene final state) -->
      <div
        v-if="phase === 'schedule'"
        class="absolute inset-0 bg-gray-50/50"
      >
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
                      <span class="text-xs font-bold text-gray-900 truncate block">글로벌 마케팅 캠페인</span>
                      <p class="text-[10px] text-gray-400 truncate">Nexus 플랫폼 기반 다국...</p>
                    </div>
                    <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">5</span>
                  </div>
                </div>

                <!-- Event Sub-list -->
                <div class="ml-5 pl-3 border-l border-gray-200 space-y-1">
                  <div
                    v-for="(event, index) in scheduleEvents"
                    :key="event.id"
                    :ref="el => eventItemRefs[index] = el"
                    class="text-[11px] py-1.5 px-2 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-2 transition-colors group/event"
                    :class="highlightedEventIndex === index ? 'bg-blue-50 ring-1 ring-blue-200' : ''"
                  >
                    <div
                      class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      :style="{ backgroundColor: event.color }"
                    ></div>
                    <span class="font-medium text-gray-400 w-10 flex-shrink-0 tabular-nums">{{ event.date }}</span>
                    <span class="truncate text-gray-700 font-medium flex-1">{{ event.title }}</span>
                    <!-- Practice Button -->
                    <button
                      :ref="el => { if (index === highlightedEventIndex) practiceButtonRef = el }"
                      class="px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all flex-shrink-0"
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
                    v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
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

        <!-- Magnifying Glass (Big) -->
        <Transition name="magnifier">
          <div
            v-if="showMagnifier"
            ref="magnifierRef"
            class="absolute pointer-events-none z-50"
            :style="magnifierStyle"
          >
            <div class="relative">
              <!-- Lens -->
              <div
                class="relative rounded-full border-[8px] border-amber-600 shadow-2xl overflow-hidden transition-all duration-300"
                :class="isButtonPressed ? 'w-32 h-32' : 'w-36 h-36'"
                :style="{ backgroundColor: isLensActive ? 'white' : 'transparent' }"
              >
                <!-- Transparent glass effect (before reaching button) -->
                <div
                  v-if="!isLensActive"
                  class="absolute inset-0 bg-white/10 backdrop-blur-[1px]"
                ></div>

                <!-- Magnified button inside (only when lens is active) -->
                <Transition name="fade">
                  <div
                    v-if="isLensActive"
                    class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-white"
                  >
                    <button
                      class="px-4 py-2 rounded-full font-bold transition-all duration-150"
                      :class="isButtonPressed
                        ? 'bg-blue-600 text-white scale-90 shadow-inner text-sm'
                        : 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 text-base'"
                    >
                      회화 연습
                    </button>
                  </div>
                </Transition>

                <!-- Glass shine (always visible) -->
                <div class="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none"></div>
                <div class="absolute top-3 left-4 w-8 h-3 bg-white/50 rounded-full blur-sm"></div>
              </div>
              <!-- Handle -->
              <div class="absolute -bottom-14 left-1/2 -translate-x-1/2 rotate-[40deg] origin-top">
                <div class="w-6 h-20 bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 rounded-full shadow-xl"></div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Click Ripple Effects (다중 파동) -->
        <div
          v-for="(ripple, index) in ripples"
          :key="'ripple-' + index"
          class="absolute rounded-full pointer-events-none z-40"
          :style="ripple.style"
        ></div>


        <!-- Dark Overlay for transition -->
        <div
          class="absolute inset-0 bg-black pointer-events-none transition-opacity duration-500 z-30"
          :style="{ opacity: overlayOpacity }"
        ></div>
      </div>

      <!-- Phase 2: Extracting (문서 분석) - 어두운 AI 스타일 배경 -->
      <div
        v-if="phase === 'extracting'"
        class="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 overflow-hidden"
      >
        <!-- 배경 효과: 별빛/파티클 느낌 -->
        <div class="absolute inset-0">
          <div class="absolute top-10 left-20 w-1 h-1 bg-blue-400/50 rounded-full animate-pulse"></div>
          <div class="absolute top-32 right-40 w-1.5 h-1.5 bg-purple-400/40 rounded-full animate-pulse" style="animation-delay: 0.5s"></div>
          <div class="absolute bottom-40 left-40 w-1 h-1 bg-cyan-400/50 rounded-full animate-pulse" style="animation-delay: 1s"></div>
          <div class="absolute top-48 left-1/3 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style="animation-delay: 0.3s"></div>
          <div class="absolute bottom-32 right-1/4 w-1 h-1 bg-indigo-400/40 rounded-full animate-pulse" style="animation-delay: 0.7s"></div>
        </div>
        <!-- 방사형 그라데이션 (중앙에서 퍼지는 빛) -->
        <div class="absolute inset-0 bg-gradient-radial from-indigo-900/50 via-transparent to-transparent" style="background: radial-gradient(circle at 50% 45%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);"></div>

        <!-- 하단: 폴더 스타일 문서 더미 (절반만 보이도록) -->
        <div
          v-if="showDocStack"
          class="absolute -bottom-14 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-500"
          :style="{ opacity: docStackOpacity }"
        >
          <div class="relative">
            <!-- 노란색 폴더 3개 겹침 -->
            <div class="relative w-40 h-28">
              <!-- 맨 뒤 폴더 -->
              <div class="absolute bottom-0 left-0 w-32 h-24 transform -rotate-6 -translate-x-2">
                <div class="w-full h-full bg-gradient-to-b from-amber-400 to-amber-500 rounded-lg shadow-lg border border-amber-600/30">
                  <div class="absolute top-0 left-2 w-10 h-3 bg-amber-300 rounded-t-md -translate-y-2"></div>
                </div>
              </div>
              <!-- 중간 폴더 -->
              <div class="absolute bottom-1 left-4 w-32 h-24 transform rotate-2">
                <div class="w-full h-full bg-gradient-to-b from-amber-300 to-amber-400 rounded-lg shadow-lg border border-amber-500/30">
                  <div class="absolute top-0 left-2 w-10 h-3 bg-amber-200 rounded-t-md -translate-y-2"></div>
                  <!-- 문서가 튀어나온 모습 -->
                  <div class="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-4 w-20 h-6 bg-white rounded shadow-sm border border-gray-200">
                    <div class="p-1">
                      <div class="h-1 bg-gray-300 rounded w-full mb-0.5"></div>
                      <div class="h-1 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 맨 앞 폴더 -->
              <div class="absolute bottom-2 left-8 w-32 h-24 transform rotate-6">
                <div class="w-full h-full bg-gradient-to-b from-amber-200 to-amber-300 rounded-lg shadow-xl border border-amber-400/30">
                  <div class="absolute top-0 left-2 w-10 h-3 bg-amber-100 rounded-t-md -translate-y-2"></div>
                  <!-- 문서들이 튀어나온 모습 -->
                  <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-6 w-24 h-8 bg-white rounded shadow-md border border-gray-200">
                    <div class="p-1.5">
                      <div class="h-1 bg-blue-400 rounded w-full mb-1"></div>
                      <div class="h-1 bg-gray-300 rounded w-full mb-0.5"></div>
                      <div class="h-1 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 글로우 효과 -->
            <div class="absolute -inset-6 bg-gradient-to-t from-amber-500/20 via-amber-400/10 to-transparent blur-xl"></div>
            <!-- 라벨 -->
            <div class="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-medium whitespace-nowrap">
              프로젝트 문서
            </div>
          </div>
        </div>

        <!-- 중앙: AI 분석 구체 (가운데로 조정) -->
        <div
          class="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          :style="{ opacity: sphereOpacity, transform: `translate(-50%, -50%) scale(${sphereScale})` }"
        >
          <div class="relative">
            <!-- 외부 글로우 (큰 범위) -->
            <div class="absolute -inset-16 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-3xl animate-pulse"></div>
            <!-- 외부 글로우 링 -->
            <div class="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-cyan-400/30 blur-xl"></div>
            <!-- 회전하는 링들 -->
            <div class="absolute -inset-6 rounded-full border border-blue-400/30 animate-spin-slow"></div>
            <div class="absolute -inset-10 rounded-full border border-dashed border-purple-400/20 animate-spin-reverse"></div>

            <!-- 구체 본체 -->
            <div class="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 shadow-2xl flex items-center justify-center overflow-hidden">
              <!-- 내부 빛나는 효과 -->
              <div class="absolute inset-3 rounded-full bg-gradient-to-br from-white/30 to-transparent"></div>
              <!-- AI 로봇 아이콘 -->
              <svg class="w-12 h-12 text-white/90 relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <!-- 로봇 머리 -->
                <rect x="5" y="7" width="14" height="10" rx="2" fill="currentColor"/>
                <!-- 안테나 -->
                <path d="M12 4V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
                <!-- 눈 -->
                <circle cx="9" cy="11" r="1.5" fill="#1e1b4b"/>
                <circle cx="15" cy="11" r="1.5" fill="#1e1b4b"/>
                <!-- 눈 빛 -->
                <circle cx="9" cy="11" r="0.5" fill="#22d3ee"/>
                <circle cx="15" cy="11" r="0.5" fill="#22d3ee"/>
                <!-- 입 -->
                <rect x="8" y="14" width="8" height="1.5" rx="0.5" fill="#1e1b4b"/>
              </svg>
              <!-- 흡수 효과 파티클 -->
              <div class="absolute inset-0 overflow-hidden rounded-full">
                <div class="absolute w-full h-full animate-pulse bg-gradient-to-t from-cyan-400/20 via-transparent to-transparent"></div>
              </div>
            </div>
            <!-- 분석 중 텍스트 (구체 바로 아래) -->
            <div class="absolute top-full mt-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/90 backdrop-blur-sm rounded-full border border-indigo-500/30 shadow-lg">
                <svg class="w-4 h-4 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-sm font-bold text-white">AI 분석 중...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 구체 주변 원형으로 배치된 문서들 (둥둥 떠있는 애니메이션) -->
        <div
          v-for="(doc, index) in flyingDocuments"
          :key="'doc-' + index"
          class="absolute pointer-events-none"
          :style="doc.style"
        >
          <!-- Document Card (둥둥 떠있는 효과) - 선명하게 -->
          <div
            class="bg-white rounded-xl shadow-2xl p-3.5 w-[140px] border border-gray-200 doc-card-crisp"
            :class="`animate-float-${index % 3}`"
            :style="{ boxShadow: `0 0 25px ${doc.glowColor}, 0 8px 30px rgba(0,0,0,0.15)` }"
          >
            <!-- Document Icon -->
            <div class="flex items-center justify-center mb-2.5">
              <div
                class="w-12 h-12 rounded-lg flex items-center justify-center shadow-md"
                :style="{ backgroundColor: doc.iconBg }"
              >
                <span class="text-white text-sm font-extrabold tracking-tight">{{ doc.ext }}</span>
              </div>
            </div>
            <!-- Document Name -->
            <div class="text-center px-1">
              <span class="text-xs font-bold text-gray-900 leading-tight block line-clamp-2">{{ doc.name }}</span>
            </div>
            <!-- Preview Lines -->
            <div class="mt-2.5 space-y-1">
              <div class="h-1 bg-gray-200 rounded w-full"></div>
              <div class="h-1 bg-gray-100 rounded w-2/3 mx-auto"></div>
            </div>
          </div>
        </div>

        <!-- 추출된 키워드 (문서 옆에 표시, 더 크고 잘 보이게) -->
        <div
          v-for="(keyword, index) in extractedKeywords"
          :key="'keyword-' + index"
          class="absolute text-xs font-bold whitespace-nowrap pointer-events-none px-3 py-1.5 rounded-full shadow-lg"
          :style="keyword.style"
        >
          {{ keyword.text }}
        </div>

        <!-- 데이터 파티클 (문서에서 구체로 흡수되는 효과) -->
        <div
          v-for="(particle, index) in dataParticles"
          :key="'particle-' + index"
          class="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          :style="particle.style"
        ></div>
      </div>

      <!-- Phase 3: Scenario Results - 라이트 테마 -->
      <div
        v-if="phase === 'result'"
        class="absolute inset-0 bg-gray-50 p-4 overflow-hidden"
      >
        <!-- Header -->
        <div class="relative text-center mb-3">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-200">
            <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span class="text-blue-700 font-bold text-xs">AI 시나리오 생성 완료</span>
          </div>
        </div>

        <!-- Scenario Cards - 6개 (2행 3열) -->
        <div class="relative grid grid-cols-3 gap-2.5">
          <div
            v-for="(scenario, index) in scenarios"
            :key="index"
            class="bg-white rounded-xl p-3 border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
            :class="selectedScenario === index
              ? 'border-blue-400 ring-2 ring-blue-200'
              : 'border-gray-100 hover:border-gray-200'"
            :style="getCardStyle(index)"
            @click="selectedScenario = index"
          >
            <!-- Flag & Difficulty -->
            <div class="flex items-center gap-1.5 mb-1.5">
              <span class="text-base">{{ scenario.flag }}</span>
              <span
                class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                :class="scenario.difficultyClass"
              >
                {{ scenario.difficultyLabel }}
              </span>
            </div>

            <!-- Title & Description -->
            <h4 class="text-gray-900 font-bold text-[11px] mb-0.5 leading-tight">{{ scenario.title }}</h4>
            <p class="text-gray-500 text-[9px] mb-2 leading-tight">{{ scenario.description }}</p>

            <!-- Roles Box -->
            <div class="bg-gray-50 rounded-lg p-1.5 mb-2">
              <div class="flex items-center justify-between text-[8px]">
                <div class="text-center flex-1">
                  <span class="text-gray-400 block">You</span>
                  <span class="text-gray-700 font-semibold">{{ scenario.userRole }}</span>
                </div>
                <div class="text-gray-300 px-1">vs</div>
                <div class="text-center flex-1">
                  <span class="text-gray-400 block">AI</span>
                  <span class="text-gray-700 font-semibold">{{ scenario.aiRole }}</span>
                </div>
              </div>
            </div>

            <!-- Start Button -->
            <button
              class="w-full py-1.5 bg-gray-900 text-white font-bold text-[9px] rounded-lg hover:bg-gray-800 transition-colors"
            >
              연습 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/solid'
import { FolderIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['animationComplete'])

// Refs
const containerRef = ref(null)
const practiceButtonRef = ref(null)
const magnifierRef = ref(null)
const eventItemRefs = ref([])

// Schedule Events
const scheduleEvents = [
  { id: 'e1', title: '킥오프', date: '1/2', color: '#3b82f6' },
  { id: 'e2', title: '요구사항 분석 회의', date: '1/6', color: '#22c55e' },
  { id: 'e3', title: 'UI/UX 회의', date: '1/14', color: '#f97316' },
  { id: 'e4', title: '백엔드 개발', date: '1/20', color: '#a855f7' },
  { id: 'e5', title: '시연 발표', date: '1/29', color: '#06b6d4' }
]

// Calendar Events for grid display
const calendarEvents = [
  { id: 'e1', title: '킥오프', startDate: '2025-01-02', endDate: '2025-01-04', colorClass: 'bg-blue-500 text-white', row: 0 },
  { id: 'e2', title: '요구사항 분석 회의', startDate: '2025-01-08', endDate: '2025-01-09', colorClass: 'bg-green-500 text-white', row: 0 },
  { id: 'e3', title: 'UI/UX 회의', startDate: '2025-01-14', endDate: '2025-01-17', colorClass: 'bg-orange-500 text-white', row: 0 },
  { id: 'e4', title: '백엔드 개발', startDate: '2025-01-20', endDate: '2025-01-22', colorClass: 'bg-purple-500 text-white', row: 0 },
  { id: 'e5', title: '시연 발표', startDate: '2025-01-29', endDate: '2025-01-31', colorClass: 'bg-cyan-500 text-white', row: 0 }
]

// Calendar generation
const calendarWeeks = computed(() => {
  const weeks = []
  const allDays = []

  for (let i = 29; i <= 31; i++) {
    allDays.push({ date: i, isOtherMonth: true, fullDate: `2024-12-${i}` })
  }
  for (let i = 1; i <= 31; i++) {
    allDays.push({
      date: i,
      isOtherMonth: false,
      isToday: i === 6,
      fullDate: `2025-01-${String(i).padStart(2, '0')}`
    })
  }
  for (let i = 1; i <= 1; i++) {
    allDays.push({ date: i, isOtherMonth: true, fullDate: `2025-02-0${i}` })
  }

  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return weeks
})

const getDayIndex = (dateStr) => {
  for (let weekIndex = 0; weekIndex < calendarWeeks.value.length; weekIndex++) {
    const week = calendarWeeks.value[weekIndex]
    for (let dayIndex = 0; dayIndex < week.length; dayIndex++) {
      if (week[dayIndex].fullDate === dateStr) {
        return { weekIndex, dayIndex }
      }
    }
  }
  return null
}

const getEventsForWeek = (weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  if (!week) return []

  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  return calendarEvents.filter(event => {
    return event.startDate <= weekEnd && event.endDate >= weekStart
  })
}

const getEventStyle = (event, weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  const displayStart = event.startDate < weekStart ? weekStart : event.startDate
  const displayEnd = event.endDate > weekEnd ? weekEnd : event.endDate

  const startPos = getDayIndex(displayStart)
  const endPos = getDayIndex(displayEnd)

  if (!startPos || !endPos) return { display: 'none' }

  const startDay = startPos.dayIndex
  const endDay = endPos.dayIndex
  const span = endDay - startDay + 1

  const cellWidth = 100 / 7
  const left = startDay * cellWidth + 0.3
  const width = span * cellWidth - 0.6

  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${event.row * 22}px`
  }
}

// Phase: 'schedule' | 'analyzing' | 'result'
const phase = ref('schedule')
const headerTitle = ref('프로젝트 일정')

// Schedule phase state
const highlightedEventIndex = ref(null)
const buttonHighlighted = ref(false)
const showMagnifier = ref(false)
const magnifierPosition = ref({ x: 600, y: 50 })
const isLensActive = ref(false) // 렌즈가 버튼 위에 도착했을 때 활성화
const isButtonPressed = ref(false)
const showClickEffect = ref(false)
const clickEffectPosition = ref({ x: 0, y: 0 })
const clickEffectSize = ref(50)
const overlayOpacity = ref(0)

// 다중 파동 효과
const ripples = ref([])

// Extracting phase state - 문서 더미에서 올라오고 AI 구체로 흡수
const flyingDocuments = ref([])
const sphereOpacity = ref(0)
const sphereScale = ref(0.3)
const docStackOpacity = ref(1)
const dataParticles = ref([])
const extractedKeywords = ref([])

// 하단 문서 더미 표시 상태
const showDocStack = ref(true)

// 문서 데이터 (실제 IT 프로젝트에서 쓰이는 문서들 - 한국어 포함)
const documentData = [
  { name: '스프린트_백로그.xlsx', ext: 'XLS', iconBg: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' },
  { name: 'API_명세서_v2.1.pdf', ext: 'PDF', iconBg: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
  { name: 'DB_스키마.sql', ext: 'SQL', iconBg: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)' },
  { name: 'UI_와이어프레임.fig', ext: 'FIG', iconBg: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)' },
  { name: '릴리즈_노트.md', ext: 'MD', iconBg: '#6b7280', glowColor: 'rgba(107, 114, 128, 0.5)' },
  { name: 'QA_테스트케이스.xlsx', ext: 'XLS', iconBg: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' }
]


// Result state - 6개 시나리오 카드
const scenarios = [
  {
    flag: '🇺🇸',
    difficulty: 'intermediate',
    difficultyLabel: '중급',
    difficultyClass: 'bg-amber-100 text-amber-700',
    title: '프로젝트 요구사항 협의',
    description: '베트남 파트너와 요구사항 논의',
    userRole: 'PM',
    aiRole: '파트너'
  },
  {
    flag: '🇻🇳',
    difficulty: 'beginner',
    difficultyLabel: '초급',
    difficultyClass: 'bg-emerald-100 text-emerald-700',
    title: '일정 조율 회의',
    description: '마일스톤 및 일정 조율',
    userRole: '개발자',
    aiRole: 'PM'
  },
  {
    flag: '🇺🇸',
    difficulty: 'advanced',
    difficultyLabel: '고급',
    difficultyClass: 'bg-rose-100 text-rose-700',
    title: '기술 스펙 리뷰',
    description: '상세 기술 사양 검토',
    userRole: 'Tech Lead',
    aiRole: 'Engineer'
  },
  {
    flag: '🇯🇵',
    difficulty: 'intermediate',
    difficultyLabel: '중급',
    difficultyClass: 'bg-amber-100 text-amber-700',
    title: '파트너사 미팅',
    description: '일본 파트너사와 협력 논의',
    userRole: 'BD Manager',
    aiRole: '파트너'
  },
  {
    flag: '🇨🇳',
    difficulty: 'beginner',
    difficultyLabel: '초급',
    difficultyClass: 'bg-emerald-100 text-emerald-700',
    title: '제품 데모',
    description: '신규 기능 시연 및 설명',
    userRole: '세일즈',
    aiRole: '고객'
  },
  {
    flag: '🇺🇸',
    difficulty: 'advanced',
    difficultyLabel: '고급',
    difficultyClass: 'bg-rose-100 text-rose-700',
    title: '계약 협상 회의',
    description: '글로벌 계약 조건 협상',
    userRole: 'Legal',
    aiRole: '변호사'
  }
]
const cardVisibility = ref([false, false, false, false, false, false])
const selectedScenario = ref(null)
const showStartButton = ref(false)

let timeline = null

// Computed styles
const magnifierStyle = computed(() => ({
  left: `${magnifierPosition.value.x}px`,
  top: `${magnifierPosition.value.y}px`,
  transform: 'translate(-50%, -50%)'
}))

const clickEffectStyle = computed(() => ({
  left: `${clickEffectPosition.value.x}px`,
  top: `${clickEffectPosition.value.y}px`,
  width: `${clickEffectSize.value}px`,
  height: `${clickEffectSize.value}px`,
  transform: 'translate(-50%, -50%)',
  animation: 'ping 0.6s cubic-bezier(0, 0, 0.2, 1)'
}))

const getCardStyle = (index) => ({
  opacity: cardVisibility.value[index] ? 1 : 0,
  transform: cardVisibility.value[index] ? 'translateY(0)' : 'translateY(30px)'
})

// 다중 파동 생성 함수
const createRipples = (x, y) => {
  ripples.value = []
  const colors = ['rgba(59, 130, 246, 0.6)', 'rgba(99, 102, 241, 0.5)', 'rgba(139, 92, 246, 0.4)', 'rgba(168, 85, 247, 0.3)']

  for (let i = 0; i < 4; i++) {
    const ripple = {
      style: {
        left: `${x}px`,
        top: `${y}px`,
        width: '20px',
        height: '20px',
        border: `3px solid ${colors[i]}`,
        boxShadow: `0 0 20px ${colors[i]}`,
        transform: 'translate(-50%, -50%)',
        opacity: 1
      }
    }
    ripples.value.push(ripple)

    // 각 파동 애니메이션 (순차적으로 확산)
    setTimeout(() => {
      gsap.to(ripple.style, {
        width: '300px',
        height: '300px',
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      })
    }, i * 100)
  }
}

// 문서 더미 → 원형 배치 → 키워드 → 흡수 애니메이션
const runExtractionAnimation = () => {
  const centerX = 387 // 화면 중앙
  const centerY = 200 // 구체 위치 (약간 아래로)
  const stackStartX = 387 // 하단 폴더 더미 X 위치
  const stackStartY = 450 // 하단 폴더 더미 Y 위치

  // 6개 문서 위치 (구체에 더 가깝게 조정, 카드 크기 130px 기준)
  // 위치: 좌상단, 상단, 우상단, 좌하단, 하단, 우하단
  const docPositions = [
    { x: 115, y: 70 },    // 좌상단 (구체쪽으로 이동)
    { x: 322, y: 25 },    // 상단 중앙
    { x: 530, y: 70 },    // 우상단 (구체쪽으로 이동)
    { x: 115, y: 280 },   // 좌하단 (구체쪽으로 이동)
    { x: 322, y: 335 },   // 하단 중앙
    { x: 530, y: 280 }    // 우하단 (구체쪽으로 이동)
  ]

  // 키워드 배치 위치 (문서 위치 변경에 맞춰 조정)
  // 문서 사이사이 빈 공간에 배치
  const keywordPositions = [
    { x: 235, y: 95 },    // 좌상단-상단 사이
    { x: 455, y: 95 },    // 상단-우상단 사이
    { x: 620, y: 190 },   // 우상단-우하단 사이 (오른쪽)
    { x: 455, y: 300 },   // 우하단-하단 사이
    { x: 235, y: 300 },   // 하단-좌하단 사이
    { x: 55, y: 190 }     // 좌하단-좌상단 사이 (왼쪽)
  ]

  // 초기 상태 설정
  showDocStack.value = true
  docStackOpacity.value = 1

  // 1. AI 구체 등장
  gsap.to(sphereOpacity, {
    value: 1,
    duration: 0.6,
    onUpdate: () => { sphereOpacity.value = sphereOpacity.value }
  })
  gsap.to(sphereScale, {
    value: 1,
    duration: 0.7,
    ease: 'back.out(1.5)',
    onUpdate: () => { sphereScale.value = sphereScale.value }
  })

  // 2. 문서들이 하단 더미에서 각 위치로 올라옴 (6개)
  documentData.forEach((doc, index) => {
    setTimeout(() => {
      const targetPos = docPositions[index]

      const docObj = {
        ...doc,
        style: {
          left: `${stackStartX - 57}px`, // 하단 폴더 더미에서 시작
          top: `${stackStartY}px`,
          opacity: 0,
          transform: 'scale(0.5)'
        }
      }
      flyingDocuments.value.push(docObj)
      const docIndex = flyingDocuments.value.length - 1

      // 문서가 하단 더미에서 각 위치로 이동
      gsap.to(flyingDocuments.value[docIndex].style, {
        left: `${targetPos.x}px`,
        top: `${targetPos.y}px`,
        opacity: 1,
        transform: 'scale(1)',
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          flyingDocuments.value = [...flyingDocuments.value]
        },
        onComplete: () => {
          // 문서 도착 후 키워드 추출 (파티클 + 키워드 등장)
          createParticlesFromDoc(targetPos.x + 57, targetPos.y + 45, index)
          setTimeout(() => {
            const kwPos = keywordPositions[index]
            createKeywordFromDoc(index, kwPos.x, kwPos.y)
          }, 200)
        }
      })
    }, index * 150) // 150ms 간격으로 순차 상승
  })

  // 2.5. 문서 더미 페이드아웃 (문서들이 다 올라간 후)
  setTimeout(() => {
    gsap.to(docStackOpacity, {
      value: 0,
      duration: 0.5,
      onUpdate: () => { docStackOpacity.value = docStackOpacity.value },
      onComplete: () => { showDocStack.value = false }
    })
  }, 1000)

  // 3. 모든 문서와 키워드가 AI 구체로 빨려들어감 (2.8초 후)
  setTimeout(() => {
    absorbAllToSphere(centerX, centerY)
  }, 2800)
}

// 모든 요소를 구체로 흡수
const absorbAllToSphere = (centerX, centerY) => {
  // 문서들이 구체 중심으로 빨려들어감
  flyingDocuments.value.forEach((doc, i) => {
    gsap.to(doc.style, {
      left: `${centerX - 57}px`,
      top: `${centerY - 45}px`,
      opacity: 0,
      transform: 'scale(0.1) rotate(180deg)',
      duration: 0.8,
      delay: i * 0.1,
      ease: 'power3.in',
      onUpdate: () => {
        flyingDocuments.value = [...flyingDocuments.value]
      }
    })
  })

  // 키워드들도 구체로 빨려들어감
  extractedKeywords.value.forEach((kw, i) => {
    gsap.to(kw.style, {
      left: `${centerX}px`,
      top: `${centerY}px`,
      opacity: 0,
      transform: 'scale(0.1)',
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.in',
      onUpdate: () => {
        extractedKeywords.value = [...extractedKeywords.value]
      }
    })
  })

  // 구체가 에너지를 흡수하는 효과 (스케일 펄스)
  gsap.to(sphereScale, {
    value: 1.3,
    duration: 0.4,
    delay: 0.6,
    ease: 'power2.out',
    onUpdate: () => { sphereScale.value = sphereScale.value }
  })
  gsap.to(sphereScale, {
    value: 1,
    duration: 0.3,
    delay: 1.0,
    ease: 'power2.in',
    onUpdate: () => { sphereScale.value = sphereScale.value }
  })
}

// 문서에서 파티클 생성
const createParticlesFromDoc = (docX, docY, docIndex) => {
  const colors = ['#3b82f6', '#22c55e', '#f97316', '#8b5cf6', '#06b6d4']
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const particle = {
        style: {
          left: `${docX + (Math.random() - 0.5) * 80}px`,
          top: `${docY}px`,
          backgroundColor: colors[i % colors.length],
          boxShadow: `0 0 8px ${colors[i % colors.length]}`,
          opacity: 1
        }
      }
      dataParticles.value.push(particle)
      const pIndex = dataParticles.value.length - 1

      // 파티클이 위로 퍼지면서 사라짐
      gsap.to(dataParticles.value[pIndex].style, {
        top: `${docY - 50 - Math.random() * 30}px`,
        left: `${docX + (Math.random() - 0.5) * 120}px`,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => {
          dataParticles.value = [...dataParticles.value]
        }
      })
    }, i * 40)
  }
}

// 키워드 생성 (6개 문서용 - 실제 IT 프로젝트 용어)
const createKeywordFromDoc = (docIndex, x, y) => {
  const keywords = [
    { text: 'Sprint Planning', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
    { text: 'REST API', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    { text: 'ERD', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    { text: 'Prototype', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)' },
    { text: 'Deployment', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.15)' },
    { text: 'QA Test', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' }
  ]

  if (docIndex < keywords.length) {
    const kw = keywords[docIndex]
    const keyword = {
      text: kw.text,
      style: {
        left: `${x}px`,
        top: `${y}px`,
        color: kw.color,
        backgroundColor: kw.bg,
        border: `1px solid ${kw.color}`,
        opacity: 0,
        transform: 'translateY(10px) scale(0.8)'
      }
    }
    extractedKeywords.value.push(keyword)
    const kwIndex = extractedKeywords.value.length - 1

    // 키워드 등장 애니메이션
    gsap.to(extractedKeywords.value[kwIndex].style, {
      opacity: 1,
      transform: 'translateY(0) scale(1)',
      duration: 0.3,
      ease: 'back.out(1.5)',
      onUpdate: () => {
        extractedKeywords.value = [...extractedKeywords.value]
      }
    })
  }
}

// Reset state
const resetState = () => {
  phase.value = 'schedule'
  headerTitle.value = '프로젝트 일정'
  highlightedEventIndex.value = null
  buttonHighlighted.value = false
  showMagnifier.value = false
  magnifierPosition.value = { x: 600, y: 50 }
  isLensActive.value = false
  isButtonPressed.value = false
  showClickEffect.value = false
  clickEffectSize.value = 50
  overlayOpacity.value = 0
  ripples.value = []
  // Extracting phase - 문서 더미에서 올라오고 AI 구체로 흡수
  flyingDocuments.value = []
  sphereOpacity.value = 0
  sphereScale.value = 0.3
  docStackOpacity.value = 1
  dataParticles.value = []
  extractedKeywords.value = []
  showDocStack.value = true
  // Result phase
  cardVisibility.value = [false, false, false, false, false, false]
  selectedScenario.value = null
  showStartButton.value = false
}

// Run animation
const runAnimation = () => {
  if (timeline) timeline.kill()
  resetState()

  timeline = gsap.timeline({
    defaults: { ease: 'power2.out' },
    onComplete: () => emit('animationComplete')
  })

  // Phase 1: Show schedule, then magnifier appears

  // Wait a moment, then show magnifier at top-right (transparent lens)
  timeline.add(() => {
    showMagnifier.value = true
    isLensActive.value = false // 처음엔 투명한 렌즈
  }, 0.5)

  // Move magnifier to the "요구사항 분석 회의" row's practice button
  // Target position is approximately at the practice button location
  timeline.to(magnifierPosition.value, {
    x: 195, // Near the practice button in sidebar
    y: 235,
    duration: 1.2,
    ease: 'power2.inOut'
  }, 0.8)

  // Highlight the event row
  timeline.add(() => {
    highlightedEventIndex.value = 1 // 요구사항 분석 회의
  }, 1.5)

  // Activate lens (show magnified button) - 돋보기가 버튼 위에 도착했을 때
  timeline.add(() => {
    isLensActive.value = true
  }, 2.0)

  // Highlight the button
  timeline.add(() => {
    buttonHighlighted.value = true
  }, 2.3)

  // Button press effect + 다중 파동
  timeline.add(() => {
    isButtonPressed.value = true
    // 다중 파동 생성
    createRipples(195, 235)
  }, 3.0)

  timeline.add(() => {
    isButtonPressed.value = false
  }, 3.3)

  // Fade to transition
  timeline.to(overlayOpacity, { value: 1, duration: 0.5 }, 3.5)

  // Phase 2: Extracting (문서 더미에서 올라와 흡수) - 4.0s ~ 8.0s
  timeline.add(() => {
    phase.value = 'extracting'
    headerTitle.value = 'AI 시나리오 분석'
    showMagnifier.value = false
    showClickEffect.value = false
    ripples.value = []
    // 문서 더미에서 올라와 흡수 애니메이션 시작
    runExtractionAnimation()
  }, 4.0)

  // Phase 3: Results - AI 구체 분석 완료 후 전환 (8.0s)
  timeline.add(() => {
    phase.value = 'result'
    headerTitle.value = 'AI 시나리오 생성 완료'
  }, 8.0)

  // Cards appear staggered (6개)
  timeline.add(() => { cardVisibility.value[0] = true }, 8.2)
  timeline.add(() => { cardVisibility.value[1] = true }, 8.35)
  timeline.add(() => { cardVisibility.value[2] = true }, 8.5)
  timeline.add(() => { cardVisibility.value[3] = true }, 8.65)
  timeline.add(() => { cardVisibility.value[4] = true }, 8.8)
  timeline.add(() => { cardVisibility.value[5] = true }, 8.95)

  // Auto-select first card
  timeline.add(() => { selectedScenario.value = 0 }, 9.3)

  // Show start button
  timeline.add(() => { showStartButton.value = true }, 9.5)
}

// Restart animation
const restartAnimation = () => {
  if (timeline) timeline.kill()
  resetState()
  nextTick(() => runAnimation())
}

defineExpose({ restartAnimation })

// Watch isActive
watch(() => props.isActive, (active) => {
  if (active) {
    runAnimation()
  } else {
    if (timeline) timeline.kill()
    resetState()
  }
}, { immediate: true })

onUnmounted(() => {
  if (timeline) timeline.kill()
})
</script>

<style scoped>
.magnifier-enter-active {
  animation: magnifierIn 0.5s ease-out;
}

.magnifier-leave-active {
  animation: magnifierOut 0.3s ease-in;
}

@keyframes magnifierIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.3) rotate(-20deg);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
  }
}

@keyframes magnifierOut {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
  to {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.5);
  }
}

/* Fade transition for lens content */
.fade-enter-active {
  transition: opacity 0.4s ease-out;
}
.fade-leave-active {
  transition: opacity 0.2s ease-in;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin-slow {
  animation: spin-slow 8s linear infinite;
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

.animate-spin-reverse {
  animation: spin-reverse 12s linear infinite;
}

@keyframes ping {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 둥둥 떠있는 애니메이션 (3가지 변형) */
@keyframes float-0 {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

@keyframes float-1 {
  0%, 100% { transform: translateY(0px) rotate(-1deg); }
  50% { transform: translateY(-10px) rotate(1deg); }
}

@keyframes float-2 {
  0%, 100% { transform: translateY(-3px) rotate(1deg); }
  50% { transform: translateY(-12px) rotate(-1deg); }
}

.animate-float-0 {
  animation: float-0 3s ease-in-out infinite;
}

.animate-float-1 {
  animation: float-1 3.5s ease-in-out infinite;
  animation-delay: 0.5s;
}

.animate-float-2 {
  animation: float-2 4s ease-in-out infinite;
  animation-delay: 1s;
}

/* 문서 카드 선명도 개선 */
.doc-card-crisp {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
  backface-visibility: hidden;
  image-rendering: -webkit-optimize-contrast;
}

.doc-card-crisp span {
  text-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
}

/* 2줄 말줄임 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
