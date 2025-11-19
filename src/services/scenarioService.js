import axios from 'axios'

// Python AI 백엔드용 별도 axios 인스턴스
const pythonAPI = axios.create({
  baseURL: 'http://localhost:8000/api/ai',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
pythonAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Scenario Service
 * 시나리오 생성 및 관리를 위한 API 서비스
 */
export const scenarioService = {
  /**
   * 프로젝트 기반 시나리오 자동 생성
   * @param {Object} params - 생성 파라미터
   * @param {Array<string>} params.projectIds - 프로젝트 ID 목록
   * @param {Array<string>} params.scheduleIds - 일정 ID 목록
   * @param {Array<string>} params.documentIds - 문서 ID 목록
   * @param {string} params.language - 회화 언어 (en/zh/ja/ko)
   * @param {string} params.difficulty - 난이도 (beginner/intermediate/advanced)
   * @param {number} params.count - 생성 개수 (1-10)
   * @returns {Promise} 생성된 시나리오 목록
   */
  async generateFromProjects(params) {
    return pythonAPI.post('/scenarios/generate-from-projects', params)
  },

  /**
   * 모든 시나리오 조회
   * @param {Object} filters - 필터 옵션
   * @param {string} filters.language - 언어 필터
   * @param {string} filters.difficulty - 난이도 필터
   * @param {string} filters.category - 카테고리 필터
   * @param {string} filters.schedule_id - 일정 ID 필터
   * @returns {Promise} 시나리오 목록
   */
  async getAll(filters = {}) {
    return pythonAPI.get('/scenarios', { params: filters })
  },

  /**
   * 시나리오 상세 조회
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise} 시나리오 상세 정보
   */
  async getById(scenarioId) {
    return pythonAPI.get(`/scenarios/${scenarioId}`)
  },

  /**
   * 수동 시나리오 생성
   * @param {Object} scenarioData - 시나리오 데이터
   * @returns {Promise} 생성된 시나리오
   */
  async create(scenarioData) {
    return pythonAPI.post('/scenarios/create', scenarioData)
  },

  /**
   * 시나리오 수정
   * @param {string} scenarioId - 시나리오 ID
   * @param {Object} updateData - 수정할 데이터
   * @returns {Promise}
   */
  async update(scenarioId, updateData) {
    return pythonAPI.put(`/scenarios/${scenarioId}`, updateData)
  },

  /**
   * 시나리오 삭제
   * @param {string} scenarioId - 시나리오 ID
   * @returns {Promise}
   */
  async delete(scenarioId) {
    return pythonAPI.delete(`/scenarios/${scenarioId}`)
  }
}

export default scenarioService
