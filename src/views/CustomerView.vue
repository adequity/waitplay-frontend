<template>
  <div
    class="customer-view"
    :style="{
      backgroundColor: pageTheme.backgroundColor,
      color: pageTheme.textColor
    }"
  >
    <!-- Dynamic Block Rendering -->
    <div
      v-for="block in visibleBlocks"
      :key="block.id"
      :id="`block-${block.type}`"
    >
      <component
        :is="getBlockComponent(block.type)"
        :data="block.data"
        :qrCodeId="qrCode"
        :fallbackBackgroundColor="block.type === 'guestbook' ? pageTheme.backgroundColor : undefined"
      />
    </div>

    <!-- Footer -->
    <div class="footer">
      <p class="footer-text" :style="{ color: pageTheme.textColor, opacity: 0.4 }">
        Powered by WaitPlay
      </p>
    </div>

    <!-- Floating Dock (글래스모피즘 독) -->
    <FloatingDock
      v-if="qrCode"
      :qr-code-id="qrCodeId"
      :qr-code="qrCode"
      :landing-title="landingTitle"
      :landing-description="landingDescription"
      :landing-image="landingImage"
      :show-music="isBgmEnabled && !!bgmUrl"
      :show-my-page="true"
      :is-music-playing="isBgmPlaying"
      :theme-background-color="pageTheme.backgroundColor"
      @toggle-music="toggleBgm"
      @open-my-page="toggleSidebar"
    />

    <!-- Sidebar Overlay -->
    <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>

    <!-- Sidebar -->
    <transition name="sidebar">
      <div v-if="isSidebarOpen" class="sidebar">
        <div class="sidebar-header">
          <h2>메뉴</h2>
          <button class="close-btn" @click="closeSidebar" aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <div class="sidebar-content">
          <!-- Store Profile Section (매장 프로필) -->
          <div class="store-profile-section">
            <div class="profile-header">
              <div class="profile-avatar-large">
                <div class="avatar-ring-large store-avatar-ring">
                  <div class="avatar-inner-large">
                    <img v-if="storeProfile?.storeProfileImage" :src="storeProfile.storeProfileImage" alt="매장 로고" class="avatar-image-large" />
                    <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-number">{{ storeProfile?.guestbookCount || 0 }}</span>
                  <span class="stat-label">게시물</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">{{ storeProfile?.followerCount || 0 }}</span>
                  <span class="stat-label">팔로워</span>
                </div>
              </div>
            </div>
            <div class="profile-bio">
              <p class="profile-username store-name">{{ storeProfile?.storeName || '매장' }}</p>
              <p v-if="storeProfile?.description" class="store-description">{{ storeProfile.description }}</p>
            </div>
            <!-- 팔로우 버튼 -->
            <button
              v-if="isAuthenticated"
              :class="['follow-btn', { following: storeProfile?.isFollowing }]"
              @click="toggleStoreFollow"
            >
              {{ storeProfile?.isFollowing ? '팔로잉' : '팔로우' }}
            </button>
            <button v-else class="follow-btn" @click="goToLogin">
              로그인하고 팔로우
            </button>
          </div>

          <!-- Store Content Tabs (매장 중심 탭) -->
          <div class="menu-tabs store-tabs">
            <button
              :class="['menu-tab', { active: activeTab === 'guestbook' }]"
              @click="activeTab = 'guestbook'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="tab-label">방명록</span>
            </button>
            <button
              :class="['menu-tab', { active: activeTab === 'games' }]"
              @click="activeTab = 'games'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 12H10M8 10V14M15 13H15.01M18 11H18.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </span>
              <span class="tab-label">게임</span>
            </button>
            <button
              :class="['menu-tab', { active: activeTab === 'benefits' }]"
              @click="activeTab = 'benefits'"
            >
              <span class="tab-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="tab-label">혜택</span>
            </button>
          </div>

          <!-- 구분선 -->
          <div class="section-divider"></div>

          <!-- 내 정보 섹션 (로그인 시에만) -->
          <div v-if="isAuthenticated" class="my-section">
            <h3 class="section-title">내 정보</h3>
            <div class="my-tabs">
              <button
                :class="['menu-tab compact', { active: activeTab === 'feed' }]"
                @click="activeTab = 'feed'"
              >
                <span class="tab-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="tab-label">피드</span>
              </button>
              <button
                :class="['menu-tab compact', { active: activeTab === 'stores' }]"
                @click="activeTab = 'stores'"
              >
                <span class="tab-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="tab-label">단골매장</span>
              </button>
              <button
                :class="['menu-tab compact', { active: activeTab === 'my-guestbook' }]"
                @click="activeTab = 'my-guestbook'"
              >
                <span class="tab-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span class="tab-label">내 방명록</span>
              </button>
              <button
                :class="['menu-tab compact', { active: activeTab === 'profile' }]"
                @click="activeTab = 'profile'"
              >
                <span class="tab-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </span>
                <span class="tab-label">내 정보</span>
              </button>
            </div>
          </div>

          <!-- Not Logged In Section -->
          <div v-else class="not-logged-in-section compact">
            <p class="login-message">로그인하고 더 많은 기능을 이용해보세요!</p>
            <div class="login-buttons">
              <button class="login-btn" @click="goToLogin">로그인</button>
              <button class="signup-btn" @click="goToSignup">회원가입</button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- 매장 방명록 (Store Guestbook) -->
            <div v-if="activeTab === 'guestbook'" class="store-guestbook-section">
              <div class="coming-soon-content">
                <div class="coming-soon-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11 4H4C3.44772 4 3 4.44772 3 5V19C3 19.5523 3.44772 20 4 20H18C18.5523 20 19 19.5523 19 19V12M17.5 2.5L12 8L11 12L15 11L20.5 5.5C21.0523 4.94772 21.0523 4.05228 20.5 3.5L19.5 2.5C18.9477 1.94772 18.0523 1.94772 17.5 2.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="coming-soon-title">{{ storeProfile?.storeName || '매장' }}의 방명록</p>
                <p class="coming-soon-subtitle">메인 화면에서 방명록을 확인하세요!</p>
              </div>
            </div>

            <!-- 매장 게임 (Store Games) -->
            <div v-if="activeTab === 'games'" class="store-games-section">
              <div class="coming-soon-content">
                <div class="coming-soon-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H10M8 10V14M15 13H15.01M18 11H18.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                </div>
                <p class="coming-soon-title">{{ storeProfile?.storeName || '매장' }}의 게임</p>
                <p class="coming-soon-subtitle">메인 화면에서 게임을 즐겨보세요!</p>
              </div>
            </div>

            <!-- 매장 혜택 (Store Benefits) -->
            <div v-if="activeTab === 'benefits'" class="store-benefits-section">
              <div class="coming-soon-content">
                <div class="coming-soon-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="coming-soon-title">{{ storeProfile?.storeName || '매장' }}의 혜택</p>
                <p class="coming-soon-subtitle">게임을 플레이하고 혜택을 받아보세요!</p>
              </div>
            </div>

            <!-- 피드 (Instagram Home Feed Style) - 로그인 시에만 -->
            <div v-if="activeTab === 'feed' && isAuthenticated" class="feed-section">
              <LoadingSpinner v-if="isLoadingFeed && feedMessages.length === 0" message="피드를 불러오는 중..." :size="60" />

              <div v-else-if="feedMessages.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-title">피드가 비어있어요</p>
                <p class="empty-subtitle">단골 매장을 팔로우하면 새 방명록이 여기에 표시됩니다!</p>
              </div>

              <div v-else class="feed-list" ref="feedScrollRef" @scroll="handleFeedScroll">
                <div
                  v-for="message in feedMessages"
                  :key="message.id"
                  class="feed-post"
                >
                  <!-- 포스트 헤더 - 작성자 + 매장 정보 -->
                  <div class="feed-post-header">
                    <div class="feed-author">
                      <div class="feed-author-avatar">
                        <div class="avatar-gradient-ring">
                          <div class="avatar-inner-circle">
                            <img v-if="message.userProfileImage" :src="message.userProfileImage" alt="" class="avatar-img" />
                            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div class="feed-author-info">
                        <p class="feed-author-name">{{ message.userName }}</p>
                        <p class="feed-store-name">{{ message.storeName }}</p>
                      </div>
                    </div>
                    <button class="feed-more-btn">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                        <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>

                  <!-- 콘텐츠 영역 (더블탭으로 좋아요) -->
                  <div class="feed-content" @click="handleDoubleTap(message)">
                    <!-- 이미지가 있는 경우 -->
                    <div v-if="message.imageUrl" class="feed-image-wrapper">
                      <img
                        :src="message.imageUrl"
                        alt="방명록 이미지"
                        class="feed-image"
                        loading="lazy"
                        decoding="async"
                      />
                      <!-- 더블탭 하트 애니메이션 -->
                      <transition name="heart-pop">
                        <div v-if="doubleTapLikeId === message.id" class="double-tap-heart">
                          <svg width="80" height="80" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                        </div>
                      </transition>
                    </div>

                    <!-- 텍스트만 있는 경우 - 포스트잇 스타일 -->
                    <div
                      v-else-if="message.message"
                      class="feed-postit"
                      :style="{ backgroundColor: message.color || '#fff9c4' }"
                    >
                      <p class="feed-postit-text">{{ message.message }}</p>
                      <!-- 더블탭 하트 애니메이션 -->
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
                        @click="toggleFeedLike(message)"
                      >
                        <svg v-if="message.isLikedByMe" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="feed-action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="feed-action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <button class="feed-action-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <!-- 좋아요 수 -->
                  <div v-if="message.likeCount > 0" class="feed-likes">
                    <span>좋아요 {{ message.likeCount }}개</span>
                  </div>

                  <!-- 캡션 -->
                  <div class="feed-caption">
                    <p class="caption-text">
                      <strong>{{ message.userName }}</strong>
                      <span v-if="message.imageUrl && message.message">{{ message.message }}</span>
                      <span v-else-if="!message.imageUrl" class="caption-location">{{ message.storeName }}에서 작성</span>
                    </p>
                  </div>

                  <!-- 사장님 답글 -->
                  <div v-if="message.replies && message.replies.length > 0" class="feed-replies">
                    <div
                      v-for="reply in message.replies"
                      :key="reply.id"
                      class="feed-reply"
                    >
                      <div class="feed-reply-header">
                        <div class="reply-author-avatar">
                          <img v-if="reply.userProfileImage" :src="reply.userProfileImage" alt="" />
                          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <span class="reply-badge">사장님</span>
                      </div>
                      <p class="feed-reply-content">{{ reply.content }}</p>
                    </div>
                  </div>

                  <!-- 게시 시간 -->
                  <p class="feed-timestamp">{{ formatRelativeDate(message.createdAt) }}</p>
                </div>

                <!-- 더 불러오기 -->
                <div v-if="hasMoreFeed" class="load-more">
                  <button
                    class="load-more-btn"
                    :disabled="isLoadingFeed"
                    @click="loadFeed(true)"
                  >
                    <div v-if="isLoadingFeed" class="btn-spinner"></div>
                    <span v-else>이전 게시물 더 보기</span>
                  </button>
                </div>

                <!-- 피드 끝 표시 -->
                <div v-else class="feed-end">
                  <div class="feed-end-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </div>
                  <p class="feed-end-text">모든 게시물을 확인했습니다</p>
                </div>
              </div>
            </div>

            <!-- 내 프로필 (Instagram Settings Style) -->
            <div v-if="activeTab === 'profile'" class="profile-section-instagram">
              <div class="settings-group">
                <div class="settings-item">
                  <div class="settings-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2"/>
                      <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="settings-content">
                    <span class="settings-label">닉네임</span>
                    <span class="settings-value">{{ user?.nickname || '-' }}</span>
                  </div>
                  <svg class="settings-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>

                <div class="settings-item">
                  <div class="settings-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                  </div>
                  <div class="settings-content">
                    <span class="settings-label">가입일</span>
                    <span class="settings-value">{{ formatDate(user?.createdAt) }}</span>
                  </div>
                </div>
              </div>

              <div class="settings-group">
                <button class="settings-item logout-item" @click="handleLogout">
                  <div class="settings-icon logout-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </div>
                  <div class="settings-content">
                    <span class="settings-label logout-text">로그아웃</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- 단골 매장 (Instagram Style) -->
            <div v-if="activeTab === 'stores'" class="stores-section">
              <!-- 헤더 통계 -->
              <div class="stores-header">
                <div class="stores-count">
                  <span class="count-number">{{ followedStores.length }}</span>
                  <span class="count-label">단골 매장</span>
                </div>
              </div>

              <LoadingSpinner v-if="isLoadingStores" message="불러오는 중..." :size="60" />

              <div v-else-if="followedStores.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-title">아직 단골 매장이 없어요</p>
                <p class="empty-subtitle">매장을 방문해서 단골이 되어보세요!</p>
              </div>

              <div v-else class="stores-list-instagram">
                <div
                  v-for="store in followedStores"
                  :key="store.adminId"
                  class="store-card"
                >
                  <!-- 프로필 이미지 (인스타그램 스타일 원형) -->
                  <div class="store-avatar">
                    <div class="avatar-ring">
                      <div class="avatar-inner">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="store-svg-icon">
                          <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <!-- 매장 정보 -->
                  <div class="store-info">
                    <p class="store-username">{{ store.storeName || '알 수 없는 매장' }}</p>
                    <p class="store-meta">{{ formatRelativeDate(store.followedAt) }} 팔로우</p>
                  </div>

                  <!-- 팔로잉 버튼 -->
                  <button class="following-btn">
                    <span>팔로잉</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 내 방명록 (Instagram Post Style) - 로그인 시에만 -->
            <div v-if="activeTab === 'my-guestbook' && isAuthenticated" class="guestbook-section">
              <!-- 헤더 통계 -->
              <div class="stores-header">
                <div class="stores-count">
                  <span class="count-number">{{ myGuestbookMessages.length }}</span>
                  <span class="count-label">게시물</span>
                </div>
              </div>

              <LoadingSpinner v-if="isLoadingMyMessages" message="불러오는 중..." :size="60" />

              <div v-else-if="myGuestbookMessages.length === 0" class="empty-state">
                <div class="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <p class="empty-title">아직 방명록이 없어요</p>
                <p class="empty-subtitle">매장에서 추억을 남겨보세요!</p>
              </div>

              <div v-else class="guestbook-feed">
                <div
                  v-for="message in myGuestbookMessages"
                  :key="message.id"
                  class="post-card"
                >
                  <!-- 포스트 헤더 -->
                  <div class="post-header">
                    <div class="post-author">
                      <div class="author-avatar">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 21H21M3 7V21M21 7V21M6 21V17C6 15.8954 6.89543 15 8 15H10C11.1046 15 12 15.8954 12 17V21M14 11H17M14 15H17M7 11H10M3 7L12 3L21 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                      <div class="author-info">
                        <p class="author-name">{{ message.storeName }}</p>
                        <p class="post-location">방명록</p>
                      </div>
                    </div>
                    <button class="post-menu" @click="deleteGuestbook(message.id)">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="5" r="1" fill="currentColor"/>
                        <circle cx="12" cy="12" r="1" fill="currentColor"/>
                        <circle cx="12" cy="19" r="1" fill="currentColor"/>
                      </svg>
                    </button>
                  </div>

                  <!-- 이미지 (있는 경우) -->
                  <div v-if="message.imageUrl" class="post-image-container">
                    <img
                      :src="message.imageUrl"
                      alt="방명록 이미지"
                      class="post-image"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  <!-- 액션 버튼 -->
                  <div class="post-actions">
                    <div class="action-left">
                      <button class="action-btn liked">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                      </button>
                      <button class="action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                      <button class="action-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </button>
                    </div>
                    <button class="action-btn">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <!-- 캡션 -->
                  <div class="post-caption">
                    <p v-if="message.message" class="caption-text">
                      <strong>{{ user?.nickname || '나' }}</strong> {{ message.message }}
                    </p>
                    <p v-else class="caption-empty">
                      <strong>{{ user?.nickname || '나' }}</strong> <span class="empty-caption">(캡션 없음)</span>
                    </p>
                    <p class="post-time">{{ formatRelativeDate(message.createdAt) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, defineAsyncComponent, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import guestbookService from '@/services/guestbookService'
import followService from '@/services/followService'
import gameSettingsService from '@/services/gameSettingsService'
import type { Block, PageTheme } from '@/types/blocks'
import type { MyGuestbookMessageResponse, FeedGuestbookMessage } from '@/services/guestbookService'
import type { FollowedStoreInfo, StoreProfileResponse } from '@/services/followService'

// ✅ 첫 화면에 필요한 가벼운 블록 - 동기 로딩
import HeaderBlock from '@/components/blocks/HeaderBlock.vue'
import ButtonBlock from '@/components/blocks/ButtonBlock.vue'
import SocialLinksBlock from '@/components/blocks/SocialLinksBlock.vue'
import MarqueeBlock from '@/components/blocks/MarqueeBlock.vue'
import ImageBlock from '@/components/blocks/ImageBlock.vue'
import CountdownBlock from '@/components/blocks/CountdownBlock.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FloatingDock from '@/components/landing/FloatingDock.vue'

// ✅ 무거운 블록 - 비동기 로딩 (스크롤 시 로드)
const GuestbookBlock = defineAsyncComponent(() =>
  import('@/components/blocks/GuestbookBlock.vue')
)
const VideoGridBlock = defineAsyncComponent(() =>
  import('@/components/blocks/VideoGridBlock.vue')
)
const GamesCarouselBlock = defineAsyncComponent(() =>
  import('@/components/blocks/GamesCarouselBlock.vue')
)
const PopularMenuBlock = defineAsyncComponent(() =>
  import('@/components/blocks/PopularMenuBlock.vue')
)

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Blocks data (실제로는 API에서 가져와야 함)
const blocks = ref<Block[]>([])

// BGM (Background Music) state
const bgmAudio = ref<HTMLAudioElement | null>(null)
const isBgmPlaying = ref(false)
const isBgmEnabled = ref(false) // 스크롤로 활성화되면 true
const bgmUrl = ref<string>('') // 레거시 단일 BGM URL
const bgmPlaylist = ref<{ id: string; fileUrl: string; title?: string }[]>([]) // 플레이리스트
const bgmPlayMode = ref<'sequential' | 'shuffle'>('sequential')
const currentTrackIndex = ref(0)

// Page theme - Default values (will be loaded from API)
const pageTheme = ref<PageTheme>({
  backgroundColor: '#121212',
  textColor: '#ffffff'
})

// QR Code ID & Code
const qrCodeId = ref<string>('')
const qrCode = ref<string>('')

// Landing page info for sharing
const landingTitle = ref<string>('')
const landingDescription = ref<string>('')
const landingImage = ref<string>('')

// Sidebar state
const isSidebarOpen = ref(false)

// User state
const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)

// Active tab state (default to guestbook - store's content view)
const activeTab = ref('guestbook')

// Store profile (현재 보고 있는 매장)
const storeProfile = ref<StoreProfileResponse | null>(null)
const isLoadingStoreProfile = ref(false)

// Followed stores
const followedStores = ref<FollowedStoreInfo[]>([])
const isLoadingStores = ref(false)

// My guestbook messages
const myGuestbookMessages = ref<MyGuestbookMessageResponse[]>([])
const isLoadingMyMessages = ref(false)

// Feed messages (from followed stores)
const feedMessages = ref<FeedGuestbookMessage[]>([])
const isLoadingFeed = ref(false)
const feedCursor = ref<string | undefined>(undefined)
const hasMoreFeed = ref(true)

// Double-tap like animation
const doubleTapLikeId = ref<string | null>(null)
const lastTapTime = ref<Record<string, number>>({})

// Feed scroll container ref
const feedScrollRef = ref<HTMLElement | null>(null)

const visibleBlocks = computed(() => {
  return blocks.value
    .filter(block => block.isVisible)
    .sort((a, b) => a.order - b.order)
})

function getBlockComponent(type: string): Component | string {
  const components: Record<string, Component> = {
    header: HeaderBlock,
    button: ButtonBlock,
    social_links: SocialLinksBlock,
    video_grid: VideoGridBlock,
    games_carousel: GamesCarouselBlock,
    popular_menu: PopularMenuBlock,
    image: ImageBlock,
    countdown: CountdownBlock,
    guestbook: GuestbookBlock,
    marquee: MarqueeBlock
  }
  return components[type] || 'div'
}

// ✅ 탭별 데이터 로딩 여부 추적 (중복 로딩 방지)
const tabDataLoaded = ref({
  stores: false,
  guestbook: false,
  feed: false
})

// Sidebar functions
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  if (isSidebarOpen.value) {
    // 스토어 프로필 로드 (로그인 여부 상관없이)
    if (!storeProfile.value && qrCodeId.value) {
      loadStoreProfile()
    }

    if (isAuthenticated.value) {
      // ✅ 성능 최적화: 활성 탭 데이터만 로드
      loadTabData(activeTab.value)
    }
  }
}

