<template>
  <div class="tab-content">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">방명록 관리</h1>
      <p class="page-desc">고객이 남긴 방명록 메시지를 관리하세요.</p>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <IconBase name="message" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalMessages }}</span>
          <span class="stat-label">총 메시지</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <IconBase name="message" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.todayMessages }}</span>
          <span class="stat-label">오늘 메시지</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pink">
          <IconBase name="heart" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalLikes }}</span>
          <span class="stat-label">총 좋아요</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <IconBase name="sparkles" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.totalStickers }}</span>
          <span class="stat-label">총 스티커</span>
        </div>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar">
      <div class="filter-left">
        <select v-model="filter.sortBy" class="filter-select">
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="likes">좋아요순</option>
        </select>
      </div>
      <div class="filter-right">
        <button class="btn-refresh" @click="loadMessages">
          <IconBase name="loader" :class="{ spinning: isLoading }" />
          새로고침
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>방명록을 불러오는 중...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="messages.length === 0" class="empty-state">
      <IconBase name="book" class="empty-icon" />
      <h3>아직 방명록이 없습니다</h3>
      <p>고객이 방명록에 메시지를 남기면 여기에 표시됩니다.</p>
    </div>

    <!-- Messages List -->
    <div v-else class="messages-list">
      <div
        v-for="message in sortedMessages"
        :key="message.id"
        class="message-card"
        :style="{ borderLeftColor: message.color }"
      >
        <div class="message-header">
          <div class="message-author">
            <div class="author-avatar" :style="{ backgroundColor: message.color }">
              {{ message.userName?.charAt(0) || '?' }}
            </div>
            <div class="author-info">
              <span class="author-name">{{ message.userName }}</span>
              <span class="message-date">{{ formatDate(message.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="message-content">
          <p v-if="message.message" class="message-text">{{ message.message }}</p>
          <img
            v-if="message.imageUrl"
            :src="message.imageUrl"
            alt="방명록 이미지"
            class="message-image"
            @click="openImageModal(message.imageUrl)"
          />
        </div>

        <div class="message-footer">
          <div class="message-actions">
            <!-- 좋아요 버튼 -->
            <button
              class="action-btn"
              :class="{ liked: message.isLikedByMe, loading: likingMessageId === message.id }"
              @click="toggleLike(message.id)"
              :disabled="likingMessageId === message.id"
            >
              <IconBase :name="message.isLikedByMe ? 'heart' : 'heart-outline'" class="action-icon" />
              <span>{{ message.likeCount }}</span>
            </button>

            <!-- 댓글 토글 버튼 -->
            <button
              class="action-btn"
              :class="{ active: expandedReplies.has(message.id) }"
              @click="toggleReplies(message.id)"
            >
              <IconBase name="message" class="action-icon" />
              <span>댓글</span>
            </button>
          </div>
        </div>

        <!-- 댓글 섹션 -->
        <div v-if="expandedReplies.has(message.id)" class="replies-section">
          <!-- 댓글 입력 -->
          <div class="reply-input-wrapper">
            <input
              v-model="replyInputs[message.id]"
              type="text"
              placeholder="고객에게 답글을 남겨보세요..."
              class="reply-input"
              @keyup.enter="submitReply(message.id)"
              :disabled="isSubmittingReply[message.id]"
            />
            <button
              class="btn-submit-reply"
              @click="submitReply(message.id)"
              :disabled="!replyInputs[message.id]?.trim() || isSubmittingReply[message.id]"
            >
              {{ isSubmittingReply[message.id] ? '작성 중...' : '작성' }}
            </button>
          </div>

          <!-- 댓글 목록 -->
          <div v-if="messageReplies[message.id]?.length" class="replies-list">
            <div
              v-for="reply in messageReplies[message.id]"
              :key="reply.id"
              class="reply-item"
            >
              <div class="reply-avatar">
                <img v-if="reply.userProfileImage" :src="reply.userProfileImage" alt="프로필" />
                <IconBase v-else name="user" class="avatar-placeholder" />
              </div>
              <div class="reply-content">
                <div class="reply-header">
                  <span class="reply-author">{{ reply.userName }}</span>
                  <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                  <span v-if="reply.updatedAt" class="reply-edited">(수정됨)</span>
                </div>
                <!-- 수정 모드 -->
                <div v-if="editingReplyId === reply.id" class="reply-edit-form">
                  <input
                    v-model="editingReplyContent"
                    type="text"
                    class="reply-edit-input"
                    @keyup.enter="saveEditReply(message.id)"
                    @keyup.escape="cancelEditReply"
                  />
                  <div class="reply-edit-actions">
                    <button class="btn-edit-save" @click="saveEditReply(message.id)">저장</button>
                    <button class="btn-edit-cancel" @click="cancelEditReply">취소</button>
                  </div>
                </div>
                <!-- 일반 모드 -->
                <p v-else class="reply-text">{{ reply.content }}</p>
                <!-- 내 댓글일 경우 수정/삭제 버튼 -->
                <div v-if="reply.userId === authStore.user?.id && editingReplyId !== reply.id" class="reply-actions">
                  <button class="btn-reply-action" @click="startEditReply(reply)">수정</button>
                  <button class="btn-reply-action delete" @click="deleteReply(message.id, reply.id)">삭제</button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="no-replies">
            <p>아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div v-if="showImageModal" class="modal-overlay image-modal-overlay" @click.self="showImageModal = false">
      <div class="image-modal">
        <button class="btn-close-image" @click="showImageModal = false">
          <IconBase name="close" />
        </button>
        <img :src="selectedImage" alt="이미지 미리보기" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import type { GuestbookMessageResponse, ReplyResponse } from '@/services/guestbookService'
import IconBase from '@/components/IconBase.vue'

const authStore = useAuthStore()

const isLoading = ref(true)
const messages = ref<GuestbookMessageResponse[]>([])
const stats = ref({
  totalMessages: 0,
  todayMessages: 0,
  totalLikes: 0,
  totalStickers: 0
})

const filter = ref({
  sortBy: 'newest' as 'newest' | 'oldest' | 'likes'
})

const showImageModal = ref(false)
const selectedImage = ref('')

// 댓글 관련 상태
const messageReplies = ref<Record<string, ReplyResponse[]>>({})
const expandedReplies = ref<Set<string>>(new Set())
const replyInputs = ref<Record<string, string>>({})
const editingReplyId = ref<string | null>(null)
const editingReplyContent = ref('')
const isSubmittingReply = ref<Record<string, boolean>>({})

// 좋아요 처리 중 상태
const likingMessageId = ref<string | null>(null)

const sortedMessages = computed(() => {
  const sorted = [...messages.value]
  switch (filter.value.sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'likes':
      return sorted.sort((a, b) => b.likeCount - a.likeCount)
    default:
      return sorted
  }
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // 1시간 이내
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000))
    return minutes <= 0 ? '방금 전' : `${minutes}분 전`
  }

  // 24시간 이내
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000))
    return `${hours}시간 전`
  }

  // 7일 이내
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000))
    return `${days}일 전`
  }

  // 그 외
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const loadStats = async () => {
  try {
    const summary = await guestbookService.getStatsSummary()
    stats.value = {
      totalMessages: summary.totalMessages,
      todayMessages: summary.todayMessages,
      totalLikes: summary.totalLikes,
      totalStickers: summary.totalStickers
    }
  } catch (error) {
    console.error('Failed to load guestbook stats:', error)
  }
}

