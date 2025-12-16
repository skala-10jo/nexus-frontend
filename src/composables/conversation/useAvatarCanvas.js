/**
 * Avatar Canvas Composable
 *
 * Viseme Fallback 모드에서 사용되는 2D 캔버스 아바타 렌더링 로직
 *
 * @module useAvatarCanvas
 */
import { ref, watch } from 'vue'
import { avatarAdapter } from '@/services/avatarAdapter'
import { useAvatarStore } from '@/stores/avatar'

/**
 * Avatar Canvas 로직
 *
 * @returns {Object} 캔버스 상태 및 메서드
 */
export function useAvatarCanvas() {
  const avatarStore = useAvatarStore()

  // ============================================
  // State
  // ============================================

  /** 캔버스 ref */
  const canvasRef = ref(null)

  /** 현재 입 모양 (viseme 이름) */
  const currentMouthShape = ref('silence')

  /** 2D 컨텍스트 */
  let ctx = null

  // ============================================
  // Watchers
  // ============================================

  /**
   * Viseme 인덱스 변경 시 입 모양 업데이트
   */
  watch(
    () => avatarStore.currentVisemeId,
    (visemeId) => {
      currentMouthShape.value = avatarAdapter.visemeIdToName(visemeId)
      drawAvatar()
    }
  )

  // ============================================
  // Methods
  // ============================================

  /**
   * 캔버스 초기화
   */
  function initCanvas() {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    canvas.width = 200
    canvas.height = 200

    ctx = canvas.getContext('2d')
    drawAvatar()
  }

  /**
   * 캔버스에 아바타 그리기 (간단한 2D 표현)
   */
  function drawAvatar() {
    if (!ctx || !canvasRef.value) return

    const canvas = canvasRef.value
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2

    // 배경 클리어
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)

    // 얼굴 (원)
    ctx.beginPath()
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2)
    ctx.fillStyle = '#ffd93d'
    ctx.fill()
    ctx.strokeStyle = '#ff6b6b'
    ctx.lineWidth = 3
    ctx.stroke()

    // 눈 (왼쪽)
    ctx.beginPath()
    ctx.arc(centerX - 30, centerY - 20, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#333'
    ctx.fill()

    // 눈 (오른쪽)
    ctx.beginPath()
    ctx.arc(centerX + 30, centerY - 20, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#333'
    ctx.fill()

    // 입 (viseme에 따라 변경)
    drawMouth(centerX, centerY + 30)
  }

  /**
   * 입 모양 그리기
   *
   * @param {number} x - X 좌표
   * @param {number} y - Y 좌표
   */
  function drawMouth(x, y) {
    if (!ctx) return

    ctx.beginPath()

    const shape = currentMouthShape.value

    switch (shape) {
      case 'silence':
        // 다물린 입
        ctx.moveTo(x - 25, y)
        ctx.lineTo(x + 25, y)
        ctx.strokeStyle = '#333'
        ctx.lineWidth = 3
        ctx.stroke()
        break

      case 'ae_ax_ah':
      case 'aa':
        // 크게 벌린 입 (아)
        ctx.ellipse(x, y, 25, 20, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
        break

      case 'ao':
      case 'ow':
        // 동그란 입 (오)
        ctx.arc(x, y, 15, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
        break

      case 'ey_eh_uh':
      case 'y_iy_ih_ix':
        // 옆으로 벌린 입 (이)
        ctx.ellipse(x, y, 20, 8, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
        break

      case 'w_uw':
        // 입술 내민 입 (우)
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
        break

      case 'p_b_m':
        // 다문 입술
        ctx.moveTo(x - 20, y)
        ctx.lineTo(x + 20, y)
        ctx.strokeStyle = '#ff6b6b'
        ctx.lineWidth = 5
        ctx.stroke()
        break

      default:
        // 기본 (살짝 벌린)
        ctx.ellipse(x, y, 15, 10, 0, 0, Math.PI * 2)
        ctx.fillStyle = '#ff6b6b'
        ctx.fill()
    }
  }

  /**
   * 입 모양 리셋
   */
  function resetMouthShape() {
    currentMouthShape.value = 'silence'
    drawAvatar()
  }

  // ============================================
  // Return
  // ============================================
  return {
    // Refs
    canvasRef,
    currentMouthShape,

    // Methods
    initCanvas,
    drawAvatar,
    resetMouthShape
  }
}
