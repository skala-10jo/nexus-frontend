/**
 * Azure TTS (Text-to-Speech) Composable
 *
 * Handles text-to-speech synthesis using Azure Neural Voices.
 *
 * Features:
 * - Neural voice synthesis
 * - SSML support for advanced control
 * - Playback control (play, pause, stop)
 * - Multiple voice options per language
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech
 */
import { ref } from 'vue'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { getSpeechToken } from '../services/azureSpeechService'

export function useAzureTTS() {
  // State
  const isInitialized = ref(false)
  const isSpeaking = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // Azure SDK instances
  let speechConfig = null
  let synthesizer = null
  let player = null

  /**
   * Initialize Azure TTS with token from backend.
   *
   * @throws {Error} If initialization fails
   */
  async function initialize() {
    if (isInitialized.value) {
      return
    }

    try {
      isConnecting.value = true
      error.value = null

      // Get token from backend
      console.log('🔑 Requesting Azure Speech token for TTS...')
      const { token, region } = await getSpeechToken()
      console.log(`✅ TTS token received for region: ${region}`)

      // Create speech config
      speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region)

      // Use default audio output
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput()

      // Create synthesizer (will be recreated for each voice)
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)

      isInitialized.value = true
      isConnecting.value = false

      console.log('✅ Azure TTS initialized successfully')
    } catch (err) {
      console.error('❌ Failed to initialize Azure TTS:', err)
      error.value = err.message
      isConnecting.value = false
      throw err
    }
  }

  /**
   * Speak text using specified neural voice.
   *
   * @param {string} text - Text to speak
   * @param {string} voiceName - Neural voice name (e.g., 'ko-KR-SunHiNeural')
   * @param {Object} options - Additional options
   * @param {number} options.rate - Speech rate (0.5 - 2.0, default 1.0)
   * @param {number} options.pitch - Speech pitch (-50% to +50%, default 0)
   * @param {number} options.volume - Speech volume (0 - 100, default 100)
   * @returns {Promise<void>}
   */
  async function speak(text, voiceName, options = {}) {
    if (!isInitialized.value) {
      await initialize()
    }

    if (isSpeaking.value) {
      console.warn('⚠️ Already speaking, stopping current speech')
      await stop()
    }

    if (!text || !text.trim()) {
      throw new Error('Text cannot be empty')
    }

    try {
      error.value = null
      isSpeaking.value = true

      // Set voice
      speechConfig.speechSynthesisVoiceName = voiceName

      // Build SSML for advanced control
      const ssml = buildSSML(text, voiceName, options)

      console.log(`🔊 Speaking with voice: ${voiceName}`)
      console.log(`📝 Text: "${text}"`)

      // Synthesize speech
      await new Promise((resolve, reject) => {
        synthesizer.speakSsmlAsync(
          ssml,
          result => {
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              console.log('✅ Speech synthesis completed')
              isSpeaking.value = false
              resolve()
            } else {
              const errorDetails = result.errorDetails
              console.error('❌ Speech synthesis failed:', errorDetails)
              error.value = errorDetails
              isSpeaking.value = false
              reject(new Error(errorDetails))
            }
          },
          err => {
            console.error('❌ Speech synthesis error:', err)
            error.value = err
            isSpeaking.value = false
            reject(err)
          }
        )
      })
    } catch (err) {
      console.error('❌ Failed to speak:', err)
      error.value = err.message
      isSpeaking.value = false
      throw err
    }
  }

  /**
   * Build SSML (Speech Synthesis Markup Language) for advanced voice control.
   *
   * @param {string} text - Text to speak
   * @param {string} voiceName - Voice name
   * @param {Object} options - Voice options (rate, pitch, volume)
   * @returns {string} SSML string
   */
  function buildSSML(text, voiceName, options = {}) {
    const {
      rate = 1.0, // 0.5 - 2.0
      pitch = 0, // -50% to +50%
      volume = 100 // 0 - 100
    } = options

    // Convert rate to percentage (1.0 = 100%)
    const ratePercent = Math.round(rate * 100)

    // Ensure pitch is within range
    const pitchPercent = Math.max(-50, Math.min(50, pitch))

    // Build SSML
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="${voiceName}">
          <prosody rate="${ratePercent}%" pitch="${pitchPercent >= 0 ? '+' : ''}${pitchPercent}%" volume="${volume}">
            ${escapeXML(text)}
          </prosody>
        </voice>
      </speak>
    `.trim()

    return ssml
  }

  /**
   * Escape XML special characters.
   *
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeXML(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;')
  }

  /**
   * Stop current speech synthesis.
   */
  async function stop() {
    if (!isSpeaking.value) {
      return
    }

    try {
      // Close and recreate synthesizer to stop immediately
      if (synthesizer) {
        synthesizer.close()
      }

      // Recreate synthesizer
      const audioConfig = SpeechSDK.AudioConfig.fromDefaultSpeakerOutput()
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig)

      isSpeaking.value = false

      console.log('⏹️ Speech stopped')
    } catch (err) {
      console.error('❌ Failed to stop speech:', err)
      throw err
    }
  }

  /**
   * Dispose all resources.
   */
  function dispose() {
    if (synthesizer) {
      synthesizer.close()
      synthesizer = null
    }

    if (player) {
      player = null
    }

    speechConfig = null
    isInitialized.value = false
    isSpeaking.value = false

    console.log('🗑️ Azure TTS disposed')
  }

  return {
    // State
    isInitialized,
    isSpeaking,
    isConnecting,
    error,

    // Methods
    initialize,
    speak,
    stop,
    dispose
  }
}
