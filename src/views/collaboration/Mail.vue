<template>
  <!-- <div class="flex h-screen bg-gray-100 font-sans overflow-hidden">
    <!-- Sidebar -->
    <div class="w-80 bg-gray-100 flex flex-col p-6 border-r border-gray-200/50">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-10">
        <div class="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
          A
        </div>
        <span class="text-xl font-bold text-gray-900">Aceagency</span>
        <button class="ml-auto w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-gray-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div> -->

      <!-- Menu -->
      <div class="mb-8">
        <div class="text-xs font-bold text-gray-400 mb-4 tracking-wider">MENU</div>
        <nav class="space-y-1">
          <a
            v-for="item in menuItems"
            :key="item.name"
            href="#"
            class="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group"
            :class="item.active ? 'bg-white shadow-sm' : 'hover:bg-gray-200/50 text-gray-500'"
          >
            <div class="flex items-center gap-3">
              <!-- Icons (Mock) -->
              <span class="w-5 h-5 flex items-center justify-center">
                 <svg v-if="item.icon === 'briefcase'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                 <svg v-if="item.icon === 'clipboard'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                 <svg v-if="item.icon === 'tag'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                 <svg v-if="item.icon === 'academic-cap'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
                 <svg v-if="item.icon === 'shield-check'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                 <svg v-if="item.icon === 'lightning-bolt'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </span>
              <span class="font-medium" :class="item.active ? 'text-gray-900' : ''">{{ item.name }}</span>
            </div>
            <span v-if="item.count" class="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs rounded-full font-bold">
              {{ item.count }}
            </span>
          </a>
        </nav>
      </div>

      <!-- Messages -->
      <div class="flex-1 flex flex-col min-h-0">
        <div class="flex justify-between items-center mb-4 px-1">
          <div class="text-xs font-bold text-gray-400 tracking-wider">MESSAGES</div>
          <div class="flex gap-1">
            <button class="text-gray-400 hover:text-gray-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg></button>
            <button class="text-gray-400 hover:text-gray-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg></button>
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-lg p-2 flex-1 flex flex-col mb-6 relative overflow-hidden">
          <div class="flex-1 overflow-y-auto space-y-1 p-2">
            <div v-for="user in messageUsers" :key="user.name" class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl cursor-pointer group">
              <div class="flex items-center gap-3">
                <img :src="user.avatar" class="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="">
                <span class="text-sm font-medium text-gray-800 group-hover:text-black">{{ user.name }}</span>
              </div>
              <span v-if="user.count" class="w-5 h-5 flex items-center justify-center bg-gray-200 text-gray-600 text-xs rounded-full font-bold">
                {{ user.count }}
              </span>
            </div>
          </div>
          
          <!-- All messages button -->
          <div class="p-2 mt-auto relative z-10">
             <button class="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-md shadow-blue-200">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
               All messages
             </button>
          </div>
          
          <!-- Gradient overlay for scroll -->
          <div class="absolute bottom-[70px] left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
        </div>
      </div>

      <!-- User Profile -->
      <div class="mt-auto pt-4 border-t border-gray-200/50">
        <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all">
          <img :src="currentUser.avatar" class="w-10 h-10 rounded-full object-cover" alt="">
          <div>
            <div class="text-sm font-bold text-gray-900">{{ currentUser.name }}</div>
            <div class="text-xs text-gray-500">{{ currentUser.role }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 bg-white m-4 rounded-[2.5rem] shadow-sm overflow-hidden relative">
      <!-- Top Bar -->
      <div class="absolute top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-between px-8 border-b border-gray-100">
        <div class="flex items-center gap-4">
           <h2 class="text-2xl font-bold text-gray-800">Inbox</h2>
           <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{{ emails.length }}</span>
        </div>
        
        <div class="flex items-center gap-4">
           <!-- Search -->
           <div class="relative">
             <input type="text" placeholder="Search..." class="bg-gray-100 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64">
             <svg class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
           </div>
           
           <!-- Actions -->
           <button @click="syncMails" class="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Sync">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
           <button @click="openComposeModal" class="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
             Compose
           </button>
        </div>
      </div>

      <!-- Content -->
      <div class="h-full overflow-y-auto pt-20 px-8 pb-8">
         <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
         </div>
         
         <div v-else-if="emails.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400">
            <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            <p>{{ authStatus.isConnected ? 'No mails found' : 'Please connect Outlook' }}</p>
            <button v-if="!authStatus.isConnected" @click="connectOutlook" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition">Connect Outlook</button>
         </div>

         <div v-else class="space-y-2">
            <div v-for="email in emails" :key="email.id" @click="openEmail(email.id)" class="group bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md rounded-2xl p-4 cursor-pointer transition-all duration-200 flex items-center gap-4">
               <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                  {{ email.fromName ? email.fromName[0].toUpperCase() : '?' }}
               </div>
               <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-start">
                     <h3 class="font-bold text-gray-900 truncate pr-4" :class="{'text-blue-600': !email.isRead}">{{ email.subject || '(No Subject)' }}</h3>
                     <span class="text-xs text-gray-400 whitespace-nowrap">{{ formatDate(email.receivedDateTime) }}</span>
                  </div>
                  <p class="text-sm text-gray-500 truncate mt-1">{{ email.bodyPreview }}</p>
               </div>
               <div v-if="!email.isRead" class="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
            </div>
         </div>
      </div>
    </div>

    <!-- Modals (Keep existing functionality but maybe restyle later if needed) -->
    <!-- Mail Detail Modal -->
    <div v-if="selectedEmail" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closeEmail">
       <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col m-4">
          <div class="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
             <div>
                <h2 class="text-xl font-bold text-gray-900 mb-2">{{ selectedEmail.subject }}</h2>
                <div class="flex items-center gap-2 text-sm text-gray-600">
                   <span class="font-medium">{{ selectedEmail.fromName }}</span>
                   <span class="text-gray-400">&lt;{{ selectedEmail.fromAddress }}&gt;</span>
                </div>
             </div>
             <button @click="closeEmail" class="p-2 hover:bg-gray-100 rounded-full transition"><svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="flex-1 overflow-y-auto p-8 bg-white">
             <div v-if="isHtmlContent(selectedEmail)" v-html="selectedEmail.body" class="prose max-w-none"></div>
             <div v-else class="whitespace-pre-wrap text-gray-800">{{ selectedEmail.body }}</div>
          </div>
       </div>
    </div>

    <!-- Compose Modal -->
    <div v-if="showComposeModal" class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closeComposeModal">
       <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl m-4 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
             <h2 class="text-xl font-bold text-gray-900">New Message</h2>
             <button @click="closeComposeModal" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="p-6 space-y-4">
             <input v-model="newEmail.to" type="text" placeholder="To" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 transition">
             <input v-model="newEmail.subject" type="text" placeholder="Subject" class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 transition">
             <textarea v-model="newEmail.body" rows="8" placeholder="Write your message..." class="w-full px-4 py-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 transition resize-none"></textarea>
          </div>
          <div class="p-6 border-t border-gray-100 flex justify-end gap-3">
             <button @click="closeComposeModal" class="px-6 py-2 text-gray-500 hover:bg-gray-100 rounded-full transition">Cancel</button>
             <button @click="sendNewEmail" class="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition shadow-lg shadow-gray-200">Send</button>
          </div>
       </div>
    </div>

    <!-- Chat Panel (Floating Button) -->
    <button v-if="!showChatPanel" @click="showChatPanel = true" class="fixed bottom-8 right-8 w-14 h-14 bg-black text-white rounded-full shadow-xl hover:scale-105 transition flex items-center justify-center z-40">
       <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    </button>

    <!-- Chat Panel -->
    <transition name="slide-left">
       <div v-if="showChatPanel" class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl flex flex-col z-50 border-l border-gray-100">
          <div class="p-4 border-b border-gray-100 flex justify-between items-center">
             <h3 class="font-bold text-gray-900">AI Assistant</h3>
             <button @click="showChatPanel = false" class="text-gray-400 hover:text-gray-600"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
             <div v-for="(msg, idx) in chatMessages" :key="idx" class="flex" :class="msg.role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] rounded-2xl px-4 py-3 text-sm" :class="msg.role === 'user' ? 'bg-black text-white' : 'bg-white shadow-sm text-gray-800'">
                   {{ msg.content }}
                </div>
             </div>
          </div>
          <div class="p-4 border-t border-gray-100 bg-white">
             <div class="relative">
                <input v-model="chatInput" @keyup.enter="sendChatMessage" type="text" placeholder="Ask AI..." class="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-xl border-none focus:ring-2 focus:ring-gray-200 transition text-sm">
                <button @click="sendChatMessage" class="absolute right-2 top-2 p-1 bg-black text-white rounded-lg hover:bg-gray-800 transition"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg></button>
             </div>
          </div>
       </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'

// 상태
const authStatus = ref({ isConnected: false, outlookEmail: null })
const emails = ref([])
const projects = ref([])
const selectedEmail = ref(null)
const selectedProjectId = ref(null)
const loading = ref(false)
const syncing = ref(false)
const embedding = ref(false)
const searchQuery = ref('')
const currentFolder = ref('Inbox')
const currentProjectId = ref(null)
const currentPage = ref(0)
const totalPages = ref(0)
const totalElements = ref(0)
const pageSize = ref(20)
const unreadCount = ref(0)
const showProfileMenu = ref(false)

// Outlook 연동 모달
const showAuthModal = ref(false)
const deviceCode = ref(null)
const authTimeout = ref(900) // 15분
let authCheckInterval = null
let authTimeoutInterval = null

// 메일 작성 모달
const showComposeModal = ref(false)
const sending = ref(false)
const newEmail = ref({
  to: '',
  cc: '',
  subject: '',
  body: ''
})

// 챗봇 상태
const showChatPanel = ref(false)
const chatMessages = ref([])
const chatInput = ref('')
const chatLoading = ref(false)

// Sidebar Data
const menuItems = [
  { name: 'My Offers', icon: 'briefcase' },
  { name: 'User\'s Task', icon: 'clipboard' },
  { name: 'Product Discounts', icon: 'tag' },
  { name: 'Case Study', icon: 'academic-cap', active: true, count: 2 },
  { name: 'Security', icon: 'shield-check' },
  { name: 'Your Ability', icon: 'lightning-bolt' },
]

const messageUsers = [
  { name: 'Max Maraston', avatar: 'https://i.pravatar.cc/150?u=1', count: 2 },
  { name: 'Celia W McCombs', avatar: 'https://i.pravatar.cc/150?u=2' },
  { name: 'Edna J Critchlow', avatar: 'https://i.pravatar.cc/150?u=3', count: 1 },
  { name: 'Dima Groshev', avatar: 'https://i.pravatar.cc/150?u=4' },
]

const currentUser = {
  name: 'Amir Baqian',
  role: 'Product Designer',
  avatar: 'https://i.pravatar.cc/150?u=5'
}

// HTML 컨텐츠 감지 함수
const isHtmlContent = (email) => {
  if (!email || !email.body) return false

  // bodyType이 HTML인 경우
  if (email.bodyType &&
      (email.bodyType.toUpperCase() === 'HTML' ||
       email.bodyType.toLowerCase() === 'html')) {
    return true
  }

  // 본문에 HTML 태그가 있는 경우
  const htmlTagPattern = /<(html|body|div|p|span|br|table|tr|td|a|img|h1|h2|h3|h4|h5|h6|ul|ol|li)/i
  return htmlTagPattern.test(email.body)
}

// 날짜 포맷팅
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return '어제'
  } else if (diffDays < 7) {
    return `${diffDays}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

const formatDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 인증 상태 확인
const checkAuthStatus = async () => {
  try {
    const response = await api.get('/outlook/auth/status')
    console.log('인증 상태 API 응답:', response.data)

    // API 응답 구조 확인 및 처리
    if (response.data && response.data.data) {
      authStatus.value = response.data.data
      console.log('authStatus 업데이트됨:', authStatus.value)
    } else if (response.data) {
      authStatus.value = response.data
      console.log('authStatus 업데이트됨 (직접):', authStatus.value)
    }
  } catch (error) {
    console.error('인증 상태 확인 실패:', error)
    authStatus.value = { isConnected: false, outlookEmail: null }
  }
}

// 프로필 메뉴 외부 클릭 시 닫기
const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

// 페이지 클릭 이벤트 리스너
if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}

// 인증 모달 닫기 및 interval 정리
const closeAuthModal = () => {
  showAuthModal.value = false
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
    authCheckInterval = null
  }
  if (authTimeoutInterval) {
    clearInterval(authTimeoutInterval)
    authTimeoutInterval = null
  }
}

// 인증 페이지 열기
const openAuthPage = () => {
  if (!deviceCode.value?.verificationUri) {
    alert('인증 정보를 불러오지 못했습니다. 다시 시도해주세요.')
    return
  }

  // 팝업 차단 방지를 위해 window.open 사용
  const width = 600
  const height = 700
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  const authWindow = window.open(
    deviceCode.value.verificationUri,
    'OutlookAuth',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  )

  // 팝업이 차단되었는지 확인
  if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
    alert('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.')
  }
}

// Outlook 연동
const connectOutlook = async () => {
  showAuthModal.value = true
  deviceCode.value = null
  authTimeout.value = 900

  try {
    const response = await api.post('/outlook/auth/initiate')
    deviceCode.value = response.data.data

    // 인증 완료 확인 (5초마다)
    authCheckInterval = setInterval(async () => {
      const status = await checkAuthComplete()
      if (status) {
        closeAuthModal()
        await checkAuthStatus()
        await loadEmails()
        // 전체 임베딩 생성
        await generateAllEmbeddings()
      }
    }, 5000)

    // 타임아웃 카운트다운
    authTimeoutInterval = setInterval(() => {
      authTimeout.value--
      if (authTimeout.value <= 0) {
        closeAuthModal()
        alert('인증 시간이 만료되었습니다. 다시 시도해주세요.')
      }
    }, 1000)
  } catch (error) {
    console.error('Outlook 연동 시작 실패:', error)
    closeAuthModal()
  }
}

// 인증 완료 확인
const checkAuthComplete = async () => {
  try {
    const response = await api.get('/outlook/auth/status')
    return response.data.data.isConnected
  } catch (error) {
    return false
  }
}

// 연동 해제
const disconnectOutlook = async () => {
  showProfileMenu.value = false
  if (!confirm('Outlook 연동을 해제하시겠습니까?')) return

  try {
    await api.post('/outlook/auth/disconnect')
    authStatus.value = { isConnected: false, outlookEmail: null }
    emails.value = []
    alert('연동이 해제되었습니다.')
  } catch (error) {
    console.error('연동 해제 실패:', error)
    alert('연동 해제에 실패했습니다.')
  }
}

// 메일 동기화
const syncMails = async () => {
  syncing.value = true
  try {
    await api.post('/outlook/sync')
    await loadEmails()
    alert('메일 동기화가 완료되었습니다.')

    // 새 메일 임베딩 생성
    await generateAllEmbeddings()
  } catch (error) {
    console.error('메일 동기화 실패:', error)
    alert('메일 동기화에 실패했습니다.')
  } finally {
    syncing.value = false
  }
}

// 메일 목록 로드
const loadEmails = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      sortBy: 'receivedDateTime',
      sortOrder: 'desc'
    }

    if (currentFolder.value) {
      params.folder = currentFolder.value
    }

    if (currentProjectId.value) {
      params.projectId = currentProjectId.value
    }

    const response = await api.get('/emails', { params })
    const data = response.data.data

    emails.value = data.content
    totalPages.value = data.totalPages
    totalElements.value = data.totalElements

    // 안읽은 메일 개수 업데이트
    await loadUnreadCount()
  } catch (error) {
    console.error('메일 목록 로드 실패:', error)
  } finally {
    loading.value = false
  }
}

// 안읽은 메일 개수
const loadUnreadCount = async () => {
  try {
    const response = await api.get('/emails/unread/count')
    unreadCount.value = response.data.data
  } catch (error) {
    console.error('안읽은 메일 개수 로드 실패:', error)
  }
}

// 메일 검색
const searchMails = async () => {
  if (!searchQuery.value.trim()) {
    await loadEmails()
    return
  }

  loading.value = true
  try {
    const response = await api.get('/emails/search', {
      params: {
        query: searchQuery.value,
        page: currentPage.value,
        size: pageSize.value
      }
    })
    const data = response.data.data

    emails.value = data.content
    totalPages.value = data.totalPages
    totalElements.value = data.totalElements
  } catch (error) {
    console.error('메일 검색 실패:', error)
  } finally {
    loading.value = false
  }
}

// 폴더 선택
const selectFolder = (folder) => {
  currentFolder.value = folder
  currentPage.value = 0
  loadEmails()
}

// 프로젝트 선택
const onProjectChange = () => {
  currentPage.value = 0
  loadEmails()
}

// 프로젝트별 메일 그룹핑
const groupedEmails = computed(() => {
  const groups = {}

  // 프로젝트별로 메일 분류
  emails.value.forEach(email => {
    const projectId = email.projectId || 'unassigned'
    if (!groups[projectId]) {
      groups[projectId] = {
        projectId: email.projectId,
        projectName: email.projectName || '프로젝트 미할당',
        emails: []
      }
    }
    groups[projectId].emails.push(email)
  })

  // 배열로 변환하고 정렬 (프로젝트 미할당은 맨 아래로)
  const groupArray = Object.values(groups)
  return groupArray.sort((a, b) => {
    if (a.projectId === null) return 1
    if (b.projectId === null) return -1
    return a.projectName.localeCompare(b.projectName)
  })
})

// 페이지 이동
const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
    loadEmails()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++
    loadEmails()
  }
}

// 메일 상세 보기
const openEmail = async (emailId) => {
  try {
    const response = await api.get(`/emails/${emailId}`)
    selectedEmail.value = response.data.data
    selectedProjectId.value = selectedEmail.value.projectId

    // 읽음 처리
    if (!selectedEmail.value.isRead) {
      await api.put(`/emails/${emailId}/read`, { isRead: true })
      await loadEmails()
    }
  } catch (error) {
    console.error('메일 상세 조회 실패:', error)
  }
}

const closeEmail = () => {
  selectedEmail.value = null
  selectedProjectId.value = null
}

// 읽음 상태 토글
const toggleReadStatus = async () => {
  try {
    await api.put(`/emails/${selectedEmail.value.id}/read`, {
      isRead: !selectedEmail.value.isRead
    })
    selectedEmail.value.isRead = !selectedEmail.value.isRead
    await loadEmails()
  } catch (error) {
    console.error('읽음 상태 변경 실패:', error)
    alert('읽음 상태 변경에 실패했습니다.')
  }
}

// 프로젝트 할당
const assignProject = async () => {
  try {
    await api.put(`/emails/${selectedEmail.value.id}/project`, {
      projectId: selectedProjectId.value
    })

    // 선택된 이메일 정보 업데이트
    const project = projects.value.find(p => p.id === selectedProjectId.value)
    selectedEmail.value.projectId = selectedProjectId.value
    selectedEmail.value.projectName = project ? project.name : null

    // 메일 목록 새로고침
    await loadEmails()

    if (selectedProjectId.value) {
      console.log(`프로젝트 '${project.name}'에 할당되었습니다.`)
    } else {
      console.log('프로젝트 할당이 해제되었습니다.')
    }
  } catch (error) {
    console.error('프로젝트 할당 실패:', error)
    alert('프로젝트 할당에 실패했습니다.')
  }
}

// 메일 삭제
const deleteEmail = async () => {
  if (!confirm('이 메일을 삭제하시겠습니까?')) return

  try {
    await api.delete(`/emails/${selectedEmail.value.id}`)
    closeEmail()
    await loadEmails()
  } catch (error) {
    console.error('메일 삭제 실패:', error)
    alert('메일 삭제에 실패했습니다.')
  }
}

// 프로젝트 목록 로드
const loadProjects = async () => {
  try {
    const response = await api.get('/projects')
    projects.value = response.data.data.content || response.data.data
  } catch (error) {
    console.error('프로젝트 목록 로드 실패:', error)
  }
}

// 메일 작성 모달 열기
const openComposeModal = () => {
  showComposeModal.value = true
  newEmail.value = {
    to: '',
    cc: '',
    subject: '',
    body: ''
  }
}

// 메일 작성 모달 닫기
const closeComposeModal = () => {
  showComposeModal.value = false
  newEmail.value = {
    to: '',
    cc: '',
    subject: '',
    body: ''
  }
}

// 메일 발송
const sendNewEmail = async () => {
  // 필수 입력 확인
  if (!newEmail.value.to.trim()) {
    alert('받는 사람을 입력하세요.')
    return
  }
  if (!newEmail.value.subject.trim()) {
    alert('제목을 입력하세요.')
    return
  }
  if (!newEmail.value.body.trim()) {
    alert('본문을 입력하세요.')
    return
  }

  sending.value = true
  try {
    // 이메일 주소 배열로 변환 (쉼표로 구분)
    const toRecipients = newEmail.value.to.split(',').map(email => email.trim()).filter(email => email)
    const ccRecipients = newEmail.value.cc ? newEmail.value.cc.split(',').map(email => email.trim()).filter(email => email) : []

    await api.post('/emails/send', {
      toRecipients,
      ccRecipients,
      subject: newEmail.value.subject,
      body: newEmail.value.body,
      bodyType: 'Text'
    })

    alert('메일이 발송되었습니다.')
    closeComposeModal()

    // 보낸편지함으로 이동하여 새로고침
    currentFolder.value = 'SentItems'
    await syncMails()
    await loadEmails()
  } catch (error) {
    console.error('메일 발송 실패:', error)
    alert('메일 발송에 실패했습니다: ' + (error.response?.data?.message || error.message))
  } finally {
    sending.value = false
  }
}

// 챗봇 메시지 전송
const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return

  const userMessage = chatInput.value.trim()
  chatInput.value = ''

  // 사용자 메시지 추가
  chatMessages.value.push({
    role: 'user',
    content: userMessage
  })

  chatLoading.value = true

  try {
    // 사용자 ID 가져오기
    const userStr = localStorage.getItem('user')
    const userId = userStr ? JSON.parse(userStr).id : null

    if (!userId) {
      throw new Error('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
    }

    // Python Backend API 호출
    const response = await fetch('http://localhost:8000/api/ai/mail/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        conversation_history: chatMessages.value
          .filter(msg => msg.role !== 'system')
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }))
      })
    })

    const data = await response.json()

    // AI 응답 추가
    chatMessages.value.push({
      role: 'assistant',
      content: data.answer,
      queryType: data.query_type,  // search/draft/translate/general
      searchResults: data.search_results,
      emailDraft: data.email_draft,
      subject: data.subject,
      translatedEmail: data.translated_email,
      ragSections: data.rag_sections
    })
  } catch (error) {
    console.error('챗봇 API 호출 실패:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
    })
  } finally {
    chatLoading.value = false
  }
}

// 챗에서 메일 열기
const openEmailFromChat = async (emailId) => {
  // 채팅창은 유지하고 메일 상세만 열기
  await openEmail(emailId)
}

// 전체 임베딩 생성
const generateAllEmbeddings = async () => {
  // 사용자 ID 가져오기
  const userStr = localStorage.getItem('user')
  const userId = userStr ? JSON.parse(userStr).id : null

  if (!userId) {
    console.error('User ID not found')
    return
  }

  embedding.value = true
  try {
    console.log('전체 메일 임베딩 생성 시작...')

    const response = await fetch('http://localhost:8000/api/ai/mail/embeddings/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId
      })
    })

    const data = await response.json()

    console.log('임베딩 생성 완료:', data)
    console.log(`처리: ${data.processed}개, 스킵: ${data.skipped}개, 실패: ${data.failed}개`)
  } catch (error) {
    console.error('임베딩 생성 실패:', error)
  } finally {
    embedding.value = false
  }
}

// 초기화
onMounted(async () => {
  await checkAuthStatus()
  await loadProjects()
  if (authStatus.value.isConnected) {
    await loadEmails()
  }
})

// 클린업
onBeforeUnmount(() => {
  // Interval 정리
  if (authCheckInterval) {
    clearInterval(authCheckInterval)
  }
  if (authTimeoutInterval) {
    clearInterval(authTimeoutInterval)
  }

  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
/* 이메일 본문 HTML 렌더링 스타일 */
.email-body :deep(img) {
  max-width: 100%;
  height: auto;
}

.email-body :deep(table) {
  border-collapse: collapse;
  width: 100%;
}

.email-body :deep(table td),
.email-body :deep(table th) {
  border: 1px solid #ddd;
  padding: 8px;
}

.email-body :deep(a) {
  color: #f97316;
  text-decoration: underline;
}

.email-body :deep(a:hover) {
  color: #ea580c;
}

/* HTML 본문 기본 스타일 */
.email-body :deep(p) {
  margin-bottom: 1em;
}

.email-body :deep(ul),
.email-body :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

/* 슬라이딩 애니메이션 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}
</style>
