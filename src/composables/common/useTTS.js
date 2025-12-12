/**
 * TTS Composable
 *
 * Text-to-Speech 공통 기능
 * 재사용 가능한 TTS 로직 제공
 */
import { ref } from 'vue'
import { pythonAPI } from '@/services/api'

export function useTTS() {
  const ttsLoading = ref(false)

  /**
   * 텍스트를 음성으로 재생
   * @param {string} text - 재생할 텍스트
   * @param {string} voiceName - Azure TTS 음성 이름
   * @returns {Promise<void>}
   */
  const playTTS = async (text, voiceName = 'en-US-JennyNeural') => {
    if (!text || ttsLoading.value) return

    ttsLoading.value = true
    try {
      const response = await pythonAPI.post(
        '/expression/speech/synthesize-text',
        { text, voice_name: voiceName },
        { responseType: 'arraybuffer' }
      )

      const audioBlob = new Blob([response.data], { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => URL.revokeObjectURL(audioUrl)

      // Chrome Autoplay Policy: play()는 Promise 반환, 에러 처리 필요
      await audio.play().catch((err) => {
        console.error('Audio play failed:', err)
        URL.revokeObjectURL(audioUrl)
      })
    } catch (error) {
      console.error('TTS failed:', error)
    } finally {
      ttsLoading.value = false
    }
  }

  return {
    ttsLoading,
    playTTS
  }
}
