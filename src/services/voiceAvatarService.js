/**
 * 음성 TTS 서비스 (Azure Speech SDK Avatar 지원)
 *
 * Azure Speech SDK를 사용하여 AI 응답을 음성으로 변환합니다.
 * Azure AI Speech Avatar WebRTC 연결 지원
 */
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk'
import { pythonAPI } from './api'

const voiceAvatarService = {
  // 현재 오디오 엘리먼트 및 언어
  _currentAudioElement: null,
  _currentLanguage: 'en-US',
  _isPlaying: false,

  // Azure Speech SDK Avatar 관련
  _speechConfig: null,
  _avatarConfig: null,
  _avatarSynthesizer: null,
  _peerConnection: null,
  _avatarVideoElement: null,
  _avatarAudioElement: null, // Audio track 전용 element
  _isAvatarConnected: false,
  _isSpeaking: false,

  /**
   * 음성 TTS 초기화
   * @param {HTMLAudioElement} audioElement - 오디오를 재생할 audio 엘리먼트
   * @param {string} language - 언어 코드 (기본값: en-US)
   * @returns {Promise<void>}
   */
  async initialize(audioElement, language = 'en-US') {
    console.log('음성 TTS 초기화', { language })

    // 오디오 엘리먼트 저장
    this._currentAudioElement = audioElement
    this._currentLanguage = language

    console.log('✅ 음성 TTS 준비 완료')
  },

  /**
   * 텍스트를 음성으로 변환 및 재생
   * @param {string} text - 말할 텍스트
   * @returns {Promise<void>}
   */
  async speak(text) {
    if (!text || !text.trim()) {
      console.warn('TTS: 빈 텍스트')
      return
    }

    if (!this._currentAudioElement) {
      throw new Error('음성 TTS가 초기화되지 않았습니다.')
    }

    try {
      this._isPlaying = true
      console.log(`TTS 음성 생성: "${text.substring(0, 50)}..."`)

      // 백엔드에서 음성 생성
      const response = await pythonAPI.post('/avatar/synthesize', {
        text,
        language: this._currentLanguage || 'en-US'
      }, {
        responseType: 'blob'  // 오디오 파일을 blob으로 받음
      })

      // Blob URL 생성
      const audioBlob = response.data
      const audioUrl = URL.createObjectURL(audioBlob)

      console.log('음성 생성 완료, 재생 시작')

      // 오디오 재생
      this._currentAudioElement.src = audioUrl
      await this._currentAudioElement.play()

      // 재생 완료 대기
      return new Promise((resolve, reject) => {
        this._currentAudioElement.onended = () => {
          this._isPlaying = false
          URL.revokeObjectURL(audioUrl)  // 메모리 정리
          console.log('음성 재생 완료')
          resolve()
        }

        this._currentAudioElement.onerror = (error) => {
          this._isPlaying = false
          URL.revokeObjectURL(audioUrl)
          console.error('음성 재생 실패:', error)
          reject(new Error('음성 재생 실패'))
        }
      })
    } catch (error) {
      this._isPlaying = false
      console.error('TTS 실패:', error)
      throw error
    }
  },

  /**
   * 음성 중지 및 리소스 정리
   */
  async stop() {
    try {
      if (this._currentAudioElement) {
        this._currentAudioElement.pause()
        this._currentAudioElement.src = ''
      }

      this._isPlaying = false
      console.log('음성 TTS stopped and cleaned up')
    } catch (error) {
      console.error('TTS stop failed:', error)
    }
  },

  /**
   * 재생 중인지 확인
   * @returns {boolean}
   */
  isPlaying() {
    return this._isPlaying
  },

  /**
   * 언어에 맞는 음성 반환
   * @param {string} language - 언어 코드
   * @returns {string} 음성 이름
   */
  _getVoiceForLanguage(language) {
    // Azure Avatar 지원 음성 (Neural voices)
    const voiceMap = {
      'en-US': 'en-US-JennyNeural',
      'en-GB': 'en-GB-SoniaNeural',
      'ko-KR': 'ko-KR-SunHiNeural',
      'ja-JP': 'ja-JP-NanamiNeural',
      'zh-CN': 'zh-CN-XiaoxiaoNeural',
      'es-ES': 'es-ES-ElviraNeural',
      'fr-FR': 'fr-FR-DeniseNeural',
      'de-DE': 'de-DE-KatjaNeural'
    }
    return voiceMap[language] || 'en-US-JennyNeural'
  },

  // =========== Avatar WebRTC 관련 메서드 (Azure Speech SDK) ===========

  /**
   * Avatar WebRTC 연결 초기화 (Azure Speech SDK 사용)
   * @param {HTMLVideoElement} videoElement - 아바타를 표시할 video 엘리먼트
   * @param {Object} options - 옵션 (character, style, language)
   * @returns {Promise<void>}
   */
  async initializeAvatar(videoElement, options = {}) {
    console.log('🎭 Avatar 초기화 시작 (Azure Speech SDK)', options)

    this._avatarVideoElement = videoElement
    const character = options.character || 'lisa'
    const style = options.style || 'casual-sitting'
    const language = options.language || this._currentLanguage || 'en-US'

    try {
      // 1. 백엔드에서 토큰 및 ICE 서버 정보 가져오기
      const configResponse = await pythonAPI.get('/avatar/config')
      if (!configResponse.data.success) {
        throw new Error('Avatar config fetch failed')
      }

      const config = configResponse.data.data
      console.log('✅ Avatar 설정 로드 완료:', {
        region: config.region,
        character: config.avatar_character,
        hasToken: !!config.token
      })

      // 2. Azure Speech SDK 설정
      this._speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(
        config.token,
        config.region
      )

      // 음성 설정
      const voiceName = this._getVoiceForLanguage(language)
      this._speechConfig.speechSynthesisVoiceName = voiceName
      console.log('🎤 Voice 설정:', voiceName)

      // 3. Avatar 설정 (VideoFormat 포함 - 16:9 비율 필수!)
      const videoFormat = new SpeechSDK.AvatarVideoFormat()
      videoFormat.width = 1920
      videoFormat.height = 1080

      this._avatarConfig = new SpeechSDK.AvatarConfig(character, style, videoFormat)
      this._avatarConfig.customized = false
      this._avatarConfig.backgroundColor = '#000000FF' // 검정 배경

      console.log('🎭 Avatar 캐릭터 설정:', { character, style, videoFormat: '1920x1080' })

      // 4. WebRTC PeerConnection 설정
      await this._setupWebRTCWithSDK(config.ice_servers)

      // 5. AvatarSynthesizer 생성
      this._avatarSynthesizer = new SpeechSDK.AvatarSynthesizer(
        this._speechConfig,
        this._avatarConfig
      )

      // 6. Avatar 시작
      await this._startAvatarConnection()

      console.log('✅ Avatar 초기화 완료')
    } catch (error) {
      console.error('❌ Avatar 초기화 실패:', error)
      throw error
    }
  },

  /**
   * WebRTC PeerConnection 설정 (Azure Speech SDK용)
   * @private
   */
  async _setupWebRTCWithSDK(iceServers) {
    console.log('🔗 WebRTC PeerConnection 설정 중...', iceServers)

    // ICE 서버 설정 (Azure Avatar 공식 샘플 방식)
    const configuration = {
      iceServers: [
        {
          urls: iceServers.urls,
          username: iceServers.username,
          credential: iceServers.credential
        }
      ]
    }

    // PeerConnection 생성
    this._peerConnection = new RTCPeerConnection(configuration)

    // 양방향 트랜시버 추가 (Azure Avatar SDK 요구사항 - sendrecv 필수!)
    this._peerConnection.addTransceiver('video', { direction: 'sendrecv' })
    this._peerConnection.addTransceiver('audio', { direction: 'sendrecv' })

    // Audio element 생성 (숨김) - audio track 전용
    if (!this._avatarAudioElement) {
      this._avatarAudioElement = document.createElement('audio')
      this._avatarAudioElement.autoplay = true
      this._avatarAudioElement.id = 'avatar-audio-player'
      document.body.appendChild(this._avatarAudioElement)
      console.log('🔊 Audio element 생성됨')
    }

    // 이벤트 핸들러 설정
    this._peerConnection.ontrack = (event) => {
      console.log('🎬 Remote track received:', event.track.kind, {
        trackId: event.track.id,
        streamId: event.streams?.[0]?.id
      })

      if (event.track.kind === 'video') {
        // Video track → video element
        if (this._avatarVideoElement && event.streams && event.streams[0]) {
          this._avatarVideoElement.srcObject = event.streams[0]
          console.log('🎬 Video stream attached to video element', {
            streamId: event.streams[0].id,
            videoTracks: event.streams[0].getVideoTracks().length
          })
        }
      } else if (event.track.kind === 'audio') {
        // Audio track → audio element
        if (this._avatarAudioElement && event.streams && event.streams[0]) {
          this._avatarAudioElement.srcObject = event.streams[0]
          console.log('🔊 Audio stream attached to audio element', {
            streamId: event.streams[0].id,
            audioTracks: event.streams[0].getAudioTracks().length
          })

          // 오디오 재생 시도
          this._avatarAudioElement.play().catch(err => {
            console.warn('🔊 Audio autoplay blocked:', err)
          })
        }
      }
    }

    this._peerConnection.oniceconnectionstatechange = () => {
      const state = this._peerConnection?.iceConnectionState
      console.log('🔗 ICE connection state:', state)
      this._isAvatarConnected = state === 'connected' || state === 'completed'
    }

    this._peerConnection.onconnectionstatechange = () => {
      console.log('📡 Connection state:', this._peerConnection?.connectionState)
    }

    this._peerConnection.onicegatheringstatechange = () => {
      console.log('🧊 ICE gathering state:', this._peerConnection?.iceGatheringState)
    }

    this._peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 ICE candidate:', event.candidate.type)
      } else {
        console.log('🧊 ICE gathering complete')
      }
    }

    console.log('✅ WebRTC PeerConnection 설정 완료')
  },

  /**
   * Avatar WebRTC 연결 시작 (SDP 교환)
   * @private
   */
  async _startAvatarConnection() {
    console.log('🚀 Avatar 연결 시작...')

    return new Promise((resolve, reject) => {
      this._avatarSynthesizer.startAvatarAsync(this._peerConnection).then(
        (result) => {
          console.log('📋 Avatar startAvatarAsync result:', {
            reason: result.reason,
            reasonName: SpeechSDK.ResultReason[result.reason],
            resultId: result.resultId
          })

          if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
            console.log('✅ Avatar 연결 성공')
            this._isAvatarConnected = true

            // 비디오 재생 시작
            if (this._avatarVideoElement) {
              this._avatarVideoElement.play().catch(err => {
                console.warn('Video autoplay blocked:', err)
              })
            }

            // 연결 후 짧은 인사말로 아바타 활성화 (idle 상태 탈출)
            setTimeout(async () => {
              if (this._avatarSynthesizer && this._isAvatarConnected) {
                console.log('🎭 Avatar 활성화 인사말 발화...')

                try {
                  // Promise 방식 사용 (공식 샘플 방식)
                  const res = await this._avatarSynthesizer.speakTextAsync('Hello! I am ready.')
                  console.log('🎭 인사말 발화 결과:', {
                    reason: res.reason,
                    reasonName: SpeechSDK.ResultReason[res.reason]
                  })
                  if (res.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                    console.log('✅ Avatar 활성화 완료 - 아바타가 보여야 합니다!')
                  } else if (res.reason === SpeechSDK.ResultReason.Canceled) {
                    const details = SpeechSDK.CancellationDetails.fromResult(res)
                    console.error('❌ 인사말 취소:', details.reason, details.errorDetails)
                  }
                } catch (err) {
                  console.error('❌ Avatar 인사말 실패:', err)
                }
              }
            }, 1000)

            resolve(result)
          } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
            // 취소된 경우 상세 정보 확인
            const cancellation = SpeechSDK.CancellationDetails.fromResult(result)
            console.error('❌ Avatar 연결 취소됨:', {
              reason: cancellation.reason,
              reasonName: SpeechSDK.CancellationReason[cancellation.reason],
              errorCode: cancellation.ErrorCode,
              errorDetails: cancellation.errorDetails
            })
            reject(new Error(`Avatar 연결 취소: ${cancellation.errorDetails || cancellation.reason}`))
          } else {
            const error = new Error(`Avatar 연결 실패: ${result.reason} (${SpeechSDK.ResultReason[result.reason]})`)
            console.error('❌', error.message)
            reject(error)
          }
        },
        (error) => {
          console.error('❌ Avatar 연결 에러:', error)
          reject(error)
        }
      )
    })
  },

  /**
   * Avatar 세션 시작 (WebRTC 연결)
   * @param {string} character - 아바타 캐릭터 (lisa, harry 등)
   * @param {string} style - 아바타 스타일 (casual-sitting 등)
   * @returns {Promise<Object>} 세션 정보
   */
  async startAvatarSession(character = 'lisa', style = 'casual-sitting') {
    console.log('🚀 Avatar 세션 시작:', { character, style })

    // Avatar가 이미 초기화되어 있지 않으면 초기화
    if (!this._avatarSynthesizer && this._avatarVideoElement) {
      await this.initializeAvatar(this._avatarVideoElement, { character, style })
    }

    return {
      session_id: `avatar_${Date.now()}`,
      character,
      style,
      connected: this._isAvatarConnected
    }
  },

  /**
   * Avatar에 텍스트 전송 (말하기) - Azure Speech SDK 사용
   * @param {string} text - 말할 텍스트
   * @param {string} language - 언어 코드
   * @returns {Promise<void>}
   */
  async speakWithAvatar(text, language = 'en-US') {
    if (!text || !text.trim()) {
      console.warn('Avatar TTS: 빈 텍스트')
      return
    }

    if (!this._avatarSynthesizer) {
      console.error('Avatar가 초기화되지 않았습니다')
      throw new Error('Avatar not initialized')
    }

    if (this._isSpeaking) {
      console.warn('Avatar가 이미 말하고 있습니다')
      return
    }

    this._isSpeaking = true
    console.log(`🗣️ Avatar speaking: "${text.substring(0, 50)}..."`)

    try {
      // 음성 설정 업데이트 (언어가 변경된 경우)
      const voiceName = this._getVoiceForLanguage(language)
      if (this._speechConfig.speechSynthesisVoiceName !== voiceName) {
        this._speechConfig.speechSynthesisVoiceName = voiceName
        console.log('🎤 Voice 변경:', voiceName)
      }

      // Promise 방식 사용 (공식 샘플 방식)
      const result = await this._avatarSynthesizer.speakTextAsync(text)
      this._isSpeaking = false

      if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
        console.log('✅ Avatar 발화 완료')
        return result
      } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
        const cancellation = SpeechSDK.CancellationDetails.fromResult(result)
        console.error('❌ Avatar 발화 취소:', cancellation.reason, cancellation.errorDetails)
        throw new Error(`Avatar speak canceled: ${cancellation.errorDetails}`)
      } else {
        console.warn('⚠️ Avatar 발화 결과:', result.reason)
        return result
      }
    } catch (error) {
      this._isSpeaking = false
      console.error('❌ Avatar speak 실패:', error)
      throw error
    }
  },

  /**
   * Avatar 발화 중지
   */
  async stopAvatarSpeaking() {
    if (!this._avatarSynthesizer || !this._isSpeaking) {
      return
    }

    console.log('🛑 Avatar 발화 중지')
    try {
      await this._avatarSynthesizer.stopSpeakingAsync()
      this._isSpeaking = false
      console.log('✅ Avatar 발화 중지 완료')
    } catch (error) {
      console.error('❌ Avatar 발화 중지 실패:', error)
    }
  },

  /**
   * Avatar 연결 해제
   */
  async disconnectAvatar() {
    console.log('🔌 Avatar 연결 해제')

    // 발화 중지
    if (this._isSpeaking) {
      await this.stopAvatarSpeaking()
    }

    // AvatarSynthesizer 종료
    if (this._avatarSynthesizer) {
      try {
        await this._avatarSynthesizer.stopAvatarAsync()
        this._avatarSynthesizer.close()
      } catch (error) {
        console.warn('AvatarSynthesizer close warning:', error)
      }
      this._avatarSynthesizer = null
    }

    // PeerConnection 종료
    if (this._peerConnection) {
      this._peerConnection.close()
      this._peerConnection = null
    }

    // Video element 정리
    if (this._avatarVideoElement) {
      this._avatarVideoElement.srcObject = null
    }

    // Audio element 정리
    if (this._avatarAudioElement) {
      this._avatarAudioElement.pause()
      this._avatarAudioElement.srcObject = null
      this._avatarAudioElement.remove()
      this._avatarAudioElement = null
    }

    // 상태 초기화
    this._isAvatarConnected = false
    this._speechConfig = null
    this._avatarConfig = null
    this._isSpeaking = false

    console.log('✅ Avatar 연결 해제 완료')
  },

  /**
   * Avatar 연결 상태 확인
   * @returns {boolean}
   */
  isAvatarConnected() {
    return this._isAvatarConnected
  },

  /**
   * Avatar 발화 중인지 확인
   * @returns {boolean}
   */
  isAvatarSpeaking() {
    return this._isSpeaking
  }
}

export default voiceAvatarService
