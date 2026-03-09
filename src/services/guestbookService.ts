import apiClient from './api'

export interface CreateGuestbookMessageRequest {
  qrCode: string  // QR Code 문자열 (예: "5YWF8V2X")
  message?: string
  imageData?: string
  audioUrl?: string
  color: string
}

export interface GuestbookMessageResponse {
  id: string
  userId: string
  userName: string
  userProfileImage?: string
  userProfileCode?: string
  message?: string
  imageUrl?: string
  audioUrl?: string
  rotation: number
  color: string
  createdAt: string
  likeCount: number
  isLikedByMe: boolean
  replyCount?: number
  replies?: ReplyResponse[]
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

export interface MentionableUser {
  userId: string
  nickname: string
  profileImage?: string
  profileCode?: string
  companyName?: string
  isStore: boolean
}

export interface TrendingMessage {
  id: string
  userId: string
  userName: string
  userProfileImage?: string
  userProfileCode?: string
  message?: string
  imageUrl?: string
  audioUrl?: string
  rotation: number
  color: string
  createdAt: string
  viewCount: number
  likeCount: number
  isLikedByMe: boolean
  reactionCount: number
  score: number
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

export interface UserFollowedStoreInfo {
  adminId: string
  storeName: string
  storeProfileImage?: string
  qrCode: string
  followerCount: number
}

export interface UserPublicProfile {
  id: string
  nickname: string
  profileImage?: string
  profileCode?: string
  bio?: string
  totalMessages: number
  followerCount: number
  todayVisitors: number
  totalVisitors: number
  profileGuestbookCount: number
  userFollowerCount: number
  userFollowingCount: number
  isFollowedByMe: boolean
  isBlockedByMe: boolean
  isBlockedByThem: boolean
  followedStores: UserFollowedStoreInfo[]
}

export interface CreateProfileGuestbookRequest {
  message?: string
  imageData?: string
  audioUrl?: string
  color: string
}

export interface StoreAlbumResponse {
  adminId: string
  storeName: string
  storeProfileImage?: string
  qrCode: string
  visitCount: number
  latestImageUrl?: string
  latestMessage?: string
  latestColor?: string
  lastVisitedAt: string
}

export interface DailyActivity {
  date: string
  count: number
}

export interface MonthlyStats {
  messagesWritten: number
  newStoresVisited: number
  likesReceived: number
}

export interface ActivityHeatmapResponse {
  dailyActivities: DailyActivity[]
  yearTotalStores: number
  yearTotalMessages: number
  currentMonth: MonthlyStats
}

export interface UserMessagesResponse {
  messages: MyGuestbookMessageResponse[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface FeedGuestbookMessage {
  id: string
  userId: string
  userName: string
  userProfileImage?: string
  userProfileCode?: string
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

  /**
   * Report a guestbook message for deletion (Admin only)
   * @param messageId - 신고할 방명록 ID
   * @param reason - 삭제 요청 사유
   */
  async reportMessage(messageId: string, reason: string): Promise<{ message: string; reportId: string; status: string }> {
    const response = await apiClient.post<{ message: string; reportId: string; status: string }>(
      `/api/guestbook/${messageId}/report`,
      { reason }
    )
    return response.data
  }

  /**
   * Get my reported messages (Admin only)
   * @param status - 필터링할 상태 (pending, approved, rejected)
   */
  /**
   * Get a user's public profile
   */
  async getUserProfile(userId: string): Promise<UserPublicProfile> {
    const response = await apiClient.get<UserPublicProfile>(`/api/guestbook/user/${userId}/profile`)
    return response.data
  }

  /**
   * Get all guestbook messages created by a specific user
   */
  async getUserMessages(userId: string, page: number = 1, pageSize: number = 20): Promise<UserMessagesResponse> {
    const response = await apiClient.get<UserMessagesResponse>(`/api/guestbook/user/${userId}/messages?page=${page}&pageSize=${pageSize}`)
    return response.data
  }

  /**
   * Get a single guestbook message by ID
   */
  async getGuestbookMessage(messageId: string): Promise<any> {
    const response = await apiClient.get(`/api/guestbook/message/${messageId}`)
    return response.data
  }

  async getMyReports(status?: string): Promise<{ total: number; reports: any[] }> {
    const params = status ? `?status=${status}` : ''
    const response = await apiClient.get<{ total: number; reports: any[] }>(`/api/guestbook/my-reports${params}`)
    return response.data
  }

  // ===== Profile Guestbook =====

  async createProfileGuestbook(profileCode: string, data: CreateProfileGuestbookRequest): Promise<GuestbookMessageResponse> {
    const response = await apiClient.post<GuestbookMessageResponse>(`/api/guestbook/profile/${profileCode}`, data)
    return response.data
  }

  async getProfileGuestbook(profileCode: string, page: number = 1, pageSize: number = 20): Promise<{ messages: GuestbookMessageResponse[]; totalCount: number; hasMore: boolean }> {
    const response = await apiClient.get(`/api/guestbook/profile/${profileCode}/messages?page=${page}&pageSize=${pageSize}`)
    return response.data
  }

  async deleteProfileGuestbook(messageId: string): Promise<void> {
    await apiClient.delete(`/api/guestbook/profile/message/${messageId}`)
  }

  // ===== Store Albums & Activity =====

  async getStoreAlbums(userCode: string): Promise<{ albums: StoreAlbumResponse[] }> {
    const response = await apiClient.get(`/api/guestbook/user/${userCode}/store-albums`)
    return response.data
  }

  async getActivityHeatmap(userCode: string): Promise<ActivityHeatmapResponse> {
    const response = await apiClient.get<ActivityHeatmapResponse>(`/api/guestbook/user/${userCode}/activity`)
    return response.data
  }

  // ===== Reactions =====

  async toggleReaction(messageId: string, reactionType: string): Promise<{ toggled: boolean; reactionType: string }> {
    const response = await apiClient.post(`/api/guestbook/${messageId}/reaction`, { reactionType })
    return response.data
  }

  async getReactions(messageId: string): Promise<{ reactions: { type: string; count: number }[]; myReactions: string[] }> {
    const response = await apiClient.get(`/api/guestbook/${messageId}/reactions`)
    return response.data
  }

  // ===== Trending =====

  async getTrending(period: 'day' | 'week' | 'month' = 'week', page = 1, pageSize = 20): Promise<TrendingMessage[]> {
    const response = await apiClient.get<TrendingMessage[]>('/api/guestbook/trending', {
      params: { period, page, pageSize }
    })
    return response.data
  }

  // ===== Mention =====

  async sendMention(messageId: string, targetUserId: string): Promise<{ message: string; alreadySent: boolean }> {
    const response = await apiClient.post(`/api/guestbook/${messageId}/mention`, { targetUserId })
    return response.data
  }

  async searchMentionableUsers(q: string = ''): Promise<MentionableUser[]> {
    const response = await apiClient.get<MentionableUser[]>('/api/guestbook/mention-search', { params: { q } })
    return response.data
  }
}

export default new GuestbookService()
