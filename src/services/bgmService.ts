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

export interface AdminInfo {
  id: string
  name: string
  qrCode?: string
}

export interface BgmTrackStats extends BgmTrackAdmin {
  totalPlayCount: number
  uniqueAdminCount: number
  usingAdmins: AdminInfo[]
}

export interface BgmPlaylistResponse {
  tracks: BgmTrack[]
  playMode: 'sequential' | 'shuffle'
}

export interface SaveBgmPlaylistRequest {
  trackIds: string[]
  playMode: 'sequential' | 'shuffle'
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
  },

  // ==================== PLAYLIST APIs ====================

  /**
   * Get admin's BGM playlist for a QR code
   */
  async getPlaylist(qrCodeId: string): Promise<BgmPlaylistResponse> {
    const response = await api.get(`/api/bgm/playlist/${qrCodeId}`)
    return response.data
  },

  /**
   * Save admin's BGM playlist for a QR code
   */
  async savePlaylist(qrCodeId: string, trackIds: string[], playMode: 'sequential' | 'shuffle' = 'sequential'): Promise<void> {
    await api.post(`/api/bgm/playlist/${qrCodeId}`, { trackIds, playMode })
  },

  // ==================== STATISTICS APIs ====================

  /**
   * Log a play event (called from customer page)
   */
  async logPlayEvent(trackId: string, qrCodeId: string): Promise<void> {
    await api.post('/api/bgm/play-event', { trackId, qrCodeId })
  },

  /**
   * Get all BGM tracks with usage statistics (for MasterAdmin)
   */
  async getTracksWithStats(): Promise<BgmTrackStats[]> {
    const response = await api.get('/api/bgm/admin/stats')
    return response.data
  }
}

export default bgmService
