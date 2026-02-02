/**
 * Spot Difference Game Asset Service
 * 틀린그림찾기 게임 에셋 API 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

/**
 * 차이점 좌표 정보
 */
export interface DifferencePoint {
  x: number  // 0~1 비율값
  y: number  // 0~1 비율값
  radius: number  // 0~1 비율값
}

/**
 * 틀린그림찾기 게임 데이터
 */
export interface SpotDifferenceGame {
  id: string
  name: string
  originalImageUrl: string
  modifiedImageUrl: string
  differences: DifferencePoint[]
  differenceCount: number
  difficulty: number  // 1: 쉬움, 2: 보통, 3: 어려움
  timeLimit: number  // 초 (0이면 무제한)
  hintsAllowed: number
  storeName?: string
  logoUrl?: string
}

/**
 * Admin용 에셋 응답
 */
export interface SpotDifferenceAsset {
  id: string
  name: string
  originalImageUrl: string
  modifiedImageUrl: string
  differences: DifferencePoint[]
  difficulty: number
  timeLimit: number
  hintsAllowed: number
  isActive: boolean
  usageCount: number
  qrCodeId?: string
  createdAt: string
}

/**
 * 에셋 생성 요청
 */
export interface CreateSpotDifferenceRequest {
  name: string
  originalImageUrl: string
  modifiedImageUrl: string
  differences: DifferencePoint[]
  difficulty?: number
  timeLimit?: number
  hintsAllowed?: number
  qrCodeId?: string
}

/**
 * 에셋 수정 요청
 */
export interface UpdateSpotDifferenceRequest {
  name?: string
  originalImageUrl?: string
  modifiedImageUrl?: string
  differences?: DifferencePoint[]
  difficulty?: number
  timeLimit?: number
  hintsAllowed?: number
  isActive?: boolean
}

/**
 * QR코드 기준 틀린그림찾기 게임 데이터 조회 (공개 API)
 * @param qrCode QR코드 문자열
 * @returns 게임 데이터 (이미지, 차이점 좌표 등)
 */
export async function getSpotDifferenceByQrCode(qrCode: string): Promise<SpotDifferenceGame | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/spot-difference/game/by-qrcode?qrCode=${encodeURIComponent(qrCode)}`
    )

    if (!response.ok) {
      console.error('[SpotDifference] Failed to fetch game data:', await response.text())
      return null
    }

    const data = await response.json()
    return data as SpotDifferenceGame
  } catch (error) {
    console.error('[SpotDifference] Error fetching game data:', error)
    return null
  }
}

/**
 * 특정 에셋 ID로 게임 데이터 조회 (공개 API)
 * @param assetId 에셋 ID
 * @returns 게임 데이터
 */
export async function getSpotDifferenceById(assetId: string): Promise<SpotDifferenceGame | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/spot-difference/game/${assetId}`
    )

    if (!response.ok) {
      console.error('[SpotDifference] Failed to fetch game data:', await response.text())
      return null
    }

    const data = await response.json()
    return data as SpotDifferenceGame
  } catch (error) {
    console.error('[SpotDifference] Error fetching game data:', error)
    return null
  }
}

/**
 * 내 틀린그림찾기 에셋 목록 조회 (Admin용)
 * @param token JWT 토큰
 * @returns 에셋 목록
 */
export async function getMySpotDifferenceAssets(token: string): Promise<SpotDifferenceAsset[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spot-difference/admin/assets`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      console.error('[SpotDifference] Failed to fetch admin assets:', await response.text())
      return []
    }

    const data = await response.json()
    return data.assets || []
  } catch (error) {
    console.error('[SpotDifference] Error fetching admin assets:', error)
    return []
  }
}

/**
 * 틀린그림찾기 에셋 생성 (Admin용)
 * @param token JWT 토큰
 * @param request 생성 요청 데이터
 * @returns 생성된 에셋 또는 null
 */
export async function createSpotDifferenceAsset(
  token: string,
  request: CreateSpotDifferenceRequest
): Promise<SpotDifferenceAsset | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spot-difference/admin/assets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      console.error('[SpotDifference] Failed to create asset:', await response.text())
      return null
    }

    const data = await response.json()
    return data.asset as SpotDifferenceAsset
  } catch (error) {
    console.error('[SpotDifference] Error creating asset:', error)
    return null
  }
}

/**
 * 틀린그림찾기 에셋 수정 (Admin용)
 * @param token JWT 토큰
 * @param assetId 에셋 ID
 * @param request 수정 요청 데이터
 * @returns 성공 여부
 */
export async function updateSpotDifferenceAsset(
  token: string,
  assetId: string,
  request: UpdateSpotDifferenceRequest
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spot-difference/admin/assets/${assetId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    })

    return response.ok
  } catch (error) {
    console.error('[SpotDifference] Error updating asset:', error)
    return false
  }
}

/**
 * 틀린그림찾기 에셋 삭제 (Admin용)
 * @param token JWT 토큰
 * @param assetId 에셋 ID
 * @returns 성공 여부
 */
export async function deleteSpotDifferenceAsset(token: string, assetId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spot-difference/admin/assets/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    return response.ok
  } catch (error) {
    console.error('[SpotDifference] Error deleting asset:', error)
    return false
  }
}
