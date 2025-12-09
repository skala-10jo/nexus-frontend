/**
 * Landing page feature data
 */
export const features = [
  {
    id: 'translation',
    title: '전문용어 사전 + 프로젝트 문서 기반 번역',
    subtitle: 'AI 기반 번역',
    description: '텍스트/음성/영상을 프로젝트에 등록된 전문용어와 문서를 기반으로 정확하게 번역합니다.',
    video: '/videos/translation-demo.mp4',
    route: '/translation',
    icon: 'LanguageIcon'
  },
  {
    id: 'voice-translation',
    title: '음성 번역',
    subtitle: '실시간 다국어 번역',
    description: '회의 중 실시간으로 음성을 인식하고 여러 언어로 동시 번역합니다.',
    video: '/videos/voice-translation-demo.mp4',
    route: '/translation/voice',
    icon: 'MicrophoneIcon'
  },
  {
    id: 'text-translation',
    title: '텍스트 번역',
    subtitle: '전문 용어 기반 정확한 번역',
    description: '용어집을 활용하여 일관성 있는 전문 번역을 제공합니다.',
    video: '/videos/text-translation-demo.mp4',
    route: '/translation/text',
    icon: 'DocumentTextIcon'
  },
  {
    id: 'video-translation',
    title: '영상 번역',
    subtitle: '자막 자동 생성 및 번역',
    description: '영상에서 음성을 추출하고 다국어 자막을 자동으로 생성합니다.',
    video: '/videos/video-translation-demo.mp4',
    route: '/translation/video',
    icon: 'FilmIcon'
  },
  {
    id: 'mail',
    title: '메일 작성 도우미',
    subtitle: 'AI 비즈니스 메일 작성',
    description: 'Outlook과 연동하여 AI가 비즈니스 메일 작성을 도와줍니다.',
    video: '/videos/mail-demo.mp4',
    route: '/collaboration/mail',
    icon: 'EnvelopeIcon'
  }
]
