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
              <span class="stat-value">{{ profile.followerCount }}</span>
              <span class="stat-label">팔로워</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ profile.followedStores.length }}</span>
              <span class="stat-label">팔로잉</span>
            </div>
          </div>
        </div>

        <!-- 유저 이름 + Bio -->
        <div class="profile-info">
          <h2 class="store-name">{{ profile.nickname }}</h2>
          <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
        </div>

        <!-- 액션 버튼 -->
        <div class="profile-actions">
          <template v-if="isMyProfile">
            <button class="profile-action-btn primary" @click="showEditProfile = true">프로필 편집</button>
            <button class="profile-action-btn" @click="shareProfile">프로필 공유</button>
            <button class="profile-action-btn icon-btn" @click="goToSettings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </button>
          </template>
          <template v-else>
            <button class="profile-action-btn" @click="shareProfile">프로필 공유</button>
          </template>
        </div>

        <!-- 탭 메뉴 -->
        <div class="profile-tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'stores' }" @click="activeTab = 'stores'">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <!-- 알림 탭 (본인 프로필에서만) -->
          <button v-if="isMyProfile" class="tab-btn" :class="{ active: activeTab === 'notifications' }" @click="switchToNotifications">
            <div class="tab-icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 탭 컨텐츠 -->
      <div class="tab-content">
        <!-- 팔로잉 매장 탭 -->
        <div v-if="activeTab === 'stores'" class="stores-tab">
          <div v-if="profile.followedStores.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <p class="empty-title">팔로우한 매장이 없어요</p>
            <p class="empty-subtitle">팔로우한 매장이 여기에 표시됩니다</p>
          </div>

          <div v-else class="stores-list">
            <div
              v-for="store in profile.followedStores"
              :key="store.adminId"
              class="store-item"
              @click="goToStore(store.qrCode)"
            >
              <div class="store-item-avatar">
                <div class="avatar-gradient-ring-small">
                  <div class="avatar-inner-small">
                    <img
                      v-if="store.storeProfileImage"
                      :src="store.storeProfileImage"
                      :alt="store.storeName"
                      class="avatar-img-small"
                    />
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7l8-4 8 4v1H4V7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                      <rect x="4" y="8" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
                      <rect x="9" y="13" width="6" height="7" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="store-item-info">
                <p class="store-item-name">{{ store.storeName }}</p>
                <p class="store-item-followers">팔로워 {{ store.followerCount }}명</p>
              </div>
              <svg class="store-item-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- 알림 탭 -->
        <div v-else-if="activeTab === 'notifications'" class="notifications-tab">
          <!-- 알림 헤더 -->
          <div v-if="notifications.length > 0" class="notifications-header">
            <button v-if="unreadCount > 0" class="mark-all-read-btn" @click="handleMarkAllRead">
              모두 읽음
            </button>
          </div>

          <div v-if="isLoadingNotifications" class="loading-state">
            <div class="spinner"></div>
            <span>알림을 불러오는 중...</span>
          </div>

          <div v-else-if="notifications.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p class="empty-title">아직 알림이 없어요</p>
            <p class="empty-subtitle">좋아요나 새 방명록 알림이 여기에 표시됩니다</p>
          </div>

          <div v-else class="notification-list">
            <div
              v-for="noti in notifications"
              :key="noti.id"
              class="notification-item"
              :class="{ unread: !noti.isRead }"
              @click="handleNotificationClick(noti)"
            >
              <!-- 프로필 이미지 -->
              <div class="noti-avatar">
                <div class="avatar-gradient-ring-small">
                  <div class="avatar-inner-small">
                    <img
                      v-if="noti.fromUserProfileImage"
                      :src="noti.fromUserProfileImage"
                      :alt="noti.fromUserName || ''"
                      class="avatar-img-small"
                    />
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- 알림 내용 -->
              <div class="noti-content">
                <p class="noti-text">
                  <span class="noti-username">{{ noti.fromUserName || '누군가' }}</span>
                  <span v-if="noti.type === 'like'">님이 좋아요를 눌렀습니다.</span>
                  <span v-else-if="noti.type === 'new_guestbook'">님이 방명록을 남겼습니다.</span>
                  <span v-else-if="noti.type === 'reply'">님이 답글을 달았습니다.</span>
                  <span class="noti-time">{{ formatRelativeDate(noti.createdAt) }}</span>
                </p>
                <p v-if="noti.storeName" class="noti-store">{{ noti.storeName }}</p>
              </div>

              <!-- 썸네일 -->
              <div class="noti-thumbnail" v-if="noti.guestbookImageUrl || noti.guestbookMessageText">
                <img
                  v-if="noti.guestbookImageUrl"
                  :src="noti.guestbookImageUrl"
                  class="noti-thumb-img"
                  alt=""
                />
                <div
                  v-else-if="noti.guestbookMessageText"
                  class="noti-thumb-text"
                  :style="{ background: getCardBg(noti.guestbookColor || 'white') }"
                >
                  <span>{{ noti.guestbookMessageText.slice(0, 20) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 더보기 -->
          <div v-if="hasMoreNotifications" class="load-more">
            <button
              class="load-more-btn"
              :disabled="isLoadingNotifications"
              @click="loadMoreNotifications"
            >
              <div v-if="isLoadingNotifications" class="btn-spinner"></div>
              <span v-else>더 보기</span>
            </button>
          </div>
        </div>

        <!-- 게시물 탭 -->
        <div v-else class="feed-tab">
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

    <!-- 프로필 편집 모달 -->
    <div v-if="showEditProfile" class="modal-overlay" @click.self="showEditProfile = false">
      <div class="modal-content edit-profile-modal">
        <div class="modal-header">
          <button class="modal-close-btn" @click="showEditProfile = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
          <h2 class="modal-title">프로필 편집</h2>
          <button class="modal-save-btn" :disabled="isSavingProfile" @click="saveProfile">
            {{ isSavingProfile ? '저장 중...' : '완료' }}
          </button>
        </div>

        <div class="edit-profile-body">
          <!-- 프로필 사진 -->
          <div class="edit-avatar-section">
            <div class="edit-avatar">
              <div class="avatar-gradient-ring">
                <div class="avatar-inner">
                  <img v-if="editForm.profileImage" :src="editForm.profileImage" class="avatar-img" alt=""/>
                  <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>
            </div>
            <button class="change-photo-btn" @click="triggerPhotoUpload">사진 변경</button>
            <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload"/>
          </div>

          <!-- 닉네임 -->
          <div class="edit-field">
            <label class="edit-label">닉네임</label>
            <input v-model="editForm.nickname" type="text" class="edit-input" maxlength="50" placeholder="닉네임을 입력하세요"/>
          </div>

          <!-- 자기소개 -->
          <div class="edit-field">
            <label class="edit-label">자기소개</label>
            <textarea v-model="editForm.bio" class="edit-textarea" maxlength="300" rows="3" placeholder="자기소개를 입력하세요"/>
            <span class="char-count">{{ (editForm.bio || '').length }}/300</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 공유 토스트 -->
    <Transition name="toast">
      <div v-if="showShareToast" class="share-toast">
        {{ shareToastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import guestbookService from '@/services/guestbookService'
import notificationService from '@/services/notificationService'
import type { UserPublicProfile, MyGuestbookMessageResponse } from '@/services/guestbookService'
import type { NotificationItem } from '@/services/notificationService'
import { getCardBg } from '@/constants/guestbookColors'
import MessageDetailModal from '@/components/blocks/guestbook/MessageDetailModal.vue'
import apiClient from '@/services/api'

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

const activeTab = ref<'posts' | 'stores' | 'notifications'>('posts')
const showDetail = ref(false)
const selectedMessage = ref<any>(null)
const likingMessageId = ref<string | null>(null)

// 알림 관련 state
const notifications = ref<NotificationItem[]>([])
const isLoadingNotifications = ref(false)
const unreadCount = ref(0)
const notificationOffset = ref(0)
const hasMoreNotifications = ref(false)
const notificationsLoaded = ref(false)

const userCode = route.params.code as string

// 프로필 편집
const showEditProfile = ref(false)
const isSavingProfile = ref(false)
const editForm = ref({ nickname: '', profileImage: '' as string | undefined, bio: '' })
const photoInput = ref<HTMLInputElement | null>(null)

// 공유 토스트
const showShareToast = ref(false)
const shareToastMessage = ref('')

// 본인 프로필인지 판단
const isMyProfile = computed(() => {
  if (!authStore.user) return false
  return authStore.user.profileCode === userCode || authStore.user.id === userCode
})

onMounted(async () => {
  await loadProfile()
  if (profile.value) {
    await loadMessages()
  }
  // 본인 프로필이면 읽지 않은 알림 수 조회
  if (isMyProfile.value && isAuthenticated.value) {
    loadUnreadCount()
  }
})

// 탭 전환 시 알림 데이터 지연 로딩
watch(activeTab, (tab) => {
  if (tab === 'notifications' && !notificationsLoaded.value) {
    loadNotifications()
  }
})

async function loadProfile() {
  isLoadingProfile.value = true
  error.value = null
  try {
    profile.value = await guestbookService.getUserProfile(userCode)
  } catch {
    error.value = '사용자를 찾을 수 없습니다'
  } finally {
    isLoadingProfile.value = false
  }
}

async function loadMessages() {
  isLoadingMessages.value = true
  try {
    const res = await guestbookService.getUserMessages(userCode, currentPage.value)
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

// 알림 관련
async function loadUnreadCount() {
  try {
    unreadCount.value = await notificationService.getUnreadCount()
  } catch {
    // silent
  }
}

async function loadNotifications() {
  isLoadingNotifications.value = true
  try {
    const data = await notificationService.getNotifications(20, notificationOffset.value)
    notifications.value.push(...data)
    hasMoreNotifications.value = data.length === 20
    notificationsLoaded.value = true
  } catch {
    // silent
  } finally {
    isLoadingNotifications.value = false
  }
}

async function loadMoreNotifications() {
  notificationOffset.value += 20
  await loadNotifications()
}

function switchToNotifications() {
  activeTab.value = 'notifications'
}

async function handleNotificationClick(noti: NotificationItem) {
  // 읽음 처리
  if (!noti.isRead) {
    noti.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    notificationService.markAsRead(noti.id).catch(() => {})
  }

  // 해당 게시물로 이동
  if (noti.guestbookMessageId) {
    try {
      const msg = await guestbookService.getGuestbookMessage(noti.guestbookMessageId)
      selectedMessage.value = {
        ...msg,
        userId: msg.userId || noti.fromUserId || '',
        userName: msg.userName || noti.fromUserName || '',
        userProfileImage: msg.userProfileImage,
        userProfileCode: msg.userProfileCode
      }
      showDetail.value = true
    } catch {
      // 메시지가 삭제된 경우
      alert('해당 게시물을 찾을 수 없습니다.')
    }
  }
}

async function handleMarkAllRead() {
  try {
    await notificationService.markAllAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch {
    // silent
  }
}

function openDetail(msg: MyGuestbookMessageResponse) {
  selectedMessage.value = {
    ...msg,
    userId: profile.value?.id || '',
    userName: profile.value?.nickname || '',
    userProfileImage: profile.value?.profileImage,
    userProfileCode: profile.value?.profileCode
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

// 프로필 편집 모달 열 때 현재 값 세팅
watch(showEditProfile, (val) => {
  if (val && profile.value) {
    editForm.value = {
      nickname: profile.value.nickname,
      profileImage: profile.value.profileImage,
      bio: profile.value.bio || ''
    }
  }
})

function triggerPhotoUpload() {
  photoInput.value?.click()
}

async function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  // 10MB 제한
  if (file.size > 10 * 1024 * 1024) {
    alert('프로필 이미지는 10MB 이하만 가능합니다.')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/api/FileUpload/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    if (res.data.fileUrl) {
      editForm.value.profileImage = res.data.fileUrl
    }
  } catch {
    alert('이미지 업로드에 실패했습니다.')
  }
}

async function saveProfile() {
  if (isSavingProfile.value) return
  isSavingProfile.value = true

  try {
    const res = await authService.updateProfile({
      nickname: editForm.value.nickname,
      profileImage: editForm.value.profileImage || '',
      bio: editForm.value.bio || ''
    })

    // 프로필 데이터 갱신
    if (profile.value) {
      profile.value.nickname = res.nickname
      profile.value.profileImage = res.profileImage ?? undefined
      profile.value.bio = res.bio ?? undefined
    }

    // auth store 갱신
    await authStore.fetchUser()

    showEditProfile.value = false
  } catch {
    alert('프로필 저장에 실패했습니다.')
  } finally {
    isSavingProfile.value = false
  }
}

async function shareProfile() {
  const baseUrl = window.location.origin
  const code = profile.value?.profileCode || userCode
  const url = `${baseUrl}/u/${code}`

  try {
    if (navigator.share) {
      await navigator.share({
        title: `${profile.value?.nickname || ''}의 프로필`,
        url
      })
      return
    }
  } catch {
    // 사용자가 공유 취소한 경우 무시
  }

  // fallback: 클립보드 복사
  try {
    await navigator.clipboard.writeText(url)
    showToast('프로필 링크가 복사되었습니다!')
  } catch {
    // 클립보드 API 실패 시 prompt fallback
    prompt('프로필 링크:', url)
  }
}

function showToast(msg: string) {
  shareToastMessage.value = msg
  showShareToast.value = true
  setTimeout(() => { showShareToast.value = false }, 2000)
}

function goToSettings() {
  router.push({ name: 'settings' })
}

function goToStore(qrCode: string) {
  if (qrCode) {
    router.push({ name: 'guestbook', query: { qr: qrCode } })
  }
}

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
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

.tab-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ed4956;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
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

/* 알림 탭 */
.notifications-tab {
  background: white;
}

.notifications-header {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 1rem 0;
}

.mark-all-read-btn {
  background: none;
  border: none;
  font-size: 13px;
  font-weight: 600;
  color: #0095f6;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.15s;
}

.mark-all-read-btn:hover {
  background: #f5f5f5;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.notification-item.unread {
  background: #eff6ff;
}

.notification-item.unread:hover {
  background: #e8f0fe;
}

.noti-avatar {
  flex-shrink: 0;
}

.noti-content {
  flex: 1;
  min-width: 0;
}

.noti-text {
  font-size: 13px;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.noti-username {
  font-weight: 600;
}

.noti-time {
  color: #8e8e8e;
  margin-left: 4px;
}

.noti-store {
  font-size: 12px;
  color: #8e8e8e;
  margin: 2px 0 0;
}

.noti-thumbnail {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #efefef;
}

.noti-thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.noti-thumb-text {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

.noti-thumb-text span {
  font-size: 8px;
  color: #262626;
  line-height: 1.2;
  text-align: center;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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

/* 매장 리스트 */
.stores-tab {
  background: white;
}

.stores-list {
  display: flex;
  flex-direction: column;
}

.store-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
}

.store-item:hover {
  background: #fafafa;
}

.store-item:not(:last-child) {
  border-bottom: 1px solid #f5f5f5;
}

.store-item-avatar {
  flex-shrink: 0;
}

.store-item-info {
  flex: 1;
  min-width: 0;
}

.store-item-name {
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.store-item-followers {
  font-size: 12px;
  color: #8e8e8e;
  margin: 2px 0 0;
}

.store-item-arrow {
  flex-shrink: 0;
}

/* Bio */
.profile-bio {
  font-size: 14px;
  color: #262626;
  margin: 4px 0 0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 액션 버튼 영역 */
.profile-actions {
  display: flex;
  gap: 6px;
  padding: 0 1rem 0.75rem;
}

.profile-action-btn {
  flex: 1;
  padding: 7px 0;
  background: #efefef;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #262626;
  cursor: pointer;
  transition: background 0.15s;
}

.profile-action-btn:hover {
  background: #dbdbdb;
}

.profile-action-btn.primary {
  background: #262626;
  color: white;
}

.profile-action-btn.primary:hover {
  background: #363636;
}

.profile-action-btn.icon-btn {
  flex: 0;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 모달 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.modal-content {
  background: white;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #efefef;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-close-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #262626;
}

.modal-title {
  font-size: 16px;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.modal-save-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: #0095f6;
  cursor: pointer;
  padding: 4px 8px;
}

.modal-save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 프로필 편집 */
.edit-profile-body {
  padding: 1.5rem 1rem 2rem;
}

.edit-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.edit-avatar {
  width: 86px;
  height: 86px;
}

.change-photo-btn {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #0095f6;
  cursor: pointer;
}

.edit-field {
  margin-bottom: 1.25rem;
  position: relative;
}

.edit-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #8e8e8e;
  margin-bottom: 4px;
}

.edit-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 15px;
  color: #262626;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-input:focus {
  border-color: #262626;
}

.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 15px;
  color: #262626;
  outline: none;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.edit-textarea:focus {
  border-color: #262626;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #8e8e8e;
  margin-top: 4px;
}

/* 공유 토스트 */
.share-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #262626;
  color: white;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastIn 0.3s ease reverse; }
@keyframes toastIn {
  from { opacity: 0; transform: translateX(-50%) translateY(10px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
