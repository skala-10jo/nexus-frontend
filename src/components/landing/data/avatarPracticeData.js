/**
 * AvatarPracticeScene 목 데이터
 */

// 대화 메시지
export const practiceMessages = [
  { speaker: 'ai', text: "Good morning! Shall we discuss the project requirements for the partnership?" },
  { speaker: 'user', text: "Yes, let's discuss the key requirements first." },
  { speaker: 'ai', text: "Great! I've prepared a summary of the main deliverables." }
]

// 피드백 데이터
export const practiceFeedbacks = [
  { type: 'good', icon: '🎯', title: '잘한 점', content: '"let\'s discuss"를 자연스럽게 사용했어요!' },
  { type: 'tip', icon: '💡', title: '개선 포인트', content: '"requirements" 발음에서 r 소리를 더 강조해보세요.' },
  { type: 'good', icon: '✨', title: '표현력', content: '비즈니스 상황에 적합한 표현을 선택했습니다.' }
]

// 점수 항목 초기값
export const initialScoreItems = [
  { label: '발음', score: 0, width: '0%', colorClass: 'bg-green-500' },
  { label: '유창성', score: 0, width: '0%', colorClass: 'bg-blue-500' },
  { label: '정확성', score: 0, width: '0%', colorClass: 'bg-purple-500' }
]

// 점수 목표값
export const targetScoreItems = [
  { label: '발음', score: 85, width: '85%', colorClass: 'bg-green-500' },
  { label: '유창성', score: 90, width: '90%', colorClass: 'bg-blue-500' },
  { label: '정확성', score: 88, width: '88%', colorClass: 'bg-purple-500' }
]

// 힌트 메시지
export const defaultHint = 'Try using "Let\'s discuss..." to start the conversation.'

// 아바타 비디오 경로
export const avatarVideoPath = '/videos/avatar-practice.mov'
