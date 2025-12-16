/**
 * Avatar Panel Composable
 *
 * Azure AI Speech Avatar WebRTC 또는 Viseme 기반 아바타 패널 관리
 *
 * @module useAvatarPanel
 */
import { ref, computed, watch } from 'vue'
import { useAvatarStore } from '@/stores/avatar'
import { avatarAdapter } from '@/services/avatarAdapter'
import voiceAvatarService from '@/services/voiceAvatarService'

/**
 * Avatar Panel 로직
 *
 * @param {Object} options - 옵션
 * @param {Function} options.onMouthShapeReset - 입 모양 리셋 콜백 (viseme 모드용)
 * @returns {Object} 패널 상태 및 메서드
 */
export function useAvatarPanel({ onMouthShapeReset } = {}) {
  const avatarStore = useAvatarStore()

  // ============================================
  // State
  // ============================================

  /** 비디오 ref (WebRTC용) */
  const videoRef = ref(null)

  /** Avatar 모드: 'webrtc' | 'viseme' */
  const avatarMode = ref('webrtc')

  /** WebRTC 초기화 상태 */
  const isWebRTCInitialized = ref(false)

  /** Viseme 스케줄러 컨트롤러 */
  let visemeController = null

  // ============================================
  // Computed
  // ============================================

  const isPanelOpen = computed(() => avatarStore.isPanelOpen)
  const isLoading = computed(() => avatarStore.isLoading)
  const isSpeaking = computed(() => avatarStore.isSpeaking)
  const connectionStatus = computed(() => avatarStore.connectionStatus)
  const error = computed(() => avatarStore.error)

  // ============================================
  // Methods
  // ============================================

  /**
   * WebRTC 초기화
   *
   * @param {Function} initCanvasFallback - Canvas 초기화 fallback 함수
   */
  async function initializeWebRTC(initCanvasFallback) {
    if (isWebRTCInitialized.value) return

    try {
      avatarStore.setLoading(true)
      avatarStore.setConnectionStatus('connecting')

      // Video 엘리먼트가 준비될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 100))

      if (videoRef.value) {
        // WebRTC Avatar 초기화
        await voiceAvatarService.initializeAvatar(videoRef.value, {
          character: 'lisa',
          style: 'casual-sitting'
        })

        // 세션 시작
        await voiceAvatarService.startAvatarSession('lisa', 'casual-sitting')

        isWebRTCInitialized.value = true
        avatarMode.value = 'webrtc'
        avatarStore.setConnectionStatus('connected')
      } else {
        // Video 엘리먼트가 없으면 Viseme fallback
        avatarMode.value = 'viseme'
        if (initCanvasFallback) initCanvasFallback()
        avatarStore.setConnectionStatus('connected')
      }
    } catch (err) {
      // Fallback to viseme mode
      avatarMode.value = 'viseme'
      if (initCanvasFallback) initCanvasFallback()
      avatarStore.setConnectionStatus('connected')
    } finally {
      avatarStore.setLoading(false)
    }
  }

  /**
   * TTS 결과를 아바타에 적용
   *
   * @param {string} text - TTS 텍스트
   * @param {string} language - 언어 코드
   * @param {string} audioUrl - 오디오 URL (선택)
   */
  async function applyToAvatar(text, language = 'en-US', audioUrl = null) {
    if (!text) return

    try {
      avatarStore.setLoading(true)
      avatarStore.clearError()

      if (avatarMode.value === 'webrtc' && isWebRTCInitialized.value) {
        // WebRTC 모드: 음성과 함께 아바타 구동
        await voiceAvatarService.speakWithAvatar(text, language)
        avatarStore.setConnectionStatus('connected')
      } else {
        // Viseme 모드: 백엔드에 아바타 적용 요청
        const result = await avatarAdapter.apply({
          text,
          audioUrl,
          language,
          avatarStyle: avatarStore.avatarStyle
        })

        // Store에 결과 적용
        avatarStore.applyTTSResult(result)

        // Viseme 애니메이션 시작
        startVisemeAnimation(result.visemes)
      }

      avatarStore.setConnectionStatus('connected')
    } catch (err) {
      console.error('[AvatarPanel] Apply error:', err)
      avatarStore.setError(err.message || '아바타 적용 실패')
    } finally {
      avatarStore.setLoading(false)
    }
  }

  /**
   * Viseme 애니메이션 시작
   *
   * @param {Array} visemes - Viseme 데이터 배열
   */
  function startVisemeAnimation(visemes) {
    // 이전 애니메이션 중지
    if (visemeController) {
      visemeController.stop()
    }

    if (!visemes || visemes.length === 0) return

    visemeController = avatarAdapter.scheduleVisemes(
      visemes,
      (visemeId, index) => {
        avatarStore.updateVisemeIndex(index)
      },
      () => {
        // 애니메이션 완료
        avatarStore.updateVisemeIndex(visemes.length)
        if (onMouthShapeReset) onMouthShapeReset()
      }
    )
  }

  /**
   * 패널 닫기
   *
   * @param {Function} emitClose - close 이벤트 emit 함수
   */
  async function closePanel(emitClose) {
    if (visemeController) {
      visemeController.stop()
    }

    // WebRTC 연결 해제
    if (isWebRTCInitialized.value) {
      await voiceAvatarService.disconnectAvatar()
      isWebRTCInitialized.value = false
    }

    avatarStore.closePanel()
    if (emitClose) emitClose()
  }

  /**
   * 재시도
   *
   * @param {string} text - TTS 텍스트
   * @param {string} language - 언어 코드
   */
  async function retry(text, language) {
    if (text) {
      await applyToAvatar(text, language)
    }
  }

  /**
   * 리소스 정리
   */
  async function cleanup() {
    if (visemeController) {
      visemeController.stop()
    }

    // WebRTC 연결 정리
    if (isWebRTCInitialized.value) {
      await voiceAvatarService.disconnectAvatar()
    }
  }

  /**
   * 패널 열림 상태에 따른 WebRTC 초기화 watcher 설정
   *
   * @param {Function} initCanvasFallback - Canvas 초기화 fallback 함수
   */
  function setupPanelWatcher(initCanvasFallback) {
    watch(
      isPanelOpen,
      async (isOpen) => {
        if (isOpen && !isWebRTCInitialized.value) {
          await initializeWebRTC(initCanvasFallback)
        }
      }
    )
  }

  /**
   * TTS 텍스트 변경 watcher 설정
   *
   * @param {Function} getTtsText - TTS 텍스트 getter
   * @param {Function} getLanguage - 언어 getter
   */
  function setupTtsWatcher(getTtsText, getLanguage) {
    watch(
      getTtsText,
      async (newText) => {
        if (!newText || !isPanelOpen.value) return
        await applyToAvatar(newText, getLanguage())
      }
    )
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Refs
    videoRef,
    avatarMode,
    isWebRTCInitialized,

    // Computed
    isPanelOpen,
    isLoading,
    isSpeaking,
    connectionStatus,
    error,

    // Methods
    initializeWebRTC,
    applyToAvatar,
    startVisemeAnimation,
    closePanel,
    retry,
    cleanup,
    setupPanelWatcher,
    setupTtsWatcher
  }
}
