/**
 * TranslationFeatureSection 데이터
 *
 * @description 번역 기능 섹션의 설정값과 기능 목록 데이터
 */

// 카드 스왑 애니메이션 설정값
export const cardAnimationConfig = {
  cardDistance: 35,        // 수평 거리
  verticalDistance: 25,    // 수직 거리
  skewAmount: 4,           // 기울기
  secondCycleDelay: 2500,  // 2회차부터 스왑 간격 (ms)
  cardSwapDelay: 500,      // 카드 애니메이션 완료 후 스왑까지 딜레이
  manualSwapDelay: 600     // 수동 스왑 시 다음 스왑까지 딜레이
}

// 기능 목록 데이터
export const featureList = [
  {
    icon: 'document',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    title: '텍스트 번역',
    description: ' - 문서 기반 전문용어 자동 인식'
  },
  {
    icon: 'microphone',
    iconBgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    title: '음성 번역',
    description: ' - 실시간 다국어 음성 인식 및 번역'
  },
  {
    icon: 'film',
    iconBgColor: 'bg-amber-100',
    iconColor: 'text-amber-600',
    title: '영상 번역',
    description: ' - 자막 자동 생성 및 용어 통일'
  }
]

// 섹션 텍스트 데이터
export const sectionContent = {
  badge: '텍스트 · 음성 · 영상',
  title: '전문용어 기반 통합 번역',
  description: '프로젝트 문서에서 추출한 전문용어를 기반으로 일관성 있게 번역합니다.',
  ctaText: '자세히 보기',
  ctaLink: '/translation'
}
