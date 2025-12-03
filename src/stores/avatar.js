/**
 * Avatar Store (Pinia)
 *
 * 아바타 상태 관리 - 기존 TTS 흐름과 독립적으로 동작
 * TTS 결과를 구독하여 아바타 시각화에 필요한 상태만 관리
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAvatarStore = defineStore('avatar', () => {
  // ========== State ==========

  /** 아바타 패널 열림 상태 */
  const isPanelOpen = ref(false)

  /** 아바타 활성화 여부 */
  const isEnabled = ref(false)

  /** 현재 세션 ID */
  const sessionId = ref(null)

  /** 아바타 타입: 'webrtc' | 'viseme' | 'video' */
  const avatarType = ref('viseme')

  /** 현재 재생 중인 viseme 데이터 */
  const currentVisemes = ref([])

  /** 현재 viseme 인덱스 */
  const currentVisemeIndex = ref(0)

  /** 로딩 상태 */
  const isLoading = ref(false)

  /** 에러 메시지 */
  const error = ref(null)

  /** 연결 상태: 'disconnected' | 'connecting' | 'connected' | 'error' */
  const connectionStatus = ref('disconnected')

  /** 아바타 스타일: 'casual' | 'formal' | 'presentation' */
  const avatarStyle = ref('casual')

  // ========== Getters ==========

  /** 아바타가 말하고 있는지 */
  const isSpeaking = computed(() => {
    return currentVisemes.value.length > 0 && currentVisemeIndex.value < currentVisemes.value.length
  })

  /** 현재 viseme ID */
  const currentVisemeId = computed(() => {
    if (currentVisemes.value.length === 0) return 0
    const viseme = currentVisemes.value[currentVisemeIndex.value]
    return viseme ? viseme.viseme_id : 0
  })

  /** 연결됨 여부 */
  const isConnected = computed(() => connectionStatus.value === 'connected')

  // ========== Actions ==========

  /**
   * 패널 토글
   */
  function togglePanel() {
    isPanelOpen.value = !isPanelOpen.value
  }

  /**
   * 패널 열기
   */
  function openPanel() {
    isPanelOpen.value = true
  }

  /**
   * 패널 닫기
   */
  function closePanel() {
    isPanelOpen.value = false
  }

  /**
   * 아바타 활성화/비활성화
   */
  function setEnabled(enabled) {
    isEnabled.value = enabled
    if (!enabled) {
      resetState()
    }
  }

  /**
   * 아바타 타입 설정
   */
  function setAvatarType(type) {
    if (['webrtc', 'viseme', 'video'].includes(type)) {
      avatarType.value = type
    }
  }

  /**
   * 아바타 스타일 설정
   */
  function setAvatarStyle(style) {
    if (['casual', 'formal', 'presentation'].includes(style)) {
      avatarStyle.value = style
    }
  }

  /**
   * TTS 결과 적용 (외부에서 호출)
   * 기존 TTS 흐름을 건드리지 않고 결과만 수신
   */
  function applyTTSResult(result) {
    if (!isPanelOpen.value) return // 패널이 닫혀있으면 무시

    sessionId.value = result.session_id || null
    currentVisemes.value = result.visemes || []
    currentVisemeIndex.value = 0
    error.value = null
  }

  /**
   * Viseme 인덱스 업데이트 (애니메이션용)
   */
  function updateVisemeIndex(index) {
    if (index >= 0 && index <= currentVisemes.value.length) {
      currentVisemeIndex.value = index
    }
  }

  /**
   * 다음 viseme으로 이동
   */
  function nextViseme() {
    if (currentVisemeIndex.value < currentVisemes.value.length) {
      currentVisemeIndex.value++
    }
  }

  /**
   * 연결 상태 설정
   */
  function setConnectionStatus(status) {
    connectionStatus.value = status
  }

  /**
   * 로딩 상태 설정
   */
  function setLoading(loading) {
    isLoading.value = loading
  }

  /**
   * 에러 설정
   */
  function setError(errorMsg) {
    error.value = errorMsg
    connectionStatus.value = 'error'
  }

  /**
   * 에러 클리어
   */
  function clearError() {
    error.value = null
    if (connectionStatus.value === 'error') {
      connectionStatus.value = 'disconnected'
    }
  }

  /**
   * 상태 리셋
   */
  function resetState() {
    sessionId.value = null
    currentVisemes.value = []
    currentVisemeIndex.value = 0
    error.value = null
    connectionStatus.value = 'disconnected'
    isLoading.value = false
  }

  /**
   * 전체 리셋 (패널 상태 포함)
   */
  function fullReset() {
    resetState()
    isPanelOpen.value = false
    isEnabled.value = false
  }

  return {
    // State
    isPanelOpen,
    isEnabled,
    sessionId,
    avatarType,
    currentVisemes,
    currentVisemeIndex,
    isLoading,
    error,
    connectionStatus,
    avatarStyle,

    // Getters
    isSpeaking,
    currentVisemeId,
    isConnected,

    // Actions
    togglePanel,
    openPanel,
    closePanel,
    setEnabled,
    setAvatarType,
    setAvatarStyle,
    applyTTSResult,
    updateVisemeIndex,
    nextViseme,
    setConnectionStatus,
    setLoading,
    setError,
    clearError,
    resetState,
    fullReset
  }
})
