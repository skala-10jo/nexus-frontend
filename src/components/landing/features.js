/**
 * Landing page feature data
 */
export const features = [
  {
    id: 'glossary',
    title: '문서 · 전문용어 사전',
    subtitle: 'AI 기반 전문 용어 추출',
    description: '문서를 업로드하면 AI가 자동으로 전문 용어를 추출하고 다국어 번역을 제공합니다.',
    video: '/videos/glossary-demo.mp4',
    route: '/management/glossary',
    icon: 'BookOpenIcon'
  },
  {
    id: 'project-schedule',
    title: '프로젝트 · 일정',
    subtitle: '통합 프로젝트 관리',
    description: '프로젝트를 생성하고 문서를 연결하여 일정을 효율적으로 관리할 수 있습니다.',
    video: '/videos/project-schedule-demo.mp4',
    route: '/management/schedule',
    icon: 'CalendarDaysIcon'
  },
  {
    id: 'scenario',
    title: '실무 시나리오 회화연습',
    subtitle: 'AI와 함께하는 비즈니스 회화',
    description: '실제 업무 상황을 시뮬레이션하며 외국어 회화를 연습할 수 있습니다.',
    video: '/videos/scenario-demo.mp4',
    route: '/conversation/scenario',
    icon: 'ChatBubbleLeftRightIcon'
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
