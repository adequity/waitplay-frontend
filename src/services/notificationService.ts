import apiClient from './api'

export interface NotificationItem {
  id: string
  type: 'like' | 'new_guestbook' | 'reply' | 'user_follow' | 'profile_guestbook' | 'room_asset_ready' | 'knock' | 'store_follow'
  fromUserId: string | null
  fromUserName: string | null
  fromUserProfileImage: string | null
  fromUserProfileCode: string | null
  guestbookMessageId: string | null
  guestbookMessageText: string | null
  guestbookImageUrl: string | null
  guestbookColor: string | null
  qrCodeId: string | null
  qrCode: string | null
  storeName: string | null
  isRead: boolean
  createdAt: string
}

export interface UnreadCountResponse {
  count: number
}

class NotificationService {
  /**
   * 내 알림 목록 조회
   */
  async getNotifications(limit = 20, offset = 0): Promise<NotificationItem[]> {
    const response = await apiClient.get<NotificationItem[]>('/api/notifications', {
      params: { limit, offset }
    })
    return response.data
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>('/api/notifications/unread-count')
    return response.data.count
  }

  /**
   * 알림 읽음 처리
   */
  async markAsRead(notificationId: string): Promise<void> {
    await apiClient.patch(`/api/notifications/${notificationId}/read`)
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch('/api/notifications/read-all')
  }

  /**
   * 알림 삭제
   */
  async deleteNotification(notificationId: string): Promise<void> {
    await apiClient.delete(`/api/notifications/${notificationId}`)
  }

  /**
   * 모든 알림 삭제
   */
  async deleteAllNotifications(): Promise<void> {
    await apiClient.delete('/api/notifications')
  }

  /**
   * 노크 알림 보내기
   */
  async sendKnock(targetProfileCode: string): Promise<void> {
    await apiClient.post('/api/notifications/knock', { targetProfileCode })
  }
}

export default new NotificationService()
