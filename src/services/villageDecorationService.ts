import apiClient from './api'

export interface DecorationItem {
  id: string
  decorationAssetId: string
  posX: number
  posY: number
  scale: number
  rotation: number
  zIndex: number
}

export interface DecorationAsset {
  id: string
  name: string
  emoji: string
  category: string
}

class VillageDecorationService {
  async getDecorations(profileCode: string): Promise<DecorationItem[]> {
    const response = await apiClient.get<DecorationItem[]>(`/api/village-decorations/${profileCode}`)
    return response.data
  }

  async placeDecoration(data: {
    decorationAssetId: string
    posX: number
    posY: number
    scale?: number
    rotation?: number
    zIndex?: number
  }): Promise<DecorationItem> {
    const response = await apiClient.post<DecorationItem>('/api/village-decorations', data)
    return response.data
  }

  async updateDecoration(id: string, data: {
    posX?: number
    posY?: number
    scale?: number
    rotation?: number
    zIndex?: number
  }): Promise<DecorationItem> {
    const response = await apiClient.put<DecorationItem>(`/api/village-decorations/${id}`, data)
    return response.data
  }

  async deleteDecoration(id: string): Promise<void> {
    await apiClient.delete(`/api/village-decorations/${id}`)
  }

  async getAssets(): Promise<DecorationAsset[]> {
    const response = await apiClient.get<DecorationAsset[]>('/api/village-decorations/assets')
    return response.data
  }
}

export default new VillageDecorationService()
