import apiClient from './api'

export interface BlockedUser {
  userId: string
  nickname: string
  profileImage?: string
  profileCode?: string
  blockedAt: string
}

class BlockService {
  async blockUser(targetUserId: string): Promise<{ message: string }> {
    const response = await apiClient.post(`/api/users/block/${targetUserId}`)
    return response.data
  }

  async unblockUser(targetUserId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/api/users/block/${targetUserId}`)
    return response.data
  }

  async getBlockedUsers(): Promise<BlockedUser[]> {
    const response = await apiClient.get<BlockedUser[]>('/api/users/block')
    return response.data
  }
}

export default new BlockService()
