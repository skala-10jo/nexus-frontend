<script setup>
/**
 * Quick Actions Swiper 컴포넌트
 *
 * 대시보드 Quick Actions 스와이퍼 - 빠른 기능 접근
 */
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

import {
  DocumentTextIcon,
  LanguageIcon,
  FolderPlusIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  VideoCameraIcon
} from '@heroicons/vue/24/outline'

const modules = [Pagination]

// Quick Actions Data
const quickActions = [
  { name: 'Upload', path: '/management/documents', icon: DocumentTextIcon },
  { name: 'Translate', path: '/translation/text', icon: LanguageIcon },
  { name: 'New Project', path: '/management/project', icon: FolderPlusIcon },
  { name: 'Mail', path: '/collaboration/mail', icon: EnvelopeIcon },
  { name: 'Schedule', path: '/management/schedule', icon: CalendarIcon },
  { name: 'Scenario', path: '/conversation/scenario', icon: ChatBubbleLeftRightIcon },
  { name: 'Expression', path: '/conversation/expression', icon: BookOpenIcon },
  { name: 'Video', path: '/translation/video', icon: VideoCameraIcon },
]
</script>

<template>
  <div class="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 flex flex-col h-[270px] relative overflow-visible">
    <h3 class="font-bold text-gray-900 text-sm mb-3 shrink-0">Quick Actions</h3>

    <swiper
      :modules="modules"
      :pagination="{ clickable: true }"
      class="w-full h-full pb-6"
    >
      <!-- Slide 1: 2 Rows, 2 Columns -->
      <swiper-slide>
        <div class="grid grid-cols-2 gap-3 h-full">
          <router-link
            v-for="action in quickActions.slice(0, 4)"
            :key="action.name"
            :to="action.path"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group h-full"
          >
            <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
              <component :is="action.icon" class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold text-center leading-tight">{{ action.name }}</span>
          </router-link>
        </div>
      </swiper-slide>

      <!-- Slide 2: 2 Rows, 2 Columns -->
      <swiper-slide>
        <div class="grid grid-cols-2 gap-3 h-full">
          <router-link
            v-for="action in quickActions.slice(4, 8)"
            :key="action.name"
            :to="action.path"
            class="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group h-full"
          >
            <div class="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 group-hover:text-blue-600 group-hover:scale-110 transition-all">
              <component :is="action.icon" class="w-5 h-5" />
            </div>
            <span class="text-xs font-bold text-center leading-tight">{{ action.name }}</span>
          </router-link>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>
