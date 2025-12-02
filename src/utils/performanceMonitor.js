/**
 * 음성 번역 성능 측정 모니터 (프론트엔드)
 *
 * 사용자가 체감하는 실제 지연 시간을 측정합니다.
 *
 * 사용 방법:
 * 1. session 시작: perfMonitor.startSession()
 * 2. 이벤트 측정: perfMonitor.startEvent('recording') / perfMonitor.endEvent('recording')
 * 3. session 종료: perfMonitor.endSession()
 * 4. 통계 확인: perfMonitor.getStats()
 * 5. CSV 내보내기: perfMonitor.exportToCSV()
 */

class PerformanceMonitor {
  constructor() {
    this.sessions = new Map()
    this.currentSession = null
    this.timers = new Map()
  }

  /**
   * 새 세션 시작
   * @returns {string} session ID
   */
  startSession() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.currentSession = {
      id: sessionId,
      startTime: performance.now(),
      endTime: null,
      events: []
    }
    this.sessions.set(sessionId, this.currentSession)
    console.log(`📊 Performance session started: ${sessionId}`)
    return sessionId
  }

  /**
   * 이벤트 측정 시작
   * @param {string} eventName - 이벤트 이름 (예: 'recording', 'recognizing', 'translation')
   * @param {object} metadata - 추가 메타데이터
   */
  startEvent(eventName, metadata = {}) {
    if (!this.currentSession) {
      console.warn('⚠️ No active session. Call startSession() first.')
      return
    }

    const key = `${this.currentSession.id}:${eventName}`
    this.timers.set(key, {
      startTime: performance.now(),
      metadata
    })
  }

  /**
   * 이벤트 측정 종료
   * @param {string} eventName - 이벤트 이름
   * @param {object} metadata - 추가 메타데이터
   * @returns {number|null} 측정된 시간 (ms)
   */
  endEvent(eventName, metadata = {}) {
    if (!this.currentSession) {
      console.warn('⚠️ No active session.')
      return null
    }

    const key = `${this.currentSession.id}:${eventName}`
    const timer = this.timers.get(key)

    if (!timer) {
      console.warn(`⚠️ Timer not found for event: ${eventName}`)
      return null
    }

    const endTime = performance.now()
    const duration = endTime - timer.startTime

    // 이벤트 기록
    this.currentSession.events.push({
      name: eventName,
      timestamp: timer.startTime,
      duration,
      metadata: { ...timer.metadata, ...metadata }
    })

    this.timers.delete(key)

    console.log(`⏱️  ${eventName}: ${duration.toFixed(2)}ms`, metadata)
    return duration
  }

  /**
   * 이벤트 직접 기록 (타이머 없이)
   * @param {string} eventName - 이벤트 이름
   * @param {number} duration - 지속 시간 (ms)
   * @param {object} metadata - 메타데이터
   */
  recordEvent(eventName, duration, metadata = {}) {
    if (!this.currentSession) {
      console.warn('⚠️ No active session.')
      return
    }

    this.currentSession.events.push({
      name: eventName,
      timestamp: performance.now(),
      duration,
      metadata
    })
  }

  /**
   * 세션 종료
   * @returns {object} 세션 통계
   */
  endSession() {
    if (!this.currentSession) {
      console.warn('⚠️ No active session.')
      return null
    }

    this.currentSession.endTime = performance.now()
    const stats = this.getStats(this.currentSession.id)

    console.log('\n' + '='.repeat(70))
    console.log(`🎯 Voice Translation Performance Stats - ${this.currentSession.id}`)
    console.log('='.repeat(70))
    console.log(`⏱️  Session Duration: ${stats.sessionDuration.toFixed(0)}ms`)
    console.log(`📊 Total Events: ${stats.totalEvents}`)
    console.log('')

    // Recognizing → Recognized (사용자 체감 지연 시간)
    if (stats.recognizing.count > 0) {
      console.log('⏱️  User Perceived Latency (Recognizing → Recognized):')
      console.log(`   Count: ${stats.recognizing.count}`)
      console.log(`   Avg:   ${stats.recognizing.avg.toFixed(0)}ms`)
      console.log(`   Min:   ${stats.recognizing.min.toFixed(0)}ms`)
      console.log(`   Max:   ${stats.recognizing.max.toFixed(0)}ms`)
      console.log('')
    }

    // WebSocket RTT
    if (stats.websocketRTT.count > 0) {
      console.log('🔄 WebSocket RTT:')
      console.log(`   Count: ${stats.websocketRTT.count}`)
      console.log(`   Avg:   ${stats.websocketRTT.avg.toFixed(0)}ms`)
      console.log(`   Min:   ${stats.websocketRTT.min.toFixed(0)}ms`)
      console.log(`   Max:   ${stats.websocketRTT.max.toFixed(0)}ms`)
      console.log('')
    }

    console.log('='.repeat(70) + '\n')

    this.currentSession = null
    return stats
  }

  /**
   * 세션 통계 계산
   * @param {string} sessionId - 세션 ID
   * @returns {object} 통계 데이터
   */
  getStats(sessionId) {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return { error: 'Session not found' }
    }

    const events = session.events

    // 이벤트별 분류
    const recognizingEvents = events.filter(e => e.name === 'recognizing')
    const recognizedEvents = events.filter(e => e.name === 'recognized')
    const websocketRTTEvents = events.filter(e => e.name === 'websocket_rtt')

    // 통계 계산 헬퍼
    const calcStats = (eventList) => {
      if (eventList.length === 0) {
        return { count: 0, avg: 0, min: 0, max: 0 }
      }

      const durations = eventList.map(e => e.duration)
      return {
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations)
      }
    }

    const sessionDuration = session.endTime
      ? session.endTime - session.startTime
      : performance.now() - session.startTime

    return {
      sessionId: session.id,
      sessionDuration,
      totalEvents: events.length,
      recognizing: calcStats(recognizingEvents),
      recognized: calcStats(recognizedEvents),
      websocketRTT: calcStats(websocketRTTEvents),
      events
    }
  }

  /**
   * CSV로 내보내기
   * @param {string} sessionId - 세션 ID (생략 시 현재 세션)
   * @returns {string} CSV 문자열
   */
  exportToCSV(sessionId = null) {
    const targetSessionId = sessionId || (this.currentSession ? this.currentSession.id : null)
    if (!targetSessionId) {
      console.warn('⚠️ No session to export.')
      return ''
    }

    const session = this.sessions.get(targetSessionId)
    if (!session) {
      console.warn(`⚠️ Session not found: ${targetSessionId}`)
      return ''
    }

    const headers = ['timestamp', 'event_name', 'duration_ms', 'metadata']
    const rows = session.events.map(event => [
      event.timestamp.toFixed(2),
      event.name,
      event.duration.toFixed(2),
      JSON.stringify(event.metadata)
    ])

    const csv = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')

    return csv
  }

  /**
   * CSV 파일 다운로드
   * @param {string} sessionId - 세션 ID (생략 시 현재 세션)
   */
  downloadCSV(sessionId = null) {
    const csv = this.exportToCSV(sessionId)
    if (!csv) return

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `voice_translation_performance_${sessionId || 'current'}.csv`
    link.click()
    URL.revokeObjectURL(url)

    console.log('✅ CSV downloaded successfully')
  }

  /**
   * 모든 세션 초기화
   */
  clearAll() {
    this.sessions.clear()
    this.currentSession = null
    this.timers.clear()
    console.log('🗑️  All performance data cleared')
  }
}

// 싱글톤 인스턴스
export const perfMonitor = new PerformanceMonitor()

// 전역 접근 (디버깅용)
if (typeof window !== 'undefined') {
  window.perfMonitor = perfMonitor
}
