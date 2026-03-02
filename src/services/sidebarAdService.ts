import api from './api'

export interface SidebarAd {
  id: string
  qrCodeId: string | null
  qrCodeName: string | null
  pageSection: string // "all" | "customer" | "login" | "profile" | "game" | "guestbook" | "settings"
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
  pageSection?: string
  position: string
  imageUrl: string
  linkUrl?: string | null
  title?: string | null
  displayOrder?: number
}

export interface UpdateSidebarAdRequest {
  pageSection?: string
  position?: string
  imageUrl?: string
  linkUrl?: string | null
  title?: string | null
  displayOrder?: number
}

export interface StoreInfo {
  id: string
  code: string
  name: string
  adCount: number
}

// Page sections definition
export const PAGE_SECTIONS = [
  { value: 'all', label: '전체 페이지' },
  { value: 'customer', label: '고객 페이지' },
  { value: 'login', label: '로그인/회원가입' },
  { value: 'profile', label: '유저 프로필' },
  { value: 'game', label: '게임 페이지' },
  { value: 'guestbook', label: '방명록' },
  { value: 'settings', label: '설정' }
] as const

// Public API
export async function getSidebarAds(qrCode: string, section?: string): Promise<SidebarAd[]> {
  const params = section ? { section } : {}
  const res = await api.get(`/api/sidebar-ads/${qrCode}`, { params })
  return res.data
}

export async function getDefaultSidebarAds(section?: string): Promise<SidebarAd[]> {
  const params = section ? { section } : {}
  const res = await api.get('/api/sidebar-ads/default', { params })
  return res.data
}

// MasterAdmin API
export async function getMasterAdminSidebarAds(section?: string, qrCodeId?: string): Promise<SidebarAd[]> {
  const params: Record<string, string> = {}
  if (section) params.section = section
  if (qrCodeId) params.qrCodeId = qrCodeId
  const res = await api.get('/api/sidebar-ads/masteradmin', { params })
  return res.data
}

export async function getStoreSidebarAds(qrCodeId: string, section?: string): Promise<SidebarAd[]> {
  const params = section ? { section } : {}
  const res = await api.get(`/api/sidebar-ads/masteradmin/store/${qrCodeId}`, { params })
  return res.data
}

export async function createSidebarAd(data: CreateSidebarAdRequest): Promise<SidebarAd> {
  const res = await api.post('/api/sidebar-ads/masteradmin', data)
  return res.data
}

export async function updateSidebarAd(id: string, data: UpdateSidebarAdRequest): Promise<SidebarAd> {
  const res = await api.put(`/api/sidebar-ads/masteradmin/${id}`, data)
  return res.data
}

export async function deleteSidebarAd(id: string): Promise<void> {
  await api.delete(`/api/sidebar-ads/masteradmin/${id}`)
}

export async function toggleSidebarAd(id: string): Promise<SidebarAd> {
  const res = await api.patch(`/api/sidebar-ads/masteradmin/${id}/toggle`)
  return res.data
}

export async function reorderSidebarAds(adIds: string[]): Promise<void> {
  await api.patch('/api/sidebar-ads/masteradmin/reorder', { adIds })
}

export async function getStoresForAds(): Promise<StoreInfo[]> {
  const res = await api.get('/api/sidebar-ads/masteradmin/stores')
  return res.data
}
