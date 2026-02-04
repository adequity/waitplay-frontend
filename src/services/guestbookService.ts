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
}

export default new GuestbookService()
