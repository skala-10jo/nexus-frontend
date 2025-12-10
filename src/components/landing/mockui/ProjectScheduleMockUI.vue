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
          >
            <PlusIcon class="w-3.5 h-3.5" />
          </button>
        </div>

        <!-- Project List -->
        <div class="space-y-1 flex-1 overflow-y-auto">
          <div v-for="(project, index) in visibleProjects" :key="project.id" class="space-y-1">
            <!-- Project Item -->
            <div
              :ref="el => projectRefs[index] = el"
              class="p-2 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden"
              :class="selectedProjectId === project.id ? 'bg-white shadow-sm ring-1 ring-black/5' : 'bg-white/50 hover:bg-white hover:shadow-sm'"
              :style="{ opacity: 0, transform: 'translateX(-20px)' }"
            >
              <div v-if="selectedProjectId === project.id" class="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-600 rounded-l-xl"></div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  :class="selectedProjectId === project.id ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-bold text-gray-900 truncate block">{{ project.name }}</span>
                  <p class="text-[8px] text-gray-400 truncate">{{ project.description }}</p>
                </div>
                <span v-if="getProjectEventCount(project.id) > 0"
                  class="text-[8px] font-bold px-1 py-0.5 rounded-full"
                  :class="selectedProjectId === project.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'">
                  {{ getProjectEventCount(project.id) }}
                </span>
              </div>
            </div>

            <!-- Project Events Sub-list -->
            <div v-if="selectedProjectId === project.id && getProjectEventCount(project.id) > 0"
              ref="subListRef" class="ml-4 pl-2 border-l border-gray-200 space-y-0.5" :style="{ opacity: 0 }">
              <div v-for="event in getProjectEvents(project.id)" :key="event.id"
                class="text-[9px] py-1 px-1.5 rounded hover:bg-gray-50 text-gray-600 flex items-center gap-1.5 transition-colors">
                <div class="w-1 h-1 rounded-full flex-shrink-0" :style="{ backgroundColor: getEventColor(event.color) }"></div>
                <span class="font-medium text-gray-400 w-8 flex-shrink-0 tabular-nums">{{ formatEventDate(event.startDate) }}</span>
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
              <button class="p-1 hover:bg-gray-100 rounded-lg transition-colors"><ChevronLeftIcon class="w-4 h-4 text-gray-400" /></button>
              <span class="text-sm font-bold text-gray-900">2025년 1월</span>
              <button class="p-1 hover:bg-gray-100 rounded-lg transition-colors"><ChevronRightIcon class="w-4 h-4 text-gray-400" /></button>
            </div>
            <div class="flex gap-1">
              <button class="px-2 py-1 text-[10px] font-bold bg-gray-900 text-white rounded-lg">월</button>
              <button class="px-2 py-1 text-[10px] font-medium text-gray-500 hover:bg-gray-100 rounded-lg">주</button>
            </div>
          </div>

          <!-- Calendar Grid -->
          <div class="flex-1 px-2 py-1 overflow-hidden flex flex-col">
            <div class="grid grid-cols-7 gap-0 mb-1">
              <div v-for="day in weekDays" :key="day" class="text-center text-[9px] font-bold text-gray-400 uppercase py-0.5">{{ day }}</div>
            </div>

            <div class="relative flex-1 flex flex-col">
              <div v-for="(week, weekIndex) in calendarWeeks" :key="weekIndex" class="relative flex-1">
                <div class="grid grid-cols-7 gap-0 absolute inset-0">
                  <div v-for="(day, dayIndex) in week" :key="dayIndex"
                    class="border-t border-gray-100 p-0.5" :class="day.isToday ? 'bg-blue-50/50' : ''">
                    <span class="text-[9px] font-medium inline-block w-4 h-4 leading-4 text-center rounded-full"
                      :class="[day.isToday ? 'bg-blue-500 text-white' : 'text-gray-600', day.isOtherMonth ? 'text-gray-300' : '']">
                      {{ day.date }}
                    </span>
                  </div>
                </div>

                <div class="absolute inset-x-0 top-6 pointer-events-auto">
                  <div v-for="event in getEventsForWeek(weekIndex)" :key="event.id"
                    :ref="el => { if (el) eventRefs[event.id] = el }"
                    class="absolute h-5 rounded text-[8px] font-bold px-1.5 flex items-center cursor-pointer transition-all duration-200 overflow-hidden whitespace-nowrap"
                    :class="getEventClass(event)" :style="getEventStyleWithAnimation(event, weekIndex)"
                    @mouseenter="handleEventHover(event, true)" @mouseleave="handleEventHover(event, false)">
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
    <CreateProjectModal
      ref="modalComponent"
      :show="showModal"
      :typed-name="typedProjectName"
      :typed-description="typedDescription"
      :documents="documents"
      :selected-docs="selectedDocs"
      :show-cursor="showCursor"
      :is-typing-name="isTypingName"
      :is-typing-desc="isTypingDesc"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { gsap } from 'gsap'
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

