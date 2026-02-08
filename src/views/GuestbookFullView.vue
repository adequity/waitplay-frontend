<template>
  <div class="store-profile-view">
    <!-- 헤더 -->
    <header class="page-header">
      <button @click="goBack" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <h1 class="page-title">{{ storeProfile?.storeName || '매장' }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 로딩 상태 -->
    <div v-if="isLoadingProfile" class="loading-state">
      <div class="spinner"></div>
      <span>매장 정보를 불러오는 중...</span>
    </div>

    <!-- 매장 프로필 섹션 -->
    <template v-else-if="storeProfile">
      <div class="profile-section">
        <!-- 프로필 헤더 (인스타그램 스타일) -->
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-gradient-ring">
              <div class="avatar-inner">
                <img
                  v-if="storeProfile.storeProfileImage"
                  :src="storeProfile.storeProfileImage"
                  :alt="storeProfile.storeName"
                  class="avatar-img"
                />
                <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item" @click="activeTab = 'feed'">
              <span class="stat-value">{{ storeProfile.guestbookCount }}</span>
              <span class="stat-label">게시물</span>
            </div>
            <div class="stat-item" @click="activeTab = 'followers'">
              <span class="stat-value">{{ storeProfile.followerCount }}</span>
              <span class="stat-label">팔로워</span>
            </div>
          </div>
        </div>

        <!-- 매장 이름 & 설명 -->
        <div class="profile-info">
          <h2 class="store-name">{{ storeProfile.storeName }}</h2>
          <p v-if="storeProfile.description" class="store-description">{{ storeProfile.description }}</p>
        </div>

        <!-- 팔로우 버튼 -->
        <div class="profile-actions">
          <button
            v-if="isAuthenticated"
            class="follow-btn"
            :class="{ following: storeProfile.isFollowing }"
            @click="toggleFollow"
            :disabled="isTogglingFollow"
          >
            <span v-if="isTogglingFollow" class="btn-spinner"></span>
            <template v-else>
              {{ storeProfile.isFollowing ? '팔로잉' : '팔로우' }}
            </template>
          </button>
          <button v-else class="follow-btn" @click="goToLogin">
            로그인하고 팔로우
          </button>
        </div>

        <!-- 탭 메뉴 -->
        <div class="profile-tabs">
          <button
            :class="['tab-btn', { active: activeTab === 'feed' }]"
            @click="activeTab = 'feed'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'followers' }]"
            @click="activeTab = 'followers'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            :class="['tab-btn', { active: activeTab === 'info' }]"
            @click="activeTab = 'info'"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="tab-content">
        <!-- 피드 탭 (방명록 그리드/피드) -->
        <div v-if="activeTab === 'feed'" class="feed-tab">
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
            <p class="empty-subtitle">첫 번째 방명록을 남겨보세요!</p>
          </div>

          <!-- 인스타그램 스타일 피드 -->
          <div v-else class="feed-list">
            <div
              v-for="message in messages"
              :key="message.id"
              class="feed-post"
            >
              <!-- 포스트 헤더 -->
              <div class="feed-post-header">
                <div class="feed-author">
                  <div class="feed-author-avatar">
                    <div class="avatar-gradient-ring-small">
                      <div class="avatar-inner-small">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div class="feed-author-info">
                    <p class="feed-author-name">{{ message.userName }}</p>
                    <p class="feed-timestamp">{{ formatRelativeDate(message.createdAt) }}</p>
                  </div>
                </div>
              </div>

              <!-- 콘텐츠 -->
              <div class="feed-content" @click="handleDoubleTap(message)">
                <div v-if="message.imageUrl" class="feed-image-wrapper">
                  <img
                    :src="message.imageUrl"
                    :alt="`${message.userName}의 방명록`"
                    class="feed-image"
                    loading="lazy"
                  />
                  <!-- 더블탭 하트 -->
                  <transition name="heart-pop">
                    <div v-if="doubleTapLikeId === message.id" class="double-tap-heart">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </transition>
                </div>

                <div
                  v-else-if="message.message"
                  class="feed-postit"
                  :style="{ backgroundColor: getPostitColor(message.color) }"
                >
                  <p class="feed-postit-text">{{ message.message }}</p>
                  <transition name="heart-pop">
                    <div v-if="doubleTapLikeId === message.id" class="double-tap-heart">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                  </transition>
                </div>
              </div>

              <!-- 액션 바 -->
              <div class="feed-actions">
                <div class="feed-action-left">
                  <button
                    class="feed-action-btn"
                    :class="{ liked: message.isLikedByMe }"
                    @click="handleLike(message)"
                  >
                    <svg v-if="message.isLikedByMe" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 좋아요 수 -->
              <div v-if="message.likeCount > 0" class="feed-likes">
                <span>좋아요 {{ message.likeCount }}개</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 팔로워 탭 -->
        <div v-if="activeTab === 'followers'" class="followers-tab">
          <div v-if="isLoadingFollowers" class="loading-state">
            <div class="spinner"></div>
            <span>팔로워를 불러오는 중...</span>
          </div>

          <div v-else-if="followers.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p class="empty-title">아직 팔로워가 없어요</p>
            <p class="empty-subtitle">첫 번째 팔로워가 되어주세요!</p>
          </div>

          <div v-else class="followers-list">
            <div
              v-for="follower in followers"
              :key="follower.userId"
              class="follower-item"
            >
              <div class="follower-avatar">
                <img v-if="follower.profileImage" :src="follower.profileImage" alt="" class="follower-img" />
                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="follower-info">
                <p class="follower-name">{{ follower.userName }}</p>
                <p class="follower-date">{{ formatRelativeDate(follower.followedAt) }}부터 팔로우</p>
              </div>
            </div>

            <!-- 더 불러오기 -->
            <div v-if="hasMoreFollowers" class="load-more">
              <button
                class="load-more-btn"
                :disabled="isLoadingMoreFollowers"
                @click="loadMoreFollowers"
              >
                <div v-if="isLoadingMoreFollowers" class="btn-spinner"></div>
                <span v-else>더 보기</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 매장 정보 탭 -->
        <div v-if="activeTab === 'info'" class="info-tab">
          <div class="info-section">
            <h3 class="info-section-title">매장 정보</h3>
            <div class="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7"/>
              </svg>
              <span>{{ storeProfile.storeName }}</span>
            </div>
            <div v-if="storeProfile.description" class="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="17" y1="10" x2="3" y2="10"/>
                <line x1="21" y1="6" x2="3" y2="6"/>
                <line x1="21" y1="14" x2="3" y2="14"/>
                <line x1="17" y1="18" x2="3" y2="18"/>
              </svg>
              <span>{{ storeProfile.description }}</span>
            </div>
          </div>

          <div class="info-section">
            <h3 class="info-section-title">통계</h3>
            <div class="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12"/>
                <path d="M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z"/>
              </svg>
              <span>방명록 {{ storeProfile.guestbookCount }}개</span>
            </div>
            <div class="info-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
              </svg>
              <span>팔로워 {{ storeProfile.followerCount }}명</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import type { StoreProfileResponse, FollowerInfo } from '@/services/followService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)

// QR 코드
const qrCode = computed(() => route.query.qr as string)

// 탭 상태
const activeTab = ref<'feed' | 'followers' | 'info'>('feed')

// 매장 프로필
const storeProfile = ref<StoreProfileResponse | null>(null)
const isLoadingProfile = ref(true)

// 방명록 메시지
const messages = ref<any[]>([])
const isLoadingMessages = ref(false)

// 팔로워
const followers = ref<FollowerInfo[]>([])
const isLoadingFollowers = ref(false)
const isLoadingMoreFollowers = ref(false)
const followersPage = ref(1)
const hasMoreFollowers = ref(false)

// 팔로우 토글
const isTogglingFollow = ref(false)

// 좋아요 관련
const likingMessageId = ref<string | null>(null)
const doubleTapLikeId = ref<string | null>(null)
const lastTapTime = ref<Record<string, number>>({})

// 매장 프로필 로드
const loadStoreProfile = async () => {
  if (!qrCode.value) {
    router.push('/customer')
    return
  }

  isLoadingProfile.value = true
  try {
    storeProfile.value = await followService.getStoreProfile(qrCode.value)
  } catch (error) {
    console.error('Failed to load store profile:', error)
    router.push('/customer')
  } finally {
    isLoadingProfile.value = false
  }
}

// 방명록 메시지 로드
const loadMessages = async () => {
  if (!qrCode.value) return

  isLoadingMessages.value = true
  try {
    messages.value = await guestbookService.getMessages(qrCode.value)
  } catch (error) {
    console.error('Failed to load messages:', error)
    messages.value = []
  } finally {
    isLoadingMessages.value = false
  }
}

// 팔로워 로드
const loadFollowers = async () => {
  if (!qrCode.value) return

  isLoadingFollowers.value = true
  followersPage.value = 1
  try {
    const response = await followService.getStoreFollowers(qrCode.value, 1, 20)
    followers.value = response.followers
    hasMoreFollowers.value = response.hasMore
  } catch (error) {
    console.error('Failed to load followers:', error)
    followers.value = []
  } finally {
    isLoadingFollowers.value = false
  }
}

// 팔로워 더 불러오기
const loadMoreFollowers = async () => {
  if (!qrCode.value || isLoadingMoreFollowers.value) return

  isLoadingMoreFollowers.value = true
  try {
    followersPage.value++
    const response = await followService.getStoreFollowers(qrCode.value, followersPage.value, 20)
    followers.value = [...followers.value, ...response.followers]
    hasMoreFollowers.value = response.hasMore
  } catch (error) {
    console.error('Failed to load more followers:', error)
  } finally {
    isLoadingMoreFollowers.value = false
  }
}

// 팔로우 토글
const toggleFollow = async () => {
  if (!qrCode.value || !storeProfile.value || isTogglingFollow.value) return

  isTogglingFollow.value = true
  try {
    if (storeProfile.value.isFollowing) {
      await followService.unfollowAdmin(qrCode.value)
      storeProfile.value.isFollowing = false
      storeProfile.value.followerCount--
    } else {
      await followService.followAdmin(qrCode.value)
      storeProfile.value.isFollowing = true
      storeProfile.value.followerCount++
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error)
  } finally {
    isTogglingFollow.value = false
  }
}

// 좋아요 핸들러
const handleLike = async (message: any) => {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) {
      router.push(`/login?qr=${qrCode.value}`)
    }
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
  } finally {
    likingMessageId.value = null
  }
}

