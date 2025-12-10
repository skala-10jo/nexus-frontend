<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden bg-black">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center text-white z-20">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
    
    <!-- UI Overlay -->
    <div class="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
      <div class="text-center px-6 w-full max-w-4xl mx-auto">
        <!-- Logo with SplitText Animation -->
        <div class="w-full flex justify-center mb-4 pointer-events-auto">
          <SplitText
            text="NexUS"
            class="text-8xl md:text-9xl font-thin text-white tracking-widest"
            :delay="80"
            :duration="2.8"
            ease="power3.out"
            split-type="chars"
            :from="{ opacity: 0, y: 50, rotateX: -90 }"
            :to="{ opacity: 1, y: 0, rotateX: 0 }"
            :auto-play="true"
            text-align="center"
            style="font-family: 'Orbitron', sans-serif !important; text-shadow: 0 0 40px rgba(255, 255, 255, 0.3);"
          />
        </div>

        <!-- Tagline with TextType Animation -->
        <div class="w-full flex justify-center mb-24 pointer-events-auto">
          <TextType
            :text="['Collaborate Beyond Language']"
            :typingSpeed="50"
            :pauseDuration="3000"
            :showCursor="true"
            cursorCharacter="|"
            :loop="false"
            :initialDelay="800"
            class="text-xl md:text-3xl text-gray-200 font-light tracking-wide"
            style="font-family: 'Inter', sans-serif !important; text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);"
          />
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 justify-center pointer-events-auto mt-12">
          <router-link
            to="/login"
            class="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
          >
            시작하기
          </router-link>
          <button
            @click="$emit('scrollToFeatures')"
            class="px-10 py-4 border border-white/30 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-300 shadow-lg backdrop-blur-sm"
          >
            기능 살펴보기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import SplitText from '@/components/common/effects/SplitText.vue'
import TextType from '@/components/common/effects/TextType.vue'

const containerRef = ref(null)
const isLoading = ref(true)
const emit = defineEmits(['scrollToFeatures'])

// Three.js variables
let scene, camera, renderer, controls
let earthGroup, earthMesh, atmosphereMesh, cloudsMesh
let starsMesh
let nodesGroup, arcsGroup, textParticlesGroup
let raycaster, mouse
let animationFrameId
let lineMaterial // Shared shader material

// Constants
const EARTH_RADIUS = 24 // Smaller as requested
const SEGMENTS = 64
// Expanded City List (More dense)
const CITIES = [
  { name: 'Seoul', lat: 37.5665, lon: 126.9780 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'New York', lat: 40.7128, lon: -74.0060 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Sao Paulo', lat: -23.5505, lon: -46.6333 },
  { name: 'Cairo', lat: 30.0444, lon: 31.2357 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Moscow', lat: 55.7558, lon: 37.6173 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Berlin', lat: 52.5200, lon: 13.4050 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
  { name: 'Jakarta', lat: -6.2088, lon: 106.8456 },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Mexico City', lat: 19.4326, lon: -99.1332 },
  { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', lat: -1.2921, lon: 36.8219 },
  { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
  { name: 'Tehran', lat: 35.6892, lon: 51.3890 },
  { name: 'Karachi', lat: 24.8607, lon: 67.0011 },
  { name: 'Dhaka', lat: 23.8103, lon: 90.4125 },
  { name: 'Manila', lat: 14.5995, lon: 120.9842 },
  { name: 'Osaka', lat: 34.6937, lon: 135.5023 },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },
  { name: 'Lima', lat: -12.0464, lon: -77.0428 },
  { name: 'Santiago', lat: -33.4489, lon: -70.6693 },
  { name: 'Bogota', lat: 4.7110, lon: -74.0721 }
]
const GREETINGS = [
  "Hello", "안녕하세요", "Bonjour", "Hola", "Ciao", "Olá", "你好", "こんにちは", "Xin chào", "Sawasdee",
  "Namaste", "Salaam", "Zdravstvuyte", "Guten Tag", "Merhaba", "Jambo", "Szia", "Hej", "Hallo", "Aloha",
  "Shalom", "Terve", "Selamat", "Mabuhay", "Sawubona", "Mingalaba", "Sain Bainuu", "Barev", "Gamarjoba", "Ayubowan",
  "Privet", "Nǐ hǎo", "Konnichiwa", "Bongu", "Dia dhuit", "Hallå", "Sveiki", "Moien", "Bonjou"
]

// Texture URLs
const TEXTURE_URLS = {
  map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  normal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
}

// Shaders
const vertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const fragmentShader = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
}
`

// Line Shader
const lineVertexShader = `
attribute float percent;
varying float vPercent;
void main() {
  vPercent = percent;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
const lineFragmentShader = `
uniform float time;
uniform vec3 color;
varying float vPercent;
void main() {
  // Moving pulse (Slower speed)
  float speed = 0.2;
  float pulse = mod(time * speed, 1.0);
  float dist = distance(vPercent, pulse);
  
  // Make the pulse loop seamlessly
  float dist2 = distance(vPercent, pulse - 1.0);
  float dist3 = distance(vPercent, pulse + 1.0);
  float d = min(dist, min(dist2, dist3));
  
  // Glow effect (Softer)
  float glow = smoothstep(0.15, 0.0, d);
  
  // Base opacity + Glow (Much subtler as requested)
  float alpha = 0.1 + glow * 0.25;
  
  gl_FragColor = vec4(color, alpha);
}
`

const init = () => {
  if (!containerRef.value) return

  // Scene
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.02)

  // Camera
  const width = containerRef.value.clientWidth
  const height = containerRef.value.clientHeight
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.set(0, 0, 30)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  containerRef.value.appendChild(renderer.domElement)

  // Controls
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
  // Positioned lower to be below text
  earthGroup.position.y = -26.5
  // 45 degree tilt
  earthGroup.rotation.z = 0 * Math.PI / 180
  scene.add(earthGroup)

  nodesGroup = new THREE.Group()
  earthGroup.add(nodesGroup)

  arcsGroup = new THREE.Group()
  earthGroup.add(arcsGroup)

  textParticlesGroup = new THREE.Group()
  earthGroup.add(textParticlesGroup)

  // Shared Line Material (White color)
  lineMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color: { value: new THREE.Color(0xffffff) } // White
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

  // 1. Earth
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

  // 2. Atmosphere
  const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS + 0.2, SEGMENTS, SEGMENTS)
  const atmosMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  })
  atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat)
  earthGroup.add(atmosphereMesh)

  // 3. Clouds
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

  // 4. Stars (More stars)
  createStars()

  // 5. Nodes & Arcs (More nodes)
  createNodesAndArcs()

  // 6. Floating Text (More text)
  createFloatingText()

  // Interaction
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  animate()
}

