<template>
  <div ref="containerRef" class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Browser Header -->
    <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500 font-medium">프로젝트 · 일정</span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex min-h-[400px] bg-gray-50/50">
      <!-- Left Sidebar: Project List -->
      <div class="w-48 bg-white border-r border-gray-100 p-3 flex flex-col">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">Projects</span>
          <button
            ref="createBtnRef"
            class="p-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
            style="transform: scale(1);"
          >
            <PlusIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Project List -->
        <div class="space-y-1 flex-1 overflow-y-auto">
          <div
            v-for="(project, index) in visibleProjects"
            :key="project.id"
            class="space-y-1"
          >
            <!-- Project Item -->
            <div
              :ref="el => projectRefs[index] = el"
              class="p-2 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden"
              :class="selectedProjectId === project.id
                ? 'bg-white shadow-sm ring-1 ring-black/5'
                : 'bg-white/50 hover:bg-white hover:shadow-sm'"
              :style="{ opacity: 0, transform: 'translateX(-20px)' }"
            >
              <!-- Active Indicator -->
              <div
                v-if="selectedProjectId === project.id"
                class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-l-xl"
              ></div>
              <div class="flex items-center gap-2">
                <div
                  class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  :class="selectedProjectId === project.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-bold text-gray-900 truncate block">{{ project.name }}</span>
                  <p class="text-[8px] text-gray-400 truncate">{{ project.description }}</p>
                </div>
                <span
                  v-if="getProjectEventCount(project.id) > 0"
                  class="text-[8px] font-bold px-1 py-0.5 rounded-full"
                  :class="selectedProjectId === project.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'"
                >
                  {{ getProjectEventCount(project.id) }}
                </span>
              </div>
            </div>

            <!-- Project Events Sub-list -->
            <div
              v-if="selectedProjectId === project.id && getProjectEventCount(project.id) > 0"
              ref="subListRef"
              class="ml-4 pl-2 border-l border-gray-200 space-y-0.5"
              :style="{ opacity: 0 }"
            >
              <div
                v-for="event in getProjectEvents(project.id)"
                :key="event.id"
                class="text-[9px] py-1 px-1.5 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 transition-colors"
              >
                <div
                  class="w-1 h-1 rounded-full flex-shrink-0"
                  :style="{ backgroundColor: getEventColor(event.color) }"
                ></div>
                <span class="font-medium text-gray-400 w-8 flex-shrink-0 tabular-nums">
                  {{ formatEventDate(event.startDate) }}
                </span>
                <span class="truncate text-gray-600 font-medium">{{ event.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Content: Calendar -->
      <div class="flex-1 p-4 overflow-hidden">
        <div class="bg-white rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
          <!-- Calendar Header -->
          <div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <button class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeftIcon class="w-4 h-4 text-gray-400" />
              </button>
              <span class="text-sm font-bold text-gray-900">2025년 1월</span>
              <button class="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRightIcon class="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div class="flex gap-1">
              <button class="px-2 py-1 text-[10px] font-bold bg-gray-900 text-white rounded-lg">월</button>
              <button class="px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg">주</button>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="flex-1 px-2 py-1 overflow-hidden flex flex-col">
            <!-- Day Headers -->
            <div class="grid grid-cols-7 gap-0 mb-1">
              <div
                v-for="day in ['일', '월', '화', '수', '목', '금', '토']"
                :key="day"
                class="text-center text-[9px] font-bold text-gray-400 uppercase py-0.5"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Rows with Events -->
            <div class="relative flex-1 flex flex-col">
              <!-- Week Rows -->
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
                    class="border-t border-gray-100 p-0.5"
                    :class="day.isToday ? 'bg-blue-50/50' : ''"
                  >
                    <span
                      class="text-[9px] font-medium inline-block w-4 h-4 leading-4 text-center rounded-full"
                      :class="[
                        day.isToday ? 'bg-blue-500 text-white' : 'text-gray-600',
                        day.isOtherMonth ? 'text-gray-300' : ''
                      ]"
                    >
                      {{ day.date }}
                    </span>
                  </div>
                </div>

                <!-- Multi-day Events Layer -->
                <div class="absolute inset-x-0 top-6 pointer-events-auto">
                  <div
                    v-for="event in getEventsForWeek(weekIndex)"
                    :key="event.id"
                    :ref="el => { if (el) eventRefs[event.id] = el }"
                    class="absolute h-5 rounded text-[8px] font-bold px-1.5 flex items-center cursor-pointer transition-all duration-200 overflow-hidden whitespace-nowrap"
                    :class="getEventClass(event)"
                    :style="getEventStyle(event, weekIndex)"
                    @mouseenter="handleEventHover(event, true)"
                    @mouseleave="handleEventHover(event, false)"
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

    <!-- Create Project Modal -->
    <Transition name="modal">
      <div
        v-if="showModal"
        ref="modalOverlayRef"
        class="absolute inset-0 z-30 flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.3);"
      >
        <div
          ref="modalRef"
          class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
          style="transform: scale(0.9); opacity: 0;"
        >
          <!-- Modal Header -->
          <div class="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 class="text-sm font-bold text-gray-900">새 프로젝트</h3>
            <button class="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
              <XMarkIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-5 space-y-4">
            <!-- Project Name -->
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">프로젝트 이름</label>
              <div class="relative">
                <input
                  ref="projectNameInputRef"
                  type="text"
                  :value="typedProjectName"
                  readonly
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50"
                  placeholder="프로젝트 이름 입력"
                />
                <span
                  v-if="showCursor && isTypingName"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-blue-500 animate-pulse"
                ></span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">설명</label>
              <div class="relative">
                <textarea
                  ref="descriptionInputRef"
                  :value="typedDescription"
                  readonly
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none bg-gray-50"
                  placeholder="프로젝트 설명"
                ></textarea>
                <span
                  v-if="showCursor && isTypingDesc"
                  class="absolute right-3 bottom-3 w-0.5 h-4 bg-blue-500 animate-pulse"
                ></span>
              </div>
            </div>

            <!-- Related Documents -->
            <div>
              <label class="block text-xs font-bold text-gray-600 mb-1.5">관련 문서 연결</label>
              <div class="border border-gray-200 rounded-xl max-h-24 overflow-y-auto">
                <div
                  v-for="(doc, index) in documents"
                  :key="doc.id"
                  :ref="el => docCheckRefs[index] = el"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                >
                  <div class="relative w-4 h-4">
                    <input
                      type="checkbox"
                      :checked="selectedDocs.includes(doc.id)"
                      readonly
                      class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <CheckIcon
                      v-if="selectedDocs.includes(doc.id)"
                      class="absolute inset-0 w-4 h-4 text-blue-600 pointer-events-none check-icon"
                    />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">{{ doc.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2">
            <button class="px-4 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              취소
            </button>
            <button
              ref="submitBtnRef"
              class="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all"
              style="transform: scale(1);"
            >
              프로젝트 생성
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import {
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/vue/24/solid'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

// Demo Data
const initialProjects = [
  { id: 1, name: '베트남 출장 준비', description: '2월 베트남 파트너 미팅', status: 'ACTIVE' }
]

const newProject = { id: 2, name: '글로벌 마케팅 캠페인', description: 'Nexus 플랫폼 기반 다국어 콘텐츠 제작 및 현지화 프로젝트. Q1 동남아 5개국 시장 확장을 위한 마케팅 자료 번역 및 현지 파트너 협업 진행.', status: 'ACTIVE' }

const documents = [
  { id: 1, name: '요구사항_정의서_v1.2.pdf' },
  { id: 2, name: '킥오프_회의록.docx' },
  { id: 3, name: 'API_명세서_v2.0.xlsx' }
]

// Schedule Events: 1/2(1일), 1/6-7(2일), 1/14-17(4일), 1/20(1일), 1/29-31(3일)
const scheduleEvents = [
  { id: 'e1', title: '킥오프', startDate: '2025-01-02', endDate: '2025-01-02', color: 'blue', row: 0 },              // 1일 (1/2)
  { id: 'e2', title: '요구사항 분석 회의', startDate: '2025-01-06', endDate: '2025-01-07', color: 'green', row: 0 }, // 2일 (1/6-7) - 드래그 대상 → 1/8-9로 이동
  { id: 'e3', title: 'UI/UX 회의', startDate: '2025-01-14', endDate: '2025-01-17', color: 'orange', row: 0 },       // 4일 (1/14-17)
  { id: 'e4', title: '백엔드 개발', startDate: '2025-01-20', endDate: '2025-01-20', color: 'purple', row: 0 },      // 1일 (1/20)
  { id: 'e5', title: '시연 발표', startDate: '2025-01-29', endDate: '2025-01-31', color: 'cyan', row: 0 }           // 3일 (1/29-31)
]

// Refs
const containerRef = ref(null)
const createBtnRef = ref(null)
const modalOverlayRef = ref(null)
const modalRef = ref(null)
const projectNameInputRef = ref(null)
const descriptionInputRef = ref(null)
const submitBtnRef = ref(null)
const projectRefs = ref([])
const docCheckRefs = ref([])
const eventRefs = ref({})
const subListRef = ref(null)

// State
const visibleProjects = ref([...initialProjects])
const selectedProjectId = ref(null)
const showModal = ref(false)
const typedProjectName = ref('')
const typedDescription = ref('')
const selectedDocs = ref([])
const visibleEvents = ref([])
const animatedEvents = ref(new Set()) // 이미 애니메이션 완료된 이벤트 추적
const showCursor = ref(true)
const isTypingName = ref(false)
const isTypingDesc = ref(false)
const hoveredEventId = ref(null)
const draggingEventId = ref(null)
const movedEventPosition = ref(null)

let observer = null
let mainTimeline = null

// Calendar generation - weeks
const calendarWeeks = computed(() => {
  const weeks = []
  const allDays = []

  // December 2024 tail
  for (let i = 29; i <= 31; i++) {
    allDays.push({ date: i, isOtherMonth: true, fullDate: `2024-12-${i}` })
  }
  // January 2025
  for (let i = 1; i <= 31; i++) {
    allDays.push({
      date: i,
      isOtherMonth: false,
      isToday: i === 6,
      fullDate: `2025-01-${String(i).padStart(2, '0')}`
    })
  }
  // February 2025 head
  for (let i = 1; i <= 1; i++) {
    allDays.push({ date: i, isOtherMonth: true, fullDate: `2025-02-0${i}` })
  }

  // Split into weeks (7 days each)
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7))
  }

  return weeks
})