// 더블탭 좋아요
const handleDoubleTap = async (message: any) => {
  const now = Date.now()
  const lastTap = lastTapTime.value[message.id] || 0
  const DOUBLE_TAP_DELAY = 300

  if (now - lastTap < DOUBLE_TAP_DELAY) {
    if (!message.isLikedByMe) {
      doubleTapLikeId.value = message.id
      setTimeout(() => { doubleTapLikeId.value = null }, 1000)
      await handleLike(message)
    } else {
      doubleTapLikeId.value = message.id
      setTimeout(() => { doubleTapLikeId.value = null }, 1000)
    }
  }

  lastTapTime.value[message.id] = now
}

// 포스트잇 색상
const getPostitColor = (color: string): string => {
  const colors: Record<string, string> = {
    yellow: '#fff9c4',
    pink: '#fce7f3',
    blue: '#dbeafe',
    green: '#d1fae5'
  }
  return colors[color] || '#fff9c4'
}

// 상대 시간 포맷
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

const goBack = () => {
  if (qrCode.value) {
    router.push(`/customer?qr=${qrCode.value}`)
  } else {
    router.back()
  }
}

const goToLogin = () => {
  router.push(`/login?qr=${qrCode.value}`)
}

// 탭 변경 시 데이터 로드
watch(activeTab, async (newTab) => {
  if (newTab === 'feed' && messages.value.length === 0) {
    await loadMessages()
  } else if (newTab === 'followers' && followers.value.length === 0) {
    await loadFollowers()
  }
})

