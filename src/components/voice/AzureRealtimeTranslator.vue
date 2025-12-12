<template>
  <div class="azure-realtime-translator">
    <!-- 헤더 -->
    <TranslatorHeader
      :recognized-count="recognizedCount"
      :formatted-elapsed-time="formattedElapsedTime"
    />

    <!-- 에러 배너 -->
    <TranslatorErrorBanner
      :speech-error="speechError"
      :tts-error="ttsError"
      @clear="handleClearErrors"
    />

    <!-- 언어 및 음성 선택 -->
    <TranslatorLanguageSelector
      v-model:selected-from-language="selectedFromLanguage"
      v-model:selected-to-language="selectedToLanguage"
      v-model:selected-voice="selectedVoice"
      :is-recognizing="isRecognizing"
      :supported-languages="SUPPORTED_LANGUAGES"
      :translation-languages="TRANSLATION_LANGUAGES"
      :available-voices="availableVoices"
      @update:selected-from-language="handleLanguageChange"
      @update:selected-to-language="handleLanguageChange"
    />

    <!-- 텍스트 카드 (원본 / 번역) -->
    <TranslatorTextCards
      :is-connecting="isConnecting"
      :is-recognizing="isRecognizing"
      :full-original-text="fullOriginalText"
      :full-translated-text="fullTranslatedText"
      :final-text="finalText"
      :partial-text="partialText"
      :final-translation="finalTranslation"
      :partial-translation="partialTranslation"
      :from-language-label="fromLanguageLabel"
      :to-language-label="toLanguageLabel"
    />

    <!-- 컨트롤 버튼 -->
    <TranslatorControls
      :is-connecting="isConnecting"
      :is-recognizing="isRecognizing"
      :is-speaking="isSpeaking"
      :final-text="finalText"
      :final-translation="finalTranslation"
      :recognized-count="recognizedCount"
      @toggle-recording="handleToggleRecording"
      @play-translation="handlePlayTranslation"
      @clear-all="handleClearAll"
      @export-results="handleExportResults"
    />

    <!-- 고급 설정 (접이식) -->
    <TranslatorAdvancedSettings
      v-model:show-advanced="showAdvanced"
      v-model:phrase-list-input="phraseListInput"
      :vad-silence-timeout="vadSilenceTimeout"
      :is-recognizing="isRecognizing"
      @update-vad="handleUpdateVAD"
      @update-phrase-list="handleUpdatePhraseList"
    />
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useAzureTranslator } from '../../composables/voice/useAzureTranslator'
import TranslatorHeader from './translator/TranslatorHeader.vue'
import TranslatorErrorBanner from './translator/TranslatorErrorBanner.vue'
import TranslatorLanguageSelector from './translator/TranslatorLanguageSelector.vue'
import TranslatorTextCards from './translator/TranslatorTextCards.vue'
import TranslatorControls from './translator/TranslatorControls.vue'
import TranslatorAdvancedSettings from './translator/TranslatorAdvancedSettings.vue'

// Composable로 모든 로직 위임
const {
  // State
  selectedFromLanguage,
  selectedToLanguage,
  selectedVoice,
  showAdvanced,
  phraseListInput,

  // Azure Speech State
  isRecognizing,
  isConnecting,
  speechError,
  partialText,
  finalText,
  partialTranslation,
  finalTranslation,
  fullOriginalText,
  fullTranslatedText,
  recognizedCount,
  vadSilenceTimeout,

  // Azure TTS State
  isSpeaking,
  ttsError,

  // Computed
  availableVoices,
  fromLanguageLabel,
  toLanguageLabel,
  formattedElapsedTime,

  // Constants
  SUPPORTED_LANGUAGES,
  TRANSLATION_LANGUAGES,

  // Actions
  handleLanguageChange,
  handleToggleRecording,
  handlePlayTranslation,
  handleClearAll,
  handleClearErrors,
  handleUpdateVAD,
  handleUpdatePhraseList,
  handleExportResults,
  initializeTranslator,
  cleanup
} = useAzureTranslator()

// 초기화
onMounted(() => {
  initializeTranslator()
})

// 정리
onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
/* 전체 컨테이너 */
.azure-realtime-translator {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>
