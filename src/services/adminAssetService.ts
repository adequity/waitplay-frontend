/**
 * Admin Asset API Service
 * Admin이 SuperAdmin의 에셋을 조회하고 QR코드별로 선택/저장하는 서비스
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

export interface AdminAsset {
  id: string
  name: string
  category: string
  gameType: string
  imageUrl: string
  usageCount: number
  isSelected: boolean
  createdAt: string
}

export interface SelectedAsset {
  id: string
  qrCodeId: string
  assetId: string
  gameType: string
  displayOrder: number
  isActive: boolean
  assetName: string
  assetCategory: string
  assetImageUrl: string
  createdAt: string
}

/**
 * SuperAdmin의 에셋 목록 조회 (Admin용)
 */
export async function getSuperAdminAssets(
  token: string,
  gameType?: string,
  category?: string
): Promise<{ assets: AdminAsset[]; total: number }> {
  try {
    const params = new URLSearchParams()
    if (gameType) params.append('gameType', gameType)
    if (category) params.append('category', category)

    const response = await fetch(
      `${API_BASE_URL}/api/admin/assets?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch admin assets:', await response.text())
      return { assets: [], total: 0 }
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching admin assets:', error)
    return { assets: [], total: 0 }
  }
}

/**
 * 에셋 선택/저장
 */
export async function selectGameAssets(
  token: string,
  gameType: string,
  assetIds: string[]
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/assets/select`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gameType, assetIds })
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || '에셋 선택에 실패했습니다.' }
    }

    return { success: true, message: '에셋이 선택되었습니다.' }
  } catch (error) {
    console.error('Error selecting assets:', error)
    return { success: false, message: '에셋 선택 중 오류가 발생했습니다.' }
  }
}

/**
 * 선택된 에셋 목록 조회
 */
export async function getSelectedAssets(
  token: string,
  gameType?: string
): Promise<{ assets: SelectedAsset[]; total: number }> {
  try {
    const params = new URLSearchParams()
    if (gameType) params.append('gameType', gameType)

    const response = await fetch(
      `${API_BASE_URL}/api/admin/assets/selected?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch selected assets:', await response.text())
      return { assets: [], total: 0 }
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching selected assets:', error)
    return { assets: [], total: 0 }
  }
}

/**
 * 선택된 에셋 제거
 */
export async function removeSelectedAsset(
  token: string,
  assetId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/assets/selected/${assetId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json()
      return { success: false, message: errorData.message || '에셋 제거에 실패했습니다.' }
    }

    return { success: true, message: '에셋이 제거되었습니다.' }
  } catch (error) {
    console.error('Error removing asset:', error)
    return { success: false, message: '에셋 제거 중 오류가 발생했습니다.' }
  }
}

/**
 * 게임 타입을 한글 이름으로 매핑
 */
export function getGameTypeLabel(gameId: string): string {
  const mapping: Record<string, string> = {
    'memory': '같은그림찾기',
    'spot-difference': '틀린그림찾기',
    'pinball': '핀볼',
    'brick-breaker': '벽돌깨기'
  }
  return mapping[gameId] || gameId
}

/**
 * 한글 게임 타입을 게임 ID로 매핑
 */
export function getGameIdFromType(gameType: string): string {
  const mapping: Record<string, string> = {
    '같은그림찾기': 'memory',
    '틀린그림찾기': 'spot-difference',
    '기억력게임': 'memory',
    '핀볼': 'pinball',
    '벽돌깨기': 'brick-breaker'
  }
  return mapping[gameType] || gameType
}
