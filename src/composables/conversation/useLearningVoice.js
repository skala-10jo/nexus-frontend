/**
 * Learning Mode 음성 녹음 및 발음 평가 Composable
 *
 * AI 스피킹 튜터의 학습모드에서 사용자의 발음을 녹음하고
 * Azure Speech Service를 통해 발음 평가를 수행합니다.
 *
 * Features:
 * - 실시간 음성 녹음 (useRealtimeSTT 기반)
 * - Azure Pronunciation Assessment 연동
 * - 음소(Phoneme) 단위 발음 평가
 * - 단어(Word) 단위 발음 평가
 * - 유창성, 완성도, 운율 평가
 *
 * @module useLearningVoice
 */
import { ref, computed } from 'vue'
import { useRealtimeSTT } from '@/composables/useRealtimeSTT'
import pronunciationService from '@/services/pronunciationService'

/**
 * Learning Mode 음성 입력 및 발음 평가 로직
 *
 * @returns {Object} 음성 녹음 및 발음 평가 상태/메서드
 */
export function useLearningVoice() {
  // ============================================
  // Realtime STT Composable (음성 녹음 + STT)
  // ============================================
  const {
    isRecording: sttIsRecording,
    isConnecting: sttIsConnecting,
    isConnected: sttIsConnected,
    error: sttError,
    interimText: sttInterimText,
    finalTexts: sttFinalTexts,
    fullText: sttFullText,
    recordingTime: sttRecordingTime,
    audioBlob: sttAudioBlob,
    startRecording: startRealtimeSTT,
    stopRecording: stopRealtimeSTT,
    clearResults: clearSTTResults
  } = useRealtimeSTT()

  // ============================================
  // State
  // ============================================

  // 녹음 상태
  const isRecording = computed(() => sttIsRecording.value)
  const isConnecting = computed(() => sttIsConnecting.value)
  const recordingTime = computed(() => sttRecordingTime.value)
  const interimText = computed(() => sttInterimText.value)
  const recognizedText = ref('')

  // 발음 평가 상태
  const isAssessing = ref(false)
  const assessmentResult = ref(null)
  const assessmentError = ref(null)
  const formattedFeedback = ref(null)

  // ============================================
  // Actions
  // ============================================

  /**
   * 녹음 시작
   *
   * @param {string} language - 언어 코드 (기본값: en-US)
   */
  const startRecording = async (language = 'en-US') => {
    try {
      // 상태 초기화
      recognizedText.value = ''
      assessmentResult.value = null
      assessmentError.value = null
      formattedFeedback.value = null
      clearSTTResults()

      // 실시간 STT 시작 (영어 기본, 한국어 보조)
      const secondaryLang = language.startsWith('ko') ? 'en-US' : 'ko-KR'
      await startRealtimeSTT(language, secondaryLang)

      console.log('🎙️ Learning mode recording started')
    } catch (err) {
      console.error('Failed to start recording:', err)
      assessmentError.value = sttError.value || '마이크 권한을 허용해주세요.'
      throw err
    }
  }

  /**
   * 녹음 중지 및 발음 평가 수행
   *
   * @param {string} referenceText - 평가 기준 텍스트 (사용자가 읽어야 할 문장)
   * @param {string} language - 언어 코드 (기본값: en-US)
   * @returns {Promise<Object>} 발음 평가 결과
   */
  const stopRecordingAndAssess = async (referenceText, language = 'en-US') => {
    try {
      // 녹음 중지 및 오디오 가져오기
      const result = stopRealtimeSTT()

      let fullText = ''
      let audioBlob = null

      if (result && typeof result === 'object') {
        fullText = result.text || ''
        audioBlob = result.audioBlob || null
      } else if (typeof result === 'string') {
        fullText = result
      }

      recognizedText.value = fullText
      console.log('⏹️ Recording stopped, recognized text:', fullText)

      // 오디오가 없으면 평가 불가
      if (!audioBlob) {
        assessmentError.value = '녹음된 오디오가 없습니다.'
        return null
      }

      // 참조 텍스트가 없으면 평가 불가
      if (!referenceText || referenceText.trim().length === 0) {
        assessmentError.value = '평가할 참조 텍스트가 없습니다.'
        return null
      }

      // 발음 평가 시작
      isAssessing.value = true
      assessmentError.value = null

      console.log('📊 Starting pronunciation assessment...')
      console.log('📝 Reference text:', referenceText)
      console.log('🎤 Audio blob size:', audioBlob.size, 'bytes')

      // Azure Speech 발음 평가 호출
      const assessment = await pronunciationService.assessPronunciation(
        audioBlob,
        referenceText,
        language,
        'Phoneme' // 음소 단위까지 평가
      )

      assessmentResult.value = assessment

      // 한글 피드백 생성
      formattedFeedback.value = pronunciationService.formatFeedbackKorean(assessment)

      console.log('✅ Pronunciation assessment completed:', {
        score: assessment.pronunciation_score,
        accuracy: assessment.accuracy_score,
        fluency: assessment.fluency_score
      })

      return assessment

    } catch (err) {
      console.error('❌ Pronunciation assessment failed:', err)
      assessmentError.value = err.message || '발음 평가 실패'
      return null
    } finally {
      isAssessing.value = false
    }
  }

  /**
   * 녹음만 중지 (발음 평가 없이)
   *
   * @returns {Object} { text, audioBlob }
   */
  const stopRecordingOnly = () => {
    const result = stopRealtimeSTT()

    let fullText = ''
    let audioBlob = null

    if (result && typeof result === 'object') {
      fullText = result.text || ''
      audioBlob = result.audioBlob || null
    } else if (typeof result === 'string') {
      fullText = result
    }

    recognizedText.value = fullText
    return { text: fullText, audioBlob }
  }

  /**
   * 상태 초기화
   */
  const resetState = () => {
    recognizedText.value = ''
    assessmentResult.value = null
    assessmentError.value = null
    formattedFeedback.value = null
    clearSTTResults()
  }

  /**
   * 점수 색상 가져오기 (UI용)
   *
   * @param {number} score - 0-100 점수
   * @returns {string} CSS 색상
   */
  const getScoreColor = (score) => {
    return pronunciationService.getScoreColor(score)
  }

  /**
   * 점수 등급 가져오기 (UI용)
   *
   * @param {number} score - 0-100 점수
   * @returns {string} 등급 (A+, A, B, C, D, F)
   */
  const getScoreGrade = (score) => {
    return pronunciationService.getScoreGrade(score)
  }

  /**
   * 점수에 따른 Tailwind CSS 클래스
   *
   * @param {number} score - 0-100 점수
   * @returns {string} Tailwind CSS 클래스
   */
  const getScoreBgClass = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700'
    if (score >= 80) return 'bg-blue-100 text-blue-700'
    if (score >= 70) return 'bg-yellow-100 text-yellow-700'
    if (score >= 60) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  /**
   * 단어 점수에 따른 Tailwind CSS 클래스
   *
   * @param {number} score - 0-100 점수
   * @returns {string} Tailwind CSS 클래스
   */
  const getWordScoreClass = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  // ============================================
  // Return
  // ============================================
  return {
    // 녹음 상태
    isRecording,
    isConnecting,
    recordingTime,
    interimText,
    recognizedText,

    // 발음 평가 상태
    isAssessing,
    assessmentResult,
    assessmentError,
    formattedFeedback,

    // 액션
    startRecording,
    stopRecordingAndAssess,
    stopRecordingOnly,
    resetState,

    // 유틸리티
    getScoreColor,
    getScoreGrade,
    getScoreBgClass,
    getWordScoreClass
  }
}