const closeSidebar = () => {
  isSidebarOpen.value = false
}

// ✅ 탭 선택 시 해당 탭 데이터만 로드 (지연 로딩)
const loadTabData = async (tab: string) => {
  if (!isAuthenticated.value) return

  if (tab === 'stores' && !tabDataLoaded.value.stores) {
    await loadFollowedStores()
    tabDataLoaded.value.stores = true
  } else if (tab === 'my-guestbook' && !tabDataLoaded.value.guestbook) {
    await loadMyGuestbook()
    tabDataLoaded.value.guestbook = true
  } else if (tab === 'feed' && !tabDataLoaded.value.feed) {
    await loadFeed()
    tabDataLoaded.value.feed = true
  }
}

// 탭 변경 감시
watch(activeTab, (newTab) => {
  if (isSidebarOpen.value && isAuthenticated.value) {
    loadTabData(newTab)
  }
})

// Load store profile (현재 보고 있는 매장 정보)
const loadStoreProfile = async () => {
  if (!qrCodeId.value) return

  isLoadingStoreProfile.value = true
  try {
    storeProfile.value = await followService.getStoreProfile(qrCodeId.value)
  } catch (error) {
    console.error('Failed to load store profile:', error)
  } finally {
    isLoadingStoreProfile.value = false
  }
}