const loadMessages = async () => {
  isLoading.value = true
  try {
    const user = authStore.user
    if (!user?.qrCodeId) {
      console.error('No QR code ID found')
      return
    }

    const result = await guestbookService.getMessages(user.qrCodeId)
    messages.value = result
  } catch (error) {
    console.error('Failed to load guestbook messages:', error)
  } finally {
    isLoading.value = false
  }
}

const openImageModal = (imageUrl: string) => {
  selectedImage.value = imageUrl
  showImageModal.value = true
}

// 좋아요 토글
const toggleLike = async (messageId: string) => {
  if (likingMessageId.value) return

  likingMessageId.value = messageId
  try {
    const result = await guestbookService.toggleLike(messageId)
    const message = messages.value.find(m => m.id === messageId)
    if (message) {
      message.likeCount = result.likeCount
      message.isLikedByMe = result.isLiked
    }
  } catch (error) {
    console.error('Failed to toggle like:', error)
  } finally {
    likingMessageId.value = null
  }
}

// 댓글 토글 (펼치기/접기)
const toggleReplies = async (messageId: string) => {
  if (expandedReplies.value.has(messageId)) {
    expandedReplies.value.delete(messageId)
  } else {
    expandedReplies.value.add(messageId)
    if (!messageReplies.value[messageId]) {
      await loadReplies(messageId)
    }
  }
}

