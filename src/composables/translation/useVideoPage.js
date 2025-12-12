/**
 * 비디오 페이지 메인 Composable
 * 목록/상세 뷰 전환, 비디오 CRUD, 프로젝트 선택
 */
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getVideos, deleteVideo, uploadVideo } from '@/services/videoService'
import { getUserProjects } from '@/services/projectService'
import { useToast } from '@/composables/useToast'

export function useVideoPage() {
  const router = useRouter()
  const toast = useToast()

  // 기존 API와 호환되는 showToast 래퍼
  const showToast = (message, type = 'success') => {
    if (type === 'success') toast.success(message)
    else if (type === 'error') toast.error(message)
    else toast.show(message, type)
  }

  // ==================== VIEW STATE ====================
  const currentView = ref('list') // 'list' | 'detail'
  const selectedVideo = ref(null)

  // ==================== LIST VIEW STATE ====================
  const videos = ref([])
  const isLoadingVideos = ref(false)
  const showUploadModal = ref(false)
  const uploadModalRef = ref(null)

  // ==================== PROJECT STATE ====================
  const glossaryExpanded = ref(false)
  const selectedProjectId = ref(null)
  const projects = ref([])
  const contextInfo = ref(null)

  // ==================== DOWNLOAD STATE ====================
  const downloadDropdownOpen = ref(false)
  const showAddTranslationModal = ref(false)

  // ==================== LIST VIEW METHODS ====================

  async function loadVideos() {
    isLoadingVideos.value = true
    try {
      const response = await getVideos()
      videos.value = response.data?.content || []
    } catch (error) {
      console.error('Failed to load videos:', error)
      showToast('영상 목록을 불러오는데 실패했습니다.', 'error')
    } finally {
      isLoadingVideos.value = false
    }
  }

  function selectVideo(video) {
    selectedVideo.value = video
    currentView.value = 'detail'
    return video
  }

  function goBackToList() {
    currentView.value = 'list'
    selectedVideo.value = null
    loadVideos() // 목록 새로고침
  }

  async function handleVideoUpload({ file, sourceLanguage, targetLanguage }, callbacks = {}) {
    try {
      // 진행률 콜백
      callbacks.onProgress?.(10)

      // FormData 구성
      const formData = new FormData()
      formData.append('file', file)

      const request = {
        sourceLanguage,
        targetLanguage,
        projectId: selectedProjectId.value
      }
      formData.append('request', JSON.stringify(request))

      // 사용자 확인
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (!user.id) {
        showToast('로그인이 필요합니다.', 'error')
        router.push('/login')
        return null
      }

      callbacks.onProgress?.(30)

      // 업로드 실행
      const response = await uploadVideo(formData)

      callbacks.onProgress?.(100)

      showToast('영상 업로드가 완료되었습니다!', 'success')

      // 업로드된 비디오 정보 반환
      return {
        id: response.id,
        originalFilename: file.name,
        fileName: file.name,
        fileSize: file.size,
        originalLanguage: sourceLanguage,
        hasSubtitles: false
      }
    } catch (error) {
      console.error('Video upload error:', error)
      showToast('영상 업로드에 실패했습니다.', 'error')
      throw error
    }
  }

  async function handleDeleteVideo(videoId) {
    if (!confirm('이 영상을 삭제하시겠습니까?')) return false

    try {
      await deleteVideo(videoId)
      showToast('영상이 삭제되었습니다.', 'success')

      if (currentView.value === 'detail') {
        goBackToList()
      } else {
        await loadVideos()
      }
      return true
    } catch (error) {
      console.error('Failed to delete video:', error)
      showToast('영상 삭제에 실패했습니다.', 'error')
      return false
    }
  }

  // ==================== PROJECT METHODS ====================

  async function loadProjects() {
    try {
      const response = await getUserProjects()
      projects.value = response.data.data || []
    } catch (error) {
      console.error('Failed to load projects:', error)
      showToast('프로젝트 목록을 불러오는데 실패했습니다.', 'error')
    }
  }

  function onProjectChange(projectId) {
    if (projectId) {
      const project = projects.value.find(p => p.id === projectId)
      if (project) {
        contextInfo.value = {
          documentsCount: project.documentCount || 0,
          termsCount: project.termCount || 0
        }
      }
    } else {
      contextInfo.value = null
    }
  }

  // ==================== UTILITY ====================

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  // 상태 리셋
  function resetDetailView() {
    selectedVideo.value = null
    selectedProjectId.value = null
    contextInfo.value = null
    downloadDropdownOpen.value = false
    showAddTranslationModal.value = false
  }

  // ==================== LIFECYCLE ====================

  onMounted(() => {
    loadVideos()
    loadProjects()
  })

  return {
    // VIEW STATE
    currentView,
    selectedVideo,

    // LIST STATE
    videos,
    isLoadingVideos,
    showUploadModal,
    uploadModalRef,

    // PROJECT STATE
    glossaryExpanded,
    selectedProjectId,
    projects,
    contextInfo,

    // MODAL STATE
    downloadDropdownOpen,
    showAddTranslationModal,

    // LIST METHODS
    loadVideos,
    selectVideo,
    goBackToList,
    handleVideoUpload,
    handleDeleteVideo,

    // PROJECT METHODS
    loadProjects,
    onProjectChange,

    // UTILITY
    formatFileSize,
    resetDetailView,
    showToast
  }
}
