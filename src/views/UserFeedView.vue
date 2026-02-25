<template>
  <div class="user-feed-page">
    <!-- 상단 바 -->
    <header class="feed-header">
      <button class="back-btn" @click="goBack">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <h1 class="feed-title">{{ profile?.nickname || '프로필' }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 로딩 -->
    <div v-if="isLoadingProfile" class="feed-loading">
      <div class="loading-spinner"></div>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="feed-error">
      <p>{{ error }}</p>
      <button @click="goBack" class="error-back-btn">돌아가기</button>
    </div>

    <!-- 프로필 + 피드 -->
    <template v-else-if="profile">
      <!-- 프로필 영역 -->
      <section class="profile-section">
        <div class="profile-avatar-area">
          <img
            v-if="profile.profileImage"
            :src="profile.profileImage"
            :alt="profile.nickname"
            class="profile-avatar"
          />
          <div v-else class="profile-avatar-placeholder">
            {{ profile.nickname?.charAt(0) || '?' }}
          </div>
        </div>
        <div class="profile-info">
          <h2 class="profile-nickname">{{ profile.nickname }}</h2>
          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ profile.totalMessages }}</span>
              <span class="stat-label">방명록</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatJoinDate(profile.createdAt) }}</span>
              <span class="stat-label">가입</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 구분선 -->
      <div class="feed-divider"></div>

      <!-- 방명록 그리드 -->
      <section class="messages-section">
        <div v-if="messages.length === 0 && !isLoadingMessages" class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.4">
            <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
          <p>작성한 방명록이 없습니다</p>
        </div>

        <div v-else class="messages-grid">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-card"
            @click="openDetail(msg)"
          >
            <div class="card-inner" :class="`card--${msg.color || 'white'}`">
              <img
                v-if="msg.imageUrl"
                :src="msg.imageUrl"
                :alt="'방명록'"
                class="card-image"
                loading="lazy"
                decoding="async"
              />
              <p v-else-if="msg.message" class="card-text">{{ msg.message }}</p>
            </div>
            <div class="card-meta">
              <span class="card-store">{{ msg.storeName }}</span>
              <span class="card-likes" v-if="msg.likeCount > 0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {{ msg.likeCount }}
              </span>
            </div>
          </div>
        </div>

        <!-- 더보기 버튼 -->
        <div v-if="hasMore" class="load-more">
          <button @click="loadMore" :disabled="isLoadingMessages" class="load-more-btn">
            <span v-if="isLoadingMessages" class="loading-spinner-small"></span>
            <span v-else>더보기</span>
          </button>
        </div>
      </section>
    </template>

    <!-- 상세 모달 -->
    <MessageDetailModal
      :visible="showDetail"
      :message="selectedMessage"
      @close="showDetail = false"
      @like-toggled="onLikeToggled"
      @share="onShare"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import guestbookService from '@/services/guestbookService'
import type { UserPublicProfile, MyGuestbookMessageResponse } from '@/services/guestbookService'
import MessageDetailModal from '@/components/blocks/guestbook/MessageDetailModal.vue'

const route = useRoute()
const router = useRouter()

const profile = ref<UserPublicProfile | null>(null)
const messages = ref<MyGuestbookMessageResponse[]>([])
const isLoadingProfile = ref(true)
const isLoadingMessages = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const hasMore = ref(false)

const showDetail = ref(false)
const selectedMessage = ref<any>(null)

const userId = route.params.userId as string

onMounted(async () => {
  await loadProfile()
  if (profile.value) {
    await loadMessages()
  }
})

async function loadProfile() {
  isLoadingProfile.value = true
  error.value = null
  try {
    profile.value = await guestbookService.getUserProfile(userId)
  } catch (e: any) {
    error.value = '사용자를 찾을 수 없습니다'
  } finally {
    isLoadingProfile.value = false
  }
}

async function loadMessages() {
  isLoadingMessages.value = true
  try {
    const res = await guestbookService.getUserMessages(userId, currentPage.value)
    messages.value.push(...res.messages)
    hasMore.value = res.hasMore
  } catch {
    // silent
  } finally {
    isLoadingMessages.value = false
  }
}

async function loadMore() {
  currentPage.value++
  await loadMessages()
}

function openDetail(msg: MyGuestbookMessageResponse) {
  selectedMessage.value = {
    ...msg,
    userId: userId,
    userName: profile.value?.nickname || '',
    userProfileImage: profile.value?.profileImage
  }
  showDetail.value = true
}

function onLikeToggled(payload: { id: string; isLiked: boolean; likeCount: number }) {
  const msg = messages.value.find(m => m.id === payload.id)
  if (msg) {
    msg.likeCount = payload.likeCount
  }
}

function onShare() {
  // 공유 기능 (필요시 구현)
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function formatJoinDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short' })
}
</script>

<style scoped>
.user-feed-page {
  min-height: 100vh;
  background: #0a0a0a;
  color: white;
}

/* 헤더 */
.feed-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: rgba(10, 10, 10, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 50%;
  transition: background 0.2s;
}
.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.feed-title {
  font-size: 17px;
  font-weight: 600;
}

.header-spacer {
  width: 40px;
}

/* 로딩 */
.feed-loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 에러 */
.feed-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.6);
}

.error-back-btn {
  padding: 10px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: white;
  cursor: pointer;
  transition: background 0.2s;
}
.error-back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 프로필 */
.profile-section {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px 20px;
}

.profile-avatar-area {
  flex-shrink: 0;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.profile-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.15);
}

.profile-info {
  flex: 1;
}

.profile-nickname {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px;
}

.profile-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

/* 구분선 */
.feed-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 20px;
}

/* 메시지 그리드 */
.messages-section {
  padding: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.messages-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}

.message-card {
  cursor: pointer;
  transition: opacity 0.2s;
}
.message-card:hover {
  opacity: 0.85;
}

.card-inner {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 카드 색상 */
.card--white { background: #ffffff; }
.card--yellow { background: #fff9c4; }
.card--pink { background: #fce4ec; }
.card--blue { background: #e3f2fd; }
.card--green { background: #e8f5e9; }
.card--orange { background: #fff3e0; }
.card--purple { background: #f3e5f5; }

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-text {
  font-size: 11px;
  color: #333;
  padding: 8px;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  text-align: center;
  margin: 0;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 2px;
}

.card-store {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}

.card-likes {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.5);
}

/* 더보기 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.load-more-btn {
  padding: 10px 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.load-more-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
.load-more-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 모바일 */
@media (max-width: 480px) {
  .messages-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2px;
  }

  .profile-section {
    padding: 20px 16px;
  }

  .profile-avatar,
  .profile-avatar-placeholder {
    width: 64px;
    height: 64px;
    font-size: 22px;
  }

  .profile-nickname {
    font-size: 18px;
  }
}
</style>
