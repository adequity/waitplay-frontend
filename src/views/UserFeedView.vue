<template>
  <div class="mini-hompy">
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

    <!-- 로딩 -->
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
      <!-- ===== 프로필 섹션 (미니홈피 스타일: 중앙 배치) ===== -->
      <div class="profile-section">
        <div class="profile-center">
          <div class="profile-avatar">
            <div class="avatar-gradient-ring">
              <div class="avatar-inner">
                <img v-if="profile.profileImage" :src="profile.profileImage" :alt="profile.nickname" class="avatar-img"/>
                <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>
          <h2 class="profile-name">{{ profile.nickname }}</h2>
          <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
        </div>

        <!-- 카운터 영역 -->
        <div class="visitor-counter">
          <div class="counter-item">
            <span class="counter-label">TODAY</span>
            <span class="counter-value">{{ profile.todayVisitors }}</span>
          </div>
          <div class="counter-divider"></div>
          <div class="counter-item">
            <span class="counter-label">TOTAL</span>
            <span class="counter-value">{{ formatNumber(profile.totalVisitors) }}</span>
          </div>
          <div class="counter-divider"></div>
          <div class="counter-item clickable" @click="openFollowList('followers')">
            <span class="counter-label">팔로워</span>
            <span class="counter-value">{{ formatNumber(profile.userFollowerCount || 0) }}</span>
          </div>
          <div class="counter-divider"></div>
          <div class="counter-item clickable" @click="openFollowList('following')">
            <span class="counter-label">팔로잉</span>
            <span class="counter-value">{{ formatNumber(profile.userFollowingCount || 0) }}</span>
          </div>
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
            <button class="profile-action-btn" :class="{ primary: !profile.isFollowedByMe, following: profile.isFollowedByMe }" @click="toggleUserFollow">
              {{ profile.isFollowedByMe ? '팔로잉' : '팔로우' }}
            </button>
            <button class="profile-action-btn" @click="shareProfile">프로필 공유</button>
          </template>
        </div>

        <!-- 단골 매장 -->
        <div v-if="profile.followedStores && profile.followedStores.length > 0" class="followed-stores-section">
          <h3 class="section-subtitle">단골 매장</h3>
          <div class="followed-stores-scroll">
            <div v-for="store in profile.followedStores" :key="store.adminId" class="followed-store-item" @click="goToStore(store.qrCode)">
              <div class="store-logo-circle">
                <img v-if="store.storeProfileImage" :src="store.storeProfileImage" :alt="store.storeName" class="store-logo-img"/>
                <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <span class="store-name-label">{{ store.storeName }}</span>
            </div>
          </div>
        </div>

        <!-- 탭 메뉴 (5탭) -->
        <div class="profile-tabs">
          <button class="tab-btn" :class="{ active: activeTab === 'room' }" @click="activeTab = 'room'">
            <span class="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="tab-label">나의방</span>
          </button>
          <button v-if="isMyProfile" class="tab-btn" :class="{ active: activeTab === 'decorate' }" @click="activeTab = 'decorate'">
            <span class="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="tab-label">방꾸미기</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'guestbook' }" @click="activeTab = 'guestbook'">
            <span class="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="tab-label">방명록</span>
          </button>
          <button class="tab-btn" :class="{ active: activeTab === 'stores' }" @click="switchToStores">
            <span class="tab-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="tab-label">매장기록</span>
          </button>
          <button v-if="isMyProfile" class="tab-btn" :class="{ active: activeTab === 'notifications' }" @click="switchToNotifications">
            <span class="tab-icon">
              <div class="tab-icon-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
              </div>
            </span>
            <span class="tab-label">알림</span>
          </button>
        </div>
      </div>

      <!-- ===== 탭 컨텐츠 ===== -->
      <div class="tab-content">

        <!-- ===== 탭0: 나의방 ===== -->
        <div v-if="activeTab === 'room'" class="room-tab">
          <div v-if="isLoadingRoom" class="loading-state">
            <div class="spinner"></div>
          </div>
          <template v-else>
            <!-- Room preview card → opens Phaser fullscreen with village -->
            <div class="room-preview-card" @click="openRoomFullscreen">
              <div v-if="villagePreviewImages.length > 0" class="room-preview-thumbnails">
                <img
                  v-for="(img, i) in villagePreviewImages"
                  :key="i"
                  :src="img"
                  class="room-preview-thumb"
                  alt=""
                />
                <div v-if="(village?.filledSlots || 0) > 4" class="room-preview-more">
                  +{{ (village?.filledSlots || 0) - 4 }}
                </div>
              </div>
              <div v-else class="room-preview-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              </div>
              <h3 class="room-preview-title">{{ isMyProfile ? '나의 방' : `${profile?.nickname || ''}의 방` }}</h3>
              <p class="room-preview-subtitle">
                {{ (village?.filledSlots || 0) > 0
                  ? `매장 룸 ${village!.filledSlots}개 · 탭하여 빌리지 보기`
                  : '탭하여 방 구경하기' }}
              </p>
            </div>

          </template>
        </div>

        <!-- ===== 탭1: 방명록 (프로필 방명록) ===== -->
        <div v-if="activeTab === 'guestbook'" class="guestbook-tab">
          <!-- 방명록 작성 버튼 (다른 사람 프로필 방문 시) -->
          <div v-if="!isMyProfile && isAuthenticated" class="write-guestbook-bar">
            <button class="write-guestbook-btn" @click="openDrawingModal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z"/>
              </svg>
              <span>방명록 남기기</span>
            </button>
          </div>
          <div v-else-if="!isMyProfile && !isAuthenticated" class="write-guestbook-bar">
            <button class="write-guestbook-btn" @click="promptLogin">
              <span>로그인하고 방명록 남기기</span>
            </button>
          </div>

          <div v-if="isLoadingProfileGuestbook" class="loading-state">
            <div class="spinner"></div>
          </div>
          <div v-else-if="profileGuestbookMessages.length === 0" class="empty-state enhanced">
            <div class="empty-illustration">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <rect x="12" y="8" width="40" height="48" rx="4" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="1.5"/>
                <line x1="20" y1="22" x2="44" y2="22" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
                <line x1="20" y1="30" x2="44" y2="30" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
                <line x1="20" y1="38" x2="36" y2="38" stroke="#E5E7EB" stroke-width="2" stroke-linecap="round"/>
                <circle cx="48" cy="12" r="8" fill="#818CF8" opacity="0.2"/>
                <path d="M45 12h6M48 9v6" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="empty-title">아직 방명록이 없어요</p>
            <p class="empty-subtitle">{{ isMyProfile ? '친구에게 프로필을 공유해서 방명록을 받아보세요!' : '첫 번째 방명록을 남겨보세요!' }}</p>
            <button v-if="isMyProfile" class="empty-cta-btn" @click="shareProfile">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
              프로필 공유하기
            </button>
            <button v-else-if="isAuthenticated" class="empty-cta-btn primary" @click="openDrawingModal">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a1 1 0 00-1 1v14a1 1 0 001 1h14a1 1 0 001-1v-7"/><path d="M17.5 2.5a2.121 2.121 0 013 3L12 14l-4 1 1-4 8.5-8.5z"/></svg>
              방명록 남기기
            </button>
          </div>
          <div v-else class="feed-list">
            <div v-for="msg in profileGuestbookMessages" :key="msg.id" class="feed-post">
              <div class="feed-post-header">
                <div class="feed-author" @click="goToUserProfile(msg.userProfileCode || msg.userId)">
                  <div class="feed-author-avatar">
                    <div class="avatar-gradient-ring-small">
                      <div class="avatar-inner-small">
                        <img v-if="msg.userProfileImage" :src="msg.userProfileImage" :alt="msg.userName" class="avatar-img-small"/>
                        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/></svg>
                      </div>
                    </div>
                  </div>
                  <div class="feed-author-info">
                    <p class="feed-author-name">{{ msg.userName }}</p>
                    <p class="feed-timestamp">{{ formatRelativeDate(msg.createdAt) }}</p>
                  </div>
                </div>
                <!-- 삭제 (프로필 주인 또는 작성자) -->
                <button v-if="canDeleteProfileGuestbook(msg)" class="delete-btn" @click="deleteProfileMsg(msg.id)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8e8e8e" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="feed-content" @click="openDetail(msg)">
                <div v-if="msg.imageUrl" class="feed-image-wrapper">
                  <img :src="msg.imageUrl" :alt="`${msg.userName}의 방명록`" class="feed-image" loading="lazy"/>
                </div>
                <div v-else-if="msg.message" class="feed-postit" :style="{ background: getCardBg(msg.color) }">
                  <p class="feed-postit-text">{{ msg.message }}</p>
                </div>
              </div>
              <div class="feed-actions">
                <button class="feed-action-btn" :class="{ liked: msg.isLikedByMe }" @click="handleLike(msg)">
                  <svg v-if="msg.isLikedByMe" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                  <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
                <span v-if="msg.likeCount > 0" class="like-count">{{ msg.likeCount }}</span>
                <button class="feed-action-btn reply-btn" @click="toggleReplyInput(msg.id)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </button>
                <span v-if="(msg.replyCount || 0) > 0" class="like-count">{{ msg.replyCount }}</span>
              </div>
              <!-- 답글 목록 -->
              <div v-if="msg.replies && msg.replies.length > 0" class="replies-list">
                <div v-for="reply in msg.replies" :key="reply.id" class="reply-item">
                  <div class="reply-author" @click="goToUserProfile(reply.userId)">
                    <img v-if="reply.userProfileImage" :src="reply.userProfileImage" class="reply-avatar-img"/>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-3.866 0-7 3.134-7 7h14c0-3.866-3.134-7-7-7z"/></svg>
                    <span class="reply-author-name">{{ reply.userName }}</span>
                  </div>
                  <p class="reply-content">{{ reply.content }}</p>
                  <span class="reply-time">{{ formatRelativeDate(reply.createdAt) }}</span>
                </div>
              </div>
              <!-- 답글 입력 -->
              <div v-if="replyingTo === msg.id && isMyProfile" class="reply-input-area">
                <input v-model="replyContent" class="reply-input" placeholder="답글 달기..." maxlength="500" @keyup.enter="submitReply(msg.id)"/>
                <button class="reply-submit-btn" :disabled="!replyContent.trim()" @click="submitReply(msg.id)">전송</button>
              </div>
            </div>
          </div>
          <div v-if="hasMoreProfileGuestbook" class="load-more">
            <button class="load-more-btn" :disabled="isLoadingProfileGuestbook" @click="loadMoreProfileGuestbook">
              <div v-if="isLoadingProfileGuestbook" class="btn-spinner"></div>
              <span v-else>더 보기</span>
            </button>
          </div>
        </div>

        <!-- ===== 탭2: 매장기록 ===== -->
        <div v-else-if="activeTab === 'stores'" class="stores-tab">
          <!-- 뷰 토글 -->
          <div class="view-toggle">
            <button :class="{ active: storeViewMode === 'album' }" @click="storeViewMode = 'album'">매장별</button>
            <button :class="{ active: storeViewMode === 'feed' }" @click="storeViewMode = 'feed'">전체</button>
          </div>

          <!-- 매장별 앨범 뷰 -->
          <div v-if="storeViewMode === 'album'">
            <div v-if="isLoadingAlbums" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="storeAlbums.length === 0" class="empty-state enhanced">
              <div class="empty-illustration">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <path d="M12 24l20-14 20 14v28a4 4 0 01-4 4H16a4 4 0 01-4-4V24z" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="1.5"/>
                  <rect x="24" y="38" width="16" height="18" rx="2" fill="white" stroke="#D1D5DB" stroke-width="1.5"/>
                  <circle cx="32" cy="20" r="6" fill="#818CF8" opacity="0.2"/>
                  <path d="M32 17v6M29 20h6" stroke="#6366F1" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <p class="empty-title">매장 기록이 없어요</p>
              <p class="empty-subtitle">{{ isMyProfile ? 'QR 코드를 스캔해서 매장에 방명록을 남겨보세요!' : '아직 방문한 매장이 없습니다' }}</p>
            </div>
            <div v-else class="album-grid">
              <div v-for="album in storeAlbums" :key="album.qrCode" class="album-card" @click="goToStore(album.qrCode)">
                <div class="album-thumb">
                  <img v-if="album.latestImageUrl" :src="album.latestImageUrl" class="album-thumb-img" loading="lazy"/>
                  <div v-else class="album-thumb-placeholder" :style="{ background: getCardBg(album.latestColor || 'white') }">
                    <span v-if="album.latestMessage">{{ album.latestMessage.slice(0, 30) }}</span>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#bbb" stroke-width="1.5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    </svg>
                  </div>
                </div>
                <div class="album-info">
                  <div class="album-store-row">
                    <img v-if="album.storeProfileImage" :src="album.storeProfileImage" class="album-store-logo"/>
                    <span class="album-store-name">{{ album.storeName }}</span>
                  </div>
                  <span class="album-visit-count">{{ album.visitCount }}회 방문</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 전체 피드 뷰 (기존 방명록 피드) -->
          <div v-else>
            <div v-if="isLoadingMessages" class="loading-state"><div class="spinner"></div></div>
            <div v-else-if="messages.length === 0" class="empty-state enhanced">
              <p class="empty-title">작성한 방명록이 없어요</p>
              <p class="empty-subtitle">{{ isMyProfile ? '매장에서 방명록을 남기면 여기에 표시됩니다' : '아직 작성한 방명록이 없습니다' }}</p>
            </div>
            <div v-else class="feed-list">
              <div v-for="msg in messages" :key="msg.id" class="feed-post">
                <div class="feed-post-header">
                  <div class="feed-author">
                    <div class="feed-author-avatar">
                      <div class="avatar-gradient-ring-small">
                        <div class="avatar-inner-small">
                          <img v-if="profile.profileImage" :src="profile.profileImage" :alt="profile.nickname" class="avatar-img-small"/>
                          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/></svg>
                        </div>
                      </div>
                    </div>
                    <div class="feed-author-info">
                      <p class="feed-author-name">{{ profile.nickname }}</p>
                      <p class="feed-timestamp">{{ formatRelativeDate(msg.createdAt) }} · {{ msg.storeName }}</p>
                    </div>
                  </div>
                </div>
                <div class="feed-content" @click="openStoreDetail(msg)">
                  <div v-if="msg.imageUrl" class="feed-image-wrapper">
                    <img :src="msg.imageUrl" class="feed-image" loading="lazy"/>
                  </div>
                  <div v-else-if="msg.message" class="feed-postit" :style="{ background: getCardBg(msg.color) }">
                    <p class="feed-postit-text">{{ msg.message }}</p>
                  </div>
                </div>
                <div class="feed-actions">
                  <button class="feed-action-btn" :class="{ liked: (msg as any).isLikedByMe }" @click="handleStoreLike(msg)">
                    <svg v-if="(msg as any).isLikedByMe" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </button>
                  <span v-if="msg.likeCount > 0" class="like-count">{{ msg.likeCount }}</span>
                </div>
              </div>
            </div>
            <div v-if="hasMore" class="load-more">
              <button class="load-more-btn" :disabled="isLoadingMessages" @click="loadMore">
                <div v-if="isLoadingMessages" class="btn-spinner"></div>
                <span v-else>더 보기</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ===== 탭3: 방꾸미기 ===== -->
        <div v-else-if="activeTab === 'decorate'" class="decorate-tab">
          <!-- 테마 선택 -->
          <div v-if="isMyProfile" class="theme-section">
            <h3 class="theme-section-title">빌리지 테마</h3>
            <div class="theme-swatches">
              <button
                v-for="t in colorThemes"
                :key="t.key"
                class="theme-swatch"
                :class="{ active: selectedVillageTheme === t.key }"
                :style="{ backgroundColor: t.color }"
                :disabled="isSavingTheme"
                @click="selectVillageTheme(t.key)"
              >
                <svg v-if="selectedVillageTheme === t.key" width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="t.key === 'dark' ? '#fff' : '#333'" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
            </div>
            <div v-if="imageThemes.length" class="theme-images">
              <button
                v-for="t in imageThemes"
                :key="t.key"
                class="theme-image-btn"
                :class="{ active: selectedVillageTheme === t.key }"
                :disabled="isSavingTheme"
                @click="selectVillageTheme(t.key)"
              >
                <img :src="t.thumbnail" :alt="t.label" class="theme-image-preview" loading="lazy" />
                <span class="theme-image-label">{{ t.label }}</span>
                <svg v-if="selectedVillageTheme === t.key" class="theme-image-check" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
              </button>
            </div>
          </div>

          <div class="asset-grid">
            <!-- 완료된 에셋들 -->
            <div
              v-for="asset in completedRoomAssets"
              :key="asset.id"
              class="asset-card"
              :class="{ selected: asset.isSelected }"
              @click="toggleAssetSelection(asset)"
            >
              <div class="asset-card-img">
                <img :src="asset.assetImageUrl!" alt="" />
                <span v-if="asset.isSelected" class="asset-badge">사용 중</span>
              </div>
              <span class="asset-card-name">{{ asset.assetName || '나의 에셋' }}</span>
            </div>

            <!-- 대기중 에셋 -->
            <div v-for="asset in pendingRoomAssets" :key="asset.id" class="asset-card pending">
              <div class="asset-card-img placeholder">
                <span class="pending-emoji">⏳</span>
              </div>
              <span class="asset-card-name">제작 중</span>
            </div>

            <!-- 새 사진 제출 -->
            <div class="asset-card add-new" @click="triggerPhotoSubmit">
              <div class="asset-card-img placeholder add">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="1.5">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </div>
              <span class="asset-card-name">사진 제출</span>
            </div>
          </div>
          <input
            ref="photoSubmitInput"
            type="file"
            accept="image/*"
            style="display:none"
            @change="handlePhotoSubmit"
          />
        </div>

        <!-- ===== 탭4: 알림 (기존) ===== -->
        <div v-else-if="activeTab === 'notifications'" class="notifications-tab">
          <div v-if="notifications.length > 0" class="notifications-header">
            <button v-if="unreadCount > 0" class="mark-all-read-btn" @click="handleMarkAllRead">모두 읽음</button>
          </div>
          <div v-if="isLoadingNotifications" class="loading-state"><div class="spinner"></div></div>
          <div v-else-if="notifications.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <p class="empty-title">아직 알림이 없어요</p>
            <p class="empty-subtitle">좋아요나 새 방명록 알림이 여기에 표시됩니다</p>
          </div>
          <div v-else class="notification-list">
            <div v-for="noti in notifications" :key="noti.id" class="notification-item" :class="{ unread: !noti.isRead }" @click="handleNotificationClick(noti)">
              <div class="noti-avatar">
                <div class="avatar-gradient-ring-small"><div class="avatar-inner-small">
                  <img v-if="noti.fromUserProfileImage" :src="noti.fromUserProfileImage" :alt="noti.fromUserName || ''" class="avatar-img-small"/>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/></svg>
                </div></div>
              </div>
              <div class="noti-content">
                <p class="noti-text">
                  <span v-if="noti.type === 'room_asset_ready'">요청하신 방을 다 꾸며봤어요! 확인해보세요!</span>
                  <template v-else>
                    <span class="noti-username">{{ noti.fromUserName || '누군가' }}</span>
                    <span v-if="noti.type === 'like'">님이 좋아요를 눌렀습니다.</span>
                    <span v-else-if="noti.type === 'new_guestbook'">님이 방명록을 남겼습니다.</span>
                    <span v-else-if="noti.type === 'reply'">님이 답글을 달았습니다.</span>
                    <span v-else-if="noti.type === 'profile_guestbook'">님이 프로필 방명록을 남겼습니다.</span>
                    <span v-else-if="noti.type === 'user_follow'">님이 회원님을 팔로우했습니다.</span>
                    <span v-else-if="noti.type === 'knock'">님이 회원님의 방을 노크했습니다. 👋</span>
                    <span v-else-if="noti.type === 'store_follow'">님이 매장을 팔로우했습니다. ⭐</span>
                  </template>
                  <span class="noti-time">{{ formatRelativeDate(noti.createdAt) }}</span>
                </p>
                <p v-if="noti.storeName" class="noti-store">{{ noti.storeName }}</p>
              </div>
              <div class="noti-thumbnail" v-if="noti.guestbookImageUrl || noti.guestbookMessageText">
                <img v-if="noti.guestbookImageUrl" :src="noti.guestbookImageUrl" class="noti-thumb-img" alt=""/>
                <div v-else-if="noti.guestbookMessageText" class="noti-thumb-text" :style="{ background: getCardBg(noti.guestbookColor || 'white') }">
                  <span>{{ noti.guestbookMessageText.slice(0, 20) }}</span>
                </div>
              </div>
              <button
                v-else-if="['user_follow', 'knock', 'store_follow'].includes(noti.type) && noti.fromUserId && !notiFollowStatus[noti.fromUserId]"
                class="noti-follow-btn"
                @click="quickFollowBack(noti, $event)"
              >팔로우</button>
              <span
                v-else-if="['user_follow', 'knock', 'store_follow'].includes(noti.type) && noti.fromUserId && notiFollowStatus[noti.fromUserId]"
                class="noti-following-label"
              >팔로잉</span>
            </div>
          </div>
          <div v-if="hasMoreNotifications" class="load-more">
            <button class="load-more-btn" :disabled="isLoadingNotifications" @click="loadMoreNotifications">
              <div v-if="isLoadingNotifications" class="btn-spinner"></div>
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

    <!-- DrawingModal (프로필 방명록 작성) -->
    <DrawingModal
      v-if="showDrawing"
      :visible="showDrawing"
      qrCodeId=""
      :profileCode="profile?.profileCode || userCode"
      displayMode="postit"
      @close="showDrawing = false"
      @submitted="onProfileGuestbookSubmitted"
    />

    <!-- 프로필 편집 모달 -->
    <div v-if="showEditProfile" class="modal-overlay" @click.self="showEditProfile = false">
      <div class="modal-content edit-profile-modal">
        <div class="modal-header">
          <button class="modal-close-btn" @click="showEditProfile = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          <h2 class="modal-title">프로필 편집</h2>
          <button class="modal-save-btn" :disabled="isSavingProfile" @click="saveProfile">{{ isSavingProfile ? '저장 중...' : '완료' }}</button>
        </div>
        <div class="edit-profile-body">
          <div class="edit-avatar-section">
            <div class="edit-avatar">
              <div class="avatar-gradient-ring"><div class="avatar-inner">
                <img v-if="editForm.profileImage" :src="editForm.profileImage" class="avatar-img" alt=""/>
                <svg v-else width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/></svg>
              </div></div>
            </div>
            <button class="change-photo-btn" @click="triggerPhotoUpload">사진 변경</button>
            <input ref="photoInput" type="file" accept="image/*" style="display:none" @change="handlePhotoUpload"/>
          </div>
          <div class="edit-field">
            <label class="edit-label">닉네임</label>
            <input v-model="editForm.nickname" type="text" class="edit-input" maxlength="50" placeholder="닉네임을 입력하세요"/>
          </div>
          <div class="edit-field">
            <label class="edit-label">자기소개</label>
            <textarea v-model="editForm.bio" class="edit-textarea" maxlength="300" rows="3" placeholder="자기소개를 입력하세요"/>
            <span class="char-count">{{ (editForm.bio || '').length }}/300</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 미니룸 풀스크린 오버레이 -->
    <Teleport to="body">
      <div v-if="showRoomFullscreen" id="miniroom-fullscreen-overlay" class="miniroom-fullscreen" :style="{ background: villageThemeBgColor }">
        <div id="miniroom-container" class="miniroom-canvas-container"></div>
        <div v-if="isRoomLoading" class="miniroom-loading">
          <div class="miniroom-loading-spinner"></div>
          <span>방을 꾸미는 중...</span>
        </div>
        <button class="miniroom-close-btn" @click="closeRoomFullscreen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <div class="miniroom-owner-label">{{ profile?.nickname || '' }}의 방</div>
        <!-- 방문자 플로팅 독 -->
        <div class="miniroom-visitor-dock">
          <div class="visitor-dock-item">
            <span class="visitor-dock-label">TODAY</span>
            <span class="visitor-dock-value">{{ profile?.todayVisitors ?? 0 }}</span>
          </div>
          <div class="visitor-dock-sep"></div>
          <div class="visitor-dock-item">
            <span class="visitor-dock-label">TOTAL</span>
            <span class="visitor-dock-value">{{ formatNumber(profile?.totalVisitors ?? 0) }}</span>
          </div>
        </div>
        <!-- 방명록/알림 플로팅 버튼 -->
        <button v-if="isMyProfile && unreadCount > 0" class="miniroom-guestbook-fab" @click="goToGuestbookFromVillage">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span class="miniroom-notif-badge bounce-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </button>
        <!-- 이동 모드 배너 -->
        <div v-if="moveMode" class="move-mode-banner">
          <span>{{ moveFromStoreName }}의 새 위치를 탭하세요</span>
          <button @click="cancelMoveMode">취소</button>
        </div>

        <!-- 매장 액션 시트 -->
        <div v-if="showStoreActionSheet" class="action-sheet-overlay" @click.self="showStoreActionSheet = false">
          <div class="action-sheet">
            <div class="action-sheet-title">{{ actionSheetRoom?.storeName }}</div>
            <button class="action-sheet-btn" @click="actionGoToStore">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
              {{ actionSheetRoom?.isRandom ? '방 노크하기' : actionSheetRoom?.isFriend ? '프로필로 이동' : '매장 페이지로 이동' }}
            </button>
            <button class="action-sheet-btn" @click="actionMoveStore">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 9l4-4 4 4"/><path d="M9 5v14"/><path d="M19 15l-4 4-4-4"/><path d="M15 19V5"/></svg>
              위치 변경
            </button>
            <button class="action-sheet-btn action-sheet-danger" @click="actionRemoveStore">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>
              빌리지에서 제거
            </button>
            <button class="action-sheet-btn action-sheet-cancel" @click="showStoreActionSheet = false">취소</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 노크 확인 모달 -->
    <Teleport to="body">
      <Transition name="knock-modal">
        <div v-if="showKnockModal && knockTarget" class="knock-modal-overlay" @click.self="cancelKnock">
          <div class="knock-modal">
            <div class="knock-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <div class="knock-modal-name">{{ knockTarget.name }}</div>
            <div class="knock-modal-msg">
              {{ knockTarget.randomType === 'admin' ? '이 매장을 노크할까요?' : '이 유저의 방을 노크할까요?' }}
            </div>
            <div class="knock-modal-buttons">
              <button class="knock-btn knock-btn-cancel" @click="cancelKnock">취소</button>
              <button class="knock-btn knock-btn-confirm" @click="confirmKnock">노크하기</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 팔로워/팔로잉 목록 모달 -->
    <Teleport to="body">
      <Transition name="knock-modal">
        <div v-if="showFollowListModal" class="knock-modal-overlay" @click.self="showFollowListModal = false">
          <div class="follow-list-modal">
            <div class="follow-list-header">
              <button class="follow-list-tab" :class="{ active: followListTab === 'followers' }" @click="switchFollowTab('followers')">
                팔로워 {{ formatNumber(profile?.userFollowerCount || 0) }}
              </button>
              <button class="follow-list-tab" :class="{ active: followListTab === 'following' }" @click="switchFollowTab('following')">
                팔로잉 {{ formatNumber(profile?.userFollowingCount || 0) }}
              </button>
              <button class="follow-list-close" @click="showFollowListModal = false">✕</button>
            </div>
            <div class="follow-list-body">
              <div v-if="isLoadingFollowList" class="loading-state"><div class="spinner"></div></div>
              <div v-else-if="followListItems.length === 0" class="empty-state" style="padding: 2rem;">
                <p class="empty-title">{{ followListTab === 'followers' ? '아직 팔로워가 없어요' : '아직 팔로잉이 없어요' }}</p>
              </div>
              <div v-else class="follow-list-items">
                <div v-for="item in followListItems" :key="item.userId" class="follow-list-item" @click="goToFollowProfile(item.profileCode)">
                  <div class="follow-list-avatar">
                    <img v-if="item.profileImage" :src="item.profileImage" :alt="item.nickname" class="avatar-img-small" />
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2"><path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"/><path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z"/></svg>
                  </div>
                  <span class="follow-list-name">{{ item.nickname }}</span>
                </div>
                <button v-if="followListHasMore" class="load-more-btn" @click="loadMoreFollowList" :disabled="isLoadingFollowList">
                  더 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 공유 토스트 -->
    <Transition name="toast">
      <div v-if="showShareToast" class="share-toast">{{ shareToastMessage }}</div>
    </Transition>

    <!-- 매장 선택 모달 -->
    <StorePickerModal
      v-if="showStorePicker"
      @close="showStorePicker = false; pendingSlot = null"
      @select="handleStorePlaced"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import authService from '@/services/authService'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import notificationService from '@/services/notificationService'
