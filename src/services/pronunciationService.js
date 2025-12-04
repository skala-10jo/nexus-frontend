/**
 * 발음 평가 서비스 (Pronunciation Assessment Service)
 *
 * Azure Speech Service의 발음 평가 API를 사용하여
 * 사용자의 영어 발음을 음소(Phoneme) 단위까지 분석합니다.
 *
 * 기능:
 * - 발음 정확도 평가 (단어/음소 단위)
 * - 유창성 평가
 * - 완성도 평가
 * - 운율(Prosody) 평가 (강세, 억양)
 */
import { pythonAPI } from './api'

const pronunciationService = {
  /**
   * 발음 평가 수행
   *
   * @param {Blob} audioBlob - 녹음된 오디오 파일 (WAV, PCM, WebM 등)
   * @param {string} referenceText - 평가할 기준 텍스트 (사용자가 읽어야 할 텍스트)
   * @param {string} language - 언어 코드 (예: en-US)
   * @param {string} granularity - 평가 세분화 수준 (Phoneme/Word/FullText, 기본값: Phoneme)
   * @returns {Promise<Object>} 발음 평가 결과
   */
  async assessPronunciation(audioBlob, referenceText, language = 'en-US', granularity = 'Phoneme') {
    try {
      console.log(`📊 발음 평가 시작: "${referenceText.substring(0, 50)}..."`)

      // Blob을 Base64로 변환
      const base64Audio = await this._blobToBase64(audioBlob)

      // 백엔드 API 호출
      const response = await pythonAPI.post('/pronunciation/assess', {
        audio_data: base64Audio,
        reference_text: referenceText,
        language,
        granularity
      })

      if (response.data.success) {
        const result = response.data.data
        console.log('✅ 발음 평가 완료:', {
          score: result.pronunciation_score.toFixed(1),
          accuracy: result.accuracy_score.toFixed(1),
          fluency: result.fluency_score.toFixed(1),
          prosody: result.prosody_score.toFixed(1)
        })
        return result
      } else {
        throw new Error(response.data.message || '발음 평가 실패')
      }
    } catch (error) {
      console.error('❌ 발음 평가 실패:', error)
      throw new Error(error.response?.data?.detail || error.message || '발음 평가 실패')
    }
  },

  /**
   * 발음 평가 결과를 기반으로 사용자 친화적인 피드백 생성
   *
   * @param {Object} assessmentResult - assessPronunciation()에서 반환된 결과
   * @returns {Promise<Object>} 피드백 요약
   */
  async generateFeedback(assessmentResult) {
    try {
      console.log('💬 피드백 생성 중...')

      const response = await pythonAPI.post('/pronunciation/feedback', assessmentResult)

      if (response.data.success) {
        const feedback = response.data.data
        console.log('✅ 피드백 생성 완료:', feedback.feedback_message)
        return feedback
      } else {
        throw new Error(response.data.message || '피드백 생성 실패')
      }
    } catch (error) {
      console.error('❌ 피드백 생성 실패:', error)
      throw new Error(error.response?.data?.detail || error.message || '피드백 생성 실패')
    }
  },

  /**
   * 지원하는 언어 목록 조회
   *
   * @returns {Promise<Array>} 지원 언어 목록
   */
  async getSupportedLanguages() {
    try {
      const response = await pythonAPI.get('/pronunciation/languages')

      if (response.data.success) {
        return response.data.data.languages
      } else {
        throw new Error(response.data.message || '언어 목록 조회 실패')
      }
    } catch (error) {
      console.error('❌ 언어 목록 조회 실패:', error)
      // 기본 언어 목록 반환
      return [
        { code: 'en-US', name: 'English (US)' },
        { code: 'en-GB', name: 'English (UK)' }
      ]
    }
  },

  /**
   * 평가 결과를 한글 피드백으로 변환 (프론트엔드용)
   *
   * @param {Object} assessmentResult - 평가 결과
   * @returns {Object} 한글 피드백 객체
   */
  formatFeedbackKorean(assessmentResult) {
    const { pronunciation_score, accuracy_score, fluency_score, prosody_score, words } = assessmentResult

    // 문제 단어 식별 (정확도 70% 미만)
    const problemWords = words
      .filter(w => w.accuracy_score < 70)
      .map(w => w.word)

    // 음소 문제 식별
    const problemPhonemes = []
    words.forEach(word => {
      word.phonemes.forEach(phoneme => {
        if (phoneme.accuracy_score < 70) {
          problemPhonemes.push({
            word: word.word,
            phoneme: phoneme.phoneme,
            score: phoneme.accuracy_score
          })
        }
      })
    })

    // 전체 평가
    let overallFeedback = ''
    if (pronunciation_score >= 90) {
      overallFeedback = '훌륭한 발음입니다! 원어민 수준에 가깝습니다.'
    } else if (pronunciation_score >= 80) {
      overallFeedback = '좋은 발음입니다! 약간의 연습으로 더 개선할 수 있어요.'
    } else if (pronunciation_score >= 70) {
      overallFeedback = '괜찮은 발음입니다. 몇 가지 개선이 필요합니다.'
    } else if (pronunciation_score >= 60) {
      overallFeedback = '발음 개선이 필요합니다. 특정 소리에 집중해보세요.'
    } else {
      overallFeedback = '계속 연습하세요! 발음은 연습으로 개선됩니다.'
    }

    // 구체적 피드백
    const detailedFeedback = []

    if (accuracy_score < 70) {
      detailedFeedback.push('정확도: 개별 소리를 정확하게 발음하는 연습이 필요합니다.')
    }

    if (fluency_score < 70) {
      detailedFeedback.push('유창성: 더 자연스럽고 부드럽게 말하는 연습을 해보세요.')
    }

    if (prosody_score < 70) {
      detailedFeedback.push('운율: 강세와 억양 패턴에 주의를 기울여보세요.')
    }

    if (problemWords.length > 0) {
      detailedFeedback.push(`연습이 필요한 단어: ${problemWords.slice(0, 3).join(', ')}`)
    }

    if (problemPhonemes.length > 0) {
      const uniquePhonemes = [...new Set(problemPhonemes.map(p => p.phoneme))].slice(0, 3)
      detailedFeedback.push(`개선이 필요한 소리: ${uniquePhonemes.join(', ')}`)
    }

    return {
      overallScore: pronunciation_score,
      overallFeedback,
      detailedFeedback,
      scoreBreakdown: {
        accuracy: accuracy_score,
        fluency: fluency_score,
        prosody: prosody_score
      },
      problemWords,
      problemPhonemes: problemPhonemes.slice(0, 5)
    }
  },

  /**
   * Blob을 Base64로 변환하는 유틸리티 함수
   *
   * @private
   * @param {Blob} blob - 변환할 Blob
   * @returns {Promise<string>} Base64 문자열 (data URL 제외)
   */
  async _blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        // data:audio/webm;base64, 부분 제거
        const base64String = reader.result.split(',')[1]
        resolve(base64String)
      }

      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  },

  /**
   * 점수를 색상으로 변환 (UI 표시용)
   *
   * @param {number} score - 0-100 사이의 점수
   * @returns {string} CSS 색상 값
   */
  getScoreColor(score) {
    if (score >= 90) return '#10b981' // green
    if (score >= 80) return '#3b82f6' // blue
    if (score >= 70) return '#f59e0b' // amber
    if (score >= 60) return '#ef4444' // red
    return '#dc2626' // dark red
  },

  /**
   * 점수를 등급으로 변환 (UI 표시용)
   *
   * @param {number} score - 0-100 사이의 점수
   * @returns {string} 등급 문자열 (A+, A, B, C, D)
   */
  getScoreGrade(score) {
    if (score >= 95) return 'A+'
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
}

export default pronunciationService
