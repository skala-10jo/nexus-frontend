/**
 * UnifiedTranslationMockUI 데이터
 *
 * @description 통합 번역 시연 UI의 텍스트, 음성, 비디오 번역 데모 데이터
 */

// Text Translation Data
export const sourceText = "The API endpoint requires OAuth authentication for secure access."
export const translatedText = "API 엔드포인트는 보안 접근을 위해 OAuth 인증이 필요합니다."

export const sourceTermRanges = [
  { start: 4, end: 16 }, // "API endpoint"
  { start: 26, end: 31 }, // "OAuth"
]

export const translatedTermRanges = [
  { start: 0, end: 7 }, // "API 엔드포인트"
  { start: 20, end: 25 }, // "OAuth"
]

// Voice Translation Data
export const voiceMessageData = [
  {
    id: 1,
    lang: 'EN',
    speaker: 'David',
    isUser: true,
    words: [
      { text: 'We', isTerm: false },
      { text: 'need', isTerm: false },
      { text: 'to', isTerm: false },
      { text: 'deploy', isTerm: true },
      { text: 'the', isTerm: false },
      { text: 'update.', isTerm: false }
    ]
  },
  {
    id: 2,
    lang: 'KO',
    speaker: '번역',
    isUser: false,
    words: [
      { text: '업데이트를', isTerm: false },
      { text: '배포해야', isTerm: true },
      { text: '합니다.', isTerm: false }
    ]
  },
  {
    id: 3,
    lang: 'EN',
    speaker: 'Sarah',
    isUser: true,
    words: [
      { text: 'The', isTerm: false },
      { text: 'CI/CD', isTerm: true },
      { text: 'pipeline', isTerm: true },
      { text: 'is', isTerm: false },
      { text: 'ready.', isTerm: false }
    ]
  },
  {
    id: 4,
    lang: 'KO',
    speaker: '번역',
    isUser: false,
    words: [
      { text: 'CI/CD', isTerm: true },
      { text: '파이프라인', isTerm: true },
      { text: '준비', isTerm: false },
      { text: '완료.', isTerm: false }
    ]
  }
]

// Video Translation Data
export const videoSubtitles = [
  { text: "Our API integration enables seamless connectivity.", terms: ['API', 'integration'] },
  { text: "API 통합으로 원활한 연결이 가능합니다.", terms: ['API', '통합'] }
]

// Floating Terms Data
export const termData = [
  { id: 1, text: 'API', class: 'bg-blue-500 text-white' },
  { id: 2, text: 'OAuth', class: 'bg-purple-500 text-white' },
  { id: 3, text: 'Deploy', class: 'bg-green-500 text-white' },
  { id: 4, text: 'CI/CD', class: 'bg-amber-500 text-white' }
]

// SVG Connection Paths
export const connectionPaths = {
  text: 'M 170 120 Q 220 180, 260 240',
  voice: 'M 350 120 Q 300 180, 260 240',
  video: 'M 260 320 L 260 280'
}