import CreateProjectModal from './parts/CreateProjectModal.vue'
import { projects, events, getEventColor, weekDays } from '../data/scheduleData'
import { useCalendar } from '@/composables/landing/useCalendar'
import { useScheduleAnimation } from '@/composables/landing/useScheduleAnimation'

const props = defineProps({
  isVisible: { type: Boolean, default: false }
})

// Demo Data
const initialProjects = [{ id: 1, name: projects[0].name, description: projects[0].description, status: 'ACTIVE' }]
const newProject = { id: 2, name: projects[1].name, description: 'Nexus 플랫폼 기반 다국어 콘텐츠 제작 및 현지화 프로젝트.', status: 'ACTIVE' }
const documents = [
  { id: 1, name: '요구사항_정의서_v1.2.pdf' },
  { id: 2, name: '킥오프_회의록.docx' },
  { id: 3, name: 'API_명세서_v2.0.xlsx' }
]

const scheduleEvents = events.map(e => {
  if (e.id === 'e2') return { ...e, startDate: '2025-01-06', endDate: '2025-01-07' }
  if (e.id === 'e1') return { ...e, endDate: '2025-01-02' }
  if (e.id === 'e4') return { ...e, endDate: '2025-01-20' }
  return { ...e }
})

// Refs
const containerRef = ref(null)
const createBtnRef = ref(null)
const modalComponent = ref(null)
const projectRefs = ref([])
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
const showCursor = ref(true)
const isTypingName = ref(false)
const isTypingDesc = ref(false)

let observer = null
let mainTimeline = null

// Composables
const { calendarWeeks, getDayIndex } = useCalendar()
const {
  hoveredEventId, draggingEventId, movedEventPosition, animatedEvents,
  typeText, handleEventHover, getEventClass, animateEventDrag, animateEventDrop, resetAnimationState
} = useScheduleAnimation()

// Methods
const getEventsForWeek = (weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  if (!week) return []
  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  return visibleEvents.value.filter(event => {
    const eventStart = movedEventPosition.value?.id === event.id ? movedEventPosition.value.startDate : event.startDate
    const eventEnd = movedEventPosition.value?.id === event.id ? movedEventPosition.value.endDate : event.endDate
    return eventStart <= weekEnd && eventEnd >= weekStart
  })
}

const getEventStyleWithAnimation = (event, weekIndex) => {
  const week = calendarWeeks.value[weekIndex]
  const weekStart = week[0].fullDate
  const weekEnd = week[6].fullDate

  const eventStart = movedEventPosition.value?.id === event.id ? movedEventPosition.value.startDate : event.startDate
  const eventEnd = movedEventPosition.value?.id === event.id ? movedEventPosition.value.endDate : event.endDate

  const displayStart = eventStart < weekStart ? weekStart : eventStart
  const displayEnd = eventEnd > weekEnd ? weekEnd : eventEnd

  const startPos = getDayIndex(displayStart)
  const endPos = getDayIndex(displayEnd)
  if (!startPos || !endPos) return { display: 'none' }

  const span = endPos.dayIndex - startPos.dayIndex + 1
  const cellWidth = 100 / 7
  const left = startPos.dayIndex * cellWidth + 0.3
  const width = span * cellWidth - 0.6
  const isAnimated = animatedEvents.value.has(event.id)

  return {
    left: `${left}%`,
    width: `${width}%`,
    top: `${event.row * 22}px`,
    opacity: isAnimated ? 1 : 0,
    transform: isAnimated ? 'translateY(0)' : 'translateY(-20px)'
  }
}

const getProjectEventCount = (projectId) => projectId === 2 ? visibleEvents.value.length : 0
const getProjectEvents = (projectId) => projectId === 2 ? visibleEvents.value : []
const formatEventDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

