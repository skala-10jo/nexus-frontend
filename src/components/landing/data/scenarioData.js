/**
 * 시나리오 생성 관련 데이터
 * 사용 파일: ScenarioGenerationScene, ScenarioMockUI
 */

// 분석용 문서 데이터 (IT 프로젝트 문서)
export const documentData = [
  { name: '스프린트_백로그.xlsx', ext: 'XLS', iconBg: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' },
  { name: 'API_명세서_v2.1.pdf', ext: 'PDF', iconBg: '#ef4444', glowColor: 'rgba(239, 68, 68, 0.5)' },
  { name: 'DB_스키마.sql', ext: 'SQL', iconBg: '#3b82f6', glowColor: 'rgba(59, 130, 246, 0.5)' },
  { name: 'UI_와이어프레임.fig', ext: 'FIG', iconBg: '#a855f7', glowColor: 'rgba(168, 85, 247, 0.5)' },
  { name: '릴리즈_노트.md', ext: 'MD', iconBg: '#6b7280', glowColor: 'rgba(107, 114, 128, 0.5)' },
  { name: 'QA_테스트케이스.xlsx', ext: 'XLS', iconBg: '#22c55e', glowColor: 'rgba(34, 197, 94, 0.5)' }
]

// 추출 키워드
export const extractionKeywords = [
  { text: 'Sprint Planning', color: '#16a34a' },
  { text: 'REST API', color: '#dc2626' },
  { text: 'ERD', color: '#2563eb' },
  { text: 'Prototype', color: '#9333ea' },
  { text: 'Deployment', color: '#4b5563' },
  { text: 'QA Test', color: '#16a34a' }
]

// 시나리오 카드 데이터
export const scenarios = [
  {
    flag: '🇺🇸',
    difficulty: 'intermediate',
    difficultyLabel: '중급',
    difficultyClass: 'bg-amber-100 text-amber-700',
    title: '프로젝트 요구사항 협의',
    description: '베트남 파트너와 요구사항 논의',
    userRole: 'PM',
    aiRole: '파트너'
  },
  {
    flag: '🇻🇳',
    difficulty: 'beginner',
    difficultyLabel: '초급',
    difficultyClass: 'bg-emerald-100 text-emerald-700',
    title: '일정 조율 회의',
    description: '마일스톤 및 일정 조율',
    userRole: '개발자',
    aiRole: 'PM'
  },
  {
    flag: '🇺🇸',
    difficulty: 'advanced',
    difficultyLabel: '고급',
    difficultyClass: 'bg-rose-100 text-rose-700',
    title: '기술 스펙 리뷰',
    description: '상세 기술 사양 검토',
    userRole: 'Tech Lead',
    aiRole: 'Engineer'
  },
  {
    flag: '🇯🇵',
    difficulty: 'intermediate',
    difficultyLabel: '중급',
    difficultyClass: 'bg-amber-100 text-amber-700',
    title: '파트너사 미팅',
    description: '일본 파트너사와 협력 논의',
    userRole: 'BD Manager',
    aiRole: '파트너'
  },
  {
    flag: '🇨🇳',
    difficulty: 'beginner',
    difficultyLabel: '초급',
    difficultyClass: 'bg-emerald-100 text-emerald-700',
    title: '제품 데모',
    description: '신규 기능 시연 및 설명',
    userRole: '세일즈',
    aiRole: '고객'
  },
  {
    flag: '🇺🇸',
    difficulty: 'advanced',
    difficultyLabel: '고급',
    difficultyClass: 'bg-rose-100 text-rose-700',
    title: '계약 협상 회의',
    description: '글로벌 계약 조건 협상',
    userRole: 'Legal',
    aiRole: '변호사'
  }
]

// 문서 위치 (원형 배치)
export const docPositions = [
  { x: 115, y: 70 },    // 좌상단
  { x: 322, y: 25 },    // 상단 중앙
  { x: 530, y: 70 },    // 우상단
  { x: 115, y: 280 },   // 좌하단
  { x: 322, y: 335 },   // 하단 중앙
  { x: 530, y: 280 }    // 우하단
]

// 키워드 위치 (문서 사이)
export const keywordPositions = [
  { x: 235, y: 95 },
  { x: 455, y: 95 },
  { x: 620, y: 190 },
  { x: 455, y: 300 },
  { x: 235, y: 300 },
  { x: 55, y: 190 }
]
