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

export interface VillageSettings {
  gapFactor: number
  gapFactorX: number
}

export interface StoreWithTemplateStatus {
  id: string
  code: string
  name: string
  hasTemplate: boolean
}

// ===== Village Slot System =====

export interface VillageSlot {
  slotQ: number
  slotR: number
  isEmpty: boolean
  adminId?: string
  storeName?: string
  storeCode?: string
  roomImageUrl?: string
  roomName?: string
  roomColor?: string
  // 친구 슬롯 필드
  isFriend?: boolean
  friendUserId?: string
  friendNickname?: string
  friendProfileImage?: string
  friendProfileCode?: string
  friendRoomAssetUrl?: string
  // 랜덤 추천 슬롯 필드
  isRandom?: boolean
  randomType?: string
  // 광고 슬롯 필드
  isAd?: boolean
  adId?: string
  adLinkType?: string
  adLinkUrl?: string
  adStoreCode?: string
}

export interface VillageResponse {
  userId: string
  nickname: string
  isOwner: boolean
  totalRings: number
  filledSlots: number
  totalSlots: number
  slots: VillageSlot[]
  gapFactor: number
  gapFactorX: number
  selectedRoomAssetUrl?: string
  villageTheme?: string
}

export interface UnplacedStore {
  adminId: string
  storeName: string
  storeProfileImage: string | null
  storeCode: string | null
}

export interface UnplacedFriend {
  userId: string
  nickname: string
  profileImage: string | null
  profileCode: string | null
  roomAssetUrl: string | null
}

// Public API
export async function getUserVillage(profileCode: string): Promise<VillageResponse> {
  const res = await api.get(`/api/store-rooms/user/${profileCode}`)
  return res.data
}

export async function getMyVillage(): Promise<VillageResponse> {
  const res = await api.get('/api/store-rooms/my')
  return res.data
}

// Village Slot Management API
export async function placeSlot(slotQ: number, slotR: number, adminId?: string, friendUserId?: string): Promise<void> {
  await api.put('/api/store-rooms/village/place', { adminId, friendUserId, slotQ, slotR })
}

export async function swapSlots(fromQ: number, fromR: number, toQ: number, toR: number): Promise<void> {
  await api.put('/api/store-rooms/village/swap', { fromQ, fromR, toQ, toR })
}

export async function removeSlot(slotQ: number, slotR: number): Promise<void> {
  await api.delete(`/api/store-rooms/village/remove?slotQ=${slotQ}&slotR=${slotR}`)
}

export async function getUnplacedStores(): Promise<UnplacedStore[]> {
  const res = await api.get('/api/store-rooms/village/unplaced')
  return res.data
}

export async function getUnplacedFriends(): Promise<UnplacedFriend[]> {
  const res = await api.get('/api/store-rooms/village/unplaced-friends')
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

export async function getVillageSettings(): Promise<VillageSettings> {
  const res = await api.get('/api/store-rooms/settings')
  return res.data
}

export async function updateVillageSettings(data: { gapFactor: number; gapFactorX: number }): Promise<VillageSettings> {
  const res = await api.put('/api/store-rooms/settings', data)
  return res.data
}
