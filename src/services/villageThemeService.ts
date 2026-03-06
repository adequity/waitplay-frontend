import api from './api'

export interface VillageThemeDTO {
  id: string
  themeKey: string
  displayName: string
  themeType: 'color' | 'image'
  colorValue: string | null
  imageUrl: string | null
  bgColor: string | null
  sortOrder: number
  isActive: boolean
  createdAt: string
}

// === Public ===

export async function getActiveVillageThemes(): Promise<VillageThemeDTO[]> {
  const res = await api.get('/api/village-themes')
  return res.data
}

// === Admin ===

export async function getAllVillageThemes(): Promise<VillageThemeDTO[]> {
  const res = await api.get('/api/village-themes/admin/all')
  return res.data
}

export async function createVillageTheme(
  data: { themeKey: string; displayName: string; themeType: string; colorValue?: string; bgColor?: string },
  file?: File,
): Promise<VillageThemeDTO> {
  const formData = new FormData()
  formData.append('themeKey', data.themeKey)
  formData.append('displayName', data.displayName)
  formData.append('themeType', data.themeType)
  if (data.colorValue) formData.append('colorValue', data.colorValue)
  if (data.bgColor) formData.append('bgColor', data.bgColor)
  if (file) formData.append('file', file)
  const res = await api.post('/api/village-themes/admin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function updateVillageTheme(
  id: string,
  data: { displayName?: string; colorValue?: string; bgColor?: string },
  file?: File,
): Promise<VillageThemeDTO> {
  const formData = new FormData()
  if (data.displayName) formData.append('displayName', data.displayName)
  if (data.colorValue) formData.append('colorValue', data.colorValue)
  if (data.bgColor) formData.append('bgColor', data.bgColor)
  if (file) formData.append('file', file)
  const res = await api.put(`/api/village-themes/admin/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function toggleVillageTheme(id: string): Promise<VillageThemeDTO> {
  const res = await api.put(`/api/village-themes/admin/${id}/toggle`)
  return res.data
}

export async function deleteVillageTheme(id: string): Promise<void> {
  await api.delete(`/api/village-themes/admin/${id}`)
}

export async function reorderVillageThemes(items: { id: string; sortOrder: number }[]): Promise<void> {
  await api.put('/api/village-themes/admin/reorder', { items })
}
