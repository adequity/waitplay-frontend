<template>
  <div class="guestbook-full-view">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">방명록</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>방명록을 불러오는 중...</p>
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="messages.length === 0" class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
      </svg>
      <p>아직 남겨진 방명록이 없습니다.</p>
      <button @click="goBack" class="btn-back-home">돌아가기</button>
    </div>

    <!-- 방명록 그리드 -->
    <div v-else class="guestbook-content">
      <p class="message-count">총 {{ messages.length }}개의 방명록</p>

      <div class="guestbook-grid">
        <div
          v-for="message in messages"
          :key="message.id"
          class="post-it"
          :class="`post-it--${message.color}`"
          :style="{ transform: `rotate(${message.rotation}deg)` }"
        >
          <div class="post-it-content">
            <img
              v-if="message.imageUrl"
              :src="message.imageUrl"
              :alt="`${message.userName}의 방명록`"
              class="drawing-image"
              @click="openImageModal(message)"
            />
            <div class="message-footer">
              <div class="message-info">
                <span class="message-author">- {{ message.userName }}</span>
                <span class="message-date">{{ formatDate(message.createdAt) }}</span>
              </div>
              <button
                class="like-btn"
                :class="{ 'liked': message.isLikedByMe }"
                @click.stop="handleLike(message)"
                :disabled="likingMessageId === message.id"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>{{ message.likeCount || 0 }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="selectedMessage" class="image-modal-overlay" @click="closeImageModal">
          <div class="image-modal" @click.stop>
            <button @click="closeImageModal" class="modal-close-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
            <img :src="selectedMessage.imageUrl" :alt="`${selectedMessage.userName}의 방명록`" class="modal-image" />
            <div class="modal-info">
              <span class="modal-author">{{ selectedMessage.userName }}</span>
              <span class="modal-date">{{ formatFullDate(selectedMessage.createdAt) }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const messages = ref<any[]>([])
const isLoading = ref(true)
const selectedMessage = ref<any>(null)
const likingMessageId = ref<string | null>(null)

// QR 코드 가져오기
const qrCode = route.query.qr as string

onMounted(async () => {
  if (!qrCode) {
    router.push('/customer')
    return
  }

  try {
    const response = await guestbookService.getMessages(qrCode)
    messages.value = response
  } catch (error) {
    console.error('Failed to load guestbook messages:', error)
    messages.value = []
  } finally {
    isLoading.value = false
  }
})

const goBack = () => {
  if (qrCode) {
    router.push(`/customer?qr=${qrCode}`)
  } else {
    router.back()
  }
}

const openImageModal = (message: any) => {
  selectedMessage.value = message
  document.body.style.overflow = 'hidden'
}

const closeImageModal = () => {
  selectedMessage.value = null
  document.body.style.overflow = ''
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 1) {
    return '방금 전'
  } else if (diffInHours < 24) {
    return `${diffInHours}시간 전`
  } else if (diffInHours < 24 * 7) {
    return `${Math.floor(diffInHours / 24)}일 전`
  } else {
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }
}

const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 좋아요 토글 핸들러
const handleLike = async (message: any) => {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) {
      router.push(`/login?qr=${qrCode}`)
    }
    return
  }

  if (likingMessageId.value) return

  likingMessageId.value = message.id

  try {
    const response = await guestbookService.toggleLike(message.id)
    // 메시지 상태 업데이트
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch (error) {
    console.error('Failed to toggle like:', error)
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    likingMessageId.value = null
  }
}
</script>

<style scoped>
.guestbook-full-view {
  min-height: 100vh;
  background: #f9fafb;
}

/* 헤더 */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* 로딩 상태 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
}

.loading-state .spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #4ECDC4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-state p {
  color: #6b7280;
  font-size: 15px;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  text-align: center;
}

.empty-state p {
  color: #6b7280;
  font-size: 16px;
}

.btn-back-home {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #4ECDC4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back-home:hover {
  background: #3dbdb5;
}

/* 콘텐츠 영역 */
.guestbook-content {
  padding: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

.message-count {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 1rem;
  text-align: center;
}

/* 방명록 그리드 */
.guestbook-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.post-it {
  padding: 0.75rem;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.post-it:hover {
  transform: scale(1.02) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.post-it--yellow {
  background: #fef3c7;
  border-top: 3px solid #fbbf24;
}

.post-it--pink {
  background: #fce7f3;
  border-top: 3px solid #f472b6;
}

.post-it--blue {
  background: #dbeafe;
  border-top: 3px solid #60a5fa;
}

.post-it--green {
  background: #d1fae5;
  border-top: 3px solid #34d399;
}

.post-it-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawing-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: opacity 0.2s;
}

.drawing-image:hover {
  opacity: 0.9;
}

.message-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(0, 0, 0, 0.1);
}

.message-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.message-author {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
}

.message-date {
  font-size: 11px;
  color: #9ca3af;
}

/* 좋아요 버튼 */
.like-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.like-btn:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444;
}

.like-btn.liked {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.like-btn svg {
  flex-shrink: 0;
}

/* 이미지 확대 모달 */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.image-modal {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.modal-close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  z-index: 1;
  transition: all 0.2s;
}

.modal-close-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.modal-image {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

.modal-info {
  padding: 1rem;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.modal-author {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.modal-date {
  font-size: 12px;
  color: #9ca3af;
}

/* 모달 트랜지션 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 반응형 */
@media (max-width: 480px) {
  .guestbook-grid {
    grid-template-columns: 1fr;
  }

  .post-it {
    transform: none !important;
  }
}

@media (min-width: 641px) {
  .guestbook-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .guestbook-content {
    padding: 2rem;
  }
}
</style>