// --- Helpers ---

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
  // Increased to 20000
  for (let i = 0; i < 20000; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(100), // Reduced spread for density
      THREE.MathUtils.randFloatSpread(150),
      THREE.MathUtils.randFloatSpread(600)
    )
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  
  // Create glowing blur texture for stars
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')

  // Radial gradient for soft glow effect
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
    size: 0.8, // Larger for glow effect
    map: texture,
    transparent: true,
    opacity: 0.9, // More transparent
    blending: THREE.AdditiveBlending, // Additive for glow
    depthWrite: false
  })
  starsMesh = new THREE.Points(geometry, material)
  scene.add(starsMesh)
}

const createNodesAndArcs = () => {
  // Smaller nodes (0.08)
  const nodeGeo = new THREE.SphereGeometry(0.08, 16, 16)
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0x00ffff })
  
  // Glow Texture
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

  const glowGeo = new THREE.PlaneGeometry(1.0, 1.0) // Smaller glow
  const glowMat = new THREE.MeshBasicMaterial({ 
    map: glowTexture, 
    color: 0x00ffff, 
    transparent: true, 
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  })

  // City Nodes
  CITIES.forEach(city => {
    const pos = latLonToVector3(city.lat, city.lon, EARTH_RADIUS)
    
    // Solid Node
    const node = new THREE.Mesh(nodeGeo, nodeMat)
    node.position.copy(pos)
    nodesGroup.add(node)

    // Glow Sprite
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

  // Arcs (Fewer connections)
  for (let i = 0; i < CITIES.length; i++) {
    for (let j = i + 1; j < CITIES.length; j++) {
      if (Math.random() > 0.85) { // Connect 15% of pairs
        createArc(CITIES[i], CITIES[j])
      }
    }
  }
}

const createArc = (city1, city2) => {
  const start = latLonToVector3(city1.lat, city1.lon, EARTH_RADIUS)
  const end = latLonToVector3(city2.lat, city2.lon, EARTH_RADIUS)
  
  const dist = start.distanceTo(end)
  const mid = start.clone().add(end).multiplyScalar(0.5).normalize().multiplyScalar(EARTH_RADIUS + dist * 0.4)
  
  const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
  const points = curve.getPoints(50) // 50 segments
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  // Add 'percent' attribute for shader
  const percents = []
  for (let i = 0; i <= 50; i++) {
    percents.push(i / 50)
  }
  geometry.setAttribute('percent', new THREE.Float32BufferAttribute(percents, 1))
  
  // Use shared shader material
  const line = new THREE.Line(geometry, lineMaterial)
  arcsGroup.add(line)
}

const createFloatingText = () => {
  // Quadrupled greetings for density
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
    
    // Distribute in space (not just surface)
    // Use spherical coords but with much larger radius variation
    const phi = Math.acos(-1 + (2 * index) / allGreetings.length)
    const theta = Math.sqrt(allGreetings.length * Math.PI) * phi
    
    // Random radius between Earth surface and far out
    const r = EARTH_RADIUS + 5 + Math.random() * 40 
    
    sprite.position.setFromSphericalCoords(r, phi, theta)
    sprite.scale.set(4, 1, 1)
    
    earthGroup.add(sprite)

    // Connect to nearest city if close enough AND if close to surface
    // Only connect if r is small (close to Earth)
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

      // Connect
      if (minDst < 15) {
        const cityPos = latLonToVector3(nearestCity.lat, nearestCity.lon, EARTH_RADIUS)
        
        // Create curve for text connection too
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

// --- Animation Loop ---
const animate = () => {
  animationFrameId = requestAnimationFrame(animate)
  
  if (controls) controls.update()

  if (cloudsMesh) cloudsMesh.rotation.y += 0.0003
  
  // Update shader time
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500&display=swap');
</style>
