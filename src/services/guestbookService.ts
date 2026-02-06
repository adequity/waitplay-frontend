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
}

export default new GuestbookService()
