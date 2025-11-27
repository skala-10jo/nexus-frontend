<template>
  <aside class="w-[340px] bg-[#F2F2F7] min-h-screen flex flex-col flex-shrink-0 font-sans">
    <!-- Brand Logo -->
    <div class="p-8 pb-6 flex items-center gap-3">
      <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
           <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <span class="text-xl font-bold tracking-tight text-gray-900">Aceagency</span>
    </div>

    <!-- User Profile Section (Moved to bottom in original design, but kept here if preferred, or can move) -->
    <!-- Let's keep the menu structure but add Messages below it -->

    <!-- Navigation Menu -->
    <nav class="flex-1 px-6 overflow-y-auto space-y-1 no-scrollbar">
      <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 px-4 mt-2">MENU</h3>
      
      <!-- Dashboard -->
      <router-link
        to="/"
        class="flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
        :class="isActive('/') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'"
      >
        <div v-if="isActive('/')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
        <HomeIcon class="w-5 h-5" />
        <span class="font-medium text-[15px]">Dashboard</span>
      </router-link>

      <!-- Management -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('management')"
          class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="isActive('/management') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'"
        >
          <div v-if="isActive('/management')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <DocumentTextIcon class="w-5 h-5" />
            <span class="font-medium text-[15px]">Management</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('management') }"
          />
        </button>
        <div v-show="openMenus.has('management')" class="pl-4 space-y-1 mt-1">
          <router-link to="/management/schedule" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Schedule</router-link>
          <router-link to="/management/project" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Projects</router-link>
          <router-link to="/management/documents" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Documents</router-link>
          <router-link to="/management/glossary" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Glossary</router-link>
        </div>
      </div>

      <!-- Conversation -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('conversation')"
          class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="isActive('/conversation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'"
        >
          <div v-if="isActive('/conversation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <ChatBubbleLeftRightIcon class="w-5 h-5" />
            <span class="font-medium text-[15px]">Conversation</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('conversation') }"
          />
        </button>
        <div v-show="openMenus.has('conversation')" class="pl-4 space-y-1 mt-1">
          <router-link to="/conversation/scenario" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Scenario</router-link>
          <router-link to="/conversation/expression" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Expressions</router-link>
          <router-link to="/conversation/mistakes" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Mistakes</router-link>
        </div>
      </div>

      <!-- Translation -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('translation')"
          class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="isActive('/translation') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'"
        >
          <div v-if="isActive('/translation')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <GlobeAltIcon class="w-5 h-5" />
            <span class="font-medium text-[15px]">Translation</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('translation') }"
          />
        </button>
        <div v-show="openMenus.has('translation')" class="pl-4 space-y-1 mt-1">
          <router-link to="/translation/text" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Text</router-link>
          <router-link to="/translation/voice" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Voice</router-link>
          <router-link to="/translation/video" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Video</router-link>
        </div>
      </div>

      <!-- Collaboration -->
      <div class="space-y-1">
        <button
          @click="toggleMenu('collaboration')"
          class="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group relative overflow-hidden"
          :class="isActive('/collaboration') ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-sm'"
        >
          <div v-if="isActive('/collaboration')" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>
          <div class="flex items-center gap-4">
            <EnvelopeIcon class="w-5 h-5" />
            <span class="font-medium text-[15px]">Collaboration</span>
          </div>
          <ChevronDownIcon
            class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('collaboration') }"
          />
        </button>
        <div v-show="openMenus.has('collaboration')" class="pl-4 space-y-1 mt-1">
          <router-link to="/collaboration/mail" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Mail</router-link>
          <router-link to="/collaboration/messenger" class="block px-4 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-xl hover:bg-white/50 transition">Messenger</router-link>
        </div>
      </div>

      <!-- MESSAGES SECTION -->
      <div class="mt-8 mb-4">
        <div class="flex items-center justify-between px-4 mb-3">
           <h3 class="text-[11px] font-bold text-gray-400 uppercase tracking-wider">MESSAGES</h3>
           <div class="flex gap-2">
             <button class="text-gray-400 hover:text-gray-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
             <button class="text-gray-400 hover:text-gray-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
           </div>
        </div>

        <div class="space-y-2 bg-white rounded-[30px] p-2 shadow-sm mx-2">
           <div v-if="mailStore.loading" class="text-center py-4">
              <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
           </div>
           
           <div v-for="email in mailStore.emails" :key="email.id" 
                @click="handleEmailClick(email.id)"
                class="flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all hover:bg-gray-50 group relative"
                :class="{'bg-gray-50': mailStore.selectedEmail?.id === email.id}">
              
              <div class="relative">
                 <img :src="`https://ui-avatars.com/api/?name=${email.fromName}&background=random`" class="w-10 h-10 rounded-full ring-2 ring-white shadow-sm" />
                 <span v-if="!email.isRead" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
              </div>
              
              <div class="flex-1 min-w-0">
                 <div class="flex justify-between items-center">
                    <h4 class="font-bold text-[13px] text-gray-900 truncate">{{ email.fromName }}</h4>
                    <span v-if="!email.isRead" class="bg-gray-200 text-gray-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
                 </div>
                 <p class="text-[11px] text-gray-500 truncate">{{ email.subject }}</p>
              </div>

              <!-- Action Button (visible on hover/active) -->
              <button v-if="mailStore.selectedEmail?.id === email.id" class="absolute right-[-10px] bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
              </button>
           </div>

           <button @click="router.push('/collaboration/mail')" class="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2">
              All messages
              <ChevronDownIcon class="w-4 h-4" />
           </button>
        </div>
      </div>
    </nav>

    <!-- Bottom System Menu -->
    <div class="p-6 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-6 cursor-pointer">
         <div class="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img :src="`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=0D8ABC&color=fff`" class="w-full h-full object-cover" />
         </div>
         <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900 truncate">{{ user?.fullName || 'User' }}</p>
            <p class="text-xs text-gray-500 truncate">Product Designer</p>
         </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useMailStore } from '@/stores/mail';
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
const mailStore = useMailStore();

const user = computed(() => authStore.user);
const userInitial = computed(() => user.value?.fullName?.charAt(0).toUpperCase() || 'U');

const openMenus = ref(new Set(['collaboration'])); 

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

const handleEmailClick = (id) => {
   mailStore.selectEmail(id);
   router.push('/collaboration/mail');
};

onMounted(() => {
   mailStore.fetchEmails();
});
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