import { getRoomConfiguration, updateRoomConfiguration, type RoomConfiguration, type RoomAsset, getMyRoomAssets, submitRoomPhoto, selectRoomAsset, deselectRoomAsset } from '@/services/roomService'
import { getUserVillage, placeSlot, removeSlot, swapSlots, type VillageResponse } from '@/services/storeRoomService'
import type { VillageStoreRoom, VillageEmptySlot } from '@/game/miniroom/VillageConfig'
import { setDynamicThemes } from '@/game/miniroom/VillageConfig'
import { getActiveVillageThemes } from '@/services/villageThemeService'
import type { UserPublicProfile, MyGuestbookMessageResponse, GuestbookMessageResponse, StoreAlbumResponse } from '@/services/guestbookService'
import type { NotificationItem } from '@/services/notificationService'
import { getCardBg } from '@/constants/guestbookColors'
import MessageDetailModal from '@/components/blocks/guestbook/MessageDetailModal.vue'
import DrawingModal from '@/components/blocks/guestbook/DrawingModal.vue'
import StorePickerModal from '@/components/StorePickerModal.vue'
import apiClient from '@/services/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)

const profile = ref<UserPublicProfile | null>(null)
const isLoadingProfile = ref(true)
const error = ref<string | null>(null)

const activeTab = ref<'room' | 'decorate' | 'guestbook' | 'stores' | 'notifications'>('room')
const showDetail = ref(false)
const selectedMessage = ref<any>(null)
const likingMessageId = ref<string | null>(null)