const resetAnimation = () => {
  if (mainTimeline) { mainTimeline.kill(); mainTimeline = null }
  gsap.killTweensOf('*')

  visibleProjects.value = [...initialProjects]
  selectedProjectId.value = null
  showModal.value = false
  typedProjectName.value = ''
  typedDescription.value = ''
  selectedDocs.value = []
  visibleEvents.value = []
  showCursor.value = true
  isTypingName.value = false
  isTypingDesc.value = false
  projectRefs.value = []
  eventRefs.value = {}
  subListRef.value = null
  resetAnimationState()
}

const startAnimation = () => {
  resetAnimation()
  mainTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } })

  // Phase 1: Show initial project
  mainTimeline.add(() => {
    nextTick(() => {
      const firstProject = projectRefs.value[0]
      if (firstProject) gsap.to(firstProject, { opacity: 1, x: 0, duration: 0.5 })
    })
  }, 0.3)

  // Phase 2: Click create button
  mainTimeline.add(() => {
    if (createBtnRef.value) {
      gsap.to(createBtnRef.value, {
        scale: 0.9, duration: 0.1, yoyo: true, repeat: 1,
        onComplete: () => {
          showModal.value = true
          nextTick(() => {
            const modalRef = modalComponent.value?.modalRef
            if (modalRef) gsap.to(modalRef, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' })
          })
        }
      })
    }
  }, 1)

  // Phase 3: Type project name
  mainTimeline.add(() => {
    isTypingName.value = true
    typeText(typedProjectName, newProject.name, () => { isTypingName.value = false })
  }, 1.8)

  // Phase 4: Type description
  mainTimeline.add(() => {
    isTypingDesc.value = true
    const descInputRef = modalComponent.value?.descInputRef
    typeText(typedDescription, newProject.description, () => { isTypingDesc.value = false }, descInputRef)
  }, 2.6)

  // Phase 5: Select documents
  mainTimeline.add(() => {
    documents.forEach((doc, index) => {
      setTimeout(() => {
        selectedDocs.value.push(doc.id)
        const checkbox = modalComponent.value?.docCheckRefs[index]
        if (checkbox) {
          gsap.from(checkbox.querySelector('.check-icon'), { scale: 0, rotation: -180, duration: 0.3, ease: 'back.out(2)' })
        }
      }, index * 250)
    })
  }, 6.5)

  // Phase 6: Click submit
  mainTimeline.add(() => {
    const submitBtn = modalComponent.value?.submitBtnRef
    if (submitBtn) gsap.to(submitBtn, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 })
  }, 7.5)

  // Phase 7: Close modal and show new project
  mainTimeline.add(() => {
    const modalRef = modalComponent.value?.modalRef
    if (modalRef) {
      gsap.to(modalRef, {
        scale: 0.9, opacity: 0, duration: 0.3, ease: 'power2.in',
        onComplete: () => {
          showModal.value = false
          visibleProjects.value.push(newProject)
          selectedProjectId.value = newProject.id
          nextTick(() => {
            const newProjectEl = projectRefs.value[1]
            if (newProjectEl) gsap.fromTo(newProjectEl, { opacity: 0, x: -30, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)' })
          })
        }
      })
    }
  }, 7.8)

  // Phase 8: Events drop into calendar
  mainTimeline.add(() => {
    scheduleEvents.forEach((event, index) => {
      setTimeout(() => {
        visibleEvents.value.push(event)
        nextTick(() => {
          const eventEl = eventRefs.value[event.id]
          if (eventEl) animateEventDrop(eventEl, event.id)
          if (subListRef.value) gsap.to(subListRef.value, { opacity: 1, duration: 0.3 })
        })
      }, index * 300)
    })
  }, 8.8)

  // Phase 9: Drag event
  mainTimeline.add(() => {
    const eventEl = eventRefs.value['e2']
    if (eventEl) animateEventDrag(eventEl, 'e2', '2025-01-08', '2025-01-09', eventRefs)
  }, 11)
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) startAnimation()
  else resetAnimation()
})

onMounted(() => {
  if (!containerRef.value) return
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startAnimation()
      else resetAnimation()
    })
  }, { threshold: 0.3 })
  observer.observe(containerRef.value)
})

onUnmounted(() => {
  if (mainTimeline) mainTimeline.kill()
  gsap.killTweensOf('*')
  if (observer) observer.disconnect()
})
</script>
