/**
 * Practice Progress Store
 *
 * 회화 연습 시나리오별 진행도를 세션 동안 캐시합니다.
 * - 페이지 이탈 후 재진입 시 진행도 유지
 * - 브라우저 탭이 닫히면 초기화 (sessionStorage)
 *
 * @module practiceProgress
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'practice_progress'

export const usePracticeProgressStore = defineStore('practiceProgress', () => {
  // ============================================
  // State
  // ============================================

  /**
   * 시나리오별 진행도
   * { [scenarioId]: { currentStepIndex, completedStepIndices } }
   */
  const progressMap = ref({})

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * sessionStorage에서 진행도 로드
   */
  const loadFromStorage = () => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) {
        progressMap.value = JSON.parse(stored)
      }
    } catch (e) {
      console.warn('Failed to load practice progress from sessionStorage:', e)
    }
  }

  /**
   * sessionStorage에 진행도 저장
   */
  const saveToStorage = () => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap.value))
    } catch (e) {
      console.warn('Failed to save practice progress to sessionStorage:', e)
    }
  }

  // 초기 로드
  loadFromStorage()

  // ============================================
  // Getters
  // ============================================

  /**
   * 특정 시나리오의 진행도 조회
   * @param {string} scenarioId
   * @returns {{ currentStepIndex: number, completedStepIndices: number[] } | null}
   */
  const getProgress = (scenarioId) => {
    return progressMap.value[scenarioId] || null
  }

  /**
   * 특정 시나리오의 현재 스텝 인덱스 조회
   * @param {string} scenarioId
   * @returns {number}
   */
  const getCurrentStepIndex = (scenarioId) => {
    return progressMap.value[scenarioId]?.currentStepIndex ?? 0
  }

  /**
   * 특정 시나리오의 완료된 스텝 인덱스 배열 조회
   * @param {string} scenarioId
   * @returns {number[]}
   */
  const getCompletedStepIndices = (scenarioId) => {
    return progressMap.value[scenarioId]?.completedStepIndices ?? []
  }

  // ============================================
  // Actions
  // ============================================

  /**
   * 시나리오 진행도 업데이트
   * @param {string} scenarioId
   * @param {number} currentStepIndex
   * @param {number[]} completedStepIndices
   */
  const updateProgress = (scenarioId, currentStepIndex, completedStepIndices) => {
    progressMap.value[scenarioId] = {
      currentStepIndex,
      completedStepIndices: [...completedStepIndices]
    }
    saveToStorage()
  }

  /**
   * 스텝 완료 처리
   * @param {string} scenarioId
   * @param {number} completedIndex - 완료된 스텝 인덱스
   * @param {number} totalSteps - 전체 스텝 수
   * @returns {{ currentStepIndex: number, completedStepIndices: number[] }}
   */
  const completeStep = (scenarioId, completedIndex, totalSteps) => {
    const current = progressMap.value[scenarioId] || {
      currentStepIndex: 0,
      completedStepIndices: []
    }

    // 완료 목록에 추가
    if (!current.completedStepIndices.includes(completedIndex)) {
      current.completedStepIndices.push(completedIndex)
    }

    // 다음 스텝으로 이동 (마지막 스텝이 아닐 경우)
    if (current.currentStepIndex < totalSteps - 1) {
      current.currentStepIndex++
    }

    progressMap.value[scenarioId] = current
    saveToStorage()

    return current
  }

  /**
   * 특정 시나리오 진행도 초기화
   * @param {string} scenarioId
   */
  const resetProgress = (scenarioId) => {
    delete progressMap.value[scenarioId]
    saveToStorage()
  }

  /**
   * 모든 진행도 초기화
   */
  const resetAllProgress = () => {
    progressMap.value = {}
    saveToStorage()
  }

  // ============================================
  // Return
  // ============================================
  return {
    // State
    progressMap,

    // Getters
    getProgress,
    getCurrentStepIndex,
    getCompletedStepIndices,

    // Actions
    updateProgress,
    completeStep,
    resetProgress,
    resetAllProgress
  }
})
