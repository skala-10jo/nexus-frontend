<template>
  <aside
    class="bg-gray-100 min-h-screen flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out"
    :class="isCollapsed ? 'w-[80px]' : 'w-80'"
  >
    <!-- Brand Logo -->
    <div class="p-8 pb-6 flex items-center gap-3" :class="isCollapsed ? 'justify-center p-4' : ''">
      <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span v-if="!isCollapsed" class="text-xl font-bold tracking-tight text-gray-900">NexUS</span>
      <button
        v-if="!isCollapsed"
        @click="toggleCollapse"
        class="ml-auto w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-800 hover:shadow-md transition-all"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        v-else
        @click="toggleCollapse"
        class="absolute top-4 left-[60px] w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-gray-800 transition-all z-10"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- User Profile Section (Moved to bottom in original design, but kept here if preferred, or can move) -->
    <!-- Let's keep the menu structure but add Messages below it -->

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto space-y-1 no-scrollbar" :class="isCollapsed ? 'px-3' : 'px-6'">
      <h3 v-if="!isCollapsed" class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">MENU</h3>

      <!-- Dashboard -->
      <router-link
        to="/"
        class="flex items-center gap-4 rounded-2xl transition-all duration-200 group relative overflow-hidden"
        :class="[
          isActive('/') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
          isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
        ]"
        :title="isCollapsed ? 'Dashboard' : ''"
      >
        <div v-if="isActive('/')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <HomeIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed" class="font-medium text-[15px]">대시보드</span>
      </router-link>

      <!-- Management -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('management')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/management') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]"
          :title="isCollapsed ? 'Management' : ''"
        >
          <div v-if="isActive('/management')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <DocumentTextIcon class="w-5 h-5 flex-shrink-0" :class="isActive('/management') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">관리</span>
          </div>
          <ChevronDownIcon
            v-if="!isCollapsed"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('management') }"
          />
        </button>
        <div v-show="openMenus.has('management') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/management/schedule" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/management/schedule') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">프로젝트•일정</router-link>
          <router-link to="/management/glossary" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/management/glossary') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">문서•전문용어사전</router-link>
        </div>
      </div>

      <!-- Conversation -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('conversation')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/conversation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]"
          :title="isCollapsed ? 'Conversation' : ''"
        >
          <div v-if="isActive('/conversation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <ChatBubbleLeftRightIcon class="w-5 h-5 flex-shrink-0" :class="isActive('/conversation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">회화</span>
          </div>
          <ChevronDownIcon
            v-if="!isCollapsed"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('conversation') }"
          />
        </button>
        <div v-show="openMenus.has('conversation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/conversation/scenario" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/scenario') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">시나리오 회화 연습</router-link>
          <router-link to="/conversation/expression" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/expression') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">Biz 표현 학습</router-link>
          <router-link to="/conversation/mistakes" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/mistakes') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">오답노트</router-link>
        </div>
      </div>

      <!-- Translation -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('translation')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/translation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]"
          :title="isCollapsed ? 'Translation' : ''"
        >
          <div v-if="isActive('/translation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <GlobeAltIcon class="w-5 h-5 flex-shrink-0" :class="isActive('/translation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">번역</span>
          </div>
          <ChevronDownIcon
            v-if="!isCollapsed"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('translation') }"
          />
        </button>
        <div v-show="openMenus.has('translation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/translation/text" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/translation/text') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">텍스트</router-link>
          <router-link to="/translation/voice" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/translation/voice') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">음성</router-link>
          <router-link to="/translation/video" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/translation/video') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">영상</router-link>
        </div>
      </div>

      <!-- Collaboration -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('collaboration')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/collaboration') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]"
          :title="isCollapsed ? 'Collaboration' : ''"
        >
          <div v-if="isActive('/collaboration')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <EnvelopeIcon class="w-5 h-5 flex-shrink-0" :class="isActive('/collaboration') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">협업</span>
          </div>
          <ChevronDownIcon
            v-if="!isCollapsed"
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('collaboration') }"
          />
        </button>
        <div v-show="openMenus.has('collaboration') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/collaboration/mail" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/collaboration/mail') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">메일</router-link>
          <router-link to="/collaboration/messenger" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/collaboration/messenger') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">메신저</router-link>
        </div>
      </div>

    </nav>

    <!-- User Profile (Mail.vue style) -->
    <div class="mt-auto pt-4 border-t border-gray-200/50" :class="isCollapsed ? 'px-3 pb-4' : 'px-6 pb-6'">
      <div
        class="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all"
        :class="isCollapsed ? 'justify-center' : ''"
        :title="isCollapsed ? user?.fullName || 'User' : ''"
      >
        <img
          :src="`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0D8ABC&color=fff`"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
          alt=""
        />
        <div v-if="!isCollapsed">
          <div class="text-sm font-bold text-gray-900">{{ user?.fullName || 'User' }}</div>
          <div class="text-xs text-gray-500">Product Designer</div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

const route = useRoute();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

// Sidebar collapse state
const isCollapsed = ref(false);
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const openMenus = ref(new Set());

// Auto-open menu based on current route
const updateOpenMenus = () => {
  const path = route.path;
  if (path.startsWith('/management')) {
    openMenus.value.add('management');
  } else if (path.startsWith('/conversation')) {
    openMenus.value.add('conversation');
  } else if (path.startsWith('/translation')) {
    openMenus.value.add('translation');
  } else if (path.startsWith('/collaboration')) {
    openMenus.value.add('collaboration');
  }
};

// Watch for route changes
watch(() => route.path, updateOpenMenus);

// Initialize on mount
onMounted(updateOpenMenus);

const toggleMenu = (menuName) => {
  // 축소된 상태에서 클릭 시 사이드바 확장 후 메뉴 열기
  if (isCollapsed.value) {
    isCollapsed.value = false;
    openMenus.value.add(menuName);
    return;
  }

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

const isSubActive = (path) => {
  // /conversation/practice는 /conversation/scenario의 하위 페이지로 처리
  if (path === '/conversation/scenario' && route.path.startsWith('/conversation/practice')) {
    return true;
  }
  return route.path === path || route.path.startsWith(path + '/');
};

</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
