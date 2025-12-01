/**
 * Azure Speech 싱글톤 스토어 (Pinia)
 *
 * 토큰 캐싱 및 SDK 인스턴스 관리를 중앙화하여 성능을 향상시킵니다.
 *
 * 주요 기능:
 * - 토큰 캐싱 (9분, localStorage 백업)
 * - SDK 인스턴스 재사용
 * - 자동 토큰 갱신
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getSpeechToken } from '@/services/azureSpeechService'

export const useAzureSpeechStore = defineStore('azureSpeech', () => {
  // 토큰 캐싱
  const cachedToken = ref(null)
  const tokenExpiry = ref(null)
  const region = ref(null)

  /**
   * 토큰 가져오기 (캐싱 지원)
   *
   * 캐시된 토큰이 유효하면 재사용하고, 만료되었으면 백엔드에서 새로 발급받습니다.
   *
   * @returns {Promise<{token: string, region: string}>} 토큰 및 리전
   */
  async function ensureToken() {
    const now = Date.now()

    // 캐시 확인 (9분 이내)
    if (cachedToken.value && tokenExpiry.value && now < tokenExpiry.value) {
      console.log('✅ 캐시된 Azure Speech 토큰 사용')
      return { token: cachedToken.value, region: region.value }
    }

    // localStorage에서 복원 시도
    try {
      const stored = localStorage.getItem('azureSpeechToken')
      if (stored) {
        const { token, region: r, expiry } = JSON.parse(stored)
        if (now < expiry) {
          cachedToken.value = token
          region.value = r
          tokenExpiry.value = expiry
          console.log('✅ localStorage에서 토큰 복원')
          return { token, region: r }
        }
      }
    } catch (e) {
      console.warn('localStorage 토큰 복원 실패:', e)
    }

    // 백엔드에서 새 토큰 발급
    console.log('🔑 백엔드에서 새 Azure Speech 토큰 요청...')
    const { token, region: r } = await getSpeechToken()

    // 캐싱 (9분)
    cachedToken.value = token
    region.value = r
    tokenExpiry.value = now + 9 * 60 * 1000  // 9분 (10분 유효, 1분 여유)

    // localStorage 백업
    try {
      localStorage.setItem('azureSpeechToken', JSON.stringify({
        token,
        region: r,
        expiry: tokenExpiry.value
      }))
    } catch (e) {
      console.warn('localStorage 저장 실패:', e)
    }

    console.log(`✅ 새 토큰 발급 완료 (region: ${r})`)
    return { token, region: r }
  }

  /**
   * 토큰 강제 갱신 (캐시 무효화)
   */
  function clearToken() {
    cachedToken.value = null
    tokenExpiry.value = null
    region.value = null
    localStorage.removeItem('azureSpeechToken')
    console.log('🗑️ Azure Speech 토큰 캐시 초기화')
  }

  return {
    // 상태
    cachedToken,
    region,
    tokenExpiry,

    // 메서드
    ensureToken,
    clearToken
  }
})
