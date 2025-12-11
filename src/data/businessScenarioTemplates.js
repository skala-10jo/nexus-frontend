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
    id: 'smalltalk',
    name: '스몰토크',
    icon: 'ChatBubbleOvalLeftEllipsisIcon',
    description: '일상적인 비즈니스 대화 및 사교'
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
    description: '새 프로젝트의 첫 미팅에서 목표와 일정을 공유하고 팀원들의 역할을 배정합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '프로젝트 리더',
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
    description: '매주 진행하는 팀 회의에서 업무 진행 상황을 보고하고 이슈를 공유합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '팀원',
      ai: '팀장'
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
    title: '상사와 1:1 면담',
    description: '상사와의 정기 면담에서 업무 현황과 커리어 목표에 대해 이야기합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '팀원',
      ai: '팀장'
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
    title: '고객사 미팅',
    description: '고객사와의 미팅에서 프로젝트 진행 상황을 보고하고 추가 요구사항을 확인합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '담당자',
      ai: '고객'
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
    title: '업무 도움 요청하기',
    description: '동료에게 업무 도움을 요청하고 어떻게 협력할지 이야기합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '요청자',
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
    title: '마감 연장 요청하기',
    description: '업무 마감일 연장이 필요한 상황에서 상사에게 양해를 구합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '팀원',
      ai: '팀장'
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
    title: '요청 정중히 거절하기',
    description: '바쁜 상황에서 동료의 업무 요청을 정중히 거절하고 대안을 제시합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '거절하는 사람',
      ai: '요청하는 동료'
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
    title: '칭찬 전달하기',
    description: '좋은 성과를 낸 팀원에게 구체적인 칭찬과 격려를 전달합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '팀장',
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
    title: '개선점 피드백 전달하기',
    description: '팀원에게 개선이 필요한 부분에 대해 건설적인 피드백을 전달합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '팀장',
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
    title: '피드백 받아들이기',
    description: '상사로부터 피드백을 받고 성숙하게 대응하며 개선 의지를 보여줍니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '팀원',
      ai: '팀장'
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
    title: '발표 시작하기',
    description: '프레젠테이션을 효과적으로 시작하며 청중의 관심을 사로잡습니다.',
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
    title: '질의응답 대응하기',
    description: '발표 후 청중의 다양한 질문에 명확하고 자신있게 답변합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '발표자',
      ai: '질문자'
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
    title: '발표 마무리하기',
    description: '발표를 인상적으로 마무리하고 다음 단계에 대한 합의를 이끌어냅니다.',
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
    title: '연봉 협상하기',
    description: '입사 또는 연봉 협상에서 자신의 가치를 효과적으로 어필합니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '지원자',
      ai: '인사 담당자'
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
    title: '계약 조건 협상하기',
    description: '비즈니스 계약 조건을 협상하며 서로 윈윈할 수 있는 합의점을 찾습니다.',
    language: 'EN',
    difficulty: 'advanced',
    roles: {
      user: '영업 담당자',
      ai: '고객 담당자'
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
    title: '인력 지원 협의하기',
    description: '프로젝트에 필요한 인력 지원을 다른 부서에 요청하고 협의합니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '프로젝트 리더',
      ai: '타 부서장'
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
  // Small Talk Scenarios (스몰토크)
  // ============================================
  {
    id: 'template-smalltalk-coffee',
    category: 'smalltalk',
    title: '커피 타임 대화',
    description: '휴식 시간에 동료와 가벼운 일상 대화를 나눕니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '나',
      ai: '동료'
    },
    systemPrompt: `You are a friendly colleague having coffee during a break.
Engage in casual conversation about topics like the weather, weekend plans, or recent movies.
Keep the conversation light and enjoyable.
Show genuine interest in what the other person shares.
Use natural, informal English appropriate for workplace conversations.`,
    requiredTerms: ['How are you', 'weekend', 'weather', 'plans', 'enjoy'],
    estimatedDuration: '5-10 min',
    tags: ['casual-conversation', 'relationship-building', 'workplace-culture']
  },
  {
    id: 'template-smalltalk-elevator',
    category: 'smalltalk',
    title: '엘리베이터에서 마주친 임원',
    description: '엘리베이터에서 우연히 만난 임원과 짧은 인사를 나눕니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '직원',
      ai: '임원'
    },
    systemPrompt: `You are a senior manager or executive riding the elevator.
Engage in brief, polite small talk appropriate for the short elevator ride.
Show interest in the employee but keep conversation professional yet warm.
Ask about their work or make comments about the day.
The conversation should be natural but time-limited (30 seconds to 1 minute).`,
    requiredTerms: ['good morning', 'busy', 'project', 'nice to see', 'have a good day'],
    estimatedDuration: '3-5 min',
    tags: ['elevator-pitch', 'professional-image', 'executive-interaction']
  },
  {
    id: 'template-smalltalk-lunch',
    category: 'smalltalk',
    title: '점심 시간 대화',
    description: '점심 식사 중 동료와 맛집, 취미, 여행 등 가벼운 주제로 대화합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '나',
      ai: '동료'
    },
    systemPrompt: `You are team members having lunch together.
Discuss casual topics like food, hobbies, travel, or current events.
Occasionally share personal stories and ask about others' experiences.
Keep the mood relaxed and friendly.
Switch topics naturally like in a real group conversation.`,
    requiredTerms: ['delicious', 'try', 'recommend', 'favorite', 'sounds good'],
    estimatedDuration: '10-15 min',
    tags: ['team-bonding', 'social-skills', 'casual-conversation']
  },
  {
    id: 'template-smalltalk-visitor',
    category: 'smalltalk',
    title: '방문객 맞이하기',
    description: '회의 전 방문한 고객이나 파트너를 맞이하며 편안한 분위기를 만듭니다.',
    language: 'EN',
    difficulty: 'intermediate',
    roles: {
      user: '담당자',
      ai: '방문객'
    },
    systemPrompt: `You are a visitor waiting for a meeting to start.
Appreciate the hospitality and engage in polite small talk.
Comment on the office, the commute, or current business trends.
Be professional but approachable.
Ask questions about the company or building if appropriate.`,
    requiredTerms: ['welcome', 'offer', 'comfortable', 'appreciate', 'looking forward'],
    estimatedDuration: '5-10 min',
    tags: ['hospitality', 'client-relations', 'professional-etiquette']
  },
  {
    id: 'template-smalltalk-after-meeting',
    category: 'smalltalk',
    title: '회의 끝나고 인사 나누기',
    description: '회의가 끝난 후 참석자들과 가볍게 대화하며 자리를 정리합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '나',
      ai: '동료'
    },
    systemPrompt: `You are a meeting attendee making small talk after the meeting ends.
Discuss light topics as people pack up - comment on the meeting, the room, or upcoming plans.
Be friendly and help transition from formal meeting mode to casual interaction.
Keep conversation brief as people need to get back to work.`,
    requiredTerms: ['great meeting', 'productive', 'catch up', 'see you', 'take care'],
    estimatedDuration: '3-5 min',
    tags: ['post-meeting', 'networking', 'relationship-building']
  },
  {
    id: 'template-smalltalk-new-colleague',
    category: 'smalltalk',
    title: '새 동료 환영하기',
    description: '새로 입사한 동료에게 인사하고 회사 생활에 대해 이야기합니다.',
    language: 'EN',
    difficulty: 'beginner',
    roles: {
      user: '선배',
      ai: '신입사원'
    },
    systemPrompt: `You are a new employee on your first week at the company.
Be slightly nervous but eager to make a good impression.
Ask questions about the company culture, team dynamics, and practical things.
Show gratitude for any help or information offered.
Share a bit about your background when asked.`,
    requiredTerms: ['welcome', 'how do you like', 'let me know', 'help', 'join us'],
    estimatedDuration: '5-10 min',
    tags: ['onboarding', 'mentoring', 'team-culture']
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