// MiniRoom
const roomConfig = ref<RoomConfiguration | null>(null)
const isLoadingRoom = ref(false)
const roomLoaded = ref(false)
const showRoomFullscreen = ref(false)
const isRoomLoading = ref(false)

// Village
const village = ref<VillageResponse | null>(null)
const isLoadingVillage = ref(false)

// Room Assets
const showRoomAssets = ref(false)
const myRoomAssets = ref<RoomAsset[]>([])
const completedRoomAssets = computed(() => myRoomAssets.value.filter(a => a.status === 'completed'))
const pendingRoomAssets = computed(() => myRoomAssets.value.filter(a => a.status === 'pending'))
const photoSubmitInput = ref<HTMLInputElement | null>(null)

// Village theme (loaded from API, fallback to hardcoded)
type ThemeOption = { key: string; label: string; type: 'color' | 'image'; color?: string; thumbnail?: string; bgColor?: string }
const FALLBACK_THEME_OPTIONS: ThemeOption[] = [
  { key: 'white', label: '화이트', type: 'color', color: '#FFFFFF' },
  { key: 'cream', label: '크림', type: 'color', color: '#FFF8F0' },
  { key: 'sky', label: '하늘', type: 'color', color: '#E8F4FD' },
  { key: 'mint', label: '민트', type: 'color', color: '#E8F5E8' },
  { key: 'lavender', label: '라벤더', type: 'color', color: '#F0E8F5' },
  { key: 'peach', label: '피치', type: 'color', color: '#FFF0E8' },
  { key: 'gray', label: '그레이', type: 'color', color: '#F0F0F0' },
  { key: 'dark', label: '다크', type: 'color', color: '#2C2C2C' },
  { key: 'tema1', label: '시티', type: 'image', thumbnail: '/assets/village-themes/tema1.png', bgColor: '#87CEEB' },
]
const villageThemeOptions = ref<ThemeOption[]>(FALLBACK_THEME_OPTIONS)
const colorThemes = computed(() => villageThemeOptions.value.filter(t => t.type === 'color'))
const imageThemes = computed(() => villageThemeOptions.value.filter(t => t.type === 'image'))
const selectedVillageTheme = ref('white')
const isSavingTheme = ref(false)
const villageThemeBgColor = computed(() => {
  const theme = village.value?.villageTheme || selectedVillageTheme.value
  const opt = villageThemeOptions.value.find(t => t.key === theme)
  if (!opt) return '#FFFFFF'
  if (opt.type === 'image') return opt.bgColor || '#FFFFFF'
  return opt.color || '#FFFFFF'
})

async function loadVillageThemes() {
  try {
    const themes = await getActiveVillageThemes()
    if (themes.length > 0) {
      setDynamicThemes(themes)
      villageThemeOptions.value = themes.map(t => ({
        key: t.themeKey,
        label: t.displayName,
        type: t.themeType,
        color: t.colorValue || undefined,
        thumbnail: t.imageUrl || undefined,
        bgColor: t.bgColor || undefined,
      }))
    }
  } catch {
    // API 실패 시 fallback 유지
  }
}

// Store picker modal
const showStorePicker = ref(false)
const pendingSlot = ref<{ q: number; r: number } | null>(null)

