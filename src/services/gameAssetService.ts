/**
 * Game Asset API Service
 * 게임 에셋 조회 서비스 - Admin이 등록한 이미지를 게임에서 사용
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

export interface GameAsset {
  id: string
  name: string
  category: string
  gameType: string
  imageUrl: string
  usageCount: number
  createdAt: string
  displayOrder?: number
}

export type GameAssetType = '틀린그림찾기' | '기억력게임' | '같은그림찾기'

/**
 * QR코드 기준 게임 에셋 조회 (Admin이 선택한 에셋)
 * @param qrCode QR코드 문자열
 * @param gameType 게임 타입
 * @param limit 조회 개수 제한
 */
export async function getGameAssetsByQrCode(
  qrCode: string,
  gameType: GameAssetType,
  limit: number = 16
): Promise<GameAsset[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/game/assets/by-qrcode?qrCode=${encodeURIComponent(qrCode)}&gameType=${encodeURIComponent(gameType)}&limit=${limit}`
    )

    if (!response.ok) {
      console.error('Failed to fetch game assets by QR code:', await response.text())
      return []
    }

    const data = await response.json()
    return data.assets || []
  } catch (error) {
    console.error('Error fetching game assets by QR code:', error)
    return []
  }
}

/**
 * 게임 타입별 에셋 목록 조회 (공개 API - 인증 불필요, fallback용)
 * @param gameType 게임 타입 (같은그림찾기, 기억력게임, 틀린그림찾기)
 * @param limit 조회 개수 제한
 */
export async function getGameAssets(
  gameType: GameAssetType,
  limit: number = 16
): Promise<GameAsset[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/game/assets?gameType=${encodeURIComponent(gameType)}&limit=${limit}`
    )

    if (!response.ok) {
      console.error('Failed to fetch game assets:', await response.text())
      return []
    }

    const data = await response.json()
    return data.assets || data || []
  } catch (error) {
    console.error('Error fetching game assets:', error)
    return []
  }
}

/**
 * 같은 그림 찾기 게임용 에셋 조회
 * @param pairCount 필요한 쌍 개수 (예: 8이면 16장의 카드)
 * @param qrCode QR코드 (선택) - 있으면 Admin이 선택한 에셋 사용
 */
export async function getMatchGameAssets(pairCount: number = 8, qrCode?: string): Promise<GameAsset[]> {
  let assets: GameAsset[] = []

  // QR코드가 있으면 Admin이 선택한 에셋 조회
  if (qrCode) {
    assets = await getGameAssetsByQrCode(qrCode, '같은그림찾기', pairCount)
    console.log(`[getMatchGameAssets] QR코드 기반 에셋 ${assets.length}개 조회됨`)
  }

  // QR코드가 없거나 에셋이 부족하면 전체 에셋에서 조회 (fallback)
  if (assets.length < pairCount) {
    console.log(`[getMatchGameAssets] Fallback: 전체 에셋에서 조회`)
    assets = await getGameAssets('같은그림찾기', pairCount)
  }

  return assets.slice(0, pairCount)
}

/**
 * 에셋 이미지 URL 배열로 변환 (게임에서 사용하기 쉽게)
 */
export function extractImageUrls(assets: GameAsset[]): string[] {
  return assets
    .filter(asset => asset.imageUrl && asset.imageUrl.trim() !== '')
    .map(asset => asset.imageUrl)
}

/**
 * 에셋 사용 횟수 증가 (통계용)
 */
export async function incrementAssetUsage(assetIds: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/game/assets/usage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ assetIds })
    })

    return response.ok
  } catch (error) {
    console.error('Error incrementing asset usage:', error)
    return false
  }
}
