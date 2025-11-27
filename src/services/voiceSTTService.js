/**
 * 음성 STT 서비스
 *
 * 음성 파일을 백엔드로 전송하여 텍스트로 변환합니다.
 */
import { pythonAPI } from './api'

const voiceSTTService = {
  /**
   * 음성을 텍스트로 변환
   * @param {Blob} audioBlob - 음성 파일 Blob
   * @param {string} language - 언어 코드 (기본값: ko-KR)
   * @returns {Promise<Object>} 변환 결과
   * @throws {Error} 변환 실패 시
   */
  async transcribe(audioBlob, language = 'en-US') {
    try {
      // FormData 생성
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      formData.append('language', language)

      console.log('STT 요청:', {
        size: `${(audioBlob.size / 1024).toFixed(2)}KB`,
        type: audioBlob.type,
        language
      })

      // 백엔드로 전송 (JWT 토큰은 interceptor에서 자동 추가됨)
      const response = await pythonAPI.post('/voice/stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
          // Authorization 헤더는 interceptor에서 자동 추가
        },
        timeout: 30000 // 30초 타임아웃
      })

      console.log('STT 응답:', response.data)

      return response.data
    } catch (error) {
      console.error('STT 변환 실패:', error)

      // 에러 메시지 처리
      let errorMessage = '음성 인식 실패'

      if (error.response) {
        // 서버 응답 에러
        const status = error.response.status
        const detail = error.response.data?.detail

        if (status === 401) {
          errorMessage = '인증이 필요합니다. 다시 로그인해주세요.'
        } else if (status === 413) {
          errorMessage = '파일 크기가 너무 큽니다. 10MB 이하의 음성 파일만 지원합니다.'
        } else if (status === 500) {
          errorMessage = detail || '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
        } else if (status === 400) {
          errorMessage = detail || '잘못된 요청입니다. 음성 파일을 확인해주세요.'
        } else {
          errorMessage = detail || `서버 오류 (${status})`
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답 없음
        if (error.code === 'ECONNABORTED') {
          errorMessage = '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.'
        } else {
          errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.'
        }
      }

      throw new Error(errorMessage)
    }
  },

  /**
   * 지원하는 언어 목록 조회
   * @returns {Promise<Object>} 지원 언어 목록
   */
  async getSupportedLanguages() {
    try {
      const response = await pythonAPI.get('/voice/supported-languages')
      return response.data.data.languages
    } catch (error) {
      console.error('지원 언어 조회 실패:', error)
      // 기본 언어 목록 반환
      return {
        'ko-KR': '한국어',
        'en-US': '영어 (미국)',
        'ja-JP': '일본어'
      }
    }
  }
}

export default voiceSTTService
