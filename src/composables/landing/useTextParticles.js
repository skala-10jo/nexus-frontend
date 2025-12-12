/**
 * TextParticles 지구본 Canvas 애니메이션 로직
 *
 * @description 지구본 위 도시 불빛과 텍스트 파티클 시각화
 */
import { onMounted, onUnmounted } from 'vue'
import { continentData, cityData } from '@/components/landing/data/textParticlesData'

// ============================================
// GlobeNode 클래스 (도시 불빛)
// ============================================
class GlobeNode {
  constructor(lat, lon, size = 1, name = '', globeState) {
    this.lat = lat
    this.lon = lon
    this.name = name
    this.baseOpacity = 0.6 + Math.random() * 0.3
    this.opacity = this.baseOpacity
    this.pulsePhase = Math.random() * Math.PI * 2
    this.size = 3 + size * 4
    this.globeState = globeState
  }

  get3DPosition(rotation) {
    const phi = (90 - this.lat) * (Math.PI / 180)
    const theta = (this.lon + rotation) * (Math.PI / 180)

    const x = Math.sin(phi) * Math.cos(theta)
    const y = Math.cos(phi)
    const z = Math.sin(phi) * Math.sin(theta)

    return { x, y, z }
  }

  getScreenPosition(rotation) {
    const pos = this.get3DPosition(rotation)
    const visible = pos.z > -0.2

    const screenX = this.globeState.globeCenter.x + pos.x * this.globeState.globeRadius
    const screenY = this.globeState.globeCenter.y - pos.y * this.globeState.globeRadius

    return { x: screenX, y: screenY, z: pos.z, visible }
  }

  update(time) {
    this.opacity = this.baseOpacity + Math.sin(time * 0.002 + this.pulsePhase) * 0.15
  }

  draw(ctx, rotation) {
    const pos = this.getScreenPosition(rotation)
    if (!pos.visible) return null

    const depthFade = (pos.z + 1) / 2
    const finalOpacity = this.opacity * depthFade

    // 도시 불빛 글로우
    const glowSize = this.size * 4
    const gradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, glowSize)
    gradient.addColorStop(0, `rgba(255, 200, 100, ${finalOpacity * 0.9})`)
    gradient.addColorStop(0.3, `rgba(255, 150, 50, ${finalOpacity * 0.5})`)
    gradient.addColorStop(0.6, `rgba(255, 100, 30, ${finalOpacity * 0.2})`)
    gradient.addColorStop(1, 'rgba(255, 80, 20, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, glowSize, 0, Math.PI * 2)
    ctx.fill()

    // 밝은 중심점
    ctx.fillStyle = `rgba(255, 240, 200, ${finalOpacity})`
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, this.size * 0.8, 0, Math.PI * 2)
    ctx.fill()

    return { ...pos, opacity: finalOpacity, size: this.size }
  }
}

// ============================================
// TextParticle 클래스 (떠다니는 텍스트)
// ============================================
class TextParticle {
  constructor(texts, props, canvasState) {
    this.texts = texts
    this.props = props
    this.canvasState = canvasState
    this.text = texts[Math.floor(Math.random() * texts.length)]
    this.fontSize = props.minFontSize + Math.random() * (props.maxFontSize - props.minFontSize)
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvasState.width
    this.y = Math.random() * this.canvasState.height * 0.5
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = (Math.random() - 0.5) * 0.4
    this.opacity = 0.15 + Math.random() * 0.25
    this.targetOpacity = this.opacity
    this.connectedToGlobe = Math.random() > 0.3
  }

  update(mouse) {
    this.x += this.vx
    this.y += this.vy

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < this.props.mouseRadius) {
        const intensity = 1 - dist / this.props.mouseRadius
        this.targetOpacity = 0.6 + intensity * 0.4
      } else {
        this.targetOpacity = 0.15 + Math.random() * 0.15
      }
    }

    this.opacity += (this.targetOpacity - this.opacity) * 0.05

    if (this.x < -100 || this.x > this.canvasState.width + 100 ||
        this.y < -50 || this.y > this.canvasState.height * 0.55) {
      this.reset()
    }
  }

  draw(ctx) {
    ctx.font = `${this.fontSize}px 'Noto Sans KR', 'Noto Sans JP', 'Noto Sans SC', sans-serif`
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.text, this.x, this.y)
  }
}

// ============================================
// FlowParticle 클래스 (데이터 흐름 효과)
// ============================================
class FlowParticle {
  constructor(startNode, endNode, globeState) {
    this.startNode = startNode
    this.endNode = endNode
    this.globeState = globeState
    this.progress = 0
    this.speed = 0.004 + Math.random() * 0.008
  }

  update() {
    this.progress += this.speed
    return this.progress < 1
  }

