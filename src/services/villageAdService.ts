import api from './api'

// ===== Interfaces =====

export interface VillageAd {
  id: string
  roomImageUrl: string
  roomName: string
  roomColor: string
  linkType: string
  linkUrl: string | null
  linkAdminId: string | null
  linkStoreCode: string | null
  linkStoreName: string | null
  startDate: string
  endDate: string
  totalImpressionTarget: number
  dailyImpressionTarget: number
  status: string
  weight: number
  totalImpressions: number
  totalClicks: number
  ctr: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateVillageAdRequest {
  roomImageUrl: string
  roomName: string
  roomColor?: string
  linkType: string
  linkUrl?: string
  linkAdminId?: string
  linkStoreCode?: string
  startDate: string
  endDate: string
  totalImpressionTarget?: number
  dailyImpressionTarget?: number
  weight?: number
}

export interface UpdateVillageAdRequest {
  roomImageUrl?: string
  roomName?: string
  roomColor?: string
  linkType?: string
  linkUrl?: string
  linkAdminId?: string
  linkStoreCode?: string
  startDate?: string
  endDate?: string
  totalImpressionTarget?: number
  dailyImpressionTarget?: number
  status?: string
  weight?: number
}

export interface VillageAdSlot {
  id: string
  slotQ: number
  slotR: number
  isActive: boolean
  createdAt: string
}

export interface VillageAdStats {
  totalAds: number
  activeAds: number
  totalImpressions: number
  totalClicks: number
  overallCtr: number
  ads: VillageAd[]
}

// ===== Public API =====

export async function trackAdEvent(adId: string, eventType: 'impression' | 'click'): Promise<void> {
  try {
    await api.post('/api/village-ads/track', { adId, eventType })
  } catch {
    // fire-and-forget — 트래킹 실패해도 UX 차단 없음
  }
}

// ===== MasterAdmin API =====

export async function getAllAds(): Promise<VillageAd[]> {
  const res = await api.get('/api/village-ads/masteradmin')
  return res.data
}

export async function createAd(data: CreateVillageAdRequest): Promise<{ id: string }> {
  const res = await api.post('/api/village-ads/masteradmin', data)
  return res.data
}

export async function updateAd(id: string, data: UpdateVillageAdRequest): Promise<void> {
  await api.put(`/api/village-ads/masteradmin/${id}`, data)
}

export async function deleteAd(id: string): Promise<void> {
  await api.delete(`/api/village-ads/masteradmin/${id}`)
}

export async function toggleAdStatus(id: string, status: 'active' | 'paused'): Promise<void> {
  await api.patch(`/api/village-ads/masteradmin/${id}/status`, { status })
}

// Slot management
export async function getAdSlots(): Promise<VillageAdSlot[]> {
  const res = await api.get('/api/village-ads/masteradmin/slots')
  return res.data
}

export async function createAdSlot(slotQ: number, slotR: number): Promise<{ id: string }> {
  const res = await api.post('/api/village-ads/masteradmin/slots', { slotQ, slotR })
  return res.data
}

export async function deleteAdSlot(id: string): Promise<void> {
  await api.delete(`/api/village-ads/masteradmin/slots/${id}`)
}

export async function toggleAdSlot(id: string): Promise<void> {
  await api.patch(`/api/village-ads/masteradmin/slots/${id}/toggle`)
}

// Stats
export async function getAdStats(): Promise<VillageAdStats> {
  const res = await api.get('/api/village-ads/masteradmin/stats')
  return res.data
}
