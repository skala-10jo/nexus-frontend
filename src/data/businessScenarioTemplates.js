/**
 * Business Scenario Templates Data
 *
 * Pre-defined business conversation scenarios for practice.
 * These templates are read-only and can be used directly or copied to customize.
 */

export const BUSINESS_CATEGORIES = [
  {
    id: 'meeting',
    name: '미팅',
    icon: 'UserGroupIcon',
    description: '회의 및 미팅 상황에서의 대화'
  },
  {
    id: 'request',
    name: '업무 요청',
    icon: 'ClipboardDocumentListIcon',
    description: '업무 요청, 수락, 거절 상황'
  },
  {
    id: 'feedback',
    name: '피드백',
    icon: 'ChatBubbleLeftRightIcon',
    description: '피드백을 주고받는 상황'
  },
  {
    id: 'presentation',
    name: '발표',
    icon: 'PresentationChartBarIcon',
    description: '프레젠테이션 및 Q&A 상황'
  },
  {
    id: 'negotiation',
    name: '협상',
    icon: 'ScaleIcon',
    description: '비즈니스 협상 및 조율'
  },
  {
    id: 'networking',
    name: '네트워킹',
    icon: 'GlobeAltIcon',
    description: '비즈니스 네트워킹 상황'
  }
]

export const BUSINESS_SCENARIO_TEMPLATES = [
  // ============================================
  // Meeting Scenarios (미팅)
  // ============================================
  {
    id: 'template-meeting-kickoff',
    category: 'meeting',
    title: '프로젝트 킥오프 미팅',
    description: '새 프로젝트 킥오프 미팅에서 프로젝트 개요를 설명하고 팀원들과 역할을 논의합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '프로젝트 매니저',
      ai: '팀원'
    },
    systemPrompt: `You are a team member attending a project kickoff meeting.
The user is the Project Manager leading the meeting.
Ask clarifying questions about project scope, timeline, and your responsibilities.
Be engaged but also raise practical concerns when appropriate.
Use natural business English.`,
    requiredTerms: ['kickoff', 'milestone', 'deliverable', 'stakeholder', 'timeline'],
    estimatedDuration: '10-15 min',
    tags: ['project-management', 'leadership', 'team-communication']
  },
  {
    id: 'template-meeting-weekly-standup',
    category: 'meeting',
    title: '주간 팀 스탠드업',
    description: '주간 팀 스탠드업 미팅에서 진행 상황을 보고하고 이슈를 공유합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '개발자',
      ai: '팀 리드'
    },
    systemPrompt: `You are a team lead conducting a weekly standup meeting.
Ask the user about their progress, blockers, and plans for the week.
Follow up on any issues mentioned and offer guidance when needed.
Keep the conversation focused and efficient.`,
    requiredTerms: ['progress', 'blocker', 'priority', 'update', 'deadline'],
    estimatedDuration: '5-10 min',
    tags: ['agile', 'status-update', 'team-meeting']
  },
  {
    id: 'template-meeting-one-on-one',
    category: 'meeting',
    title: '매니저와 1:1 미팅',
    description: '매니저와의 1:1 미팅에서 커리어 발전과 업무 상황을 논의합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직원',
      ai: '매니저'
    },
    systemPrompt: `You are a supportive manager having a one-on-one meeting with your direct report.
Ask about their work satisfaction, career goals, and any challenges they're facing.
Provide constructive feedback and discuss growth opportunities.
Be empathetic and encouraging while maintaining professional boundaries.`,
    requiredTerms: ['career development', 'feedback', 'performance', 'goal', 'growth'],
    estimatedDuration: '15-20 min',
    tags: ['career', 'management', 'professional-development']
  },
  {
    id: 'template-meeting-client',
    category: 'meeting',
    title: '클라이언트 미팅',
    description: '클라이언트와의 미팅에서 프로젝트 진행 상황을 보고하고 요구사항을 확인합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '어카운트 매니저',
      ai: '클라이언트'
    },
    systemPrompt: `You are a demanding but fair client receiving a project update.
Ask detailed questions about progress, timelines, and any issues.
Express concerns when things seem unclear but be open to explanations.
Occasionally mention new requirements or scope changes.`,
    requiredTerms: ['ROI', 'scope', 'budget', 'requirement', 'expectation'],
    estimatedDuration: '15-20 min',
    tags: ['client-management', 'stakeholder', 'communication']
  },

  // ============================================
  // Request Scenarios (업무 요청)
  // ============================================
  {
    id: 'template-request-task',
    category: 'request',
    title: '업무 지원 요청하기',
    description: '동료에게 업무 지원을 요청하고 협력 방안을 논의합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '직원',
      ai: '동료'
    },
    systemPrompt: `You are a busy but helpful colleague.
When the user requests help, ask clarifying questions about the task.
Consider your own workload before accepting and negotiate timeline if needed.
Be collaborative and solution-oriented.`,
    requiredTerms: ['assist', 'deadline', 'priority', 'collaborate', 'support'],
    estimatedDuration: '5-10 min',
    tags: ['teamwork', 'collaboration', 'communication']
  },
  {
    id: 'template-request-deadline-extension',
    category: 'request',
    title: '마감 기한 연장 요청',
    description: '마감 기한 연장을 요청하며 합리적인 이유를 설명합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직원',
      ai: '매니저'
    },
    systemPrompt: `You are a manager who values accountability but understands realistic constraints.
Listen to the extension request carefully and ask about the reasons.
Consider the impact on the team and project before making a decision.
You may grant the extension with conditions or offer alternative solutions.`,
    requiredTerms: ['extension', 'timeline', 'impact', 'alternative', 'prioritize'],
    estimatedDuration: '10-15 min',
    tags: ['time-management', 'negotiation', 'professional-communication']
  },
  {
    id: 'template-request-decline',
    category: 'request',
    title: '정중하게 요청 거절하기',
    description: '업무 요청을 정중하게 거절하면서 대안을 제시합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직원',
      ai: '동료'
    },
    systemPrompt: `You are a colleague who needs help with an urgent task.
Make a reasonable request for assistance.
If declined, try to understand the reasons and ask about alternatives.
React professionally whether the request is accepted or declined.`,
    requiredTerms: ['apologize', 'unfortunately', 'alternative', 'suggest', 'capacity'],
    estimatedDuration: '5-10 min',
    tags: ['assertiveness', 'boundary-setting', 'professional-communication']
  },

  // ============================================
  // Feedback Scenarios (피드백)
  // ============================================
  {
    id: 'template-feedback-positive',
    category: 'feedback',
    title: '긍정적 피드백 전달하기',
    description: '팀원에게 구체적이고 효과적인 긍정적 피드백을 전달합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '매니저',
      ai: '팀원'
    },
    systemPrompt: `You are a team member who recently completed a successful project.
Respond humbly to praise and share credit with the team when appropriate.
Ask for specific feedback on areas for improvement.
Show appreciation and enthusiasm.`,
    requiredTerms: ['appreciate', 'recognition', 'contribution', 'excellent', 'impact'],
    estimatedDuration: '5-10 min',
    tags: ['leadership', 'motivation', 'recognition']
  },
  {
    id: 'template-feedback-constructive',
    category: 'feedback',
    title: '건설적 피드백 전달하기',
    description: '개선이 필요한 부분에 대해 건설적인 피드백을 전달합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '매니저',
      ai: '팀원'
    },
    systemPrompt: `You are a team member receiving constructive feedback about your recent work.
Initially be slightly defensive but open to understanding.
Ask clarifying questions and seek specific examples.
Eventually acknowledge the feedback and discuss improvement steps.`,
    requiredTerms: ['improvement', 'specific', 'example', 'action plan', 'follow-up'],
    estimatedDuration: '15-20 min',
    tags: ['leadership', 'coaching', 'difficult-conversations']
  },
  {
    id: 'template-feedback-receiving',
    category: 'feedback',
    title: '피드백 수용하고 대응하기',
    description: '상사로부터 피드백을 받고 전문적으로 대응합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직원',
      ai: '매니저'
    },
    systemPrompt: `You are a manager providing mixed feedback - both positive aspects and areas for improvement.
Be specific with examples and focus on behaviors, not personality.
Offer support and resources for improvement.
End with clear expectations and next steps.`,
    requiredTerms: ['thank you', 'understand', 'improve', 'clarify', 'commit'],
    estimatedDuration: '10-15 min',
    tags: ['professional-growth', 'self-awareness', 'communication']
  },

  // ============================================
  // Presentation Scenarios (발표)
  // ============================================
  {
    id: 'template-presentation-opening',
    category: 'presentation',
    title: '프레젠테이션 오프닝',
    description: '프레젠테이션을 효과적으로 시작하고 청중의 관심을 끕니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '발표자',
      ai: '청중'
    },
    systemPrompt: `You are an audience member at a business presentation.
Ask clarifying questions about the agenda and objectives.
Show interest but also express typical audience concerns.
React naturally to the presentation style.`,
    requiredTerms: ['agenda', 'objective', 'overview', 'key points', 'outline'],
    estimatedDuration: '5-10 min',
    tags: ['public-speaking', 'communication', 'presentation-skills']
  },
  {
    id: 'template-presentation-qa',
    category: 'presentation',
    title: 'Q&A 세션 대응하기',
    description: '발표 후 Q&A 세션에서 다양한 질문에 전문적으로 대응합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '발표자',
      ai: '청중'
    },
    systemPrompt: `You are a challenging but fair audience member during a Q&A session.
Ask detailed technical questions, clarifying questions, and occasionally tough questions.
If the presenter handles questions well, acknowledge it.
If answers are vague, push for more specificity.`,
    requiredTerms: ['elaborate', 'specifically', 'data', 'evidence', 'conclusion'],
    estimatedDuration: '15-20 min',
    tags: ['critical-thinking', 'communication', 'expertise']
  },
  {
    id: 'template-presentation-closing',
    category: 'presentation',
    title: '프레젠테이션 마무리',
    description: '프레젠테이션을 효과적으로 마무리하고 다음 단계를 제시합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '발표자',
      ai: '임원'
    },
    systemPrompt: `You are a senior executive who has been listening to the presentation.
Ask about next steps, timelines, and resource requirements.
Express interest but also raise concerns about feasibility.
Make a final decision or request follow-up.`,
    requiredTerms: ['summary', 'key takeaway', 'next steps', 'action items', 'follow-up'],
    estimatedDuration: '10-15 min',
    tags: ['executive-communication', 'persuasion', 'closure']
  },

  // ============================================
  // Negotiation Scenarios (협상)
  // ============================================
  {
    id: 'template-negotiation-salary',
    category: 'negotiation',
    title: '연봉 협상',
    description: '연봉 협상에서 자신의 가치를 효과적으로 어필합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '지원자',
      ai: 'HR 매니저'
    },
    systemPrompt: `You are an HR manager conducting a salary negotiation.
Start with the company's initial offer which is slightly below market rate.
Listen to the candidate's justifications and consider counteroffers.
You have some flexibility but also budget constraints.
Be fair but also represent company interests.`,
    requiredTerms: ['compensation', 'market rate', 'value', 'benefits', 'counteroffer'],
    estimatedDuration: '15-20 min',
    tags: ['career', 'negotiation', 'self-advocacy']
  },
  {
    id: 'template-negotiation-contract',
    category: 'negotiation',
    title: '계약 조건 협상',
    description: '비즈니스 계약 조건을 협상하며 상호 이익을 추구합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '비즈니스 담당자',
      ai: '클라이언트 담당자'
    },
    systemPrompt: `You are a client representative negotiating contract terms.
You want favorable terms but also value a long-term relationship.
Push back on pricing and timeline but be open to compromise.
Raise concerns about specific contract clauses.`,
    requiredTerms: ['terms', 'clause', 'negotiate', 'compromise', 'agreement'],
    estimatedDuration: '20-25 min',
    tags: ['business-development', 'contract-negotiation', 'stakeholder-management']
  },
  {
    id: 'template-negotiation-resource',
    category: 'negotiation',
    title: '리소스 배분 협의',
    description: '프로젝트 리소스 배분에 대해 다른 부서와 협의합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '프로젝트 매니저',
      ai: '부서장'
    },
    systemPrompt: `You are a department head whose team is already stretched thin.
Listen to the resource request and ask about project priority and timeline.
Express constraints but also explore creative solutions.
You can partially accommodate but need clear justification.`,
    requiredTerms: ['resource', 'allocation', 'bandwidth', 'trade-off', 'priority'],
    estimatedDuration: '10-15 min',
    tags: ['resource-management', 'cross-functional', 'negotiation']
  },

  // ============================================
  // Networking Scenarios (네트워킹)
  // ============================================
  {
    id: 'template-networking-introduction',
    category: 'networking',
    title: '비즈니스 자기소개',
    description: '비즈니스 네트워킹 이벤트에서 효과적으로 자기 소개합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '직장인',
      ai: '업계 관계자'
    },
    systemPrompt: `You are a professional at a networking event.
Introduce yourself and show genuine interest in the other person.
Ask about their work and find common professional interests.
Keep the conversation natural and engaging.`,
    requiredTerms: ['pleasure to meet', 'background', 'industry', 'experience', 'connect'],
    estimatedDuration: '5-10 min',
    tags: ['networking', 'personal-branding', 'communication']
  },
  {
    id: 'template-networking-followup',
    category: 'networking',
    title: '미팅 후 팔로업',
    description: '네트워킹 이벤트 후 연락을 이어가며 관계를 구축합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직장인',
      ai: '새로운 인맥'
    },
    systemPrompt: `You are someone who was met at a networking event last week.
You remember the conversation and are open to continuing the connection.
Respond positively to follow-up but be appropriately busy.
Consider opportunities for mutual benefit.`,
    requiredTerms: ['follow up', 'connect', 'opportunity', 'schedule', 'look forward'],
    estimatedDuration: '5-10 min',
    tags: ['relationship-building', 'professional-network', 'communication']
  },
  {
    id: 'template-networking-linkedin',
    category: 'networking',
    title: '링크드인 연결 요청',
    description: 'LinkedIn에서 전문적으로 연결 요청을 보내고 대화를 시작합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '직장인',
      ai: '링크드인 연락처'
    },
    systemPrompt: `You are a professional who received a LinkedIn connection request.
You're cautiously open to new connections but filter based on relevance.
Ask about mutual interests or reasons for connecting.
Respond appropriately based on the quality of the introduction.`,
    requiredTerms: ['connect', 'mutual interest', 'profile', 'industry', 'opportunity'],
    estimatedDuration: '5 min',
    tags: ['social-media', 'digital-networking', 'personal-branding']
  }
]