// Get day index (0-6) from date string
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

// Get events for a specific week
const getEventsForWeek = (weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  if (!week) return []

  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  return visibleEvents.value.filter(event => {
    const eventStart = movedEventPosition.value?.id === event.id
      ? movedEventPosition.value.startDate
      : event.startDate
    const eventEnd = movedEventPosition.value?.id === event.id
      ? movedEventPosition.value.endDate
      : event.endDate

    return eventStart <= weekEnd && eventEnd >= weekStart
  })
}

// Calculate event position and width
const getEventStyle = (event, weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  const eventStart = movedEventPosition.value?.id === event.id
    ? movedEventPosition.value.startDate
    : event.startDate
  const eventEnd = movedEventPosition.value?.id === event.id
    ? movedEventPosition.value.endDate
    : event.endDate

  const displayStart = eventStart < weekStart ? weekStart : eventStart
  const displayEnd = eventEnd > weekEnd ? weekEnd : eventEnd

  const startPos = getDayIndex(displayStart)
  const endPos = getDayIndex(displayEnd)

  if (!startPos || !endPos) return { display: 'none' }

  const startDay = startPos.dayIndex
  const endDay = endPos.dayIndex
  const span = endDay - startDay + 1

  const cellWidth = 100 / 7
  const left = startDay * cellWidth + 0.3
  const width = span * cellWidth - 0.6

  // 이미 애니메이션 완료된 이벤트는 opacity: 1 유지
  const isAnimated = animatedEvents.value.has(event.id)

  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${event.row * 22}px`,
    opacity: isAnimated ? 1 : 0,
    transform: isAnimated ? 'translateY(0)' : 'translateY(-20px)'
  }
}

const getWeekHeight = () => {
  // 모든 주의 높이를 동일하게 고정 (캘린더 꽉 차도록)
  return 52
}

// 프로젝트별 이벤트 개수
const getProjectEventCount = (projectId) => {
  // 새 프로젝트(id: 2)에 모든 일정 연결
  if (projectId === 2) {
    return visibleEvents.value.length
  }
  return 0
}

// 프로젝트별 이벤트 목록
const getProjectEvents = (projectId) => {
  if (projectId === 2) {
    return visibleEvents.value
  }
  return []
}

// 이벤트 색상 변환
const getEventColor = (color) => {
  const colorMap = {
    blue: '#3b82f6',
    green: '#22c55e',
    purple: '#a855f7',
    orange: '#f97316',
    cyan: '#06b6d4'
  }
  return colorMap[color] || colorMap.blue
}

// 날짜 포맷팅 (1/6 형식)
const formatEventDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const getEventClass = (event) => {
  const baseClasses = {
    blue: 'bg-blue-500 text-white',
    green: 'bg-green-500 text-white',
    purple: 'bg-purple-500 text-white',
    orange: 'bg-orange-500 text-white',
    cyan: 'bg-cyan-500 text-white'
  }

  let classes = baseClasses[event.color] || baseClasses.blue

  if (hoveredEventId.value === event.id) {
    classes += ' ring-2 ring-offset-1 ring-white/50 shadow-lg z-10'
  }

  if (draggingEventId.value === event.id) {
    classes += ' shadow-xl z-20'
  }

  return classes
}

const handleEventHover = (event, isHovering) => {
  if (isHovering) {
    hoveredEventId.value = event.id
  } else {
    hoveredEventId.value = null
  }
}

// Typing animation helper
const typeText = (targetRef, text, onComplete, scrollTarget = null) => {
  let index = 0
  const interval = setInterval(() => {
    if (index <= text.length) {
      targetRef.value = text.slice(0, index)
      index++
      // textarea 스크롤을 맨 아래로 (끝부분이 보이도록)
      if (scrollTarget && scrollTarget.value) {
        scrollTarget.value.scrollTop = scrollTarget.value.scrollHeight
      }
    } else {
      clearInterval(interval)
      if (onComplete) onComplete()
    }
  }, 40) // 35ms → 40ms로 살짝 느리게
  return interval
}

// Reset animation
const resetAnimation = () => {
  if (mainTimeline) {
    mainTimeline.kill()
    mainTimeline = null
  }

  gsap.killTweensOf('*')

  visibleProjects.value = [...initialProjects]
  selectedProjectId.value = null
  showModal.value = false
  typedProjectName.value = ''
  typedDescription.value = ''
  selectedDocs.value = []
  visibleEvents.value = []
  animatedEvents.value = new Set()
  showCursor.value = true
  isTypingName.value = false
  isTypingDesc.value = false
  hoveredEventId.value = null
  draggingEventId.value = null
  movedEventPosition.value = null
  projectRefs.value = []
  docCheckRefs.value = []
  eventRefs.value = {}
  subListRef.value = null
}

// Start animation
const startAnimation = () => {
  resetAnimation()

  mainTimeline = gsap.timeline({
    defaults: { ease: 'power2.out' }
  })

  // Phase 1: Show initial project
  mainTimeline.add(() => {
    nextTick(() => {
      const firstProject = projectRefs.value[0]
      if (firstProject) {
        gsap.to(firstProject, {
          opacity: 1,
          x: 0,
          duration: 0.5,
          ease: 'power2.out'
        })
      }
    })
  }, 0.3)

  // Phase 2: Click create button
  mainTimeline.add(() => {
    if (createBtnRef.value) {
      gsap.to(createBtnRef.value, {
        scale: 0.9,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          showModal.value = true
          nextTick(() => {
            if (modalRef.value) {
              gsap.to(modalRef.value, {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                ease: 'back.out(1.7)'
              })
            }
          })
        }
      })
    }
  }, 1)

  // Phase 3: Type project name (1.8초)
  mainTimeline.add(() => {
    isTypingName.value = true
    typeText(typedProjectName, newProject.name, () => {
      isTypingName.value = false
    })
  }, 1.8)

  // Phase 4: Type description (2.6초 - 제목 끝난 후 시작)
  // 설명 타이핑하면서 textarea 끝부분이 계속 보이도록 스크롤
  mainTimeline.add(() => {
    isTypingDesc.value = true
    typeText(typedDescription, newProject.description, () => {
      isTypingDesc.value = false
    }, descriptionInputRef) // textarea ref 전달하여 스크롤

    // 설명 타이핑 후반에 모달 스크롤 (문서 선택 영역이 보이도록)
    setTimeout(() => {
      if (modalRef.value) {
        const modalBody = modalRef.value.querySelector('.p-5.space-y-4')
        if (modalBody) {
          gsap.to(modalBody, {
            scrollTop: 80,
            duration: 0.6,
            ease: 'power2.out'
          })
        }
      }
    }, 2500) // 타이핑 후반에 스크롤
  }, 2.6)

  // Phase 5: Select documents with animation (6.5초, 간격 250ms)
  mainTimeline.add(() => {
    documents.forEach((doc, index) => {
      setTimeout(() => {
        selectedDocs.value.push(doc.id)
        const checkbox = docCheckRefs.value[index]
        if (checkbox) {
          gsap.from(checkbox.querySelector('.check-icon'), {
            scale: 0,
            rotation: -180,
            duration: 0.3,
            ease: 'back.out(2)'
          })
        }
      }, index * 250)
    })
  }, 6.5)

  // Phase 6: Click submit button (7.5초)
  mainTimeline.add(() => {
    if (submitBtnRef.value) {
      gsap.to(submitBtnRef.value, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      })
    }
  }, 7.5)

  // Phase 7: Close modal and show new project (7.8초)
  mainTimeline.add(() => {
    if (modalRef.value) {
      gsap.to(modalRef.value, {
        scale: 0.9,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          showModal.value = false

          visibleProjects.value.push(newProject)
          selectedProjectId.value = newProject.id

          nextTick(() => {
            const newProjectEl = projectRefs.value[1]
            if (newProjectEl) {
              gsap.fromTo(newProjectEl,
                { opacity: 0, x: -30, scale: 0.9 },
                {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 0.5,
                  ease: 'back.out(1.5)'
                }
              )
            }
          })
        }
      })
    }
  }, 7.8)

  // Phase 8: Events drop into calendar with bounce (staggered) (8.8초, 간격 300ms)
  mainTimeline.add(() => {
    scheduleEvents.forEach((event, index) => {
      setTimeout(() => {
        visibleEvents.value.push(event)

        nextTick(() => {
          const eventEl = eventRefs.value[event.id]
          if (eventEl) {
            gsap.fromTo(eventEl,
              { opacity: 0, y: -25, scale: 0.5 },
              {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: 'bounce.out',
                onComplete: () => {
                  // 애니메이션 완료된 이벤트 추적
                  animatedEvents.value.add(event.id)
                }
              }
            )
          }

          // 서브 목록 fade-in (이벤트가 추가될 때마다)
          if (subListRef.value) {
            gsap.to(subListRef.value, {
              opacity: 1,
              duration: 0.3,
              ease: 'power2.out'
            })
          }
        })
      }, index * 300)
    })
  }, 8.8)

  // Phase 9: Drag multi-day event - 1/6-7(e2) → 1/8-9로 이동 후 고정 (11초)
  // 더 자연스러운 드래그 애니메이션
  mainTimeline.add(() => {
    const targetEventId = 'e2' // 요구사항 분석 회의 (1/6-7, 2일짜리)
    const eventEl = eventRefs.value[targetEventId]

    if (eventEl) {
      hoveredEventId.value = targetEventId

      // 1. 마우스 올림 효과 (살짝 밝아짐)
      gsap.to(eventEl, {
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        duration: 0.2,
        ease: 'power2.out',
        onComplete: () => {
          // 2. 드래그 시작 - 살짝 들어올림
          draggingEventId.value = targetEventId
          gsap.to(eventEl, {
            scale: 1.05,
            y: -3,
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
            duration: 0.15,
            ease: 'power2.out',
            onComplete: () => {
              // 3. 부드럽게 오른쪽으로 이동 (1/6-7 → 1/8-9)
              const cellWidth = eventEl.offsetWidth / 2 // 2일짜리 이벤트
              gsap.to(eventEl, {
                x: cellWidth * 2, // 2칸 오른쪽으로
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                  // 4. 드롭 - 자연스럽게 내려놓음
                  gsap.to(eventEl, {
                    scale: 1,
                    y: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    duration: 0.25,
                    ease: 'power2.out',
                    onComplete: () => {
                      // 데이터 변경하여 새 위치에 고정
                      movedEventPosition.value = {
                        id: targetEventId,
                        startDate: '2025-01-08',
                        endDate: '2025-01-09'
                      }

                      // 새 위치에서 렌더링된 이벤트에 opacity 유지
                      nextTick(() => {
                        const newEventEl = eventRefs.value[targetEventId]
                        if (newEventEl) {
                          gsap.set(newEventEl, { opacity: 1, y: 0, x: 0 })
                        }
                      })

                      draggingEventId.value = null
                      hoveredEventId.value = null
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  }, 11)
}

// Watch for visibility
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    startAnimation()
  } else {
    resetAnimation()
  }
})

onMounted(() => {
  if (!containerRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startAnimation()
        } else {
          resetAnimation()
        }
      })
    },
    { threshold: 0.3 }
  )

  observer.observe(containerRef.value)
})

onUnmounted(() => {
  if (mainTimeline) {
    mainTimeline.kill()
  }
  gsap.killTweensOf('*')
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.check-icon {
  animation: checkPop 0.3s ease-out;
}

@keyframes checkPop {
  0% {
    transform: scale(0) rotate(-180deg);
  }
  50% {
    transform: scale(1.2) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>
