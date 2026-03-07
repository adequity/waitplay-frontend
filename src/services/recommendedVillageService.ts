import api from './api'

export interface RecommendedVillageUser {
  id: string
  userId: string
  userNickname: string
  userProfileImage: string | null
  userProfileCode: string | null
  userCompany: string | null
  userRole: string
  priority: number
  isActive: boolean
  note: string | null
  addedAt: string
  hasCompletedRoomAsset: boolean
  roomAssetUrl: string | null
}

export interface UserSearchResult {
  id: string
  nickname: string
  profileImage: string | null
  profileCode: string | null
  company: string | null
  userRole: string
  hasCompletedRoomAsset: boolean
  roomAssetUrl: string | null
}

export async function getRecommendedUsers(): Promise<RecommendedVillageUser[]> {
  const res = await api.get('/api/recommended-village/masteradmin')
  return res.data
}

export async function addRecommendedUser(userId: string, priority = 1, note?: string): Promise<{ id: string }> {
  const res = await api.post('/api/recommended-village/masteradmin', { userId, priority, note })
  return res.data
}

export async function updateRecommendedUser(id: string, data: { priority?: number; isActive?: boolean; note?: string }): Promise<void> {
  await api.put(`/api/recommended-village/masteradmin/${id}`, data)
}

export async function removeRecommendedUser(id: string): Promise<void> {
  await api.delete(`/api/recommended-village/masteradmin/${id}`)
}

export async function toggleRecommendedUser(id: string): Promise<void> {
  await api.patch(`/api/recommended-village/masteradmin/${id}/toggle`)
}

export async function searchUsersForPool(q: string): Promise<UserSearchResult[]> {
  const res = await api.get(`/api/recommended-village/masteradmin/search?q=${encodeURIComponent(q)}`)
  return res.data
}
