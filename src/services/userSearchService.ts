import apiClient from './api'

export interface SearchUserResult {
  profileCode: string
  nickname: string
  profileImageUrl: string | null
  companyName: string | null
  role: string
}

export interface SearchResponse {
  users: SearchUserResult[]
  hasMore: boolean
}

class UserSearchService {
  async search(q: string, page = 1, pageSize = 20): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>('/api/user-search', {
      params: { q, page, pageSize }
    })
    return response.data
  }
}

export default new UserSearchService()
