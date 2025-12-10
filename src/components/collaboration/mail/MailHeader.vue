<script setup>
/**
 * MailHeader Component
 * 메일 페이지 헤더 - 제목, Outlook 연결 상태, 프로필
 */
defineProps({
  /** Outlook 인증 상태 */
  authStatus: {
    type: Object,
    required: true
  },
  /** 동기화 중 여부 */
  syncing: {
    type: Boolean,
    default: false
  },
  /** 임베딩 중 여부 */
  embedding: {
    type: Boolean,
    default: false
  },
  /** 프로필 메뉴 표시 여부 */
  showProfileMenu: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'connect',
  'disconnect',
  'sync',
  'compose',
  'toggle-profile-menu'
])
</script>

<template>
  <div class="flex-shrink-0 px-4 md:px-8 py-4 md:py-6 border-b border-gray-200 bg-white z-10">
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
      <!-- Title -->
      <div>
        <h1 class="text-xl md:text-2xl font-bold text-gray-900">메일</h1>
        <p class="text-xs md:text-sm text-gray-500 font-medium mt-0.5 hidden md:block">Outlook 메일을 관리하고 비즈니스 매너에 맞는 초안을 작성하세요</p>
      </div>

      <!-- Not Connected -->
      <div v-if="!authStatus.isConnected" class="flex items-center justify-end gap-2 md:gap-3 flex-1 md:flex-none">
        <span class="text-xs md:text-sm text-gray-500 hidden md:inline">Outlook 계정을 연동하세요</span>
        <button
          @click="emit('connect')"
          class="flex items-center gap-1 md:gap-2 px-2.5 md:px-5 py-1.5 md:py-2.5 bg-black text-white rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
        >
          <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span>연동</span>
        </button>
      </div>

      <!-- Connected -->
      <div v-else class="flex items-center justify-between md:justify-end gap-2 md:gap-4">
        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            @click="emit('toggle-profile-menu')"
            class="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-200"
          >
            <div class="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm md:text-base">
              {{ authStatus.outlookEmail?.[0]?.toUpperCase() || 'U' }}
            </div>
            <div class="text-left hidden md:block">
              <div class="text-sm font-medium text-gray-900">내 계정</div>
              <div class="text-xs text-gray-500 truncate max-w-[150px]">{{ authStatus.outlookEmail }}</div>
            </div>
            <svg class="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showProfileMenu"
            @click.stop
            class="absolute right-0 mt-2 w-56 md:w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <div class="text-sm font-medium text-gray-900 truncate">{{ authStatus.outlookEmail }}</div>
              <div class="text-xs text-green-600 mt-1 flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Outlook 연동 완료
              </div>
            </div>
            <button
              @click="emit('disconnect')"
              class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
            >
              연동 해지
            </button>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-1.5 md:gap-2">
          <button
            @click="emit('sync')"
            :disabled="syncing || embedding"
            class="p-2 md:p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition disabled:opacity-50"
            :title="embedding ? 'Embedding...' : syncing ? 'Syncing...' : 'Sync'"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5" :class="{ 'animate-spin': syncing || embedding }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <button
            @click="emit('compose')"
            class="flex items-center gap-1.5 md:gap-2 px-3 md:px-5 py-2 md:py-2.5 bg-black text-white rounded-xl text-xs md:text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden md:inline">메일 보내기</span>
            <span class="md:hidden">작성</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
