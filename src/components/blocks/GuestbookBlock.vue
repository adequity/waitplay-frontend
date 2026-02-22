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

    <!-- 방명록 레이아웃 -->
    <LoadingSpinner v-if="isLoadingMessages" message="방명록을 불러오는 중..." :size="60" />

    <!-- 스와이프 모드 -->
    <GuestbookSwipeView
      v-else-if="listStyle === 'swipe'"
      :messages="messages"
      :is-authenticated="isAuthenticated"
      :qr-code-id="qrCodeId"
      :display-mode="displayMode"
      :data="data"
      @open-detail="openDetailModal"
      @write="isActionSheetOpen = true"
      @go-to-login="goToLogin"
    />

    <!-- Masonry 모드 (기본) -->
    <div v-else class="guestbook-masonry">
      <!-- 왼쪽 컬럼 -->
      <div class="masonry-column">
        <!-- 작성하기 버튼 (로그인 시) -->
        <div v-if="isAuthenticated" class="masonry-card write-card" @click="isActionSheetOpen = true">
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
          :style="{ backgroundColor: getCardBgHex(message.color) }"
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
          :style="{ backgroundColor: getCardBgHex(message.color) }"
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

    <!-- 작성 방식 선택 하단 시트 -->
    <Teleport to="body">
      <Transition name="sheet-overlay">
        <div v-if="isActionSheetOpen" class="action-sheet-overlay" @click="isActionSheetOpen = false">
          <Transition name="sheet-slide">
            <div v-if="isActionSheetOpen" class="action-sheet" @click.stop>
              <div class="sheet-handle"></div>
              <div class="sheet-options">
                <button class="sheet-option" @click="openWithCamera">
                  <div class="sheet-option-icon camera-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                  <div class="sheet-option-text">
                    <span class="sheet-option-title">촬영하기</span>
                    <span class="sheet-option-desc">사진을 찍고 꾸며보세요</span>
                  </div>
                </button>
                <button class="sheet-option" @click="openWithDraw">
                  <div class="sheet-option-icon draw-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                      <path d="M2 2l7.586 7.586"/>
                    </svg>
                  </div>
                  <div class="sheet-option-text">
                    <span class="sheet-option-title">꾸미기</span>
                    <span class="sheet-option-desc">자유롭게 그림을 그려보세요</span>
                  </div>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 템플릿(액자) 선택 화면 -->
    <Teleport to="body">
      <Transition name="template-picker-overlay">
        <div v-if="isTemplatePickerOpen" class="template-picker-overlay">
          <Transition name="template-picker-slide">
            <div v-if="isTemplatePickerOpen" class="template-picker-screen">
              <!-- 상단 바 -->
              <div class="template-picker-header">
                <button class="template-picker-close" @click="isTemplatePickerOpen = false">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
                <h3 class="template-picker-title">액자를 골라주세요</h3>
                <div style="width: 22px;"></div>
              </div>

              <!-- 템플릿 그리드 -->
              <div class="template-picker-body">
                <div v-if="isLoadingTemplates" class="template-picker-loading">
                  <div class="template-loading-spinner"></div>
                </div>
                <div v-else class="template-picker-grid">
                  <!-- 없음 -->
                  <button
                    class="template-picker-card"
                    :class="{ selected: !selectedTemplate }"
                    @click="onTemplateSelected(null)"
                  >
                    <div class="template-card-preview none-preview">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5" stroke-linecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                      </svg>
                    </div>
                    <span class="template-card-name">없음</span>
                  </button>
                  <!-- 템플릿 목록 -->
                  <button
                    v-for="tmpl in availableTemplates"
                    :key="tmpl.id"
                    class="template-picker-card"
                    :class="{ selected: selectedTemplate?.id === tmpl.id }"
                    @click="onTemplateSelected(tmpl)"
                  >
                    <div class="template-card-preview">
                      <img :src="tmpl.thumbnailUrl || tmpl.imageUrl" :alt="tmpl.name" />
                    </div>
                    <span class="template-card-name">{{ tmpl.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

    <!-- 그리기 모달 -->
    <DrawingModal
      :visible="isDrawingModalOpen"
      :qr-code-id="qrCodeId"
      :display-mode="displayMode"
      :initial-mode="drawingInitialMode"
      :selected-template="selectedTemplate"
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
import GuestbookSwipeView from './guestbook/GuestbookSwipeView.vue'
import { getCardBgHex } from '@/constants/guestbookColors'

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
const listStyle = computed(() => props.data.listStyle || 'masonry')

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
const isActionSheetOpen = ref(false)
const isDrawingModalOpen = ref(false)
const drawingInitialMode = ref<'camera' | 'draw'>('draw')

// 템플릿(액자) 선택
const isTemplatePickerOpen = ref(false)
const isLoadingTemplates = ref(false)
const availableTemplates = ref<any[]>([])
const selectedTemplate = ref<any>(null)
const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

const fetchTemplates = async () => {
  if (availableTemplates.value.length > 0) return // 이미 로드됨
  isLoadingTemplates.value = true
  try {
    const response = await fetch(`${API_URL}/api/guestbook/templates`)
    if (!response.ok) return
    const data = await response.json()
    availableTemplates.value = data.templates || []
  } catch {
    // 로드 실패해도 진행 가능
  } finally {
    isLoadingTemplates.value = false
  }
}

const openWithCamera = () => {
  isActionSheetOpen.value = false
  drawingInitialMode.value = 'camera'
  selectedTemplate.value = null
  fetchTemplates()
  isTemplatePickerOpen.value = true
}

const openWithDraw = () => {
  isActionSheetOpen.value = false
  drawingInitialMode.value = 'draw'
  selectedTemplate.value = null
  fetchTemplates()
  isTemplatePickerOpen.value = true
}

const onTemplateSelected = (tmpl: any) => {
  selectedTemplate.value = tmpl
  isTemplatePickerOpen.value = false
  isDrawingModalOpen.value = true
}
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

/* ===== 하단 시트 ===== */
.action-sheet-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.action-sheet {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px max(20px, env(safe-area-inset-bottom));
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}
.sheet-option:active {
  background: #f3f4f6;
  transform: scale(0.98);
}

.sheet-option-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.camera-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.draw-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.sheet-option-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sheet-option-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}
.sheet-option-desc {
  font-size: 13px;
  color: #6b7280;
}

/* 시트 트랜지션 */
.sheet-overlay-enter-active { transition: opacity 0.25s ease; }
.sheet-overlay-leave-active { transition: opacity 0.2s ease; }
.sheet-overlay-enter-from,
.sheet-overlay-leave-to { opacity: 0; }

.sheet-slide-enter-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.sheet-slide-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1); }
.sheet-slide-enter-from,
.sheet-slide-leave-to { transform: translateY(100%); }

