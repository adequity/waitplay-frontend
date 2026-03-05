import api from './api'

export interface FurnitureItem {
  itemId: string
  type: string
  gridX: number
  gridY: number
  rotation: number
  scale: number
  color?: string
}

export interface CharacterStyle {
  color: string
  shape: string
  accessory?: string
}

export interface RoomConfiguration {
  userId: string
  wallTheme: string
  floorTheme: string
  furniture: FurnitureItem[]
  character: CharacterStyle
}

export async function getRoomConfiguration(profileCode: string): Promise<RoomConfiguration> {
  const response = await api.get(`/api/room/${profileCode}`)
  return response.data
}

export async function updateRoomConfiguration(
  data: Partial<Omit<RoomConfiguration, 'userId'>>
): Promise<RoomConfiguration> {
  const response = await api.put('/api/room', data)
  return response.data
}

// ===== Room Assets =====

export interface RoomAsset {
  id: string
  sourcePhotoUrl?: string
  assetImageUrl?: string
  assetName: string
  status: 'pending' | 'completed'
  isSelected: boolean
  createdAt: string
  completedAt?: string
}

export interface RoomAssetAdmin extends RoomAsset {
  userId: string
  userNickname: string
  userProfileImage?: string
}

export async function submitRoomPhoto(file: File): Promise<RoomAsset> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/api/room/assets/submit-photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function getMyRoomAssets(): Promise<RoomAsset[]> {
  const response = await api.get('/api/room/assets/my')
  return response.data
}

export async function selectRoomAsset(assetId: string): Promise<void> {
  await api.put(`/api/room/assets/select/${assetId}`)
}

export async function deselectRoomAsset(): Promise<void> {
  await api.delete('/api/room/assets/deselect')
}

// ===== Room Assets (Master Admin) =====

export async function getPendingRoomAssets(): Promise<RoomAssetAdmin[]> {
  const response = await api.get('/api/room/assets/admin/pending')
  return response.data
}

export async function getAllRoomAssets(): Promise<RoomAssetAdmin[]> {
  const response = await api.get('/api/room/assets/admin/all')
  return response.data
}

export async function completeRoomAsset(assetId: string, file: File, assetName: string): Promise<void> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('assetName', assetName)
  await api.put(`/api/room/assets/admin/complete/${assetId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export async function deleteRoomAsset(assetId: string): Promise<void> {
  await api.delete(`/api/room/assets/admin/${assetId}`)
}

export default { getRoomConfiguration, updateRoomConfiguration }
