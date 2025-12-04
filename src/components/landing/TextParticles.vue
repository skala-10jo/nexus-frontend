<template>
  <canvas
    ref="canvasRef"
    class="absolute inset-0 w-full h-full"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  texts: {
    type: Array,
    default: () => [
      'Hello', '안녕하세요', 'こんにちは', '你好', 'Bonjour', 'Hola',
      'Guten Tag', 'Ciao', 'Olá', 'Здравствуйте', 'مرحبا', 'नमस्ते',
      'Thank you', '감사합니다', 'ありがとう', '谢谢', 'Merci', 'Gracias',
      'Danke', 'Grazie', 'Obrigado', 'Спасибо', 'شكراً', 'धन्यवाद',
      'Nice to meet you', '만나서 반갑습니다', 'はじめまして',
      'Welcome', '환영합니다', 'Bienvenue', 'Willkommen',
      'Good morning', '좋은 아침입니다', 'Buongiorno',
      'Let\'s collaborate', '협업해요', '一緒に頑張りましょう',
      'Great work', '잘했어요', 'Excellent travail'
    ]
  },
  particleCount: { type: Number, default: 35 },
  mouseRadius: { type: Number, default: 150 },
  minFontSize: { type: Number, default: 11 },
  maxFontSize: { type: Number, default: 16 }
})

const canvasRef = ref(null)
let ctx = null
let particles = []
let globeNodes = []
let animationId = null
let mouse = { x: null, y: null }
let canvasWidth = 0
let canvasHeight = 0
let globeCenter = { x: 0, y: 0 }
let globeRadius = 0
let rotation = 0

// 세계 대륙 좌표 데이터 (단순화된 폴리곤)
const continentData = {
  // 북아메리카
  northAmerica: [
    { lat: 49, lon: -125 }, { lat: 60, lon: -140 }, { lat: 70, lon: -140 },
    { lat: 72, lon: -100 }, { lat: 70, lon: -80 }, { lat: 60, lon: -75 },
    { lat: 50, lon: -55 }, { lat: 45, lon: -65 }, { lat: 30, lon: -80 },
    { lat: 25, lon: -80 }, { lat: 25, lon: -98 }, { lat: 30, lon: -117 },
    { lat: 35, lon: -120 }, { lat: 49, lon: -125 }
  ],
  // 남아메리카
  southAmerica: [
    { lat: 12, lon: -72 }, { lat: 5, lon: -77 }, { lat: -5, lon: -80 },
    { lat: -15, lon: -75 }, { lat: -25, lon: -70 }, { lat: -40, lon: -73 },
    { lat: -55, lon: -68 }, { lat: -55, lon: -65 }, { lat: -40, lon: -62 },
    { lat: -35, lon: -57 }, { lat: -25, lon: -48 }, { lat: -10, lon: -35 },
    { lat: 0, lon: -50 }, { lat: 5, lon: -55 }, { lat: 10, lon: -62 },
    { lat: 12, lon: -72 }
  ],
  // 유럽
  europe: [
    { lat: 71, lon: 28 }, { lat: 70, lon: 30 }, { lat: 60, lon: 30 },
    { lat: 55, lon: 22 }, { lat: 50, lon: 20 }, { lat: 45, lon: 15 },
    { lat: 40, lon: 0 }, { lat: 36, lon: -5 }, { lat: 43, lon: -9 },
    { lat: 48, lon: -5 }, { lat: 51, lon: 2 }, { lat: 58, lon: -5 },
    { lat: 60, lon: 5 }, { lat: 65, lon: 12 }, { lat: 71, lon: 25 },
    { lat: 71, lon: 28 }
  ],
  // 아프리카
  africa: [
    { lat: 37, lon: 10 }, { lat: 32, lon: 32 }, { lat: 22, lon: 37 },
    { lat: 12, lon: 44 }, { lat: 0, lon: 42 }, { lat: -12, lon: 44 },
    { lat: -25, lon: 35 }, { lat: -35, lon: 20 }, { lat: -34, lon: 18 },
    { lat: -30, lon: 17 }, { lat: -15, lon: 12 }, { lat: 5, lon: 10 },
    { lat: 5, lon: -5 }, { lat: 15, lon: -17 }, { lat: 22, lon: -17 },
    { lat: 28, lon: -10 }, { lat: 35, lon: -5 }, { lat: 37, lon: 10 }
  ],
  // 아시아
  asia: [
    { lat: 77, lon: 100 }, { lat: 75, lon: 140 }, { lat: 70, lon: 170 },
    { lat: 65, lon: 170 }, { lat: 55, lon: 160 }, { lat: 45, lon: 140 },
    { lat: 35, lon: 130 }, { lat: 35, lon: 140 }, { lat: 30, lon: 130 },
    { lat: 22, lon: 120 }, { lat: 8, lon: 105 }, { lat: 1, lon: 104 },
    { lat: 5, lon: 95 }, { lat: 15, lon: 100 }, { lat: 20, lon: 90 },
    { lat: 22, lon: 70 }, { lat: 25, lon: 62 }, { lat: 30, lon: 50 },
    { lat: 40, lon: 45 }, { lat: 42, lon: 50 }, { lat: 50, lon: 55 },
    { lat: 55, lon: 60 }, { lat: 60, lon: 70 }, { lat: 70, lon: 75 },
    { lat: 77, lon: 100 }
  ],
  // 호주
  australia: [
    { lat: -12, lon: 130 }, { lat: -15, lon: 140 }, { lat: -20, lon: 148 },
    { lat: -25, lon: 153 }, { lat: -35, lon: 150 }, { lat: -38, lon: 145 },
    { lat: -35, lon: 138 }, { lat: -32, lon: 133 }, { lat: -30, lon: 115 },
    { lat: -22, lon: 114 }, { lat: -15, lon: 125 }, { lat: -12, lon: 130 }
  ]
}

