<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">메일 작성</span>
      </div>
    </div>

    <!-- Mail Compose -->
    <div class="p-6">
      <!-- To field -->
      <div class="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
        <span class="text-sm text-gray-400 w-12">To:</span>
        <span class="text-sm text-gray-800">john.smith@company.com</span>
      </div>

      <!-- Subject field -->
      <div class="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <span class="text-sm text-gray-400 w-12">제목:</span>
        <span class="text-sm text-gray-800">{{ displayedSubject }}</span>
        <span v-if="isTypingSubject" class="inline-block w-0.5 h-4 bg-gray-800 animate-blink"></span>
      </div>

      <!-- Mail body -->
      <div class="min-h-[140px] text-sm text-gray-800 leading-relaxed">
        <p v-html="displayedBody"></p>
        <span v-if="isTypingBody" class="inline-block w-0.5 h-4 bg-gray-800 animate-blink"></span>
      </div>

      <!-- AI suggestion -->
      <div v-if="showSuggestion" class="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-xl animate-fade-in">
        <div class="flex items-start gap-2">
          <svg class="w-5 h-5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <div>
            <p class="text-xs text-purple-600 font-medium mb-1">AI 제안</p>
            <p class="text-sm text-purple-800">더 공손한 표현: "I would be grateful if you could..."</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  }
})

const fullSubject = 'Meeting Request for Project Discussion'
const fullBody = `Dear Mr. Smith,<br><br>I hope this email finds you well.<br><br>I am writing to request a meeting to discuss our upcoming project collaboration. Would you be available next Tuesday at 2:00 PM?<br><br>Best regards,<br>Kim`

const displayedSubject = ref('')
const displayedBody = ref('')
const isTypingSubject = ref(false)
const isTypingBody = ref(false)
const showSuggestion = ref(false)

let animationTimeout = null

const startAnimation = () => {
  displayedSubject.value = ''
  displayedBody.value = ''
  isTypingSubject.value = true
  isTypingBody.value = false
  showSuggestion.value = false

  // Type subject
  let subjectIndex = 0
  const typeSubject = setInterval(() => {
    if (subjectIndex < fullSubject.length) {
      displayedSubject.value = fullSubject.slice(0, subjectIndex + 1)
      subjectIndex++
    } else {
      clearInterval(typeSubject)
      isTypingSubject.value = false
      isTypingBody.value = true

      // Type body
      let bodyIndex = 0
      const typeBody = setInterval(() => {
        if (bodyIndex < fullBody.length) {
          // Handle HTML tags
          if (fullBody[bodyIndex] === '<') {
            const tagEnd = fullBody.indexOf('>', bodyIndex)
            displayedBody.value = fullBody.slice(0, tagEnd + 1)
            bodyIndex = tagEnd + 1
          } else {
            displayedBody.value = fullBody.slice(0, bodyIndex + 1)
            bodyIndex++
          }
        } else {
          clearInterval(typeBody)
          isTypingBody.value = false
          showSuggestion.value = true

          // Restart animation
          animationTimeout = setTimeout(startAnimation, 5000)
        }
      }, 20)
    }
  }, 40)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationTimeout) clearTimeout(animationTimeout)
})
</script>

<style scoped>
.animate-blink {
  animation: blink 0.8s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
