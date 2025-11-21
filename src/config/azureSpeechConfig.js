/**
 * Azure Speech Service 설정
 *
 * Azure Speech SDK를 위한 지원 언어, 음성 및 인식 설정
 *
 * @see https://learn.microsoft.com/azure/ai-services/speech-service/language-support
 */

/**
 * 음성 인식 및 번역을 위한 지원 언어
 * BCP-47 형식 (예: 'ko-KR', 'en-US')
 */
export const SUPPORTED_LANGUAGES = [
  { code: 'ko-KR', label: '한국어 (Korean)', flag: '🇰🇷' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'ja-JP', label: '日本語 (Japanese)', flag: '🇯🇵' },
  { code: 'zh-CN', label: '中文 (Chinese Simplified)', flag: '🇨🇳' },
  { code: 'zh-TW', label: '中文 (Chinese Traditional)', flag: '🇹🇼' },
  { code: 'vi-VN', label: 'Tiếng Việt (Vietnamese)', flag: '🇻🇳' },
  { code: 'th-TH', label: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'id-ID', label: 'Bahasa Indonesia (Indonesian)', flag: '🇮🇩' },
  { code: 'es-ES', label: 'Español (Spanish)', flag: '🇪🇸' },
  { code: 'fr-FR', label: 'Français (French)', flag: '🇫🇷' },
  { code: 'de-DE', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'it-IT', label: 'Italiano (Italian)', flag: '🇮🇹' },
  { code: 'pt-BR', label: 'Português (Portuguese)', flag: '🇧🇷' },
  { code: 'ru-RU', label: 'Русский (Russian)', flag: '🇷🇺' },
  { code: 'ar-SA', label: 'العربية (Arabic)', flag: '🇸🇦' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'tr-TR', label: 'Türkçe (Turkish)', flag: '🇹🇷' },
  { code: 'pl-PL', label: 'Polski (Polish)', flag: '🇵🇱' },
  { code: 'nl-NL', label: 'Nederlands (Dutch)', flag: '🇳🇱' }
]

/**
 * 각 언어별 뉴럴 음성
 * 뉴럴 TTS 기술을 사용한 프리미엄 품질 음성
 */
