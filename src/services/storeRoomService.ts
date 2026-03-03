import api from './api'

export interface StoreRoomTemplate {
  id: string
  qrCodeId: string
  qrCodeName: string | null
  qrCodeCode: string | null
  roomImageUrl: string
  roomName: string
  roomDescription: string | null
  roomColor: string
  isActive: boolean
  createdAt: string
  updatedAt: string | null
  collectedCount: number
}

export interface CreateStoreRoomTemplateRequest {
  qrCodeId: string
  roomImageUrl: string
  roomName: string
  roomDescription?: string | null
  roomColor?: string
}

export interface UpdateStoreRoomTemplateRequest {
  roomImageUrl?: string
  roomName?: string
  roomDescription?: string | null
  roomColor?: string
  isActive?: boolean
}

export interface UserStoreRoom {
  id: string
  qrCodeId: string
  storeName: string
  storeCode: string | null
  roomImageUrl: string
  roomName: string
  roomColor: string
  gridQ: number
  gridR: number
  earnedAt: string
}

export interface UserVillage {
  userId: string
  nickname: string
  totalRooms: number
  rooms: UserStoreRoom[]
}

export interface StoreWithTemplateStatus {
  id: string
  code: string
  name: string
  hasTemplate: boolean
}

// Public API
export async function getUserVillage(profileCode: string): Promise<UserVillage> {
  const res = await api.get(`/api/store-rooms/user/${profileCode}`)
  return res.data
}

export async function getMyVillage(): Promise<UserVillage> {
  const res = await api.get('/api/store-rooms/my')
  return res.data
}

// MasterAdmin API
export async function getAllTemplates(): Promise<StoreRoomTemplate[]> {
  const res = await api.get('/api/store-rooms/templates')
  return res.data
}

export async function createTemplate(data: CreateStoreRoomTemplateRequest): Promise<StoreRoomTemplate> {
  const res = await api.post('/api/store-rooms/templates', data)
  return res.data
}

export async function updateTemplate(id: string, data: UpdateStoreRoomTemplateRequest): Promise<StoreRoomTemplate> {
  const res = await api.put(`/api/store-rooms/templates/${id}`, data)
  return res.data
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/api/store-rooms/templates/${id}`)
}

export async function getStoresWithTemplateStatus(): Promise<StoreWithTemplateStatus[]> {
  const res = await api.get('/api/store-rooms/templates/stores')
  return res.data
}
