import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useScheduleEvents } from '@/composables/management/useScheduleEvents'
import { useAttendance } from '@/composables/useAttendance'
import api, { pythonAPI } from '@/services/api'

/**
 * Dashboard 페이지 메인 로직
 *
 * @description 대시보드 페이지의 전체 상태와 비즈니스 로직을 관리
 */
export function useDashboard() {
  const router = useRouter()
  const authStore = useAuthStore()

  // ============================================
  // External Composables
  // ============================================
  const { allEvents, fetchAllEvents, loading: loadingEvents } = useScheduleEvents()
  const { isCheckedIn, checkTodayStatus, submitCheckIn, fetchAttendanceRecords, hasAttendance } = useAttendance()

  // ============================================
  // State
  // ============================================
  const user = computed(() => authStore.user)
  const selectedDate = ref(null)
  const showSuccessPopup = ref(false)
  const todayExpression = ref(null)
  const expressions = ref([])

  // ============================================
  // Event Color Logic
  // ============================================
  const eventColors = [
    { bg: 'bg-blue-500', light: 'bg-blue-100' },
    { bg: 'bg-pink-500', light: 'bg-pink-100' },
    { bg: 'bg-green-500', light: 'bg-green-100' },
    { bg: 'bg-orange-500', light: 'bg-orange-100' },
    { bg: 'bg-purple-500', light: 'bg-purple-100' },
    { bg: 'bg-teal-500', light: 'bg-teal-100' },
  ]

  const eventColorMap = new Map()
  let nextColorIndex = 0

  /**
   * 이벤트 ID에 대해 일관된 색상 반환
   */
  const getEventColor = (eventId) => {
    const key = eventId ?? '__no_id__'

    if (!eventColorMap.has(key)) {
      eventColorMap.set(key, nextColorIndex)
      nextColorIndex = (nextColorIndex + 1) % eventColors.length
    }

    const index = eventColorMap.get(key)
    return eventColors[index]
  }

  // ============================================
  // Computed
  // ============================================

  /**
   * 예정 일정 목록 (색상 정보 포함)
   */
  const upcomingEvents = computed(() => {
    let events = allEvents.value

    // Filter by selected date if set
    if (selectedDate.value) {
      events = events.filter(event => {
        const eStart = new Date(event.start)
        const eEnd = event.end ? new Date(event.end) : new Date(eStart)
        const sel = selectedDate.value

        const checkDate = new Date(sel.getFullYear(), sel.getMonth(), sel.getDate())
        const startDate = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate())
        const endDate = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate())

        return checkDate >= startDate && checkDate <= endDate
      })
    } else {
      // Default: Future events
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      events = events.filter(event => {
        const eEnd = event.end ? new Date(event.end) : new Date(event.start)
        return eEnd >= now
      })
    }

    // Sort by start date
    const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start))

    return sorted.slice(0, 50).map(event => {
      const colors = getEventColor(event.id)
      return {
        ...event,
        colorClass: colors.bg,
        lightColorClass: colors.light
      }
    })
  })

  /**
   * 배너용 일정 메시지
   */
  const scheduleMessage = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 오늘 일정 찾기
    const todayEvents = allEvents.value.filter(event => {
      const eStart = new Date(event.start)
      const eEnd = event.end ? new Date(event.end) : new Date(eStart)
      const startDate = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate())
      const endDate = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate())
      return today >= startDate && today <= endDate
    })

    if (todayEvents.length > 0) {
      const event = todayEvents[0]
      return {
        text: `오늘은 "${event.title}" 일정이 있어요! `,
        hasSchedule: true,
        eventTitle: event.title,
        link: { path: '/conversation/scenario', query: { scheduleId: event.id } }
      }
    }

    // 다가올 일정 찾기
    const futureEvents = allEvents.value
      .filter(event => {
        const eStart = new Date(event.start)
        eStart.setHours(0, 0, 0, 0)
        return eStart > today
      })
      .sort((a, b) => new Date(a.start) - new Date(b.start))

    if (futureEvents.length > 0) {
      const event = futureEvents[0]
      return {
        text: `곧 "${event.title}" 일정이 있어요! `,
        hasSchedule: true,
        eventTitle: event.title,
        link: { path: '/conversation/scenario', query: { scheduleId: event.id } }
      }
    }

    return {
      text: '일정을 등록하고 시나리오 회화 연습해보는건 어때요? ',
      hasSchedule: false,
      eventTitle: '',
      link: '/management/schedule'
    }
  })

  /**
   * 오늘의 일정 목록
   */
  const todayEvents = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return allEvents.value.filter(event => {
      const eStart = new Date(event.start)
      const eEnd = event.end ? new Date(event.end) : new Date(eStart)
      const startDate = new Date(eStart.getFullYear(), eStart.getMonth(), eStart.getDate())
      const endDate = new Date(eEnd.getFullYear(), eEnd.getMonth(), eEnd.getDate())
      return today >= startDate && today <= endDate
    })
  })

  // ============================================
  // Actions
  // ============================================

  /**
   * 랜덤 표현 가져오기 (Python API 사용 - 전체 랜덤)
   */
  const fetchRandomExpression = async () => {
    try {
      console.log('[Dashboard] Fetching random expressions from Python API...')

      const response = await pythonAPI.get('/expressions/random', {
        params: { limit: 5 }
      })

      console.log('[Dashboard] API Response:', response.data)
      const fetchedExpressions = response.data.data || []
      console.log('[Dashboard] Fetched expressions count:', fetchedExpressions.length)

      if (fetchedExpressions.length > 0) {
        expressions.value = fetchedExpressions
        todayExpression.value = fetchedExpressions[0]
        console.log('[Dashboard] Expressions set successfully:', expressions.value.length)
      }
    } catch (err) {
      console.error('[Dashboard] Failed to fetch random expression:', err)
      const fallback = {
        expression: "Let's touch base later.",
        meaning: "나중에 연락하자",
        example_en: "Let's touch base later this week to discuss the project.",
        example_ko: "이번 주 후반에 프로젝트에 대해 논의하기 위해 연락합시다."
      }
      expressions.value = [fallback]
      todayExpression.value = fallback
    }
  }

  /**
   * 출석 체크 처리
   */
  const handleCheckIn = async () => {
    const success = await submitCheckIn()
    if (success) {
      showSuccessPopup.value = true
      setTimeout(() => {
        showSuccessPopup.value = false
      }, 3000)
    }
  }

  /**
   * 날짜 선택
   */
  const selectDate = (date) => {
    if (selectedDate.value && selectedDate.value.toDateString() === date.toDateString()) {
      selectedDate.value = null
    } else {
      selectedDate.value = date
    }
  }

  /**
   * 날짜 선택 해제
   */
  const clearSelectedDate = () => {
    selectedDate.value = null
  }

  /**
   * 시나리오 연습 페이지로 이동
   */
  const goToPractice = (event) => {
    router.push('/conversation/scenario')
  }

  /**
   * 초기 데이터 로드
   */
  const initializeDashboard = async () => {
    await Promise.all([
      fetchAllEvents(),
      fetchRandomExpression(),
      checkTodayStatus(),
      fetchAttendanceRecords()
    ])
  }

  // ============================================
  // Lifecycle
  // ============================================
  onMounted(() => {
    initializeDashboard()
  })

  // ============================================
  // Return
  // ============================================
  return {
    // State
    user,
    selectedDate,
    showSuccessPopup,
    todayExpression,
    expressions,
    allEvents,
    loadingEvents,
    isCheckedIn,

    // Computed
    upcomingEvents,
    scheduleMessage,
    todayEvents,

    // Actions
    handleCheckIn,
    selectDate,
    clearSelectedDate,
    goToPractice,
    getEventColor,
    hasAttendance,
    initializeDashboard
  }
}
