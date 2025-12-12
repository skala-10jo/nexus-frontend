/**
 * Earth3D 지구본 데이터
 */

// Constants
export const EARTH_RADIUS = 24
export const SEGMENTS = 64

// 도시 데이터
export const CITIES = [
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

// 다국어 인사말
export const GREETINGS = [
  'Hello', '안녕하세요', 'Bonjour', 'Hola', 'Ciao', 'Olá', '你好', 'こんにちは', 'Xin chào', 'Sawasdee',
  'Namaste', 'Salaam', 'Zdravstvuyte', 'Guten Tag', 'Merhaba', 'Jambo', 'Szia', 'Hej', 'Hallo', 'Aloha',
  'Shalom', 'Terve', 'Selamat', 'Mabuhay', 'Sawubona', 'Mingalaba', 'Sain Bainuu', 'Barev', 'Gamarjoba', 'Ayubowan',
  'Privet', 'Nǐ hǎo', 'Konnichiwa', 'Bongu', 'Dia dhuit', 'Hallå', 'Sveiki', 'Moien', 'Bonjou'
]

// 텍스처 URL
export const TEXTURE_URLS = {
  map: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  normal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
}

// 대기권 셰이더
export const atmosphereVertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const atmosphereFragmentShader = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
  gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 1.5;
}
`

// 연결선 셰이더
export const lineVertexShader = `
attribute float percent;
varying float vPercent;
void main() {
  vPercent = percent;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const lineFragmentShader = `
uniform float time;
uniform vec3 color;
varying float vPercent;
void main() {
  float speed = 0.2;
  float pulse = mod(time * speed, 1.0);
  float dist = distance(vPercent, pulse);

  float dist2 = distance(vPercent, pulse - 1.0);
  float dist3 = distance(vPercent, pulse + 1.0);
  float d = min(dist, min(dist2, dist3));

  float glow = smoothstep(0.15, 0.0, d);
  float alpha = 0.1 + glow * 0.25;

  gl_FragColor = vec4(color, alpha);
}
`
