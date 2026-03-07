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

export interface StoreProfileResponse {
  qrCode: string
  adminId: string
  storeName: string
  storeProfileImage?: string
  description?: string
  followerCount: number
  guestbookCount: number
  isFollowing: boolean
}

export interface FollowerInfo {
  userId: string
  userName: string
  profileImage?: string
  followedAt: string
}

export interface StoreFollowersResponse {
  storeName: string
  totalCount: number
  followers: FollowerInfo[]
  hasMore: boolean
  page: number
}

export interface FollowUserItem {
  userId: string
  nickname: string
  profileImage: string | null
  profileCode: string | null
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
  },

  /**
   * 매장 프로필 정보 조회
   */
  async getStoreProfile(qrCode: string): Promise<StoreProfileResponse> {
    const response = await api.get(`/api/follow/store-profile/${qrCode}`)
    return response.data
  },

  /**
   * 매장 팔로워 목록 조회
   */
  async getStoreFollowers(qrCode: string, page: number = 1, limit: number = 20): Promise<StoreFollowersResponse> {
    const response = await api.get(`/api/follow/store-followers/${qrCode}?page=${page}&limit=${limit}`)
    return response.data
  },

  // ===== 유저 간 팔로우 =====

  async followUser(profileCode: string): Promise<{ isFollowing: boolean; userFollowerCount: number }> {
    const response = await api.post(`/api/follow/user/${profileCode}`)
    return response.data
  },

  async unfollowUser(profileCode: string): Promise<{ isFollowing: boolean; userFollowerCount: number }> {
    const response = await api.delete(`/api/follow/user/${profileCode}`)
    return response.data
  },

  async getUserFollowStatus(profileCode: string): Promise<{ isFollowing: boolean; followerCount: number; followingCount: number }> {
    const response = await api.get(`/api/follow/user/${profileCode}/status`)
    return response.data
  },

  /**
   * 배치 팔로우 상태 확인 (여러 유저 ID)
   * @returns 내가 팔로우 중인 userId 배열
   */
  async getBatchFollowStatus(userIds: string[]): Promise<string[]> {
    const response = await api.post('/api/follow/user/batch-status', userIds)
    return response.data
  },

  /**
   * 유저 팔로워 목록 조회
   */
  async getUserFollowers(profileCode: string, page = 1, limit = 20): Promise<{ totalCount: number; followers: FollowUserItem[]; hasMore: boolean; page: number }> {
    const response = await api.get(`/api/follow/user/${profileCode}/followers?page=${page}&limit=${limit}`)
    return response.data
  },

  /**
   * 유저 팔로잉 목록 조회
   */
  async getUserFollowing(profileCode: string, page = 1, limit = 20): Promise<{ totalCount: number; following: FollowUserItem[]; hasMore: boolean; page: number }> {
    const response = await api.get(`/api/follow/user/${profileCode}/following?page=${page}&limit=${limit}`)
    return response.data
  }
}

export default followService
