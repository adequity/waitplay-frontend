import api from './api'

export interface FollowResponse {
  success: boolean
  message?: string
  isFollowing: boolean
  adminId?: string
  storeName?: string
}

export interface FollowStatusResponse {
  isFollowing: boolean
  adminId?: string
  storeName?: string
  followedAt?: string
}

export interface FollowedStoreInfo {
  adminId?: string
  storeName?: string
  followedAt: string
}

const followService = {
  /**
   * 매장 팔로우 (단골 등록)
   */
  async followAdmin(qrCode: string): Promise<FollowResponse> {
    const response = await api.post(`/api/follow/${qrCode}`)
    return response.data
  },

  /**
   * 매장 언팔로우 (단골 해제)
   */
  async unfollowAdmin(qrCode: string): Promise<FollowResponse> {
    const response = await api.delete(`/api/follow/${qrCode}`)
    return response.data
  },

  /**
   * 특정 매장 팔로우 상태 확인
   */
  async getFollowStatus(qrCode: string): Promise<FollowStatusResponse> {
    const response = await api.get(`/api/follow/status/${qrCode}`)
    return response.data
  },

  /**
   * 내가 팔로우한 매장 목록
   */
  async getMyFollowedStores(): Promise<FollowedStoreInfo[]> {
    const response = await api.get('/api/follow/my-stores')
    return response.data
  }
}

export default followService