// 주요 도시 데이터 (위도, 경도, 중요도)
const cityData = [
  // 아시아 주요 도시
  { lat: 37.5665, lon: 126.9780, size: 1.0, name: 'Seoul' },
  { lat: 35.6762, lon: 139.6503, size: 1.0, name: 'Tokyo' },
  { lat: 31.2304, lon: 121.4737, size: 0.95, name: 'Shanghai' },
  { lat: 39.9042, lon: 116.4074, size: 0.9, name: 'Beijing' },
  { lat: 22.3193, lon: 114.1694, size: 0.85, name: 'Hong Kong' },
  { lat: 1.3521, lon: 103.8198, size: 0.8, name: 'Singapore' },
  { lat: 28.6139, lon: 77.2090, size: 0.85, name: 'New Delhi' },
  { lat: 19.0760, lon: 72.8777, size: 0.8, name: 'Mumbai' },
  { lat: 13.7563, lon: 100.5018, size: 0.7, name: 'Bangkok' },
  { lat: 35.1796, lon: 129.0756, size: 0.6, name: 'Busan' },
  { lat: 34.6937, lon: 135.5023, size: 0.6, name: 'Osaka' },
  { lat: 25.0330, lon: 121.5654, size: 0.7, name: 'Taipei' },
  // 유럽 주요 도시
  { lat: 51.5074, lon: -0.1278, size: 1.0, name: 'London' },
  { lat: 48.8566, lon: 2.3522, size: 0.95, name: 'Paris' },
  { lat: 52.5200, lon: 13.4050, size: 0.85, name: 'Berlin' },
  { lat: 55.7558, lon: 37.6173, size: 0.9, name: 'Moscow' },
  { lat: 41.9028, lon: 12.4964, size: 0.75, name: 'Rome' },
  { lat: 40.4168, lon: -3.7038, size: 0.75, name: 'Madrid' },
  { lat: 52.3676, lon: 4.9041, size: 0.7, name: 'Amsterdam' },
  { lat: 59.9139, lon: 10.7522, size: 0.6, name: 'Oslo' },
  { lat: 59.3293, lon: 18.0686, size: 0.6, name: 'Stockholm' },
  // 북미 주요 도시
  { lat: 40.7128, lon: -74.0060, size: 1.0, name: 'New York' },
  { lat: 34.0522, lon: -118.2437, size: 0.9, name: 'Los Angeles' },
  { lat: 37.7749, lon: -122.4194, size: 0.85, name: 'San Francisco' },
  { lat: 41.8781, lon: -87.6298, size: 0.8, name: 'Chicago' },
  { lat: 43.6532, lon: -79.3832, size: 0.75, name: 'Toronto' },
  { lat: 49.2827, lon: -123.1207, size: 0.65, name: 'Vancouver' },
  { lat: 25.7617, lon: -80.1918, size: 0.7, name: 'Miami' },
  { lat: 29.7604, lon: -95.3698, size: 0.7, name: 'Houston' },
  { lat: 47.6062, lon: -122.3321, size: 0.7, name: 'Seattle' },
  // 남미 주요 도시
  { lat: -23.5505, lon: -46.6333, size: 0.85, name: 'São Paulo' },
  { lat: -22.9068, lon: -43.1729, size: 0.75, name: 'Rio de Janeiro' },
  { lat: -34.6037, lon: -58.3816, size: 0.75, name: 'Buenos Aires' },
  { lat: -33.4489, lon: -70.6693, size: 0.65, name: 'Santiago' },
  { lat: 4.7110, lon: -74.0721, size: 0.6, name: 'Bogotá' },
  { lat: -12.0464, lon: -77.0428, size: 0.6, name: 'Lima' },
  // 호주/오세아니아
  { lat: -33.8688, lon: 151.2093, size: 0.8, name: 'Sydney' },
  { lat: -37.8136, lon: 144.9631, size: 0.7, name: 'Melbourne' },
  { lat: -36.8485, lon: 174.7633, size: 0.55, name: 'Auckland' },
  // 중동/아프리카
  { lat: 25.2048, lon: 55.2708, size: 0.8, name: 'Dubai' },
  { lat: 41.0082, lon: 28.9784, size: 0.75, name: 'Istanbul' },
  { lat: -33.9249, lon: 18.4241, size: 0.65, name: 'Cape Town' },
  { lat: 30.0444, lon: 31.2357, size: 0.7, name: 'Cairo' },
  { lat: -1.2921, lon: 36.8219, size: 0.55, name: 'Nairobi' },
  { lat: 6.5244, lon: 3.3792, size: 0.6, name: 'Lagos' }
]