// Move mode (슬롯 위치 변경)
const moveMode = ref(false)
const moveFromSlot = ref<{ q: number; r: number } | null>(null)
const moveFromStoreName = ref('')

// Profile guestbook
const profileGuestbookMessages = ref<GuestbookMessageResponse[]>([])
const isLoadingProfileGuestbook = ref(false)
const profileGuestbookPage = ref(1)
const hasMoreProfileGuestbook = ref(false)
const showDrawing = ref(false)

// Store records (existing feed)
const messages = ref<MyGuestbookMessageResponse[]>([])
const isLoadingMessages = ref(false)
const currentPage = ref(1)
const hasMore = ref(false)
const storeViewMode = ref<'album' | 'feed'>('album')

// Store albums
const storeAlbums = ref<StoreAlbumResponse[]>([])
const isLoadingAlbums = ref(false)
const albumsLoaded = ref(false)


// Notifications
const notifications = ref<NotificationItem[]>([])
const isLoadingNotifications = ref(false)
const unreadCount = ref(0)
const notificationOffset = ref(0)
const hasMoreNotifications = ref(false)
const notificationsLoaded = ref(false)
const notiFollowStatus = ref<Record<string, boolean>>({})

const userCode = route.params.code as string

// Edit profile
const showEditProfile = ref(false)
const isSavingProfile = ref(false)
const editForm = ref({ nickname: '', profileImage: '' as string | undefined, bio: '' })
const photoInput = ref<HTMLInputElement | null>(null)

// Reply
const replyingTo = ref<string | null>(null)
const replyContent = ref('')

// Toast
const showShareToast = ref(false)
const shareToastMessage = ref('')

const isMyProfile = computed(() => {
  if (!authStore.user) return false
  return authStore.user.profileCode === userCode || authStore.user.id === userCode
})

onMounted(async () => {
  loadVillageThemes()
  await loadProfile()
  if (profile.value) {
    loadRoomConfig()
    loadVillage()
  }
  if (isMyProfile.value && isAuthenticated.value) {
    loadUnreadCount()
    loadMyRoomAssets()
  }
  window.addEventListener('miniroom-empty-slot-tap', onEmptySlotTap)
  window.addEventListener('miniroom-store-tap', onStoreTap)
})

onUnmounted(() => {
  closeRoomFullscreen()
  window.removeEventListener('miniroom-empty-slot-tap', onEmptySlotTap)
  window.removeEventListener('miniroom-store-tap', onStoreTap)
})

watch(activeTab, (tab) => {
  if (tab === 'guestbook' && profileGuestbookMessages.value.length === 0) loadProfileGuestbook()
  if (tab === 'stores' && !albumsLoaded.value) {
    loadStoreAlbums()
    if (messages.value.length === 0) loadMessages()
  }
  if (tab === 'decorate' && myRoomAssets.value.length === 0) loadMyRoomAssets()
  if (tab === 'notifications' && !notificationsLoaded.value) loadNotifications()
})

// ===== Data loading =====

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

// ===== Village =====
async function loadVillage() {
  isLoadingVillage.value = true
  try {
    village.value = await getUserVillage(userCode)
  } catch { /* silent */ } finally {
    isLoadingVillage.value = false
  }
}

// ===== MiniRoom =====
async function loadRoomConfig() {
  if (roomLoaded.value) return
  isLoadingRoom.value = true
  try {
    roomConfig.value = await getRoomConfiguration(userCode)
    roomLoaded.value = true
    if (roomConfig.value?.villageTheme) {
      selectedVillageTheme.value = roomConfig.value.villageTheme
    }
  } catch { /* silent */ } finally {
    isLoadingRoom.value = false
  }
}

// ===== Room Assets =====
async function loadMyRoomAssets() {
  try {
    myRoomAssets.value = await getMyRoomAssets()
  } catch { /* silent */ }
}

function formatAssetDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

async function selectVillageTheme(themeKey: string) {
  if (themeKey === selectedVillageTheme.value || isSavingTheme.value) return
  isSavingTheme.value = true
  try {
    await updateRoomConfiguration({ villageTheme: themeKey })
    selectedVillageTheme.value = themeKey
    if (village.value) {
      village.value.villageTheme = themeKey
    }
  } catch { /* ignore */ }
  isSavingTheme.value = false
}

// Reload village scene with current theme (called after theme change when fullscreen is open)
async function reloadVillageWithTheme() {
  if (!showRoomFullscreen.value || !village.value) return
  const { miniRoomManager } = await import('@/game/miniroom/MiniRoomManager')
  const slots = village.value.slots || []
  const villageRooms: VillageStoreRoom[] = slots
    .filter(s => !s.isEmpty)
    .map(s => ({
      id: s.isAd ? (s.adId || '') : (s.isFriend || s.isRandom ? (s.friendUserId || '') : (s.adminId || '')),
      roomImageUrl: (s.isFriend || s.isRandom) ? (s.friendRoomAssetUrl || '') : (s.roomImageUrl || ''),
      roomName: s.roomName || '',
      roomColor: s.roomColor || (s.isAd ? '#FF6B35' : s.isFriend ? '#10B981' : s.isRandom ? '#8B5CF6' : '#6366F1'),
      gridQ: s.slotQ, gridR: s.slotR,
      storeName: (s.isFriend || s.isRandom) ? (s.friendNickname || '추천') : (s.storeName || ''),
      storeCode: s.storeCode, isFriend: s.isFriend, friendProfileCode: s.friendProfileCode,
      isRandom: s.isRandom, randomType: s.randomType,
      isAd: s.isAd, adId: s.adId, adLinkType: s.adLinkType, adLinkUrl: s.adLinkUrl, adStoreCode: s.adStoreCode,
    }))
  const emptySlots: VillageEmptySlot[] = slots.filter(s => s.isEmpty).map(s => ({ gridQ: s.slotQ, gridR: s.slotR }))
  miniRoomManager.reloadVillage(buildRoomData() as any, villageRooms, emptySlots, village.value?.selectedRoomAssetUrl, village.value?.villageTheme)
}

function triggerPhotoSubmit() {
  photoSubmitInput.value?.click()
}

async function handlePhotoSubmit(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    await submitRoomPhoto(file)
    alert('사진이 제출되었습니다! 에셋 제작이 완료되면 알려드릴게요.')
    await loadMyRoomAssets()
  } catch {
    alert('사진 제출에 실패했습니다.')
  } finally {
    input.value = ''
  }
}

async function toggleAssetSelection(asset: RoomAsset) {
  try {
    if (asset.isSelected) {
      await deselectRoomAsset()
    } else {
      await selectRoomAsset(asset.id)
    }
    await loadMyRoomAssets()
    // 빌리지 다시 불러오기 (중앙 룸 이미지 변경 반영)
    isLoadingVillage.value = true
    try {
      const { getMyVillage } = await import('@/services/storeRoomService')
      village.value = await getMyVillage()
    } catch { /* silent */ } finally {
      isLoadingVillage.value = false
    }
  } catch {
    alert('에셋 선택에 실패했습니다.')
  }
}

function buildRoomData() {
  if (!roomConfig.value) return undefined
  return {
    wallTheme: roomConfig.value.wallTheme,
    floorTheme: roomConfig.value.floorTheme,
    furniture: roomConfig.value.furniture.map(f => ({
      itemId: f.itemId, type: f.type as any, gridX: f.gridX, gridY: f.gridY,
      rotation: f.rotation, scale: f.scale, color: f.color || '#667eea',
    })),
    character: {
      color: roomConfig.value.character.color,
      shape: (roomConfig.value.character.shape as 'circle' | 'square') || 'circle',
      accessory: roomConfig.value.character.accessory,
    },
  }
}

async function openRoomFullscreen() {
  showRoomFullscreen.value = true
  isRoomLoading.value = true
  await nextTick()

  const onReady = () => { isRoomLoading.value = false }
  window.addEventListener('miniroom-ready', onReady, { once: true })
  const loadingTimeout = setTimeout(() => { isRoomLoading.value = false }, 8000)

  try {
    const { setGapFactorXY } = await import('@/utils/hexGridUtils')
    setGapFactorXY(village.value?.gapFactorX ?? 1.5, village.value?.gapFactor ?? 1.5)

    const { miniRoomManager } = await import('@/game/miniroom/MiniRoomManager')
    const slots = village.value?.slots || []
    const villageRooms: VillageStoreRoom[] = slots
      .filter(s => !s.isEmpty)
      .map(s => ({
        id: s.isAd ? s.adId! : ((s.isFriend || s.isRandom) ? s.friendUserId! : s.adminId!),
        roomImageUrl: s.roomImageUrl || '',
        roomName: s.roomName || '',
        roomColor: s.roomColor || (s.isAd ? '#FF6B35' : s.isFriend ? '#10B981' : s.isRandom ? '#8B5CF6' : '#6366F1'),
        gridQ: s.slotQ,
        gridR: s.slotR,
        storeName: (s.isFriend || s.isRandom) ? (s.friendNickname || '추천') : (s.storeName || ''),
        storeCode: s.storeCode,
        isFriend: s.isFriend,
        friendProfileCode: s.friendProfileCode,
        isRandom: s.isRandom,
        randomType: s.randomType,
        isAd: s.isAd,
        adId: s.adId,
        adLinkType: s.adLinkType,
        adLinkUrl: s.adLinkUrl,
        adStoreCode: s.adStoreCode,
      }))
    const emptySlots: VillageEmptySlot[] = slots
      .filter(s => s.isEmpty)
      .map(s => ({ gridQ: s.slotQ, gridR: s.slotR }))

    // 광고 노출 트래킹
    const adRooms = villageRooms.filter(r => r.isAd && r.adId)
    if (adRooms.length > 0) {
      import('@/services/villageAdService').then(({ trackAdEvent }) => {
        adRooms.forEach(r => trackAdEvent(r.adId!, 'impression'))
      })
    }

    await miniRoomManager.init('miniroom-container', buildRoomData() as any, villageRooms, emptySlots, village.value?.selectedRoomAssetUrl, village.value?.villageTheme)
  } catch {
    isRoomLoading.value = false
    window.removeEventListener('miniroom-ready', onReady)
    clearTimeout(loadingTimeout)
  }
}

async function closeRoomFullscreen() {
  if (!showRoomFullscreen.value) return

  try {
    const { miniRoomManager } = await import('@/game/miniroom/MiniRoomManager')
    miniRoomManager.destroy()
  } catch { /* silent */ }

  showRoomFullscreen.value = false
}

// ===== Village Slot Events =====
function onEmptySlotTap(e: Event) {
  const detail = (e as CustomEvent).detail as { slotQ: number; slotR: number }

  if (moveMode.value && moveFromSlot.value) {
    // Move mode: move/swap to this empty slot
    handleSwap(moveFromSlot.value.q, moveFromSlot.value.r, detail.slotQ, detail.slotR)
    return
  }

  pendingSlot.value = { q: detail.slotQ, r: detail.slotR }
  showStorePicker.value = true
}

let blockStoreTapUntil = 0

