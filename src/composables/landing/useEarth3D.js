/**
 * Earth3D Three.js 로직
 *
 * @description 3D 지구본 렌더링 및 애니메이션
 */
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
  EARTH_RADIUS,
  SEGMENTS,
  CITIES,
  GREETINGS,
  TEXTURE_URLS,
  atmosphereVertexShader,
  atmosphereFragmentShader,
  lineVertexShader,
  lineFragmentShader
} from '@/components/landing/data/earth3DData'

export function useEarth3D(containerRef) {
  const isLoading = ref(true)

  // Three.js variables
  let scene, camera, renderer, controls
  let earthGroup, earthMesh, atmosphereMesh, cloudsMesh
  let starsMesh
  let nodesGroup, arcsGroup
  let raycaster, mouse
  let animationFrameId
  let lineMaterial

  // ============================================
  // Helper Functions
  // ============================================
  const latLonToVector3 = (lat, lon, radius) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lon + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = (radius * Math.sin(phi) * Math.sin(theta))
    const y = (radius * Math.cos(phi))
    return new THREE.Vector3(x, y, z)
  }

  const createStars = () => {
    const geometry = new THREE.BufferGeometry()
    const vertices = []
    for (let i = 0; i < 20000; i++) {
      vertices.push(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloatSpread(150),
        THREE.MathUtils.randFloatSpread(600)
      )
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.3, 'rgba(200, 220, 255, 0.4)')
    gradient.addColorStop(0.6, 'rgba(150, 180, 255, 0.15)')
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)
    const texture = new THREE.CanvasTexture(canvas)

    const material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.8,
      map: texture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    starsMesh = new THREE.Points(geometry, material)
    scene.add(starsMesh)
  }

  const createArc = (city1, city2) => {
    const start = latLonToVector3(city1.lat, city1.lon, EARTH_RADIUS)
    const end = latLonToVector3(city2.lat, city2.lon, EARTH_RADIUS)

    const dist = start.distanceTo(end)
    const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + dist * 0.4)

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
    const points = curve.getPoints(50)
    const geometry = new THREE.BufferGeometry().setFromPoints(points)

    const percents = []
    for (let i = 0; i <= 50; i++) {
      percents.push(i / 50)
    }
    geometry.setAttribute('percent', new THREE.Float32BufferAttribute(percents, 1))

    const line = new THREE.Line(geometry, lineMaterial)
    arcsGroup.add(line)
  }

  const createNodesAndArcs = () => {
    const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16)
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })

    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
    grad.addColorStop(0, 'rgba(0, 255, 255, 1)')
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 32, 32)
    const glowTexture = new THREE.CanvasTexture(canvas)

    const glowGeo = new THREE.PlaneGeometry(1.0, 1.0)
    const glowMat = new THREE.MeshBasicMaterial({
      map: glowTexture,
      color: 0x00ffff,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    })

    CITIES.forEach(city => {
      const pos = latLonToVector3(city.lat, city.lon, EARTH_RADIUS)

      const node = new THREE.Mesh(nodeGeo, nodeMat)
      node.position.copy(pos)
      nodesGroup.add(node)

      const glow = new THREE.Mesh(glowGeo, glowMat)
      glow.position.copy(pos.clone().multiplyScalar(1.01))
      glow.lookAt(pos.clone().multiplyScalar(2))
      nodesGroup.add(glow)

      glow.userData = {
        baseScale: 1,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        offset: Math.random() * Math.PI
      }
    })

    for (let i = 0; i < CITIES.length; i++) {
      for (let j = i + 1; j < CITIES.length; j++) {
        if (Math.random() > 0.85) {
          createArc(CITIES[i], CITIES[j])
        }
      }
    }
  }

  const createFloatingText = () => {
    const allGreetings = [...GREETINGS, ...GREETINGS, ...GREETINGS, ...GREETINGS]

    allGreetings.forEach((text, index) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 64
      ctx.font = 'Bold 32px Inter, sans-serif'
      ctx.fillStyle = 'white'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.shadowColor = '#00ffff'
      ctx.shadowBlur = 10
      ctx.fillText(text, 128, 32)

      const texture = new THREE.CanvasTexture(canvas)
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: 0.7 })
      const sprite = new THREE.Sprite(material)

      const phi = Math.acos(-1 + (2 * index) / allGreetings.length)
      const theta = Math.sqrt(allGreetings.length * Math.PI) * phi
      const r = EARTH_RADIUS + 5 + Math.random() * 40

      sprite.position.setFromSphericalCoords(r, phi, theta)
      sprite.scale.set(4, 1, 1)

      earthGroup.add(sprite)

      if (r < EARTH_RADIUS + 15) {
        let nearestCity = CITIES[0]
        let minDst = Infinity
        CITIES.forEach(city => {
          const cityPos = latLonToVector3(city.lat, city.lon, EARTH_RADIUS)
          const d = cityPos.distanceTo(sprite.position)
          if (d < minDst) {
            minDst = d
            nearestCity = city
          }
        })

        if (minDst < 15) {
          const cityPos = latLonToVector3(nearestCity.lat, nearestCity.lon, EARTH_RADIUS)
          const start = sprite.position
          const end = cityPos
          const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + minDst * 0.2)
          const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
          const points = curve.getPoints(20)
          const geometry = new THREE.BufferGeometry().setFromPoints(points)

          const percents = []
          for (let i = 0; i <= 20; i++) {
            percents.push(i / 20)
          }
          geometry.setAttribute('percent', new THREE.Float32BufferAttribute(percents, 1))

          const line = new THREE.Line(geometry, lineMaterial)
          earthGroup.add(line)
        }
      }
    })
  }

  // ============================================
  // Animation Loop
  // ============================================
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate)

    if (controls) controls.update()
    if (cloudsMesh) cloudsMesh.rotation.y += 0.0003

    if (lineMaterial) {
      lineMaterial.uniforms.time.value = performance.now() * 0.001
    }

    nodesGroup.children.forEach(child => {
      if (child.userData && child.userData.pulseSpeed) {
        const scale = child.userData.baseScale + Math.sin(Date.now() * 0.003 + child.userData.offset) * 0.3
        child.scale.set(scale, scale, scale)
      }
    })

    raycaster.setFromCamera(mouse, camera)
    const intersects = raycaster.intersectObjects(earthGroup.children, true)

    if (intersects.length > 0) {
      document.body.style.cursor = 'pointer'
    } else {
      document.body.style.cursor = 'default'
    }

    renderer.render(scene, camera)
  }

  // ============================================
  // Event Handlers
  // ============================================
  const onWindowResize = () => {
    if (!containerRef.value || !camera || !renderer) return
    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }

  const onMouseMove = (event) => {
    if (!containerRef.value) return
    const rect = containerRef.value.getBoundingClientRect()
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  // ============================================
  // Init
  // ============================================
  const init = () => {
    if (!containerRef.value) return

    scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.02)

    const width = containerRef.value.clientWidth
    const height = containerRef.value.clientHeight
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
    camera.position.set(0, 0, 30)

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    containerRef.value.appendChild(renderer.domElement)

    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableRotate = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.minPolarAngle = Math.PI / 2 - 0.5
    controls.maxPolarAngle = Math.PI / 2 + 0.5

    // Lights
    const ambientLight = new THREE.AmbientLight(0x888888)
    scene.add(ambientLight)
    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0)
    sunLight.position.set(10, 10, 10)
    scene.add(sunLight)
    const spotLight = new THREE.SpotLight(0x4aa8ff, 3)
    spotLight.position.set(0, 10, 20)
    scene.add(spotLight)

    // Groups
    earthGroup = new THREE.Group()
    earthGroup.position.y = -26.5
    earthGroup.rotation.z = 0 * Math.PI / 180
    scene.add(earthGroup)

    nodesGroup = new THREE.Group()
    earthGroup.add(nodesGroup)

    arcsGroup = new THREE.Group()
    earthGroup.add(arcsGroup)

    // Shared Line Material
    lineMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0xffffff) }
      },
      vertexShader: lineVertexShader,
      fragmentShader: lineFragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    // Load Textures
    const textureLoader = new THREE.TextureLoader()
    let loadedCount = 0
    const checkLoad = () => {
      loadedCount++
      if (loadedCount === 4) isLoading.value = false
    }

    // Earth
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, SEGMENTS, SEGMENTS)
    const earthMat = new THREE.MeshPhongMaterial({
      map: textureLoader.load(TEXTURE_URLS.map, checkLoad),
      specularMap: textureLoader.load(TEXTURE_URLS.specular, checkLoad),
      normalMap: textureLoader.load(TEXTURE_URLS.normal, checkLoad),
      specular: new THREE.Color(0x333333),
      shininess: 15
    })
    earthMesh = new THREE.Mesh(earthGeo, earthMat)
    earthGroup.add(earthMesh)

    // Atmosphere
    const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.2, SEGMENTS, SEGMENTS)
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    })
    atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat)
    earthGroup.add(atmosphereMesh)

    // Clouds
    const cloudsGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.05, SEGMENTS, SEGMENTS)
    const cloudsMat = new THREE.MeshPhongMaterial({
      map: textureLoader.load(TEXTURE_URLS.clouds, checkLoad),
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
    cloudsMesh = new THREE.Mesh(cloudsGeo, cloudsMat)
    earthGroup.add(cloudsMesh)

    // Stars, Nodes, Arcs, Text
    createStars()
    createNodesAndArcs()
    createFloatingText()

    // Interaction
    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    animate()
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(() => {
    init()
    window.addEventListener('resize', onWindowResize)
    window.addEventListener('mousemove', onMouseMove)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onWindowResize)
    window.removeEventListener('mousemove', onMouseMove)
    cancelAnimationFrame(animationFrameId)
    if (renderer) {
      renderer.dispose()
    }
  })

  return {
    isLoading
  }
}
