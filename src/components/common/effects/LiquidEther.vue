<template>
  <canvas ref="canvasRef" :style="{ width: '100%', height: '100%' }" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Renderer, Program, Mesh, Triangle } from 'ogl'

const props = defineProps({
  color1: { type: String, default: '#1e3a8a' },  // blue-900
  color2: { type: String, default: '#1d4ed8' },  // blue-700
  color3: { type: String, default: '#3b82f6' },  // blue-500
  color4: { type: String, default: '#60a5fa' },  // blue-400
  amplitude: { type: Number, default: 0.5 },
  frequency: { type: Number, default: 2.5 },
  speed: { type: Number, default: 0.002 }
})

const canvasRef = ref(null)
let renderer, gl, mesh, program
let animationId

const hexToVec3 = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return [r, g, b]
}

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragment = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColor4;
  uniform float uAmplitude;
  uniform float uFrequency;

  varying vec2 vUv;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;
    uv.x *= aspect;

    float time = uTime * 0.5;

    // Multiple layers of noise
    float n1 = snoise(vec3(uv * uFrequency, time * 0.5)) * uAmplitude;
    float n2 = snoise(vec3(uv * uFrequency * 2.0 + 100.0, time * 0.7)) * uAmplitude * 0.5;
    float n3 = snoise(vec3(uv * uFrequency * 4.0 + 200.0, time * 0.3)) * uAmplitude * 0.25;

    float noise = n1 + n2 + n3;

    // Create gradient mixing
    float gradient = vUv.y + noise * 0.3;

    // Mix colors based on noise and gradient
    vec3 color = uColor1;
    color = mix(color, uColor2, smoothstep(0.0, 0.4, gradient + noise * 0.2));
    color = mix(color, uColor3, smoothstep(0.3, 0.7, gradient + noise * 0.3));
    color = mix(color, uColor4, smoothstep(0.6, 1.0, gradient + noise * 0.2));

    // Add subtle highlights
    float highlight = snoise(vec3(uv * 3.0, time)) * 0.1 + 0.1;
    color += highlight * 0.05;

    gl_FragColor = vec4(color, 1.0);
  }
`

const init = () => {
  if (!canvasRef.value) return

  renderer = new Renderer({
    canvas: canvasRef.value,
    width: canvasRef.value.offsetWidth,
    height: canvasRef.value.offsetHeight,
    dpr: Math.min(window.devicePixelRatio, 2)
  })
  gl = renderer.gl
  gl.clearColor(0, 0, 0, 1)

  const geometry = new Triangle(gl)

  program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: [canvasRef.value.offsetWidth, canvasRef.value.offsetHeight] },
      uColor1: { value: hexToVec3(props.color1) },
      uColor2: { value: hexToVec3(props.color2) },
      uColor3: { value: hexToVec3(props.color3) },
      uColor4: { value: hexToVec3(props.color4) },
      uAmplitude: { value: props.amplitude },
      uFrequency: { value: props.frequency }
    }
  })

  mesh = new Mesh(gl, { geometry, program })

  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  program.uniforms.uTime.value += props.speed
  renderer.render({ scene: mesh })
}

const resize = () => {
  if (!canvasRef.value || !renderer) return
  const width = canvasRef.value.offsetWidth
  const height = canvasRef.value.offsetHeight
  renderer.setSize(width, height)
  program.uniforms.uResolution.value = [width, height]
}

onMounted(() => {
  init()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) renderer.gl.getExtension('WEBGL_lose_context')?.loseContext()
})

watch(() => [props.color1, props.color2, props.color3, props.color4], () => {
  if (program) {
    program.uniforms.uColor1.value = hexToVec3(props.color1)
    program.uniforms.uColor2.value = hexToVec3(props.color2)
    program.uniforms.uColor3.value = hexToVec3(props.color3)
    program.uniforms.uColor4.value = hexToVec3(props.color4)
  }
})
</script>
