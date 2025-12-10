/**
 * 프로젝트 일정 관련 공통 데이터
 * 사용 파일: ProjectScheduleScene, ProjectScheduleMockUI, ScenarioGenerationScene
 */

// 프로젝트 목록
export const projects = [
  {
    id: 'p1',
    name: '베트남 출장 준비',
    description: '2월 베트남 파트너 미팅',
    color: 'gray'
  },
  {
    id: 'p2',
    name: 'AI 협업 플랫폼 개발',
    description: 'Nexus 플랫폼 기반 다국어 SaaS',
    color: 'blue'
  }
]

// 일정 이벤트 목록 (캘린더 그리드용)
export const events = [
  {
    id: 'e1',
    projectId: 'p2',
    title: '킥오프',
    startDate: '2025-01-02',
    endDate: '2025-01-02',
    color: 'blue',
    row: 0
  },
  {
    id: 'e2',
    projectId: 'p2',
    title: '요구사항 분석 회의',
    startDate: '2025-01-08',
    endDate: '2025-01-09',
    color: 'green',
    row: 0
  },
  {
    id: 'e3',
    projectId: 'p2',
    title: 'UI/UX 회의',
    startDate: '2025-01-14',
    endDate: '2025-01-17',
    color: 'orange',
    row: 0
  },
  {
    id: 'e4',
    projectId: 'p2',
    title: '중간 발표',
    startDate: '2025-01-20',
    endDate: '2025-01-20',
    color: 'purple',
    row: 0
  },
  {
    id: 'e5',
    projectId: 'p2',
    title: '백엔드 개발',
    startDate: '2025-01-29',
    endDate: '2025-01-31',
    color: 'cyan',
    row: 0
  }
]

// 사이드바 이벤트 목록 (날짜 포맷 포함)
export const getSidebarEvents = () => events.map(e => ({
  id: e.id,
  title: e.title,
  date: `${new Date(e.startDate).getMonth() + 1}/${new Date(e.startDate).getDate()}`,
  color: colorMap[e.color]?.hex || colorMap.gray.hex
}))

// 색상 매핑
export const colorMap = {
  blue: { bg: 'bg-blue-500', text: 'text-white', hex: '#3b82f6' },
  green: { bg: 'bg-green-500', text: 'text-white', hex: '#22c55e' },
  orange: { bg: 'bg-orange-500', text: 'text-white', hex: '#f97316' },
  purple: { bg: 'bg-purple-500', text: 'text-white', hex: '#a855f7' },
  cyan: { bg: 'bg-cyan-500', text: 'text-white', hex: '#06b6d4' },
  red: { bg: 'bg-red-500', text: 'text-white', hex: '#ef4444' },
  amber: { bg: 'bg-amber-500', text: 'text-white', hex: '#f59e0b' },
  gray: { bg: 'bg-gray-400', text: 'text-white', hex: '#9ca3af' }
}

// 요일 헤더
export const weekDays = ['일', '월', '화', '수', '목', '금', '토']

// 이벤트 색상 가져오기
export const getEventColor = (colorName) => {
  return colorMap[colorName]?.hex || colorMap.gray.hex
}

// 이벤트 클래스 가져오기
export const getEventColorClass = (colorName) => {
  const color = colorMap[colorName] || colorMap.gray
  return `${color.bg} ${color.text}`
}
