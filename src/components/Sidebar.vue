<template>
  <!-- Desktop Sidebar -->
  <aside class="bg-gray-100 min-h-screen flex-col flex-shrink-0 transition-all duration-300 ease-in-out hidden md:flex"
    :class="isCollapsed ? 'w-[80px]' : 'w-80'">
    <!-- Brand Logo - Click to go to Dashboard -->
    <div class="p-8 pb-6 flex items-center gap-3" :class="isCollapsed ? 'justify-center p-4' : ''">
      <router-link to="/" class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" :class="isCollapsed ? 'justify-center' : ''">
        <div class="w-10 h-10 bg-blue-300 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
          <img
            src="@/views/logo.png"
            alt="NexUS Logo"
            class="w-9 h-9 object-contain ml-0.5"
          />
        </div>
        <span v-if="!isCollapsed" class="text-xl font-bold tracking-tight text-gray-900" style="font-family: 'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif !important; font-weight: 700 !important; letter-spacing: -0.02em !important;">NexUS</span>
      </router-link>
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

      <!-- Management -->
      <div class="space-y-1">
        <button @click="toggleMenu('management')"
          class="w-full flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden border"
          :class="[
            isActive('/management') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.05)] -translate-y-0.5 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-md hover:-translate-y-0.5',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Management' : ''">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 flex-shrink-0" :class="isActive('/management') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 2.5C14.25 2.4337 14.2237 2.37011 14.1768 2.32322C14.1299 2.27634 14.0663 2.25 14 2.25H7C6.27065 2.25 5.57118 2.53973 5.05546 3.05546C4.53973 3.57118 4.25 4.27065 4.25 5V19C4.25 19.7293 4.53973 20.4288 5.05546 20.9445C5.57118 21.4603 6.27065 21.75 7 21.75H17C17.7293 21.75 18.4288 21.4603 18.9445 20.9445C19.4603 20.4288 19.75 19.7293 19.75 19V9.147C19.75 9.0807 19.7237 9.01711 19.6768 8.97022C19.6299 8.92334 19.5663 8.897 19.5 8.897H15C14.8011 8.897 14.6103 8.81798 14.4697 8.67733C14.329 8.53668 14.25 8.34591 14.25 8.147V2.5ZM15 12.25C15.1989 12.25 15.3897 12.329 15.5303 12.4697C15.671 12.6103 15.75 12.8011 15.75 13C15.75 13.1989 15.671 13.3897 15.5303 13.5303C15.3897 13.671 15.1989 13.75 15 13.75H9C8.80109 13.75 8.61032 13.671 8.46967 13.5303C8.32902 13.3897 8.25 13.1989 8.25 13C8.25 12.8011 8.32902 12.6103 8.46967 12.4697C8.61032 12.329 8.80109 12.25 9 12.25H15ZM15 16.25C15.1989 16.25 15.3897 16.329 15.5303 16.4697C15.671 16.6103 15.75 16.8011 15.75 17C15.75 17.1989 15.671 17.3897 15.5303 17.5303C15.3897 17.671 15.1989 17.75 15 17.75H9C8.80109 17.75 8.61032 17.671 8.46967 17.5303C8.32902 17.3897 8.25 17.1989 8.25 17C8.25 16.8011 8.32902 16.6103 8.46967 16.4697C8.61032 16.329 8.80109 16.25 9 16.25H15Z"/>
              <path d="M15.75 2.82396C15.75 2.63996 15.943 2.52296 16.086 2.63796C16.2073 2.73596 16.315 2.84996 16.409 2.97996L19.422 7.17696C19.49 7.27296 19.416 7.39696 19.298 7.39696H16C15.9337 7.39696 15.8701 7.37062 15.8232 7.32373C15.7763 7.27685 15.75 7.21326 15.75 7.14696V2.82396Z"/>
            </svg>
            <span v-if="!isCollapsed" class="font-extrabold text-[15px]">관리</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('management') }" />
        </button>
        <div v-show="openMenus.has('management') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/management/schedule" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/management/schedule') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">일정 관리</router-link>
          <router-link to="/management/glossary" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/management/glossary') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">문서
            · 전문용어 사전</router-link>
        </div>
      </div>

      <!-- Conversation -->
      <div class="space-y-1">
        <button @click="toggleMenu('conversation')"
          class="w-full flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden border"
          :class="[
            isActive('/conversation') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.05)] -translate-y-0.5 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-md hover:-translate-y-0.5',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Conversation' : ''">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 flex-shrink-0" :class="isActive('/conversation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.9604 8.03007C19.9536 6.97211 19.7395 5.92574 19.3304 4.95007C18.9277 3.97166 18.3326 3.0841 17.5804 2.34007C16.8357 1.5962 15.9515 1.0066 14.9786 0.605059C14.0056 0.203517 12.963 -0.00207452 11.9104 6.70172e-05C10.1632 -0.00708249 8.46161 0.557989 7.06576 1.60894C5.66991 2.65989 4.65651 4.13893 4.18039 5.82007C3.02456 6.23316 2.01595 6.97745 1.28039 7.96007C0.451154 9.05729 0.00182787 10.3947 0.000393901 11.7701C-0.00862889 12.564 0.137437 13.3521 0.430394 14.0901L0.140394 16.2301C0.0833356 16.5817 0.152405 16.9421 0.335396 17.2477C0.518387 17.5533 0.803517 17.7844 1.14039 17.9001C1.37639 17.9861 1.63039 18.0101 1.88039 17.9701L3.97039 17.6001C4.72651 17.907 5.53435 18.0666 6.35039 18.0701C7.29039 18.0701 8.22039 17.8621 9.07039 17.4601C9.79552 17.1186 10.4475 16.6398 10.9904 16.0501C11.2984 16.0967 11.6084 16.1234 11.9204 16.1301C12.9804 16.1301 14.0304 15.9201 15.0104 15.5101L17.8904 15.9301H18.0004C18.2485 15.9296 18.4938 15.8778 18.721 15.778C18.9482 15.6782 19.1522 15.5325 19.3204 15.3501C19.4892 15.1665 19.6155 14.948 19.6904 14.7101C19.7704 14.4691 19.8004 14.2131 19.7804 13.9601L19.4304 11.0301C19.8 10.0739 19.98 9.05498 19.9604 8.03007ZM10.0804 14.7201C9.62261 15.2807 9.04516 15.7317 8.39039 16.0401C7.72817 16.3335 7.01451 16.4932 6.29039 16.5101C5.60122 16.5061 4.9203 16.3597 4.29039 16.0801C4.19819 16.031 4.09478 16.0069 3.99039 16.0101H3.86039L1.59039 16.3901L1.92039 14.0301C1.931 13.8939 1.91048 13.7571 1.86039 13.6301C1.59558 13.0215 1.46267 12.3637 1.47039 11.7001C1.48614 10.6537 1.84203 9.64083 2.48428 8.81457C3.12652 7.98831 4.02024 7.39352 5.03039 7.12007C5.4485 7.00996 5.87814 6.94955 6.31039 6.94007C7.59477 6.94508 8.82471 7.45936 9.73039 8.37007C10.1788 8.81734 10.5342 9.34891 10.7762 9.93416C11.0182 10.5194 11.1419 11.1468 11.1404 11.7801C11.1174 12.8495 10.7452 13.882 10.0804 14.7201Z"/>
            </svg>
            <span v-if="!isCollapsed" class="font-extrabold text-[15px]">회화</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('conversation') }" />
        </button>
        <div v-show="openMenus.has('conversation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/conversation/scenario" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/conversation/scenario') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">실무
            시나리오 회화연습</router-link>
          <router-link to="/conversation/speaking-tutor" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/conversation/speaking-tutor') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">AI
            실전 회화 피드백</router-link>
          <router-link to="/conversation/expression" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/conversation/expression') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">Biz
            표현 학습</router-link>
          <router-link to="/conversation/mistakes" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/conversation/mistakes') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">오답노트</router-link>
        </div>
      </div>

      <!-- Translation -->
      <div class="space-y-1">
        <button @click="toggleMenu('translation')"
          class="w-full flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden border"
          :class="[
            isActive('/translation') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.05)] -translate-y-0.5 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-md hover:-translate-y-0.5',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Translation' : ''">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 flex-shrink-0" :class="isActive('/translation') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.78035 0C8.47721 6.38807e-09 8.18649 0.120419 7.97215 0.334767C7.7578 0.549115 7.63738 0.839834 7.63738 1.14297C7.63738 1.4461 7.7578 1.73682 7.97215 1.95117C8.18649 2.16552 8.47721 2.28594 8.78035 2.28594H11.4473V3.43043C11.4473 4.01715 11.2994 4.46519 11.1013 4.73341C10.9322 4.96353 10.7005 5.10983 10.3165 5.10983C10.0134 5.10983 9.72264 5.23025 9.50829 5.4446C9.29395 5.65894 9.17353 5.94966 9.17353 6.2528C9.17353 6.55593 9.29395 6.84665 9.50829 7.061C9.72264 7.27534 10.0134 7.39576 10.3165 7.39576C10.8275 7.40555 11.3333 7.29161 11.7908 7.06367C12.2483 6.83573 12.6439 6.50054 12.9438 6.08668C13.5031 5.32471 13.7332 4.36157 13.7332 3.43043V1.14297C13.7332 0.839834 13.6128 0.549115 13.3984 0.334767C13.1841 0.120419 12.8934 0 12.5902 0H8.78035ZM7.17714 4.15278C7.09314 3.93911 6.94674 3.75569 6.75701 3.62641C6.56728 3.49713 6.34301 3.42799 6.11342 3.42799C5.88383 3.42799 5.65956 3.49713 5.46983 3.62641C5.2801 3.75569 5.1337 3.93911 5.0497 4.15278L0.0907416 16.7254C0.0311692 16.8659 0.000316503 17.0168 2.42243e-06 17.1694C-0.000311658 17.3219 0.0299189 17.473 0.0889126 17.6137C0.147906 17.7544 0.234469 17.8819 0.343498 17.9886C0.452527 18.0953 0.581815 18.1791 0.723742 18.2351C0.865669 18.291 1.01736 18.318 1.16988 18.3144C1.3224 18.3108 1.47265 18.2767 1.61179 18.2141C1.75092 18.1516 1.87612 18.0618 1.98001 17.95C2.08389 17.8383 2.16436 17.7069 2.21666 17.5636L3.4343 14.4791H8.78797L10.0026 17.5636C10.1137 17.8457 10.3324 18.0721 10.6105 18.193C10.8885 18.3139 11.2033 18.3194 11.4854 18.2082C11.7675 18.0971 11.9939 17.8784 12.1148 17.6003C12.2357 17.3223 12.2412 17.0075 12.13 16.7254L7.17714 4.15278ZM7.88731 12.1932H4.33649L6.11342 7.68836L7.88731 12.1932ZM16.4001 0C16.7033 0 16.994 0.120419 17.2083 0.334767C17.4227 0.549115 17.5431 0.839834 17.5431 1.14297V4.56882H17.9241C18.2272 4.56882 18.5179 4.68924 18.7323 4.90359C18.9466 5.11794 19.0671 5.40866 19.0671 5.71179C19.0671 6.01493 18.9466 6.30564 18.7323 6.51999C18.5179 6.73434 18.2272 6.85476 17.9241 6.85476H17.5431V12.5711C17.5431 12.8743 17.4227 13.165 17.2083 13.3793C16.994 13.5937 16.7033 13.7141 16.4001 13.7141C16.097 13.7141 15.8063 13.5937 15.5919 13.3793C15.3776 13.165 15.2572 12.8743 15.2572 12.5711V1.14297C15.2572 0.839834 15.3776 0.549115 15.5919 0.334767C15.8063 0.120419 16.097 0 16.4001 0Z"/>
            </svg>
            <span v-if="!isCollapsed" class="font-extrabold text-[15px]">번역</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('translation') }" />
        </button>
        <div v-show="openMenus.has('translation') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/translation/text" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/translation/text') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">텍스트</router-link>
          <router-link to="/translation/voice" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/translation/voice') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">음성</router-link>
          <router-link to="/translation/video" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/translation/video') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">영상</router-link>
        </div>
      </div>

      <!-- Collaboration -->
      <div class="space-y-1">
        <button @click="toggleMenu('collaboration')"
          class="w-full flex items-center rounded-2xl transition-all duration-300 group relative overflow-hidden border"
          :class="[
            isActive('/collaboration') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.08),inset_0_4px_8px_rgba(255,255,255,1),inset_0_-4px_8px_rgba(0,0,0,0.05)] -translate-y-0.5 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white hover:shadow-md hover:-translate-y-0.5',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 justify-between'
          ]" :title="isCollapsed ? 'Collaboration' : ''">
          <div class="flex items-center gap-4">
            <svg class="w-5 h-5 flex-shrink-0" :class="isActive('/collaboration') ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 20C4.45 20 3.975 19.8083 3.575 19.425C3.19167 19.025 3 18.55 3 18V6C3 5.45 3.19167 4.98333 3.575 4.6C3.975 4.2 4.45 4 5 4H21C21.55 4 22.0167 4.2 22.4 4.6C22.8 4.98333 23 5.45 23 6V18C23 18.55 22.8 19.025 22.4 19.425C22.0167 19.8083 21.55 20 21 20H5ZM13 13L21 8V6L13 11L5 6V8L13 13Z"/>
            </svg>
            <span v-if="!isCollapsed" class="font-extrabold text-[15px]">협업</span>
          </div>
          <ChevronDownIcon v-if="!isCollapsed" class="w-4 h-4 transition-transform duration-300"
            :class="{ 'rotate-180': openMenus.has('collaboration') }" />
        </button>
        <div v-show="openMenus.has('collaboration') && !isCollapsed" class="pl-4 space-y-1 mt-1">
          <router-link to="/collaboration/mail" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/collaboration/mail') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">메일</router-link>
          <router-link to="/collaboration/messenger" class="block px-4 py-2 text-sm rounded-xl transition border"
            :class="isSubActive('/collaboration/messenger') ? 'bg-gradient-to-b from-white to-gray-50 border-white/50 shadow-[0_4px_10px_rgba(0,0,0,0.05),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(0,0,0,0.05)] text-blue-600 font-bold' : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-white/50'">메신저</router-link>
        </div>
      </div>

    </nav>

    <!-- User Profile & Logout -->
    <div class="mt-auto pt-4 border-t border-gray-200/50" :class="isCollapsed ? 'px-3 pb-4' : 'px-6 pb-6'">
      <div class="flex items-center gap-3 p-2 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all"
        :class="isCollapsed ? 'justify-center' : ''" :title="isCollapsed ? user?.fullName || 'User' : ''"
        @click="openProfileModal">
        <img :src="avatarUrl" class="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-gray-200"
          alt="" />
        <div v-if="!isCollapsed" class="flex-1 min-w-0">
          <div class="text-sm font-bold text-gray-900 truncate">{{ user?.fullName || 'User' }}</div>
          <div class="text-xs text-gray-500 truncate">{{ user?.role || '역할을 설정해주세요' }}</div>
        </div>
        <button v-if="!isCollapsed" @click.stop="handleLogout"
          class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="로그아웃">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
        </button>
      </div>
      <!-- Collapsed logout button -->
      <button v-if="isCollapsed" @click="handleLogout"
        class="w-full mt-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex justify-center"
        title="로그아웃">
        <ArrowRightOnRectangleIcon class="w-5 h-5" />
      </button>
    </div>

    <!-- User Profile Modal -->
    <UserProfileModal :show="showProfileModal" @close="closeProfileModal" />
  </aside>

  <!-- Mobile Bottom Navigation -->
  <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">

    <!-- Horizontal Submenu Bar -->
    <div v-if="mobileOpenMenu"
      class="absolute bottom-[calc(100%-1px)] left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div class="flex items-center justify-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">

        <!-- Management Submenu -->
        <template v-if="mobileOpenMenu === 'management'">
          <router-link to="/management/schedule?tab=projects"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/management/schedule') && route.query.tab !== 'schedule' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            프로젝트
          </router-link>
          <router-link to="/management/schedule?tab=schedule"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/management/schedule') && route.query.tab === 'schedule' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            일정
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
            실무 시나리오 회화연습
          </router-link>
          <router-link to="/conversation/speaking-tutor"
            class="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-colors"
            :class="isSubActive('/conversation/speaking-tutor') ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
            @click="mobileOpenMenu = null">
            AI 실전 회화 피드백
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
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.3213 15.2023C14.4394 15.2024 14.5349 15.2981 14.5352 15.4161V21.4874H10.4639V15.4161C10.4641 15.2983 10.5599 15.2027 10.6777 15.2023H14.3213ZM12.5 2.00012C13.8476 2.00012 14.9787 2.96998 17.2412 4.9093L18.4561 5.95032C19.7076 7.02309 20.3337 7.55975 20.667 8.2843C21.0001 9.00882 21 9.8332 21 11.4816V16.631C21 18.9203 21.0001 20.0652 20.2891 20.7765C19.6196 21.446 18.5657 21.4841 16.5352 21.4865V15.4161C16.5349 14.1935 15.5439 13.2024 14.3213 13.2023H10.6777C9.45533 13.2027 8.46409 14.1937 8.46387 15.4161V21.4865C6.43395 21.4841 5.3803 21.4459 4.71094 20.7765C3.99989 20.0652 4 18.9203 4 16.631V11.4816C4 9.8332 3.99989 9.00882 4.33301 8.2843C4.66625 7.55975 5.29237 7.02309 6.54395 5.95032L7.75879 4.9093C10.0213 2.96998 11.1524 2.00012 12.5 2.00012Z"/>
        </svg>
        <span class="text-[10px] font-medium">홈</span>
      </router-link>

      <!-- Management -->
      <button @click="toggleMobileMenu('management')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/management') ? 'text-blue-600' : 'text-gray-500'">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M14.25 2.5C14.25 2.4337 14.2237 2.37011 14.1768 2.32322C14.1299 2.27634 14.0663 2.25 14 2.25H7C6.27065 2.25 5.57118 2.53973 5.05546 3.05546C4.53973 3.57118 4.25 4.27065 4.25 5V19C4.25 19.7293 4.53973 20.4288 5.05546 20.9445C5.57118 21.4603 6.27065 21.75 7 21.75H17C17.7293 21.75 18.4288 21.4603 18.9445 20.9445C19.4603 20.4288 19.75 19.7293 19.75 19V9.147C19.75 9.0807 19.7237 9.01711 19.6768 8.97022C19.6299 8.92334 19.5663 8.897 19.5 8.897H15C14.8011 8.897 14.6103 8.81798 14.4697 8.67733C14.329 8.53668 14.25 8.34591 14.25 8.147V2.5ZM15 12.25C15.1989 12.25 15.3897 12.329 15.5303 12.4697C15.671 12.6103 15.75 12.8011 15.75 13C15.75 13.1989 15.671 13.3897 15.5303 13.5303C15.3897 13.671 15.1989 13.75 15 13.75H9C8.80109 13.75 8.61032 13.671 8.46967 13.5303C8.32902 13.3897 8.25 13.1989 8.25 13C8.25 12.8011 8.32902 12.6103 8.46967 12.4697C8.61032 12.329 8.80109 12.25 9 12.25H15ZM15 16.25C15.1989 16.25 15.3897 16.329 15.5303 16.4697C15.671 16.6103 15.75 16.8011 15.75 17C15.75 17.1989 15.671 17.3897 15.5303 17.5303C15.3897 17.671 15.1989 17.75 15 17.75H9C8.80109 17.75 8.61032 17.671 8.46967 17.5303C8.32902 17.3897 8.25 17.1989 8.25 17C8.25 16.8011 8.32902 16.6103 8.46967 16.4697C8.61032 16.329 8.80109 16.25 9 16.25H15Z"/>
          <path d="M15.75 2.82396C15.75 2.63996 15.943 2.52296 16.086 2.63796C16.2073 2.73596 16.315 2.84996 16.409 2.97996L19.422 7.17696C19.49 7.27296 19.416 7.39696 19.298 7.39696H16C15.9337 7.39696 15.8701 7.37062 15.8232 7.32373C15.7763 7.27685 15.75 7.21326 15.75 7.14696V2.82396Z"/>
        </svg>
        <span class="text-[10px] font-medium">관리</span>
      </button>

      <!-- Conversation -->
      <button @click="toggleMobileMenu('conversation')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/conversation') ? 'text-blue-600' : 'text-gray-500'">
        <svg class="w-6 h-6" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.9604 8.03007C19.9536 6.97211 19.7395 5.92574 19.3304 4.95007C18.9277 3.97166 18.3326 3.0841 17.5804 2.34007C16.8357 1.5962 15.9515 1.0066 14.9786 0.605059C14.0056 0.203517 12.963 -0.00207452 11.9104 6.70172e-05C10.1632 -0.00708249 8.46161 0.557989 7.06576 1.60894C5.66991 2.65989 4.65651 4.13893 4.18039 5.82007C3.02456 6.23316 2.01595 6.97745 1.28039 7.96007C0.451154 9.05729 0.00182787 10.3947 0.000393901 11.7701C-0.00862889 12.564 0.137437 13.3521 0.430394 14.0901L0.140394 16.2301C0.0833356 16.5817 0.152405 16.9421 0.335396 17.2477C0.518387 17.5533 0.803517 17.7844 1.14039 17.9001C1.37639 17.9861 1.63039 18.0101 1.88039 17.9701L3.97039 17.6001C4.72651 17.907 5.53435 18.0666 6.35039 18.0701C7.29039 18.0701 8.22039 17.8621 9.07039 17.4601C9.79552 17.1186 10.4475 16.6398 10.9904 16.0501C11.2984 16.0967 11.6084 16.1234 11.9204 16.1301C12.9804 16.1301 14.0304 15.9201 15.0104 15.5101L17.8904 15.9301H18.0004C18.2485 15.9296 18.4938 15.8778 18.721 15.778C18.9482 15.6782 19.1522 15.5325 19.3204 15.3501C19.4892 15.1665 19.6155 14.948 19.6904 14.7101C19.7704 14.4691 19.8004 14.2131 19.7804 13.9601L19.4304 11.0301C19.8 10.0739 19.98 9.05498 19.9604 8.03007ZM10.0804 14.7201C9.62261 15.2807 9.04516 15.7317 8.39039 16.0401C7.72817 16.3335 7.01451 16.4932 6.29039 16.5101C5.60122 16.5061 4.9203 16.3597 4.29039 16.0801C4.19819 16.031 4.09478 16.0069 3.99039 16.0101H3.86039L1.59039 16.3901L1.92039 14.0301C1.931 13.8939 1.91048 13.7571 1.86039 13.6301C1.59558 13.0215 1.46267 12.3637 1.47039 11.7001C1.48614 10.6537 1.84203 9.64083 2.48428 8.81457C3.12652 7.98831 4.02024 7.39352 5.03039 7.12007C5.4485 7.00996 5.87814 6.94955 6.31039 6.94007C7.59477 6.94508 8.82471 7.45936 9.73039 8.37007C10.1788 8.81734 10.5342 9.34891 10.7762 9.93416C11.0182 10.5194 11.1419 11.1468 11.1404 11.7801C11.1174 12.8495 10.7452 13.882 10.0804 14.7201Z"/>
        </svg>
        <span class="text-[10px] font-medium">회화</span>
      </button>

      <!-- Translation -->
      <button @click="toggleMobileMenu('translation')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/translation') ? 'text-blue-600' : 'text-gray-500'">
        <svg class="w-6 h-6" viewBox="0 0 20 19" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.78035 0C8.47721 6.38807e-09 8.18649 0.120419 7.97215 0.334767C7.7578 0.549115 7.63738 0.839834 7.63738 1.14297C7.63738 1.4461 7.7578 1.73682 7.97215 1.95117C8.18649 2.16552 8.47721 2.28594 8.78035 2.28594H11.4473V3.43043C11.4473 4.01715 11.2994 4.46519 11.1013 4.73341C10.9322 4.96353 10.7005 5.10983 10.3165 5.10983C10.0134 5.10983 9.72264 5.23025 9.50829 5.4446C9.29395 5.65894 9.17353 5.94966 9.17353 6.2528C9.17353 6.55593 9.29395 6.84665 9.50829 7.061C9.72264 7.27534 10.0134 7.39576 10.3165 7.39576C10.8275 7.40555 11.3333 7.29161 11.7908 7.06367C12.2483 6.83573 12.6439 6.50054 12.9438 6.08668C13.5031 5.32471 13.7332 4.36157 13.7332 3.43043V1.14297C13.7332 0.839834 13.6128 0.549115 13.3984 0.334767C13.1841 0.120419 12.8934 0 12.5902 0H8.78035ZM7.17714 4.15278C7.09314 3.93911 6.94674 3.75569 6.75701 3.62641C6.56728 3.49713 6.34301 3.42799 6.11342 3.42799C5.88383 3.42799 5.65956 3.49713 5.46983 3.62641C5.2801 3.75569 5.1337 3.93911 5.0497 4.15278L0.0907416 16.7254C0.0311692 16.8659 0.000316503 17.0168 2.42243e-06 17.1694C-0.000311658 17.3219 0.0299189 17.473 0.0889126 17.6137C0.147906 17.7544 0.234469 17.8819 0.343498 17.9886C0.452527 18.0953 0.581815 18.1791 0.723742 18.2351C0.865669 18.291 1.01736 18.318 1.16988 18.3144C1.3224 18.3108 1.47265 18.2767 1.61179 18.2141C1.75092 18.1516 1.87612 18.0618 1.98001 17.95C2.08389 17.8383 2.16436 17.7069 2.21666 17.5636L3.4343 14.4791H8.78797L10.0026 17.5636C10.1137 17.8457 10.3324 18.0721 10.6105 18.193C10.8885 18.3139 11.2033 18.3194 11.4854 18.2082C11.7675 18.0971 11.9939 17.8784 12.1148 17.6003C12.2357 17.3223 12.2412 17.0075 12.13 16.7254L7.17714 4.15278ZM7.88731 12.1932H4.33649L6.11342 7.68836L7.88731 12.1932ZM16.4001 0C16.7033 0 16.994 0.120419 17.2083 0.334767C17.4227 0.549115 17.5431 0.839834 17.5431 1.14297V4.56882H17.9241C18.2272 4.56882 18.5179 4.68924 18.7323 4.90359C18.9466 5.11794 19.0671 5.40866 19.0671 5.71179C19.0671 6.01493 18.9466 6.30564 18.7323 6.51999C18.5179 6.73434 18.2272 6.85476 17.9241 6.85476H17.5431V12.5711C17.5431 12.8743 17.4227 13.165 17.2083 13.3793C16.994 13.5937 16.7033 13.7141 16.4001 13.7141C16.097 13.7141 15.8063 13.5937 15.5919 13.3793C15.3776 13.165 15.2572 12.8743 15.2572 12.5711V1.14297C15.2572 0.839834 15.3776 0.549115 15.5919 0.334767C15.8063 0.120419 16.097 0 16.4001 0Z"/>
        </svg>
        <span class="text-[10px] font-medium">번역</span>
      </button>

      <!-- Collaboration -->
      <button @click="toggleMobileMenu('collaboration')"
        class="flex flex-col items-center justify-center w-full h-full space-y-1"
        :class="isActive('/collaboration') ? 'text-blue-600' : 'text-gray-500'">
        <svg class="w-6 h-6" viewBox="0 0 25 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 20C4.45 20 3.975 19.8083 3.575 19.425C3.19167 19.025 3 18.55 3 18V6C3 5.45 3.19167 4.98333 3.575 4.6C3.975 4.2 4.45 4 5 4H21C21.55 4 22.0167 4.2 22.4 4.6C22.8 4.98333 23 5.45 23 6V18C23 18.55 22.8 19.025 22.4 19.425C22.0167 19.8083 21.55 20 21 20H5ZM13 13L21 8V6L13 11L5 6V8L13 13Z"/>
        </svg>
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
    return route.path === '/' || route.path === '/dashboard';
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
