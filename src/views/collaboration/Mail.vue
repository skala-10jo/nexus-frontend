<template>
  <div class="flex h-full overflow-hidden relative">
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col h-full overflow-hidden transition-all duration-300" :style="{ marginRight: showChatPanel ? '400px' : '0' }">
      
      <!-- Header -->
      <div class="sticky top-0 bg-white/80 backdrop-blur-sm z-20 px-8 py-6 border-b border-gray-100 flex-none">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 font-nanum-round-eb">Mail</h1>
            <p class="text-sm text-gray-500 mt-1 font-medium">Manage your communications</p>
          </div>

          <!-- Outlook Connection Status -->
          <div v-if="!authStatus.isConnected" class="flex items-center gap-3">
            <span class="text-sm text-gray-500">Connect your Outlook account</span>
            <button
              @click="connectOutlook"
              class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Connect Outlook
            </button>
          </div>
          <div v-else class="flex items-center gap-4">
            <!-- Profile Dropdown -->
            <div class="relative">
              <button
                @click="showProfileMenu = !showProfileMenu"
                class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition border border-transparent hover:border-gray-200"
              >
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                  {{ authStatus.outlookEmail?.[0]?.toUpperCase() || 'U' }}
                </div>
                <div class="text-left hidden md:block">
                  <div class="text-sm font-medium text-gray-900">My Account</div>
                  <div class="text-xs text-gray-500 truncate max-w-[150px]">{{ authStatus.outlookEmail }}</div>
                </div>
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showProfileMenu"
                @click.stop
                class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20"
              >
                <div class="px-4 py-3 border-b border-gray-100">
                  <div class="text-sm font-medium text-gray-900 truncate">{{ authStatus.outlookEmail }}</div>
                  <div class="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Outlook Connected
                  </div>
                </div>
                <button
                  @click="disconnectOutlook"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button
                @click="syncMails"
                :disabled="syncing || embedding"
                class="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition disabled:opacity-50"
                :title="embedding ? 'Embedding...' : syncing ? 'Syncing...' : 'Sync'"
              >
                <svg class="w-5 h-5" :class="{ 'animate-spin': syncing || embedding }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                @click="openComposeModal"
                class="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-sm"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Compose
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Toolbar & Filters -->
      <div class="px-8 py-4 bg-white/60 backdrop-blur-sm border-b border-gray-100 flex-none">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <!-- Left: Inbox/Sent Tabs -->
          <div class="flex p-1 bg-gray-100 rounded-xl">
            <button
              @click="selectFolder('Inbox')"
              :class="currentFolder === 'Inbox' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              class="px-6 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2"
            >
              Inbox
              <span v-if="unreadCount > 0 && currentFolder === 'Inbox'" class="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                {{ unreadCount }}
              </span>
            </button>
            <button
              @click="selectFolder('SentItems')"
              :class="currentFolder === 'SentItems' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
              class="px-6 py-2 rounded-lg transition-all text-sm font-medium"
            >
              Sent
            </button>
          </div>

          <!-- Right: Project Filter & Search -->
          <div class="flex gap-3 w-full md:w-auto">
            <select
              v-model="currentProjectId"
              @change="onProjectChange"
              class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white text-sm text-gray-700 min-w-[160px]"
            >
              <option :value="null">All Projects</option>
              <option v-for="project in projects" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>

            <div class="relative flex-1 md:w-80">
              <input
                v-model="searchQuery"
                @keyup.enter="searchMails"
                type="text"
                placeholder="Search emails..."
                class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              >
              <svg class="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Mail List -->
      <div class="flex-1 overflow-y-auto p-8">
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="emails.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-500">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p>{{ authStatus.isConnected ? 'No emails found' : 'Connect Outlook to view emails' }}</p>
        </div>

        <!-- Grouped by Project -->
        <div v-else-if="currentProjectId === null && !searchQuery" class="space-y-8">
          <div v-for="group in groupedEmails" :key="group.projectId || 'unassigned'">
            <!-- Group Header -->
            <div class="flex items-center gap-3 mb-4">
              <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span class="w-2 h-2 rounded-full" :class="group.projectId ? 'bg-blue-500' : 'bg-gray-300'"></span>
                {{ group.projectName }}
                <span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-1">{{ group.emails.length }}</span>
              </h3>
            </div>

            <!-- Email Cards -->
            <div class="space-y-3">
              <div
                v-for="email in group.emails"
                :key="email.id"
                @click="openEmail(email.id)"
                class="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
                :class="{ 'bg-blue-50/30': !email.isRead }"
              >
                <div v-if="!email.isRead" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                
                <div class="flex justify-between items-start gap-4">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1.5">
                      <h4 class="text-base font-semibold text-gray-900 truncate" :class="{ 'font-bold': !email.isRead }">
                        {{ email.subject || '(No Subject)' }}
                      </h4>
                      <span v-if="email.hasAttachments" class="text-gray-400 flex-shrink-0">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                      </span>
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <span class="font-medium text-gray-900">
                        {{ currentFolder === 'SentItems' ? (email.toRecipients?.split(';')[0].trim() || '(No Recipient)') : (email.fromName || email.fromAddress) }}
                      </span>
                      <span class="text-gray-300">•</span>
                      <span class="text-gray-500">{{ formatDate(email.receivedDateTime) }}</span>
                    </div>

                    <p class="text-sm text-gray-500 line-clamp-2">
                      {{ email.bodyPreview }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flat List (Search or Filtered) -->
        <div v-else class="space-y-3">
          <div
            v-for="email in emails"
            :key="email.id"
            @click="openEmail(email.id)"
            class="group bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative overflow-hidden"
            :class="{ 'bg-blue-50/30': !email.isRead }"
          >
            <div v-if="!email.isRead" class="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
            
            <div class="flex justify-between items-start gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1.5">
                  <h4 class="text-base font-semibold text-gray-900 truncate" :class="{ 'font-bold': !email.isRead }">
                    {{ email.subject || '(No Subject)' }}
                  </h4>
                  <span v-if="email.hasAttachments" class="text-gray-400 flex-shrink-0">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </span>
                </div>
                
                <div class="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span class="font-medium text-gray-900">
                    {{ currentFolder === 'SentItems' ? (email.toRecipients?.split(';')[0].trim() || '(No Recipient)') : (email.fromName || email.fromAddress) }}
                  </span>
                  <span class="text-gray-300">•</span>
                  <span class="text-gray-500">{{ formatDate(email.receivedDateTime) }}</span>
                  <span v-if="email.projectName" class="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                    {{ email.projectName }}
                  </span>
                </div>

                <p class="text-sm text-gray-500 line-clamp-2">
                  {{ email.bodyPreview }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center gap-2 mt-8 pb-8">
          <button
            @click="prevPage"
            :disabled="currentPage === 0"
            class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-600"
          >
            Previous
          </button>
          <span class="px-4 py-2 text-gray-700 font-medium text-sm flex items-center">
            {{ currentPage + 1 }} / {{ totalPages }}
          </span>
          <button
            @click="nextPage"
            :disabled="currentPage >= totalPages - 1"
            class="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-gray-600"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Email Detail Modal -->
    <div v-if="selectedEmail" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeEmail">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 bg-white">
          <div class="flex justify-between items-start mb-6">
            <h2 class="text-2xl font-bold text-gray-900 leading-tight">{{ selectedEmail.subject || '(No Subject)' }}</h2>
            <button @click="closeEmail" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                {{ (selectedEmail.fromName || selectedEmail.fromAddress)?.[0]?.toUpperCase() }}
              </div>
              <div>
                <div class="font-semibold text-gray-900">{{ selectedEmail.fromName }}</div>
                <div class="text-sm text-gray-500">{{ selectedEmail.fromAddress }}</div>
              </div>
            </div>
            
            <div class="text-sm text-gray-500">
              {{ formatDateFull(selectedEmail.receivedDateTime) }}
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">
            <div class="flex gap-2">
              <span class="font-medium text-gray-500">To:</span>
              <span>{{ selectedEmail.toRecipients }}</span>
            </div>
            <div v-if="selectedEmail.ccRecipients" class="flex gap-2 border-l border-gray-300 pl-2 ml-2">
              <span class="font-medium text-gray-500">CC:</span>
              <span>{{ selectedEmail.ccRecipients }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 mt-6">
            <button
              @click="toggleReadStatus"
              class="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-sm font-medium shadow-sm"
            >
              {{ selectedEmail.isRead ? 'Mark as Unread' : 'Mark as Read' }}
            </button>
            
            <div class="relative">
              <select
                v-model="selectedProjectId"
                @change="assignProject"
                class="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm min-w-[200px] appearance-none bg-white pr-8"
                :class="selectedEmail.projectId ? 'border-blue-200 bg-blue-50 text-blue-700' : 'text-gray-700'"
              >
                <option :value="null">{{ selectedEmail.projectId ? 'Unassign Project' : 'Assign Project' }}</option>
                <option v-for="project in projects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>

            <button
              @click="deleteEmail"
              class="px-4 py-2 bg-red-50 text-red-600 border border-transparent rounded-xl hover:bg-red-100 transition text-sm font-medium ml-auto"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-8 bg-white">
          <div
            v-if="isHtmlContent(selectedEmail)"
            v-html="selectedEmail.body"
            class="prose max-w-none email-body text-gray-800"
          ></div>
          <div
            v-else
            class="whitespace-pre-wrap text-gray-800 font-sans"
          >{{ selectedEmail.body }}</div>
        </div>
      </div>
    </div>

    <!-- Compose Modal -->
    <div v-if="showComposeModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" @click.self="closeComposeModal">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
        <div class="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <h2 class="text-xl font-bold text-gray-900">New Message</h2>
          <button @click="closeComposeModal" class="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-50 rounded-xl transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-8 space-y-5 overflow-y-auto flex-1">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">To</label>
            <input
              v-model="newEmail.to"
              type="text"
              placeholder="recipient@example.com"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">CC</label>
            <input
              v-model="newEmail.cc"
              type="text"
              placeholder="cc@example.com"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            >
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              v-model="newEmail.subject"
              type="text"
              placeholder="Subject"
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white font-medium"
            >
          </div>

          <div class="flex-1">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <textarea
              v-model="newEmail.body"
              rows="12"
              placeholder="Write your message here..."
              class="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white resize-y"
            ></textarea>
          </div>
        </div>

        <div class="px-8 py-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-3xl">
          <button
            @click="closeComposeModal"
            class="px-6 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium shadow-sm"
          >
            Discard
          </button>
          <button
            @click="sendNewEmail"
            :disabled="sending"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm shadow-blue-200 disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="sending" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ sending ? 'Sending...' : 'Send Message' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Auth Modal -->
    <div v-if="showAuthModal" class="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50" @click.self="closeAuthModal">
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
        <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Connect Outlook</h2>
        <p class="text-gray-500 mb-8">Enter the code below to verify your account</p>

        <div v-if="deviceCode" class="space-y-6">
          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <p class="text-4xl font-mono font-bold text-blue-600 tracking-wider">{{ deviceCode.userCode }}</p>
          </div>
          <button
            @click="openAuthPage"
            class="w-full px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium shadow-sm shadow-blue-200"
          >
            Open Verification Page
          </button>
          <p class="text-sm text-gray-400">
            Expires in {{ Math.floor(authTimeout / 60) }}:{{ (authTimeout % 60).toString().padStart(2, '0') }}
          </p>
        </div>

        <div v-else class="py-8">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-gray-500 mt-4">Initializing...</p>
        </div>

        <button
          @click="closeAuthModal"
          class="mt-6 text-gray-500 hover:text-gray-700 font-medium text-sm"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Floating Chat Button -->
    <button
      v-if="!showChatPanel"
      @click="showChatPanel = true"
      class="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all flex items-center justify-center z-40 active:scale-95"
      title="AI Mail Agent"
    >
      <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    </button>

    <!-- Chat Panel -->
    <transition name="slide-left">
      <div
        v-if="showChatPanel"
        class="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl flex flex-col border-l border-gray-200 z-40"
      >
        <!-- Chat Header -->
        <div class="p-4 bg-blue-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="font-bold text-lg">AI Assistant</h3>
          </div>
          <button @click="showChatPanel = false" class="text-white/80 hover:text-white transition p-1 rounded-lg hover:bg-white/10">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          <div v-for="(msg, idx) in chatMessages" :key="idx">
            <!-- User Message -->
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow-sm text-sm">
                {{ msg.content }}
              </div>
            </div>

            <!-- AI Response -->
            <div v-else class="flex justify-start">
              <div class="bg-white text-gray-800 rounded-2xl rounded-tl-none px-4 py-3 max-w-[90%] shadow-sm border border-gray-100 text-sm">
                <div v-if="msg.queryType !== 'draft' && msg.queryType !== 'translate'" class="whitespace-pre-wrap">{{ msg.content }}</div>

                <!-- Draft Result -->
                <div v-if="msg.queryType === 'draft' && msg.emailDraft" class="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
                  <div class="text-xs text-blue-700 font-bold mb-2 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    Draft Generated
                  </div>
                  <div class="space-y-2">
                    <div v-if="msg.subject" class="text-sm">
                      <span class="font-semibold text-gray-700">Subject:</span>
                      <span class="ml-2 text-gray-900">{{ msg.subject }}</span>
                    </div>
                    <div class="border-t border-blue-100 pt-2">
                      <div class="text-gray-800 whitespace-pre-wrap font-sans">{{ msg.emailDraft }}</div>
                    </div>
                  </div>
                </div>

                <!-- Translation Result -->
                <div v-if="msg.queryType === 'translate' && msg.translatedEmail" class="bg-green-50 border border-green-100 rounded-xl p-3 mt-2">
                  <div class="text-xs text-green-700 font-bold mb-2 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" /></svg>
                    Translation
                  </div>
                  <div class="text-gray-800 whitespace-pre-wrap font-sans">{{ msg.translatedEmail }}</div>
                </div>

                <!-- Search Results -->
                <div v-if="msg.searchResults && msg.searchResults.length > 0" class="mt-3 space-y-2">
                  <div class="text-xs text-gray-500 font-semibold uppercase tracking-wider">Found {{ msg.searchResults.length }} emails</div>
                  <div
                    v-for="result in msg.searchResults"
                    :key="result.email_id"
                    @click="openEmailFromChat(result.email_id)"
                    class="bg-gray-50 border border-gray-200 rounded-lg p-2.5 hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition text-xs"
                  >
                    <div class="font-semibold text-gray-900 truncate">{{ result.subject }}</div>
                    <div class="text-gray-600 mt-0.5">{{ result.from_name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading Indicator -->
          <div v-if="chatLoading" class="flex justify-start">
            <div class="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm border border-gray-100">
              <div class="flex gap-1.5">
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-white border-t border-gray-200">
          <div class="flex gap-2">
            <input
              v-model="chatInput"
              @keyup.enter="sendChatMessage"
              type="text"
              placeholder="Ask me anything..."
              class="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-all"
            >
            <button
              @click="sendChatMessage"
              :disabled="!chatInput.trim() || chatLoading"
              class="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import api from '@/services/api'

// State
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

// Auth Modal
const showAuthModal = ref(false)
const deviceCode = ref(null)
const authTimeout = ref(900) // 15 min
let authCheckInterval = null
let authTimeoutInterval = null

// Compose Modal
const showComposeModal = ref(false)
const sending = ref(false)
const newEmail = ref({
  to: '',
  cc: '',
  subject: '',
  body: ''
})

// Chat State
const showChatPanel = ref(false)
const chatMessages = ref([])
const chatInput = ref('')
const chatLoading = ref(false)

// Helper: Detect HTML Content
const isHtmlContent = (email) => {
  if (!email || !email.body) return false
  if (email.bodyType && (email.bodyType.toUpperCase() === 'HTML' || email.bodyType.toLowerCase() === 'html')) {
    return true
  }
  const htmlTagPattern = /<(html|body|div|p|span|br|table|tr|td|a|img|h1|h2|h3|h4|h5|h6|ul|ol|li)/i
  return htmlTagPattern.test(email.body)
}

// Helper: Format Date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  } else if (diffDays === 1) {
    return 'Yesterday'
  } else if (diffDays < 7) {
    return `${diffDays} days ago`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const formatDateFull = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Auth Status Check
const checkAuthStatus = async () => {
  try {
    const response = await api.get('/outlook/auth/status')
    if (response.data && response.data.data) {
      authStatus.value = response.data.data
    } else if (response.data) {
      authStatus.value = response.data
    }
  } catch (error) {
    console.error('Failed to check auth status:', error)
    authStatus.value = { isConnected: false, outlookEmail: null }
  }
}

// Click Outside Profile Menu
const handleClickOutside = (event) => {
  if (showProfileMenu.value && !event.target.closest('.relative')) {
    showProfileMenu.value = false
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('click', handleClickOutside)
}

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

const openAuthPage = () => {
  if (!deviceCode.value?.verificationUri) {
    alert('Failed to load verification info. Please try again.')
    return
  }

  const width = 600
  const height = 700
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2

  const authWindow = window.open(
    deviceCode.value.verificationUri,
    'OutlookAuth',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  )

  if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
    alert('Popup blocked. Please allow popups for this site.')
  }
}

const connectOutlook = async () => {
  showAuthModal.value = true
  deviceCode.value = null
  authTimeout.value = 900

  try {
    const response = await api.post('/outlook/auth/initiate')
    deviceCode.value = response.data.data

    authCheckInterval = setInterval(async () => {
      const status = await checkAuthComplete()
      if (status) {
        closeAuthModal()
        await checkAuthStatus()
        await loadEmails()
        await generateAllEmbeddings()
      }
    }, 5000)

    authTimeoutInterval = setInterval(() => {
      authTimeout.value--
      if (authTimeout.value <= 0) {
        closeAuthModal()
        alert('Verification timed out. Please try again.')
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to initiate Outlook connection:', error)
    closeAuthModal()
  }
}

const checkAuthComplete = async () => {
  try {
    const response = await api.get('/outlook/auth/status')
    return response.data.data.isConnected
  } catch (error) {
    return false
  }
}

const disconnectOutlook = async () => {
  showProfileMenu.value = false
  if (!confirm('Are you sure you want to disconnect Outlook?')) return

  try {
    await api.post('/outlook/auth/disconnect')
    authStatus.value = { isConnected: false, outlookEmail: null }
    emails.value = []
    alert('Disconnected successfully.')
  } catch (error) {
    console.error('Failed to disconnect:', error)
    alert('Failed to disconnect.')
  }
}

const syncMails = async () => {
  syncing.value = true
  try {
    await api.post('/outlook/sync')
    await loadEmails()
    alert('Sync completed.')
    await generateAllEmbeddings()
  } catch (error) {
    console.error('Sync failed:', error)
    alert('Sync failed.')
  } finally {
    syncing.value = false
  }
}

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

    await loadUnreadCount()
  } catch (error) {
    console.error('Failed to load emails:', error)
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await api.get('/emails/unread/count')
    unreadCount.value = response.data.data
  } catch (error) {
    console.error('Failed to load unread count:', error)
  }
}

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
    console.error('Search failed:', error)
  } finally {
    loading.value = false
  }
}

const selectFolder = (folder) => {
  currentFolder.value = folder
  currentPage.value = 0
  loadEmails()
}

const onProjectChange = () => {
  currentPage.value = 0
  loadEmails()
}

const groupedEmails = computed(() => {
  const groups = {}
  emails.value.forEach(email => {
    const projectId = email.projectId || 'unassigned'
    if (!groups[projectId]) {
      groups[projectId] = {
        projectId: email.projectId,
        projectName: email.projectName || 'Unassigned',
        emails: []
      }
    }
    groups[projectId].emails.push(email)
  })

  const groupArray = Object.values(groups)
  return groupArray.sort((a, b) => {
    if (a.projectId === null) return 1
    if (b.projectId === null) return -1
    return a.projectName.localeCompare(b.projectName)
  })
})

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

const openEmail = async (emailId) => {
  try {
    const response = await api.get(`/emails/${emailId}`)
    selectedEmail.value = response.data.data
    selectedProjectId.value = selectedEmail.value.projectId

    if (!selectedEmail.value.isRead) {
      await api.put(`/emails/${emailId}/read`, { isRead: true })
      await loadEmails()
    }
  } catch (error) {
    console.error('Failed to open email:', error)
  }
}

const closeEmail = () => {
  selectedEmail.value = null
  selectedProjectId.value = null
}

const toggleReadStatus = async () => {
  try {
    await api.put(`/emails/${selectedEmail.value.id}/read`, {
      isRead: !selectedEmail.value.isRead
    })
    selectedEmail.value.isRead = !selectedEmail.value.isRead
    await loadEmails()
  } catch (error) {
    console.error('Failed to toggle read status:', error)
    alert('Failed to update status.')
  }
}

const assignProject = async () => {
  try {
    await api.put(`/emails/${selectedEmail.value.id}/project`, {
      projectId: selectedProjectId.value
    })

    const project = projects.value.find(p => p.id === selectedProjectId.value)
    selectedEmail.value.projectId = selectedProjectId.value
    selectedEmail.value.projectName = project ? project.name : null

    await loadEmails()
  } catch (error) {
    console.error('Failed to assign project:', error)
    alert('Failed to assign project.')
  }
}

const deleteEmail = async () => {
  if (!confirm('Are you sure you want to delete this email?')) return

  try {
    await api.delete(`/emails/${selectedEmail.value.id}`)
    closeEmail()
    await loadEmails()
  } catch (error) {
    console.error('Failed to delete email:', error)
    alert('Failed to delete email.')
  }
}

const loadProjects = async () => {
  try {
    const response = await api.get('/projects')
    projects.value = response.data.data.content || response.data.data
  } catch (error) {
    console.error('Failed to load projects:', error)
  }
}

const openComposeModal = () => {
  showComposeModal.value = true
  newEmail.value = { to: '', cc: '', subject: '', body: '' }
}

const closeComposeModal = () => {
  showComposeModal.value = false
  newEmail.value = { to: '', cc: '', subject: '', body: '' }
}

const sendNewEmail = async () => {
  if (!newEmail.value.to.trim()) {
    alert('Please enter a recipient.')
    return
  }
  if (!newEmail.value.subject.trim()) {
    alert('Please enter a subject.')
    return
  }
  if (!newEmail.value.body.trim()) {
    alert('Please enter a message.')
    return
  }

  sending.value = true
  try {
    const toRecipients = newEmail.value.to.split(',').map(email => email.trim()).filter(email => email)
    const ccRecipients = newEmail.value.cc ? newEmail.value.cc.split(',').map(email => email.trim()).filter(email => email) : []

    await api.post('/emails/send', {
      toRecipients,
      ccRecipients,
      subject: newEmail.value.subject,
      body: newEmail.value.body,
      bodyType: 'Text'
    })

    alert('Email sent successfully.')
    closeComposeModal()

    currentFolder.value = 'SentItems'
    await syncMails()
    await loadEmails()
  } catch (error) {
    console.error('Failed to send email:', error)
    alert('Failed to send email: ' + (error.response?.data?.message || error.message))
  } finally {
    sending.value = false
  }
}

const sendChatMessage = async () => {
  if (!chatInput.value.trim()) return

  const userMessage = chatInput.value.trim()
  chatInput.value = ''

  chatMessages.value.push({
    role: 'user',
    content: userMessage
  })

  chatLoading.value = true

  try {
    const userStr = localStorage.getItem('user')
    const userId = userStr ? JSON.parse(userStr).id : null

    if (!userId) {
      throw new Error('User info not found. Please log in again.')
    }

    const response = await fetch('http://localhost:8000/api/ai/mail/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        user_id: userId,
        conversation_history: chatMessages.value
          .filter(msg => msg.role !== 'system')
          .map(msg => ({ role: msg.role, content: msg.content }))
      })
    })

    const data = await response.json()

    chatMessages.value.push({
      role: 'assistant',
      content: data.answer,
      queryType: data.query_type,
      searchResults: data.search_results,
      emailDraft: data.email_draft,
      subject: data.subject,
      translatedEmail: data.translated_email,
      ragSections: data.rag_sections
    })
  } catch (error) {
    console.error('Chat API failed:', error)
    chatMessages.value.push({
      role: 'assistant',
      content: 'Sorry, an error occurred. Please try again.'
    })
  } finally {
    chatLoading.value = false
  }
}

const openEmailFromChat = async (emailId) => {
  await openEmail(emailId)
}

const generateAllEmbeddings = async () => {
  const userStr = localStorage.getItem('user')
  const userId = userStr ? JSON.parse(userStr).id : null

  if (!userId) {
    console.error('User ID not found')
    return
  }

  embedding.value = true
  try {
    const response = await fetch('http://localhost:8000/api/ai/mail/embeddings/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    })

    const data = await response.json()
    console.log('Embeddings generated:', data)
  } catch (error) {
    console.error('Failed to generate embeddings:', error)
  } finally {
    embedding.value = false
  }
}

onMounted(async () => {
  await checkAuthStatus()
  await loadProjects()
  if (authStatus.value.isConnected) {
    await loadEmails()
  }
})

onBeforeUnmount(() => {
  if (authCheckInterval) clearInterval(authCheckInterval)
  if (authTimeoutInterval) clearInterval(authTimeoutInterval)
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
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
  border: 1px solid #e5e7eb;
  padding: 8px;
}

.email-body :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.email-body :deep(a:hover) {
  color: #1d4ed8;
}

.email-body :deep(p) {
  margin-bottom: 1em;
}

.email-body :deep(ul),
.email-body :deep(ol) {
  margin-left: 1.5em;
  margin-bottom: 1em;
}

.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(100%);
}
</style>