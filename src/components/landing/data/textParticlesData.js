/**
 * TextParticles 지구본 데이터
 */

// 기본 텍스트 목록 (다국어 인사)
export const defaultTexts = [
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

// 세계 대륙 좌표 데이터 (단순화된 폴리곤)
export const continentData = {
  northAmerica: [
    { lat: 49, lon: -125 }, { lat: 60, lon: -140 }, { lat: 70, lon: -140 },
    { lat: 72, lon: -100 }, { lat: 70, lon: -80 }, { lat: 60, lon: -75 },
    { lat: 50, lon: -55 }, { lat: 45, lon: -65 }, { lat: 30, lon: -80 },
    { lat: 25, lon: -80 }, { lat: 25, lon: -98 }, { lat: 30, lon: -117 },
    { lat: 35, lon: -120 }, { lat: 49, lon: -125 }
  ],
  southAmerica: [
    { lat: 12, lon: -72 }, { lat: 5, lon: -77 }, { lat: -5, lon: -80 },
    { lat: -15, lon: -75 }, { lat: -25, lon: -70 }, { lat: -40, lon: -73 },
    { lat: -55, lon: -68 }, { lat: -55, lon: -65 }, { lat: -40, lon: -62 },
    { lat: -35, lon: -57 }, { lat: -25, lon: -48 }, { lat: -10, lon: -35 },
    { lat: 0, lon: -50 }, { lat: 5, lon: -55 }, { lat: 10, lon: -62 },
    { lat: 12, lon: -72 }
  ],
  europe: [
    { lat: 71, lon: 28 }, { lat: 70, lon: 30 }, { lat: 60, lon: 30 },
    { lat: 55, lon: 22 }, { lat: 50, lon: 20 }, { lat: 45, lon: 15 },
    { lat: 40, lon: 0 }, { lat: 36, lon: -5 }, { lat: 43, lon: -9 },
    { lat: 48, lon: -5 }, { lat: 51, lon: 2 }, { lat: 58, lon: -5 },
    { lat: 60, lon: 5 }, { lat: 65, lon: 12 }, { lat: 71, lon: 25 },
    { lat: 71, lon: 28 }
  ],
  africa: [
    { lat: 37, lon: 10 }, { lat: 32, lon: 32 }, { lat: 22, lon: 37 },
    { lat: 12, lon: 44 }, { lat: 0, lon: 42 }, { lat: -12, lon: 44 },
    { lat: -25, lon: 35 }, { lat: -35, lon: 20 }, { lat: -34, lon: 18 },
    { lat: -30, lon: 17 }, { lat: -15, lon: 12 }, { lat: 5, lon: 10 },
    { lat: 5, lon: -5 }, { lat: 15, lon: -17 }, { lat: 22, lon: -17 },
    { lat: 28, lon: -10 }, { lat: 35, lon: -5 }, { lat: 37, lon: 10 }
  ],
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
  australia: [
    { lat: -12, lon: 130 }, { lat: -15, lon: 140 }, { lat: -20, lon: 148 },
    { lat: -25, lon: 153 }, { lat: -35, lon: 150 }, { lat: -38, lon: 145 },
    { lat: -35, lon: 138 }, { lat: -32, lon: 133 }, { lat: -30, lon: 115 },
    { lat: -22, lon: 114 }, { lat: -15, lon: 125 }, { lat: -12, lon: 130 }
  ]
}

// 주요 도시 데이터 (위도, 경도, 중요도)
export const cityData = [
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