// 지구본 위의 노드 (3D 구체 투영)
class GlobeNode {
  constructor(lat, lon, size = 1, name = '') {
    this.lat = lat
    this.lon = lon
    this.name = name
    this.baseOpacity = 0.6 + Math.random() * 0.3
    this.opacity = this.baseOpacity
    this.pulsePhase = Math.random() * Math.PI * 2
    this.size = (3 + size * 4) // 도시 중요도에 따른 크기
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

    const screenX = globeCenter.x + pos.x * globeRadius
    const screenY = globeCenter.y - pos.y * globeRadius

    return { x: screenX, y: screenY, z: pos.z, visible }
  }

  update(time) {
    this.opacity = this.baseOpacity + Math.sin(time * 0.002 + this.pulsePhase) * 0.15
  }

  draw(ctx, rotation, time) {
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

    // 밝은 중심점 (노란색/주황색 - 도시 불빛)
    ctx.fillStyle = `rgba(255, 240, 200, ${finalOpacity})`
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, this.size * 0.8, 0, Math.PI * 2)
    ctx.fill()

    return { ...pos, opacity: finalOpacity, size: this.size }
  }
}

// 텍스트 파티클
class TextParticle {
  constructor(texts) {
    this.text = texts[Math.floor(Math.random() * texts.length)]
    this.fontSize = props.minFontSize + Math.random() * (props.maxFontSize - props.minFontSize)
    this.reset()
  }

  reset() {
    this.x = Math.random() * canvasWidth
    this.y = Math.random() * canvasHeight * 0.5
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = (Math.random() - 0.5) * 0.4
    this.opacity = 0.15 + Math.random() * 0.25
    this.targetOpacity = this.opacity
    this.connectedToGlobe = Math.random() > 0.3
  }

