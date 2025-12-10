<template>
  <!-- Feature Item 컨테이너 -->
  <div ref="sectionRef" class="py-16">
    <!-- Content Area -->
    <div
      class="flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
      :class="reverse ? 'lg:flex-row-reverse' : ''"
    >
      <!-- Mock UI -->
      <div
        class="flex-1 w-full max-w-[600px] transition-all duration-1000"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <component :is="mockUIComponent" :isVisible="isVisible" />
      </div>

      <!-- Text -->
      <div
        class="flex-1 transition-all duration-1000 delay-300 lg:self-start lg:pt-32"
        :class="isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'"
      >
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
          <component :is="iconComponent" class="w-4 h-4" />
          <span>{{ feature.subtitle }}</span>
        </div>
        <h3 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{{ feature.title }}</h3>
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">{{ feature.description }}</p>
        <router-link
          :to="feature.route"
          class="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-all duration-300 group"
        >
          <span>자세히 보기</span>
          <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue'
import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
  DocumentTextIcon,
  FilmIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  UsersIcon,
  LanguageIcon
} from '@heroicons/vue/24/outline'

// Mock UI components
import GlossaryMockUI from './mockui/GlossaryMockUI.vue'
import ProjectScheduleMockUI from './mockui/ProjectScheduleMockUI.vue'
import ScenarioMockUI from './mockui/ScenarioMockUI.vue'
import VoiceTranslationMockUI from './mockui/VoiceTranslationMockUI.vue'
import TextTranslationMockUI from './mockui/TextTranslationMockUI.vue'
import VideoTranslationMockUI from './mockui/VideoTranslationMockUI.vue'
import MailMockUI from './mockui/MailMockUI.vue'
import RealtimeMeetingMockUI from './mockui/RealtimeMeetingMockUI.vue'
import UnifiedTranslationMockUI from './mockui/UnifiedTranslationMockUI.vue'

const props = defineProps({
  feature: {
    type: Object,
    required: true
  },
  reverse: {
    type: Boolean,
    default: false
  }
})

const sectionRef = ref(null)
const isVisible = ref(false)
let observer = null

// Icon mapping
const iconMap = {
  BookOpenIcon: markRaw(BookOpenIcon),
  CalendarDaysIcon: markRaw(CalendarDaysIcon),
  ChatBubbleLeftRightIcon: markRaw(ChatBubbleLeftRightIcon),
  MicrophoneIcon: markRaw(MicrophoneIcon),
  DocumentTextIcon: markRaw(DocumentTextIcon),
  FilmIcon: markRaw(FilmIcon),
  EnvelopeIcon: markRaw(EnvelopeIcon),
  UsersIcon: markRaw(UsersIcon),
  LanguageIcon: markRaw(LanguageIcon)
}

// Mock UI mapping
const mockUIMap = {
  glossary: markRaw(GlossaryMockUI),
  'project-schedule': markRaw(ProjectScheduleMockUI),
  scenario: markRaw(ScenarioMockUI),
  'voice-translation': markRaw(VoiceTranslationMockUI),
  'text-translation': markRaw(TextTranslationMockUI),
  'video-translation': markRaw(VideoTranslationMockUI),
  mail: markRaw(MailMockUI),
  'realtime-meeting': markRaw(RealtimeMeetingMockUI),
  'unified-translation': markRaw(UnifiedTranslationMockUI)
}

const iconComponent = computed(() => iconMap[props.feature.icon] || BookOpenIcon)
const mockUIComponent = computed(() => mockUIMap[props.feature.id] || GlossaryMockUI)

onMounted(() => {
  if (!sectionRef.value) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // 뷰포트 진입/이탈 시 isVisible 업데이트
        isVisible.value = entry.isIntersecting
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  )

  observer.observe(sectionRef.value)
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>
