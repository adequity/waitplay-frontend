<template>
  <div class="store-profile-view">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">{{ profile?.nickname || '프로필' }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="isLoadingProfile" class="loading-state">
      <div class="spinner"></div>
      <span>프로필을 불러오는 중...</span>
    </div>

    <!-- 에러 -->
    <div v-else-if="error" class="empty-state" style="padding-top: 4rem;">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
        <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"/>
        <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"/>
      </svg>
      <p class="empty-title">{{ error }}</p>
      <button @click="goBack" class="load-more-btn" style="margin-top: 0.5rem;">돌아가기</button>
    </div>

    <!-- 프로필 + 피드 -->
    <template v-else-if="profile">
      <div class="profile-section">
        <!-- 프로필 헤더 (인스타그램 스타일) -->
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-gradient-ring">
              <div class="avatar-inner">
                <img
                  v-if="profile.profileImage"
                  :src="profile.profileImage"
                  :alt="profile.nickname"
                  class="avatar-img"
                />
                <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-value">{{ profile.totalMessages }}</span>
              <span class="stat-label">게시물</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ formatJoinDate(profile.createdAt) }}</span>
              <span class="stat-label">가입</span>
            </div>
          </div>
        </div>

        <!-- 유저 이름 -->
        <div class="profile-info">
          <h2 class="store-name">{{ profile.nickname }}</h2>
        </div>

        <!-- 탭 메뉴 (게시물 탭만) -->
        <div class="profile-tabs">
          <button class="tab-btn active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="tab-content">
        <div class="feed-tab">
          <div v-if="isLoadingMessages" class="loading-state">
            <div class="spinner"></div>
            <span>방명록을 불러오는 중...</span>
          </div>

          <div v-else-if="messages.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
            </svg>
            <p class="empty-title">아직 방명록이 없어요</p>
            <p class="empty-subtitle">작성한 방명록이 여기에 표시됩니다</p>
          </div>

          <!-- 인스타그램 스타일 피드 -->
          <div v-else class="feed-list">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="feed-post"
            >
              <!-- 포스트 헤더 -->
              <div class="feed-post-header">
                <div class="feed-author">
                  <div class="feed-author-avatar">
                    <div class="avatar-gradient-ring-small">
                      <div class="avatar-inner-small">
                        <img
                          v-if="profile.profileImage"
                          :src="profile.profileImage"
                          :alt="profile.nickname"
                          class="avatar-img-small"
                        />
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="feed-author-info">
                    <p class="feed-author-name">{{ profile.nickname }}</p>
                    <p class="feed-timestamp">{{ formatRelativeDate(msg.createdAt) }} · {{ msg.storeName }}</p>
                  </div>
                </div>
              </div>

              <!-- 콘텐츠 -->
              <div class="feed-content" @click="openDetail(msg)">
                <div v-if="msg.imageUrl" class="feed-image-wrapper">
                  <img
                    :src="msg.imageUrl"
                    :alt="`${profile.nickname}의 방명록`"
                    class="feed-image"
                    loading="lazy"
                  />
                </div>

                <div
                  v-else-if="msg.message"
                  class="feed-postit"
                  :style="{ background: getCardBg(msg.color) }"
                >
                  <p class="feed-postit-text">{{ msg.message }}</p>
                </div>
              </div>

              <!-- 액션 바 -->
              <div class="feed-actions">
                <div class="feed-action-left">
                  <button
                    class="feed-action-btn"
                    :class="{ liked: (msg as any).isLikedByMe }"
                    @click="handleLike(msg)"
                  >
                    <svg v-if="(msg as any).isLikedByMe" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 좋아요 수 -->
              <div v-if="msg.likeCount > 0" class="feed-likes">
                <span>좋아요 {{ msg.likeCount }}개</span>
              </div>
            </div>
          </div>

          <!-- 더보기 -->
          <div v-if="hasMore" class="load-more">
            <button
              class="load-more-btn"
              :disabled="isLoadingMessages"
              @click="loadMore"
            >
              <div v-if="isLoadingMessages" class="btn-spinner"></div>
              <span v-else>더 보기</span>
            </button>
          </div>
        </div>
      </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import type { UserPublicProfile, MyGuestbookMessageResponse } from '@/services/guestbookService'
import { getCardBg } from '@/constants/guestbookColors'
import MessageDetailModal from '@/components/blocks/guestbook/MessageDetailModal.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

const profile = ref<UserPublicProfile | null>(null)
const messages = ref<MyGuestbookMessageResponse[]>([])
const isLoadingProfile = ref(true)
const isLoadingMessages = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const hasMore = ref(false)