function onStoreTap(e: Event) {
  const detail = (e as CustomEvent).detail as { room: VillageStoreRoom }
  const room = detail.room

  // 모달이 열려있거나 방금 닫힌 직후면 무시 (Phaser pointerup 이벤트 차단)
  if (showKnockModal.value || showStoreActionSheet.value || Date.now() < blockStoreTapUntil) return

  if (moveMode.value && moveFromSlot.value) {
    // Move mode: swap with this store's slot
    handleSwap(moveFromSlot.value.q, moveFromSlot.value.r, room.gridQ, room.gridR)
    return
  }

  // 광고 룸 클릭 → 광고 링크 이동 + 클릭 트래킹
  if (room.isAd && room.adId) {
    import('@/services/villageAdService').then(({ trackAdEvent }) => {
      trackAdEvent(room.adId!, 'click')
    })
    if (room.adLinkType === 'internal_store' && room.adStoreCode) {
      closeRoomFullscreen()
      router.push(`/customer?qr=${room.adStoreCode}`)
    } else if (room.adLinkUrl) {
      window.open(room.adLinkUrl, '_blank')
    }
    return
  }

  // 랜덤 추천 룸 클릭 → 노크 모달
  if (room.isRandom && room.friendProfileCode) {
    openKnockModal(room)
    return
  }

  // 친구 룸 클릭 → 프로필로 이동
  if (room.isFriend && room.friendProfileCode) {
    closeRoomFullscreen()
    router.push(`/u/${room.friendProfileCode}`)
    return
  }

  if (isMyProfile.value) {
    // Owner: show action sheet
    showStoreActionSheet.value = true
    actionSheetRoom.value = room
  } else {
    // Visitor: navigate to store
    if (room.storeCode) {
      closeRoomFullscreen()
      router.push(`/customer?qr=${room.storeCode}`)
    }
  }
}

// Action sheet state
const showStoreActionSheet = ref(false)
const actionSheetRoom = ref<VillageStoreRoom | null>(null)

// 노크 모달 state
const showKnockModal = ref(false)
const knockTarget = ref<{ name: string; profileCode: string; randomType: string } | null>(null)

function openKnockModal(room: VillageStoreRoom) {
  blockStoreTapUntil = Date.now() + 500
  const name = room.storeName || '이 유저'
  knockTarget.value = {
    name,
    profileCode: room.friendProfileCode!,
    randomType: room.randomType || 'user',
  }
  showKnockModal.value = true
}

async function confirmKnock() {
  if (!knockTarget.value) return
  const profileCode = knockTarget.value.profileCode
  showKnockModal.value = false
  knockTarget.value = null
  // 노크 알림 전송 (실패해도 이동은 진행)
  notificationService.sendKnock(profileCode).catch(() => {})
  // 같은 UserFeedView 컴포넌트 내에서 다른 유저로 이동 시
  // route.params.code가 const라 갱신 안 되므로 전체 네비게이션 사용
  window.location.href = `/u/${profileCode}`
}

function cancelKnock() {
  showKnockModal.value = false
  knockTarget.value = null
  blockStoreTapUntil = Date.now() + 500
}

function goToGuestbookFromVillage() {
  closeRoomFullscreen()
  activeTab.value = 'notifications'
}

function actionGoToStore() {
  const room = actionSheetRoom.value
  showStoreActionSheet.value = false
  if (room?.isRandom && room?.friendProfileCode) {
    openKnockModal(room)
    return
  }
  if (room?.isFriend && room?.friendProfileCode) {
    closeRoomFullscreen()
    router.push(`/u/${room.friendProfileCode}`)
  } else if (room?.storeCode) {
    closeRoomFullscreen()
    router.push(`/customer?qr=${room.storeCode}`)
  }
}

function actionMoveStore() {
  const room = actionSheetRoom.value
  showStoreActionSheet.value = false
  if (room) {
    moveMode.value = true
    moveFromSlot.value = { q: room.gridQ, r: room.gridR }
    moveFromStoreName.value = room.storeName
  }
}

function actionRemoveStore() {
  const room = actionSheetRoom.value
  showStoreActionSheet.value = false
  if (room) {
    handleSlotRemove(room.gridQ, room.gridR)
  }
}

function cancelMoveMode() {
  moveMode.value = false
  moveFromSlot.value = null
  moveFromStoreName.value = ''
}

async function handleSwap(fromQ: number, fromR: number, toQ: number, toR: number) {
  try {
    await swapSlots(fromQ, fromR, toQ, toR)
    cancelMoveMode()
    await loadVillage()
    await reloadMiniroom()
  } catch (err: any) {
    cancelMoveMode()
    console.error('handleSwap error:', err)
    alert(err?.response?.data?.message || '위치 변경에 실패했습니다')
  }
}

async function handleStorePlaced(selection: { type: 'store' | 'friend'; id: string }) {
  if (!pendingSlot.value) return
  try {
    const { q, r } = pendingSlot.value
    if (selection.type === 'store') {
      await placeSlot(q, r, selection.id, undefined)
    } else {
      await placeSlot(q, r, undefined, selection.id)
    }
    showStorePicker.value = false
    pendingSlot.value = null
    // Reload village and re-init Phaser
    await loadVillage()
    await reloadMiniroom()
  } catch (err: any) {
    alert(err?.response?.data?.message || '배치에 실패했습니다')
  }
}

async function handleSlotRemove(slotQ: number, slotR: number) {
  if (!confirm('이 매장을 빌리지에서 제거할까요?')) return
  try {
    await removeSlot(slotQ, slotR)
    await loadVillage()
    await reloadMiniroom()
  } catch { /* silent */ }
}

async function reloadMiniroom() {
  if (!showRoomFullscreen.value) return

  const { setGapFactorXY } = await import('@/utils/hexGridUtils')
  setGapFactorXY(village.value?.gapFactorX ?? 1.5, village.value?.gapFactor ?? 1.5)

  const { miniRoomManager } = await import('@/game/miniroom/MiniRoomManager')

  const slots = village.value?.slots || []
  const villageRooms: VillageStoreRoom[] = slots
    .filter(s => !s.isEmpty)
    .map(s => ({
      id: s.isAd ? s.adId! : ((s.isFriend || s.isRandom) ? s.friendUserId! : s.adminId!),
      roomImageUrl: s.roomImageUrl || '',
      roomName: s.roomName || '',
      roomColor: s.roomColor || (s.isAd ? '#FF6B35' : s.isFriend ? '#10B981' : s.isRandom ? '#8B5CF6' : '#6366F1'),
      gridQ: s.slotQ,
      gridR: s.slotR,
      storeName: (s.isFriend || s.isRandom) ? (s.friendNickname || '추천') : (s.storeName || ''),
      storeCode: s.storeCode,
      isFriend: s.isFriend,
      friendProfileCode: s.friendProfileCode,
      isRandom: s.isRandom,
      randomType: s.randomType,
      isAd: s.isAd,
      adId: s.adId,
      adLinkType: s.adLinkType,
      adLinkUrl: s.adLinkUrl,
      adStoreCode: s.adStoreCode,
    }))
  const emptySlots: VillageEmptySlot[] = slots
    .filter(s => s.isEmpty)
    .map(s => ({ gridQ: s.slotQ, gridR: s.slotR }))

  // Use scene restart instead of full game destroy/recreate
  // This preserves WebGL context and texture cache, allowing unlimited consecutive swaps
  miniRoomManager.reloadVillage(buildRoomData() as any, villageRooms, emptySlots, village.value?.selectedRoomAssetUrl, village.value?.villageTheme)
}

async function loadProfileGuestbook() {
  isLoadingProfileGuestbook.value = true
  try {
    const res = await guestbookService.getProfileGuestbook(userCode, profileGuestbookPage.value)
    profileGuestbookMessages.value.push(...res.messages)
    hasMoreProfileGuestbook.value = res.hasMore
  } catch { /* silent */ } finally {
    isLoadingProfileGuestbook.value = false
  }
}

async function loadMoreProfileGuestbook() {
  profileGuestbookPage.value++
  await loadProfileGuestbook()
}

async function loadMessages() {
  isLoadingMessages.value = true
  try {
    const res = await guestbookService.getUserMessages(userCode, currentPage.value)
    messages.value.push(...res.messages)
    hasMore.value = res.hasMore
  } catch { /* silent */ } finally {
    isLoadingMessages.value = false
  }
}

async function loadMore() {
  currentPage.value++
  await loadMessages()
}

async function loadStoreAlbums() {
  isLoadingAlbums.value = true
  try {
    const res = await guestbookService.getStoreAlbums(userCode)
    storeAlbums.value = res.albums
    albumsLoaded.value = true
  } catch { /* silent */ } finally {
    isLoadingAlbums.value = false
  }
}

// Notifications
async function loadUnreadCount() {
  try { unreadCount.value = await notificationService.getUnreadCount() } catch { /* silent */ }
}
async function loadNotifications() {
  isLoadingNotifications.value = true
  try {
    const data = await notificationService.getNotifications(20, notificationOffset.value)
    notifications.value.push(...data)
    hasMoreNotifications.value = data.length === 20
    notificationsLoaded.value = true
    // 팔로우 타입 알림의 fromUserId로 배치 팔로우 상태 조회
    const followUserIds = data
      .filter(n => ['user_follow', 'knock', 'store_follow'].includes(n.type) && n.fromUserId)
      .map(n => n.fromUserId!)
      .filter(id => !(id in notiFollowStatus.value))
    if (followUserIds.length > 0) {
      try {
        const followingIds = await followService.getBatchFollowStatus(followUserIds)
        for (const uid of followUserIds) {
          notiFollowStatus.value[uid] = followingIds.includes(uid)
        }
      } catch { /* silent */ }
    }
  } catch { /* silent */ } finally { isLoadingNotifications.value = false }
}
async function loadMoreNotifications() {
  notificationOffset.value += 20
  await loadNotifications()
}
// ===== Village preview thumbnails =====
const villagePreviewImages = computed(() => {
  if (!village.value?.slots) return []
  return village.value.slots
    .filter(s => !s.isEmpty && s.roomImageUrl)
    .slice(0, 4)
    .map(s => s.roomImageUrl!)
})

// ===== Follow list modal =====
import type { FollowUserItem } from '@/services/followService'
const showFollowListModal = ref(false)
const followListTab = ref<'followers' | 'following'>('followers')
const followListItems = ref<FollowUserItem[]>([])
const isLoadingFollowList = ref(false)
const followListHasMore = ref(false)
const followListPage = ref(1)

async function openFollowList(tab: 'followers' | 'following') {
  followListTab.value = tab
  followListItems.value = []
  followListPage.value = 1
  showFollowListModal.value = true
  await loadFollowList()
}
async function switchFollowTab(tab: 'followers' | 'following') {
  followListTab.value = tab
  followListItems.value = []
  followListPage.value = 1
  await loadFollowList()
}
async function loadFollowList() {
  isLoadingFollowList.value = true
  try {
    if (followListTab.value === 'followers') {
      const res = await followService.getUserFollowers(userCode, followListPage.value)
      followListItems.value.push(...res.followers)
      followListHasMore.value = res.hasMore
    } else {
      const res = await followService.getUserFollowing(userCode, followListPage.value)
      followListItems.value.push(...res.following)
      followListHasMore.value = res.hasMore
    }
  } catch { /* silent */ }
  isLoadingFollowList.value = false
}
async function loadMoreFollowList() {
  followListPage.value++
  await loadFollowList()
}
function goToFollowProfile(profileCode: string | null) {
  if (!profileCode) return
  showFollowListModal.value = false
  router.push(`/u/${profileCode}`)
}