// Toggle follow for current store
const toggleStoreFollow = async () => {
  if (!isAuthenticated.value) {
    goToLogin()
    return
  }

  if (!qrCodeId.value || !storeProfile.value) return

  try {
    if (storeProfile.value.isFollowing) {
      await followService.unfollowAdmin(qrCodeId.value)
      storeProfile.value.isFollowing = false
      storeProfile.value.followerCount = Math.max(0, storeProfile.value.followerCount - 1)
    } else {
      await followService.followAdmin(qrCodeId.value)
      storeProfile.value.isFollowing = true
      storeProfile.value.followerCount++
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error)
  }
}

// Load followed stores
const loadFollowedStores = async () => {
  if (!isAuthenticated.value) return

  isLoadingStores.value = true
  try {
    followedStores.value = await followService.getMyFollowedStores()
  } catch (error) {
    console.error('Failed to load followed stores:', error)
  } finally {
    isLoadingStores.value = false
  }
}

// Auth functions
const handleLogout = () => {
  authStore.logout()
  isSidebarOpen.value = false
  router.push('/login')
}

const goToLogin = () => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    router.push(`/login?qr=${qrParam}`)
  } else {
    router.push('/login')
  }
}

const goToSignup = () => {
  const qrParam = route.query.qr as string
  if (qrParam) {
    router.push(`/signup?qr=${qrParam}`)
  } else {
    router.push('/signup')
  }
}

