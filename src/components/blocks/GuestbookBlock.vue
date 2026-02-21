<template>
  <div
    class="guestbook-block"
    ref="blockRef"
    :class="{ 'bg-loaded': isBgLoaded }"
    :style="{
      '--text-color': data.textColor || '#374151',
      '--bg-overlay': getBackgroundOverlay(),
      backgroundColor: computedBackgroundColor
    }"
  >
    <!-- 배경 이미지 지연 로딩 레이어 -->
    <div
      v-if="data.backgroundImageUrl"
      class="guestbook-bg"
      :class="{ 'bg-loaded': isBgLoaded }"
      :style="bgStyle"
    ></div>
    <!-- 배경 오버레이 -->
    <div v-if="data.backgroundImageUrl && data.backgroundOverlay" class="bg-overlay"></div>

    <h2 class="guestbook-title">{{ data.title }}</h2>

    <!-- 방명록 Masonry 레이아웃 -->
    <LoadingSpinner v-if="isLoadingMessages" message="방명록을 불러오는 중..." :size="60" />

    <div v-else class="guestbook-masonry">
      <!-- 왼쪽 컬럼 -->
      <div class="masonry-column">
        <!-- 작성하기 버튼 (로그인 시) -->
        <div v-if="isAuthenticated" class="masonry-card write-card" @click="isDrawingModalOpen = true">
          <div class="write-card-content">
            <img src="/write-icon.png" alt="작성하기" class="card-icon" />
          </div>
        </div>
        <!-- 로그인 유도 카드 -->
        <div v-else class="masonry-card login-card">
          <div class="login-card-content">
            <p>로그인하고<br/>방명록을 남겨보세요!</p>
            <button class="login-card-btn" @click="goToLogin">로그인</button>
          </div>
        </div>

        <!-- 왼쪽 컬럼 메시지들 (짝수 인덱스: 0, 2, 4) -->
        <div
          v-for="(message, index) in leftColumnMessages"
          :key="message.id"
          class="masonry-card message-card"
          :class="[
            `card-size-${getCardSize(index * 2)}`,
            { 'my-post': isMyMessage(message) }
          ]"
          @click="openDetailModal(message)"
        >
          <div class="card-image-wrapper">
            <img
              v-if="message.imageUrl"
              :src="message.imageUrl"
              :alt="`${message.userName}의 방명록`"
              class="card-image"
              loading="lazy"
              decoding="async"
            />
            <span v-if="isMyMessage(message)" class="card-my-badge">MY</span>
          </div>
          <div class="card-info">
            <span class="card-author">{{ message.userName }}</span>
            <button
              class="card-like-btn"
              :class="{ 'liked': message.isLikedByMe }"
              @click.stop="handleLike(message)"
              :disabled="likingMessageId === message.id"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ message.likeCount || 0 }}</span>
            </button>
          </div>
        </div>

        <!-- 더보기 버튼 (왼쪽 하단) -->
        <div class="masonry-card more-card" @click="goToFullGuestbook">
          <div class="more-card-content">
            <img src="/more-icon.png" alt="더보기" class="card-icon" />
          </div>
        </div>
      </div>

      <!-- 오른쪽 컬럼 -->
      <div class="masonry-column">
        <!-- 오른쪽 컬럼 메시지들 (3개: 인덱스 0, 2, 4) -->
        <div
          v-for="(message, index) in rightColumnMessages"
          :key="message.id"
          class="masonry-card message-card"
          :class="[
            `card-size-${getCardSize(index * 2 + 1)}`,
            { 'my-post': isMyMessage(message) }
          ]"
          @click="openDetailModal(message)"
        >
          <div class="card-image-wrapper">
            <img
              v-if="message.imageUrl"
              :src="message.imageUrl"
              :alt="`${message.userName}의 방명록`"
              class="card-image"
              loading="lazy"
              decoding="async"
            />
            <span v-if="isMyMessage(message)" class="card-my-badge">MY</span>
          </div>
          <div class="card-info">
            <span class="card-author">{{ message.userName }}</span>
            <button
              class="card-like-btn"
              :class="{ 'liked': message.isLikedByMe }"
              @click.stop="handleLike(message)"
              :disabled="likingMessageId === message.id"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" :fill="message.isLikedByMe ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{{ message.likeCount || 0 }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 그리기 모달 -->
    <DrawingModal
      :visible="isDrawingModalOpen"
      :qr-code-id="qrCodeId"
      :display-mode="displayMode"
      @close="isDrawingModalOpen = false"
      @submitted="loadMessages"
    />

    <!-- 상세 보기 모달 -->
    <MessageDetailModal
      :visible="isDetailModalOpen"
      :message="selectedMessageForDetail"
      @close="closeDetailModal"
      @like-toggled="onLikeToggled"
      @share="onShareFromDetail"
    />

    <!-- 공유 모달 -->
    <ShareModal
      :visible="isShareModalOpen"
      :qr-code-id="qrCodeId"
      :message-id="selectedMessageForShare?.id ?? null"
      :user-name="selectedMessageForShare?.userName"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import type { GuestbookBlockData } from '@/types/blocks'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import DrawingModal from './guestbook/DrawingModal.vue'
import MessageDetailModal from './guestbook/MessageDetailModal.vue'
import ShareModal from './guestbook/ShareModal.vue'

interface Props {
  data: GuestbookBlockData
  qrCodeId: string
  isPreview?: boolean
  fallbackBackgroundColor?: string
}

const props = defineProps<Props>()
const router = useRouter()
const authStore = useAuthStore()

// 배경 이미지 지연 로딩
const blockRef = ref<HTMLElement | null>(null)
const isBgLoaded = ref(false)
let bgObserver: IntersectionObserver | null = null

// 배경색 계산
const computedBackgroundColor = computed(() => {
  if (props.data.backgroundImageUrl) return undefined
  if (props.data.backgroundColor) return props.data.backgroundColor
  if (props.fallbackBackgroundColor) return props.fallbackBackgroundColor
  return undefined
})

const bgStyle = computed(() => {
  if (!isBgLoaded.value || !props.data.backgroundImageUrl) return {}
  return {
    backgroundImage: `url(${props.data.backgroundImageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
})

onMounted(() => {
  if (!props.data.backgroundImageUrl) {
    isBgLoaded.value = true
  } else {
    const preloadBg = () => {
      const img = new Image()
      img.onload = () => { isBgLoaded.value = true }
      img.onerror = () => { isBgLoaded.value = true }
      img.src = props.data.backgroundImageUrl!
    }

    if ('IntersectionObserver' in window && blockRef.value) {
      bgObserver = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            preloadBg()
            bgObserver?.disconnect()
          }
        },
        { rootMargin: '200px' }
      )
      bgObserver.observe(blockRef.value)
    } else {
      preloadBg()
    }
  }

  if (!props.isPreview) {
    loadMessages()
  }
})

onUnmounted(() => {
  bgObserver?.disconnect()
})

const isAuthenticated = computed(() => authStore.isAuthenticated)
const currentUserId = computed(() => authStore.user?.id)

const isMyMessage = (message: any) => {
  return currentUserId.value && message.userId === currentUserId.value
}

// 표시 모드
const displayMode = computed(() => props.data.displayMode || 'postit')

// 배경 오버레이 계산
const getBackgroundOverlay = () => {
  const overlay = props.data.backgroundOverlay || 0
  if (overlay < 0) return `rgba(0, 0, 0, ${Math.abs(overlay) / 100})`
  if (overlay > 0) return `rgba(255, 255, 255, ${overlay / 100})`
  return 'transparent'
}

// 방명록 메시지 목록
const messages = ref<any[]>([])
const isLoadingMessages = ref(false)
// 좋아요 관련
const likingMessageId = ref<string | null>(null)

// 모달 상태
const isDrawingModalOpen = ref(false)
const isDetailModalOpen = ref(false)
const isShareModalOpen = ref(false)
const selectedMessageForDetail = ref<any>(null)
const selectedMessageForShare = ref<any>(null)

// Masonry 레이아웃용 메시지 분배
const masonryMessages = computed(() => messages.value.slice(0, 5))
const leftColumnMessages = computed(() =>
  masonryMessages.value.filter((_, index) => index === 1 || index === 3)
)
const rightColumnMessages = computed(() =>
  masonryMessages.value.filter((_, index) => index === 0 || index === 2 || index === 4)
)

const getCardSize = (index: number): string => {
  const sizes = ['small', 'large', 'medium', 'large', 'small'] as const
  return sizes[index % sizes.length] ?? 'small'
}

// 방명록 메시지 로드
const loadMessages = async () => {
  if (!props.qrCodeId) return

  isLoadingMessages.value = true
  try {
    const response = await guestbookService.getMessages(props.qrCodeId)
    messages.value = response.map((msg: any) => ({ ...msg, stickers: [] }))
  } catch {
    messages.value = []
  } finally {
    isLoadingMessages.value = false
  }
}

// 상세 보기 모달
const openDetailModal = (message: any) => {
  selectedMessageForDetail.value = message
  isDetailModalOpen.value = true
}

const closeDetailModal = () => {
  isDetailModalOpen.value = false
  selectedMessageForDetail.value = null
}

// 상세 모달에서 좋아요 변경 시 목록 동기화
const onLikeToggled = (payload: { id: string; isLiked: boolean; likeCount: number }) => {
  const msg = messages.value.find(m => m.id === payload.id)
  if (msg) {
    msg.isLikedByMe = payload.isLiked
    msg.likeCount = payload.likeCount
  }
}

// 상세 모달에서 공유 클릭
const onShareFromDetail = (message: any) => {
  shareMessage(message)
}

// 공유
const shareMessage = async (message: any) => {
  const shareUrl = `${window.location.origin}/guestbook?qr=${props.qrCodeId}&highlight=${message.id}`
  const shareText = `${message.userName}님의 방명록을 확인해보세요!`

  if (navigator.share) {
    try {
      await navigator.share({ title: '방명록 공유', text: shareText, url: shareUrl })
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        selectedMessageForShare.value = message
        isShareModalOpen.value = true
      }
    }
  } else {
    selectedMessageForShare.value = message
    isShareModalOpen.value = true
  }
}

const closeShareModal = () => {
  isShareModalOpen.value = false
  selectedMessageForShare.value = null
}

// 좋아요 토글 (목록에서 직접)
const handleLike = async (message: any) => {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) goToLogin()
    return
  }

  if (likingMessageId.value) return
  likingMessageId.value = message.id

  try {
    const response = await guestbookService.toggleLike(message.id)
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch (error) {
    console.error('Failed to toggle like:', error)
    alert('좋아요 처리에 실패했습니다.')
  } finally {
    likingMessageId.value = null
  }
}

// 네비게이션
const goToLogin = () => {
  const currentQr = router.currentRoute.value.query.qr
  router.push(currentQr ? `/login?qr=${currentQr}` : '/login')
}

const goToFullGuestbook = () => {
  const currentQr = router.currentRoute.value.query.qr
  if (currentQr) {
    router.push(`/guestbook?qr=${currentQr}`)
  }
}

</script>

<style scoped>
.guestbook-block {
  position: relative;
  padding: 2rem 1rem;
}

/* 배경 이미지 지연 로딩 레이어 */
.guestbook-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.guestbook-bg.bg-loaded {
  opacity: 1;
}

/* 배경 오버레이 */
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-overlay, transparent);
  pointer-events: none;
  z-index: 0;
}

.guestbook-block > *:not(.bg-overlay):not(.guestbook-bg) {
  position: relative;
  z-index: 1;
}

.guestbook-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-color, #1f2937);
  margin-bottom: 2rem;
  text-align: center;
}

/* ==================== */
/* Masonry 스타일 레이아웃 */
/* ==================== */
.guestbook-masonry {
  display: flex;
  gap: 10px;
  margin-top: 0.75rem;
}

.masonry-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 공통 카드 스타일 - 글래스모피즘 */
.masonry-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.masonry-card:active {
  transform: scale(0.97);
}

/* 작성하기 카드 */
.write-card {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.write-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.card-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
}

/* 로그인 유도 카드 */
.login-card {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card-content {
  text-align: center;
  padding: 1rem;
}

.login-card-content p {
  font-size: 14px;
  color: #374151;
  margin: 0 0 0.75rem 0;
  font-weight: 500;
  line-height: 1.4;
}

.login-card-btn {
  padding: 0.5rem 1.25rem;
  background: rgba(78, 205, 196, 0.9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-card-btn:hover {
  background: rgba(78, 205, 196, 1);
}

/* 메시지 카드 */
.message-card {
  position: relative;
}

.message-card.my-post {
  border: 2px solid rgba(78, 205, 196, 0.5);
}

.card-image-wrapper {
  position: relative;
  width: 100%;
}

.card-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 16px 16px 0 0;
}

.card-my-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(78, 205, 196, 0.9);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
}

.card-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
}

.card-author {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 60%;
}

.card-like-btn {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  color: #6b7280;
  font-size: 11px;
  transition: all 0.2s;
}

.card-like-btn.liked {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}

.card-like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 카드 크기 변형 */
.card-size-small .card-image { max-height: 120px; object-fit: cover; }
.card-size-medium .card-image { max-height: 160px; object-fit: cover; }
.card-size-large .card-image { max-height: 200px; object-fit: cover; }

/* 더보기 카드 */
.more-card {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

/* 모바일 최적화 */
@media (max-width: 640px) {
  .guestbook-block {
    padding: 1.5rem 0.75rem;
  }
}

/* 모달 트랜지션 (자식 컴포넌트에서 사용) */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