async function quickFollowBack(noti: NotificationItem, event: Event) {
  event.stopPropagation()
  if (!noti.fromUserProfileCode || !noti.fromUserId) return
  try {
    await followService.followUser(noti.fromUserProfileCode)
    notiFollowStatus.value[noti.fromUserId] = true
  } catch { /* silent */ }
}

// ===== Actions =====

function openDrawingModal() {
  showDrawing.value = true
}

function promptLogin() {
  const shouldLogin = confirm('방명록을 남기려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
  if (shouldLogin) router.push('/login')
}

async function onProfileGuestbookSubmitted() {
  // Reload profile guestbook
  profileGuestbookMessages.value = []
  profileGuestbookPage.value = 1
  await loadProfileGuestbook()
}

function canDeleteProfileGuestbook(msg: GuestbookMessageResponse) {
  if (!authStore.user) return false
  return authStore.user.id === msg.userId || isMyProfile.value
}

async function deleteProfileMsg(messageId: string) {
  if (!confirm('방명록을 삭제하시겠습니까?')) return
  try {
    await guestbookService.deleteProfileGuestbook(messageId)
    profileGuestbookMessages.value = profileGuestbookMessages.value.filter(m => m.id !== messageId)
  } catch {
    alert('삭제에 실패했습니다.')
  }
}

function switchToStores() {
  activeTab.value = 'stores'
}
function switchToNotifications() {
  activeTab.value = 'notifications'
}

async function handleLike(message: any) {
  if (!isAuthenticated.value) {
    const shouldLogin = confirm('좋아요를 누르려면 로그인이 필요합니다.\n로그인 하시겠습니까?')
    if (shouldLogin) router.push('/login')
    return
  }
  if (likingMessageId.value) return
  likingMessageId.value = message.id
  try {
    const response = await guestbookService.toggleLike(message.id)
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch { /* silent */ } finally { likingMessageId.value = null }
}

async function handleStoreLike(message: any) {
  await handleLike(message)
}

function openDetail(msg: GuestbookMessageResponse) {
  selectedMessage.value = {
    ...msg,
    userId: msg.userId,
    userName: msg.userName,
    userProfileImage: msg.userProfileImage,
    userProfileCode: msg.userProfileCode
  }
  showDetail.value = true
}

function openStoreDetail(msg: MyGuestbookMessageResponse) {
  selectedMessage.value = {
    ...msg,
    userId: profile.value?.id || '',
    userName: profile.value?.nickname || '',
    userProfileImage: profile.value?.profileImage,
    userProfileCode: profile.value?.profileCode
  }
  showDetail.value = true
}

function onLikeToggled(payload: { id: string; isLiked: boolean; likeCount: number }) {
  const msg = profileGuestbookMessages.value.find(m => m.id === payload.id)
  if (msg) { msg.likeCount = payload.likeCount; msg.isLikedByMe = payload.isLiked }
  const storeMsg = messages.value.find(m => m.id === payload.id)
  if (storeMsg) { storeMsg.likeCount = payload.likeCount; (storeMsg as any).isLikedByMe = payload.isLiked }
}
function onShare() {}

async function handleNotificationClick(noti: NotificationItem) {
  if (!noti.isRead) {
    noti.isRead = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    notificationService.markAsRead(noti.id).catch(() => {})
  }
  if (noti.type === 'room_asset_ready') {
    activeTab.value = 'decorate'
    return
  }
  if (noti.type === 'knock' && noti.fromUserProfileCode) {
    router.push(`/u/${noti.fromUserProfileCode}`)
    return
  }
  if ((noti.type === 'user_follow' || noti.type === 'store_follow') && noti.fromUserProfileCode) {
    router.push(`/u/${noti.fromUserProfileCode}`)
    return
  }
  if (noti.guestbookMessageId) {
    try {
      const msg = await guestbookService.getGuestbookMessage(noti.guestbookMessageId)
      selectedMessage.value = { ...msg, userId: msg.userId || noti.fromUserId || '', userName: msg.userName || noti.fromUserName || '', userProfileImage: msg.userProfileImage, userProfileCode: msg.userProfileCode }
      showDetail.value = true
    } catch { alert('해당 게시물을 찾을 수 없습니다.') }
  }
}
async function handleMarkAllRead() {
  try {
    await notificationService.markAllAsRead()
    notifications.value.forEach(n => n.isRead = true)
    unreadCount.value = 0
  } catch { /* silent */ }
}


// ===== Profile edit =====

watch(showEditProfile, (val) => {
  if (val && profile.value) {
    editForm.value = { nickname: profile.value.nickname, profileImage: profile.value.profileImage, bio: profile.value.bio || '' }
  }
})
function triggerPhotoUpload() { photoInput.value?.click() }
async function handlePhotoUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) { alert('프로필 이미지는 10MB 이하만 가능합니다.'); return }
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await apiClient.post('/api/FileUpload/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    if (res.data.fileUrl) editForm.value.profileImage = res.data.fileUrl
  } catch { alert('이미지 업로드에 실패했습니다.') }
}
async function saveProfile() {
  if (isSavingProfile.value) return
  isSavingProfile.value = true
  try {
    const res = await authService.updateProfile({ nickname: editForm.value.nickname, profileImage: editForm.value.profileImage || '', bio: editForm.value.bio || '' })
    if (profile.value) { profile.value.nickname = res.nickname; profile.value.profileImage = res.profileImage ?? undefined; profile.value.bio = res.bio ?? undefined }
    await authStore.fetchUser()
    showEditProfile.value = false
  } catch { alert('프로필 저장에 실패했습니다.') } finally { isSavingProfile.value = false }
}

// ===== Navigation =====

function goToUserProfile(code: string) {
  if (code && code !== userCode) router.push({ name: 'user-feed', params: { code } })
}
async function shareProfile() {
  const baseUrl = window.location.origin
  const code = profile.value?.profileCode || userCode
  const url = `${baseUrl}/u/${code}`
  try { if (navigator.share) { await navigator.share({ title: `${profile.value?.nickname || ''}의 프로필`, url }); return } } catch { /* cancelled */ }
  try { await navigator.clipboard.writeText(url); showToast('프로필 링크가 복사되었습니다!') } catch { prompt('프로필 링크:', url) }
}
function showToast(msg: string) { shareToastMessage.value = msg; showShareToast.value = true; setTimeout(() => { showShareToast.value = false }, 2000) }
function goToSettings() { router.push({ name: 'settings' }) }
function goToStore(qrCode: string) { if (qrCode) router.push({ name: 'guestbook', query: { qr: qrCode } }) }
function goBack() { if (window.history.length > 1) router.back(); else router.push('/') }

// ===== User Follow =====
async function toggleUserFollow() {
  if (!isAuthenticated.value) { promptLogin(); return }
  if (!profile.value) return
  try {
    const code = profile.value.profileCode || userCode
    if (profile.value.isFollowedByMe) {
      const res = await followService.unfollowUser(code)
      profile.value.isFollowedByMe = false
      profile.value.userFollowerCount = res.userFollowerCount
    } else {
      const res = await followService.followUser(code)
      profile.value.isFollowedByMe = true
      profile.value.userFollowerCount = res.userFollowerCount
    }
  } catch { /* ignore */ }
}

// ===== Reply =====
function toggleReplyInput(messageId: string) {
  if (replyingTo.value === messageId) {
    replyingTo.value = null
    replyContent.value = ''
  } else {
    replyingTo.value = messageId
    replyContent.value = ''
  }
}

async function submitReply(messageId: string) {
  if (!replyContent.value.trim()) return
  try {
    const reply = await guestbookService.addReply(messageId, replyContent.value)
    const msg = profileGuestbookMessages.value.find(m => m.id === messageId)
    if (msg) {
      if (!msg.replies) msg.replies = []
      msg.replies.push(reply)
      msg.replyCount = (msg.replyCount || 0) + 1
    }
    replyContent.value = ''
    replyingTo.value = null
  } catch { alert('답글 작성에 실패했습니다.') }
}
function formatNumber(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString() }
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
.mini-hompy {
  min-height: 100vh;
  background: #fafafa;
}

