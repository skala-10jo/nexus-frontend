<template>
  <div class="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
    <!-- Header -->
    <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full bg-red-400"></div>
        <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
        <div class="w-3 h-3 rounded-full bg-green-400"></div>
        <span class="ml-4 text-sm text-gray-500">시나리오 회화</span>
      </div>
    </div>

    <!-- Chat Content -->
    <div class="p-6 h-72 overflow-hidden">
      <div class="space-y-4">
        <div
          v-for="(message, index) in visibleMessages"
          :key="index"
          class="flex animate-fade-up"
          :class="message.isUser ? 'justify-end' : 'justify-start'"
          :style="{ animationDelay: `${index * 0.3}s` }"
        >
          <div
            class="max-w-[80%] px-4 py-3 rounded-2xl"
            :class="message.isUser ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'"
          >
            <p class="text-sm">{{ message.text }}</p>
            <p v-if="message.translation" class="text-xs mt-1 opacity-70">{{ message.translation }}</p>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="flex justify-start animate-fade-up">
          <div class="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
              <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div class="flex items-center gap-3">
        <div class="flex-1 bg-white border border-gray-300 rounded-full px-4 py-2 text-sm text-gray-400">
          메시지를 입력하세요...
        </div>
        <button class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
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

const messages = [
  { text: 'Good morning! How can I help you today?', translation: '좋은 아침이에요! 오늘 무엇을 도와드릴까요?', isUser: false },
  { text: "I'd like to schedule a meeting.", translation: '회의 일정을 잡고 싶습니다.', isUser: true },
  { text: 'Of course! When would be convenient for you?', translation: '물론이죠! 언제가 편하신가요?', isUser: false },
  { text: 'How about tomorrow at 2 PM?', translation: '내일 오후 2시는 어떨까요?', isUser: true }
]

const visibleMessages = ref([])
const isTyping = ref(false)
let animationTimeout = null

const startAnimation = () => {
  visibleMessages.value = []
  let messageIndex = 0

  const showNextMessage = () => {
    if (messageIndex < messages.length) {
      if (!messages[messageIndex].isUser) {
        isTyping.value = true
        animationTimeout = setTimeout(() => {
          isTyping.value = false
          visibleMessages.value.push(messages[messageIndex])
          messageIndex++
          animationTimeout = setTimeout(showNextMessage, 1000)
        }, 1200)
      } else {
        visibleMessages.value.push(messages[messageIndex])
        messageIndex++
        animationTimeout = setTimeout(showNextMessage, 1000)
      }
    } else {
      // Restart after delay
      animationTimeout = setTimeout(startAnimation, 3000)
    }
  }

  animationTimeout = setTimeout(showNextMessage, 500)
}

onMounted(() => {
  if (props.isVisible) {
    startAnimation()
  }
})

onUnmounted(() => {
  if (animationTimeout) {
    clearTimeout(animationTimeout)
  }
})
</script>

<style scoped>
.animate-fade-up {
  animation: fadeUp 0.4s ease-out forwards;
  opacity: 0;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