/**
 * Get scenarios by category
 * @param {string} categoryId - Category ID
 * @returns {Array} Filtered scenarios
 */
export function getScenariosByCategory(categoryId) {
  if (!categoryId) return BUSINESS_SCENARIO_TEMPLATES
  return BUSINESS_SCENARIO_TEMPLATES.filter(s => s.category === categoryId)
}

/**
 * Get scenarios by difficulty
 * @param {string} difficulty - beginner | intermediate | advanced
 * @returns {Array} Filtered scenarios
 */
export function getScenariosByDifficulty(difficulty) {
  if (!difficulty) return BUSINESS_SCENARIO_TEMPLATES
  return BUSINESS_SCENARIO_TEMPLATES.filter(s => s.difficulty === difficulty)
}

/**
 * Get category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|undefined} Category object
 */
export function getCategoryById(categoryId) {
  return BUSINESS_CATEGORIES.find(c => c.id === categoryId)
}

/**
 * Get scenario count by category
 * @returns {Object} Map of categoryId to count
 */
export function getScenarioCountByCategory() {
  const counts = {}
  BUSINESS_CATEGORIES.forEach(cat => {
    counts[cat.id] = BUSINESS_SCENARIO_TEMPLATES.filter(s => s.category === cat.id).length
  })
  return counts
}

export default {
  BUSINESS_CATEGORIES,
  BUSINESS_SCENARIO_TEMPLATES,
  getScenariosByCategory,
  getScenariosByDifficulty,
  getCategoryById,
  getScenarioCountByCategory
}
