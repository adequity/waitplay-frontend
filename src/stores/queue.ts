import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import queueService from '@/services/queueService'
import type { QueueEntry, QueueStats, JoinQueueRequest, GameType } from '@/services/queueService'

export const useQueueStore = defineStore('queue', () => {
  const myQueueEntry = ref<QueueEntry | null>(null)
  const waitingQueue = ref<QueueEntry[]>([])
  const playingQueue = ref<QueueEntry[]>([])
  const stats = ref<QueueStats | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isInQueue = computed(() => !!myQueueEntry.value)
  const myPosition = computed(() => myQueueEntry.value?.position ?? 0)
  const myEstimatedWaitTime = computed(() => myQueueEntry.value?.estimatedWaitTime ?? 0)

  /**
   * Join the queue
   */
  async function joinQueue(request: JoinQueueRequest) {
    isLoading.value = true
    error.value = null

    try {
      myQueueEntry.value = await queueService.joinQueue(request)
      return myQueueEntry.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to join queue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get my current queue status
   */
  async function fetchMyStatus(guestNickname?: string) {
    isLoading.value = true
    error.value = null

    try {
      myQueueEntry.value = await queueService.getMyStatus(guestNickname)
      return myQueueEntry.value
    } catch (err: any) {
      // Not in queue is not an error
      if (err.response?.status === 404) {
        myQueueEntry.value = null
        return null
      }
      error.value = err.response?.data?.message || 'Failed to fetch queue status'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get all waiting queue entries (for admin)
   */
  async function fetchWaitingQueue() {
    isLoading.value = true
    error.value = null

    try {
      waitingQueue.value = await queueService.getWaitingQueue()
      return waitingQueue.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch waiting queue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get all playing queue entries (for admin)
   */
  async function fetchPlayingQueue() {
    isLoading.value = true
    error.value = null

    try {
      playingQueue.value = await queueService.getPlayingQueue()
      return playingQueue.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch playing queue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get queue statistics (for admin)
   */
  async function fetchStats() {
    isLoading.value = true
    error.value = null

    try {
      stats.value = await queueService.getQueueStats()
      return stats.value
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch queue stats'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Start playing (admin action)
   */
  async function startPlaying(queueId: string) {
    try {
      const updatedEntry = await queueService.startPlaying(queueId)

      // Update local state
      waitingQueue.value = waitingQueue.value.filter(q => q.id !== queueId)
      playingQueue.value.push(updatedEntry)

      return updatedEntry
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to start playing'
      throw err
    }
  }

  /**
   * Complete playing (admin action)
   */
  async function completePlaying(queueId: string) {
    try {
      const updatedEntry = await queueService.completePlaying(queueId)

      // Update local state
      playingQueue.value = playingQueue.value.filter(q => q.id !== queueId)

      return updatedEntry
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to complete playing'
      throw err
    }
  }

  /**
   * Cancel queue entry
   */
  async function cancelEntry(queueId: string) {
    try {
      await queueService.cancelEntry(queueId)

      // Update local state
      if (myQueueEntry.value?.id === queueId) {
        myQueueEntry.value = null
      }
      waitingQueue.value = waitingQueue.value.filter(q => q.id !== queueId)
      playingQueue.value = playingQueue.value.filter(q => q.id !== queueId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to cancel entry'
      throw err
    }
  }

  /**
   * Clear my queue entry (after leaving)
   */
  function clearMyEntry() {
    myQueueEntry.value = null
  }

  return {
    myQueueEntry,
    waitingQueue,
    playingQueue,
    stats,
    isLoading,
    error,
    isInQueue,
    myPosition,
    myEstimatedWaitTime,
    joinQueue,
    fetchMyStatus,
    fetchWaitingQueue,
    fetchPlayingQueue,
    fetchStats,
    startPlaying,
    completePlaying,
    cancelEntry,
    clearMyEntry
  }
})
