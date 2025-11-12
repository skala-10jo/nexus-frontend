<template>
  <div class="translated-text" v-html="highlightedText"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  detectedTerms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['term-click'])

const highlightedText = computed(() => {
  if (!props.detectedTerms || props.detectedTerms.length === 0) {
    return escapeHtml(props.text)
  }

  // 번역문에서 용어를 찾아서 위치 매핑
  const termPositions = []
  const textLower = props.text.toLowerCase()

  props.detectedTerms.forEach((term, index) => {
    // 영어 용어가 있으면 번역문에서 찾기
    const searchTerm = term.englishTerm || term.vietnameseTerm || term.matchedText
    if (!searchTerm) return

    const searchLower = searchTerm.toLowerCase()
    let searchIndex = 0

    // 같은 용어가 여러 번 나올 수 있으므로 모든 위치 찾기
    while (searchIndex < textLower.length) {
      const foundIndex = textLower.indexOf(searchLower, searchIndex)
      if (foundIndex === -1) break

      termPositions.push({
        start: foundIndex,
        end: foundIndex + searchTerm.length,
        term,
        index
      })

      searchIndex = foundIndex + 1
    }
  })

  // 시작 위치 기준으로 정렬
  termPositions.sort((a, b) => a.start - b.start)

  // 중복 제거 (겹치는 영역 제거)
  const uniquePositions = []
  let lastEnd = 0
  for (const pos of termPositions) {
    if (pos.start >= lastEnd) {
      uniquePositions.push(pos)
      lastEnd = pos.end
    }
  }

  // HTML 생성
  let result = ''
  let lastIndex = 0

  uniquePositions.forEach(({ start, end, term, index }) => {
    // 이전 위치부터 현재 용어 시작까지의 일반 텍스트
    if (start > lastIndex) {
      result += escapeHtml(props.text.substring(lastIndex, start))
    }

    // 용어 하이라이트
    const termText = props.text.substring(start, end)
    const termData = encodeURIComponent(JSON.stringify(term))

    result += `<mark
      class="term-highlight"
      data-term="${termData}"
      data-term-id="${term.glossaryTermId || ''}"
      onclick="window.handleTermClick(${index})"
      style="cursor: pointer;"
      title="${escapeHtml(term.koreanTerm)} - ${escapeHtml(term.definition || '정의 없음')}"
    >${escapeHtml(termText)}</mark>`

    lastIndex = end
  })

  // 마지막 용어 이후 남은 텍스트
  if (lastIndex < props.text.length) {
    result += escapeHtml(props.text.substring(lastIndex))
  }

  return result
})

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

// 전역 이벤트 핸들러 등록
if (typeof window !== 'undefined') {
  window.handleTermClick = (index) => {
    if (props.detectedTerms[index]) {
      emit('term-click', props.detectedTerms[index])
    }
  }
}
</script>

<style scoped>
.translated-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.translated-text :deep(mark.term-highlight) {
  background-color: #FEF3C7;
  border-bottom: 2px solid #F59E0B;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: highlightFadeIn 0.3s ease-out;
}

.translated-text :deep(mark.term-highlight:hover) {
  background-color: #FDE68A;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
  transform: translateY(-1px);
}

@keyframes highlightFadeIn {
  from {
    background-color: transparent;
    border-bottom-color: transparent;
  }
  to {
    background-color: #FEF3C7;
    border-bottom-color: #F59E0B;
  }
}
</style>