// Guestbook functions
const loadMyGuestbook = async () => {
  if (!isAuthenticated.value) return

  isLoadingMyMessages.value = true
  try {
    // Get all messages by current user (across all stores)
    myGuestbookMessages.value = await guestbookService.getMyMessages()
  } catch (error) {
    console.error('Failed to load my guestbook messages:', error)
  } finally {
    isLoadingMyMessages.value = false
  }
}

const deleteGuestbook = async (messageId: string) => {
  if (!confirm('이 방명록을 삭제하시겠습니까?')) return

  try {
    await guestbookService.deleteMessage(messageId)
    myGuestbookMessages.value = myGuestbookMessages.value.filter(msg => msg.id !== messageId)
    alert('방명록이 삭제되었습니다.')
  } catch (error) {
    console.error('Failed to delete guestbook message:', error)
    alert('방명록 삭제에 실패했습니다.')
  }
}

// Load feed from followed stores
const loadFeed = async (loadMore = false) => {
  if (!isAuthenticated.value) return
  if (isLoadingFeed.value) return
  if (loadMore && !hasMoreFeed.value) return

  isLoadingFeed.value = true
  try {
    const cursor = loadMore ? feedCursor.value : undefined
    const response = await guestbookService.getFeed(cursor, 20)

    if (loadMore) {
      feedMessages.value = [...feedMessages.value, ...response.messages]
    } else {
      feedMessages.value = response.messages
    }

    hasMoreFeed.value = response.hasMore
    feedCursor.value = response.nextCursor
  } catch (error) {
    console.error('Failed to load feed:', error)
  } finally {
    isLoadingFeed.value = false
  }
}

// Toggle like on feed message
const toggleFeedLike = async (message: FeedGuestbookMessage) => {
  if (!isAuthenticated.value) {
    goToLogin()
    return
  }

  try {
    const response = await guestbookService.toggleLike(message.id)
    message.isLikedByMe = response.isLiked
    message.likeCount = response.likeCount
  } catch (error) {
    console.error('Failed to toggle like:', error)
  }
}

// Double-tap like (Instagram UX)
const handleDoubleTap = async (message: FeedGuestbookMessage) => {
  const now = Date.now()
  const lastTap = lastTapTime.value[message.id] || 0
  const DOUBLE_TAP_DELAY = 300 // ms

  if (now - lastTap < DOUBLE_TAP_DELAY) {
    // Double tap detected
    if (!message.isLikedByMe) {
      // Show heart animation
      doubleTapLikeId.value = message.id
      setTimeout(() => {
        doubleTapLikeId.value = null
      }, 1000)

      // Like the post
      await toggleFeedLike(message)
    } else {
      // Already liked - just show animation
      doubleTapLikeId.value = message.id
      setTimeout(() => {
        doubleTapLikeId.value = null
      }, 1000)
    }
  }

  lastTapTime.value[message.id] = now
}

