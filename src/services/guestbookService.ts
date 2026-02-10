import apiClient from './api'

export interface CreateGuestbookMessageRequest {
  qrCode: string  // QR Code 문자열 (예: "5YWF8V2X")
  message?: string
  imageData?: string
  color: string
}

export interface GuestbookMessageResponse {
  id: string
  userId: string
  userName: string
  message?: string
  imageUrl?: string
  rotation: number
  color: string
  createdAt: string
  likeCount: number
  isLikedByMe: boolean
}

export interface MyGuestbookMessageResponse {
  id: string
  message?: string
  imageUrl?: string
  rotation: number
  color: string
  createdAt: string
  storeName: string
  qrCode: string
  likeCount: number
}

export interface ToggleLikeResponse {
  isLiked: boolean
  likeCount: number
}

export interface AddStickerRequest {
  stickerType: 'emoji' | 'stamp' | 'custom' | 'asset' | 'logo'
  stickerContent: string
  positionX: number
  positionY: number
  rotation: number
  scale: number
}

export interface StickerResponse {
  id: string
  userId: string
  userName: string
  stickerType: string
  stickerContent: string
  positionX: number
  positionY: number
  rotation: number
  scale: number
  createdAt: string
}

export interface GuestbookStatsOverview {
  totalMessages: number
  todayMessages: number
  weekMessages: number
  monthMessages: number
  totalLikes: number
  totalStickers: number
  uniqueWriters: number
}

export interface GuestbookDailyStats {
  date: string
  count: number
}

export interface GuestbookTopMessage {
  id: string
  userName: string
  createdAt: string
  likeCount: number
  stickerCount: number
}

export interface GuestbookStatsResponse {
  overview: GuestbookStatsOverview
  dailyStats: GuestbookDailyStats[]
  topMessages: GuestbookTopMessage[]
}

export interface GuestbookStatsSummary {
  totalMessages: number
  todayMessages: number
  totalLikes: number
  totalStickers: number
  qrCodeCount: number
}

export interface StickerAsset {
  id: string
  type: 'logo' | 'asset'
  name: string
  imageUrl: string
  category: string
}

export interface StickerAssetsResponse {
  qrCode: string
  storeName: string
  assets: StickerAsset[]
  total: number
}

export interface MyActivityResponse {
  userId: string
  qrCode: string
  storeName: string
  visitCount: number
  gamePlayCount: number
  guestbookCount: number
  firstVisitDate?: string
  lastVisitDate?: string
  followedAt?: string
  bestScore?: {
    gameType: string
    score: number
  }
}

export interface StoreGuestbookMessage {
  id: string
  userId: string
  userName: string
  message?: string
  imageUrl?: string
  rotation: number
  color: string
  createdAt: string
  likeCount: number
  isLikedByMe: boolean
  isMine: boolean
}

export interface StoreGuestbookResponse {
  qrCode: string
  storeName: string
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
  messages: StoreGuestbookMessage[]
}

export interface FeedGuestbookMessage {
  id: string
  userId: string
  userName: string
  userProfileImage?: string
  message?: string
  imageUrl?: string
  rotation: number
  color: string
  createdAt: string
  likeCount: number
  isLikedByMe: boolean
  storeName: string
  storeProfileImage?: string
  qrCode: string
  replyCount: number
  replies?: ReplyResponse[]
}

export interface FeedResponse {
  messages: FeedGuestbookMessage[]
  hasMore: boolean
  nextCursor?: string
}

export interface ReplyResponse {
  id: string
  messageId: string
  userId: string
  userName: string
  userProfileImage?: string
  content: string
  createdAt: string
  updatedAt?: string
}

export interface CreateReplyRequest {
  content: string
}

export interface UpdateReplyRequest {
  content: string
}

export interface ManageMessageResponse {
  id: string
  userId: string
  userName: string
  message?: string
  imageUrl?: string
  rotation: number
  color: string
  createdAt: string
  viewCount: number
  likeCount: number
  replyCount: number
  isLikedByMe: boolean
  isPinned: boolean
  pinnedAt?: string
}

export interface ManageStatsResponse {
  totalMessages: number
  todayMessages: number
  totalViews: number
}

export interface ManageDataResponse {
  stats: ManageStatsResponse
  messages: ManageMessageResponse[]
}

export interface TogglePinResponse {
  isPinned: boolean
  pinnedAt?: string
}

class GuestbookService {
  /**
   * Create a new guestbook message
   */
  async createMessage(request: CreateGuestbookMessageRequest): Promise<GuestbookMessageResponse> {
    const response = await apiClient.post<GuestbookMessageResponse>('/api/guestbook', request)
    return response.data
  }

  /**
   * Get all guestbook messages for a QR code
   */
  async getMessages(qrCodeId: string): Promise<GuestbookMessageResponse[]> {
    const response = await apiClient.get<GuestbookMessageResponse[]>(`/api/guestbook/${qrCodeId}`)
    return response.data
  }

