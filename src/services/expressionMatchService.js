/**
 * Expression Match Service
 *
 * 비즈니스 표현-예문 매칭 API 서비스
 * 정규식 매칭 실패 시 AI Fallback 사용
 */
import api from './api'

const PYTHON_API_BASE = import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000'

/**
 * expression이 sentence 어디에 해당하는지 찾기
 *
 * @param {string} expression - 비즈니스 표현 (예: "take (someone) through")
 * @param {string} sentence - 예문 (예: "Can you take me through the budget?")
 * @param {boolean} useAiFallback - 정규식 실패 시 AI 사용 여부 (기본값: true)
 * @returns {Promise<Object>} 매칭 결과
 *
 * @example
 * const result = await findMatch("take (someone) through", "Can you take me through the budget?")
 * // { matched: true, start_index: 8, end_index: 23, matched_text: "take me through", method: "ai" }
 */
export async function findMatch(expression, sentence, useAiFallback = true) {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/api/ai/expression/find-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        expression,
        sentence,
        use_ai_fallback: useAiFallback
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Expression match API failed:', error)
    return {
      matched: false,
      start_index: 0,
      end_index: 0,
      matched_text: '',
      method: 'error',
      error: error.message
    }
  }
}

/**
 * 여러 expression-sentence 쌍에 대해 배치 매칭
 *
 * @param {Array<{expression: string, sentence: string}>} items - 매칭할 쌍들
 * @param {boolean} useAiFallback - 정규식 실패 시 AI 사용 여부
 * @returns {Promise<Object>} 배치 매칭 결과
 */
export async function findMatchBatch(items, useAiFallback = true) {
  try {
    const response = await fetch(`${PYTHON_API_BASE}/api/ai/expression/find-match/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items,
        use_ai_fallback: useAiFallback
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Expression match batch API failed:', error)
    return {
      results: items.map(() => ({
        matched: false,
        start_index: 0,
        end_index: 0,
        matched_text: '',
        method: 'error'
      })),
      total: items.length,
      matched_count: 0,
      regex_count: 0,
      ai_count: 0
    }
  }
}

/**
 * 정규식 특수문자 이스케이프 (프론트엔드용)
 *
 * @param {string} text - 원본 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
export function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 프론트엔드에서 정규식 매칭 시도 (빠른 경로)
 *
 * @param {string} expression - 비즈니스 표현
 * @param {string} sentence - 예문
 * @returns {Object|null} 매칭 결과 또는 null
 */
export function tryLocalRegexMatch(expression, sentence) {
  try {
    // 변수 패턴 변환
    let pattern = expression

    // 1. 끝에 있는 ~ 제거 (예: "I am writing to~" → "I am writing to")
    // ~ 뒤의 내용은 가변적이므로 ~ 앞까지만 매칭
    pattern = pattern.replace(/\s*~\s*$/g, '')

    // 2. 끝에 있는 ... 제거 (예: "Thank you for..." → "Thank you for")
    pattern = pattern.replace(/\s*\.\.\.\s*$/g, '')

    // 3. (someone), (somebody) → 단어 매칭
    pattern = pattern.replace(/\(someone\)|\(somebody\)/gi, '(\\w+)')

    // 4. (something) → 비탐욕적 매칭
    pattern = pattern.replace(/\(something\)/gi, '(.+?)')

    // 5. one's → 소유격 대명사
    pattern = pattern.replace(/\bone's\b/gi, "(my|your|his|her|their|its|our|one's)")

    // 6. 중간에 있는 ~ → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/~/g, '(.+?)')

    // 7. 중간에 있는 ... → 가변 텍스트 (비탐욕적)
    pattern = pattern.replace(/\.\.\./g, '(.+?)')

    const regex = new RegExp(pattern, 'gi')
    const match = regex.exec(sentence)

    if (match) {
      return {
        matched: true,
        start_index: match.index,
        end_index: match.index + match[0].length,
        matched_text: match[0],
        method: 'local_regex'
      }
    }

    return null
  } catch (error) {
    console.warn('Local regex match failed:', error)
    return null
  }
}

/**
 * 하이라이트 HTML 생성 (매칭 결과 사용)
 *
 * @param {string} sentence - 원본 문장
 * @param {Object} matchResult - 매칭 결과
 * @param {string} highlightClass - 하이라이트 CSS 클래스
 * @returns {string} HTML 문자열
 */
export function createHighlightHtml(sentence, matchResult, highlightClass = 'bg-yellow-300 text-gray-900 font-bold px-1 rounded') {
  if (!matchResult || !matchResult.matched) {
    return sentence
  }

  const { start_index, end_index } = matchResult
  const before = sentence.substring(0, start_index)
  const highlighted = sentence.substring(start_index, end_index)
  const after = sentence.substring(end_index)

  return `${before}<mark class="${highlightClass}">${highlighted}</mark>${after}`
}

/**
 * 빈칸 HTML 생성 (매칭 결과 사용)
 *
 * @param {string} sentence - 원본 문장
 * @param {Object} matchResult - 매칭 결과
 * @param {string} blankClass - 빈칸 CSS 클래스
 * @returns {string} HTML 문자열
 */
export function createBlankHtml(sentence, matchResult, blankClass = 'px-2 py-1 bg-gray-200 rounded mx-1') {
  if (!matchResult || !matchResult.matched) {
    return sentence
  }

  const { start_index, end_index } = matchResult
  const before = sentence.substring(0, start_index)
  const after = sentence.substring(end_index)

  return `${before}<span class="${blankClass}">________</span>${after}`
}

export default {
  findMatch,
  findMatchBatch,
  tryLocalRegexMatch,
  createHighlightHtml,
  createBlankHtml,
  escapeRegExp
}
