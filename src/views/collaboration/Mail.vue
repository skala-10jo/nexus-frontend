<template>
  <div class="p-8">
    <!-- 상단 헤더 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">메일</h1>

        <!-- Outlook 연동 상태 -->
        <div v-if="!authStatus.isConnected" class="flex items-center gap-3">
          <span class="text-sm text-gray-500">Outlook 계정을 연동하세요</span>
          <button
            @click="connectOutlook"
            class="px-6 py-2.5 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition font-medium"
          >
            Outlook 연동
          </button>
        </div>
        <div v-else class="flex items-center gap-4">
          <!-- 프로필 드롭다운 -->
          <div class="relative">
            <button
              @click="showProfileMenu = !showProfileMenu"
              class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
            >
              <svg class="w-8 h-8 text-orange-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <div class="text-left">
                <div class="font-medium text-sm">내 계정</div>
                <div class="text-xs text-gray-500">{{ authStatus.outlookEmail }}</div>
              </div>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- 드롭다운 메뉴 -->
            <div
              v-if="showProfileMenu"
              @click.stop
              class="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-10"
            >
              <div class="px-4 py-3 border-b border-gray-200">
                <div class="text-sm font-medium text-gray-900">{{ authStatus.outlookEmail }}</div>
                <div class="text-xs text-gray-500 mt-1">Outlook 연동됨</div>
              </div>
              <button
                @click="disconnectOutlook"
                class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
              >
                연동 해제
              </button>
            </div>
          </div>

          <!-- 액션 버튼들 -->
          <div class="flex items-center gap-2">
            <button
              @click="syncMails"
              :disabled="syncing"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {{ syncing ? '동기화 중...' : '동기화' }}
            </button>
            <button
              @click="openComposeModal"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              메일 작성
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 필터 바 -->
    <div class="bg-white rounded-lg shadow-md p-4 mb-6">
      <div class="flex justify-between items-center">
        <!-- 왼쪽: 받은/보낸 편지함 탭 -->
        <div class="flex gap-2">
          <button
            @click="selectFolder('Inbox')"
            :class="currentFolder === 'Inbox' ? 'bg-orange-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-6 py-2 rounded-lg transition font-medium"
          >
            받은편지함
            <span v-if="unreadCount > 0 && currentFolder === 'Inbox'" class="ml-2 bg-white text-orange-primary px-2 py-0.5 rounded-full text-xs font-bold">
              {{ unreadCount }}
            </span>
          </button>
          <button
            @click="selectFolder('SentItems')"
            :class="currentFolder === 'SentItems' ? 'bg-orange-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            class="px-6 py-2 rounded-lg transition font-medium"
          >
            보낸편지함
          </button>
        </div>

        <!-- 오른쪽: 프로젝트 드롭다운 + 검색창 -->
        <div class="flex gap-3">
          <select
            v-model="currentProjectId"
            @change="onProjectChange"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary bg-white"
          >
            <option :value="null">전체 프로젝트</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>

          <div class="flex gap-2">
            <input
              v-model="searchQuery"
              @keyup.enter="searchMails"
              type="text"
              placeholder="메일 검색 (제목, 발신자)..."
              class="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            >
            <button
              @click="searchMails"
              class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition font-medium"
            >
              검색
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 메일 목록 -->
    <div class="bg-white rounded-lg shadow-md">
      <div class="p-6">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary mx-auto"></div>
          <p class="text-gray-500 mt-4">메일을 불러오는 중...</p>
        </div>

        <div v-else-if="emails.length === 0" class="text-center py-12">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p class="text-gray-500">{{ authStatus.isConnected ? '메일이 없습니다' : 'Outlook을 연동하여 메일을 확인하세요' }}</p>
        </div>

        <!-- 프로젝트별 그룹핑 (전체 프로젝트 보기일 때만) -->
        <div v-else-if="currentProjectId === null && !searchQuery" class="space-y-6">
          <div v-for="group in groupedEmails" :key="group.projectId || 'unassigned'">
            <!-- 프로젝트 헤더 -->
            <div class="mb-3 flex items-center gap-3 bg-gray-50 p-3 rounded-lg border-l-4" :class="group.projectId ? 'border-orange-primary' : 'border-gray-400'">
              <span v-if="group.projectId" class="text-2xl">📁</span>
              <span v-else class="text-2xl">📭</span>
              <div class="flex-1">
                <h3 class="text-lg font-semibold" :class="group.projectId ? 'text-orange-700' : 'text-gray-600'">
                  {{ group.projectName }}
                </h3>
                <span class="text-xs text-gray-500">{{ group.emails.length }}개의 메일</span>
              </div>
            </div>

            <!-- 메일 목록 -->
            <div class="space-y-2 ml-4">
              <div
                v-for="email in group.emails"
                :key="email.id"
                @click="openEmail(email.id)"
                class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                :class="{ 'bg-blue-50 border-blue-200': !email.isRead, 'bg-white': email.isRead }"
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h3
                        class="font-semibold text-gray-800 truncate"
                        :class="{ 'font-bold': !email.isRead }"
                      >
                        {{ email.subject || '(제목 없음)' }}
                      </h3>
                      <span
                        v-if="email.hasAttachments"
                        class="text-gray-400"
                        title="첨부파일 있음"
                      >
                        📎
                      </span>
                      <span
                        v-if="!email.isRead"
                        class="w-2 h-2 bg-orange-primary rounded-full"
                        title="읽지 않음"
                      ></span>
                    </div>
                    <p class="text-sm text-gray-600 mb-1">
                      <span v-if="currentFolder === 'SentItems'">
                        받는이: {{ email.toRecipients?.split(';')[0].trim() || '(수신자 없음)' }}
                      </span>
                      <span v-else>
                        {{ email.fromName || email.fromAddress }}
                      </span>
                    </p>
                    <p class="text-sm text-gray-500 truncate">
                      {{ email.bodyPreview }}
                    </p>
                  </div>
                  <div class="ml-4 flex flex-col items-end gap-2">
                    <span class="text-xs text-gray-500 whitespace-nowrap">
                      {{ formatDate(email.receivedDateTime) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 일반 메일 목록 (특정 프로젝트 선택 또는 검색 시) -->
        <div v-else class="space-y-2">
          <div
            v-for="email in emails"
            :key="email.id"
            @click="openEmail(email.id)"
            class="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
            :class="{ 'bg-blue-50 border-blue-200': !email.isRead, 'bg-white': email.isRead }"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3
                    class="font-semibold text-gray-800 truncate"
                    :class="{ 'font-bold': !email.isRead }"
                  >
                    {{ email.subject || '(제목 없음)' }}
                  </h3>
                  <span
                    v-if="email.hasAttachments"
                    class="text-gray-400"
                    title="첨부파일 있음"
                  >
                    📎
                  </span>
                  <span
                    v-if="!email.isRead"
                    class="w-2 h-2 bg-orange-primary rounded-full"
                    title="읽지 않음"
                  ></span>
                </div>
                <p class="text-sm text-gray-600 mb-1">
                  <span v-if="currentFolder === 'SentItems'">
                    받는이: {{ email.toRecipients?.split(';')[0].trim() || '(수신자 없음)' }}
                  </span>
                  <span v-else>
                    {{ email.fromName || email.fromAddress }}
                  </span>
                </p>
                <p class="text-sm text-gray-500 truncate">
                  {{ email.bodyPreview }}
                </p>
              </div>
              <div class="ml-4 flex flex-col items-end gap-2">
                <span class="text-xs text-gray-500 whitespace-nowrap">
                  {{ formatDate(email.receivedDateTime) }}
                </span>
                <span
                  v-if="email.projectName"
                  class="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium border border-orange-200"
                  title="프로젝트 할당됨"
                >
                  📁 {{ email.projectName }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
          <button
            @click="prevPage"
            :disabled="currentPage === 0"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span class="px-4 py-2 text-gray-700 font-medium">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages - 1"
            class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- 메일 상세 모달 -->
    <div v-if="selectedEmail" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeEmail">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 헤더 -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-2xl font-bold text-gray-800">{{ selectedEmail.subject || '(제목 없음)' }}</h2>
            <button @click="closeEmail" class="text-gray-500 hover:text-gray-700">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex gap-2">
              <span class="text-gray-500 w-16">보낸이:</span>
              <span class="text-gray-800">{{ selectedEmail.fromName }} &lt;{{ selectedEmail.fromAddress }}&gt;</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-500 w-16">받는이:</span>
              <span class="text-gray-800">{{ selectedEmail.toRecipients }}</span>
            </div>
            <div v-if="selectedEmail.ccRecipients" class="flex gap-2">
              <span class="text-gray-500 w-16">참조:</span>
              <span class="text-gray-800">{{ selectedEmail.ccRecipients }}</span>
            </div>
            <div class="flex gap-2">
              <span class="text-gray-500 w-16">날짜:</span>
              <span class="text-gray-800">{{ formatDateFull(selectedEmail.receivedDateTime) }}</span>
            </div>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex gap-2 mt-4">
            <button
              @click="toggleReadStatus"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              {{ selectedEmail.isRead ? '읽지 않음으로 표시' : '읽음으로 표시' }}
            </button>
            <div class="relative">
              <select
                v-model="selectedProjectId"
                @change="assignProject"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary text-sm min-w-[200px]"
                :class="selectedEmail.projectId ? 'border-orange-300 bg-orange-50' : ''"
              >
                <option :value="null">{{ selectedEmail.projectId ? '프로젝트 할당 해제' : '프로젝트 선택' }}</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
              <div v-if="selectedEmail.projectName" class="absolute -top-2 -right-2 bg-orange-primary text-white text-xs px-2 py-0.5 rounded-full">
                할당됨
              </div>
            </div>
            <button
              @click="deleteEmail"
              class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm ml-auto"
            >
              삭제
            </button>
          </div>
        </div>

        <!-- 본문 -->
        <div class="flex-1 overflow-y-auto p-6">
          <div
            v-if="isHtmlContent(selectedEmail)"
            v-html="selectedEmail.body"
            class="prose max-w-none email-body"
          ></div>
          <div
            v-else
            class="whitespace-pre-wrap text-gray-800"
          >{{ selectedEmail.body }}</div>
        </div>
      </div>
    </div>

    <!-- 메일 작성 모달 -->
    <div v-if="showComposeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeComposeModal">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl">
        <div class="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-2xl font-bold text-gray-800">새 메일</h2>
          <button @click="closeComposeModal" class="text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <!-- 받는 사람 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">받는 사람 *</label>
            <input
              v-model="newEmail.to"
              type="text"
              placeholder="email@example.com (여러 명일 경우 쉼표로 구분)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            >
          </div>

          <!-- 참조 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">참조 (CC)</label>
            <input
              v-model="newEmail.cc"
              type="text"
              placeholder="email@example.com (여러 명일 경우 쉼표로 구분)"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            >
          </div>

          <!-- 제목 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
            <input
              v-model="newEmail.subject"
              type="text"
              placeholder="메일 제목을 입력하세요"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary"
            >
          </div>

          <!-- 본문 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">본문 *</label>
            <textarea
              v-model="newEmail.body"
              rows="10"
              placeholder="메일 내용을 입력하세요"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-primary resize-y"
            ></textarea>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            @click="closeComposeModal"
            class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            취소
          </button>
          <button
            @click="sendNewEmail"
            :disabled="sending"
            class="px-6 py-2 bg-orange-primary text-white rounded-lg hover:bg-orange-medium transition disabled:opacity-50"
          >
            {{ sending ? '발송 중...' : '발송' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Outlook 연동 모달 -->
    <div v-if="showAuthModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeAuthModal">
      <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 class="text-2xl font-bold text-gray-800 mb-4">Outlook 연동</h2>

        <div v-if="deviceCode" class="space-y-4">
          <p class="text-gray-700">다음 코드를 입력하여 인증하세요:</p>
          <div class="bg-gray-100 p-4 rounded-lg text-center">
            <p class="text-3xl font-mono font-bold text-orange-primary">{{ deviceCode.userCode }}</p>
          </div>
          <button
            @click="openAuthPage"
            class="block w-full px-4 py-3 bg-orange-primary text-white text-center rounded-lg hover:bg-orange-medium transition"
          >
            인증 페이지 열기
          </button>
          <p class="text-sm text-gray-500 text-center">
            인증 후 자동으로 완료됩니다 ({{ authTimeout }}초)
          </p>
        </div>

        <div v-else class="text-center py-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-primary mx-auto"></div>
          <p class="text-gray-500 mt-4">인증 준비 중...</p>
        </div>

        <button
          @click="closeAuthModal"
          class="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          취소
        </button>
      </div>
    </div>
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
</style>