onMounted(async () => {
  await loadStoreProfile()
  // 기본 탭인 피드 데이터 로드
  await loadMessages()
})
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
  cursor: pointer;
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
  padding: 0 1rem;
}

.store-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 0.25rem;
}

.store-description {
  font-size: 14px;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

/* 팔로우 버튼 */
.profile-actions {
  padding: 1rem;
}

.follow-btn {
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 34px;
}

.follow-btn:not(.following) {
  background: #0095f6;
  color: white;
  border: none;
}

.follow-btn:not(.following):hover {
  background: #1877f2;
}

.follow-btn.following {
  background: white;
  color: #262626;
  border: 1px solid #dbdbdb;
}

.follow-btn.following:hover {
  background: #fafafa;
}

.follow-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.follow-btn.following .btn-spinner {
  border: 2px solid #dbdbdb;
  border-top-color: #262626;
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
  background: #fafafa;
  position: relative;
}

.feed-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
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

/* 더블탭 하트 */
.double-tap-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  pointer-events: none;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
}

.heart-pop-enter-active {
  animation: heartPop 0.6s ease-out;
}

.heart-pop-leave-active {
  animation: heartFade 0.4s ease-out;
}

@keyframes heartPop {
  0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
  15% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
  30% { transform: translate(-50%, -50%) scale(0.95); }
  45% { transform: translate(-50%, -50%) scale(1.05); }
  60%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes heartFade {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
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

/* 팔로워 리스트 */
.followers-list {
  padding: 0.5rem 0;
}

.follower-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
}

.follower-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e8e;
  overflow: hidden;
  flex-shrink: 0;
}

.follower-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follower-info {
  flex: 1;
}

.follower-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.follower-date {
  font-size: 12px;
  color: #8e8e8e;
  margin: 0;
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

/* 매장 정보 탭 */
.info-tab {
  padding: 1rem;
}

.info-section {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.info-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0 0 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: #262626;
  font-size: 14px;
}

.info-item svg {
  color: #8e8e8e;
  flex-shrink: 0;
}
</style>
