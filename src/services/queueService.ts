import apiClient from './api'

export enum GameType {
  Pinball = 0,
  Match = 1,
  Spot = 2
}

export enum QueueStatus {
  Waiting = 0,
  Playing = 1,
  Completed = 2,
  Cancelled = 3
}

export interface JoinQueueRequest {
  guestNickname?: string
  guestPhone?: string
  gameType: GameType
}

export interface QueueEntry {
  id: string
  userId?: string
  guestNickname?: string
  guestPhone?: string
  userNickname?: string
  profileImage?: string
  gameType: GameType
  gameTypeName: string
  status: QueueStatus
  statusName: string
  position: number
  joinedAt: string
  startedAt?: string
  completedAt?: string
  estimatedWaitTime?: number
}

export interface QueueStats {
  totalWaiting: number
  totalPlaying: number
  totalCompletedToday: number
  averageWaitTime: number
}

class QueueService {
  /**
   * Join the queue
   */
  async joinQueue(request: JoinQueueRequest): Promise<QueueEntry> {
    const response = await apiClient.post<QueueEntry>('/api/queue/join', request)
    return response.data
  }

  /**
   * Get my current queue status
   */
  async getMyStatus(guestNickname?: string): Promise<QueueEntry> {
    const params = guestNickname ? { guestNickname } : {}
    const response = await apiClient.get<QueueEntry>('/api/queue/my-status', { params })
    return response.data
  }

  /**
   * Get all waiting queue entries (for admin)
   */
  async getWaitingQueue(): Promise<QueueEntry[]> {
    const response = await apiClient.get<QueueEntry[]>('/api/queue/waiting')
    return response.data
  }

  /**
   * Get all playing queue entries (for admin)
   */
  async getPlayingQueue(): Promise<QueueEntry[]> {
    const response = await apiClient.get<QueueEntry[]>('/api/queue/playing')
    return response.data
  }

  /**
   * Get queue statistics (for admin)
   */
  async getQueueStats(): Promise<QueueStats> {
    const response = await apiClient.get<QueueStats>('/api/queue/stats')
    return response.data
  }

  /**
   * Start playing (admin action)
   */
  async startPlaying(queueId: string): Promise<QueueEntry> {
    const response = await apiClient.post<QueueEntry>(`/api/queue/${queueId}/start`)
    return response.data
  }

  /**
   * Complete playing (admin action)
   */
  async completePlaying(queueId: string): Promise<QueueEntry> {
    const response = await apiClient.post<QueueEntry>(`/api/queue/${queueId}/complete`)
    return response.data
  }

  /**
   * Cancel queue entry
   */
  async cancelEntry(queueId: string): Promise<void> {
    await apiClient.post(`/api/queue/${queueId}/cancel`)
  }
}

export default new QueueService()
