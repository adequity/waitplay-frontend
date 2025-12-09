/**
 * Game Score API Service
 * 게임 점수 제출 및 리더보드 관련 API 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export interface ScoreSubmission {
  gameType: string
  playerName: string
  score: number
  qrCodeId?: string
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
      console.error('Failed to submit score:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error submitting score:', error)
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
      console.error('Failed to fetch leaderboard')
      return null
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
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
  } catch (error) {
    console.error('Error fetching best score:', error)
    return null
  }
}
