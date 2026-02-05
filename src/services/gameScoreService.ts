/**
 * Game Score API Service
 * 게임 점수 제출 및 리더보드 관련 API 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface ScoreSubmission {
  gameType: string
  playerName: string
  score: number
  qrCode?: string  // QR Code 문자열 (예: "5YWF8V2X")
}

export interface LeaderboardEntry {
  playerName: string
  score: number
  playedAt: string
}

export interface LeaderboardResponse {
  gameType: string
  leaderboard: LeaderboardEntry[]
  totalPlayers: number
}

/**
 * 게임 점수 제출
 */
export async function submitGameScore(data: ScoreSubmission): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      // 점수 제출 실패는 사용자 경험에 영향을 주지 않도록 조용히 처리
      return false
    }

    return true
  } catch {
    // 네트워크 에러 시 조용히 false 반환
    return false
  }
}

/**
 * 리더보드 조회
 */
export async function getLeaderboard(
  gameType: string,
  limit: number = 10,
  qrCodeId?: string
): Promise<LeaderboardResponse | null> {
  try {
    let url = `${API_BASE_URL}/api/game/score/leaderboard/${gameType}?limit=${limit}`
    if (qrCodeId) {
      url += `&qrCodeId=${qrCodeId}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      // API 미구현(404) 또는 에러 시 조용히 null 반환
      return null
    }

    return await response.json()
  } catch {
    // 네트워크 에러 시 조용히 null 반환
    return null
  }
}

/**
 * 플레이어의 최고 점수 조회
 */
export async function getPlayerBestScore(
  gameType: string,
  playerName: string
): Promise<number | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/game/score/best/${gameType}/${encodeURIComponent(playerName)}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.score || null
  } catch {
    // 네트워크 에러 시 조용히 null 반환
    return null
  }
}
