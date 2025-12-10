/**
 * 용어집 관련 공통 데이터
 * 사용 파일: GlossaryMockUI
 */

// 전문용어 데이터
export const glossaryTerms = [
  { id: 1, korean: '인공지능', english: 'Artificial Intelligence', vietnamese: 'Trí tuệ nhân tạo', definition: '인간의 학습능력과 추론능력을 컴퓨터로 구현한 기술', isVerified: true },
  { id: 2, korean: '머신러닝', english: 'Machine Learning', vietnamese: 'Học máy', definition: '데이터를 기반으로 패턴을 학습하는 AI의 한 분야', isVerified: false },
  { id: 3, korean: '자연어처리', english: 'NLP', vietnamese: 'Xử lý ngôn ngữ tự nhiên', definition: '컴퓨터가 인간의 언어를 이해하고 처리하는 기술', isVerified: true },
  { id: 4, korean: '딥러닝', english: 'Deep Learning', vietnamese: 'Học sâu', definition: '인공신경망을 기반으로 한 기계학습의 한 분야', isVerified: false }
]

// 데모 문서 데이터
export const demoDocument = { id: 1, filename: 'AI_기술문서_v2.pdf', size: '2.4MB' }

// 용어 떠다니는 초기 위치
export const floatingPositions = [
  { x: 20, y: 30 },
  { x: 65, y: 45 },
  { x: 25, y: 65 },
  { x: 70, y: 25 }
]