export const NEURAL_VOICES = {
  'ko-KR': [
    { value: 'ko-KR-SunHiNeural', label: '선희 (여성, 밝음)', gender: 'Female', style: 'Bright' },
    { value: 'ko-KR-InJoonNeural', label: '인준 (남성, 차분함)', gender: 'Male', style: 'Calm' },
    { value: 'ko-KR-BongJinNeural', label: '봉진 (남성, 친근함)', gender: 'Male', style: 'Friendly' },
    { value: 'ko-KR-GookMinNeural', label: '국민 (남성, 공식적)', gender: 'Male', style: 'Formal' }
  ],
  'en-US': [
    { value: 'en-US-JennyNeural', label: 'Jenny (Female, Assistant)', gender: 'Female', style: 'Assistant' },
    { value: 'en-US-GuyNeural', label: 'Guy (Male, News)', gender: 'Male', style: 'News' },
    { value: 'en-US-AriaNeural', label: 'Aria (Female, Chat)', gender: 'Female', style: 'Chat' },
    { value: 'en-US-DavisNeural', label: 'Davis (Male, Chat)', gender: 'Male', style: 'Chat' },
    { value: 'en-US-JaneNeural', label: 'Jane (Female, Natural)', gender: 'Female', style: 'Natural' },
    { value: 'en-US-JasonNeural', label: 'Jason (Male, Natural)', gender: 'Male', style: 'Natural' }
  ],
  'en-GB': [
    { value: 'en-GB-SoniaNeural', label: 'Sonia (Female)', gender: 'Female', style: 'Natural' },
    { value: 'en-GB-RyanNeural', label: 'Ryan (Male)', gender: 'Male', style: 'Natural' },
    { value: 'en-GB-LibbyNeural', label: 'Libby (Female)', gender: 'Female', style: 'Natural' }
  ],
  'ja-JP': [
    { value: 'ja-JP-NanamiNeural', label: 'ななみ (女性, 自然)', gender: 'Female', style: 'Natural' },
    { value: 'ja-JP-KeitaNeural', label: 'けいた (男性, 自然)', gender: 'Male', style: 'Natural' },
    { value: 'ja-JP-AoiNeural', label: 'あおい (女性, 明るい)', gender: 'Female', style: 'Bright' }
  ],
  'zh-CN': [
    { value: 'zh-CN-XiaoxiaoNeural', label: '晓晓 (女性, 温柔)', gender: 'Female', style: 'Warm' },
    { value: 'zh-CN-YunxiNeural', label: '云希 (男性, 沉稳)', gender: 'Male', style: 'Calm' },
    { value: 'zh-CN-YunyangNeural', label: '云扬 (男性, 专业)', gender: 'Male', style: 'Professional' },
    { value: 'zh-CN-XiaoyiNeural', label: '晓依 (女性, 亲切)', gender: 'Female', style: 'Friendly' }
  ],
  'zh-TW': [
    { value: 'zh-TW-HsiaoChenNeural', label: '曉臻 (女性)', gender: 'Female', style: 'Natural' },
    { value: 'zh-TW-YunJheNeural', label: '雲哲 (男性)', gender: 'Male', style: 'Natural' },
    { value: 'zh-TW-HsiaoYuNeural', label: '曉雨 (女性)', gender: 'Female', style: 'Natural' }
  ],
  'vi-VN': [
    { value: 'vi-VN-HoaiMyNeural', label: 'Hoài My (Nữ)', gender: 'Female', style: 'Natural' },
    { value: 'vi-VN-NamMinhNeural', label: 'Nam Minh (Nam)', gender: 'Male', style: 'Natural' }
  ],
  'th-TH': [
    { value: 'th-TH-PremwadeeNeural', label: 'เปรมวดี (หญิง)', gender: 'Female', style: 'Natural' },
    { value: 'th-TH-NiwatNeural', label: 'นิวัฒน์ (ชาย)', gender: 'Male', style: 'Natural' }
  ],
  'id-ID': [
    { value: 'id-ID-GadisNeural', label: 'Gadis (Perempuan)', gender: 'Female', style: 'Natural' },
    { value: 'id-ID-ArdiNeural', label: 'Ardi (Laki-laki)', gender: 'Male', style: 'Natural' }
  ],
  'es-ES': [
    { value: 'es-ES-ElviraNeural', label: 'Elvira (Femenino)', gender: 'Female', style: 'Natural' },
    { value: 'es-ES-AlvaroNeural', label: 'Álvaro (Masculino)', gender: 'Male', style: 'Natural' }
  ],
  'fr-FR': [
    { value: 'fr-FR-DeniseNeural', label: 'Denise (Féminin)', gender: 'Female', style: 'Natural' },
    { value: 'fr-FR-HenriNeural', label: 'Henri (Masculin)', gender: 'Male', style: 'Natural' }
  ],
  'de-DE': [
    { value: 'de-DE-KatjaNeural', label: 'Katja (Weiblich)', gender: 'Female', style: 'Natural' },
    { value: 'de-DE-ConradNeural', label: 'Conrad (Männlich)', gender: 'Male', style: 'Natural' }
  ],
  'it-IT': [
    { value: 'it-IT-ElsaNeural', label: 'Elsa (Femminile)', gender: 'Female', style: 'Natural' },
    { value: 'it-IT-DiegoNeural', label: 'Diego (Maschile)', gender: 'Male', style: 'Natural' }
  ],
  'pt-BR': [
    { value: 'pt-BR-FranciscaNeural', label: 'Francisca (Feminino)', gender: 'Female', style: 'Natural' },
    { value: 'pt-BR-AntonioNeural', label: 'Antônio (Masculino)', gender: 'Male', style: 'Natural' }
  ],
  'ru-RU': [
    { value: 'ru-RU-SvetlanaNeural', label: 'Светлана (Женский)', gender: 'Female', style: 'Natural' },
    { value: 'ru-RU-DmitryNeural', label: 'Дмитрий (Мужской)', gender: 'Male', style: 'Natural' }
  ],
  'ar-SA': [
    { value: 'ar-SA-ZariyahNeural', label: 'زارية (أنثى)', gender: 'Female', style: 'Natural' },
    { value: 'ar-SA-HamedNeural', label: 'حامد (ذكر)', gender: 'Male', style: 'Natural' }
  ],
  'hi-IN': [
    { value: 'hi-IN-SwaraNeural', label: 'स्वरा (महिला)', gender: 'Female', style: 'Natural' },
    { value: 'hi-IN-MadhurNeural', label: 'मधुर (पुरुष)', gender: 'Male', style: 'Natural' }
  ],
  'tr-TR': [
    { value: 'tr-TR-EmelNeural', label: 'Emel (Kadın)', gender: 'Female', style: 'Natural' },
    { value: 'tr-TR-AhmetNeural', label: 'Ahmet (Erkek)', gender: 'Male', style: 'Natural' }
  ],
  'pl-PL': [
    { value: 'pl-PL-ZofiaNeural', label: 'Zofia (Kobieta)', gender: 'Female', style: 'Natural' },
    { value: 'pl-PL-MarekNeural', label: 'Marek (Mężczyzna)', gender: 'Male', style: 'Natural' }
  ],
  'nl-NL': [
    { value: 'nl-NL-FennaNeural', label: 'Fenna (Vrouw)', gender: 'Female', style: 'Natural' },
    { value: 'nl-NL-MaartenNeural', label: 'Maarten (Man)', gender: 'Male', style: 'Natural' }
  ]
}

