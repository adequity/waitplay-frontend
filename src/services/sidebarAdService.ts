import api from './api'

export interface SidebarAd {
  id: string
  qrCodeId: string | null
  position: string // "left" | "right" | "both"
  imageUrl: string
  linkUrl: string | null
  title: string | null
  isActive: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string | null
}

export interface CreateSidebarAdRequest {
  qrCodeId?: string | null
  position: string
  imageUrl: string
  linkUrl?: string | null
  title?: string | null
  displayOrder?: number
}

export interface UpdateSidebarAdRequest {
  position?: string
  imageUrl?: string
  linkUrl?: string | null
  title?: string | null
  displayOrder?: number
}

// Public API
export async function getSidebarAds(qrCode: string): Promise<SidebarAd[]> {
  const res = await api.get(`/api/sidebar-ads/${qrCode}`)
  return res.data
}

export async function getDefaultSidebarAds(): Promise<SidebarAd[]> {
  const res = await api.get('/api/sidebar-ads/default')
  return res.data
}

// MasterAdmin API
export async function getMasterAdminSidebarAds(): Promise<SidebarAd[]> {
  const res = await api.get('/api/sidebar-ads/masteradmin')
  return res.data
}

export async function createDefaultSidebarAd(data: CreateSidebarAdRequest): Promise<SidebarAd> {
  const res = await api.post('/api/sidebar-ads/masteradmin/default', data)
  return res.data
}

export async function updateMasterAdminSidebarAd(id: string, data: UpdateSidebarAdRequest): Promise<SidebarAd> {
  const res = await api.put(`/api/sidebar-ads/masteradmin/${id}`, data)
  return res.data
}

export async function deleteMasterAdminSidebarAd(id: string): Promise<void> {
  await api.delete(`/api/sidebar-ads/masteradmin/${id}`)
}

export async function toggleMasterAdminSidebarAd(id: string): Promise<SidebarAd> {
  const res = await api.patch(`/api/sidebar-ads/masteradmin/${id}/toggle`)
  return res.data
}
