/**
 * 비디오 플레이어 제어 Composable
 * 비디오 재생, 시간 추적, 자막 동기화
 */
import { ref, onUnmounted } from 'vue'

export function useVideoPlayer() {
  // 플레이어 상태
  const videoPlayerRef = ref(null)
  const videoUrl = ref(null)
  const videoDuration = ref(0)
  const currentTime = ref(0)
  const isPlaying = ref(false)

  // 비디오 URL 설정 (서버 스트리밍)
  function setVideoUrl(videoId) {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
    const token = localStorage.getItem('token')
    videoUrl.value = `${API_URL}/videos/${videoId}/stream?token=${token}`
  }

  // 로컬 파일로 URL 설정 (업로드 직후 미리보기)
  function setLocalVideoUrl(file) {
    // 기존 blob URL 해제
    if (videoUrl.value && videoUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl.value)
    }
    videoUrl.value = URL.createObjectURL(file)
  }

  // 비디오 URL 초기화
  function clearVideoUrl() {
    if (videoUrl.value && videoUrl.value.startsWith('blob:')) {
      URL.revokeObjectURL(videoUrl.value)
    }
    videoUrl.value = null
  }

  // 이벤트 핸들러: 시간 업데이트
  function handleTimeUpdate(event) {
    currentTime.value = event.target.currentTime
  }

  // 이벤트 핸들러: 메타데이터 로드 완료
  function handleVideoLoaded(event) {
    videoDuration.value = event.target.duration
  }

  // 이벤트 핸들러: 재생 상태 변경
  function handlePlayPause() {
    isPlaying.value = !videoPlayerRef.value?.paused
  }

  // 특정 시간으로 이동
  function seekTo(time) {
    if (videoPlayerRef.value) {
      videoPlayerRef.value.currentTime = time
    }
  }

  // 자막으로 이동 후 재생
  function seekToSubtitle(subtitle) {
    if (videoPlayerRef.value) {
      videoPlayerRef.value.currentTime = subtitle.startTime
      videoPlayerRef.value.play()
    }
  }

  // 재생/일시정지 토글
  function togglePlay() {
    if (videoPlayerRef.value) {
      if (videoPlayerRef.value.paused) {
        videoPlayerRef.value.play()
      } else {
        videoPlayerRef.value.pause()
      }
    }
  }

  // 시간 포맷팅 (00:00:00)
  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // 상태 초기화
  function reset() {
    clearVideoUrl()
    videoDuration.value = 0
    currentTime.value = 0
    isPlaying.value = false
  }

  // 언마운트 시 blob URL 해제
  onUnmounted(() => {
    clearVideoUrl()
  })

  return {
    // 상태
    videoPlayerRef,
    videoUrl,
    videoDuration,
    currentTime,
    isPlaying,

    // 설정
    setVideoUrl,
    setLocalVideoUrl,
    clearVideoUrl,

    // 이벤트 핸들러
    handleTimeUpdate,
    handleVideoLoaded,
    handlePlayPause,

    // 액션
    seekTo,
    seekToSubtitle,
    togglePlay,
    reset,

    // 유틸리티
    formatTime
  }
}