/**
 * 번역 대상 언어 (2글자 ISO 코드)
 * Azure Speech Translation API에서 사용됨
 */
export const TRANSLATION_LANGUAGES = [
  { code: 'ko', label: '한국어 (Korean)' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語 (Japanese)' },
  { code: 'zh-Hans', label: '中文简体 (Chinese Simplified)' },
  { code: 'zh-Hant', label: '中文繁體 (Chinese Traditional)' },
  { code: 'vi', label: 'Tiếng Việt (Vietnamese)' },
  { code: 'th', label: 'ไทย (Thai)' },
  { code: 'id', label: 'Bahasa Indonesia (Indonesian)' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'it', label: 'Italiano (Italian)' },
  { code: 'pt', label: 'Português (Portuguese)' },
  { code: 'ru', label: 'Русский (Russian)' },
  { code: 'ar', label: 'العربية (Arabic)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'tr', label: 'Türkçe (Turkish)' },
  { code: 'pl', label: 'Polski (Polish)' },
  { code: 'nl', label: 'Nederlands (Dutch)' }
]

/**
 * 인식 언어(ko-KR)를 번역 언어(ko)로 매핑
 */
export const RECOGNITION_TO_TRANSLATION_MAP = {
  'ko-KR': 'ko',
  'en-US': 'en',
  'en-GB': 'en',
  'ja-JP': 'ja',
  'zh-CN': 'zh-Hans',
  'zh-TW': 'zh-Hant',
  'vi-VN': 'vi',
  'th-TH': 'th',
  'id-ID': 'id',
  'es-ES': 'es',
  'fr-FR': 'fr',
  'de-DE': 'de',
  'it-IT': 'it',
  'pt-BR': 'pt',
  'ru-RU': 'ru',
  'ar-SA': 'ar',
  'hi-IN': 'hi',
  'tr-TR': 'tr',
  'pl-PL': 'pl',
  'nl-NL': 'nl'
}

/**
 * 번역 언어(ko)를 TTS 언어(ko-KR)로 매핑
 */
export const TRANSLATION_TO_TTS_MAP = {
  'ko': 'ko-KR',
  'en': 'en-US',
  'ja': 'ja-JP',
  'zh-Hans': 'zh-CN',
  'zh-Hant': 'zh-TW',
  'vi': 'vi-VN',
  'th': 'th-TH',
  'id': 'id-ID',
  'es': 'es-ES',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'it': 'it-IT',
  'pt': 'pt-BR',
  'ru': 'ru-RU',
  'ar': 'ar-SA',
  'hi': 'hi-IN',
  'tr': 'tr-TR',
  'pl': 'pl-PL',
  'nl': 'nl-NL'
}

/**
 * 특정 언어의 음성 목록 가져오기
 * @param {string} languageCode - BCP-47 언어 코드 (예: 'ko-KR')
 * @returns {Array} - 음성 옵션 배열
 */
export function getVoicesForLanguage(languageCode) {
  return NEURAL_VOICES[languageCode] || []
}

/**
 * 언어의 기본 음성 가져오기
 * @param {string} languageCode - BCP-47 언어 코드
 * @returns {string} - 기본 음성 이름
 */
export function getDefaultVoice(languageCode) {
  const voices = getVoicesForLanguage(languageCode)
  return voices.length > 0 ? voices[0].value : ''
}

/**
 * 인식 언어를 번역 언어로 변환
 * @param {string} recognitionLang - BCP-47 형식 (ko-KR)
 * @returns {string} - 2글자 ISO 코드 (ko)
 */
export function recognitionToTranslation(recognitionLang) {
  return RECOGNITION_TO_TRANSLATION_MAP[recognitionLang] || 'en'
}

/**
 * 번역 언어를 TTS 언어로 변환
 * @param {string} translationLang - 2글자 ISO 코드 (ko)
 * @returns {string} - BCP-47 형식 (ko-KR)
 */
export function translationToTTS(translationLang) {
  return TRANSLATION_TO_TTS_MAP[translationLang] || 'en-US'
}
