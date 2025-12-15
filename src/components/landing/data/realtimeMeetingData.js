/**
 * RealtimeMeetingMockUI 데이터
 *
 * @description 회의 분석 및 학습 모드 시연 UI의 데모 데이터
 */

// Speaker 데이터
export const speakers = [
  { name: 'David', color: 'bg-blue-500', count: 16 },
  { name: 'Sarah', color: 'bg-purple-500', count: 10 },
  { name: 'Mike', color: 'bg-amber-500', count: 9 },
  { name: 'Jane', color: 'bg-green-500', count: 10 }
]

// 회의 메시지 데이터
export const messages = [
  { speaker: 0, time: '0:00', text: "Alright team, we have the investor meeting in three days.", score: 8 },
  { speaker: 1, time: '0:09', text: "The financials have been updated. Our burn rate is lower.", score: 7 },
  { speaker: 0, time: '0:16', text: "That's good news. How much lower?", score: 8 },
  { speaker: 1, time: '0:18', text: "About 15% we saved on marketing spendings.", score: 7 },
  { speaker: 2, time: '0:25', text: "Wait, you cut the marketing budget without telling me?", score: 7 },
  { speaker: 1, time: '0:31', text: "I'm sorry, but we had to make tough decisions.", score: 8 },
  { speaker: 3, time: '0:38', text: "Let's focus on what we can present to investors.", score: 9 }
]

// Header 타이틀
export const headerTitles = {
  upload: 'Meeting Analysis',
  result: '분석 결과',
  practice: '학습 모드'
}

// 학습 모드 텍스트
export const practiceTexts = {
  original: '"Alright team, we have the investor meeting..."',
  corrected: '"Okay team, we have the investor meeting..."'
}

// 발음 평가 결과
export const practiceScores = {
  total: 87,
  accuracy: 93,
  fluency: 96,
  intonation: 72
}