  draw(ctx) {
    const t = this.progress
    const midX = (this.startNode.x + this.endNode.x) / 2
    const midY = (this.startNode.y + this.endNode.y) / 2

    const dx = midX - this.globeState.globeCenter.x
    const dy = midY - this.globeState.globeCenter.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const arcHeight = 50 + dist * 0.2
    const controlX = midX + (dx / dist) * arcHeight
    const controlY = midY + (dy / dist) * arcHeight

    const x = (1 - t) * (1 - t) * this.startNode.x + 2 * (1 - t) * t * controlX + t * t * this.endNode.x
    const y = (1 - t) * (1 - t) * this.startNode.y + 2 * (1 - t) * t * controlY + t * t * this.endNode.y

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    gradient.addColorStop(0.3, 'rgba(200, 240, 255, 0.7)')
    gradient.addColorStop(0.6, 'rgba(100, 200, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(50, 150, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ============================================
// 대륙 그리기 함수
// ============================================
function drawContinent(ctx, continentPoints, rotation, fillColor, strokeColor, globeState) {
  ctx.beginPath()
  let lastVisible = false

  continentPoints.forEach((point, index) => {
    const phi = (90 - point.lat) * (Math.PI / 180)
    const theta = (point.lon + rotation) * (Math.PI / 180)

    const x = Math.sin(phi) * Math.cos(theta)
    const y = Math.cos(phi)
    const z = Math.sin(phi) * Math.sin(theta)

    const screenX = globeState.globeCenter.x + x * globeState.globeRadius
    const screenY = globeState.globeCenter.y - y * globeState.globeRadius
    const visible = z > -0.1

    if (index === 0) {
      ctx.moveTo(screenX, screenY)
    } else {
      if (visible || lastVisible) {
        ctx.lineTo(screenX, screenY)
      } else {
        ctx.moveTo(screenX, screenY)
      }
    }
    lastVisible = visible
  })

  ctx.fillStyle = fillColor
  ctx.fill()

  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.5
  ctx.stroke()
}

// ============================================
// 위도선 그리기 함수
// ============================================
function drawLatitudeLine(ctx, lat, globeState) {
  const phi = (90 - lat) * (Math.PI / 180)
  const r = Math.sin(phi) * globeState.globeRadius
  const y = globeState.globeCenter.y - Math.cos(phi) * globeState.globeRadius

  ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.ellipse(globeState.globeCenter.x, y, r, r * 0.25, 0, 0, Math.PI * 2)
  ctx.stroke()
}

// ============================================
// 지구본 그리기 함수
// ============================================
function drawGlobe(ctx, rotation, globeState) {
  const { globeCenter, globeRadius } = globeState

  // 우주 배경 글로우
  const bgGlow = ctx.createRadialGradient(
    globeCenter.x, globeCenter.y, globeRadius * 0.3,
    globeCenter.x, globeCenter.y, globeRadius * 2
  )
  bgGlow.addColorStop(0, 'rgba(30, 60, 120, 0.2)')
  bgGlow.addColorStop(0.4, 'rgba(20, 50, 100, 0.1)')
  bgGlow.addColorStop(1, 'rgba(10, 30, 60, 0)')

  ctx.fillStyle = bgGlow
  ctx.beginPath()
  ctx.arc(globeCenter.x, globeCenter.y, globeRadius * 2, 0, Math.PI * 2)
  ctx.fill()

  // 대기권 글로우
  const atmosphereGlow = ctx.createRadialGradient(
    globeCenter.x, globeCenter.y, globeRadius * 0.98,
    globeCenter.x, globeCenter.y, globeRadius * 1.15
  )
  atmosphereGlow.addColorStop(0, 'rgba(100, 180, 255, 0.5)')
  atmosphereGlow.addColorStop(0.3, 'rgba(80, 150, 255, 0.3)')
  atmosphereGlow.addColorStop(0.6, 'rgba(60, 120, 255, 0.15)')
  atmosphereGlow.addColorStop(1, 'rgba(40, 100, 255, 0)')

  ctx.fillStyle = atmosphereGlow
  ctx.beginPath()
  ctx.arc(globeCenter.x, globeCenter.y, globeRadius * 1.15, 0, Math.PI * 2)
  ctx.fill()

  // 지구 바다
  const oceanGradient = ctx.createRadialGradient(
    globeCenter.x - globeRadius * 0.3, globeCenter.y - globeRadius * 0.3, 0,
    globeCenter.x, globeCenter.y, globeRadius
  )
  oceanGradient.addColorStop(0, 'rgba(30, 60, 100, 0.9)')
  oceanGradient.addColorStop(0.5, 'rgba(20, 50, 90, 0.85)')
  oceanGradient.addColorStop(1, 'rgba(15, 40, 80, 0.8)')

  ctx.fillStyle = oceanGradient
  ctx.beginPath()
  ctx.arc(globeCenter.x, globeCenter.y, globeRadius, 0, Math.PI * 2)
  ctx.fill()

  // 대륙 그리기
  const continentFill = 'rgba(40, 80, 60, 0.7)'
  const continentStroke = 'rgba(80, 160, 120, 0.5)'

  drawContinent(ctx, continentData.northAmerica, rotation, continentFill, continentStroke, globeState)
  drawContinent(ctx, continentData.southAmerica, rotation, continentFill, continentStroke, globeState)
  drawContinent(ctx, continentData.europe, rotation, continentFill, continentStroke, globeState)
  drawContinent(ctx, continentData.africa, rotation, continentFill, continentStroke, globeState)
  drawContinent(ctx, continentData.asia, rotation, continentFill, continentStroke, globeState)
  drawContinent(ctx, continentData.australia, rotation, continentFill, continentStroke, globeState)

  // 위도선
  ctx.globalAlpha = 0.15
  for (let lat = -60; lat <= 60; lat += 30) {
    drawLatitudeLine(ctx, lat, globeState)
  }
  ctx.globalAlpha = 1

  // 지구 하이라이트
  const highlight = ctx.createRadialGradient(
    globeCenter.x - globeRadius * 0.4, globeCenter.y - globeRadius * 0.4, 0,
    globeCenter.x - globeRadius * 0.4, globeCenter.y - globeRadius * 0.4, globeRadius * 0.8
  )
  highlight.addColorStop(0, 'rgba(255, 255, 255, 0.15)')
  highlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)')
  highlight.addColorStop(1, 'rgba(255, 255, 255, 0)')

  ctx.fillStyle = highlight
  ctx.beginPath()
  ctx.arc(globeCenter.x, globeCenter.y, globeRadius, 0, Math.PI * 2)
  ctx.fill()

  // 지구 외곽선
  ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(globeCenter.x, globeCenter.y, globeRadius, 0, Math.PI * 2)
  ctx.stroke()
}

// ============================================
// 호 연결선 그리기 함수
// ============================================
function drawArcConnection(ctx, node1, node2, opacity, globeState) {
  const midX = (node1.x + node2.x) / 2
  const midY = (node1.y + node2.y) / 2

  const dx = midX - globeState.globeCenter.x
  const dy = midY - globeState.globeCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  const arcHeight = 50 + dist * 0.2
  const controlX = midX + (dx / dist) * arcHeight
  const controlY = midY + (dy / dist) * arcHeight

  // 글로우 선
  ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.2})`
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(node1.x, node1.y)
  ctx.quadraticCurveTo(controlX, controlY, node2.x, node2.y)
  ctx.stroke()

  // 그라데이션 선
  const gradient = ctx.createLinearGradient(node1.x, node1.y, node2.x, node2.y)
  gradient.addColorStop(0, `rgba(100, 200, 255, ${opacity * 0.4})`)
  gradient.addColorStop(0.5, `rgba(180, 230, 255, ${opacity * 0.9})`)
  gradient.addColorStop(1, `rgba(100, 200, 255, ${opacity * 0.4})`)

  ctx.strokeStyle = gradient
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(node1.x, node1.y)
  ctx.quadraticCurveTo(controlX, controlY, node2.x, node2.y)
  ctx.stroke()
}

// ============================================
// 연결선 그리기 함수
// ============================================
function drawConnections(ctx, visibleNodes, particles, mouse, props, globeState) {
  // 도시 간 연결
  for (let i = 0; i < visibleNodes.length; i++) {
    for (let j = i + 1; j < visibleNodes.length; j++) {
      const n1 = visibleNodes[i]
      const n2 = visibleNodes[j]
      const dist = Math.sqrt((n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2)

      if (dist < 350 && dist > 60) {
        const baseOpacity = (1 - dist / 350) * Math.min(n1.opacity, n2.opacity) * 0.8

        let mouseBoost = 0
        if (mouse.x !== null && mouse.y !== null) {
          const midX = (n1.x + n2.x) / 2
          const midY = (n1.y + n2.y) / 2
          const mouseDist = Math.sqrt((mouse.x - midX) ** 2 + (mouse.y - midY) ** 2)
          if (mouseDist < props.mouseRadius) {
            mouseBoost = (1 - mouseDist / props.mouseRadius) * 0.5
          }
        }

        drawArcConnection(ctx, n1, n2, baseOpacity + mouseBoost, globeState)
      }
    }
  }

  // 텍스트와 지구 노드 연결
  particles.forEach(particle => {
    if (!particle.connectedToGlobe || visibleNodes.length === 0) return

    let nearest = null
    let minDist = Infinity
    visibleNodes.forEach(node => {
      const dist = Math.sqrt((particle.x - node.x) ** 2 + (particle.y - node.y) ** 2)
      if (dist < minDist && dist < 450) {
        minDist = dist
        nearest = node
      }
    })

    if (nearest && minDist > 30) {
      let opacity = (1 - minDist / 450) * particle.opacity * 0.5

      if (mouse.x !== null && mouse.y !== null) {
        const mouseDist = Math.sqrt((mouse.x - particle.x) ** 2 + (mouse.y - particle.y) ** 2)
        if (mouseDist < props.mouseRadius) {
          opacity += (1 - mouseDist / props.mouseRadius) * 0.3
        }
      }

      const midX = (particle.x + nearest.x) / 2
      const midY = (particle.y + nearest.y) / 2 - 50

      ctx.strokeStyle = `rgba(100, 180, 255, ${opacity * 0.25})`
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.quadraticCurveTo(midX, midY, nearest.x, nearest.y)
      ctx.stroke()

      const gradient = ctx.createLinearGradient(particle.x, particle.y, nearest.x, nearest.y)
      gradient.addColorStop(0, `rgba(180, 220, 255, ${opacity * 0.5})`)
      gradient.addColorStop(0.5, `rgba(120, 200, 255, ${opacity})`)
      gradient.addColorStop(1, `rgba(255, 200, 100, ${opacity * 0.8})`)

      ctx.strokeStyle = gradient
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(particle.x, particle.y)
      ctx.quadraticCurveTo(midX, midY, nearest.x, nearest.y)
      ctx.stroke()
    }
  })
}

// ============================================
// Main Composable
// ============================================
export function useTextParticles(canvasRef, props) {
  let ctx = null
  let particles = []
  let globeNodes = []
  let flowParticles = []
  let animationId = null
  let mouse = { x: null, y: null }

  const canvasState = { width: 0, height: 0 }
  const globeState = { globeCenter: { x: 0, y: 0 }, globeRadius: 0 }
  let rotation = 0

  const init = () => {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    ctx = canvas.getContext('2d')

    const resize = () => {
      canvasState.width = canvas.offsetWidth
      canvasState.height = canvas.offsetHeight
      canvas.width = canvasState.width * window.devicePixelRatio
      canvas.height = canvasState.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

      // 지구본 크기와 위치
      globeState.globeRadius = Math.min(canvasState.width * 1.0, canvasState.height * 1.1, 700)
      globeState.globeCenter.x = canvasState.width / 2
      globeState.globeCenter.y = canvasState.height + globeState.globeRadius * 0.35
    }
    resize()
    window.addEventListener('resize', resize)

    // 도시 노드 생성
    globeNodes = cityData.map(city => new GlobeNode(city.lat, city.lon, city.size, city.name, globeState))

    // 텍스트 파티클 생성
    particles = []
    for (let i = 0; i < props.particleCount; i++) {
      particles.push(new TextParticle(props.texts, props, canvasState))
    }

    // 마우스 이벤트
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    })
    canvas.addEventListener('mouseleave', () => {
      mouse.x = null
      mouse.y = null
    })

    // 애니메이션 루프
    const animate = (time) => {
      ctx.clearRect(0, 0, canvasState.width, canvasState.height)

      rotation += 0.12

      // 지구본 그리기
      drawGlobe(ctx, rotation, globeState)

      // 노드 그리기 및 위치 수집
      const visibleNodes = []
      globeNodes.forEach(node => {
        node.update(time)
        const pos = node.draw(ctx, rotation)
        if (pos && pos.visible) {
          visibleNodes.push(pos)
        }
      })

      // 연결선 그리기
      drawConnections(ctx, visibleNodes, particles, mouse, props, globeState)

      // 플로우 파티클 생성
      if (Math.random() < 0.04 && visibleNodes.length >= 2) {
        const i = Math.floor(Math.random() * visibleNodes.length)
        let j = Math.floor(Math.random() * visibleNodes.length)
        if (i !== j) {
          flowParticles.push(new FlowParticle(visibleNodes[i], visibleNodes[j], globeState))
        }
      }

      // 플로우 파티클 업데이트 및 그리기
      flowParticles = flowParticles.filter(fp => {
        const alive = fp.update()
        if (alive) fp.draw(ctx)
        return alive
      })

      // 텍스트 파티클
      particles.forEach(p => {
        p.update(mouse)
        p.draw(ctx)
      })

      animationId = requestAnimationFrame(animate)
    }
    animate(0)
  }

  const cleanup = () => {
    if (animationId) cancelAnimationFrame(animationId)
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(() => init())
  onUnmounted(() => cleanup())
}
