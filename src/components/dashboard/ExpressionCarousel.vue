<script setup>
/**
 * Expression Carousel 컴포넌트
 * 
 * 오늘의 비즈니스 표현을 캐러셀 형태로 표시
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  expressions: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()
const currentIndex = ref(0)
let intervalId = null

// 자동 스와이프 (7초마다)
const startAutoSwipe = () => {
  intervalId = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.expressions.length
  }, 7000)
}

const stopAutoSwipe = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

const goToExpression = () => {
  router.push('/conversation/expression')
}

const swipeLeft = () => {
  stopAutoSwipe()
  currentIndex.value = (currentIndex.value - 1 + props.expressions.length) % props.expressions.length
  startAutoSwipe()
}

const swipeRight = () => {
  stopAutoSwipe()
  currentIndex.value = (currentIndex.value + 1) % props.expressions.length
  startAutoSwipe()
}

const currentExpression = computed(() => {
  if (!props.expressions || props.expressions.length === 0) {
    return null
  }
  return props.expressions[currentIndex.value]
})

// Highlight expression in example text
const highlightExpression = (text, expression) => {
  if (!text || !expression) return text

  // 표현 정리: ~, ?, ! 등 끝문자 제거
  let cleanExpression = expression
    .replace(/[~?!.]+$/g, '')  // 끝의 ~, ?, !, . 제거
    .replace(/\(someone\)/gi, '(SOMEONE_PLACEHOLDER)')
    .replace(/\(something\)/gi, '(SOMETHING_PLACEHOLDER)')
    .replace(/\([^)]*\)/g, '(OTHER_PLACEHOLDER)')
    .trim()

  if (!cleanExpression) return text

  // 특수문자 이스케이프
  let escapedExpression = cleanExpression.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // 플레이스홀더를 정규식 패턴으로 변환
  escapedExpression = escapedExpression
    .replace(/\\\(SOMEONE_PLACEHOLDER\\\)/g, '\\w+')
    .replace(/\\\(SOMETHING_PLACEHOLDER\\\)/g, '[\\w\\s]+?')
    .replace(/\\\(OTHER_PLACEHOLDER\\\)/g, '\\w+')

  try {
    // 1차: 전체 표현 매칭 시도
    const fullRegex = new RegExp(`(${escapedExpression})`, 'gi')
    if (fullRegex.test(text)) {
      return text.replace(fullRegex, '<span class="text-blue-700">$1</span>')
    }

    // 2차: 핵심 단어들만 매칭 (the, a, an, is, are, be 등 제외하고 2글자 이상 단어)
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'be', 'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or', 'it', 'this', 'that']
    const words = cleanExpression.split(/\s+/).filter(w =>
      w.length > 2 && !stopWords.includes(w.toLowerCase()) && !w.includes('PLACEHOLDER')
    )

    if (words.length > 0) {
      let result = text
      words.forEach(word => {
        const wordRegex = new RegExp(`(${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        result = result.replace(wordRegex, '<span class="text-blue-600">$1</span>')
      })
      return result
    }

    return text
  } catch (e) {
    // 정규식 에러 시 원본 반환
    return text
  }
}

onMounted(() => {
  if (props.expressions && props.expressions.length > 1) {
    startAutoSwipe()
  }
})

onBeforeUnmount(() => {
  stopAutoSwipe()
})
</script>

<template>
  <div class="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 relative overflow-hidden">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3.5">
      <h3 class="text-base md:text-lg font-bold text-gray-800">오늘의 표현</h3>
      <button 
        @click="goToExpression"
        class="flex items-center gap-1 text-xs md:text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
      >
        <span>표현 공부하러 가기</span>
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Carousel Content -->
    <div v-if="currentExpression" class="relative overflow-hidden select-none">
      <div class="transition-all duration-500 ease-in-out">
        <div class="space-y-3 select-none">
          <!-- 표현 -->
          <div class="bg-gray-50 rounded-xl p-3 select-none text-center">
            <p class="text-lg md:text-xl font-bold mb-1 select-none flex flex-col items-center gap-1 md:flex-row md:justify-center md:gap-2 md:text-left">
              <span class="text-blue-700">{{ currentExpression.expression }}</span>
              <span class="text-gray-900 text-base md:text-lg md:inline-block md:ml-1">'{{ currentExpression.meaning }}'</span>
            </p>
          </div>

          <!-- 예문 -->
          <div class="space-y-2 select-none">
            <p
              class="text-gray-800 text-sm md:text-base leading-relaxed select-none"
              v-html="highlightExpression(currentExpression.example_en, currentExpression.expression)"
            ></p>
            <p class="text-gray-500 text-xs md:text-sm leading-relaxed select-none">
              '{{ currentExpression.example_ko }}'
            </p>
          </div>
        </div>
      </div>

      <!-- Carousel Indicators -->
      <div v-if="expressions.length > 1" class="flex justify-center gap-1.5 mt-3.5">
        <button
          v-for="(_, index) in expressions"
          :key="index"
          @click="currentIndex = index; stopAutoSwipe(); startAutoSwipe()"
          class="transition-all duration-300"
          :class="index === currentIndex 
            ? 'w-6 h-1.5 bg-blue-600 rounded-full' 
            : 'w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400'"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="text-center py-8">
      <p class="text-gray-500 mt-4">표현을 불러오는 중...</p>
    </div>
  </div>
</template>
