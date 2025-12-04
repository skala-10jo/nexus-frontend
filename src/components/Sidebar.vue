<template>
  <!-- Desktop Sidebar -->
  <aside class="bg-gray-100 min-h-screen flex-col flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex"
    :class="isCollapsed ? 'w-[80px]' : 'w-80'">
    <!-- Brand Logo -->
    <div class="p-8 pb-6 flex items-center gap-3" :class="isCollapsed ? 'justify-center p-4' : ''">
      <div
        class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span v-if="!isCollapsed" class="text-xl font-bold tracking-tight text-gray-900">NexUS</span>
      <button v-if="!isCollapsed" @click="toggleCollapse"
        class="ml-auto w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-800 hover:shadow-md transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button v-else @click="toggleCollapse"
        class="absolute top-4 left-[60px] w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-gray-800 transition-all z-10">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 overflow-y-auto space-y-1 no-scrollbar" :class="isCollapsed ? 'px-3' : 'px-6'">
      <h3 v-if="!isCollapsed" class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">MENU
      </h3>

      <!-- Dashboard -->
      <router-link to="/"
        class="flex items-center gap-4 rounded-2xl transition-all duration-200 group relative overflow-hidden" :class="[
          isActive('/') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
          isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
        ]" :title="isCollapsed ? 'Dashboard' : ''">
        <div v-if="isActive('/')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <HomeIcon class="w-5 h-5 flex-shrink-0" />
        <span v-if="!isCollapsed" class="font-medium text-[15px]">대시보드</span>
      </router-link>

      <!-- Management -->
      <div class="space-y-1">
        <button @click="toggleMenu('management')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/management') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Management' : ''">
          <div v-if="isActive('/management')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <DocumentTextIcon class="w-5 h-5 flex-shrink-0"
              :class="isActive('/management') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">관리</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('management') }" />
        </button>
        <div v-show="openMenus.has('management') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/management/schedule" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/management/schedule') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">프로젝트 · 일정</router-link>
          <router-link to="/management/glossary" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/management/glossary') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">문서 · 전문용어 사전</router-link>
        </div>
      </div>

      <!-- Conversation -->
      <div class="space-y-1">
        <button @click="toggleMenu('conversation')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/conversation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Conversation' : ''">
          <div v-if="isActive('/conversation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <ChatBubbleLeftRightIcon class="w-5 h-5 flex-shrink-0"
              :class="isActive('/conversation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">회화</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('conversation') }" />
        </button>
        <div v-show="openMenus.has('conversation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/conversation/scenario" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/scenario') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">시나리오 회화 연습</router-link>
          <router-link to="/conversation/speaking-tutor" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/speaking-tutor') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">AI 스피킹 튜터</router-link>
          <router-link to="/conversation/expression" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/expression') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">Biz 표현 학습</router-link>
          <router-link to="/conversation/mistakes" class="block px-4 py-2 text-sm rounded-xl transition" :class="isSubActive('/conversation/mistakes') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">오답노트</router-link>
        </div>
      </div>

      <!-- Translation -->
      <div class="space-y-1">
        <button @click="toggleMenu('translation')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/translation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Translation' : ''">
          <div v-if="isActive('/translation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <GlobeAltIcon class="w-5 h-5 flex-shrink-0"
              :class="isActive('/translation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">번역</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('translation') }" />
        </button>
        <div v-show="openMenus.has('translation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/translation/text" class="block px-4 py-2 text-sm rounded-xl transition"
            :class="isSubActive('/translation/text') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">텍스트</router-link>
          <router-link to="/translation/voice" class="block px-4 py-2 text-sm rounded-xl transition"
            :class="isSubActive('/translation/voice') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">음성</router-link>
          <router-link to="/translation/video" class="block px-4 py-2 text-sm rounded-xl transition"
            :class="isSubActive('/translation/video') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">영상</router-link>
        </div>
      </div>

      <!-- Collaboration -->
      <div class="space-y-1">
        <button @click="toggleMenu('collaboration')"
          class="w-full flex items-center rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="[
            isActive('/collaboration') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Collaboration' : ''">
          <div v-if="isActive('/collaboration')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <EnvelopeIcon class="w-5 h-5 flex-shrink-0"
              :class="isActive('/collaboration') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" />
            <span v-if="!isCollapsed" class="font-medium text-[15px]">협업</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('collaboration') }" />
        </button>
        <div v-show="openMenus.has('collaboration') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/collaboration/mail" class="block px-4 py-2 text-sm rounded-xl transition"
            :class="isSubActive('/collaboration/mail') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">메일</router-link>
          <router-link to="/collaboration/messenger" class="block px-4 py-2 text-sm rounded-xl transition"
            :class="isSubActive('/collaboration/messenger') ? 'text-gray-900 bg-white font-medium' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'">메신저</router-link>
        </div>
      </div>

    </nav>

    <!-- User Profile & Logout -->
    <div class="mt-auto pt-4 border-t border-gray-200/50" :class="isCollapsed ? 'px-3 pb-4' : 'px-6 pb-6'">
      <div
        class="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all"
        :class="isCollapsed ? 'justify-center' : ''"
        :title="isCollapsed ? user?.fullName || 'User' : ''"
        @click="openProfileModal"
      >
        <img
          :src="avatarUrl"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
          alt=""
        />
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <div class="text-sm font-bold text-gray-900 truncate">{{ user?.fullName || 'User' }}</div>
          <div class="text-xs text-gray-500 truncate">{{ user?.role || '역할을 설정해주세요' }}</div>
        </div>
        <button
          v-if="!isCollapsed"
          @click.stop="handleLogout"
          class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="로그아웃"
        >
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
      <!-- Collapsed logout button -->
      <button
        v-if="isCollapsed"
        @click="handleLogout"
        class="w-full mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex justify-center"
        title="로그아웃"
      >
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- User Profile Modal -->
    <UserProfileModal
      :show="showProfileModal"
      @close="closeProfileModal"
    />
  </aside>

  <!-- Mobile Bottom Navigation -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">

    <!-- Horizontal Submenu Bar -->
    <div v-if="mobileOpenMenu"
      class="absolute bottom-[calc(100%-1px)] left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">

        <!-- Management Submenu -->
        <template v-if="mobileOpenMenu === 'management'">
          <router-link to="/management/schedule"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/management/schedule') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            프로젝트•일정
          </router-link>
          <router-link to="/management/glossary"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/management/glossary') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            문서•전문용어사전
          </router-link>
        </template>

        <!-- Conversation Submenu -->
        <template v-if="mobileOpenMenu === 'conversation'">
          <router-link to="/conversation/scenario"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/conversation/scenario') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            시나리오 회화
          </router-link>
          <router-link to="/conversation/expression"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/conversation/expression') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            Biz 표현
          </router-link>
          <router-link to="/conversation/mistakes"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/conversation/mistakes') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            오답노트
          </router-link>
        </template>

        <!-- Translation Submenu -->
        <template v-if="mobileOpenMenu === 'translation'">
          <router-link to="/translation/text"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/translation/text') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            텍스트
          </router-link>
          <router-link to="/translation/voice"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/translation/voice') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            음성
          </router-link>
          <router-link to="/translation/video"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/translation/video') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            영상
          </router-link>
        </template>

        <!-- Collaboration Submenu -->
        <template v-if="mobileOpenMenu === 'collaboration'">
          <router-link to="/collaboration/mail"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/collaboration/mail') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            메일
          </router-link>
          <router-link to="/collaboration/messenger"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/collaboration/messenger') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            메신저
          </router-link>
        </template>
      </div>
    </div>

    <div class="flex justify-around items-center h-16 bg-white relative z-20">
      <!-- Dashboard -->
      <router-link to="/" class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/') ? 'text-blue-600' : 'text-gray-500'" @click="mobileOpenMenu = null">
        <HomeIcon class="w-6 h-6" />
        <span class="text-[10px] font-medium">홈</span>
      </router-link>

      <!-- Management -->
      <button @click="toggleMobileMenu('management')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/management') ? 'text-blue-600' : 'text-gray-500'">
        <DocumentTextIcon class="w-6 h-6" />
        <span class="text-[10px] font-medium">관리</span>
      </button>

      <!-- Conversation -->
      <button @click="toggleMobileMenu('conversation')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/conversation') ? 'text-blue-600' : 'text-gray-500'">
        <ChatBubbleLeftRightIcon class="w-6 h-6" />
        <span class="text-[10px] font-medium">회화</span>
      </button>

      <!-- Translation -->
      <button @click="toggleMobileMenu('translation')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/translation') ? 'text-blue-600' : 'text-gray-500'">
        <GlobeAltIcon class="w-6 h-6" />
        <span class="text-[10px] font-medium">번역</span>
      </button>

      <!-- Collaboration -->
      <button @click="toggleMobileMenu('collaboration')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/collaboration') ? 'text-blue-600' : 'text-gray-500'">
        <EnvelopeIcon class="w-6 h-6" />
        <span class="text-[10px] font-medium">협업</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import {
  HomeIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline';
import UserProfileModal from '@/components/user/UserProfileModal.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const user = computed(() => authStore.user);

// Profile Modal
const showProfileModal = ref(false);

const openProfileModal = () => {
  showProfileModal.value = true;
};

const closeProfileModal = () => {
  showProfileModal.value = false;
};

// Avatar URL computation
const avatarUrl = computed(() => {
  if (user.value?.avatarUrl) {
    // Check if it's a relative path (stored file) or external URL
    if (user.value.avatarUrl.startsWith('http')) {
      return user.value.avatarUrl;
    }
    // Construct URL for stored files
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${apiUrl}/files/serve/${user.value.avatarUrl}`;
  }
  // Default avatar using ui-avatars.com
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.fullName || 'User')}&background=0D8ABC&color=fff`;
});

// Logout handler
const handleLogout = () => {
  authStore.logout();
  router.push('/');
};

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

const mobileOpenMenu = ref(null);

const toggleMobileMenu = (menuName) => {
  if (mobileOpenMenu.value === menuName) {
    mobileOpenMenu.value = null;
  } else {
    mobileOpenMenu.value = menuName;
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
