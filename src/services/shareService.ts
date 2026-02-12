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

const shareService = {
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
  shareToKakao: async (qrCodeId: string, title: string, description: string, imageUrl?: string, context?: string, gameType?: string, gameScore?: number) => {
    // 로그 기록
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'kakao',
      context: context as any,
      gameType,
      gameScore
    })

    // 카카오 SDK 공유
    if (window.Kakao && window.Kakao.Share) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl: imageUrl || 'https://waitplay.co.kr/og-image.png',
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

  // 인스타그램 스토리 공유 (모바일에서만 가능)
  shareToInstagram: async (qrCodeId: string, context?: string, gameType?: string, gameScore?: number) => {
    const result = await shareService.logShare({
      qrCodeId,
      channel: 'instagram',
      context: context as any,
      gameType,
      gameScore
    })

    // 인스타그램 앱으로 이동 (모바일)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    if (isMobile) {
      // 인스타그램 스토리 딥링크 (이미지가 필요)
      window.open(`instagram://story-camera`, '_blank')
    } else {
      // 데스크톱에서는 인스타그램 웹 열기
      window.open('https://www.instagram.com/', '_blank')
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