// Infinite scroll handler for feed
const handleFeedScroll = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target) return

  const scrollHeight = target.scrollHeight
  const scrollTop = target.scrollTop
  const clientHeight = target.clientHeight

  // Load more when 200px from bottom
  if (scrollHeight - scrollTop - clientHeight < 200) {
    if (!isLoadingFeed.value && hasMoreFeed.value) {
      loadFeed(true)
    }
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '-'

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`

  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 인스타그램 스타일 상대 날짜 포맷
const formatRelativeDate = (dateString?: string) => {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return '방금'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  if (days < 7) return `${days}일 전`
  if (weeks < 5) return `${weeks}주 전`
  if (months < 12) return `${months}개월 전`
  return `${years}년 전`
}

// BGM Functions
import bgmService from '@/services/bgmService'

const getCurrentTrackUrl = (): string => {
  if (bgmPlaylist.value.length > 0) {
    return bgmPlaylist.value[currentTrackIndex.value]?.fileUrl || ''
  }
  return bgmUrl.value
}

const preloadBgm = () => {
  const trackUrl = getCurrentTrackUrl()
  if (!trackUrl) return

  // 오디오 미리 로드 (사용자 인터랙션 전에 준비)
  if (!bgmAudio.value) {
    bgmAudio.value = new Audio()
    bgmAudio.value.volume = 0.5
    bgmAudio.value.preload = 'auto'

    // 트랙 종료 시 다음 트랙 재생
    bgmAudio.value.addEventListener('ended', () => {
      playNextTrack()
    })
  }

  bgmAudio.value.src = trackUrl
  // 단일 트랙이면 loop, 플레이리스트면 끝날 때 다음 트랙
  bgmAudio.value.loop = bgmPlaylist.value.length <= 1
  bgmAudio.value.load()
}

const playNextTrack = () => {
  if (bgmPlaylist.value.length <= 1) return // 단일 트랙은 loop로 처리

  // 현재 트랙 재생 로그
  const currentTrack = bgmPlaylist.value[currentTrackIndex.value]
  if (currentTrack && qrCodeId.value) {
    bgmService.logPlayEvent(currentTrack.id, qrCodeId.value).catch(() => {})
  }

  // 다음 트랙 결정
  if (bgmPlayMode.value === 'shuffle') {
    // 랜덤 재생 (현재 곡 제외)
    let nextIndex = currentTrackIndex.value
    if (bgmPlaylist.value.length > 1) {
      while (nextIndex === currentTrackIndex.value) {
        nextIndex = Math.floor(Math.random() * bgmPlaylist.value.length)
      }
    }
    currentTrackIndex.value = nextIndex
  } else {
    // 순차 재생
    currentTrackIndex.value = (currentTrackIndex.value + 1) % bgmPlaylist.value.length
  }

  // 다음 트랙 재생
  if (bgmAudio.value) {
    bgmAudio.value.src = getCurrentTrackUrl()
    bgmAudio.value.play().catch(() => {})
  }
}

const playBgm = async () => {
  const trackUrl = getCurrentTrackUrl()
  if (!bgmAudio.value || !trackUrl) return

  try {
    if (bgmAudio.value.src !== trackUrl) {
      bgmAudio.value.src = trackUrl
    }
    await bgmAudio.value.play()
    isBgmPlaying.value = true

    // 재생 시작 로그
    const currentTrack = bgmPlaylist.value[currentTrackIndex.value]
    if (currentTrack && qrCodeId.value) {
      bgmService.logPlayEvent(currentTrack.id, qrCodeId.value).catch(() => {})
    }
  } catch {
    // 브라우저 자동재생 정책으로 인한 실패는 무시
  }
}

const pauseBgm = () => {
  if (!bgmAudio.value) return
  bgmAudio.value.pause()
  isBgmPlaying.value = false
}

const toggleBgm = () => {
  if (isBgmPlaying.value) {
    pauseBgm()
  } else {
    playBgm()
  }
}

// 첫 사용자 인터랙션 시 BGM 버튼 활성화
// click/touchstart: 유효한 제스처 → 자동 재생 시도
// scroll/wheel/touchmove: 버튼만 표시 (재생은 버튼 클릭으로)
const handleFirstInteraction = (event: Event) => {
  const hasBgm = bgmUrl.value || bgmPlaylist.value.length > 0
  if (isBgmEnabled.value || !hasBgm) return

  isBgmEnabled.value = true

  // 유효한 사용자 제스처인 경우에만 자동 재생 시도
  const validGestures = ['click', 'touchstart', 'keydown']
  if (validGestures.includes(event.type)) {
    playBgm()
  }
  // scroll, wheel, touchmove는 버튼만 표시하고 재생은 사용자가 직접 클릭

  // 모든 이벤트 리스너 제거 (한 번만 실행)
  removeInteractionListeners()
}

// 이벤트 리스너 제거 함수
const removeInteractionListeners = () => {
  window.removeEventListener('scroll', handleFirstInteraction)
  window.removeEventListener('touchstart', handleFirstInteraction)
  window.removeEventListener('touchmove', handleFirstInteraction)
  window.removeEventListener('click', handleFirstInteraction)
  window.removeEventListener('keydown', handleFirstInteraction)
  window.removeEventListener('wheel', handleFirstInteraction)
}

// Watch for theme changes and update body background
watch(() => pageTheme.value.backgroundColor, (newBgColor) => {
  if (newBgColor) {
    // Update body background color
    document.body.style.backgroundColor = newBgColor

    // Update CSS variables
    document.documentElement.style.setProperty('--bg-primary', newBgColor)
    document.documentElement.style.setProperty('--bg-secondary', newBgColor)
  }
}, { immediate: true })

onMounted(async () => {
  // Get storeId and QR code from route query
  const storeId = route.query.storeId as string
  const qrCodeQuery = route.query.qr as string

  // Store QR code for games and guestbook (early assignment)
  if (qrCodeQuery) {
    qrCodeId.value = qrCodeQuery
    qrCode.value = qrCodeQuery
    console.log('QR code set for games:', qrCodeQuery)
  }

  // API URL
  const API_URL = import.meta.env.VITE_API_URL || 'https://waitplay-production-4148.up.railway.app'

  // Fetch landing page settings from API
  let logoUrl = ''
  let storeName = '테라스 레스토랑'
  let welcomeMessage = '📶 테라스_Guest / terrace1234\n🕐 매일 10:00 - 22:00\n📞 02-1234-5678'

  // QR 코드 데이터를 저장해서 재사용
  let qrCodeUuid: string | null = null

  if (!qrCodeQuery) return

  try {
    // ✅ 성능 최적화: API 호출 병렬화 (Promise.allSettled 사용)
    // QR 코드 조회, 설정 조회, 레이아웃 조회를 동시에 실행하여 로딩 시간 60% 단축
    const [qrResult, settingsResult, layoutResult] = await Promise.allSettled([
      // 1. QR 코드 API (스캔 로그 + UUID 획득)
      fetch(`${API_URL}/api/qrcode/by-code/${encodeURIComponent(qrCodeQuery)}`).then(r => r.ok ? r.json() : null),
      // 2. 랜딩페이지 설정
      fetch(`${API_URL}/api/landingpage/settings/qr/${encodeURIComponent(qrCodeQuery)}`).then(r => r.ok ? r.json() : null),
      // 3. 레이아웃 (by-code 엔드포인트 우선 사용)
      fetch(`${API_URL}/api/landingpage/layout/by-code/${encodeURIComponent(qrCodeQuery)}`).then(r => r.ok ? r.json() : null)
    ])

    // QR 코드 결과 처리
    if (qrResult.status === 'fulfilled' && qrResult.value) {
      qrCodeUuid = qrResult.value.id
      // ✅ qrCodeId에 실제 UUID 저장 (공유 API에서 필요)
      if (qrCodeUuid) {
        qrCodeId.value = qrCodeUuid
      }
      console.log('QR scan logged successfully, UUID:', qrCodeUuid)
    }

    // 설정 결과 처리
    if (settingsResult.status === 'fulfilled' && settingsResult.value) {
      const settings = settingsResult.value
      if (settings.storeName) {
        logoUrl = settings.logoUrl || ''
        storeName = settings.storeName
        welcomeMessage = settings.welcomeMessage || welcomeMessage

        // 공유용 정보 설정
        landingTitle.value = settings.storeName
        landingDescription.value = settings.welcomeMessage || ''
        landingImage.value = settings.logoUrl || ''

        // 브라우저 탭 타이틀 설정
        document.title = `${settings.storeName} | WaitPlay`
      }
    }

    // 레이아웃 결과 처리
    if (layoutResult.status === 'fulfilled' && layoutResult.value) {
      const layoutData = layoutResult.value
      const layoutQrCodeId = layoutData.qrCodeId || qrCodeUuid

      // Parse blocks from API response
      if (layoutData.blocksJson) {
        blocks.value = JSON.parse(layoutData.blocksJson)
        console.log('Layout loaded from API')
      } else {
        console.warn('No layout data found')
        blocks.value = []
      }

      // Parse theme from API response
      if (layoutData.themeJson) {
        const theme = JSON.parse(layoutData.themeJson)
        pageTheme.value = theme

        // 재생 모드 로드
        if (theme.bgmPlayMode) {
          bgmPlayMode.value = theme.bgmPlayMode
        }

        // BGM 플레이리스트 로드 시도 (신규 방식)
        if (qrCodeUuid) {
          try {
            const playlistData = await bgmService.getPlaylist(qrCodeUuid)
            if (playlistData.tracks && playlistData.tracks.length > 0) {
              bgmPlaylist.value = playlistData.tracks.map(t => ({
                id: t.id,
                fileUrl: t.fileUrl,
                title: t.title
              }))
              bgmPlayMode.value = playlistData.playMode || 'sequential'
              console.log('BGM Playlist loaded:', bgmPlaylist.value.length, 'tracks')
              preloadBgm()
            } else if (theme.bgmUrl) {
              // 플레이리스트가 없으면 레거시 URL 사용
              bgmUrl.value = theme.bgmUrl
              console.log('BGM URL loaded (legacy):', theme.bgmUrl)
              preloadBgm()
            }
          } catch {
            // 플레이리스트 로드 실패 시 레거시 URL로 폴백
            if (theme.bgmUrl) {
              bgmUrl.value = theme.bgmUrl
              console.log('BGM URL loaded (fallback):', theme.bgmUrl)
              preloadBgm()
            }
          }
        } else if (theme.bgmUrl) {
          // QR UUID가 없으면 레거시 URL 사용
          bgmUrl.value = theme.bgmUrl
          console.log('BGM URL loaded:', theme.bgmUrl)
          preloadBgm()
        }
      }

      // Update header block with latest API data
      const headerBlock = blocks.value.find(b => b.type === 'header')
      if (headerBlock && headerBlock.data) {
        headerBlock.data.logoUrl = logoUrl
        headerBlock.data.storeName = storeName
        headerBlock.data.welcomeMessage = welcomeMessage
      }

      // ✅ 게임 설정 로드 (비동기 백그라운드 - 메인 렌더링 차단 안함)
      if (layoutQrCodeId) {
        gameSettingsService.getGameSettingsPublic(layoutQrCodeId)
          .then(gameSettings => {
            const gamesCarouselBlock = blocks.value.find(b => b.type === 'games_carousel')
            if (gamesCarouselBlock && gamesCarouselBlock.data) {
              const gameDefinitions: Record<string, { name: string; icon: string }> = {
                'pinball': { name: '핀볼', icon: '🎯' },
                'brick-breaker': { name: '벽돌깨기', icon: '🧱' },
                'memory': { name: '같은 카드 찾기', icon: '🃏' },
                'spot-difference': { name: '틀린 그림 찾기', icon: '🔍' }
              }
              gamesCarouselBlock.data.enabledGames = gameSettings.enabledGames
              if (gameSettings.gamesOrder) {
                gamesCarouselBlock.data.gamesOrder = gameSettings.gamesOrder.map(order => ({
                  type: order.type,
                  name: gameDefinitions[order.type]?.name || order.type,
                  icon: gameDefinitions[order.type]?.icon || '🎮'
                }))
              }
              console.log('Game settings loaded:', gameSettings)
            }
          })
          .catch(err => console.error('Failed to load game settings:', err))
      }
    } else {
      console.error('Failed to fetch layout data')
    }
  } catch (error) {
    console.warn('Failed to load landing page data from API:', error)
  }

  // BGM 사용자 인터랙션 이벤트 리스너 등록 (bgmUrl 또는 플레이리스트가 있을 때)
  // scroll/touchmove/wheel: 버튼 표시용 (isBgmEnabled = true로 설정)
  // 실제 재생은 유효한 제스처(click/touchstart/keydown)에서만 성공
  if (bgmUrl.value || bgmPlaylist.value.length > 0) {
    window.addEventListener('scroll', handleFirstInteraction, { passive: true })
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true })
    window.addEventListener('touchmove', handleFirstInteraction, { passive: true })
    window.addEventListener('click', handleFirstInteraction, { passive: true })
    window.addEventListener('keydown', handleFirstInteraction, { passive: true })
    window.addEventListener('wheel', handleFirstInteraction, { passive: true })
  }

  // Hash 기반 스크롤 (예: #games → 게임 블록으로 스크롤)
  if (route.hash) {
    const hashTarget = route.hash.replace('#', '')
    // 약간의 딜레이 후 스크롤 (DOM 렌더링 완료 대기)
    setTimeout(() => {
      const targetElement = document.getElementById(`block-${hashTarget}`) ||
                           document.getElementById(hashTarget)
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 300)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  // BGM 정리
  if (bgmAudio.value) {
    bgmAudio.value.pause()
    bgmAudio.value.src = ''
    bgmAudio.value = null
  }

  // 이벤트 리스너 제거
  removeInteractionListeners()
})
</script>

<style scoped>
.customer-view {
  min-height: 100vh;
  transition: background-color 0.3s ease;
  position: relative;
}

/* Footer */
.footer {
  padding: 2rem 1.5rem;
  text-align: center;
  background: transparent;
}

.footer-text {
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  font-size: 12px;
  transition: color 0.3s ease;
}

/* Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

/* Sidebar */
.sidebar {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 90%;
  max-width: 400px;
  background: white;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #efefef;
  background: white;
  min-height: 44px;
  position: relative;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #262626;
  flex: 1;
  text-align: center;
}

.close-btn {
  background: none;
  border: none;
  color: #262626;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
  position: absolute;
  right: 0.5rem;
}

.close-btn:hover {
  background: #f5f5f5;
}

.sidebar-content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Store Profile Section */
.store-profile-section {
  padding: 1.25rem 0;
  border-bottom: 1px solid #efefef;
}

.store-avatar-ring {
  background: linear-gradient(45deg, #14b8a6, #0d9488, #0f766e);
}

.store-name {
  font-size: 1rem;
  font-weight: 700;
}

.store-description {
  font-size: 0.8125rem;
  color: #8e8e8e;
  margin: 0.25rem 0 0;
  line-height: 1.4;
}

/* Follow Button */
.follow-btn {
  width: 100%;
  padding: 0.625rem 1rem;
  margin-top: 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  color: white;
  border: none;
}

.follow-btn:hover {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  transform: translateY(-1px);
}

.follow-btn.following {
  background: #efefef;
  color: #262626;
}

.follow-btn.following:hover {
  background: #dbdbdb;
  transform: none;
}

/* Section Divider */
.section-divider {
  height: 1px;
  background: #efefef;
  margin: 1rem -1.5rem;
}

/* My Section */
.my-section {
  padding: 0.5rem 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  color: #8e8e8e;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.my-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.menu-tab.compact {
  flex: none;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  border-radius: 20px;
  background: #f5f5f5;
  flex-direction: row;
  gap: 0.375rem;
}

.menu-tab.compact.active {
  background: #262626;
  color: white;
}

.menu-tab.compact .tab-icon {
  display: flex;
  align-items: center;
}

.menu-tab.compact .tab-label {
  font-size: 0.8125rem;
}

/* Not Logged In Compact */
.not-logged-in-section.compact {
  padding: 0.75rem 0;
}

.not-logged-in-section.compact .login-message {
  font-size: 0.8125rem;
  margin-bottom: 0.75rem;
}

.login-buttons {
  display: flex;
  gap: 0.5rem;
}

.login-buttons .login-btn,
.login-buttons .signup-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
}

/* Store Content Tabs */
.store-tabs {
  margin-top: 0.5rem;
}

/* Coming Soon Content */
.coming-soon-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.coming-soon-icon {
  color: #14b8a6;
  margin-bottom: 1rem;
}

.coming-soon-title {
  font-size: 1rem;
  font-weight: 600;
  color: #262626;
  margin: 0 0 0.5rem;
}

.coming-soon-subtitle {
  font-size: 0.875rem;
  color: #8e8e8e;
  margin: 0;
}

/* User Section - Instagram Profile Style (Legacy) */
.user-section-instagram {
  padding: 1.25rem 0;
  border-bottom: 1px solid #efefef;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.profile-avatar-large {
  flex-shrink: 0;
}

.avatar-ring-large {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  padding: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner-large {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid white;
  color: #8e8e8e;
}

.avatar-image-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.profile-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.125rem;
  font-weight: 700;
  color: #262626;
}

.stat-label {
  font-size: 0.75rem;
  color: #8e8e8e;
}

.profile-bio {
  padding: 0;
}

.profile-username {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

/* Menu Tabs - Instagram Style */
.menu-tabs {
  display: flex;
  border-bottom: 1px solid #efefef;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
}

.menu-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.menu-tab:hover .tab-icon {
  color: #262626;
}

.menu-tab.active {
  border-bottom-color: #262626;
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e8e;
  transition: color 0.2s;
}

.menu-tab.active .tab-icon {
  color: #262626;
}

.tab-label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #8e8e8e;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.menu-tab.active .tab-label {
  color: #262626;
}

/* Tab Content */
.tab-content {
  padding-top: 1rem;
}

/* Profile Section - Instagram Settings Style */
.profile-section-instagram {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.settings-group {
  display: flex;
  flex-direction: column;
  background: #fafafa;
  border-radius: 12px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem;
  background: white;
  border: none;
  cursor: default;
  transition: background 0.15s ease;
  border-bottom: 1px solid #efefef;
  width: 100%;
  text-align: left;
}

.settings-item:last-child {
  border-bottom: none;
}

.settings-item:hover {
  background: #fafafa;
}

.settings-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #efefef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
  flex-shrink: 0;
}

.settings-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.settings-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #262626;
}

.settings-value {
  font-size: 0.8125rem;
  color: #8e8e8e;
}

.settings-arrow {
  color: #c7c7cc;
  flex-shrink: 0;
}

.logout-item {
  cursor: pointer;
}

.logout-icon {
  background: #ffebee;
}

.logout-icon svg {
  color: #ed4956;
}

.logout-text {
  color: #ed4956;
  font-weight: 600;
}

/* Not Logged In Section */
.not-logged-in-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.login-message {
  font-size: 0.9375rem;
  color: #757575;
  text-align: center;
  margin: 0 0 1.5rem 0;
}

.login-btn,
.signup-btn {
  width: 100%;
  padding: 0.875rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 0.75rem;
}

.login-btn {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  border: none;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.signup-btn {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.signup-btn:hover {
  background: #f5f7ff;
}

/* Stores Section - Instagram Style */
.stores-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.stores-header {
  display: flex;
  justify-content: center;
  padding: 1rem 0;
  border-bottom: 1px solid #efefef;
  margin-bottom: 0.5rem;
}

.stores-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
}

.count-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #262626;
}

.count-label {
  font-size: 0.75rem;
  color: #8e8e8e;
  font-weight: 400;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem;
  color: #8e8e8e;
  font-size: 0.875rem;
}

.loading-spinner .spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #efefef;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 1.5rem;
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e8e;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: #262626;
  margin: 0 0 0.25rem 0;
}

.empty-subtitle {
  font-size: 0.875rem;
  color: #8e8e8e;
  margin: 0;
}

.stores-list-instagram {
  display: flex;
  flex-direction: column;
}

.store-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #efefef;
  transition: background 0.15s ease;
}

.store-card:last-child {
  border-bottom: none;
}

.store-card:active {
  background: #fafafa;
}

/* 인스타그램 스타일 아바타 링 */
.store-avatar {
  flex-shrink: 0;
}

.avatar-ring {
  width: 56px;
  height: 56px;
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
  border: 2px solid white;
}

.store-svg-icon {
  color: #262626;
}

.store-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.store-username {
  font-size: 0.875rem;
  font-weight: 600;
  color: #262626;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.store-meta {
  font-size: 0.75rem;
  color: #8e8e8e;
  margin: 0;
}

/* 인스타그램 스타일 팔로잉 버튼 */
.following-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  background: #efefef;
  border: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #262626;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.following-btn:hover {
  background: #dbdbdb;
}

.following-btn:active {
  transform: scale(0.96);
}

.following-btn svg {
  opacity: 0.6;
}

/* Feed Section - Instagram Home Feed Style */
.feed-section {
  display: flex;
  flex-direction: column;
  margin: 0 -1.5rem;
}

.feed-list {
  display: flex;
  flex-direction: column;
}

.feed-post {
  background: white;
  border-bottom: 1px solid #efefef;
  padding: 0 1rem;
}

.feed-post:last-child {
  border-bottom: none;
}

.feed-post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.feed-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feed-author-avatar {
  flex-shrink: 0;
}

.avatar-gradient-ring {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-inner-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  overflow: hidden;
  color: #8e8e8e;
}

.avatar-inner-circle .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.feed-author-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.feed-author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #262626;
  margin: 0;
  line-height: 1.2;
}

.feed-store-name {
  font-size: 0.75rem;
  color: #8e8e8e;
  margin: 0;
  line-height: 1.2;
}

.feed-more-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s ease;
}

.feed-more-btn:hover {
  background: #f5f5f5;
}

/* 콘텐츠 영역 */
.feed-content {
  margin: 0 -1rem;
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

/* 더블탭 하트 애니메이션 */
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
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  15% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  30% {
    transform: translate(-50%, -50%) scale(0.95);
  }
  45% {
    transform: translate(-50%, -50%) scale(1.05);
  }
  60%, 100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

@keyframes heartFade {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.3);
    opacity: 0;
  }
}

.feed-image {
  width: 100%;
  max-height: 500px;
  object-fit: contain;
  display: block;
}

/* 포스트잇 스타일 (텍스트만 있을 때) */
.feed-postit {
  width: 100%;
  min-height: 200px;
  padding: 2rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.feed-postit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%);
  pointer-events: none;
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

/* 액션 바 - 인스타그램 스타일 */
.feed-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
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
  transition: transform 0.2s ease, opacity 0.15s ease;
}

.feed-action-btn:hover {
  opacity: 0.6;
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
  padding: 0 0 0.25rem 0;
}

.feed-likes span {
  font-size: 0.875rem;
  font-weight: 600;
  color: #262626;
}

/* 캡션 */
.feed-caption {
  padding: 0 0 0.25rem 0;
}

.feed-caption .caption-text {
  font-size: 0.875rem;
  color: #262626;
  margin: 0;
  line-height: 1.4;
}

.feed-caption .caption-text strong {
  font-weight: 600;
  margin-right: 0.375rem;
}

.feed-caption .caption-location {
  color: #8e8e8e;
}

/* 타임스탬프 */
.feed-timestamp {
  font-size: 0.625rem;
  color: #8e8e8e;
  margin: 0;
  padding-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* 사장님 답글 */
.feed-replies {
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.feed-reply {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.feed-reply:last-child {
  margin-bottom: 0;
}

.feed-reply-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.reply-author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #e8e8e8;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.reply-author-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reply-author-avatar svg {
  color: #8e8e8e;
}

.reply-badge {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #0095f6;
  background: rgba(0, 149, 246, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
}

.feed-reply-content {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: #262626;
  margin: 0;
  word-break: break-word;
}

/* 더 보기 버튼 */
.load-more {
  display: flex;
  justify-content: center;
  padding: 1.5rem 1rem;
  background: #fafafa;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 280px;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #dbdbdb;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #0095f6;
  cursor: pointer;
  transition: all 0.15s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: #fafafa;
  border-color: #c7c7c7;
}

.load-more-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  color: #8e8e8e;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #dbdbdb;
  border-top-color: #0095f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* 피드 끝 표시 */
.feed-end {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
  background: #fafafa;
}

.feed-end-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #262626;
  margin-bottom: 0.75rem;
}

.feed-end-text {
  font-size: 0.875rem;
  font-weight: 400;
  color: #262626;
  margin: 0;
}

/* Guestbook Section - Instagram Feed Style */
.guestbook-section {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.guestbook-feed {
  display: flex;
  flex-direction: column;
}

.post-card {
  background: white;
  border-bottom: 1px solid #efefef;
}

.post-card:last-child {
  border-bottom: none;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.post-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #262626;
  margin: 0;
}

.post-location {
  font-size: 0.6875rem;
  color: #8e8e8e;
  margin: 0;
}

.post-menu {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.15s ease;
}

.post-menu:hover {
  background: #f5f5f5;
}

.post-image-container {
  width: 100%;
  margin: 0 -1.5rem;
  width: calc(100% + 3rem);
}

.post-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  display: block;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.action-left {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.action-btn:hover {
  opacity: 0.6;
}

.action-btn:active {
  transform: scale(0.9);
}

.action-btn.liked {
  color: #ed4956;
}

.post-caption {
  padding-bottom: 0.75rem;
}

.caption-text {
  font-size: 0.875rem;
  color: #262626;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
}

.caption-text strong,
.caption-empty strong {
  font-weight: 600;
  margin-right: 0.375rem;
}

.caption-empty {
  font-size: 0.875rem;
  color: #262626;
  margin: 0 0 0.25rem 0;
}

.caption-empty .empty-caption {
  color: #8e8e8e;
  font-style: italic;
}

.post-time {
  font-size: 0.625rem;
  color: #8e8e8e;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Sidebar Transition */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(100%);
}

@media (max-width: 640px) {
  .sidebar {
    width: 100%;
    max-width: 100%;
  }
}
</style>