/* ===== Header ===== */
.page-header { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: white; }
.back-btn { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; border-radius: 50%; cursor: pointer; color: #262626; transition: all 0.2s; }
.back-btn:hover { background: #f5f5f5; }
.page-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; }
.header-spacer { width: 40px; }

/* ===== Loading / Empty ===== */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 3rem 1rem; gap: 1rem; color: #8e8e8e; }
.spinner { width: 32px; height: 32px; border: 3px solid #efefef; border-top-color: #262626; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; gap: 0.5rem; text-align: center; }
.empty-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0.5rem 0 0; }
.empty-subtitle { font-size: 14px; color: #8e8e8e; margin: 0; }

/* ===== Profile Section (미니홈피) ===== */
.profile-section { background: white; padding-bottom: 0; }
.profile-center { display: flex; flex-direction: column; align-items: center; padding: 1.5rem 1rem 0.75rem; }
.profile-avatar { margin-bottom: 0.75rem; }
.avatar-gradient-ring { width: 86px; height: 86px; border-radius: 50%; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 3px; display: flex; align-items: center; justify-content: center; }
.avatar-inner { width: 100%; height: 100%; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; border: 3px solid white; overflow: hidden; color: #8e8e8e; }
.avatar-img { width: 100%; height: 100%; object-fit: cover; }
.profile-name { font-size: 1.125rem; font-weight: 700; color: #262626; margin: 0; }
.profile-bio { font-size: 0.8125rem; color: #8e8e8e; margin: 0.25rem 0 0; line-height: 1.4; white-space: pre-wrap; word-break: break-word; text-align: center; max-width: 280px; }

/* ===== Visitor Counter (미니홈피 핵심) ===== */
.visitor-counter { display: flex; align-items: center; justify-content: center; gap: 1.5rem; padding: 0.75rem 1rem; margin: 0.5rem 1rem; background: #f8f8f8; border-radius: 12px; }
.counter-item { display: flex; flex-direction: column; align-items: center; gap: 0.125rem; }
.counter-label { font-size: 0.625rem; font-weight: 700; color: #8e8e8e; letter-spacing: 0.1em; }
.counter-value { font-size: 1.25rem; font-weight: 800; color: #262626; font-variant-numeric: tabular-nums; }
.counter-divider { width: 1px; height: 28px; background: #dbdbdb; }

/* ===== Action Buttons ===== */
.profile-actions { display: flex; gap: 0.5rem; padding: 0.75rem 1rem; }
.profile-action-btn { flex: 1; padding: 0.625rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; background: #efefef; color: #262626; border: none; }
.profile-action-btn:hover { background: #dbdbdb; }
.profile-action-btn.primary { background: #262626; color: white; }
.profile-action-btn.primary:hover { background: #363636; transform: translateY(-1px); }
.profile-action-btn.icon-btn { flex: 0; width: 44px; display: flex; align-items: center; justify-content: center; padding: 0.625rem; }

/* ===== Tabs ===== */
.profile-tabs { display: flex; border-bottom: 1px solid #efefef; }
.tab-btn { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 0.375rem; padding: 0.75rem 0; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; margin-bottom: -1px; }
.tab-btn:hover .tab-icon { color: #262626; }
.tab-btn.active { border-bottom-color: #262626; }
.tab-icon { display: flex; align-items: center; justify-content: center; color: #8e8e8e; transition: color 0.2s; }
.tab-btn.active .tab-icon { color: #262626; }
.tab-label { font-size: 0.6875rem; font-weight: 600; color: #8e8e8e; letter-spacing: 0.05em; }
.tab-btn.active .tab-label { color: #262626; }
.tab-icon-wrapper { position: relative; display: flex; align-items: center; justify-content: center; }
.tab-badge { position: absolute; top: -6px; right: -10px; min-width: 16px; height: 16px; padding: 0 4px; background: #ed4956; color: white; font-size: 10px; font-weight: 700; border-radius: 8px; display: flex; align-items: center; justify-content: center; line-height: 1; }

/* ===== Tab content ===== */
.tab-content { min-height: 300px; }

/* ===== Write guestbook bar ===== */
.write-guestbook-bar { padding: 0.75rem 1rem; background: white; border-bottom: 1px solid #efefef; }
.write-guestbook-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #262626; color: white; border: none; border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.write-guestbook-btn:hover { background: #363636; transform: translateY(-1px); }

/* ===== Feed ===== */
.feed-list { display: flex; flex-direction: column; }
.feed-post { background: white; border-bottom: 1px solid #efefef; }
.feed-post-header { display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 1rem; }
.feed-author { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; }
.feed-author-avatar { flex-shrink: 0; }
.avatar-gradient-ring-small { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); padding: 2px; display: flex; align-items: center; justify-content: center; }
.avatar-inner-small { width: 100%; height: 100%; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; border: 2px solid white; color: #8e8e8e; overflow: hidden; }
.avatar-img-small { width: 100%; height: 100%; object-fit: cover; }
.feed-author-info { display: flex; flex-direction: column; }
.feed-author-name { font-size: 14px; font-weight: 600; color: #262626; margin: 0; }
.feed-timestamp { font-size: 12px; color: #8e8e8e; margin: 0; }
.delete-btn { background: none; border: none; padding: 8px; cursor: pointer; border-radius: 50%; transition: background 0.15s; }
.delete-btn:hover { background: #f5f5f5; }

.feed-content { position: relative; cursor: pointer; user-select: none; -webkit-tap-highlight-color: transparent; }
.feed-image-wrapper { width: 100%; aspect-ratio: 9 / 13; background: #fafafa; position: relative; overflow: hidden; }
.feed-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.feed-postit { width: 100%; min-height: 200px; padding: 2rem 1.5rem; display: flex; align-items: center; justify-content: center; position: relative; }
.feed-postit-text { font-size: 1.125rem; font-weight: 500; color: #262626; margin: 0; text-align: center; line-height: 1.6; word-break: break-word; max-width: 280px; }

.feed-actions { display: flex; align-items: center; padding: 0.5rem 1rem; gap: 0.5rem; }
.feed-action-btn { background: none; border: none; padding: 0.5rem; margin: -0.5rem 0; cursor: pointer; color: #262626; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease; }
.feed-action-btn:active { transform: scale(0.85); }
.feed-action-btn.liked { color: #ed4956; animation: likeAnimation 0.3s ease; }
@keyframes likeAnimation { 0% { transform: scale(1); } 25% { transform: scale(1.2); } 50% { transform: scale(0.95); } 100% { transform: scale(1); } }
.like-count { font-size: 14px; font-weight: 600; color: #262626; }

/* ===== Load More ===== */
.load-more { display: flex; justify-content: center; padding: 1rem; }
.load-more-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem 1.5rem; background: white; border: 1px solid #dbdbdb; border-radius: 8px; font-size: 14px; font-weight: 600; color: #262626; cursor: pointer; transition: all 0.15s; }
.load-more-btn:hover:not(:disabled) { background: #fafafa; }
.load-more-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner { width: 16px; height: 16px; border: 2px solid #dbdbdb; border-top-color: #262626; border-radius: 50%; animation: spin 0.8s linear infinite; }

/* ===== View Toggle ===== */
.view-toggle { display: flex; padding: 0.75rem 1rem; gap: 0.5rem; background: white; border-bottom: 1px solid #efefef; }
.view-toggle button { flex: 1; padding: 0.5rem; border: 1px solid #dbdbdb; border-radius: 8px; background: white; font-size: 13px; font-weight: 600; color: #8e8e8e; cursor: pointer; transition: all 0.2s; }
.view-toggle button.active { background: #262626; color: white; border-color: #262626; }

/* ===== Album Grid ===== */
.album-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #efefef; }
.album-card { background: white; cursor: pointer; transition: opacity 0.15s; }
.album-card:hover { opacity: 0.9; }
.album-thumb { aspect-ratio: 1; overflow: hidden; }
.album-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.album-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.album-thumb-placeholder span { font-size: 12px; color: #262626; text-align: center; line-height: 1.4; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.album-info { padding: 0.625rem 0.75rem; }
.album-store-row { display: flex; align-items: center; gap: 0.375rem; margin-bottom: 0.25rem; }
.album-store-logo { width: 16px; height: 16px; border-radius: 4px; object-fit: cover; }
.album-store-name { font-size: 13px; font-weight: 600; color: #262626; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.album-visit-count { font-size: 11px; color: #8e8e8e; }

/* ===== Decorate Tab ===== */
.decorate-tab { padding: 0.75rem; }
.theme-section { margin-bottom: 16px; }
.theme-section-title { font-size: 14px; font-weight: 700; color: #262626; margin: 0 0 10px 2px; }
.theme-swatches { display: flex; gap: 10px; overflow-x: auto; padding: 2px 0 8px; -webkit-overflow-scrolling: touch; }
.theme-swatch { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #e0e0e0; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: transform 0.15s, box-shadow 0.15s; }
.theme-swatch:active { transform: scale(0.92); }
.theme-swatch.active { border-color: #6366F1; box-shadow: 0 0 0 2px #6366F1; }
.theme-swatch:disabled { opacity: 0.5; cursor: default; }
.theme-images { display: flex; gap: 10px; overflow-x: auto; padding: 8px 0; -webkit-overflow-scrolling: touch; }
.theme-image-btn { position: relative; width: 72px; flex-shrink: 0; border: 2px solid #e0e0e0; border-radius: 12px; overflow: hidden; cursor: pointer; background: #f5f5f5; padding: 0; transition: transform 0.15s, box-shadow 0.15s; }
.theme-image-btn:active { transform: scale(0.95); }
.theme-image-btn.active { border-color: #6366F1; box-shadow: 0 0 0 2px #6366F1; }
.theme-image-btn:disabled { opacity: 0.5; cursor: default; }
.theme-image-preview { width: 100%; aspect-ratio: 9/16; object-fit: cover; display: block; }
.theme-image-label { display: block; font-size: 11px; font-weight: 600; color: #333; text-align: center; padding: 4px 0; }
.theme-image-check { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5)); }
.asset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.asset-card { display: flex; flex-direction: column; gap: 8px; cursor: pointer; border-radius: 16px; padding: 6px; transition: transform 0.15s, box-shadow 0.15s; }
.asset-card:active { transform: scale(0.97); }
.asset-card.selected { background: #f0f0ff; box-shadow: 0 0 0 2px #6366F1; border-radius: 16px; }
.asset-card.pending { cursor: default; opacity: 0.65; }
.asset-card-img { position: relative; width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f5f5f7; }
.asset-card-img img { width: 100%; height: 100%; object-fit: cover; }
.asset-card-img.placeholder { display: flex; align-items: center; justify-content: center; }
.asset-card-img.placeholder.add { border: 2px dashed #d1d5db; background: #fafafe; }
.pending-emoji { font-size: 2rem; }
.asset-badge { position: absolute; top: 8px; right: 8px; background: #6366F1; color: white; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 8px; }
.asset-card-name { font-size: 13px; font-weight: 600; color: #262626; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ===== Notifications ===== */
.notifications-tab { background: white; }
.notifications-header { display: flex; justify-content: flex-end; padding: 0.75rem 1rem 0; }
.mark-all-read-btn { background: none; border: none; font-size: 13px; font-weight: 600; color: #0095f6; cursor: pointer; padding: 4px 8px; border-radius: 4px; transition: background 0.15s; }
.mark-all-read-btn:hover { background: #f5f5f5; }
.notification-list { display: flex; flex-direction: column; }
.notification-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; cursor: pointer; transition: background 0.15s; }
.notification-item:hover { background: #fafafa; }
.notification-item:not(:last-child) { border-bottom: 1px solid #f5f5f5; }
.notification-item.unread { background: #eff6ff; }
.notification-item.unread:hover { background: #e8f0fe; }
.noti-avatar { flex-shrink: 0; }
.noti-content { flex: 1; min-width: 0; }
.noti-text { font-size: 13px; color: #262626; margin: 0; line-height: 1.4; }
.noti-username { font-weight: 600; }
.noti-time { color: #8e8e8e; margin-left: 4px; }
.noti-store { font-size: 12px; color: #8e8e8e; margin: 2px 0 0; }
.noti-thumbnail { flex-shrink: 0; width: 44px; height: 44px; border-radius: 6px; overflow: hidden; border: 1px solid #efefef; }
.noti-thumb-img { width: 100%; height: 100%; object-fit: cover; }
.noti-thumb-text { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; }
.noti-thumb-text span { font-size: 8px; color: #262626; line-height: 1.2; text-align: center; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
.noti-follow-btn { flex-shrink: 0; padding: 6px 14px; border-radius: 8px; border: none; background: #6366F1; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.noti-follow-btn:active { background: #4F46E5; }
.noti-following-label { flex-shrink: 0; padding: 6px 14px; border-radius: 8px; border: 1px solid #e5e7eb; background: transparent; color: #86868b; font-size: 12px; font-weight: 500; white-space: nowrap; }

/* ===== Modal ===== */
.modal-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.5); display: flex; align-items: flex-end; justify-content: center; }
.modal-content { background: white; border-radius: 16px 16px 0 0; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: slideUp 0.3s ease; }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #efefef; position: sticky; top: 0; background: white; z-index: 1; }
.modal-close-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: none; border: none; cursor: pointer; color: #262626; }
.modal-title { font-size: 16px; font-weight: 600; color: #262626; margin: 0; }
.modal-save-btn { background: none; border: none; font-size: 14px; font-weight: 700; color: #0095f6; cursor: pointer; padding: 4px 8px; }
.modal-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-profile-body { padding: 1.5rem 1rem 2rem; }
.edit-avatar-section { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.edit-avatar { width: 86px; height: 86px; }
.change-photo-btn { background: none; border: none; font-size: 14px; font-weight: 600; color: #0095f6; cursor: pointer; }
.edit-field { margin-bottom: 1.25rem; position: relative; }
.edit-label { display: block; font-size: 13px; font-weight: 600; color: #8e8e8e; margin-bottom: 4px; }
.edit-input { width: 100%; padding: 10px 12px; border: 1px solid #dbdbdb; border-radius: 8px; font-size: 15px; color: #262626; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
.edit-input:focus { border-color: #262626; }
.edit-textarea { width: 100%; padding: 10px 12px; border: 1px solid #dbdbdb; border-radius: 8px; font-size: 15px; color: #262626; outline: none; resize: none; font-family: inherit; transition: border-color 0.2s; box-sizing: border-box; }
.edit-textarea:focus { border-color: #262626; }
.char-count { display: block; text-align: right; font-size: 12px; color: #8e8e8e; margin-top: 4px; }

/* ===== Toast ===== */
.share-toast { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); background: #262626; color: white; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.toast-enter-active { animation: toastIn 0.3s ease; }
.toast-leave-active { animation: toastIn 0.3s ease reverse; }
@keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

/* ===== Followed Stores Section ===== */
.followed-stores-section { padding: 0 1rem 0.75rem; }
.section-subtitle { font-size: 14px; font-weight: 700; color: #262626; margin: 0 0 0.5rem; }
.followed-stores-scroll { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; scrollbar-width: none; -ms-overflow-style: none; }
.followed-stores-scroll::-webkit-scrollbar { display: none; }
.followed-store-item { display: flex; flex-direction: column; align-items: center; gap: 4px; cursor: pointer; flex-shrink: 0; min-width: 64px; }
.store-logo-circle { width: 56px; height: 56px; border-radius: 50%; background: #f5f5f5; border: 2px solid #efefef; display: flex; align-items: center; justify-content: center; overflow: hidden; transition: border-color 0.2s; }
.followed-store-item:hover .store-logo-circle { border-color: #dbdbdb; }
.store-logo-img { width: 100%; height: 100%; object-fit: cover; }
.store-name-label { font-size: 11px; color: #8e8e8e; text-align: center; max-width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ===== Follow Button (Following State) ===== */
.profile-action-btn.following { background: #efefef; color: #262626; border: 1px solid #dbdbdb; }
.profile-action-btn.following:hover { background: #fce4e4; color: #ed4956; border-color: #ed4956; }

/* ===== Enhanced Empty States ===== */
.empty-state.enhanced { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 3rem 1.5rem; }
.empty-illustration { margin-bottom: 1rem; }
.empty-cta-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.25rem; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: #efefef; color: #262626; border: none; margin-top: 0.75rem; }
.empty-cta-btn:hover { background: #dbdbdb; }
.empty-cta-btn.primary { background: #262626; color: white; }
.empty-cta-btn.primary:hover { background: #363636; }

/* ===== Reply UI ===== */
.reply-btn { margin-left: 4px; }
.replies-list { padding: 0.5rem 1rem 0; border-top: 1px solid #f5f5f5; }
.reply-item { padding: 0.5rem 0; }
.reply-item:not(:last-child) { border-bottom: 1px solid #fafafa; }
.reply-author { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; cursor: pointer; }
.reply-avatar-img { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }
.reply-author-name { font-size: 13px; font-weight: 600; color: #262626; }
.reply-content { font-size: 13px; color: #262626; line-height: 1.4; margin: 0 0 2px; padding-left: 26px; }
.reply-time { font-size: 11px; color: #8e8e8e; padding-left: 26px; }
.reply-input-area { display: flex; align-items: center; gap: 8px; padding: 0.5rem 1rem; border-top: 1px solid #efefef; }
.reply-input { flex: 1; padding: 8px 12px; border: 1px solid #dbdbdb; border-radius: 20px; font-size: 13px; outline: none; transition: border-color 0.2s; }
.reply-input:focus { border-color: #262626; }
.reply-submit-btn { padding: 6px 14px; border-radius: 20px; background: #262626; color: white; border: none; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; white-space: nowrap; }
.reply-submit-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.reply-submit-btn:not(:disabled):hover { opacity: 0.85; }

/* ===== MiniRoom Tab ===== */
.room-tab { padding: 1rem; }
.room-preview-card { display: flex; flex-direction: column; align-items: center; padding: 2.5rem 1.5rem; background: white; border-radius: 16px; cursor: pointer; transition: all 0.2s ease; border: 1px solid #efefef; }
.room-preview-card:hover { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
.room-preview-card:active { transform: scale(0.98); }
.room-preview-icon { margin-bottom: 1rem; }
.room-preview-title { font-size: 1.125rem; font-weight: 700; color: #262626; margin: 0 0 0.25rem; }
.room-preview-subtitle { font-size: 0.8125rem; color: #8e8e8e; margin: 0 0 1.25rem; }
.room-preview-thumbnails { display: flex; gap: 6px; margin-bottom: 12px; align-items: center; justify-content: center; }
.room-preview-thumb { width: 52px; height: 52px; object-fit: contain; border-radius: 8px; background: #f5f5f7; }
.room-preview-more { width: 52px; height: 52px; border-radius: 8px; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: #86868b; }
.room-enter-btn { display: inline-flex; align-items: center; gap: 6px; padding: 0.625rem 1.5rem; background: #262626; color: white; border: none; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
.room-enter-btn:hover { background: #363636; }

/* ===== Room Asset Section ===== */

/* ===== MiniRoom Fullscreen Overlay ===== */
.miniroom-fullscreen { position: fixed; inset: 0; z-index: 9999; background: #ffffff; display: flex; align-items: center; justify-content: center; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.miniroom-canvas-container { width: 100%; height: 100%; touch-action: none; -webkit-touch-callout: none; }
.miniroom-canvas-container :deep(canvas) { touch-action: none; }
.miniroom-close-btn { position: absolute; top: 16px; right: 16px; width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.5); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; z-index: 100; pointer-events: auto; }
.miniroom-close-btn:hover { background: rgba(0,0,0,0.6); }
.miniroom-loading { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #ffffff; z-index: 5; color: #8B7E74; font-size: 14px; }
.miniroom-loading-spinner { width: 32px; height: 32px; border: 3px solid #D8CFC4; border-top-color: #8B7E74; border-radius: 50%; animation: miniroom-spin 0.8s linear infinite; }
@keyframes miniroom-spin { to { transform: rotate(360deg); } }
.miniroom-owner-label { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.4); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 500; z-index: 100; white-space: nowrap; pointer-events: auto; }
/* Visitor floating dock */
.miniroom-visitor-dock { position: absolute; top: 16px; left: 16px; display: flex; align-items: center; gap: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 16px; padding: 6px 14px; z-index: 100; pointer-events: auto; }
.visitor-dock-item { display: flex; flex-direction: column; align-items: center; gap: 1px; }
.visitor-dock-label { font-size: 9px; font-weight: 600; color: rgba(255,255,255,0.6); letter-spacing: 0.5px; line-height: 1; }
.visitor-dock-value { font-size: 14px; font-weight: 700; color: #fff; line-height: 1.2; font-variant-numeric: tabular-nums; }
.visitor-dock-sep { width: 1px; height: 24px; background: rgba(255,255,255,0.2); margin: 0 10px; }
/* Guestbook/notification FAB */
.miniroom-guestbook-fab { position: absolute; bottom: 20px; right: 20px; width: 48px; height: 48px; border-radius: 50%; background: rgba(0,0,0,0.45); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: none; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 100; pointer-events: auto; transition: background 0.2s, transform 0.15s; }
.miniroom-guestbook-fab:active { transform: scale(0.9); }
.miniroom-notif-badge { position: absolute; top: -4px; right: -4px; min-width: 20px; height: 20px; padding: 0 5px; background: #ed4956; color: #fff; font-size: 11px; font-weight: 700; border-radius: 10px; display: flex; align-items: center; justify-content: center; line-height: 1; box-shadow: 0 2px 8px rgba(237,73,86,0.5); }
.bounce-badge { animation: badge-bounce 2s ease-in-out infinite; }
@keyframes badge-bounce { 0%, 100% { transform: translateY(0) scale(1); } 15% { transform: translateY(-6px) scale(1.15); } 30% { transform: translateY(0) scale(0.95); } 42% { transform: translateY(-3px) scale(1.05); } 55% { transform: translateY(0) scale(1); } }
/* Move mode banner */
.move-mode-banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.95);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  z-index: 20;
  backdrop-filter: blur(8px);
}
.move-mode-banner button {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.move-mode-banner button:active { background: rgba(255, 255, 255, 0.4); }

/* Action sheet */
.action-sheet-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 30;
}
.action-sheet {
  background: #fff;
  border-radius: 16px 16px 0 0;
  width: 100%;
  max-width: 400px;
  padding: 8px 0;
  padding-bottom: env(safe-area-inset-bottom, 16px);
  animation: slideUp 0.2s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.action-sheet-title {
  padding: 16px 20px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #86868b;
  text-align: center;
}
.action-sheet-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: none;
  font-size: 16px;
  color: #1d1d1f;
  cursor: pointer;
  text-align: left;
}
.action-sheet-btn:active { background: #f5f5f7; }
.action-sheet-btn svg { color: #86868b; flex-shrink: 0; }
.action-sheet-danger { color: #ff3b30; }
.action-sheet-danger svg { color: #ff3b30; }
.action-sheet-cancel {
  margin-top: 4px;
  border-top: 1px solid #f0f0f0;
  justify-content: center;
  font-weight: 600;
  color: #86868b;
}

/* 노크 모달 */
.knock-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  padding: 20px;
  touch-action: auto;
}
.knock-modal {
  background: #fff;
  border-radius: 20px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}
.knock-modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: #fff;
}
.knock-modal-name {
  font-size: 18px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
}
.knock-modal-msg {
  font-size: 14px;
  color: #86868b;
  margin-bottom: 24px;
}
.knock-modal-buttons {
  display: flex;
  gap: 10px;
}
.knock-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.15s;
}
.knock-btn:active {
  transform: scale(0.97);
}
.knock-btn-cancel {
  background: #f5f5f7;
  color: #86868b;
}
.knock-btn-confirm {
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
  color: #fff;
}

/* 노크 모달 트랜지션 */
.knock-modal-enter-active { transition: opacity 0.2s ease; }
.knock-modal-enter-active .knock-modal { transition: transform 0.2s ease, opacity 0.2s ease; }
.knock-modal-leave-active { transition: opacity 0.15s ease; }
.knock-modal-leave-active .knock-modal { transition: transform 0.15s ease, opacity 0.15s ease; }
.knock-modal-enter-from { opacity: 0; }
.knock-modal-enter-from .knock-modal { transform: scale(0.9); opacity: 0; }
.knock-modal-leave-to { opacity: 0; }
.knock-modal-leave-to .knock-modal { transform: scale(0.9); opacity: 0; }

/* ===== Follow list modal ===== */
.follow-list-modal { background: #fff; border-radius: 20px; width: 90%; max-width: 400px; max-height: 70vh; display: flex; flex-direction: column; overflow: hidden; }
.follow-list-header { display: flex; align-items: center; border-bottom: 1px solid #f0f0f0; padding: 0; }
.follow-list-tab { flex: 1; padding: 14px 0; font-size: 14px; font-weight: 600; color: #86868b; background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; transition: all 0.2s; }
.follow-list-tab.active { color: #1d1d1f; border-bottom-color: #1d1d1f; }
.follow-list-close { width: 44px; padding: 14px 0; font-size: 16px; background: none; border: none; color: #86868b; cursor: pointer; }
.follow-list-body { flex: 1; overflow-y: auto; padding: 8px 0; }
.follow-list-items { padding: 0; }
.follow-list-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; }
.follow-list-item:active { background: #f5f5f7; }
.follow-list-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; background: #f0f0f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.follow-list-avatar img { width: 100%; height: 100%; object-fit: cover; }
.follow-list-name { font-size: 14px; font-weight: 500; color: #1d1d1f; }
.counter-item.clickable { cursor: pointer; }
.counter-item.clickable:active { opacity: 0.6; }
</style>
