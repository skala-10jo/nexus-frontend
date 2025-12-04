/**
 * Practice 대화 관리 Composable
 *
 * 회화 연습 페이지의 메시지 관리 및 대화 로직을 담당합니다.
 * - 메시지 송수신
 * - 번역 기능
 * - 용어 탐지
 * - 대화 초기화
 *
 * @module usePracticeConversation
 */
import { ref, computed, nextTick } from 'vue'
import conversationService from '@/services/conversationService'

/**
 * Blob을 Base64 문자열로 변환
 *
 * @param {Blob} blob - 변환할 Blob
 * @returns {Promise<string>} Base64 문자열
 */
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Practice 대화 로직
 *
 * @param {Object} options - 옵션
 * @param {Ref<Object>} options.scenario - 시나리오 ref
 * @param {Function} options.onFeedbackReceived - 피드백 수신 콜백
 * @param {Function} options.getAudioBlob - 오디오 blob 가져오기 콜백 (음성 모드에서 발음 평가용)
 * @param {Ref<string>} options.userInput - 외부에서 전달받은 userInput ref (선택)
 * @returns {Object} 대화 상태 및 메서드
 */
export function usePracticeConversation({ scenario, onFeedbackReceived, getAudioBlob, userInput: externalUserInput }) {
  // ============================================
  // State
  // ============================================
  const messages = ref([])
  const detectedTerms = ref([])
  // 외부에서 userInput이 전달되면 그것을 사용, 아니면 내부에서 생성
  const userInput = externalUserInput || ref('')
  const isLoading = ref(false)
  const translationLoading = ref({})
  const hintLoading = ref({}) // Added
  const conversationArea = ref(null)

  // ============================================
  // Computed
  // ============================================

  /**
   * 사용자 메시지만 필터링
   */
  const userMessages = computed(() =>
    messages.value.filter(msg => msg.speaker === 'user')
  )

  /**
   * 시나리오에서 필수 용어 추출
   */
  const requiredTerms = computed(() => {
    return scenario.value?.requiredTerms || []
  })

  /**
   * 마지막 AI 메시지 (Avatar TTS용)
   */
  const lastAiMessage = computed(() => {
    const aiMessages = messages.value.filter(m => m.speaker === 'ai')
    return aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].message : ''
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 메시지 전송
   *
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise<void>}
   */
  const sendMessage = async (scenarioId) => {
    if (!userInput.value.trim() || isLoading.value) return

    const message = userInput.value.trim()
    userInput.value = ''

    try {
      isLoading.value = true

      // 사용자 메시지 추가
      messages.value.push({
        speaker: 'user',
        message,
        timestamp: new Date()
      })

      await nextTick()
      scrollToBottom()

      // 대화 히스토리 구성
      const history = messages.value.slice(0, -1).map(msg => ({
        speaker: msg.speaker,
        message: msg.message
      }))

      // API 호출
      const response = await conversationService.sendMessage(scenarioId, message, history)

      // 용어 탐지 업데이트
      if (response.detectedTerms?.length) {
        detectedTerms.value = [...new Set([...detectedTerms.value, ...response.detectedTerms])]
      }

      // AI 응답 추가
      messages.value.push({
        speaker: 'ai',
        message: response.aiMessage,
        timestamp: new Date()
      })

      isLoading.value = false
      await nextTick()
      scrollToBottom()

      // 피드백 요청 (음성 모드일 경우 오디오 데이터 포함)
      try {
        let audioData = null

        // 오디오 blob이 있으면 Base64로 변환
        if (getAudioBlob) {
          const audioBlob = getAudioBlob()
          if (audioBlob) {
            try {
              audioData = await blobToBase64(audioBlob)
              console.log('🎤 Audio data prepared for pronunciation assessment:', audioData.length, 'chars')
            } catch (audioErr) {
              console.warn('Failed to convert audio to Base64:', audioErr)
            }
          }
        }

        const feedbackResponse = await conversationService.getFeedback(
          scenarioId,
          message,
          response.detectedTerms || [],
          audioData
        )

        if (onFeedbackReceived) {
          onFeedbackReceived(feedbackResponse.feedback)
        }
      } catch (e) {
        console.error('Feedback request failed:', e)
        // 피드백 실패 시 기본 피드백
        if (onFeedbackReceived) {
          onFeedbackReceived({
            score: 7,
            grammar_corrections: [],
            terminology_usage: { used: [], missed: [], feedback: '피드백을 생성하지 못했습니다.' },
            suggestions: ['다시 시도해주세요.'],
            score_breakdown: { grammar: 7, vocabulary: 7, fluency: 7 }
          })
        }
      }
    } catch (err) {
      console.error('Send message error:', err)
      messages.value.pop()
      isLoading.value = false
      throw err
    }
  }

  /**
   * 번역 토글
   *
   * @param {number} index - 메시지 인덱스
   */
  const toggleTranslation = async (index) => {
    const msg = messages.value[index]

    if (msg.showTranslation) {
      msg.showTranslation = false
      return
    }

    if (msg.translatedText) {
      msg.showTranslation = true
      return
    }

    translationLoading.value[index] = true

    try {
      const response = await conversationService.translateMessage(msg.message, 'ko')
      msg.translatedText = response.translatedText
      msg.showTranslation = true
    } catch (err) {
      console.error('Translation failed:', err)
      msg.translatedText = '[번역 실패] ' + msg.message
      msg.showTranslation = true
    } finally {
      translationLoading.value[index] = false
    }
  }

  /**
   * 힌트 토글
   * 시나리오 맥락과 대화 히스토리를 기반으로 맥락에 맞는 힌트를 생성합니다.
   *
   * @param {number} index - 메시지 인덱스
   * @param {string} scenarioId - 시나리오 ID
   */
  const toggleHint = async (index, scenarioId) => {
    const msg = messages.value[index]

    if (msg.showHint) {
      msg.showHint = false
      return
    }

    // 이미 생성된 힌트가 있으면 재사용
    if (msg.hints && msg.hints.length > 0) {
      msg.showHint = true
      return
    }

    hintLoading.value[index] = true

    try {
      // 대화 히스토리 구성 (현재 메시지까지)
      const history = messages.value.slice(0, index + 1).map(m => ({
        speaker: m.speaker,
        message: m.message
      }))

      // 마지막 AI 메시지 찾기
      const lastAiMessage = msg.speaker === 'ai' ? msg.message : ''

      // API 호출
      const response = await conversationService.getHint(
        scenarioId,
        history,
        lastAiMessage,
        3  // 힌트 3개 생성
      )

      if (response.success) {
        // 힌트 정보 저장
        msg.hints = response.hints || []
        msg.hintExplanations = response.hint_explanations || []
        msg.terminologySuggestions = response.terminology_suggestions || []
        msg.showHint = true
      } else {
        console.error('Hint generation failed:', response)
        msg.hints = ['I see what you mean.', 'Could you tell me more?', 'That\'s interesting.']
        msg.showHint = true
      }
    } catch (err) {
      console.error('Hint generation failed:', err)
      // 에러 시 기본 힌트 제공
      msg.hints = ['I understand.', 'Please continue.', 'That makes sense.']
      msg.showHint = true
    } finally {
      hintLoading.value[index] = false
    }
  }

  /**
   * 대화 상태 초기화 (프론트엔드만)
   * 백엔드 세션 삭제는 호출하는 쪽에서 별도로 처리해야 함
   *
   * @returns {void}
   */
  const resetConversation = () => {
    messages.value = []
    detectedTerms.value = []
  }

  /**
   * 히스토리 데이터 로드
   *
   * @param {Object} historyResponse - 히스토리 응답
   */
  const loadHistory = (historyResponse) => {
    messages.value = historyResponse.messages.map(msg => ({
      speaker: msg.sender,
      message: msg.message,
      translatedText: msg.translatedText,
      timestamp: new Date(msg.createdAt),
      showTranslation: false
    }))

    historyResponse.messages.forEach(msg => {
      if (msg.detectedTerms?.length > 0) {
        detectedTerms.value = [...new Set([...detectedTerms.value, ...msg.detectedTerms])]
      }
    })
  }

  /**
   * 초기 AI 메시지 추가
   *
   * @param {string} initialMessage - 초기 메시지
   */
  const addInitialMessage = (initialMessage) => {
    if (initialMessage) {
      messages.value.push({
        speaker: 'ai',
        message: initialMessage,
        timestamp: new Date()
      })
    }
  }

  /**
   * 스크롤을 맨 아래로 이동
   */
  const scrollToBottom = () => {
    if (conversationArea.value) {
      conversationArea.value.scrollTop = conversationArea.value.scrollHeight
    }
  }

  /**
   * 시간 포맷팅
   *
   * @param {Date} date - 날짜
   * @returns {string} 포맷된 시간
   */
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    messages,
    detectedTerms,
    userInput,
    isLoading,
    translationLoading,
    hintLoading, // Added
    conversationArea,

    // Computed
    userMessages,
    requiredTerms,
    lastAiMessage,

    // Actions
    sendMessage,
    toggleTranslation,
    toggleHint, // Added
    resetConversation,
    loadHistory,
    addInitialMessage,
    scrollToBottom,
    formatTime
  }
}
