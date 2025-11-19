/**
 * Azure Speech Composable
 *
 * Handles real-time Speech-to-Text and Translation using Azure Speech SDK.
 *
 * Features:
 * - Real-time speech recognition from microphone
 * - Simultaneous translation to target language
 * - Partial (recognizing) and final (recognized) results
 * - VAD (Voice Activity Detection) configuration
 * - Phrase list support for better recognition
 * - Error handling and reconnection
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/
 */
import { ref, computed } from 'vue'
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { getSpeechToken } from '../services/azureSpeechService'
import { recognitionToTranslation } from '../config/azureSpeechConfig'

export function useAzureSpeech() {
  // State
  const isInitialized = ref(false)
  const isRecognizing = ref(false)
  const isConnecting = ref(false)
  const error = ref(null)

  // Recognition results
  const partialText = ref('')
  const finalText = ref('')
  const partialTranslation = ref('')
  const finalTranslation = ref('')

  // All recognized sentences
  const recognizedSentences = ref([])
  const translatedSentences = ref([])

  // Azure SDK instances
  let speechConfig = null
  let audioConfig = null
  let translationRecognizer = null

  // Configuration
  const fromLanguage = ref('ko-KR')
  const toLanguage = ref('en')

  // VAD settings
  const vadSilenceTimeout = ref(1000) // ms, default 1000ms

  // Phrase list for better recognition
  const phraseList = ref([])

  /**
   * Initialize Azure Speech SDK with token from backend.
   *
   * @param {string} sourceLang - Source language (BCP-47 format, e.g., 'ko-KR')
   * @param {string} targetLang - Target language (2-letter ISO code, e.g., 'en')
   * @throws {Error} If initialization fails
   */
  async function initialize(sourceLang, targetLang) {
    try {
      isConnecting.value = true
      error.value = null

      // Get token from backend
      console.log('🔑 Requesting Azure Speech token from backend...')
      const { token, region } = await getSpeechToken()
      console.log(`✅ Token received for region: ${region}`)

      // Create speech config
      speechConfig = SpeechSDK.SpeechTranslationConfig.fromAuthorizationToken(token, region)

      // Set source language (recognition)
      speechConfig.speechRecognitionLanguage = sourceLang
      fromLanguage.value = sourceLang

      // Set target language (translation)
      speechConfig.addTargetLanguage(targetLang)
      toLanguage.value = targetLang

      // VAD configuration
      // Speech_SegmentationSilenceTimeoutMs: How long to wait before considering end of speech
      // Lower values (700ms): Quick response, may cut off speech
      // Higher values (1500ms): Better for long sentences, slower response
      speechConfig.setProperty(
        SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
        vadSilenceTimeout.value.toString()
      )

      // Enable detailed results
      speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed

      // Create audio config from default microphone
      audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput()

      // Create translation recognizer
      translationRecognizer = new SpeechSDK.TranslationRecognizer(speechConfig, audioConfig)

      // Set up event handlers
      setupEventHandlers()

      // Apply phrase list if exists
      if (phraseList.value.length > 0) {
        applyPhraseList()
      }

      isInitialized.value = true
      isConnecting.value = false

      console.log('✅ Azure Speech SDK initialized successfully')
      console.log(`   Source: ${sourceLang}, Target: ${targetLang}`)
    } catch (err) {
      console.error('❌ Failed to initialize Azure Speech SDK:', err)
      error.value = err.message
      isConnecting.value = false
      throw err
    }
  }

  /**
   * Set up event handlers for translation recognizer.
   */
  function setupEventHandlers() {
    if (!translationRecognizer) return

    // Recognizing (partial results)
    translationRecognizer.recognizing = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.TranslatingSpeech) {
        // Original text (partial)
        partialText.value = e.result.text

        // Translated text (partial)
        const translations = e.result.translations
        if (translations.get(toLanguage.value)) {
          partialTranslation.value = translations.get(toLanguage.value)
        }

        console.log(`🎤 Recognizing: "${e.result.text}"`)
        console.log(`🌐 Translating: "${partialTranslation.value}"`)
      }
    }

    // Recognized (final results)
    translationRecognizer.recognized = (s, e) => {
      if (e.result.reason === SpeechSDK.ResultReason.TranslatedSpeech) {
        const originalText = e.result.text
        const translations = e.result.translations
        const translatedText = translations.get(toLanguage.value) || ''

        if (originalText && originalText.trim()) {
          // Add to final text
          finalText.value += (finalText.value ? ' ' : '') + originalText
          finalTranslation.value += (finalTranslation.value ? ' ' : '') + translatedText

          // Add to sentences array
          recognizedSentences.value.push({
            text: originalText,
            timestamp: new Date().toISOString(),
            confidence: e.result.properties.getProperty(
              SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult
            )
          })

          translatedSentences.value.push({
            text: translatedText,
            timestamp: new Date().toISOString()
          })

          console.log(`✅ Recognized: "${originalText}"`)
          console.log(`✅ Translated: "${translatedText}"`)
        }

        // Clear partial results
        partialText.value = ''
        partialTranslation.value = ''
      } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
        console.log('⚠️ No speech could be recognized')
      }
    }

    // Canceled (error handling)
    translationRecognizer.canceled = (s, e) => {
      console.error('❌ Recognition canceled:', e.errorDetails)

      if (e.reason === SpeechSDK.CancellationReason.Error) {
        error.value = e.errorDetails

        // Handle token expiration
        if (e.errorDetails.includes('authentication') || e.errorDetails.includes('token')) {
          console.log('🔄 Token expired, need to reinitialize')
        }
      }

      stopRecognition()
    }

    // Session started
    translationRecognizer.sessionStarted = (s, e) => {
      console.log('🎙️ Speech recognition session started')
    }

    // Session stopped
    translationRecognizer.sessionStopped = (s, e) => {
      console.log('⏹️ Speech recognition session stopped')
      isRecognizing.value = false
    }
  }

  /**
   * Apply phrase list for better recognition of specific terms.
   */
  function applyPhraseList() {
    if (!translationRecognizer || phraseList.value.length === 0) return

    const grammar = SpeechSDK.PhraseListGrammar.fromRecognizer(translationRecognizer)

    phraseList.value.forEach(phrase => {
      grammar.addPhrase(phrase)
    })

    console.log(`📝 Applied ${phraseList.value.length} phrases to recognition`)
  }

  /**
   * Start continuous speech recognition and translation.
   */
  async function startRecognition() {
    if (!isInitialized.value) {
      throw new Error('Speech SDK not initialized. Call initialize() first.')
    }

    if (isRecognizing.value) {
      console.warn('⚠️ Recognition already running')
      return
    }

    try {
      error.value = null
      isRecognizing.value = true

      await translationRecognizer.startContinuousRecognitionAsync()

      console.log('▶️ Started continuous recognition')
    } catch (err) {
      console.error('❌ Failed to start recognition:', err)
      error.value = err.message
      isRecognizing.value = false
      throw err
    }
  }

  /**
   * Stop continuous speech recognition.
   */
  async function stopRecognition() {
    if (!isRecognizing.value) {
      return
    }

    try {
      await translationRecognizer.stopContinuousRecognitionAsync()

      isRecognizing.value = false

      console.log('⏹️ Stopped continuous recognition')
    } catch (err) {
      console.error('❌ Failed to stop recognition:', err)
      throw err
    }
  }

  /**
   * Update VAD silence timeout.
   *
   * @param {number} timeoutMs - Silence timeout in milliseconds (700-1500 recommended)
   */
  function updateVADSettings(timeoutMs) {
    vadSilenceTimeout.value = timeoutMs

    if (speechConfig) {
      speechConfig.setProperty(
        SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
        timeoutMs.toString()
      )

      console.log(`⚙️ Updated VAD silence timeout to ${timeoutMs}ms`)
    }
  }

  /**
   * Add phrases to phrase list for better recognition.
   *
   * @param {string[]} phrases - Array of phrases
   */
  function addPhrases(phrases) {
    phraseList.value = [...phraseList.value, ...phrases]

    if (translationRecognizer) {
      applyPhraseList()
    }
  }

  /**
   * Clear phrase list.
   */
  function clearPhrases() {
    phraseList.value = []
  }

  /**
   * Clear all recognition results.
   */
  function clearResults() {
    partialText.value = ''
    finalText.value = ''
    partialTranslation.value = ''
    finalTranslation.value = ''
    recognizedSentences.value = []
    translatedSentences.value = []
  }

  /**
   * Dispose all resources.
   */
  function dispose() {
    if (translationRecognizer) {
      translationRecognizer.close()
      translationRecognizer = null
    }

    speechConfig = null
    audioConfig = null
    isInitialized.value = false
    isRecognizing.value = false

    console.log('🗑️ Azure Speech SDK disposed')
  }

  // Computed
  const fullOriginalText = computed(() => {
    return finalText.value + (partialText.value ? ' ' + partialText.value : '')
  })

  const fullTranslatedText = computed(() => {
    return finalTranslation.value + (partialTranslation.value ? ' ' + partialTranslation.value : '')
  })

  const recognizedCount = computed(() => recognizedSentences.value.length)

  return {
    // State
    isInitialized,
    isRecognizing,
    isConnecting,
    error,

    // Results
    partialText,
    finalText,
    partialTranslation,
    finalTranslation,
    recognizedSentences,
    translatedSentences,
    fullOriginalText,
    fullTranslatedText,
    recognizedCount,

    // Configuration
    fromLanguage,
    toLanguage,
    vadSilenceTimeout,
    phraseList,

    // Methods
    initialize,
    startRecognition,
    stopRecognition,
    updateVADSettings,
    addPhrases,
    clearPhrases,
    clearResults,
    dispose
  }
}
