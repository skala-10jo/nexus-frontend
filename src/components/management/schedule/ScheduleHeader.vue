<script setup>
/**
 * 일정 페이지 헤더 컴포넌트
 * @description 페이지 제목, 일정 추가 버튼, Outlook 연동/동기화 버튼을 표시
 */
import { PlusIcon, ArrowPathIcon, LinkIcon } from '@heroicons/vue/24/outline'

defineProps({
  /** 로딩 상태 */
  loading: {
    type: Boolean,
    default: false
  },
  /** Outlook 동기화 중 */
  syncingOutlook: {
    type: Boolean,
    default: false
  },
  /** Outlook 연동 여부 */
  isOutlookConnected: {
    type: Boolean,
    default: false
  },
  /** 연결된 Outlook 이메일 */
  outlookEmail: {
    type: String,
    default: null
  }
})

const emit = defineEmits([
  /** 일정 추가 버튼 클릭 */
  'create',
  /** Outlook 동기화 버튼 클릭 */
  'sync-outlook',
  /** Outlook 연동 버튼 클릭 */
  'connect-outlook'
])
</script>

<template>
  <div class="flex-shrink-0 px-8 py-6 border-b border-gray-200 bg-white z-10">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">일정 관리</h1>
        <p class="text-sm text-gray-500 font-medium mt-0.5">
          Outlook 일정을 연동해보세용~
        </p>
      </div>
      <div class="hidden md:flex items-center gap-3">
        <!-- Outlook 연동 버튼 (연동 안 됨) -->
        <button
          v-if="!isOutlookConnected"
          class="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl text-sm font-semibold hover:bg-blue-100 hover:border-blue-300 active:scale-95 transition-all"
          @click="emit('connect-outlook')"
          title="Outlook 일정 연동하기"
        >
          <LinkIcon class="w-5 h-5" />
          <span>Outlook 연동</span>
        </button>

        <!-- Outlook 동기화 버튼 (연동됨) -->
        <div v-else class="flex items-center gap-2">
          <!-- 연결된 이메일 표시 -->
          <span v-if="outlookEmail" class="text-xs text-gray-500 mr-1">
            {{ outlookEmail }}
          </span>
          <button
            :disabled="syncingOutlook"
            class="flex items-center gap-2 px-4 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="emit('sync-outlook')"
            title="Outlook 일정 동기화"
          >
            <ArrowPathIcon class="w-5 h-5" :class="{ 'animate-spin': syncingOutlook }" />
            <span>{{ syncingOutlook ? '일정 가져오는 중...' : '일정 가져오기' }}</span>
          </button>
        </div>

        <!-- 일정 추가 버튼 -->
        <button
          :disabled="loading"
          class="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('create')"
        >
          <PlusIcon class="w-5 h-5" />
          <span>추가</span>
        </button>
      </div>
    </div>
  </div>
</template>
