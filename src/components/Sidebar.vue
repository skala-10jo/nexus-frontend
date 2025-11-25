<template>
  <aside class="w-64 bg-orange-gradient min-h-screen text-white flex flex-col shadow-xl">
    <!-- NEXUS Brand Logo -->
    <div class="px-6 py-8 border-b border-white border-opacity-20">
      <div class="text-center">
        <h1 class="text-4xl font-black tracking-wider mb-1 bg-clip-text text-transparent bg-gradient-to-r from-white to-orange-100">
          NEXUS
        </h1>
        <p class="text-xs text-white text-opacity-70 tracking-widest font-light">COLLABORATE BEYOND LANGUAGE</p>
      </div>
    </div>

    <!-- User Profile Section -->
    <div class="px-6 py-5 border-b border-white border-opacity-20">
      <div class="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-4 hover:bg-opacity-15 transition-all duration-300">
        <div class="flex items-center space-x-4">
          <div class="relative flex-shrink-0">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-white via-orange-50 to-orange-100 flex items-center justify-center text-2xl font-bold text-orange-primary shadow-lg ring-4 ring-white ring-opacity-20">
              {{ userInitial }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-bold text-lg truncate text-white">{{ user?.fullName }}</p>
            <p class="text-sm text-white text-opacity-80 font-medium">TRANSLATOR</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 py-6 overflow-y-auto">
      <!-- Dashboard -->
      <router-link
        to="/"
        class="flex items-center px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
        :class="{ 'bg-white bg-opacity-20': isActive('/') }"
      >
        <HomeIcon class="w-5 h-5 mr-3" />
        <span class="font-medium">Dashboard</span>
      </router-link>

      <!-- Management Section -->
      <div class="mt-2">
        <button
          @click="toggleMenu('management')"
          class="w-full flex items-center justify-between px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          :class="{ 'bg-white bg-opacity-20': isActive('/management') }"
        >
          <div class="flex items-center">
            <DocumentTextIcon class="w-5 h-5 mr-3" />
            <span class="font-medium">관리</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('management') }"
          />
        </button>
        <div
          v-show="openMenus.has('management')"
          class="bg-black bg-opacity-10 transition-all duration-300"
        >
          <router-link
            to="/management/schedule"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/management/schedule') }"
          >
            일정관리
          </router-link>
          <router-link
            to="/management/project"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/management/project') }"
          >
            프로젝트 관리
          </router-link>
          <router-link
            to="/management/documents"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/management/documents') }"
          >
            문서관리
          </router-link>
          <router-link
            to="/management/glossary"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/management/glossary') }"
          >
            전문용어사전
          </router-link>
        </div>
      </div>

      <!-- Conversation Section -->
      <div class="mt-2">
        <button
          @click="toggleMenu('conversation')"
          class="w-full flex items-center justify-between px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          :class="{ 'bg-white bg-opacity-20': isActive('/conversation') }"
        >
          <div class="flex items-center">
            <ChatBubbleLeftRightIcon class="w-5 h-5 mr-3" />
            <span class="font-medium">회화</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('conversation') }"
          />
        </button>
        <div
          v-show="openMenus.has('conversation')"
          class="bg-black bg-opacity-10 transition-all duration-300"
        >
          <router-link
            to="/conversation/scenario"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/conversation/scenario') }"
          >
            시나리오 회화연습
          </router-link>
          <router-link
            to="/conversation/expression"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/conversation/expression') }"
          >
            Biz 표현 학습
          </router-link>
          <router-link
            to="/conversation/mistakes"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/conversation/mistakes') }"
          >
            오답노트
          </router-link>
        </div>
      </div>

      <!-- Translation Section -->
      <div class="mt-2">
        <button
          @click="toggleMenu('translation')"
          class="w-full flex items-center justify-between px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          :class="{ 'bg-white bg-opacity-20': isActive('/translation') }"
        >
          <div class="flex items-center">
            <GlobeAltIcon class="w-5 h-5 mr-3" />
            <span class="font-medium">번역</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('translation') }"
          />
        </button>
        <div
          v-show="openMenus.has('translation')"
          class="bg-black bg-opacity-10 transition-all duration-300"
        >
          <router-link
            to="/translation/text"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/translation/text') }"
          >
            텍스트 번역
          </router-link>
          <router-link
            to="/translation/voice"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/translation/voice') }"
          >
            음성 번역
          </router-link>
          <router-link
            to="/translation/video"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/translation/video') }"
          >
            영상 번역
          </router-link>
        </div>
      </div>

      <!-- Collaboration Section -->
      <div class="mt-2">
        <button
          @click="toggleMenu('collaboration')"
          class="w-full flex items-center justify-between px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
          :class="{ 'bg-white bg-opacity-20': isActive('/collaboration') }"
        >
          <div class="flex items-center">
            <EnvelopeIcon class="w-5 h-5 mr-3" />
            <span class="font-medium">협업</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('collaboration') }"
          />
        </button>
        <div
          v-show="openMenus.has('collaboration')"
          class="bg-black bg-opacity-10 transition-all duration-300"
        >
          <router-link
            to="/collaboration/mail"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/collaboration/mail') }"
          >
            메일
          </router-link>
          <router-link
            to="/collaboration/messenger"
            class="block px-6 py-2 pl-14 text-sm hover:bg-white hover:bg-opacity-10 transition-all duration-200"
            :class="{ 'bg-white bg-opacity-20': isActive('/collaboration/messenger') }"
          >
            메신저
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Bottom System Menu -->
    <div class="border-t border-white border-opacity-20">
      <router-link
        to="/settings"
        class="flex items-center px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
        :class="{ 'bg-white bg-opacity-20': isActive('/settings') }"
      >
        <CogIcon class="w-5 h-5 mr-3" />
        <span class="font-medium">Settings</span>
      </router-link>
      <button
        @click="handleLogout"
        class="w-full flex items-center px-6 py-3 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5 mr-3" />
        <span class="font-medium">Log Out</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CogIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);
const userInitial = computed(() => user.value?.fullName?.charAt(0).toUpperCase() || 'U');

const openMenus = ref(new Set());

const toggleMenu = (menuName) => {
  if (openMenus.value.has(menuName)) {
    openMenus.value.delete(menuName);
  } else {
    openMenus.value.add(menuName);
  }
};

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/';
  }
  return route.path.startsWith(path);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>
