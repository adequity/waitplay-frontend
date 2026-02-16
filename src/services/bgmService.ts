import api from './api'

export interface BgmTrack {
  id: string
  title: string
  artist?: string
  fileUrl: string
  durationSeconds?: number
  fileSize?: number
  category?: string
  createdAt: string
  displayOrder: number
}

export interface BgmTrackAdmin extends BgmTrack {
  isActive: boolean
  uploadedBy: string
  uploaderName?: string
}

export interface CreateBgmTrackRequest {
  title: string
  artist?: string
  fileUrl: string
  durationSeconds?: number
  fileSize?: number
  category?: string
  displayOrder?: number
}

export interface UpdateBgmTrackRequest {
  title?: string
  artist?: string
  category?: string
  displayOrder?: number
  isActive?: boolean
}

const bgmService = {
  /**
   * Get all active BGM tracks (for Admin selection)
   */
  async getActiveTracks(category?: string): Promise<BgmTrack[]> {
    const params = category ? { category } : {}
    const response = await api.get('/api/bgm', { params })
    return response.data
  },

  /**
   * Get all BGM tracks with admin info (for MasterAdmin management)
   */
  async getAllTracksForAdmin(): Promise<BgmTrackAdmin[]> {
    const response = await api.get('/api/bgm/admin')
    return response.data
  },

  /**
   * Get available categories
   */
  async getCategories(): Promise<string[]> {
    const response = await api.get('/api/bgm/categories')
    return response.data
  },

  /**
   * Create a new BGM track (MasterAdmin only)
   */
  async createTrack(request: CreateBgmTrackRequest, uploaderId: string): Promise<BgmTrackAdmin> {
    const response = await api.post('/api/bgm', request, {
      params: { uploaderId }
    })
    return response.data
  },

  /**
   * Update a BGM track (MasterAdmin only)
   */
  async updateTrack(id: string, request: UpdateBgmTrackRequest, uploaderId: string): Promise<BgmTrackAdmin> {
    const response = await api.patch(`/api/bgm/${id}`, request, {
      params: { uploaderId }
    })
    return response.data
  },

  /**
   * Delete a BGM track (MasterAdmin only)
   */
  async deleteTrack(id: string, uploaderId: string): Promise<void> {
    await api.delete(`/api/bgm/${id}`, {
      params: { uploaderId }
    })
  }
}

export default bgmService