  /**
   * Delete a guestbook message
   */
  async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/api/guestbook/${messageId}`)
  }

  /**
   * Get all guestbook messages created by the current user (across all stores)
   */
  async getMyMessages(): Promise<MyGuestbookMessageResponse[]> {
    const response = await apiClient.get<MyGuestbookMessageResponse[]>('/api/guestbook/my-messages')
    return response.data
  }

  /**
   * Toggle like on a guestbook message
   */
  async toggleLike(messageId: string): Promise<ToggleLikeResponse> {
    const response = await apiClient.post<ToggleLikeResponse>(`/api/guestbook/${messageId}/like`)
    return response.data
  }

  /**
   * Get like status for a message
   */
  async getLikeStatus(messageId: string): Promise<{ likeCount: number; isLikedByMe: boolean }> {
    const response = await apiClient.get<{ likeCount: number; isLikedByMe: boolean }>(`/api/guestbook/${messageId}/like`)
    return response.data
  }

  /**
   * Add a sticker to a guestbook message
   */
  async addSticker(messageId: string, request: AddStickerRequest): Promise<StickerResponse> {
    const response = await apiClient.post<StickerResponse>(`/api/guestbook/${messageId}/sticker`, request)
    return response.data
  }

  /**
   * Get all stickers for a message
   */
  async getStickers(messageId: string): Promise<StickerResponse[]> {
    const response = await apiClient.get<StickerResponse[]>(`/api/guestbook/${messageId}/stickers`)
    return response.data
  }

  /**
   * Delete a sticker
   */
  async deleteSticker(stickerId: string): Promise<void> {
    await apiClient.delete(`/api/guestbook/sticker/${stickerId}`)
  }

  /**
   * Get guestbook statistics for a QR code (admin only)
   */
  async getStats(qrCode: string): Promise<GuestbookStatsResponse> {
    const response = await apiClient.get<GuestbookStatsResponse>(`/api/guestbook/stats/${qrCode}`)
    return response.data
  }

  /**
   * Get summary stats for all QR codes (admin only)
   */
  async getStatsSummary(): Promise<GuestbookStatsSummary> {
    const response = await apiClient.get<GuestbookStatsSummary>('/api/guestbook/stats/summary')
    return response.data
  }

  /**
   * Get available sticker assets for a QR code (logo + selected game assets)
   */
  async getStickerAssets(qrCode: string): Promise<StickerAssetsResponse> {
    const response = await apiClient.get<StickerAssetsResponse>(`/api/guestbook/sticker-assets/${qrCode}`)
    return response.data
  }

  /**
   * Get guestbook feed from followed stores
   * Returns messages from stores the current user follows, ordered by newest first
   */
  async getFeed(cursor?: string, limit: number = 20): Promise<FeedResponse> {
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    params.append('limit', limit.toString())

    const response = await apiClient.get<FeedResponse>(`/api/guestbook/feed?${params.toString()}`)
    return response.data
  }

  /**
   * Add a reply to a guestbook message (store owner only)
   */
  async addReply(messageId: string, content: string): Promise<ReplyResponse> {
    const response = await apiClient.post<ReplyResponse>(`/api/guestbook/${messageId}/reply`, { content })
    return response.data
  }

  /**
   * Get all replies for a guestbook message
   */
  async getReplies(messageId: string): Promise<ReplyResponse[]> {
    const response = await apiClient.get<ReplyResponse[]>(`/api/guestbook/${messageId}/replies`)
    return response.data
  }

  /**
   * Update a reply (author only)
   */
  async updateReply(replyId: string, content: string): Promise<ReplyResponse> {
    const response = await apiClient.put<ReplyResponse>(`/api/guestbook/reply/${replyId}`, { content })
    return response.data
  }

  /**
   * Delete a reply (author only)
   */
  async deleteReply(replyId: string): Promise<void> {
    await apiClient.delete(`/api/guestbook/reply/${replyId}`)
  }

  /**
   * Get guestbook management data for store owner
   * Includes stats and messages with view counts, pin status
   */
  async getManageData(qrCode: string, sort: string = 'latest'): Promise<ManageDataResponse> {
    const response = await apiClient.get<ManageDataResponse>(`/api/guestbook/manage/${qrCode}?sort=${sort}`)
    return response.data
  }

  /**
   * Increment view count for a message
   */
  async incrementViewCount(messageId: string): Promise<{ viewCount: number }> {
    const response = await apiClient.post<{ viewCount: number }>(`/api/guestbook/${messageId}/view`)
    return response.data
  }

  /**
   * Toggle pin status for a message (store owner only)
   */
  async togglePin(messageId: string): Promise<TogglePinResponse> {
    const response = await apiClient.post<TogglePinResponse>(`/api/guestbook/${messageId}/pin`)
    return response.data
  }

  /**
   * Get user's activity for a specific store
   */
  async getMyActivity(qrCode: string): Promise<MyActivityResponse> {
    const response = await apiClient.get<MyActivityResponse>(`/api/guestbook/my-activity/${qrCode}`)
    return response.data
  }

  /**
   * Get store guestbook with isMine highlighting
   */
  async getStoreGuestbook(
    qrCode: string,
    options: { sort?: string; myOnly?: boolean; page?: number; pageSize?: number } = {}
  ): Promise<StoreGuestbookResponse> {
    const params = new URLSearchParams()
    if (options.sort) params.append('sort', options.sort)
    if (options.myOnly) params.append('myOnly', 'true')
    if (options.page) params.append('page', options.page.toString())
    if (options.pageSize) params.append('pageSize', options.pageSize.toString())

    const response = await apiClient.get<StoreGuestbookResponse>(
      `/api/guestbook/store/${qrCode}?${params.toString()}`
    )
    return response.data
  }
}

export default new GuestbookService()
