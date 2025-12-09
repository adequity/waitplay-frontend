import apiClient from './api'

export interface CreateGuestbookMessageRequest {
  qrCodeId: string
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
}

export default new GuestbookService()