// 댓글 로드
const loadReplies = async (messageId: string) => {
  try {
    const replies = await guestbookService.getReplies(messageId)
    messageReplies.value[messageId] = replies
  } catch (error) {
    console.error('Failed to load replies:', error)
  }
}

// 댓글 작성
const submitReply = async (messageId: string) => {
  const content = replyInputs.value[messageId]?.trim()
  if (!content || isSubmittingReply.value[messageId]) return

  isSubmittingReply.value[messageId] = true
  try {
    const reply = await guestbookService.addReply(messageId, content)
    if (!messageReplies.value[messageId]) {
      messageReplies.value[messageId] = []
    }
    messageReplies.value[messageId].push(reply)
    replyInputs.value[messageId] = ''
    expandedReplies.value.add(messageId)
  } catch (error) {
    console.error('Failed to submit reply:', error)
    alert('댓글 작성에 실패했습니다.')
  } finally {
    isSubmittingReply.value[messageId] = false
  }
}

// 댓글 수정 시작
const startEditReply = (reply: ReplyResponse) => {
  editingReplyId.value = reply.id
  editingReplyContent.value = reply.content
}

// 댓글 수정 취소
const cancelEditReply = () => {
  editingReplyId.value = null
  editingReplyContent.value = ''
}

// 댓글 수정 저장
const saveEditReply = async (messageId: string) => {
  if (!editingReplyId.value || !editingReplyContent.value.trim()) return

  try {
    const updatedReply = await guestbookService.updateReply(editingReplyId.value, editingReplyContent.value.trim())
    const replies = messageReplies.value[messageId]
    if (replies) {
      const index = replies.findIndex(r => r.id === editingReplyId.value)
      if (index !== -1) {
        replies[index] = updatedReply
      }
    }
    cancelEditReply()
  } catch (error) {
    console.error('Failed to update reply:', error)
    alert('댓글 수정에 실패했습니다.')
  }
}

// 댓글 삭제
const deleteReply = async (messageId: string, replyId: string) => {
  if (!confirm('댓글을 삭제하시겠습니까?')) return

  try {
    await guestbookService.deleteReply(replyId)
    const replies = messageReplies.value[messageId]
    if (replies) {
      messageReplies.value[messageId] = replies.filter(r => r.id !== replyId)
    }
  } catch (error) {
    console.error('Failed to delete reply:', error)
    alert('댓글 삭제에 실패했습니다.')
  }
}

onMounted(async () => {
  await Promise.all([loadStats(), loadMessages()])
})
</script>

<style scoped>
.tab-content {
  padding: 50px 60px;
  background-color: #f5f5f7;
  min-height: 100vh;
}

/* Page Header */
.page-header {
  margin-bottom: 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: -0.5px;
  color: #1d1d1f;
}