  update() {
    this.x += this.vx
    this.y += this.vy

    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x
      const dy = mouse.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < props.mouseRadius) {
        const intensity = 1 - dist / props.mouseRadius
        this.targetOpacity = 0.6 + intensity * 0.4
      } else {
        this.targetOpacity = 0.15 + Math.random() * 0.15
      }
    }

    this.opacity += (this.targetOpacity - this.opacity) * 0.05

    if (this.x < -100 || this.x > canvasWidth + 100 ||
        this.y < -50 || this.y > canvasHeight * 0.55) {
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

// 대륙 그리기 (3D 투영)
function drawContinent(ctx, continentPoints, rotation, fillColor, strokeColor) {
  ctx.beginPath()
  let started = false
  let firstPoint = null
  let lastVisible = false

  continentPoints.forEach((point, index) => {
    const phi = (90 - point.lat) * (Math.PI / 180)
    const theta = (point.lon + rotation) * (Math.PI / 180)

    const x = Math.sin(phi) * Math.cos(theta)
    const y = Math.cos(phi)
    const z = Math.sin(phi) * Math.sin(theta)

    const screenX = globeCenter.x + x * globeRadius
    const screenY = globeCenter.y - y * globeRadius
    const visible = z > -0.1

    if (index === 0) {
      firstPoint = { x: screenX, y: screenY, visible }
      ctx.moveTo(screenX, screenY)
      started = true
    } else {
      if (visible || lastVisible) {
        ctx.lineTo(screenX, screenY)
      } else {
        ctx.moveTo(screenX, screenY)
      }
    }
    lastVisible = visible
  })

  // 채우기 (반투명)
  ctx.fillStyle = fillColor
  ctx.fill()

  // 외곽선
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 1.5
  ctx.stroke()
}

// 3D 지구본 그리기
function drawGlobe(ctx, time) {
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

  // 대기권 글로우 (파란색 외곽)
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

  // 지구 바다 (어두운 파란색)
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

  drawContinent(ctx, continentData.northAmerica, rotation, continentFill, continentStroke)
  drawContinent(ctx, continentData.southAmerica, rotation, continentFill, continentStroke)
  drawContinent(ctx, continentData.europe, rotation, continentFill, continentStroke)
  drawContinent(ctx, continentData.africa, rotation, continentFill, continentStroke)
  drawContinent(ctx, continentData.asia, rotation, continentFill, continentStroke)
  drawContinent(ctx, continentData.australia, rotation, continentFill, continentStroke)

  // 위도선들 (희미하게)
  ctx.globalAlpha = 0.15
  for (let lat = -60; lat <= 60; lat += 30) {
    drawLatitudeLine(ctx, lat, rotation)
  }
  ctx.globalAlpha = 1

  // 지구 하이라이트 (빛 반사)
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

// 위도선 그리기 (3D)
function drawLatitudeLine(ctx, lat, rotation) {
  const phi = (90 - lat) * (Math.PI / 180)
  const r = Math.sin(phi) * globeRadius
  const y = globeCenter.y - Math.cos(phi) * globeRadius

  ctx.strokeStyle = 'rgba(100, 180, 255, 0.3)'
  ctx.lineWidth = 0.5
  ctx.beginPath()
  ctx.ellipse(globeCenter.x, y, r, r * 0.25, 0, 0, Math.PI * 2)
  ctx.stroke()
}

// 호 연결선 그리기 (도시 간 네트워크)
function drawArcConnection(ctx, node1, node2, opacity) {
  const midX = (node1.x + node2.x) / 2
  const midY = (node1.y + node2.y) / 2

  const dx = midX - globeCenter.x
  const dy = midY - globeCenter.y
  const dist = Math.sqrt(dx * dx + dy * dy)

  // 호의 높이 (지구 표면 위로 올라가는 정도)
  const arcHeight = 50 + dist * 0.2
  const controlX = midX + (dx / dist) * arcHeight
  const controlY = midY + (dy / dist) * arcHeight

  // 글로우 선 (넓게)
  ctx.strokeStyle = `rgba(100, 200, 255, ${opacity * 0.2})`
  ctx.lineWidth = 6
  ctx.beginPath()
  ctx.moveTo(node1.x, node1.y)
  ctx.quadraticCurveTo(controlX, controlY, node2.x, node2.y)
  ctx.stroke()

  // 그라데이션 선 (메인)
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

// 연결선 그리기
function drawConnections(ctx, visibleNodes, time) {
  // 주요 도시 간 연결 (더 많은 연결)
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

        drawArcConnection(ctx, n1, n2, baseOpacity + mouseBoost)
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

// 데이터 흐름 파티클 (선 위를 이동하는 빛)
let flowParticles = []

class FlowParticle {
  constructor(startNode, endNode) {
    this.startNode = startNode
    this.endNode = endNode
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

    const dx = midX - globeCenter.x
    const dy = midY - globeCenter.y
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

const init = () => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  ctx = canvas.getContext('2d')

  const resize = () => {
    canvasWidth = canvas.offsetWidth
    canvasHeight = canvas.offsetHeight
    canvas.width = canvasWidth * window.devicePixelRatio
    canvas.height = canvasHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // 지구본 크기와 위치 (더 크게 - 화면의 약 80%)
    globeRadius = Math.min(canvasWidth * 1.0, canvasHeight * 1.1, 700)
    globeCenter.x = canvasWidth / 2
    // 지구 상단이 화면 약 35% 지점에 (더 많이 보이게)
    globeCenter.y = canvasHeight + globeRadius * 0.35
  }
  resize()
  window.addEventListener('resize', resize)

  // 도시 데이터로 노드 생성
  globeNodes = cityData.map(city => new GlobeNode(city.lat, city.lon, city.size, city.name))

  // 텍스트 파티클 생성
  particles = []
  for (let i = 0; i < props.particleCount; i++) {
    particles.push(new TextParticle(props.texts))
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

  // 애니메이션
  const animate = (time) => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    rotation += 0.12

    // 지구본 그리기
    drawGlobe(ctx, time)

    // 지구본 노드 그리기 및 위치 수집
    const visibleNodes = []
    globeNodes.forEach(node => {
      node.update(time)
      const pos = node.draw(ctx, rotation, time)
      if (pos && pos.visible) {
        visibleNodes.push(pos)
      }
    })

    // 연결선 그리기
    drawConnections(ctx, visibleNodes, time)

    // 플로우 파티클 생성 (가끔씩)
    if (Math.random() < 0.04 && visibleNodes.length >= 2) {
      const i = Math.floor(Math.random() * visibleNodes.length)
      let j = Math.floor(Math.random() * visibleNodes.length)
      if (i !== j) {
        flowParticles.push(new FlowParticle(visibleNodes[i], visibleNodes[j]))
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
      p.update()
      p.draw(ctx)
    })

    animationId = requestAnimationFrame(animate)
  }
  animate(0)
}

onMounted(() => init())
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>
