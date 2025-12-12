import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, onUnmounted } from 'vue'
import voiceAvatarService from '@/services/voiceAvatarService'

/**
 * WebRTC Avatar 관리 Composable
 *
 * Azure Speech Avatar의 초기화, 변경, 정리를 담당
 */
export function usePracticeAvatar({ avatarEnabled, lastAiMessage, scenario }) {
  // Avatar Options
  const AVATAR_OPTIONS = {
    lisa: { name: 'Lisa', styles: ['casual-sitting'] },
    harry: { name: 'Harry', styles: ['business', 'casual', 'youthful'] },
    jeff: { name: 'Jeff', styles: ['business', 'formal'] },
    lori: { name: 'Lori', styles: ['casual', 'graceful', 'formal'] },
    max: { name: 'Max', styles: ['business', 'casual', 'formal'] },
    meg: { name: 'Meg', styles: ['formal', 'casual', 'business'] }
  }

  // WebRTC Avatar video ref
  const webrtcVideoRef = ref(null)
  const isWebRTCReady = ref(false)
  const avatarError = ref(null)

  // 아바타 선택 상태
  const selectedCharacter = ref('lisa')
  const selectedStyle = ref('casual-sitting')
  const isChangingAvatar = ref(false)

  /**
   * 마지막 AI 메시지의 언어 추정
   */
  const estimatedLanguage = computed(() => {
    return scenario?.value?.language || 'en-US'
  })

  /**
   * 캐릭터 변경 시 첫 번째 스타일로 자동 선택
   */
  watch(selectedCharacter, (newChar) => {
    const styles = AVATAR_OPTIONS[newChar]?.styles
    if (styles && styles.length > 0) {
      selectedStyle.value = styles[0]
    }
  })

  /**
   * avatarEnabled 모드에서 WebRTC Avatar 초기화
   * v-show 사용으로 DOM은 유지되므로, 처음 활성화 시에만 초기화
   * 모드 해제 시에는 연결을 유지하여 재진입 시 빠르게 사용 가능
   */
  watch(
    avatarEnabled,
    async (enabled) => {
      if (enabled) {
        // 이미 연결되어 있으면 재초기화하지 않음
        if (isWebRTCReady.value) {
          console.log('[Avatar] 이미 연결됨, 재초기화 스킵')
          return
        }
        // 다음 틱에서 video element가 DOM에 있을 때 초기화
        await nextTick()
        await initializeWebRTCAvatar()
      }
      // 모드 해제 시에는 연결을 유지 (v-show로 DOM 유지됨)
      // 컴포넌트 언마운트 시에만 정리됨
    }
  )

  /**
   * lastAiMessage가 변경되면 Avatar로 발화
   */
  watch(
    lastAiMessage,
    async (newMessage) => {
      if (!newMessage || !avatarEnabled.value || !isWebRTCReady.value) return
      try {
        await voiceAvatarService.speakWithAvatar(newMessage, estimatedLanguage.value)
      } catch (err) {
        console.error('[usePracticeAvatar] Avatar speak error:', err)
      }
    }
  )

  /**
   * WebRTC Avatar 초기화
   */
  async function initializeWebRTCAvatar() {
    if (isWebRTCReady.value) return

    try {
      avatarError.value = null

      // video element가 준비될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 200))

      if (!webrtcVideoRef.value) {
        return
      }

      await voiceAvatarService.initializeAvatar(webrtcVideoRef.value, {
        character: selectedCharacter.value,
        style: selectedStyle.value,
        language: estimatedLanguage.value
      })

      isWebRTCReady.value = true
    } catch (err) {
      avatarError.value = err.message || 'Avatar 초기화 실패'
    }
  }

  /**
   * 아바타 캐릭터/스타일 변경 적용
   * Azure 서버 throttling 방지를 위해 충분한 대기 시간과 재시도 로직 포함
   */
  async function applyAvatarChange() {
    if (!avatarEnabled.value || isChangingAvatar.value) return

    console.log('[Avatar] applyAvatarChange called with:', {
      character: selectedCharacter.value,
      style: selectedStyle.value
    })

    try {
      isChangingAvatar.value = true
      avatarError.value = null

      // 기존 연결 해제
      await cleanupWebRTCAvatar()

      // Azure Avatar throttling 방지를 위해 충분히 대기 (연결 해제 완료 보장)
      // Azure 서버에서 이전 세션 정리에 시간이 필요함
      console.log('[Avatar] Waiting for Azure server cleanup...')
      await new Promise(resolve => setTimeout(resolve, 3000))

      // 재시도 로직 (최대 2회)
      let lastError = null
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          console.log(`[Avatar] Connection attempt ${attempt}/2`)

          // 새로운 설정으로 초기화
          await voiceAvatarService.initializeAvatar(webrtcVideoRef.value, {
            character: selectedCharacter.value,
            style: selectedStyle.value,
            language: estimatedLanguage.value
          })

          isWebRTCReady.value = true
          console.log('[Avatar] Successfully connected to new avatar')
          return // 성공 시 종료
        } catch (err) {
          lastError = err
          console.warn(`[Avatar] Attempt ${attempt} failed:`, err.message)

          if (attempt < 2) {
            // 재시도 전 추가 대기
            console.log('[Avatar] Retrying after delay...')
            await new Promise(resolve => setTimeout(resolve, 3000))
          }
        }
      }

      // 모든 시도 실패
      throw lastError
    } catch (err) {
      avatarError.value = err.message || 'Avatar 변경 실패'
      console.error('[Avatar] All connection attempts failed:', err)
    } finally {
      isChangingAvatar.value = false
    }
  }

  /**
   * WebRTC Avatar 정리
   */
  async function cleanupWebRTCAvatar() {
    if (!isWebRTCReady.value) return

    try {
      await voiceAvatarService.disconnectAvatar()
      isWebRTCReady.value = false
    } catch (err) {
      // 무시
    }
  }

  /**
   * 페이지 언로드 핸들러 (새로고침, 탭 닫기 등)
   */
  const handleBeforeUnload = () => {
    // 동기적으로 정리 (async 대기 불가)
    voiceAvatarService.disconnectAvatarSync()
  }

  // 컴포넌트 마운트 시 beforeunload 이벤트 등록
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  // 컴포넌트 언마운트 전 정리 시작
  onBeforeUnmount(async () => {
    // beforeunload 이벤트 제거
    window.removeEventListener('beforeunload', handleBeforeUnload)
    // Avatar 연결 해제
    await cleanupWebRTCAvatar()
  })

  // 컴포넌트 언마운트 시 추가 정리 (백업)
  onUnmounted(() => {
    voiceAvatarService.disconnectAvatarSync()
  })

  return {
    // Constants
    AVATAR_OPTIONS,

    // Refs
    webrtcVideoRef,
    isWebRTCReady,
    avatarError,
    selectedCharacter,
    selectedStyle,
    isChangingAvatar,

    // Computed
    estimatedLanguage,

    // Methods
    initializeWebRTCAvatar,
    applyAvatarChange,
    cleanupWebRTCAvatar
  }
}
