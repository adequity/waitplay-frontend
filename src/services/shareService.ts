import apiClient from './api'

export interface ShareLogRequest {
  qrCodeId: string
  channel: 'kakao' | 'link' | 'instagram' | 'twitter'
  context?: 'landing' | 'game_result' | 'guestbook'
  gameType?: string
  gameScore?: number
}

export interface ShareStatsResponse {
  totalShares: number
  thisWeekShares: number
  thisMonthShares: number
  channelStats: ChannelStat[]
  dailyStats: DailyStat[]
  contextStats: ContextStat[]
}

export interface ChannelStat {
  channel: string
  count: number
  percentage: number
}

export interface DailyStat {
  date: string
  count: number
}

export interface ContextStat {
  context: string
  count: number
}

export interface ShareStatsSummary {
  totalShares: number
  thisWeekShares: number
  weeklyGrowth: number
  channelStats: ChannelStat[]
}

// 카카오 SDK 동적 로드 (필요할 때만)
let kakaoSdkLoaded = false
const loadKakaoSdk = (): Promise<void> => {
  if (kakaoSdkLoaded || window.Kakao) {
    return Promise.resolve()
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js'
    script.crossOrigin = 'anonymous'
    script.onload = () => {
      kakaoSdkLoaded = true
      resolve()
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const shareService = {
  // 카카오 SDK 초기화 확인 (동적 로드 포함)
  initKakaoSdk: async () => {
    console.log('[KakaoSDK] Starting initialization...')

    try {
      await loadKakaoSdk()
      console.log('[KakaoSDK] SDK loaded, window.Kakao:', !!window.Kakao)
    } catch (error) {
      console.error('[KakaoSDK] Failed to load SDK:', error)
      throw error
    }

    if (window.Kakao && !window.Kakao.isInitialized()) {
      const appKey = import.meta.env.VITE_KAKAO_APP_KEY
      console.log('[KakaoSDK] App key exists:', !!appKey, 'key length:', appKey?.length)

      if (appKey) {
        try {
          window.Kakao.init(appKey)
          console.log('[KakaoSDK] Initialized successfully:', window.Kakao.isInitialized())
        } catch (initError) {
          console.error('[KakaoSDK] Init failed:', initError)
          throw initError
        }
      } else {
        console.error('[KakaoSDK] VITE_KAKAO_APP_KEY is not set!')
      }
    } else if (window.Kakao) {
      console.log('[KakaoSDK] Already initialized')
    }
  },

  // 공유 로그 기록
  logShare: async (data: ShareLogRequest) => {
    const response = await apiClient.post('/api/share/log', data)
    return response.data as { success: boolean; shareUrl: string; shareId: string }
  },

  // QR코드별 공유 통계 조회
  getShareStats: async (qrCodeId: string) => {
    const response = await apiClient.get(`/api/share/stats/${qrCodeId}`)
    return response.data as ShareStatsResponse
  },

  // 전체 공유 통계 요약 (대시보드용)
  getShareStatsSummary: async () => {
    const response = await apiClient.get('/api/share/stats/summary')
    return response.data as ShareStatsSummary
  },

  // 카카오톡 공유
  shareToKakao: async (qrCodeId: string, title: string, description: string, _imageUrl?: string, context?: string, gameType?: string, gameScore?: number) => {
    // 카카오 SDK 동적 로드 및 초기화
    await shareService.initKakaoSdk()

    // 로그 기록
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'kakao',
      context: context as any,
      gameType,
      gameScore
    })

    // 동적 OG 이미지 URL 생성 (매장별 배경 이미지 + 로고)
    const ogImageUrl = `https://api.waitplay.co.kr/api/ogimage/landing/${qrCodeId}`

    // 카카오 SDK 공유
    console.log('[KakaoShare] Checking SDK state:', {
      hasKakao: !!window.Kakao,
      isInitialized: window.Kakao?.isInitialized?.(),
      hasShare: !!window.Kakao?.Share
    })

    if (window.Kakao && window.Kakao.isInitialized() && window.Kakao.Share) {
      try {
        console.log('[KakaoShare] Sending share with:', { title, description, ogImageUrl, shareUrl: result.shareUrl })
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: {
            title,
            description,
            imageUrl: ogImageUrl,
            link: {
              mobileWebUrl: result.shareUrl,
              webUrl: result.shareUrl
            }
          },
          buttons: [
            {
              title: '참여하기',
              link: {
                mobileWebUrl: result.shareUrl,
                webUrl: result.shareUrl
              }
            }
          ]
        })
        console.log('[KakaoShare] Share request sent')
      } catch (shareError) {
        console.error('[KakaoShare] Share failed:', shareError)
        await navigator.clipboard.writeText(result.shareUrl)
        alert('카카오톡 공유 중 오류가 발생했습니다. 링크가 복사되었습니다.')
      }
    } else {
      // SDK가 없거나 초기화되지 않으면 링크 복사로 폴백
      console.warn('[KakaoShare] SDK not available or not initialized, falling back to clipboard')
      await navigator.clipboard.writeText(result.shareUrl)
      alert('카카오톡 공유를 사용할 수 없어 링크가 복사되었습니다.')
    }

    return result
  },

  // 링크 복사
  copyLink: async (qrCodeId: string, context?: string, gameType?: string, gameScore?: number) => {
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'link',
      context: context as any,
      gameType,
      gameScore
    })

    await navigator.clipboard.writeText(result.shareUrl)
    return result
  },

  // 인스타그램/일반 공유 (Web Share API 활용)
  shareToInstagram: async (qrCodeId: string, context?: string, gameType?: string, gameScore?: number) => {
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'instagram',
      context: context as any,
      gameType,
      gameScore
    })

    // Web Share API 지원 여부 확인 (모바일에서 주로 지원)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WaitPlay',
          text: '재미있는 게임을 즐기고 혜택을 받아보세요!',
          url: result.shareUrl
        })
      } catch (err) {
        // 사용자가 공유 취소한 경우
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Web Share API 미지원 시 링크 복사
      await navigator.clipboard.writeText(result.shareUrl)
      alert('링크가 복사되었습니다. 인스타그램에 붙여넣기 하세요.')
    }

    return result
  },

  // X(Twitter) 공유
  shareToTwitter: async (qrCodeId: string, text: string, context?: string, gameType?: string, gameScore?: number) => {
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'twitter',
      context: context as any,
      gameType,
      gameScore
    })

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(result.shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=550,height=420')

    return result
  }
}

// 카카오 SDK 타입 선언
declare global {
  interface Window {
    Kakao: any
  }
}

export default shareService