const showDetail = ref(false)
const selectedMessage = ref<any>(null)
const likingMessageId = ref<string | null>(null)

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
  } catch {
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

async function handleLike(message: any) {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) {
      router.push('/login')
    }
    return
  }

  if (likingMessageId.value) return
  likingMessageId.value = message.id

  try {
    const response = await guestbookService.toggleLike(message.id)
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch {
    // silent
  } finally {
    likingMessageId.value = null
  }
}

function onLikeToggled(payload: { id: string; isLiked: boolean; likeCount: number }) {
  const msg = messages.value.find(m => m.id === payload.id)
  if (msg) {
    msg.likeCount = payload.likeCount;
    (msg as any).isLikedByMe = payload.isLiked
  }
}

function onShare() {}

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

const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))

  if (diffInHours < 1) return '방금 전'
  if (diffInHours < 24) return `${diffInHours}시간 전`
  if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}일 전`
  if (diffInHours < 24 * 30) return `${Math.floor(diffInHours / (24 * 7))}주 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.store-profile-view {
  min-height: 100vh;
  background: #fafafa;
}

/* 헤더 */
.page-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: white;
  border-bottom: 1px solid #efefef;
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
  color: #262626;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f5f5f5;
}

.page-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.header-spacer {
  width: 40px;
}

/* 로딩 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 1rem;
  color: #8e8e8e;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #efefef;
  border-top-color: #262626;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 프로필 섹션 */
.profile-section {
  background: white;
  padding-bottom: 0;
}

.profile-header {
  display: flex;
  align-items: center;
  padding: 1.5rem 1rem 1rem;
  gap: 2rem;
}

.profile-avatar {
  flex-shrink: 0;
}

.avatar-gradient-ring {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  overflow: hidden;
  color: #8e8e8e;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-stats {
  display: flex;
  gap: 2rem;
  flex: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
}

.stat-label {
  font-size: 13px;
  color: #8e8e8e;
}

/* 프로필 정보 */
.profile-info {
  padding: 0 1rem 0.75rem;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

/* 탭 메뉴 */
.profile-tabs {
  display: flex;
  border-top: 1px solid #efefef;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background: none;
  border: none;
  border-bottom: 1px solid transparent;
  cursor: pointer;
  color: #8e8e8e;
  transition: all 0.2s;
}

.tab-btn.active {
  color: #262626;
  border-bottom-color: #262626;
}

/* 탭 컨텐츠 */
.tab-content {
  min-height: 300px;
}

/* 빈 상태 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  gap: 0.5rem;
  text-align: center;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0.5rem 0 0;
}

.empty-subtitle {
  font-size: 14px;
  color: #8e8e8e;
  margin: 0;
}

/* 피드 리스트 */
.feed-list {
  display: flex;
  flex-direction: column;
}

.feed-post {
  background: white;
  border-bottom: 1px solid #efefef;
}

.feed-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
}

.feed-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feed-author-avatar {
  flex-shrink: 0;
}

.avatar-gradient-ring-small {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner-small {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  color: #8e8e8e;
  overflow: hidden;
}

.avatar-img-small {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feed-author-info {
  display: flex;
  flex-direction: column;
}

.feed-author-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.feed-timestamp {
  font-size: 12px;
  color: #8e8e8e;
  margin: 0;
}

/* 피드 콘텐츠 */
.feed-content {
  position: relative;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.feed-image-wrapper {
  width: 100%;
  aspect-ratio: 9 / 13;
  background: #fafafa;
  position: relative;
  overflow: hidden;
}

.feed-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.feed-postit {
  width: 100%;
  min-height: 200px;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.feed-postit-text {
  font-size: 1.125rem;
  font-weight: 500;
  color: #262626;
  margin: 0;
  text-align: center;
  line-height: 1.6;
  word-break: break-word;
  max-width: 280px;
}

/* 액션 바 */
.feed-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
}

.feed-action-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feed-action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  margin: -0.5rem;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.feed-action-btn:active {
  transform: scale(0.85);
}

.feed-action-btn.liked {
  color: #ed4956;
  animation: likeAnimation 0.3s ease;
}

@keyframes likeAnimation {
  0% { transform: scale(1); }
  25% { transform: scale(1.2); }
  50% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

/* 좋아요 수 */
.feed-likes {
  padding: 0 1rem 0.75rem;
}

.feed-likes span {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
}

/* 더 불러오기 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 1rem;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem;
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  cursor: pointer;
  transition: all 0.15s;
}

.load-more-btn:hover:not(:disabled) {
  background: #fafafa;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #dbdbdb;
  border-top-color: #262626;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