.page-desc {
  color: #86868b;
  font-size: 16px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.stat-icon.blue {
  background: #e8f2ff;
  color: #0071e3;
}

.stat-icon.green {
  background: #e8f8f0;
  color: #34c759;
}

.stat-icon.pink {
  background: #fff0f3;
  color: #ff2d55;
}

.stat-icon.orange {
  background: #fff5e6;
  color: #ff9500;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1d1d1f;
}

.stat-label {
  font-size: 14px;
  color: #86868b;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  font-size: 14px;
  color: #1d1d1f;
  background: white;
  cursor: pointer;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-refresh:hover {
  background: #0077ed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 80px 20px;
  color: #86868b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e5ea;
  border-top-color: #0071e3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
}

.empty-icon {
  font-size: 64px;
  color: #d2d2d7;
  margin-bottom: 20px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 8px;
}

.empty-state p {
  color: #86868b;
  font-size: 15px;
}

/* Messages List */
.messages-list {
  display: grid;
  gap: 16px;
}

.message-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #0071e3;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.message-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 15px;
  font-weight: 600;
  color: #1d1d1f;
}

.message-date {
  font-size: 13px;
  color: #86868b;
}

.message-content {
  margin-bottom: 16px;
}

.message-text {
  font-size: 15px;
  line-height: 1.6;
  color: #1d1d1f;
  margin: 0 0 12px 0;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f5;
}

.message-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #86868b;
}

.stat-icon-small {
  font-size: 16px;
}

.stat-icon-small.pink {
  color: #ff2d55;
}

/* Message Actions */
.message-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #f5f5f7;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  color: #86868b;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #e8e8ed;
  color: #1d1d1f;
}

.action-btn.liked {
  background: #fff0f3;
  color: #ff2d55;
}

.action-btn.liked .action-icon {
  color: #ff2d55;
}

.action-btn.active {
  background: #e8f2ff;
  color: #0071e3;
}

.action-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-icon {
  width: 18px;
  height: 18px;
}

/* Replies Section */
.replies-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f5;
}

.reply-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.reply-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #e5e5ea;
  border-radius: 24px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.reply-input:focus {
  border-color: #0071e3;
}

.btn-submit-reply {
  padding: 12px 20px;
  background: #0071e3;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit-reply:hover:not(:disabled) {
  background: #0077ed;
}

.btn-submit-reply:disabled {
  background: #d2d2d7;
  cursor: not-allowed;
}

/* Replies List */
.replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reply-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #f9f9fb;
  border-radius: 12px;
}

.reply-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #e5e5ea;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.reply-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 20px;
  height: 20px;
  color: #86868b;
}

.reply-content {
  flex: 1;
  min-width: 0;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.reply-author {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
}

.reply-date {
  font-size: 12px;
  color: #86868b;
}

.reply-edited {
  font-size: 11px;
  color: #aeaeb2;
}

.reply-text {
  font-size: 14px;
  line-height: 1.5;
  color: #1d1d1f;
  margin: 0;
  word-break: break-word;
}

.reply-actions {
  display: flex;
  gap: 8px;
  margin-top: 6px;
}

.btn-reply-action {
  background: none;
  border: none;
  font-size: 12px;
  color: #86868b;
  cursor: pointer;
  padding: 0;
}

.btn-reply-action:hover {
  color: #0071e3;
}

.btn-reply-action.delete:hover {
  color: #ff3b30;
}

/* Reply Edit Form */
.reply-edit-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.reply-edit-input {
  padding: 8px 12px;
  border: 1px solid #e5e5ea;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.reply-edit-input:focus {
  border-color: #0071e3;
}

.reply-edit-actions {
  display: flex;
  gap: 8px;
}

.btn-edit-save,
.btn-edit-cancel {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}

.btn-edit-save {
  background: #0071e3;
  color: white;
}

.btn-edit-cancel {
  background: #f5f5f7;
  color: #86868b;
}

/* No Replies */
.no-replies {
  text-align: center;
  padding: 20px;
  color: #86868b;
  font-size: 14px;
}

.no-replies p {
  margin: 0;
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5ea;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #86868b;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 8px 0;
  font-size: 15px;
  color: #1d1d1f;
}

.warning-text {
  color: #ff3b30 !important;
  font-size: 13px !important;
}

/* Image Modal */
.image-modal-overlay {
  background: rgba(0, 0, 0, 0.9);
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.image-modal img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 8px;
}

.btn-close-image {
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .tab-content {
    padding: 30px 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filter-bar {
    flex-direction: column;
    gap: 12px;
  }

  .filter-left,
  .filter-right {
    width: 100%;
  }

  .filter-select,
  .btn-refresh {
    width: 100%;
    justify-content: center;
  }
}
</style>