/* ===== 템플릿 선택 화면 ===== */
.template-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #fff;
}

.template-picker-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  border-bottom: 1px solid #f0f0f0;
}

.template-picker-close {
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-picker-title {
  font-size: 17px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.template-picker-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px;
  -webkit-overflow-scrolling: touch;
}

.template-picker-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.template-loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #4ecdc4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.template-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.template-picker-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 0;
  background: none;
  border: 2px solid transparent;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.template-picker-card.selected {
  border-color: #4ecdc4;
  background: rgba(78, 205, 196, 0.06);
}

.template-picker-card:active {
  transform: scale(0.96);
}

.template-card-preview {
  width: 100%;
  aspect-ratio: 9 / 16;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-card-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-card-preview.none-preview {
  background: #f9fafb;
  border: 1px dashed #d1d5db;
}

.template-card-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.2;
  padding: 0 4px 8px;
}

/* 템플릿 선택 화면 트랜지션 */
.template-picker-overlay-enter-active { transition: opacity 0.25s ease; }
.template-picker-overlay-leave-active { transition: opacity 0.2s ease; }
.template-picker-overlay-enter-from,
.template-picker-overlay-leave-to { opacity: 0; }

.template-picker-slide-enter-active { transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.template-picker-slide-leave-active { transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1); }
.template-picker-slide-enter-from,
.template-picker-slide-leave-to { transform: translateY(100%); }
</style>
